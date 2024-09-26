'use client'

import { useState, ChangeEvent, FormEvent, useRef, useEffect, useContext } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Controller, Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateQuestionSchema, CreateQuestionSchemaProps } from "../../validation/create-question.validation";
import WYSIWYGLatexEditor from "./question-box";
import EquationEditor from "./equation-editor"; // Importing the Equation Editor
import ReactQuill from "react-quill";
import { AuthContext } from "../../contexts/auth.context";
import { errorToast } from "../../helpers/show-toasts";

type QuestionFormProps = {
 initialData?: (CreateQuestionSchemaProps & { id: number });
 onSubmit: (data: CreateQuestionSchemaProps & { id?: number }) => void;
 onCancel: () => void;
};

export default function QuestionForm({ initialData, onSubmit, onCancel }: QuestionFormProps) {
 const {
  register,
  control,
  setValue,
  watch,
  handleSubmit,
  getValues,
  formState: { isSubmitting, errors },
 } = useForm<CreateQuestionSchemaProps>({
  resolver: zodResolver(CreateQuestionSchema),
  defaultValues: initialData,
 });
 const { user } = useContext(AuthContext);
 const [editorContent, setEditorContent] = useState(initialData?.body || "");
 const quillRef = useRef<ReactQuill | null>(null);
 const options = watch("options") || [];
 const questionType = watch("type");

 useEffect(() => {
  // console.log(initialData)
  quillRef.current?.focus();
 }, [])

 useEffect(() => {
  setValue("body", editorContent);
 }, [editorContent, setValue]);

 const handleQuestionSubmit = (data: CreateQuestionSchemaProps) => {
  onSubmit({ ...data, body: editorContent, id: initialData && initialData.id });
 };

 const handleOptionChange = (index: number, value: string) => {
  const updatedOptions = [...options];
  updatedOptions[index] = value;
  setValue("options", updatedOptions);
 };

 const addOption = () => {
  const updatedOptions = [...options, ""];
  setValue("options", updatedOptions);
 };

 const removeOption = (index: number) => {
  const updatedOptions = options.filter((_, i) => i !== index);
  setValue("options", updatedOptions);
 };

 function onInsert(latex: string) {
  if (quillRef.current) {
   const editor = quillRef.current.getEditor();
   const range = editor.getSelection(true);
   editor.insertEmbed(range.index, 'formula', latex);
   editor.setSelection(range.index + 1);
  }
 }

 return (
  <Form
   control={control}
   action={`${process.env.NEXT_PUBLIC_API_URL}/api/questions/create`}
   headers={{
    "Content-Type": "application/json",
    "Authorization": `Bearer ${user.accessToken}`
   }}
   onSuccess={() => handleQuestionSubmit(getValues())}
   onError={async ({ response }) => { errorToast((await response?.json()).message) }}
   className="space-y-4 max-h-[75vh] overflow-y-auto">
   <Input type="hidden" {...register("testId", { value: location.pathname.split("/")[2] })} />
   <div className="space-y-2">
    <Label htmlFor="questionText">Question Text</Label>
    <div className="flex flex-col items-start gap-12">
     <div className="h-24 w-full wysiwyg">
      <Controller
       name="body"
       control={control}
       render={({ field }) => (
        <WYSIWYGLatexEditor ref={quillRef} value={editorContent} onChange={setEditorContent} />
       )}
      />
      {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}
     </div>
     <div className="flex space-x-2">
      <EquationEditor onInsert={onInsert} />
     </div>
    </div>
   </div>

   <div className="space-y-2">
    <Label htmlFor="questionType">Question Type</Label>
    <Controller
     name="type"
     control={control}
     render={({ field }) => (
      <Select value={field.value} onValueChange={field.onChange}>
       <SelectTrigger>
        <SelectValue placeholder="Select question type" />
       </SelectTrigger>
       <SelectContent>
        <SelectItem value="mcq">Multiple Choice</SelectItem>
        <SelectItem value="trueOrFalse">True/False</SelectItem>
        <SelectItem value="shortAnswer">Short Answer</SelectItem>
        <SelectItem value="essay">Essay</SelectItem>
       </SelectContent>
      </Select>
     )}
    />
    {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
   </div>

   {/* Options for Multiple Choice Questions */}
   {questionType === "mcq" && (
    <div className="space-y-2">
     <Label>Options</Label>
     {options.map((option, index) => (
      <div key={index} className="flex items-center space-x-2">
       <Input
        value={option}
        onChange={(e) => handleOptionChange(index, e.target.value)}
        placeholder={`Option ${index + 1}`}
       />
       <Button type="button" onClick={() => removeOption(index)} className="flex gap-2" variant="destructive">
        Remove
       </Button>
      </div>
     ))}
     <Button type="button" onClick={addOption} className="flex gap-1 p-0 m-0 text-blue-600" variant="link">
      Add Option
     </Button>
     {errors.options && <p className="text-red-500 text-sm">{errors.options.message}</p>}
     {options.length < 2 && questionType === 'mcq' && (
      <p className="text-red-500 text-sm">At least two options are required for Multiple Choice questions.</p>
     )}
    </div>
   )}

   {/* Correct Answer Validation */}
   {(questionType === "mcq" || questionType === "trueOrFalse") && (
    <div className="space-y-2">
     <Label htmlFor="correctAnswer">Correct Answer</Label>
     <Controller
      name="correctAnswer"
      control={control}
      render={({ field }) => (
       <Select value={field.value} onValueChange={field.onChange}>
        <SelectTrigger>
         <SelectValue placeholder="Select correct answer" />
        </SelectTrigger>
        <SelectContent>
         {questionType === "mcq" &&
          options
           .filter((option) => option.trim() !== "")
           .map((option, index) => (
            <SelectItem key={index} value={option}>
             {option}
            </SelectItem>
           ))}
         {questionType === "trueOrFalse" && (
          <>
           <SelectItem value="true">True</SelectItem>
           <SelectItem value="false">False</SelectItem>
          </>
         )}
        </SelectContent>
       </Select>
      )}
     />
     {errors.correctAnswer && <p className="text-red-500 text-sm">{errors.correctAnswer.message}</p>}
    </div>
   )}

   <div className="space-y-2">
    <Label htmlFor="points">Points</Label>
    <Input
     id="points"
     type="number"
     defaultValue={initialData?.points}
     {...register("points")}
    />
    {errors.points && <p className="text-red-500 text-sm">{errors.points.message}</p>}
   </div>

   <div className="flex justify-end space-x-2">
    <Button type="button" variant="outline" onClick={onCancel}>
     Cancel
    </Button>
    <Button
     type="submit"
     disabled={isSubmitting || (questionType === "mcq" && options.length < 2)}
    >

     {!initialData ? "Save Question" : "Edit Question"}
    </Button>
   </div>
  </Form>
 );
}
