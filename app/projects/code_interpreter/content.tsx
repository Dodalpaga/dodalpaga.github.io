'use client';

// ─────────────────────────────────────────────────────────────────────────────
// app/projects/code_interpreter/content.tsx
//
// Single-file code interpreter page — design tokens from globals.css,
// visual language matched to the portfolio landing page.
// ─────────────────────────────────────────────────────────────────────────────

import React, {
  Fragment,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import Editor from '@monaco-editor/react';
import * as ResizablePrimitive from 'react-resizable-panels';
import { Slot } from '@radix-ui/react-slot';
import { Listbox, Transition } from '@headlessui/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from 'next-themes';
import axios from 'axios';
import {
  GripVertical,
  Play,
  Loader2,
  TriangleAlert,
  Terminal,
  CheckCircle2,
  ChevronsUpDown,
  Check,
  Copy,
  Trash2,
  Code2,
} from 'lucide-react';

// ─── Utilities ────────────────────────────────────────────────────────────────

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type LanguageOption = {
  language: string;
  displayName: string;
  version: string;
  aliases: string[];
  runtime?: string;
};

// ─── Config ───────────────────────────────────────────────────────────────────

export const languageOptions: LanguageOption[] = [
  {
    language: 'python',
    displayName: 'Python',
    version: '3.10.0',
    aliases: ['py', 'python3'],
  },
  {
    language: 'javascript',
    displayName: 'JavaScript',
    version: '18.15.0',
    aliases: ['js', 'node'],
    runtime: 'node',
  },
  {
    language: 'typescript',
    displayName: 'TypeScript',
    version: '5.0.3',
    aliases: ['ts'],
  },
  {
    language: 'rust',
    displayName: 'Rust',
    version: '1.68.2',
    aliases: ['rs'],
  },
  {
    language: 'go',
    displayName: 'Go',
    version: '1.16.2',
    aliases: [],
  },
  {
    language: 'java',
    displayName: 'Java',
    version: '15.0.2',
    aliases: [],
  },
  {
    language: 'c',
    displayName: 'C',
    version: '10.2.0',
    aliases: ['gcc'],
    runtime: 'gcc',
  },
  {
    language: 'cpp',
    displayName: 'C++',
    version: '10.2.0',
    aliases: ['g++', 'c++'],
    runtime: 'g++',
  },
];

export const codeSnippets: Record<string, string> = {
  python: `# Python — data science starter
import math

def fibonacci(n: int) -> list[int]:
    """Return the first n Fibonacci numbers."""
    seq = [0, 1]
    for _ in range(n - 2):
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

numbers = fibonacci(10)
print("Fibonacci sequence:", numbers)
print("Sum:", sum(numbers))
print("Golden ratio ≈", round(numbers[-1] / numbers[-2], 6))
`,
  javascript: `// JavaScript — async example
async function fetchData(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
}

const nums = Array.from({ length: 10 }, (_, i) => i + 1);
const evens = nums.filter(n => n % 2 === 0);
const squares = evens.map(n => n ** 2);

console.log('Even squares:', squares);
console.log('Total:', squares.reduce((a, b) => a + b, 0));
`,
  typescript: `// TypeScript — generics example
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function divide(a: number, b: number): Result<number> {
  if (b === 0) return { ok: false, error: 'Division by zero' };
  return { ok: true, value: a / b };
}

const cases: [number, number][] = [[10, 2], [7, 0], [9, 3]];

cases.forEach(([a, b]) => {
  const result = divide(a, b);
  if (result.ok) {
    console.log(\`\${a} / \${b} = \${result.value}\`);
  } else {
    console.error(\`Error: \${result.error}\`);
  }
});
`,
  rust: `// Rust — ownership demo
fn largest(list: &[i32]) -> i32 {
    let mut max = list[0];
    for &item in list.iter() {
        if item > max { max = item; }
    }
    max
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("Largest: {}", largest(&numbers));

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("Sorted: {:?}", {
        let mut v = chars.clone();
        v.sort();
        v
    });
}
`,
  go: `// Go — concurrency demo
package main

import (
  "fmt"
  "sync"
)

func worker(id int, wg *sync.WaitGroup) {
  defer wg.Done()
  fmt.Printf("Worker %d starting\\n", id)
  result := 0
  for i := 0; i < 1000; i++ { result += i }
  fmt.Printf("Worker %d done, sum=%d\\n", id, result)
}

func main() {
  var wg sync.WaitGroup
  for i := 1; i <= 3; i++ {
    wg.Add(1)
    go worker(i, &wg)
  }
  wg.Wait()
  fmt.Println("All workers complete.")
}
`,
  java: `// Java — streams example
import java.util.*;
import java.util.stream.*;

public class Main {
  public static void main(String[] args) {
    List<Integer> numbers = IntStream.rangeClosed(1, 20)
        .boxed().collect(Collectors.toList());

    Map<String, List<Integer>> grouped = numbers.stream()
        .collect(Collectors.groupingBy(
            n -> n % 2 == 0 ? "even" : "odd"
        ));

    grouped.forEach((key, vals) -> {
      int sum = vals.stream().mapToInt(Integer::intValue).sum();
      System.out.printf("%s: count=%d, sum=%d%n", key, vals.size(), sum);
    });
  }
}
`,
  c: `// C — pointer arithmetic
#include <stdio.h>
#include <stdlib.h>

int compare(const void *a, const void *b) {
  return (*(int*)a - *(int*)b);
}

int main() {
  int arr[] = {64, 34, 25, 12, 22, 11, 90};
  int n = sizeof(arr) / sizeof(arr[0]);

  qsort(arr, n, sizeof(int), compare);

  printf("Sorted: ");
  for (int i = 0; i < n; i++) printf("%d ", arr[i]);
  printf("\\n");

  int sum = 0;
  for (int i = 0; i < n; i++) sum += arr[i];
  printf("Sum: %d, Mean: %.2f\\n", sum, (float)sum / n);
  return 0;
}
`,
  cpp: `// C++ — STL algorithms
#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
  std::vector<int> v(10);
  std::iota(v.begin(), v.end(), 1);

  std::cout << "Sequence: ";
  for (int n : v) std::cout << n << " ";
  std::cout << "\\n";

  int product = std::accumulate(v.begin(), v.end(), 1, std::multiplies<int>());
  std::cout << "10! = " << product << "\\n";
  return 0;
}
`,
};

// ─── Language colour map ──────────────────────────────────────────────────────

const LANG_COLORS: Record<string, string> = {
  python: '#3b82f6',
  javascript: '#f59e0b',
  typescript: '#6366f1',
  rust: '#f97316',
  go: '#06b6d4',
  java: '#ef4444',
  c: '#8b5cf6',
  cpp: '#ec4899',
};

// ─── Resizable primitives ─────────────────────────────────────────────────────

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
      className
    )}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      'relative flex w-px items-center justify-center transition-colors duration-200',
      'after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2',
      '[background:var(--divider)] hover:[background:var(--accent-muted)]',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div
        style={{
          background: 'var(--background-elevated)',
          border: '1px solid var(--card-border)',
          borderRadius: 4,
        }}
        className="z-10 flex h-6 w-3.5 items-center justify-center shadow-sm"
      >
        <GripVertical
          style={{ color: 'var(--foreground-muted)' }}
          className="h-3 w-3"
        />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

// ─── Language selector ────────────────────────────────────────────────────────

function SelectLanguage({
  value,
  onChange,
}: {
  value: LanguageOption;
  onChange: (opt: LanguageOption) => void;
}) {
  const color = LANG_COLORS[value.language] ?? 'var(--accent)';

  return (
    <Listbox value={value} onChange={onChange}>
      {({ open }) => (
        <div className="relative w-[220px]">
          <Listbox.Button
            style={{
              background: 'var(--background)',
              border: `1px solid ${open ? 'var(--accent)' : 'var(--card-border)'}`,
              color: 'var(--foreground)',
              borderRadius: 10,
              transition: 'border-color .2s, box-shadow .2s',
              boxShadow: open ? '0 0 0 3px var(--accent-muted)' : 'none',
            }}
            className="relative w-full cursor-pointer py-[7px] pl-3 pr-9 text-left text-sm focus:outline-none"
          >
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
              />
              <span
                style={{
                  fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
                  fontSize: '0.82rem',
                  color: 'var(--foreground)',
                }}
              >
                {value.displayName}
              </span>
              <span
                style={{
                  color: 'var(--foreground-muted)',
                  fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
                  fontSize: '0.7rem',
                }}
              >
                v{value.version}
              </span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
              <ChevronsUpDown
                style={{ color: 'var(--foreground-muted)' }}
                className="h-4 w-4"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <Listbox.Options
              style={{
                background: 'var(--background-elevated)',
                border: '1px solid var(--card-border)',
                borderRadius: 12,
                boxShadow: 'var(--card-shadow-hover)',
                zIndex: 50,
              }}
              className="absolute mt-1.5 max-h-64 w-full overflow-auto py-1.5 text-sm focus:outline-none"
            >
              {languageOptions.map((opt) => {
                const c = LANG_COLORS[opt.language] ?? 'var(--accent)';
                return (
                  <Listbox.Option
                    key={opt.language}
                    value={opt}
                    className={({ active }) =>
                      cn(
                        'relative flex cursor-pointer select-none items-center gap-2.5 px-3 py-2 transition-colors',
                        active
                          ? 'bg-[color:var(--accent-muted)]'
                          : 'hover:bg-[color:var(--background)]'
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className="h-2 w-2 flex-shrink-0 rounded-full"
                          style={{
                            background: c,
                            boxShadow: selected ? `0 0 5px ${c}80` : 'none',
                          }}
                        />
                        <span
                          style={{
                            fontFamily:
                              "var(--font-dm-mono,'DM Mono',monospace)",
                            fontSize: '0.82rem',
                            color: 'var(--foreground)',
                            fontWeight: selected ? 600 : 400,
                          }}
                        >
                          {opt.displayName}
                        </span>
                        <span
                          style={{
                            color: 'var(--foreground-muted)',
                            fontFamily:
                              "var(--font-dm-mono,'DM Mono',monospace)",
                            fontSize: '0.7rem',
                            marginLeft: 2,
                          }}
                        >
                          v{opt.version}
                        </span>
                        {selected && (
                          <Check
                            className="ml-auto h-3.5 w-3.5 flex-shrink-0"
                            style={{ color: 'var(--accent)' }}
                          />
                        )}
                      </>
                    )}
                  </Listbox.Option>
                );
              })}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

type StatusType = 'idle' | 'running' | 'success' | 'error';

const STATUS_META: Record<
  StatusType,
  { label: string; color: string; bg: string }
> = {
  idle: { label: 'IDLE', color: 'var(--foreground-muted)', bg: 'transparent' },
  running: { label: 'RUNNING', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  success: { label: 'SUCCESS', color: '#68d391', bg: 'rgba(104,211,145,0.12)' },
  error: { label: 'ERROR', color: '#fc8181', bg: 'rgba(252,129,129,0.12)' },
};

function StatusBadge({ status }: { status: StatusType }) {
  const { label, color, bg } = STATUS_META[status];
  return (
    <span
      style={{
        fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
        fontSize: '0.64rem',
        letterSpacing: '0.1em',
        color,
        background: bg,
        border: `1px solid ${color}40`,
        borderRadius: 6,
        padding: '2px 8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        transition: 'all .3s ease',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          animation:
            status === 'running' ? 'pulse-dot 1s ease-in-out infinite' : 'none',
        }}
      />
      {label}
    </span>
  );
}

// ─── Toolbar icon button ──────────────────────────────────────────────────────

function IconBtn({
  onClick,
  title,
  children,
  accent = false,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      style={{
        background: accent && hovered ? 'var(--accent)' : 'none',
        border: '1px solid var(--card-border)',
        borderRadius: 8,
        padding: '5px 10px',
        cursor: 'pointer',
        color:
          accent && hovered
            ? '#fff'
            : hovered
              ? 'var(--foreground)'
              : 'var(--foreground-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
        fontSize: '0.72rem',
        transition: 'all .2s',
        borderColor: hovered
          ? accent
            ? 'var(--accent)'
            : 'var(--foreground-muted)'
          : 'var(--card-border)',
        boxShadow:
          accent && hovered ? '0 2px 12px rgba(100,140,255,0.3)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

// ─── Run button ───────────────────────────────────────────────────────────────

function RunButton({
  onClick,
  loading,
}: {
  onClick: () => void;
  loading: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={loading ? undefined : onClick}
      disabled={loading}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
      style={{
        background: 'var(--accent)',
        border: 'none',
        borderRadius: 8,
        padding: '6px 16px',
        cursor: loading ? 'not-allowed' : 'pointer',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
        fontSize: '0.78rem',
        fontWeight: 600,
        transition: 'all .2s',
        opacity: loading ? 0.65 : 1,
        boxShadow:
          hovered && !loading
            ? '0 4px 20px rgba(100,140,255,0.55)'
            : '0 2px 10px rgba(100,140,255,0.3)',
        transform: hovered && !loading ? 'translateY(-1px)' : 'none',
      }}
    >
      {loading ? (
        <Loader2
          style={{
            width: 13,
            height: 13,
            animation: 'spin 1s linear infinite',
          }}
        />
      ) : (
        <Play style={{ width: 13, height: 13 }} />
      )}
      {loading ? 'Running…' : 'Run'}
    </button>
  );
}

// ─── Output panel ─────────────────────────────────────────────────────────────

function OutputPanel({
  output,
  status,
  execTime,
  onClear,
}: {
  output: string[];
  status: StatusType;
  execTime: number | null;
  onClear: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasOutput =
    output.length > 0 && !(output.length === 1 && output[0] === '');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--background-sunken)',
      }}
    >
      {/* Output header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--divider)',
          background: 'var(--background-elevated)',
          flexShrink: 0,
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal style={{ color: 'var(--accent)', width: 14, height: 14 }} />
          <span
            style={{
              fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--foreground-muted)',
            }}
          >
            Output
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {execTime !== null && (
            <span
              style={{
                fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
                fontSize: '0.67rem',
                color: 'var(--foreground-muted)',
              }}
            >
              {execTime}ms
            </span>
          )}
          <StatusBadge status={status} />
          {hasOutput && (
            <button
              onClick={onClear}
              title="Clear output"
              style={{
                background: 'none',
                border: 'none',
                padding: '3px',
                cursor: 'pointer',
                color: 'var(--foreground-muted)',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                transition: 'color .2s',
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.color = 'var(--foreground)')
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.color = 'var(--foreground-muted)')
              }
            >
              <Trash2 style={{ width: 13, height: 13 }} />
            </button>
          )}
        </div>
      </div>

      {/* Output body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--foreground-muted) transparent',
        }}
      >
        {/* Running state */}
        {status === 'running' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--foreground-muted)',
              fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
              fontSize: '0.82rem',
              animation: 'fadeInUp .3s ease',
            }}
          >
            <Loader2
              style={{
                width: 14,
                height: 14,
                color: 'var(--accent)',
                animation: 'spin 1s linear infinite',
              }}
            />
            Executing…
          </div>
        )}

        {/* Error with no output */}
        {status === 'error' && !hasOutput && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '14px 16px',
              borderRadius: 10,
              border: '1px solid rgba(252,129,129,0.3)',
              background: 'rgba(252,129,129,0.07)',
              animation: 'fadeInUp .3s ease',
            }}
          >
            <TriangleAlert
              style={{
                color: '#fc8181',
                width: 15,
                height: 15,
                flexShrink: 0,
                marginTop: 1,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
                fontSize: '0.8rem',
                color: '#fc8181',
              }}
            >
              Execution failed. Check your code and try again.
            </span>
          </div>
        )}

        {/* Output lines */}
        {hasOutput && status !== 'running' && (
          <div
            style={{
              borderRadius: 10,
              border:
                status === 'error'
                  ? '1px solid rgba(252,129,129,0.25)'
                  : '1px solid var(--card-border)',
              background:
                status === 'error'
                  ? 'rgba(252,129,129,0.05)'
                  : 'var(--background)',
              padding: '14px 16px',
              overflowX: 'auto',
              animation: 'fadeInUp .3s ease',
            }}
          >
            {output.map((line, i) => (
              <div
                key={i}
                style={{
                  fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
                  fontSize: '0.82rem',
                  lineHeight: 1.75,
                  color: status === 'error' ? '#fc8181' : 'var(--foreground-2)',
                  whiteSpace: 'pre',
                  minHeight: '1.4em',
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}

        {/* Idle empty state */}
        {!hasOutput && status === 'idle' && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'calc(100% - 40px)',
              gap: 12,
              color: 'var(--foreground-muted)',
              fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
              fontSize: '0.8rem',
              opacity: 0.6,
            }}
          >
            <Terminal style={{ width: 32, height: 32, opacity: 0.3 }} />
            <span>Run your code to see output</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Editor toolbar ───────────────────────────────────────────────────────────

function EditorToolbar({
  language,
  onLanguageChange,
  onRun,
  loading,
  onCopy,
  onReset,
}: {
  language: LanguageOption;
  onLanguageChange: (opt: LanguageOption) => void;
  onRun: () => void;
  loading: boolean;
  onCopy: () => void;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--divider)',
        background: 'var(--background-elevated)',
        gap: 12,
        flexWrap: 'wrap',
        flexShrink: 0,
      }}
    >
      {/* Left: language icon + selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Code2
          style={{
            color: LANG_COLORS[language.language] ?? 'var(--accent)',
            width: 16,
            height: 16,
          }}
        />
        <SelectLanguage value={language} onChange={onLanguageChange} />
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <IconBtn onClick={onCopy} title="Copy code">
          <Copy style={{ width: 12, height: 12 }} />
          Copy
        </IconBtn>

        <IconBtn onClick={onReset} title="Reset to default snippet">
          <Trash2 style={{ width: 12, height: 12 }} />
          Reset
        </IconBtn>

        <RunButton onClick={onRun} loading={loading} />
      </div>
    </div>
  );
}

// ─── Toast notifications ──────────────────────────────────────────────────────

type ToastItem = { id: number; message: string; type: 'success' | 'error' };

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 8,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 12,
            background: 'var(--background-elevated)',
            border: `1px solid ${
              t.type === 'success'
                ? 'rgba(104,211,145,0.35)'
                : 'rgba(252,129,129,0.35)'
            }`,
            boxShadow: 'var(--card-shadow-hover)',
            fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
            fontSize: '0.8rem',
            color: t.type === 'success' ? '#68d391' : '#fc8181',
            animation: 'slideInToast .25s cubic-bezier(.16,1,.3,1)',
            minWidth: 220,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {t.type === 'success' ? (
            <CheckCircle2 style={{ width: 14, height: 14, flexShrink: 0 }} />
          ) : (
            <TriangleAlert style={{ width: 14, height: 14, flexShrink: 0 }} />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Content() {
  const { theme } = useTheme();
  const [language, setLanguage] = useState<LanguageOption>(languageOptions[0]);
  const [sourceCode, setSourceCode] = useState(codeSnippets['python']);
  const [output, setOutput] = useState<string[]>([]);
  const [status, setStatus] = useState<StatusType>('idle');
  const [execTime, setExecTime] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const editorRef = useRef<any>(null);
  const toastId = useRef(0);

  // ── Keyboard shortcut: ⌘/Ctrl + Enter ──────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceCode, language, status]);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000
    );
  }, []);

  // ── Language change ───────────────────────────────────────────────────────
  function handleLanguageChange(opt: LanguageOption) {
    setLanguage(opt);
    setSourceCode(codeSnippets[opt.language] ?? '');
    setOutput([]);
    setStatus('idle');
    setExecTime(null);
  }

  // ── Copy ─────────────────────────────────────────────────────────────────
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(sourceCode);
      addToast('Code copied to clipboard', 'success');
    } catch {
      addToast('Failed to copy', 'error');
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function handleReset() {
    setSourceCode(codeSnippets[language.language] ?? '');
    setOutput([]);
    setStatus('idle');
    setExecTime(null);
  }

  // ── Execute ───────────────────────────────────────────────────────────────
  async function handleRun() {
    if (status === 'running') return;
    setStatus('running');
    setOutput([]);
    setExecTime(null);
    const t0 = performance.now();

    try {
      // Step 1: fetch the actual available runtimes so versions always match
      const runtimesRes = await axios.get(
        'https://emkc.org/api/v2/piston/runtimes'
      );
      const runtimes: {
        language: string;
        version: string;
        aliases: string[];
      }[] = runtimesRes.data;

      // Find the best matching runtime for the selected language
      const match = runtimes.find(
        (r) =>
          r.language === language.language ||
          r.aliases?.includes(language.language)
      );

      if (!match) {
        const available = runtimes.map((r) => r.language).join(', ');
        setOutput([
          `Language "${language.language}" not found on Piston.`,
          `Available: ${available}`,
        ]);
        setStatus('error');
        addToast('Language not available', 'error');
        return;
      }

      // Step 2: execute with the live version
      const res = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language: match.language,
        version: match.version,
        files: [{ name: `main.${language.language}`, content: sourceCode }],
      });

      const elapsed = Math.round(performance.now() - t0);
      const run = res.data.run;

      // Combine stdout + stderr (Piston puts compile errors in compile.stderr)
      const compile = res.data.compile;
      const rawOutput = [
        compile?.output ?? '',
        compile?.stderr ?? '',
        run.output ?? '',
      ]
        .join('')
        .trimEnd();

      const lines =
        rawOutput.length > 0 ? rawOutput.split('\n') : ['(no output)'];

      setOutput(lines);
      setExecTime(elapsed);

      if (run.code !== 0) {
        setStatus('error');
        addToast(`Exited with code ${run.code}`, 'error');
      } else {
        setStatus('success');
        addToast(`Executed in ${elapsed}ms`, 'success');
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - t0);
      setExecTime(elapsed);

      // Surface the real error instead of hiding it
      const detail =
        err?.response?.data?.message ??
        err?.response?.data ??
        err?.message ??
        'Unknown error';

      const status = err?.response?.status;

      setOutput([
        `Network / API error${status ? ` (HTTP ${status})` : ''}:`,
        typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2),
        '',
        'Check the browser console for the full response.',
      ]);
      console.error('[Piston] Execution error:', err?.response ?? err);

      setStatus('error');
      addToast('Execution failed — see output for details', 'error');
    }
  }

  return (
    <>
      {/* Injected keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(20px) scale(.96); }
          to   { opacity: 1; transform: translateX(0)   scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          animation: 'fadeInUp .45s cubic-bezier(.16,1,.3,1) both',
        }}
      >
        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <span
            style={{
              fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
              fontSize: '0.68rem',
              fontWeight: 400,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              opacity: 0.85,
              display: 'block',
              marginBottom: 6,
            }}
          >
            Interactive Playground
          </span>
          <h1
            style={{
              fontFamily: "var(--font-syne,'Syne',sans-serif)",
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: '0 0 6px',
              color: 'var(--foreground)',
            }}
          >
            Code Interpreter
          </h1>
          <p
            style={{
              fontFamily:
                "var(--font-plus-jakarta,'Plus Jakarta Sans',sans-serif)",
              color: 'var(--foreground-muted)',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Write and execute code across 8 languages — powered by Piston.
          </p>
        </div>

        {/* ── Editor card ──────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: 16,
            boxShadow: 'var(--card-shadow)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          <ResizablePanelGroup direction="horizontal" style={{ flex: 1 }}>
            {/* ── Left: code editor ──────────────────────────────────────── */}
            <ResizablePanel defaultSize={55} minSize={30}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderRight: '1px solid var(--divider)',
                }}
              >
                <EditorToolbar
                  language={language}
                  onLanguageChange={handleLanguageChange}
                  onRun={handleRun}
                  loading={status === 'running'}
                  onCopy={handleCopy}
                  onReset={handleReset}
                />

                {/* Monaco editor */}
                <div style={{ flex: 1, minHeight: 0 }}>
                  <Editor
                    height="100%"
                    language={language.language}
                    value={sourceCode}
                    theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                    onChange={(val) => val !== undefined && setSourceCode(val)}
                    onMount={(editor) => {
                      editorRef.current = editor;
                      editor.focus();
                    }}
                    options={{
                      fontSize: 13,
                      fontFamily:
                        "'DM Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
                      fontLigatures: true,
                      lineHeight: 1.75,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      padding: { top: 16, bottom: 16 },
                      renderLineHighlight: 'gutter',
                      smoothScrolling: true,
                      cursorBlinking: 'phase',
                      cursorSmoothCaretAnimation: 'on',
                      wordWrap: 'on',
                      tabSize: 2,
                      bracketPairColorization: { enabled: true },
                      scrollbar: {
                        verticalScrollbarSize: 5,
                        horizontalScrollbarSize: 5,
                        useShadows: false,
                      },
                    }}
                  />
                </div>

                {/* Status bar */}
                <div
                  style={{
                    padding: '5px 16px',
                    borderTop: '1px solid var(--divider)',
                    background: 'var(--background-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
                      fontSize: '0.65rem',
                      color: 'var(--foreground-muted)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {language.displayName} · v{language.version}
                  </span>
                  <span
                    style={{
                      width: 1,
                      height: 11,
                      background: 'var(--divider)',
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
                      fontSize: '0.65rem',
                      color: 'var(--foreground-muted)',
                    }}
                  >
                    UTF-8 · LF
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
                      fontSize: '0.65rem',
                      color: 'var(--foreground-muted)',
                      marginLeft: 'auto',
                      opacity: 0.6,
                    }}
                  >
                    ⌘ Enter to run
                  </span>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* ── Right: output ──────────────────────────────────────────── */}
            <ResizablePanel defaultSize={45} minSize={25}>
              <OutputPanel
                output={output}
                status={status}
                execTime={execTime}
                onClear={() => {
                  setOutput([]);
                  setStatus('idle');
                  setExecTime(null);
                }}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
            padding: '0 2px',
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
              fontSize: '0.67rem',
              color: 'var(--foreground-muted)',
              opacity: 0.65,
            }}
          >
            Powered by{' '}
            <a
              href="https://piston.readthedocs.io"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--accent)',
                textDecoration: 'none',
                opacity: 1,
              }}
            >
              Piston
            </a>{' '}
            · sandboxed, server-side execution
          </span>
          <span
            style={{
              fontFamily: "var(--font-dm-mono,'DM Mono',monospace)",
              fontSize: '0.67rem',
              color: 'var(--foreground-muted)',
              opacity: 0.5,
            }}
          >
            {languageOptions.length} languages supported
          </span>
        </div>
      </div>

      {/* ── Toast layer ──────────────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} />
    </>
  );
}
