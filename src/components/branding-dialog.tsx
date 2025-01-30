"use client"

import { useContext, useEffect, useState, type FormEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Sparkles, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DialogTrigger } from "@radix-ui/react-dialog"
import { errorToast, successToast } from "../helpers/show-toasts"
import { AuthContext } from "../contexts/auth.context"
import { useQueryClient } from "@tanstack/react-query"
import { Branding } from "../types/test"

type FormValues = {
 image: File | null
 textFields: string[]
}

export function BrandingDialog({ children, initialData }: { children?: JSX.Element, initialData?: Branding }) {
 const [isOpen, setIsOpen] = useState(false)
 const { user } = useContext(AuthContext)
 const [imagePreview, setImagePreview] = useState<string | null>(null)
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formValues, setFormValues] = useState<FormValues>({
  image: null,
  textFields: initialData
   ? [initialData.field1, initialData.field2, initialData.field3].filter(
    (value) => value != null
   )
   : [""],
 })
 const [errors, setErrors] = useState<{ [key: string]: string }>({})
 const queryClient = useQueryClient();


 useEffect(() => {
  if (initialData) setImagePreview(initialData.media.url);
 }, [])

 const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
   if (file.size > 2 * 1024 * 1024) {
    setErrors({ ...errors, image: "File size should be 2MB or less" })
    e.target.value = ""
    setImagePreview(null)
    return
   }
   const reader = new FileReader()
   reader.onloadend = () => {
    setImagePreview(reader.result as string)
   }
   reader.readAsDataURL(file)
   setFormValues({ ...formValues, image: file })
   setErrors({ ...errors, image: "" })
  } else {
   if (!initialData) setImagePreview(null)
   setFormValues({ ...formValues, image: null })
  }
 }

 const handleTextFieldChange = (index: number, value: string) => {
  const newTextFields = [...formValues.textFields]
  newTextFields[index] = value
  setFormValues({ ...formValues, textFields: newTextFields })
 }

 const addTextField = () => {
  if (formValues.textFields.length < 3) {
   setFormValues({ ...formValues, textFields: [...formValues.textFields, ""] })
  }
 }

 const removeTextField = (index: number) => {
  const newTextFields = formValues.textFields.filter((_, i) => i !== index)
  setFormValues({ ...formValues, textFields: newTextFields })
 }

 const validateForm = (): boolean => {
  const newErrors: { [key: string]: string } = {}
  if (!formValues.image && !initialData) {
   newErrors.image = "Image is required"
  }
  formValues.textFields.forEach((field, index) => {
   if (!field.trim()) {
    newErrors[`textField${index}`] = "This field is required"
   }
  })
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
 }

 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  if (!validateForm()) return
  setIsSubmitting(true);

  const formData = new FormData()
  if (formValues.image) {
   formData.append("image", formValues.image)
  }
  formValues.textFields.forEach((field, index) => {
   formData.append(`field${index + 1}`, field)
  })

  try {
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/branding/${!initialData ? "create" : "edit"}`, {
    method: initialData ? "PUT" : "POST",
    headers: {
     Authorization: `Bearer ${user?.accessToken}`,
    },
    body: formData,
   })

   const { data, message } = await response.json()

   if (!response.ok) {
    throw new Error(message)
   }

   successToast("Branding updated successfully")
   queryClient.setQueryData(['branding'], (oldData: Branding | undefined) => {
    // if (!oldData) return oldData;
    // console.log(data);
    return { ...oldData, ...data };
   })
   setIsOpen(false)
  } catch (error) {
   errorToast((error as Error).message || "Network error")
  }
  setIsSubmitting(false);
 }

 return (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
   <DialogTrigger asChild>
    {!children ? <Button variant="outline" className="z-10 absolute right-5 bottom-20 lg:relative lg:right-auto lg:bottom-auto">
     <Sparkles className="w-4 h-4 mr-2" />
     My Branding
    </Button> : children}
   </DialogTrigger>
   <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
     <DialogTitle>{initialData ? "Edit" : "Create"} Branding</DialogTitle>
    </DialogHeader>
    {imagePreview && (
     <div className="mt-2 mb-4 h-36">
      <img
       src={imagePreview || "/placeholder.svg"}
       alt="Preview"
       className="w-full h-full rounded-lg object-contain"
      />
     </div>
    )}
    <form onSubmit={handleSubmit} className="space-y-4">
     <div className="space-y-2">
      <Label htmlFor="image">{!initialData ? "Upload" : "Replace"} logo (Max 2MB)</Label>
      <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
      {errors.image && (
       <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{errors.image}</AlertDescription>
       </Alert>
      )}
     </div>
     {formValues.textFields.map((field, index) => (
      <div key={index} className="space-y-2">
       <Label htmlFor={`field${index}`}>
        {index === 0
         ? "Organization / School Name"
         : index === 1
          ? "Faculty / Department Name"
          : "Sub-department / Program Name"}
       </Label>
       <div className="flex items-center space-x-2">
        <Input
         id={`field${index}`}
         value={field}
         onChange={(e) => handleTextFieldChange(index, e.target.value)}
         placeholder={`e.g., ${index === 0
          ? "University of Example"
          : index === 1
           ? "Faculty of Sciences"
           : "Department of Computer Science"
          }`}
        />
        {index > 0 && (
         <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => removeTextField(index)}
          className="flex-shrink-0"
         >
          <Trash2 className="h-4 w-4" />
         </Button>
        )}
       </div>
       {errors[`textField${index}`] && (
        <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
         <AlertDescription>{errors[`textField${index}`]}</AlertDescription>
        </Alert>
       )}
      </div>
     ))}
     {formValues.textFields.length < 3 && (
      <Button type="button" variant="outline" onClick={addTextField} className="w-full">
       Add field
      </Button>
     )}
     <Button type="submit" className="w-full" disabled={isSubmitting}>
      Submit
     </Button>
    </form>
   </DialogContent>
  </Dialog>
 )
}

