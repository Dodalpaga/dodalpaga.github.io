// content.tsx

import * as React from 'react';
import EditorComponent from './EditorComponent';

export default function Content() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        padding: 4,
      }}
    >
      <EditorComponent />
    </div>
  );
}
