'use client'

import React, { useState, useRef, useContext, useEffect, ReactNode } from 'react'
import { Button } from "@/components/ui/button"
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Images, Loader } from 'lucide-react'
import { errorToast, successToast } from '../helpers/show-toasts'
import { AuthContext } from '../contexts/auth.context'
import { TestDetails } from '../types/test'

export default function FileUpload({ questionId, onUpload, buttonText }: { questionId?: string | null, onUpload: (data: { mediaId: string, mediaUrl: string, mediaType: string }) => void, buttonText?: string }) {
 const { user } = useContext(AuthContext);
 const [isUploading, setIsUploading] = useState(false);
 const [isOpen, setIsOpen] = useState(false)
 const [selectedFile, setSelectedFile] = useState<File | null>(null)
 const fileInputRef = useRef<HTMLInputElement>(null)

 const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'audio/mpeg', 'video/mp4']
 const maxFileSize = 2 * 1024 * 1024 // 2 MB in bytes

 useEffect(() => {
  setSelectedFile(null)
 }, [isOpen])

 const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (!file) return
  setSelectedFile(null)

  if (!allowedTypes.includes(file.type)) {
   errorToast("Invalid file type", {
    description: "Please upload a JPEG, JPG, PNG, MP3, or MP4 file.",
   })
   if (fileInputRef.current) {
    fileInputRef.current.value = '';
   }
   return
  }

  if (file.size > maxFileSize) {
   errorToast("File too large", {
    description: "Please upload a file smaller than 4 MB.",
   })
   if (fileInputRef.current) {
    fileInputRef.current.value = '';
   }
   return
  }

  setSelectedFile(file)
 }

 const handleConfirm = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  e.stopPropagation();
  if (!selectedFile) {
   errorToast("No file selected", {
    description: "Please select a file before uploading.",
   })
   return
  }

  try {
   setIsUploading(true)
   const form = e.target as HTMLFormElement;
   const formData = new FormData(form);

   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage/upload/${questionId ? "?questionId=" + questionId : ""}`, {
    method: 'POST',
    body: formData,
    headers: {
     'Authorization': `Bearer ${user?.accessToken}`,
    }
   })

   const { message, data } = await response.json();

   if (!response.ok) throw new Error(message || "Failed to upload file");

   onUpload({ mediaId: data.id, mediaUrl: data.path, mediaType: data.type })
   successToast("File uploaded successfully", {
    description: `${selectedFile.name} has been uploaded.`,
   })
   setIsOpen(false)
   setSelectedFile(null)
   if (fileInputRef.current) {
    fileInputRef.current.value = ''
   }
  } catch (error) {
   console.error('Error reading file:', error)
   errorToast("Upload failed", {
    description: (error as Error).message,
   })
  }
  setIsUploading(false)
 }

 return (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
   <DialogTrigger asChild>
    <Button type="button" className="flex gap-1 text-blue-600 p-0 m-0 outline-none" variant={'link'}>
     <Images />
     {!buttonText ? "Add media" : buttonText}
    </Button>
   </DialogTrigger>
   <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
     <DialogTitle>Upload File</DialogTitle>
    </DialogHeader>
    <form className="grid gap-4 py-4" encType='multipart/form-data' onSubmit={(e) => handleConfirm(e)} >
     <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="file" className="text-right">
       File
      </Label>
      <Input
       id="file"
       name="file"
       type="file"
       className="col-span-3"
       ref={fileInputRef}
       accept=".jpeg,.jpg,.png,.mp3,.mp4"
       onChange={handleFileChange}
      />
     </div>
     {selectedFile && (
      <div className="text-sm text-gray-500">
       Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
      </div>
     )}
     <div className="flex justify-end space-x-2">
      <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={isUploading}>
       Cancel
      </Button>
      <Button type="submit" disabled={!selectedFile || isUploading}>
       {isUploading ? <Loader className='mr-1 h-4 w-4 animate-spin' /> : null}
       {isUploading ? "Uploading..." : "Upload"}
      </Button>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 )
}