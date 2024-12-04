'use client';

import React, {forwardRef, ForwardRefRenderFunction, LegacyRef, RefObject, useEffect} from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import "@/app/globals.css";
import ReactQuill, {ReactQuillProps} from "react-quill";

const ReactQuillComponent = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill');

        const Component = ({ forwardedRef, ...props }: { forwardedRef: RefObject<ReactQuill> } & ReactQuillProps) => (
            <RQ ref={forwardedRef} {...props} />
        );

        Component.displayName = 'ReactQuillComponent';
        return Component;
    },
    {
        ssr: false,
    }
);
ReactQuillComponent.displayName = 'ReactQuillComponent';

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

function Component({value, onChange}: ReactQuillProps, ref: RefObject<ReactQuill>) {
    useEffect(() => {
        if (typeof document !== 'undefined') {
            window.katex = katex;

            document
                .querySelector(".ql-container")
                ?.setAttribute("style", "border-radius: 0px 0px calc(var(--radius) - 2px) calc(var(--radius) - 2px)");
            document
                .querySelector(".ql-toolbar")
                ?.setAttribute("style", "border-radius: calc(var(--radius) - 2px) calc(var(--radius) - 2px) 0px 0px");
        }
    }, []);


    return (
        <ReactQuillComponent
            className='w-full h-full'
            forwardedRef={ref}
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            theme="snow"
        />
    );
}

const WYSIWYGLatexEditor = forwardRef(Component as ForwardRefRenderFunction<ReactQuill, ReactQuillProps>);
export default WYSIWYGLatexEditor;
