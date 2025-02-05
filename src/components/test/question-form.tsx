'use client'

import { RefObject, useContext, useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Controller, Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateQuestionSchema, QuestionSchemaProps } from "@/validation/create-question.validation";
import WYSIWYGLatexEditor from "./question-input";
import EquationEditor from "./equation-editor";
import ReactQuill from "react-quill";
import { AuthContext } from "@/contexts/auth.context";
import { errorToast } from "@/helpers/show-toasts";
import { AlertTriangleIcon, Trash2, X } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import FFileUpload from "../file-upload";
import FileUpload from "../file-upload";

type QuestionFormProps = {
 initialData?: QuestionSchemaProps & { media?: { id: string, url: string, type: string } };
 questions: Array<any>,
 onSubmit: (data: QuestionSchemaProps & { media?: { id: string, url: string, type: string } }) => void;
 onCancel: () => void;
 minLeft: number;
};

export default function QuestionForm({ initialData, onSubmit, onCancel, minLeft }: QuestionFormProps) {

 const [maxValue] = useState<number>(initialData?.timeLimit ? minLeft + initialData.timeLimit : minLeft);

 const {
  register,
  control,
  setValue,
  setError,
  watch,
  getValues,
  trigger,
  formState: { isSubmitting, errors },
 } = useForm<QuestionSchemaProps>({
  resolver: zodResolver(CreateQuestionSchema(maxValue)),
  defaultValues: Object.assign(initialData ? initialData : {}, { points: initialData?.points ?? 10 }),
  shouldUnregister: true
 });
 const { user } = useContext(AuthContext);
 const [editorContent, setEditorContent] = useState(initialData?.body || "");
 const [options, setOptions] = useState(initialData?.options || ["", ""]); // Initialize options with initial data or two empty fields
 const quillRef = useRef<RefObject<ReactQuill>>(null);
 const questionType = watch("type");
 const [timed, setTimed] = useState<CheckedState>(!!initialData?.timeLimit);
 const [mediaData, setMediaData] = useState(initialData?.media || null);


 useEffect(() => {
  console.log(initialData)
 }, [watch()]);

 useEffect(() => {
  if (questionType === "mcq") setValue("options", options)
  quillRef.current?.focus();
 }, [])

 useEffect(() => {
  // Update the form's body field only when editorContent is not fully deleted
  if (editorContent.trim() !== "") {
   setValue("body", editorContent);
  } else {
   setEditorContent("");  // Reset editorContent if fully deleted to prevent re-triggering useEffect
  }
 }, [editorContent, setValue]);

 const handleQuestionSubmit = (data: QuestionSchemaProps) => {
  onSubmit({ ...data, body: editorContent, id: initialData?.id || data.id, index: getValues('index'), media: mediaData ?? undefined });
 }


 function onUpload(data: { mediaId: string, mediaUrl: string, mediaType: string }) {
  console.log("onUpload", data);
  setValue('mediaId', data.mediaId);
  setMediaData({ id: data.mediaId, url: data.mediaUrl, type: data.mediaType })
  // setMediaUrl(data.mediaUrl);
 }


 const handleOptionChange = (index: number, value: string) => {
  const updatedOptions = [...options];
  updatedOptions[index] = value;
  setOptions(updatedOptions);
  setValue("options", updatedOptions);
 };

 const addOption = async () => {
  const updatedOptions = [...options, ""];
  setOptions(updatedOptions);
  setValue("options", updatedOptions);
 };

 const removeOption = (index: number) => {
  const updatedOptions = options.filter((_, i) => i !== index);
  setOptions(updatedOptions);
  setValue("options", updatedOptions);
 };


 function onInsert(latex: string) {
  if (quillRef.current) {
   const editor = quillRef.current?.getEditor();
   const range = editor?.getSelection(true);
   if (range) {
    // If a valid range is returned, insert the formula
    editor.insertEmbed(range.index, 'formula', latex);
    editor.setSelection(range.index + 1); // Move the cursor after the formula
   } else {
    // If range is null, optionally log or handle the lack of selection
    console.warn("No valid selection in the editor");
   }
  }
 }


 async function removeMedia() {

  if (!confirm("Are you sure?")) return;

  if (!initialData?.id) {
   setValue('mediaId', undefined);
   setMediaData(null);
   return;
  }

  try {
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/${initialData?.id}/remove-media/`, {
    method: 'PATCH',
    body: JSON.stringify({
     mediaId: getValues('mediaId'),
     testId: initialData?.testId
    }),
    headers: {
     'Content-Type': "application/json",
     'Authorization': `Bearer ${user?.accessToken}`,
    }
   })
   const { message } = await response.json();
   if (!response.ok) throw new Error(message);
   setValue('mediaId', undefined);
   setMediaData(null);
  } catch (error) {
   errorToast((error as Error).message)
  }
 }

 return (
  <Form
   control={control}
   method={initialData ? 'put' : 'post'}
   action={`${process.env.NEXT_PUBLIC_API_URL}/api/questions/${!initialData ? "create" : "edit/"}${initialData ? initialData.id : ""} `}
   headers={{
    "Content-Type": "application/json",
    "Authorization": `Bearer ${user.accessToken}`
   }}
   onSuccess={async ({ response }) => {
    const { data: { id } } = await response.json();
    handleQuestionSubmit({ ...getValues(), id });
   }}
   onError={async ({ response }) => {
    errorToast((await response?.json()).message);
   }}
   className="space-y-4 max-h-[75vh] overflow-y-auto">

   {/* Question Text Input */}
   <Input type="hidden" {...register("testId", { value: location.pathname.split("/")[2] })} />
   {mediaData ? <Input type="hidden" {...register("mediaId")} /> : null}
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
     <div className="flex space-x-4 items-end">
      <EquationEditor onInsert={onInsert} />
      <FileUpload questionId={initialData?.id || null} onUpload={onUpload} buttonText={mediaData ? "Replace media" : undefined} />
      {mediaData ? <Button type="button" className="flex gap-1 text-red-600 p-0 m-0 outline-none" variant={'link'} onClick={removeMedia}>
       <X />
       Remove media
      </Button> : null}
     </div>
    </div>
   </div>

   {mediaData ? <div className="space-y-2 flex items-center justify-center relative">
    {

     mediaData.type === "image" ? (
      <img src={new URL(mediaData.url).toString()} width={400} height={400} alt="media" />
     ) :
      // Check if mediaUrl is an mp3
      mediaData.type === "audio" ? (
       <audio controls src={new URL(mediaData.url).toString()} className="w-full" />
      ) :
       // Check if mediaUrl is an mp4
       mediaData.type === "video" ? (
        <video controls src={new URL(mediaData.url).toString()} />
       ) : null
    }
   </div> : null}

   {/* Question Type Selection */}
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
       <Button type="button" onClick={() => removeOption(index)} className="flex gap-2"
        variant="ghost">
        <Trash2 />
       </Button>
      </div>
     ))}
     <Button type="button" onClick={addOption} className="flex gap-1 p-0 m-0 text-blue-600"
      variant="link">
      Add Option
     </Button>
     {errors.options && <p className="text-red-500 text-sm">{errors.options.message}</p>}
    </div>
   )}

   {!['mcq', 'trueOrFalse'].includes(questionType) ? <div className="bg-yellow-300 p-2 rounded-sm text-sm flex items-center gap-2"><AlertTriangleIcon size={"15"} /><span><strong>Instant grade reports</strong> is unavailable for tests that include <strong>Short Answer</strong> or <strong>Essay</strong> questions.
   </span>
   </div> : null}


   {/* Correct Answer Selection */}
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

   <div className={'grid lg:grid-cols-2 gap-2 items-center'}>
    {/* Points Input */}
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
    {(timed && (minLeft > 0 || initialData?.timeLimit)) ?
     <div className="space-y-2 w-full">
      <Controller
       name="timeLimit"
       control={control}
       render={({ field }) => (
        <>
         <Label htmlFor="timeLimit">
          Time limit
          {/*<span>({minLeft + (initialData?.timeLimit || 0) - (field.value || 0)} minutes available)</span>*/}
         </Label>
         <div className="flex gap-2 items-center w-full">
          <Input
           type="number"
           value={field.value ?? initialData?.timeLimit ?? 1}
           min={1}
           max={initialData?.timeLimit ? minLeft + initialData.timeLimit : minLeft}
           step={1}
           {...register('timeLimit', { valueAsNumber: true })}
           className="w-full"
          />
          <span
           className=" text-sm block text-nowrap">minute{(field.value ?? initialData?.timeLimit ?? 1) === 1 ? "" : "s"}</span>
         </div>
        </>
       )}
      />

      {errors.timeLimit && <p className="text-red-500 text-sm">{errors.timeLimit.message}</p>}
     </div> : null}
   </div>

   {(minLeft <= 0 && !initialData) ?
    <div
     className="text-sm text-yellow-800 bg-yellow-200 p-3 rounded-lg border-2 border-yellow-500 flex flex-col gap-2 relative h-fit">
     <AlertTriangleIcon
      className="absolute top-1/2 right-3  transform -translate-y-1/2 opacity-10"
      size={100}
     />
     <div>
      <p className={"font-semibold"}>Setting a time limit for this question has been disabled because:</p>
      <ul className="list-disc list-inside">
       <li>You&apos;ve used up all available minutes.</li>
      </ul>
     </div>
     <div>
      <p className={"font-semibold"}>To free up time, you can:</p>
      <ul className="list-disc list-inside">
       <li>Reduce the time allocated to other questions.</li>
      </ul>
     </div>
     <p>If you click <span className={"font-semibold"}>Save Question</span> this question will be saved
      without a time limit.</p>
    </div>
    : null}


   {(minLeft > 0 || initialData?.timeLimit) ? <div className="flex items-center space-x-2">
    <Checkbox id="timedQuestion" onCheckedChange={setTimed} checked={timed}
     disabled={minLeft <= 0 && !initialData} />
    <label
     htmlFor="timedQuestion"
     className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
     Add time limit
    </label>
   </div> : null}

   <div className="flex justify-end space-x-2">
    <Button type="button" variant="outline" onClick={onCancel}>
     Cancel
    </Button>
    <Button
     type="submit"
     disabled={
      isSubmitting ||
      (questionType === "mcq" && (
       options.length < 2 ||
       options.some((option) => option.trim() === "")
      ))
     }
    >
     {!initialData ? "Save Question" : "Edit Question"}
    </Button>
   </div>
  </Form>
 )
  ;
}

function calculateTimeRemaining() {

}