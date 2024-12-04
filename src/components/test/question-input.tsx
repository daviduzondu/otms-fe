'use client';

import React, {forwardRef, LegacyRef, useEffect} from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
import "@/app/globals.css";

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

import katex from 'katex';
import {ReactQuillProps} from "react-quill";

// Quill modules configuration
const modules = {
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['link'],
        ['clean']
    ],
    formula: true,
    clipboard: {
        matchVisual: true,
    },
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image',
    'formula'
];

function Component({value, onChange}: ReactQuillProps, ref: LegacyRef<typeof ReactQuill>) {
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document
                .querySelector(".ql-container")
                ?.setAttribute("style", "border-radius: 0px 0px calc(var(--radius) - 2px) calc(var(--radius) - 2px)");
            document
                .querySelector(".ql-toolbar")
                ?.setAttribute("style", "border-radius: calc(var(--radius) - 2px) calc(var(--radius) - 2px) 0px 0px");
        }
    }, []);

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
    );
}

const WYSIWYGLatexEditor = forwardRef(Component);
export default WYSIWYGLatexEditor;
