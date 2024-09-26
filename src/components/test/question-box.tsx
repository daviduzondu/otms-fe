'use client'

import React, { useState, useRef, useCallback, useEffect, LegacyRef, forwardRef } from 'react'
import 'react-quill/dist/quill.snow.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import ReactQuill, { ReactQuillProps } from 'react-quill';  // Import directly
window.katex = katex;
import "@/app/globals.css"


// Quill modules configuration
const modules = {

 toolbar: [
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }],
  ['link'],
  ['clean']
 ],
 formula: true,
 clipboard: {
  matchVisual: true,
 },
}

const formats = [
 'header',
 'bold', 'italic', 'underline', 'strike',
 'list', 'bullet',
 'link', 'image',
 'formula'
]


function Component({ value, onChange }: ReactQuillProps, ref: LegacyRef<ReactQuill>) {
 return (
  <ReactQuill
   className='w-full h-full'
   ref={ref}
   value={value}
   onChange={onChange}
   modules={modules}
   formats={formats}
   theme="snow"
  />
 )
}

const WYSIWYGLatexEditor = forwardRef(Component);
export default WYSIWYGLatexEditor;