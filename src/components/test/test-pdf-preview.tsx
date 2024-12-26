'use client'

import React, { useRef, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileText } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'

interface Question {
  id: string
  body: string
  type: string
  options?: string[]
  points: number
}

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
    fonts:[{family:'Source Serif 4', source:'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap'}],
    documentTitle: testTitle || 'Test PDF',
    onAfterPrint: () => setIsOpen(false),
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
        <div className="overflow-y-auto max-h-[80vh] text-left font-serif">
          {/* Printable Content */}
          <div ref={printableRef} className="bg-white p-10 shadow-lg print:shadow-none text-gray-900">
            {/* Test Header */}
            <div className="mb-8 border-b pb-4 uppercase">
              <h1 className="text-2xl font-extrabold">{testTitle}</h1>
              <div className="mt-4 text-md space-y-2">
                <p>Date: _________________________</p>
              </div>
            </div>

            {/* Instructions */}
            {instructions && (
              <div className="mb-8 border-b pb-4">
                <h2 className="font-semibold mb-2 underline">Instructions:</h2>
                <p className="leading-relaxed whitespace-pre-wrap">{instructions}</p>
              </div>
            )}

            {/* Questions Section */}
            <div className="space-y-8 text-[16px]">
              {questions.map((question, index) => (
                <div key={question.id} className="break-inside-avoid">
                  {/* Question Body */}
                  <div className="flex items-start gap-2 mb-2">
                    <span>{index + 1}.</span>
                    <div className='flex justify-between items-center w-full'>
                      <span
                        className="leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: question.body }}
                      ></span>
                      <span className='flex-shrink-0 italic'>({question.points} points)</span>
                    </div>
                  </div>

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

                  {/* Short or Long Answer */}
                  {(question.type === 'shortAnswer' || question.type === 'long_answer') && (
                    <div className="mt-4 border-t border-gray-300 h-16"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Print Button */}
        <div className="flex justify-end mt-6">
          <Button onClick={()=>handlePrint()}>Print PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}