import { useRef, useState } from 'react';
import Container from '@mui/material/Container';
import CodeEditor from './components/CodeEditor';
import Output from './components/Output';

function App() {
  const editorRef = useRef();
  return (
    <Container
      maxWidth={false} // Pass boolean false, not a string
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 250px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CodeEditor editorRef={editorRef} />
        <Output editorRef={editorRef} language={'javascript'} />
      </div>
    </Container>
  );
}

export default App;
