'use client'

import React, { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { sourceSerif4 } from '../../app/fonts'
import { Question } from '../../types/test'


interface TestPDFPreviewProps {
 testTitle: string
 questions: Question[]
 instructions?: string
}

export function TestPDFPreview({ testTitle, questions, instructions }: TestPDFPreviewProps) {
 const [isOpen, setIsOpen] = useState(false)
 const printableRef = useRef<HTMLDivElement>(null)

 const handlePrint = useReactToPrint({
  contentRef: printableRef,
  documentTitle: testTitle || 'Test PDF',
  onAfterPrint: () => setIsOpen(false),
  pageStyle: '@page { size: A4; }',
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
      {/* Test Header */}
      <div className="pb-4 uppercase text-center">
       <h1 className="text-2xl font-extrabold">{testTitle}</h1>
      </div>

      {/* Instructions */}
      {instructions && (
       <div className="pb-4">
        <h2 className="font-semibold mb-2 underline">Instructions:</h2>
        <p className="leading-relaxed whitespace-pre-wrap">{instructions}</p>
        <hr />
       </div>
      )}

      {/* Questions Section */}
      <div className="space-y-8 text-[16px]">
       {questions.map((question, index) => (
        <div key={question.id} className="break-inside-avoid">
         {/* Question Body */}
         <div className="flex items-start gap-2">
          <span>{index + 1}.</span>
          <div className='flex justify-between w-full flex-wrap'>
           <div className='flex space-x-2 flex-wrap'>
            <span
             className="leading-relaxed"
             dangerouslySetInnerHTML={{ __html: question.body }}
            ></span>
            {question.type === 'trueOrFalse' ? <strong>True or False</strong> : null}
           </div>
           <span className='flex-shrink-0 italic'>({question.points} points)</span>
          </div>
         </div>
         {question.media ? <div className="space-y-2 flex items-center justify-center relative">
          {

           question.media.type === "image" ? (
            <img src={new URL(question.media.url).toString()} width={400} height={400} alt="media" />
           ) :
            // Check if mediaUrl is an mp3
            question.media.type === "audio" ? (
             <audio controls src={new URL(question.media.url).toString()} className="w-full" />
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
    <div className="flex justify-end mt-6">
     <Button onClick={() => handlePrint()}>Print PDF</Button>
    </div>
   </DialogContent>
  </Dialog>
 )
}