'use client'

import React, { useContext, useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CircleMinus, Edit, PlusIcon, FileText, TriangleAlert, Edit2, Loader } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { sourceSerif4 } from '../../app/fonts'
import { Branding, Question } from '../../types/test'
import { AuthContext } from '../../contexts/auth.context'
import { useQuery } from '@tanstack/react-query'
import { BrandingDialog } from '../branding-dialog'


interface TestPDFPreviewProps {
 testTitle: string
 questions: Question[]
 instructions?: string
}

async function fetchBranding(accessToken: string) {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/branding/`, {
  headers: {
   'Authorization': `Bearer ${accessToken}`,
  },
 })

 const { message, data } = await res.json()
 if (!res.ok) {
  throw new Error(message || "Failed to fetch branding")
 }

 return data
}

export function TestPDFPreview({ testTitle, questions, instructions }: TestPDFPreviewProps) {
 const { user } = useContext(AuthContext)
 const [isOpen, setIsOpen] = useState(false)
 const printableRef = useRef<HTMLDivElement>(null)

 const handlePrint = useReactToPrint({
  contentRef: printableRef,
  documentTitle: testTitle || 'Test PDF',
  onAfterPrint: () => setIsOpen(false),
  pageStyle: '@page { size: A4; }',
 })

 const { data: branding, isError, isLoading, error, refetch, isRefetching } = useQuery<Branding>({
  queryKey: ['branding'],
  queryFn: () => fetchBranding(user?.accessToken),
  staleTime: 10000,
  enabled: !!user?.accessToken,
 })

 return (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
   <DialogTrigger asChild>
    <Button variant="outline" size="sm" className="flex gap-2">
     <FileText className="w-4 h-4" />
     <span className="hidden lg:inline">Generate PDF</span>
    </Button>
   </DialogTrigger>
   <DialogContent className="max-w-4xl w-full">
    <DialogHeader>
     <DialogTitle>Test PDF Preview</DialogTitle>
    </DialogHeader>
    <div className={`overflow-y-auto max-h-[80vh] text-left font-serif`}>
     {/* Printable Content */}
     <div ref={printableRef} className={`${sourceSerif4.className} bg-white p-10 shadow-lg print:shadow-none text-gray-900`}>
      {branding ?
       <div>
        <div className="flex w-full flex-col items-center gap-1">
         <img src={branding?.media.url} width={100} height={100} alt="Logo" />
         <div className="uppercase text-lg">{branding?.field1}</div>
         {branding?.field2 ? <div className="uppercase text-base">{branding.field2}</div> : null}
         {branding?.field3 ? <div className="uppercase text-base">{branding?.field3}</div> : null}
        </div>
       </div>
       : null}
      {/* Test Header */}
      <div className="pb-4 uppercase text-center mt-2">
       <h1 className="text-xl font-extrabold">{testTitle}</h1>
      </div>

      {/* Instructions */}
      {instructions && (
       <div className="pb-4 italic">
        <h2 className="font-semibold mb-2 underline">Instructions:</h2>
        <p className="leading-relaxed whitespace-pre-wrap">{instructions}</p>
        <hr />
       </div>
      )}

      {/* Questions Section */}
      <div className="space-y-8 text-[16px]">
       {questions.map((question, index) => (
        <div key={question.id} className="break-inside-avoid h-fit">
         {/* Question Body */}
         <div className="flex items-start gap-2 ">
          <span>{index + 1}.</span>
          <div className='flex justify-between w-full flex-wrap'>
           <div className='flex space-x-2 flex-wrap'>
            <span
             className="leading-relaxed"
             dangerouslySetInnerHTML={{ __html: question.body }}
            ></span>
            {/* {question.type === 'trueOrFalse' ? <strong>True or False</strong> : null} */}
           </div>
           <span className='flex-shrink-0 italic'>({question.points} points)</span>
          </div>
         </div>
         {question.media ? <div className="flex items-center justify-center relative">
          {

           question.media.type === "image" ? (
            <img src={new URL(question.media.url).toString()} width={400} height={400} alt="media" />
           ) :
            // Check if mediaUrl is an mp3
            question.media.type === "audio" ? (
             <div className='w-full relative py-4'>
              <div className='absolute bg-[#000000cc] h-full w-full flex font-sans items-center rounded-md justify-center z-10 backdrop-blur-sm text-white no-print'>Non-image media hidden</div>
              <audio controls src={new URL(question.media.url).toString()} className="w-full " />
             </div>
            ) :
             // Check if mediaUrl is an mp4
             question.media.type === "video" ? (
              <video controls src={new URL(question.media.url).toString()} />
             ) : null
          }
         </div> : null}

         {/* Multiple Choice Options */}
         {question.type === 'mcq' && question.options && (
          <ul className="pl-8 mt-2 space-y-1 list-disc">
           {question.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-start">
             <span className="mr-2">({String.fromCharCode(97 + optionIndex)})</span>
             <div>{option}</div>
            </div>
           ))}
          </ul>
         )}
        </div>
       ))}
      </div>
     </div>
    </div>
    {/* Print Button */}
    <div className="flex justify-between items-center mt-6">
     <div className='flex gap-2'>
      {isError ? <div className='flex items-center justify-center text-sm'>Failed to load branding info <Button size={'sm'} variant={'outline'} className='ml-2' onClick={() => refetch()}>Retry</Button></div> : null}
      {isLoading || isRefetching ? <div className='flex items-center text-sm gap-2'><Loader className="animate-spin" />Loading...</div> : null}

      {branding ? (
       <BrandingDialog initialData={branding}>
        <Button variant="link" size="sm">
         <Edit2 className="w-4 h-4" />
         Edit Branding
        </Button>
       </BrandingDialog>
      ) : (
       <BrandingDialog>
        <Button variant="outline" size="sm">
         <PlusIcon className="w-4 h-4" />
         Add Branding
        </Button>
       </BrandingDialog>
      )}
     </div>
     <div className='flex gap-2'>
      <span className={`text-red-500 text-sm bg-red-200 px-3 py-2 rounded-full flex justify-center items-center gap-1 font-medium ${questions.map(q => q?.media?.type).includes('audio') || questions.map(q => q?.media?.type).includes('video') ? "visible" : "invisible"}`}><TriangleAlert size={15} />Your test contains non-image media (audio or video)</span>
      <Button onClick={() => handlePrint()}>{questions.map(q => q?.media?.type).includes('audio') || questions.map(q => q?.media?.type).includes('video') ? "Print anyway" : "Print"}</Button>
     </div>
    </div>
   </DialogContent>
  </Dialog>
 )
}