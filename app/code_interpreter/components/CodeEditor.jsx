import { useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { CODE_SNIPPETS } from '../constants';

const CodeEditor = ({ editorRef }) => {
  const [value, setValue] = useState('');
  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <Editor
      options={{
        minimap: {
          enabled: false,
        },
      }}
      height="100%"
      theme="vs-dark"
      language={'javascript'}
      defaultValue={CODE_SNIPPETS['javascript']}
      onMount={onMount}
      value={value}
      onChange={(value) => setValue(value)}
    />
  );
};
export default CodeEditor;
