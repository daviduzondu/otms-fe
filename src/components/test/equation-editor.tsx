'use client'

import React, { useState, useCallback, useRef, LegacyRef } from 'react'
import { addStyles, EditableMathField, StaticMathField, MathField } from 'react-mathquill'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FunctionSquare } from 'lucide-react'

// Insert required CSS
addStyles()

const symbols = {
 basic: [
  { label: '+', latex: '+' },
  { label: '-', latex: '-' },
  { label: '×', latex: '\\times' },
  { label: '÷', latex: '\\div' },
  { label: '=', latex: '=' },
  { label: '≠', latex: '\\neq' },
  { label: '<', latex: '<' },
  { label: '>', latex: '>' },
  { label: '≤', latex: '\\leq' },
  { label: '≥', latex: '\\geq' },
  { label: '±', latex: '\\pm' },
  { label: '∞', latex: '\\infty' },
  { label: '≈', latex: '\\approx' },
  { label: '∝', latex: '\\propto' },
  { label: '∼', latex: '\\sim' },
  { label: '∠', latex: '\\angle' },
  { label: '°', latex: '\\degree' },
  { label: '⊥', latex: '\\perp' },
  { label: '∥', latex: '\\parallel' },
  { label: '∴', latex: '\\therefore' },
  { label: '∵', latex: '\\because' },
  { label: '∈', latex: '\\in' },
  { label: '∉', latex: '\\notin' },
  { label: '⊂', latex: '\\subset' },
  { label: '⊃', latex: '\\supset' },
  { label: '∪', latex: '\\cup' },
  { label: '∩', latex: '\\cap' },
  { label: '∅', latex: '\\emptyset' },
  { label: '∀', latex: '\\forall' },
  { label: '∃', latex: '\\exists' },
 ],
 greek: [
  { label: 'α', latex: '\\alpha' },
  { label: 'β', latex: '\\beta' },
  { label: 'γ', latex: '\\gamma' },
  { label: 'δ', latex: '\\delta' },
  { label: 'ε', latex: '\\epsilon' },
  { label: 'ζ', latex: '\\zeta' },
  { label: 'η', latex: '\\eta' },
  { label: 'θ', latex: '\\theta' },
  { label: 'ι', latex: '\\iota' },
  { label: 'κ', latex: '\\kappa' },
  { label: 'λ', latex: '\\lambda' },
  { label: 'μ', latex: '\\mu' },
  { label: 'ν', latex: '\\nu' },
  { label: 'ξ', latex: '\\xi' },
  { label: 'π', latex: '\\pi' },
  { label: 'ρ', latex: '\\rho' },
  { label: 'σ', latex: '\\sigma' },
  { label: 'τ', latex: '\\tau' },
  { label: 'υ', latex: '\\upsilon' },
  { label: 'φ', latex: '\\phi' },
  { label: 'χ', latex: '\\chi' },
  { label: 'ψ', latex: '\\psi' },
  { label: 'ω', latex: '\\omega' },
  { label: 'Γ', latex: '\\Gamma' },
  { label: 'Δ', latex: '\\Delta' },
  { label: 'Θ', latex: '\\Theta' },
  { label: 'Λ', latex: '\\Lambda' },
  { label: 'Ξ', latex: '\\Xi' },
  { label: 'Π', latex: '\\Pi' },
  { label: 'Σ', latex: '\\Sigma' },
  { label: 'Φ', latex: '\\Phi' },
  { label: 'Ψ', latex: '\\Psi' },
  { label: 'Ω', latex: '\\Omega' },
 ],
 functions: [
  { label: 'sin', latex: '\\sin' },
  { label: 'cos', latex: '\\cos' },
  { label: 'tan', latex: '\\tan' },
  { label: 'csc', latex: '\\csc' },
  { label: 'sec', latex: '\\sec' },
  { label: 'cot', latex: '\\cot' },
  { label: 'arcsin', latex: '\\arcsin' },
  { label: 'arccos', latex: '\\arccos' },
  { label: 'arctan', latex: '\\arctan' },
  { label: 'sinh', latex: '\\sinh' },
  { label: 'cosh', latex: '\\cosh' },
  { label: 'tanh', latex: '\\tanh' },
  { label: 'log', latex: '\\log' },
  { label: 'ln', latex: '\\ln' },
  { label: 'log₂', latex: '\\log_2' },
  { label: 'log₁₀', latex: '\\log_{10}' },
  { label: 'exp', latex: '\\exp' },
  { label: 'lim', latex: '\\lim' },
  { label: 'min', latex: '\\min' },
  { label: 'max', latex: '\\max' },
  { label: '√', latex: '\\sqrt' },
  { label: '∛', latex: '\\sqrt[3]' },
  { label: 'Σ', latex: '\\sum' },
  { label: 'Π', latex: '\\prod' },
  { label: '∫', latex: '\\int' },
  { label: '∬', latex: '\\iint' },
  { label: '∭', latex: '\\iiint' },
  { label: '∮', latex: '\\oint' },
  { label: '∂', latex: '\\partial' },
  { label: '∇', latex: '\\nabla' },
 ],
}

interface EquationEditorProps {
 onInsert: (latex: string) => void
}

export default function EquationEditor({ onInsert }: EquationEditorProps) {
 const [latex, setLatex] = useState('')
 const [mathFieldRef, setMathFieldRef] = useState<MathField | null>(null)
 const [isOpen, setIsOpen] = useState(false)

 const handleSymbolClick = useCallback((symbolLatex: string) => {
  if (mathFieldRef) {
   mathFieldRef.cmd(symbolLatex)
   mathFieldRef.focus()
  }
 }, [mathFieldRef])

 const renderSymbolButtons = useCallback((symbolSet: { label: string; latex: string }[]) => (
  <div className="grid grid-cols-6 gap-2">
   {symbolSet.map((symbol, index) => (
    <Button
     key={index}
     variant="outline"
     className="w-full h-10 text-lg"
     onClick={() => handleSymbolClick(symbol.latex)}
    >
     {symbol.label}
    </Button>
   ))}
  </div>
 ), [handleSymbolClick])

 const handleInsert = useCallback(() => {
  onInsert(latex)
  setIsOpen(false)
  setLatex('')
 }, [latex, onInsert])

 return (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
   <DialogTrigger asChild>
    <Button type="button" className="flex gap-1 text-blue-600 p-0 m-0 outline-none" variant={'link'}>
     <FunctionSquare />
     Insert Equation
    </Button>
   </DialogTrigger>
   <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto" onKeyDown={() => mathFieldRef?.focus()}>
    <DialogHeader>
     <DialogTitle>Equation Editor</DialogTitle>
    </DialogHeader>
    <div className="mt-4 space-y-4 relative">
     <div className="border p-4 rounded-lg text-2xl relative">
      <span className='absolute text-muted-foreground text-xs right-2 top-2'>Input</span>
      <EditableMathField
       latex={latex}
       onChange={(mathField) => {
        setLatex(mathField.latex())
        setMathFieldRef(mathField)
       }}
      />
     </div>
     <div className="border p-4 rounded-lg text-2xl bg-gray-50 relative">
      <span className='absolute text-muted-foreground text-xs right-2 top-2'>Preview</span>
      <StaticMathField>{latex}</StaticMathField>
     </div>
     <Tabs defaultValue="basic">
      <TabsList className="grid w-full grid-cols-3">
       <TabsTrigger value="basic">Basic</TabsTrigger>
       <TabsTrigger value="greek">Greek</TabsTrigger>
       <TabsTrigger value="functions">Functions</TabsTrigger>
      </TabsList>
      <TabsContent value="basic" className="mt-4">
       {renderSymbolButtons(symbols.basic)}
      </TabsContent>
      <TabsContent value="greek" className="mt-4">
       {renderSymbolButtons(symbols.greek)}
      </TabsContent>
      <TabsContent value="functions" className="mt-4">
       {renderSymbolButtons(symbols.functions)}
      </TabsContent>
     </Tabs>
     <div className="flex justify-end space-x-2 bg-white w-full">
      <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button onClick={handleInsert}>Insert</Button>
     </div>
    </div>
   </DialogContent>
  </Dialog>
 )
}