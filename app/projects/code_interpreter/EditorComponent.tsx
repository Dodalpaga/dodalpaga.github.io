'use client';
import React, { useRef, useState } from 'react';
import SelectLanguages, {
  selectedLanguageOptionProps,
} from './SelectLanguages';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';
import { Loader, Play, TriangleAlert } from 'lucide-react';
import { codeSnippets, languageOptions } from './config';
import axios from 'axios';
import toast from 'react-hot-toast';

export interface CodeSnippetsProps {
  [key: string]: string;
}

export default function EditorComponent() {
  const { theme } = useTheme();
  const [sourceCode, setSourceCode] = useState(codeSnippets['python']);
  const [languageOption, setLanguageOption] = useState(languageOptions[0]);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [err, setErr] = useState(false);
  const editorRef = useRef(null);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
    editor.focus();
  }

  function handleOnchange(value: string | undefined) {
    if (value) {
      setSourceCode(value);
    }
  }

  function onSelect(value: selectedLanguageOptionProps) {
    setLanguageOption(value);
    setSourceCode(codeSnippets[value.language]);
  }

  async function executeCode() {
    setLoading(true);
    const requestData = {
      language: languageOption.language,
      version: languageOption.version,
      files: [
        {
          content: sourceCode,
        },
      ],
    };

    try {
      const response = await axios.post(
        'https://emkc.org/api/v2/piston/execute',
        requestData
      );
      setOutput(response.data.run.output.split('\n'));
      setLoading(false);
      setErr(false);
      toast.success('Compiled Successfully');
    } catch (error) {
      setErr(true);
      setLoading(false);
      toast.error('Failed to compile the Code');
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
      }}
    >
      {/* EDITOR HEADER */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ height: '50px' }}
      >
        <div className="flex items-center">
          <div className="w-[230px]">
            <SelectLanguages
              onSelect={onSelect}
              selectedLanguageOption={languageOption}
            />
          </div>
        </div>
      </div>

      {/* EDITOR */}
      <div
        className="bg-slate-400 dark:bg-slate-950 p-3 rounded-2xl"
        style={{ height: 'calc(100% - 50px)', width: '100%' }}
      >
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full rounded-lg border dark:bg-slate-900"
        >
          <ResizablePanel defaultSize={50} minSize={35}>
            <Editor
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
              height="100%"
              defaultLanguage={languageOption.language} // Set the default language
              defaultValue={sourceCode}
              onMount={handleEditorDidMount}
              value={sourceCode}
              onChange={handleOnchange}
              language={languageOption.language} // Dynamically update language here
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={35}>
            {/* Header */}
            <div className="space-y-3 bg-slate-300 dark:bg-slate-900 min-h-screen">
              <div className="flex items-center justify-between bg-slate-400 dark:bg-slate-950 px-6 py-2">
                <h2>Output</h2>
                {loading ? (
                  <Button
                    disabled
                    size={'sm'}
                    className="dark:bg-purple-600 dark:hover:bg-purple-700 text-slate-100 bg-slate-800 hover:bg-slate-900"
                  >
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    <span>Running please wait...</span>
                  </Button>
                ) : (
                  <Button
                    onClick={executeCode}
                    size={'sm'}
                    className="dark:bg-purple-600 dark:hover:bg-purple-700 text-slate-100 bg-slate-800 hover:bg-slate-900"
                  >
                    <Play className="w-4 h-4 mr-2 " />
                    <span>Run</span>
                  </Button>
                )}
              </div>
              <div className="px-6 space-y-2">
                {err ? (
                  <div className="flex items-center space-x-2 text-red-500 border border-red-600 px-6 py-6">
                    <TriangleAlert className="w-5 h-5 mr-2 flex-shrink-0" />
                    <p className="text-xs">
                      Failed to Compile the Code, Please try again!
                    </p>
                  </div>
                ) : (
                  output.map((item, index) => (
                    <p className="text-sm" key={index}>
                      {item}
                    </p>
                  ))
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
