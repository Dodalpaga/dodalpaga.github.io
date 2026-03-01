// app/projects/mind_map/content.tsx
'use client';

import { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  MiniMap,
  Background,
  Controls,
  Position,
  type Node,
  type Edge,
  type OnConnect,
} from '@xyflow/react';
import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useThemeContext } from '@/context/ThemeContext';
import '@xyflow/react/dist/style.css';

const proOptions = { hideAttribution: true };

const nodeStyle = (accent: string) => ({
  background: 'var(--card)',
  border: `1px solid var(--card-border)`,
  borderRadius: '10px',
  padding: '8px 16px',
  color: 'var(--foreground)',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '0.85rem',
  fontWeight: 600,
  boxShadow: 'var(--card-shadow)',
  minWidth: 80,
  textAlign: 'center' as const,
});

const initialNodes: Node[] = [
  {
    id: 'root',
    type: 'input',
    position: { x: 0, y: 150 },
    data: { label: '💡 Idea' },
    sourcePosition: Position.Right,
    style: {
      ...nodeStyle('var(--accent)'),
      borderColor: 'var(--accent)',
      backgroundColor: 'var(--accent-muted)',
    },
  },
  {
    id: 'B',
    position: { x: 260, y: 20 },
    data: { label: 'Topic A' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: nodeStyle('var(--bg-color-3)'),
  },
  {
    id: 'C',
    position: { x: 260, y: 140 },
    data: { label: 'Topic B' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: nodeStyle('var(--bg-color-1)'),
  },
  {
    id: 'D',
    position: { x: 260, y: 260 },
    data: { label: 'Topic C' },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: nodeStyle('var(--bg-color-2)'),
  },
  {
    id: 'E',
    position: { x: 520, y: -60 },
    data: { label: 'Sub-A1' },
    targetPosition: Position.Left,
    style: nodeStyle(''),
  },
  {
    id: 'F',
    position: { x: 520, y: 60 },
    data: { label: 'Sub-A2' },
    targetPosition: Position.Left,
    style: nodeStyle(''),
  },
  {
    id: 'G',
    position: { x: 520, y: 260 },
    data: { label: 'Sub-B1' },
    targetPosition: Position.Left,
    style: nodeStyle(''),
  },
];

const initialEdges: Edge[] = [
  {
    id: 'r-b',
    source: 'root',
    target: 'B',
    style: { stroke: 'var(--accent)', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'r-c',
    source: 'root',
    target: 'C',
    style: { stroke: 'var(--accent)', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'r-d',
    source: 'root',
    target: 'D',
    style: { stroke: 'var(--accent)', strokeWidth: 2 },
    animated: true,
  },
  {
    id: 'b-e',
    source: 'B',
    target: 'E',
    style: { stroke: 'var(--foreground-muted)', strokeWidth: 1.5 },
  },
  {
    id: 'b-f',
    source: 'B',
    target: 'F',
    style: { stroke: 'var(--foreground-muted)', strokeWidth: 1.5 },
  },
  {
    id: 'd-g',
    source: 'D',
    target: 'G',
    style: { stroke: 'var(--foreground-muted)', strokeWidth: 1.5 },
  },
];

export default function MindMap() {
  const { theme } = useThemeContext();
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, style: { stroke: 'var(--accent)', strokeWidth: 2 } },
          eds,
        ),
      ),
    [setEdges],
  );

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: { xs: 2, sm: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid var(--card-border)' }}>
        <span className="section-label">Tool · Productivity</span>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            letterSpacing: '-0.03em',
          }}
        >
          Mind Map
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'var(--foreground-muted)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Drag nodes · Connect ideas · Double-click to rename
        </Typography>
      </Box>

      {/* Flow canvas */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid var(--card-border)',
          backgroundColor: 'var(--card)',
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          colorMode={theme}
          fitView
          proOptions={proOptions}
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          <MiniMap
            style={{
              backgroundColor: 'var(--background-elevated)',
              border: '1px solid var(--card-border)',
              borderRadius: '8px',
            }}
            nodeColor="var(--accent-muted)"
          />
          <Background color="var(--grid-color)" gap={28} />
          <Controls
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--card-border)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          />
        </ReactFlow>
      </Box>
    </Container>
  );
}
