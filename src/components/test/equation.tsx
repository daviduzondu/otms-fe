'use client'
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from 'ckeditor5-classic-with-mathtype';


export default function View(){
 return (
  <CKEditor
      editor={ClassicEditor}
      config={{
          toolbar: {
              items: [
                  'heading', 'MathType', 'ChemType',
                  '|',
                  'bold',
                  'italic',
                  'link',
                  'bulletedList',
                  'numberedList',
                  'imageUpload',
                  'mediaEmbed',
                  'insertTable',
                  'blockQuote',
                  'undo',
                  'redo'
              ]
          },
      }}
      data="<p>Hello from CKEditor 5 with MathType!</p>"
      onInit={editor => {
          // You can store the "editor" and use when it is needed.
          // console.log( 'Editor is ready to use!', editor );
      }}
  />
);
}