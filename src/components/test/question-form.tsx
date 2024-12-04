'use client'

import {useContext, useEffect, useRef, useState} from "react";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Controller, Form, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {QuestionSchema, QuestionSchemaProps} from "@/validation/create-question.validation";
import WYSIWYGLatexEditor from "./question-input";
import EquationEditor from "./equation-editor";
import ReactQuill from "react-quill";
import {AuthContext} from "@/contexts/auth.context";
import {errorToast} from "@/helpers/show-toasts";
import {Trash2} from "lucide-react";
import {RefObject} from "react";

type QuestionFormProps = {
    initialData?: QuestionSchemaProps;
    questions: Array<any>,
    onSubmit: (data: QuestionSchemaProps) => void;
    onCancel: () => void;
};

export default function QuestionForm({initialData, onSubmit, onCancel}: QuestionFormProps) {
    const {
        register,
        control,
        setValue,
        watch,
        getValues,
        trigger,
        formState: {isSubmitting, errors},
    } = useForm<QuestionSchemaProps>({
        resolver: zodResolver(QuestionSchema),
        defaultValues: Object.assign(initialData ? initialData : {}, {points: initialData?.points ?? 10}),
        shouldUnregister: true
    });
    const {user} = useContext(AuthContext);
    const [editorContent, setEditorContent] = useState(initialData?.body || "");
    const [options, setOptions] = useState(initialData?.options || ["", ""]); // Initialize options with initial data or two empty fields
    const quillRef = useRef<RefObject<ReactQuill>>(null);
    const questionType = watch("type");


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
        onSubmit({...data, body: editorContent, id: initialData?.id || data.id, index: getValues('index')});
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

    return (
        <Form
            control={control}
            method={initialData ? 'put' : 'post'}
            action={`${process.env.NEXT_PUBLIC_API_URL}/api/questions/${!initialData ? "create" : "edit/"}${initialData ? initialData.id : ""} `}
            headers={{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.accessToken}`
            }}
            onSuccess={async ({response}) => {
                const {data: {id}} = await response.json();
                handleQuestionSubmit({...getValues(), id});
            }}
            onError={async ({response}) => {
                errorToast((await response?.json()).message);
            }}
            className="space-y-4 max-h-[75vh] overflow-y-auto">

            {/* Question Text Input */}
            <Input type="hidden" {...register("testId", {value: location.pathname.split("/")[2]})} />
            <div className="space-y-2">
                <Label htmlFor="questionText">Question Text</Label>
                <div className="flex flex-col items-start gap-12">
                    <div className="h-24 w-full wysiwyg">
                        <Controller
                            name="body"
                            control={control}
                            render={({field}) => (
                                <WYSIWYGLatexEditor ref={quillRef} value={editorContent} onChange={setEditorContent}/>
                            )}
                        />
                        {errors.body && <p className="text-red-500 text-sm">{errors.body.message}</p>}
                    </div>
                    <div className="flex space-x-2">
                        <EquationEditor onInsert={onInsert}/>
                    </div>
                </div>
            </div>

            {/* Question Type Selection */}
            <div className="space-y-2">
                <Label htmlFor="questionType">Question Type</Label>
                <Controller
                    name="type"
                    control={control}
                    render={({field}) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select question type"/>
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
                                <Trash2/>
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

            {/* Correct Answer Selection */}
            {(questionType === "mcq" || questionType === "trueOrFalse") && (
                <div className="space-y-2">
                    <Label htmlFor="correctAnswer">Correct Answer</Label>
                    <Controller
                        name="correctAnswer"
                        control={control}
                        render={({field}) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select correct answer"/>
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

            {/* Action Buttons */}
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
    );
}
