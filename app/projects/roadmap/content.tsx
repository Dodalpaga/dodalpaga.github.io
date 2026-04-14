'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusValue = 'done' | 'inprogress' | 'todo' | 'blocked';
type PriorityValue = 'urgent' | 'high' | 'medium' | 'low';
type LeftTab = 'card' | 'team' | 'filters';

interface StatusOption {
  value: StatusValue;
  label: string;
  icon: string;
  color: string;
}

interface PriorityOption {
  value: PriorityValue;
  label: string;
  color: string;
}

interface Owner {
  id: string;
  name: string;
  color: string;
}

interface Asset {
  name: string;
  dataUrl: string;
  type: string;
}

interface Card {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  status: StatusValue;
  priority: PriorityValue;
  owners: string[];
  assets: Asset[];
  tags: string[];
  createdAt: number;
}

interface Phase {
  id: string;
  name: string;
  order: number;
  color: string;
}

interface DropTarget {
  phaseId: string;
  beforeCardId: string | null;
}

interface FormState {
  phaseId: string;
  title: string;
  description: string;
  status: StatusValue;
  priority: PriorityValue;
  selectedOwners: string[];
  assets: Asset[];
  tags: string[];
  tagInput: string;
  newPhaseName: string;
  showNewPhase: boolean;
}

interface FilterState {
  search: string;
  statuses: StatusValue[];
  ownerIds: string[];
}

interface ToastState {
  message: string;
  action?: { label: string; fn: () => void };
  id: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'done', label: 'Done', icon: '✅', color: '#22C55E' },
  { value: 'inprogress', label: 'In Progress', icon: '🔄', color: '#3B82F6' },
  { value: 'todo', label: 'To Do', icon: '⬜', color: '#94A3B8' },
  { value: 'blocked', label: 'Blocked', icon: '🔴', color: '#EF4444' },
];

const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: 'urgent', label: '🔥 Urgent', color: '#EF4444' },
  { value: 'high', label: '⬆ High', color: '#F97316' },
  { value: 'medium', label: '➡ Medium', color: '#EAB308' },
  { value: 'low', label: '⬇ Low', color: '#94A3B8' },
];

const PHASE_COLORS = [
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#F43F5E',
  '#84CC16',
];

const DEFAULT_OWNERS: Owner[] = [
  { id: 'o1', name: 'Pierre', color: '#9333EA' },
  { id: 'o2', name: 'Martin', color: '#22C55E' },
  { id: 'o3', name: 'Lucas', color: '#3B82F6' },
  { id: 'o4', name: 'Mathilde', color: '#fbff25' },
  { id: 'o5', name: 'François', color: '#f93816' },
];

const INITIAL_PHASES: Phase[] = [
  { id: 'p1', name: 'Phase 1', order: 0, color: '#6366F1' },
  { id: 'p2', name: 'Phase 2', order: 1, color: '#8B5CF6' },
  {
    id: 'p3',
    name: 'Phase 3',
    order: 2,
    color: '#EC4899',
  },
  {
    id: 'p4',
    name: 'Phase 4',
    order: 3,
    color: '#14B8A6',
  },
  { id: 'p5', name: 'Phase 5', order: 4, color: '#F59E0B' },
];

const INITIAL_CARDS: Card[] = [
  {
    id: 'c1',
    phaseId: 'p1',
    title: 'Gestion des indisponibilités du MAAP MCP',
    description:
      "Le service MAAP exposé via MCP peut être indisponible. Implémenter une logique de fallback graceful : détecter l'indisponibilité au boot, gérer les pannes en cours d'exécution (timeout, retry, circuit breaker), logger sans crasher.",
    status: 'done',
    priority: 'high',
    owners: ['Pierre'],
    assets: [],
    tags: ['backend', 'resilience'],
    createdAt: Date.now(),
  },
  {
    id: 'c2',
    phaseId: 'p2',
    title: 'Connexion des prompts de sous-agents',
    description:
      'Les prompts système des sous-agents définis dans le dossier dédié ne sont actuellement pas chargés/connectés au runtime. À corriger en priorité.',
    status: 'todo',
    priority: 'urgent',
    owners: ['Martin'],
    assets: [],
    tags: ['agentic'],
    createdAt: Date.now(),
  },
  {
    id: 'c3',
    phaseId: 'p2',
    title: 'Améliorer le TechnicalAgent — nouveau nœud de navigation',
    description:
      'Implémenter le nouveau nœud de navigation dans le TechnicalAgent pour tirer parti des évolutions apportées au nœud de navigation.',
    status: 'todo',
    priority: 'medium',
    owners: ['Martin'],
    assets: [],
    tags: ['agentic'],
    createdAt: Date.now(),
  },
  {
    id: 'c4',
    phaseId: 'p3',
    title: 'Monitoring — dashboards & logging',
    description:
      'Refondre les dashboards existants et uniformiser les niveaux de log : ERROR, INFO, DEBUG.',
    status: 'inprogress',
    priority: 'high',
    owners: ['Lucas', 'Pierre'],
    assets: [],
    tags: ['monitoring'],
    createdAt: Date.now(),
  },
  {
    id: 'c5',
    phaseId: 'p3',
    title: 'Frontend — interruptions',
    description:
      'Gestion des messages interrupt (select ✅, confirmation 🔄, disambiguate 🔄) déclenchant un composant UI bloquant.',
    status: 'inprogress',
    priority: 'medium',
    owners: ['Mathilde'],
    assets: [],
    tags: ['frontend'],
    createdAt: Date.now(),
  },
  {
    id: 'c6',
    phaseId: 'p4',
    title: 'Testing & recette',
    description:
      "Validation et tests en conditions réelles par l'équipe IA, puis par le client. Modifications éventuelles à la suite des retours.",
    status: 'todo',
    priority: 'medium',
    owners: [],
    assets: [],
    tags: ['qa'],
    createdAt: Date.now(),
  },
  {
    id: 'c7',
    phaseId: 'p5',
    title: 'Publication LinkedIn',
    description: 'À caler après la validation client.',
    status: 'todo',
    priority: 'low',
    owners: ['François'],
    assets: [],
    tags: ['comms'],
    createdAt: Date.now(),
  },
];

const STORAGE_KEY = 'roadmap-v2';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);
const getStatus = (v: StatusValue) =>
  STATUS_OPTIONS.find((s) => s.value === v) ?? STATUS_OPTIONS[2];
const getPriority = (v: PriorityValue) =>
  PRIORITY_OPTIONS.find((p) => p.value === v) ?? PRIORITY_OPTIONS[2];
const getOwner = (name: string, owners: Owner[]) =>
  owners.find((o) => o.name === name);

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────

const IconTrash = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);
const IconEdit = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconCopy = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconGrip = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9" cy="6" r="1.5" />
    <circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" />
    <circle cx="15" cy="18" r="1.5" />
  </svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{
      transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
      transition: 'transform 0.2s',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconPlus = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconExport = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconX = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconSearch = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconArrowUp = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);
const IconArrowDown = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [toast.id, onClose]);

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: 'var(--card)',
        border: '1px solid var(--card-border)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        animation: 'toastIn 0.2s ease',
        '@keyframes toastIn': {
          from: { transform: 'translateY(16px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      }}
    >
      <Typography
        sx={{
          fontSize: '0.8rem',
          color: 'var(--foreground)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {toast.message}
      </Typography>
      {toast.action && (
        <Box
          component="button"
          onClick={() => {
            toast.action!.fn();
            onClose();
          }}
          sx={{
            padding: '3px 10px',
            borderRadius: '6px',
            background: 'var(--accent-muted)',
            border: '1px solid var(--accent)',
            cursor: 'pointer',
            color: 'var(--accent)',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {toast.action.label}
        </Box>
      )}
      <Box
        component="button"
        onClick={onClose}
        sx={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--foreground-muted)',
          display: 'flex',
          alignItems: 'center',
          p: 0,
          '&:hover': { color: 'var(--foreground)' },
        }}
      >
        <IconX size={12} />
      </Box>
    </Box>
  );
}

// ─── Delete Phase Modal ───────────────────────────────────────────────────────

interface DeletePhaseModalProps {
  phase: Phase;
  cardsCount: number;
  otherPhases: Phase[];
  onDeleteAll: () => void;
  onReassign: (targetPhaseId: string) => void;
  onCancel: () => void;
}

function DeletePhaseModal({
  phase,
  cardsCount,
  otherPhases,
  onDeleteAll,
  onReassign,
  onCancel,
}: DeletePhaseModalProps) {
  const [targetPhaseId, setTargetPhaseId] = useState(otherPhases[0]?.id ?? '');

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          padding: '28px',
          width: 420,
          maxWidth: '90vw',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: phase.color,
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: "'Syne', sans-serif",
              color: 'var(--foreground)',
            }}
          >
            Supprimer « {phase.name} »
          </Typography>
        </Box>

        {cardsCount > 0 ? (
          <>
            <Typography
              sx={{
                fontSize: '0.82rem',
                color: 'var(--foreground-muted)',
                mb: 2.5,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                lineHeight: 1.6,
              }}
            >
              Cette phase contient{' '}
              <strong style={{ color: 'var(--foreground)' }}>
                {cardsCount} carte{cardsCount > 1 ? 's' : ''}
              </strong>
              . Que souhaitez-vous faire ?
            </Typography>

            {otherPhases.length > 0 && (
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: 'var(--foreground-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    mb: 1,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Réassigner vers
                </Typography>
                <Box
                  component="select"
                  value={targetPhaseId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setTargetPhaseId(e.target.value)
                  }
                  sx={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--card-border)',
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    fontSize: '0.8rem',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {otherPhases.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {otherPhases.length > 0 && (
                <Box
                  component="button"
                  onClick={() => onReassign(targetPhaseId)}
                  sx={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: 'var(--accent-muted)',
                    border: '1.5px solid var(--accent)',
                    cursor: 'pointer',
                    color: 'var(--accent)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Déplacer les cartes & supprimer la phase
                </Box>
              )}
              <Box
                component="button"
                onClick={onDeleteAll}
                sx={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#450a0a',
                  border: '1.5px solid #ef4444',
                  cursor: 'pointer',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Supprimer la phase et toutes ses cartes
              </Box>
              <Box
                component="button"
                onClick={onCancel}
                sx={{
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: '1px solid var(--card-border)',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)',
                  fontSize: '0.82rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Annuler
              </Box>
            </Box>
          </>
        ) : (
          <>
            <Typography
              sx={{
                fontSize: '0.82rem',
                color: 'var(--foreground-muted)',
                mb: 2.5,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Cette phase est vide. Confirmer la suppression ?
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Box
                component="button"
                onClick={onDeleteAll}
                sx={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  background: '#450a0a',
                  border: '1.5px solid #ef4444',
                  cursor: 'pointer',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Supprimer
              </Box>
              <Box
                component="button"
                onClick={onCancel}
                sx={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: '1px solid var(--card-border)',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)',
                  fontSize: '0.82rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Annuler
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

// ─── Edit Card Modal ──────────────────────────────────────────────────────────

interface EditCardModalProps {
  card: Card;
  phases: Phase[];
  owners: Owner[];
  onSave: (updated: Card) => void;
  onClose: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

function EditCardModal({
  card,
  phases,
  owners,
  onSave,
  onClose,
  fileInputRef,
}: EditCardModalProps) {
  const [draft, setDraft] = useState<Card>({ ...card });
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !draft.tags.includes(t)) {
      setDraft((d) => ({ ...d, tags: [...d.tags, t] }));
    }
    setTagInput('');
  };
  const removeTag = (tag: string) =>
    setDraft((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }));
  const toggleOwner = (name: string) =>
    setDraft((d) => ({
      ...d,
      owners: d.owners.includes(name)
        ? d.owners.filter((o) => o !== name)
        : [...d.owners, name],
    }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setDraft((d) => ({
          ...d,
          assets: [
            ...d.assets,
            {
              name: file.name,
              dataUrl: ev.target?.result as string,
              type: file.type,
            },
          ],
        }));
      reader.readAsDataURL(file);
    });
  };

  const inputSx = {
    width: '100%',
    padding: '7px 10px',
    fontSize: '0.8rem',
    boxSizing: 'border-box' as const,
    border: '1px solid var(--card-border)',
    borderRadius: '8px',
    background: 'var(--card)',
    color: 'var(--foreground)',
    outline: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    '&:focus': { borderColor: 'var(--accent)' },
  };
  const labelSx = {
    fontSize: '0.68rem',
    fontWeight: 600,
    color: 'var(--foreground-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    display: 'block',
    mb: 0.75,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          width: 560,
          maxWidth: '95vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Modal header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderBottom: '1px solid var(--card-border)',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.9rem',
              fontFamily: "'Syne', sans-serif",
              color: 'var(--foreground)',
            }}
          >
            Modifier la carte
          </Typography>
          <Box
            component="button"
            onClick={onClose}
            sx={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--foreground-muted)',
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              borderRadius: '6px',
              '&:hover': {
                color: 'var(--foreground)',
                background: 'var(--card-border)',
              },
            }}
          >
            <IconX />
          </Box>
        </Box>

        {/* Scrollable body */}
        <Box
          sx={{
            overflowY: 'auto',
            px: 3,
            py: 2.5,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Phase */}
          <Box>
            <Typography component="label" sx={labelSx}>
              Phase
            </Typography>
            <Box
              component="select"
              value={draft.phaseId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setDraft((d) => ({ ...d, phaseId: e.target.value }))
              }
              sx={{ ...inputSx }}
            >
              {phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Box>
          </Box>

          {/* Title */}
          <Box>
            <Typography component="label" sx={labelSx}>
              Titre *
            </Typography>
            <Box
              component="input"
              value={draft.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDraft((d) => ({ ...d, title: e.target.value }))
              }
              sx={inputSx}
            />
          </Box>

          {/* Description */}
          <Box>
            <Typography component="label" sx={labelSx}>
              Description
            </Typography>
            <Box
              component="textarea"
              value={draft.description}
              rows={4}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              sx={{ ...inputSx, resize: 'vertical', lineHeight: 1.55 }}
            />
          </Box>

          {/* Status + Priority */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography component="label" sx={labelSx}>
                Statut
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {STATUS_OPTIONS.map((s) => (
                  <Box
                    key={s.value}
                    component="button"
                    onClick={() => setDraft((d) => ({ ...d, status: s.value }))}
                    sx={{
                      padding: '4px 9px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      borderRadius: '7px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: 'all .12s',
                      fontWeight: draft.status === s.value ? 600 : 400,
                      border:
                        draft.status === s.value
                          ? `1.5px solid ${s.color}`
                          : '1px solid var(--card-border)',
                      background:
                        draft.status === s.value
                          ? `${s.color}22`
                          : 'var(--card)',
                      color:
                        draft.status === s.value
                          ? s.color
                          : 'var(--foreground-muted)',
                    }}
                  >
                    {s.icon} {s.label}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography component="label" sx={labelSx}>
                Priorité
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {PRIORITY_OPTIONS.map((p) => (
                  <Box
                    key={p.value}
                    component="button"
                    onClick={() =>
                      setDraft((d) => ({ ...d, priority: p.value }))
                    }
                    sx={{
                      padding: '4px 9px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      borderRadius: '7px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: 'all .12s',
                      fontWeight: draft.priority === p.value ? 600 : 400,
                      border:
                        draft.priority === p.value
                          ? `1.5px solid ${p.color}`
                          : '1px solid var(--card-border)',
                      background:
                        draft.priority === p.value
                          ? `${p.color}22`
                          : 'var(--card)',
                      color:
                        draft.priority === p.value
                          ? p.color
                          : 'var(--foreground-muted)',
                    }}
                  >
                    {p.label}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Owners */}
          <Box>
            <Typography component="label" sx={labelSx}>
              Owners
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {owners.map((o) => {
                const sel = draft.owners.includes(o.name);
                return (
                  <Box
                    key={o.name}
                    component="button"
                    onClick={() => toggleOwner(o.name)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all .12s',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      border: sel
                        ? `1.5px solid ${o.color}`
                        : '1px solid var(--card-border)',
                      background: sel ? `${o.color}18` : 'var(--card)',
                      color: sel ? o.color : 'var(--foreground-muted)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: o.color,
                      }}
                    />
                    {o.name}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Tags */}
          <Box>
            <Typography component="label" sx={labelSx}>
              Tags
            </Typography>
            <Box
              sx={{
                display: 'flex',
                gap: '6px',
                mb: draft.tags.length ? 1 : 0,
              }}
            >
              <Box
                component="input"
                value={tagInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTagInput(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Ajouter un tag…"
                sx={{ ...inputSx, flex: 1 }}
              />
              <Box
                component="button"
                onClick={addTag}
                sx={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  background: 'var(--accent-muted)',
                  border: '1px solid var(--accent)',
                  cursor: 'pointer',
                  color: 'var(--accent)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                +
              </Box>
            </Box>
            {draft.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {draft.tags.map((tag) => (
                  <Box
                    key={tag}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'var(--accent-muted)',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                      fontSize: '0.72rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    #{tag}
                    <Box
                      component="button"
                      onClick={() => removeTag(tag)}
                      sx={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        p: 0,
                        opacity: 0.7,
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      <IconX size={9} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Assets */}
          <Box>
            <Typography component="label" sx={labelSx}>
              Assets (images)
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <Box
              component="button"
              onClick={() => fileInputRef.current?.click()}
              sx={{
                width: '100%',
                padding: '8px',
                border: '1px dashed var(--card-border)',
                borderRadius: '8px',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--foreground-muted)',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                '&:hover': {
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                },
              }}
            >
              ⬆ Upload images
            </Box>
            {draft.assets.length > 0 && (
              <Box
                sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px', mt: 1 }}
              >
                {draft.assets.map((a, i) => (
                  <Box key={i} sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={a.dataUrl}
                      alt={a.name}
                      sx={{
                        width: 52,
                        height: 52,
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid var(--card-border)',
                        display: 'block',
                      }}
                    />
                    <Box
                      component="button"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          assets: d.assets.filter((_, idx) => idx !== i),
                        }))
                      }
                      sx={{
                        position: 'absolute',
                        top: -4,
                        right: -4,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#ef4444',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    >
                      ×
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid var(--card-border)',
            display: 'flex',
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <Box
            component="button"
            onClick={() => onSave(draft)}
            disabled={!draft.title.trim()}
            sx={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              cursor: draft.title.trim() ? 'pointer' : 'default',
              background: draft.title.trim()
                ? 'var(--accent-muted)'
                : 'transparent',
              border: draft.title.trim()
                ? '1.5px solid var(--accent)'
                : '1px solid var(--card-border)',
              color: draft.title.trim()
                ? 'var(--accent)'
                : 'var(--foreground-muted)',
              fontSize: '0.82rem',
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all .15s',
            }}
          >
            Sauvegarder
          </Box>
          <Box
            component="button"
            onClick={onClose}
            sx={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              cursor: 'pointer',
              background: 'transparent',
              border: '1px solid var(--card-border)',
              color: 'var(--foreground-muted)',
              fontSize: '0.82rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Annuler
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Roadmap Card ─────────────────────────────────────────────────────────────

interface RoadmapCardProps {
  card: Card;
  owners: Owner[];
  isDropAbove: boolean;
  isDropBelow: boolean;
  isDragging: boolean;
  onDelete: (id: string) => void;
  onEdit: (card: Card) => void;
  onDuplicate: (card: Card) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, card: Card) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>, card: Card) => void;
}

function RoadmapCard({
  card,
  owners,
  isDropAbove,
  isDropBelow,
  isDragging,
  onDelete,
  onEdit,
  onDuplicate,
  onDragStart,
  onDragEnd,
  onDragOver,
}: RoadmapCardProps) {
  const [hovered, setHovered] = React.useState(false);
  const st = getStatus(card.status);
  const pr = getPriority(card.priority);

  return (
    <>
      {/* Drop indicator ABOVE */}
      {isDropAbove && (
        <Box
          sx={{
            height: '3px',
            borderRadius: '2px',
            background: 'var(--accent)',
            mx: 0.5,
            mb: 0.75,
            '@keyframes dropPulse': {
              '0%,100%': { opacity: 1 },
              '50%': { opacity: 0.6 },
            },
            animation: 'dropPulse 0.8s ease infinite',
          }}
        />
      )}

      <Box
        draggable
        onDragStart={(e) => onDragStart(e, card)}
        onDragEnd={onDragEnd}
        onDragOver={(e) => onDragOver(e, card)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          background: 'var(--card)',
          border: '1px solid',
          borderColor: isDragging
            ? 'var(--accent)'
            : hovered
              ? 'var(--accent-muted)'
              : 'var(--card-border)',
          borderLeft: `3px solid ${st.color}`,
          borderRadius: '10px',
          padding: '12px 14px',
          mb: 0.75,
          position: 'relative',
          transition: 'all 0.15s',
          cursor: 'grab',
          userSelect: 'none',
          opacity: isDragging ? 0.4 : 1,
          '&:active': { cursor: 'grabbing' },
        }}
      >
        {/* Hover actions */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: '4px',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
        >
          <Box
            component="button"
            onClick={() => onDuplicate(card)}
            title="Dupliquer"
            sx={{
              background: 'var(--card)',
              border: '1px solid var(--card-border)',
              cursor: 'pointer',
              color: 'var(--foreground-muted)',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '5px',
              '&:hover': {
                color: 'var(--accent)',
                borderColor: 'var(--accent)',
              },
            }}
          >
            <IconCopy />
          </Box>
          <Box
            component="button"
            onClick={() => onEdit(card)}
            title="Modifier"
            sx={{
              background: 'var(--card)',
              border: '1px solid var(--card-border)',
              cursor: 'pointer',
              color: 'var(--foreground-muted)',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '5px',
              '&:hover': {
                color: 'var(--accent)',
                borderColor: 'var(--accent)',
              },
            }}
          >
            <IconEdit />
          </Box>
          <Box
            component="button"
            onClick={() => onDelete(card.id)}
            title="Supprimer"
            sx={{
              background: 'var(--card)',
              border: '1px solid var(--card-border)',
              cursor: 'pointer',
              color: 'var(--foreground-muted)',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '5px',
              '&:hover': { color: '#ef4444', borderColor: '#ef4444' },
            }}
          >
            <IconTrash />
          </Box>
        </Box>

        {/* Drag handle */}
        <Box
          sx={{
            position: 'absolute',
            left: 5,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--card-border)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
        >
          <IconGrip />
        </Box>

        {/* Priority badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 0.75,
            pr: 7,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <span style={{ fontSize: 11 }}>{st.icon}</span>
            <Typography
              sx={{
                fontSize: '0.83rem',
                fontWeight: 600,
                color: 'var(--accent)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                lineHeight: 1.3,
              }}
            >
              {card.title}
            </Typography>
          </Box>
        </Box>

        {/* Meta row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap',
            mb: card.description ? 0.75 : 0,
          }}
        >
          {/* Priority */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              padding: '1px 7px',
              borderRadius: '4px',
              background: `${pr.color}22`,
              border: `1px solid ${pr.color}44`,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.67rem',
                fontWeight: 600,
                color: pr.color,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: '0.03em',
              }}
            >
              {pr.label.split(' ').slice(1).join(' ')}
            </Typography>
          </Box>

          {/* Tags */}
          {card.tags.map((tag) => (
            <Box
              key={tag}
              sx={{
                padding: '1px 6px',
                borderRadius: '4px',
                background: 'var(--accent-muted)',
                border: '1px solid var(--accent)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  color: 'var(--accent)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                #{tag}
              </Typography>
            </Box>
          ))}

          {/* Spacer */}
          <Box sx={{ flex: 1 }} />

          {/* Owner dots */}
          {card.owners.length > 0 && (
            <Box sx={{ display: 'flex', gap: '3px' }}>
              {card.owners.map((name) => {
                const o = getOwner(name, owners);
                return o ? (
                  <Box
                    key={name}
                    title={name}
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: o.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      color: '#fff',
                      fontWeight: 700,
                      flexShrink: 0,
                      border: '2px solid var(--card)',
                    }}
                  >
                    {name[0]}
                  </Box>
                ) : null;
              })}
            </Box>
          )}
        </Box>

        {/* Description */}
        {card.description && (
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.76rem',
              color: 'var(--foreground-muted)',
              lineHeight: 1.6,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              mb: card.assets.length ? 1 : 0,
              mt: card.owners.length || card.tags.length ? 0.5 : 0,
            }}
          >
            {card.description}
          </Typography>
        )}

        {/* Assets */}
        {card.assets.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
            {card.assets.map((a, i) =>
              a.type.startsWith('image/') ? (
                <Box
                  key={i}
                  component="img"
                  src={a.dataUrl}
                  alt={a.name}
                  sx={{
                    maxHeight: 120,
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: '6px',
                    border: '1px solid var(--card-border)',
                  }}
                />
              ) : null,
            )}
          </Box>
        )}
      </Box>

      {/* Drop indicator BELOW */}
      {isDropBelow && (
        <Box
          sx={{
            height: '3px',
            borderRadius: '2px',
            background: 'var(--accent)',
            mx: 0.5,
            mt: 0.25,
            '@keyframes dropPulse': {
              '0%,100%': { opacity: 1 },
              '50%': { opacity: 0.6 },
            },
            animation: 'dropPulse 0.8s ease infinite',
          }}
        />
      )}
    </>
  );
}

// ─── Phase Section ────────────────────────────────────────────────────────────

interface PhaseSectionProps {
  phase: Phase;
  allPhases: Phase[];
  cards: Card[];
  filteredCards: Card[];
  owners: Owner[];
  collapsed: boolean;
  dropTarget: DropTarget | null;
  draggingCardId: string | null;
  isFirstPhase: boolean;
  isLastPhase: boolean;
  onCollapse: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDeleteCard: (id: string) => void;
  onEditCard: (card: Card) => void;
  onDuplicateCard: (card: Card) => void;
  onCardDragStart: (e: React.DragEvent<HTMLDivElement>, card: Card) => void;
  onCardDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onCardDragOver: (e: React.DragEvent<HTMLDivElement>, card: Card) => void;
  onPhaseDragOver: (
    e: React.DragEvent<HTMLDivElement>,
    phaseId: string,
  ) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, phaseId: string) => void;
}

function PhaseSection({
  phase,
  allPhases,
  cards,
  filteredCards,
  owners,
  collapsed,
  dropTarget,
  draggingCardId,
  isFirstPhase,
  isLastPhase,
  onCollapse,
  onDelete,
  onRename,
  onMoveUp,
  onMoveDown,
  onDeleteCard,
  onEditCard,
  onDuplicateCard,
  onCardDragStart,
  onCardDragEnd,
  onCardDragOver,
  onPhaseDragOver,
  onDrop,
}: PhaseSectionProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(phase.name);
  const [headerHovered, setHeaderHovered] = useState(false);

  const totalCards = cards.length;
  const doneCards = cards.filter((c) => c.status === 'done').length;
  const progress =
    totalCards > 0 ? Math.round((doneCards / totalCards) * 100) : 0;

  const isDragOverEmpty =
    draggingCardId &&
    filteredCards.length === 0 &&
    dropTarget?.phaseId === phase.id;

  const commitRename = () => {
    const trimmed = nameValue.trim();
    if (trimmed) onRename(trimmed);
    else setNameValue(phase.name);
    setEditingName(false);
  };

  return (
    <Box
      sx={{ mb: 3.5 }}
      onDragOver={(e) => {
        e.preventDefault();
        onPhaseDragOver(e, phase.id);
      }}
      onDrop={(e) => onDrop(e, phase.id)}
    >
      {/* Phase header */}
      <Box
        onMouseEnter={() => setHeaderHovered(true)}
        onMouseLeave={() => setHeaderHovered(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1.25,
          mb: 1,
          borderBottom: `2px solid ${phase.color}40`,
        }}
      >
        {/* Color dot */}
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: phase.color,
            flexShrink: 0,
          }}
        />

        {/* Name or inline editor */}
        {editingName ? (
          <Box
            component="input"
            autoFocus
            value={nameValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNameValue(e.target.value)
            }
            onBlur={commitRename}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') {
                setNameValue(phase.name);
                setEditingName(false);
              }
            }}
            sx={{
              flex: 1,
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              border: 'none',
              background: 'transparent',
              color: 'var(--foreground)',
              outline: '1px solid var(--accent)',
              borderRadius: '4px',
              padding: '0 4px',
            }}
          />
        ) : (
          <Typography
            onDoubleClick={() => setEditingName(true)}
            sx={{
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: "'Syne', sans-serif",
              color: 'var(--foreground)',
              cursor: 'default',
              flex: 1,
              letterSpacing: '-0.01em',
            }}
            title="Double-clic pour renommer"
          >
            {phase.name}
          </Typography>
        )}

        {/* Card count badge */}
        <Box
          sx={{
            padding: '1px 7px',
            borderRadius: '12px',
            background: `${phase.color}22`,
            border: `1px solid ${phase.color}44`,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: phase.color,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {totalCards}
          </Typography>
        </Box>

        {/* Actions — visible on hover */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            opacity: headerHovered ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
        >
          {!isFirstPhase && (
            <Box
              component="button"
              onClick={onMoveUp}
              title="Monter"
              sx={{
                background: 'none',
                border: '1px solid var(--card-border)',
                cursor: 'pointer',
                color: 'var(--foreground-muted)',
                padding: '3px 5px',
                borderRadius: '5px',
                display: 'flex',
                '&:hover': {
                  color: 'var(--foreground)',
                  borderColor: 'var(--foreground-muted)',
                },
              }}
            >
              <IconArrowUp />
            </Box>
          )}
          {!isLastPhase && (
            <Box
              component="button"
              onClick={onMoveDown}
              title="Descendre"
              sx={{
                background: 'none',
                border: '1px solid var(--card-border)',
                cursor: 'pointer',
                color: 'var(--foreground-muted)',
                padding: '3px 5px',
                borderRadius: '5px',
                display: 'flex',
                '&:hover': {
                  color: 'var(--foreground)',
                  borderColor: 'var(--foreground-muted)',
                },
              }}
            >
              <IconArrowDown />
            </Box>
          )}
          <Box
            component="button"
            onClick={() => setEditingName(true)}
            title="Renommer"
            sx={{
              background: 'none',
              border: '1px solid var(--card-border)',
              cursor: 'pointer',
              color: 'var(--foreground-muted)',
              padding: '3px 5px',
              borderRadius: '5px',
              display: 'flex',
              '&:hover': {
                color: 'var(--accent)',
                borderColor: 'var(--accent)',
              },
            }}
          >
            <IconEdit />
          </Box>
          <Box
            component="button"
            onClick={onDelete}
            title="Supprimer la phase"
            sx={{
              background: 'none',
              border: '1px solid var(--card-border)',
              cursor: 'pointer',
              color: 'var(--foreground-muted)',
              padding: '3px 5px',
              borderRadius: '5px',
              display: 'flex',
              '&:hover': { color: '#ef4444', borderColor: '#ef4444' },
            }}
          >
            <IconTrash />
          </Box>
        </Box>

        {/* Collapse toggle */}
        <Box
          component="button"
          onClick={onCollapse}
          sx={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--foreground-muted)',
            display: 'flex',
            alignItems: 'center',
            p: 0.25,
            '&:hover': { color: 'var(--foreground)' },
          }}
        >
          <IconChevron open={!collapsed} />
        </Box>
      </Box>

      {/* Progress bar */}
      {totalCards > 0 && (
        <Box
          sx={{
            height: 3,
            borderRadius: '2px',
            background: 'var(--card-border)',
            mb: collapsed ? 0 : 1.5,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${progress}%`,
              background: phase.color,
              borderRadius: '2px',
              transition: 'width 0.4s ease',
            }}
          />
        </Box>
      )}

      {/* Cards */}
      {!collapsed && (
        <Box
          sx={{
            minHeight: isDragOverEmpty ? 48 : 0,
            border: isDragOverEmpty
              ? `2px dashed ${phase.color}`
              : '2px solid transparent',
            borderRadius: '8px',
            transition: 'border-color 0.15s',
            padding: isDragOverEmpty ? 1 : 0,
          }}
        >
          {filteredCards.map((card) => (
            <RoadmapCard
              key={card.id}
              card={card}
              owners={owners}
              isDragging={draggingCardId === card.id}
              isDropAbove={
                dropTarget?.phaseId === phase.id &&
                dropTarget?.beforeCardId === card.id
              }
              isDropBelow={false}
              onDelete={onDeleteCard}
              onEdit={onEditCard}
              onDuplicate={onDuplicateCard}
              onDragStart={onCardDragStart}
              onDragEnd={onCardDragEnd}
              onDragOver={onCardDragOver}
            />
          ))}

          {/* Drop indicator at end of phase */}
          {dropTarget?.phaseId === phase.id &&
            dropTarget?.beforeCardId === null && (
              <Box
                sx={{
                  height: '3px',
                  borderRadius: '2px',
                  background: 'var(--accent)',
                  mx: 0.5,
                  '@keyframes dropPulse': {
                    '0%,100%': { opacity: 1 },
                    '50%': { opacity: 0.6 },
                  },
                  animation: 'dropPulse 0.8s ease infinite',
                }}
              />
            )}

          {filteredCards.length === 0 && !isDragOverEmpty && (
            <Typography
              variant="body2"
              sx={{
                fontSize: '0.76rem',
                color: 'var(--foreground-muted)',
                fontStyle: 'italic',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                py: 0.5,
              }}
            >
              {cards.length === 0
                ? 'Aucune carte — ajoutez-en depuis le panneau gauche.'
                : 'Aucune carte ne correspond aux filtres.'}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

// ─── Manage Owners Panel ─────────────────────────────────────────────────────

interface ManageOwnersPanelProps {
  owners: Owner[];
  onAddOwner: (owner: Owner) => void;
  onDeleteOwner: (id: string) => void;
  onUpdateOwner: (owner: Owner) => void;
}

function ManageOwnersPanel({
  owners,
  onAddOwner,
  onDeleteOwner,
  onUpdateOwner,
}: ManageOwnersPanelProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366F1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddOwner({ id: uid(), name: newName.trim(), color: newColor });
    setNewName('');
    setNewColor('#6366F1');
  };

  const startEdit = (o: Owner) => {
    setEditingId(o.id);
    setEditName(o.name);
    setEditColor(o.color);
  };
  const commitEdit = (o: Owner) => {
    if (editName.trim())
      onUpdateOwner({ ...o, name: editName.trim(), color: editColor });
    setEditingId(null);
  };

  const inputSx = {
    flex: 1,
    padding: '6px 10px',
    fontSize: '0.78rem',
    border: '1px solid var(--card-border)',
    borderRadius: '7px',
    background: 'var(--card)',
    color: 'var(--foreground)',
    outline: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    '&:focus': { borderColor: 'var(--accent)' },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Add new owner */}
      <Box sx={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <Box
          component="input"
          type="color"
          value={newColor}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewColor(e.target.value)
          }
          sx={{
            width: 30,
            height: 30,
            borderRadius: '6px',
            border: '1px solid var(--card-border)',
            padding: 0,
            cursor: 'pointer',
            background: 'none',
          }}
        />
        <Box
          component="input"
          value={newName}
          placeholder="Prénom…"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNewName(e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent) =>
            e.key === 'Enter' && handleAdd()
          }
          sx={inputSx}
        />
        <Box
          component="button"
          onClick={handleAdd}
          sx={{
            padding: '6px 10px',
            borderRadius: '7px',
            background: 'var(--accent-muted)',
            border: '1px solid var(--accent)',
            cursor: 'pointer',
            color: 'var(--accent)',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconPlus />
        </Box>
      </Box>

      {/* Owner list */}
      {owners.map((o) => (
        <Box
          key={o.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 10px',
            borderRadius: '8px',
            border: '1px solid var(--card-border)',
            background: 'var(--card)',
          }}
        >
          {editingId === o.id ? (
            <>
              <Box
                component="input"
                type="color"
                value={editColor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditColor(e.target.value)
                }
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '4px',
                  border: '1px solid var(--card-border)',
                  padding: 0,
                  cursor: 'pointer',
                  background: 'none',
                }}
              />
              <Box
                component="input"
                value={editName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditName(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') commitEdit(o);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                sx={{ ...inputSx, flex: 1 }}
              />
              <Box
                component="button"
                onClick={() => commitEdit(o)}
                sx={{
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  background: 'var(--accent-muted)',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                }}
              >
                OK
              </Box>
            </>
          ) : (
            <>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: o.color,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  flex: 1,
                  fontSize: '0.78rem',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: 'var(--foreground)',
                }}
              >
                {o.name}
              </Typography>
              <Box
                component="button"
                onClick={() => startEdit(o)}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)',
                  display: 'flex',
                  p: 0.25,
                  '&:hover': { color: 'var(--accent)' },
                }}
              >
                <IconEdit />
              </Box>
              <Box
                component="button"
                onClick={() => onDeleteOwner(o.id)}
                sx={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--foreground-muted)',
                  display: 'flex',
                  p: 0.25,
                  '&:hover': { color: '#ef4444' },
                }}
              >
                <IconTrash />
              </Box>
            </>
          )}
        </Box>
      ))}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RoadmapBuilder() {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [roadmapTitle, setRoadmapTitle] = useState('Roadmap');
  const [editingTitle, setEditingTitle] = useState(false);
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [owners, setOwners] = useState<Owner[]>(DEFAULT_OWNERS);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(
    new Set(),
  );

  // ── UI state ────────────────────────────────────────────────────────────────
  const [leftTab, setLeftTab] = useState<LeftTab>('card');
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deletingPhase, setDeletingPhase] = useState<Phase | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // ── Filter state ────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    statuses: [],
    ownerIds: [],
  });

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>({
    phaseId: 'p1',
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    selectedOwners: [],
    assets: [],
    tags: [],
    tagInput: '',
    newPhaseName: '',
    showNewPhase: false,
  });

  // ── Drag state ──────────────────────────────────────────────────────────────
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // ── Persistence ─────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.phases) setPhases(data.phases);
        if (data.cards) setCards(data.cards);
        if (data.owners) setOwners(data.owners);
        if (data.roadmapTitle) setRoadmapTitle(data.roadmapTitle);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ phases, cards, owners, roadmapTitle }),
      );
    } catch {
      /* ignore */
    }
  }, [phases, cards, owners, roadmapTitle]);

  // ── Keyboard shortcut: Escape closes modals ──────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingCard(null);
        setDeletingPhase(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Derived / memos ──────────────────────────────────────────────────────
  const sortedPhases = useMemo(
    () => [...phases].sort((a, b) => a.order - b.order),
    [phases],
  );

  const filteredCardsMap = useMemo(() => {
    const map: Record<string, Card[]> = {};
    for (const phase of sortedPhases) {
      let phaseCards = cards.filter((c) => c.phaseId === phase.id);
      if (filters.search) {
        const q = filters.search.toLowerCase();
        phaseCards = phaseCards.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.tags.some((t) => t.includes(q)),
        );
      }
      if (filters.statuses.length) {
        phaseCards = phaseCards.filter((c) =>
          filters.statuses.includes(c.status),
        );
      }
      if (filters.ownerIds.length) {
        phaseCards = phaseCards.filter((c) =>
          c.owners.some((name) => {
            const o = owners.find((ow) => ow.name === name);
            return o && filters.ownerIds.includes(o.id);
          }),
        );
      }
      map[phase.id] = phaseCards;
    }
    return map;
  }, [cards, sortedPhases, filters, owners]);

  const stats = useMemo(() => {
    const total = cards.length;
    const done = cards.filter((c) => c.status === 'done').length;
    const progress = cards.filter((c) => c.status === 'inprogress').length;
    const blocked = cards.filter((c) => c.status === 'blocked').length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, progress, blocked, pct };
  }, [cards]);

  // ── Card handlers ──────────────────────────────────────────────────────────
  const showToast = useCallback(
    (message: string, action?: ToastState['action']) => {
      setToast({ message, action, id: Date.now() });
    },
    [],
  );

  const handleAddCard = useCallback(() => {
    if (!form.title.trim()) return;
    const newCard: Card = {
      id: uid(),
      phaseId: form.phaseId,
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      owners: [...form.selectedOwners],
      assets: [...form.assets],
      tags: [...form.tags],
      createdAt: Date.now(),
    };
    setCards((prev) => [...prev, newCard]);
    setForm((f) => ({
      ...f,
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      selectedOwners: [],
      assets: [],
      tags: [],
      tagInput: '',
    }));
    showToast('Carte ajoutée ✓');
  }, [form, showToast]);

  const handleDeleteCard = useCallback(
    (id: string) => {
      const deleted = cards.find((c) => c.id === id);
      setCards((prev) => prev.filter((c) => c.id !== id));
      if (deleted) {
        showToast(`Carte supprimée`, {
          label: 'Annuler',
          fn: () => setCards((prev) => [...prev, deleted]),
        });
      }
    },
    [cards, showToast],
  );

  const handleUpdateCard = useCallback(
    (updated: Card) => {
      setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCard(null);
      showToast('Carte mise à jour ✓');
    },
    [showToast],
  );

  const handleDuplicateCard = useCallback(
    (card: Card) => {
      const dup: Card = {
        ...card,
        id: uid(),
        title: `${card.title} (copie)`,
        createdAt: Date.now(),
      };
      setCards((prev) => {
        const idx = prev.findIndex((c) => c.id === card.id);
        const copy = [...prev];
        copy.splice(idx + 1, 0, dup);
        return copy;
      });
      showToast('Carte dupliquée ✓');
    },
    [showToast],
  );

  // ── Phase handlers ────────────────────────────────────────────────────────
  const handleAddPhase = useCallback(() => {
    if (!form.newPhaseName.trim()) return;
    const maxOrder =
      phases.length > 0 ? Math.max(...phases.map((p) => p.order)) : -1;
    const colorIdx = phases.length % PHASE_COLORS.length;
    const np: Phase = {
      id: uid(),
      name: form.newPhaseName.trim(),
      order: maxOrder + 1,
      color: PHASE_COLORS[colorIdx],
    };
    setPhases((prev) => [...prev, np]);
    setForm((f) => ({
      ...f,
      newPhaseName: '',
      showNewPhase: false,
      phaseId: np.id,
    }));
    showToast(`Phase « ${np.name} » créée ✓`);
  }, [form.newPhaseName, phases, showToast]);

  const handleDeletePhase = useCallback(
    (phase: Phase, targetPhaseId?: string) => {
      setDeletingPhase(null);
      const deletedCards = cards.filter((c) => c.phaseId === phase.id);

      if (targetPhaseId) {
        setCards((prev) =>
          prev.map((c) =>
            c.phaseId === phase.id ? { ...c, phaseId: targetPhaseId } : c,
          ),
        );
      } else {
        setCards((prev) => prev.filter((c) => c.phaseId !== phase.id));
      }
      setPhases((prev) => prev.filter((p) => p.id !== phase.id));

      showToast(`Phase supprimée`, {
        label: 'Annuler',
        fn: () => {
          setPhases((prev) => [...prev, phase]);
          setCards((prev) => [
            ...prev,
            ...deletedCards.map((c) => ({
              ...c,
              phaseId: targetPhaseId ? c.phaseId : phase.id,
            })),
          ]);
        },
      });
    },
    [cards, showToast],
  );

  const handleRenamePhase = useCallback((id: string, name: string) => {
    setPhases((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const handleMovePhase = useCallback(
    (id: string, direction: 'up' | 'down') => {
      setPhases((prev) => {
        const sorted = [...prev].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((p) => p.id === id);
        const swap = direction === 'up' ? idx - 1 : idx + 1;
        if (swap < 0 || swap >= sorted.length) return prev;
        const result = [...sorted];
        const tmpOrder = result[idx].order;
        result[idx].order = result[swap].order;
        result[swap].order = tmpOrder;
        return result;
      });
    },
    [],
  );

  // ── Owner handlers ────────────────────────────────────────────────────────
  const handleAddOwner = useCallback(
    (o: Owner) => setOwners((prev) => [...prev, o]),
    [],
  );
  const handleDeleteOwner = useCallback(
    (id: string) => {
      const o = owners.find((ow) => ow.id === id);
      setOwners((prev) => prev.filter((ow) => ow.id !== id));
      if (o)
        setCards((prev) =>
          prev.map((c) => ({
            ...c,
            owners: c.owners.filter((name) => name !== o.name),
          })),
        );
    },
    [owners],
  );
  const handleUpdateOwner = useCallback(
    (updated: Owner) => {
      const old = owners.find((o) => o.id === updated.id);
      setOwners((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      if (old && old.name !== updated.name) {
        setCards((prev) =>
          prev.map((c) => ({
            ...c,
            owners: c.owners.map((n) => (n === old.name ? updated.name : n)),
          })),
        );
      }
    },
    [owners],
  );

  // ── Collapse ──────────────────────────────────────────────────────────────
  const toggleCollapse = useCallback((id: string) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const data = { roadmapTitle, phases: sortedPhases, cards, owners };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roadmap.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export JSON téléchargé ✓');
  }, [roadmapTitle, sortedPhases, cards, owners, showToast]);

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const handleCardDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, card: Card) => {
      setDraggingCardId(card.id);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', card.id);
    },
    [],
  );

  const handleCardDragEnd = useCallback(
    (_e: React.DragEvent<HTMLDivElement>) => {
      setDraggingCardId(null);
      setDropTarget(null);
    },
    [],
  );

  const handleCardDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetCard: Card) => {
      e.preventDefault();
      e.stopPropagation();
      if (!draggingCardId || draggingCardId === targetCard.id) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const isTop = e.clientY < rect.top + rect.height / 2;
      const phaseCards = cards.filter((c) => c.phaseId === targetCard.phaseId);
      if (isTop) {
        setDropTarget({
          phaseId: targetCard.phaseId,
          beforeCardId: targetCard.id,
        });
      } else {
        const idx = phaseCards.findIndex((c) => c.id === targetCard.id);
        const next = phaseCards[idx + 1];
        setDropTarget({
          phaseId: targetCard.phaseId,
          beforeCardId: next ? next.id : null,
        });
      }
    },
    [draggingCardId, cards],
  );

  const handlePhaseDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, phaseId: string) => {
      e.preventDefault();
      if (!draggingCardId) return;
      if (!dropTarget || dropTarget.phaseId !== phaseId) {
        setDropTarget({ phaseId, beforeCardId: null });
      }
    },
    [draggingCardId, dropTarget],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetPhaseId: string) => {
      e.preventDefault();
      if (!draggingCardId) return;

      setCards((prev) => {
        const copy = [...prev];
        const dragIdx = copy.findIndex((c) => c.id === draggingCardId);
        if (dragIdx === -1) return prev;
        const [dragged] = copy.splice(dragIdx, 1);
        dragged.phaseId = targetPhaseId;

        if (dropTarget?.beforeCardId) {
          const targetIdx = copy.findIndex(
            (c) => c.id === dropTarget.beforeCardId,
          );
          if (targetIdx !== -1) {
            copy.splice(targetIdx, 0, dragged);
          } else {
            copy.push(dragged);
          }
        } else {
          copy.push(dragged);
        }
        return copy;
      });
      setDraggingCardId(null);
      setDropTarget(null);
    },
    [draggingCardId, dropTarget],
  );

  // ── Form helpers ──────────────────────────────────────────────────────────
  const toggleFormOwner = (name: string) =>
    setForm((f) => ({
      ...f,
      selectedOwners: f.selectedOwners.includes(name)
        ? f.selectedOwners.filter((o) => o !== name)
        : [...f.selectedOwners, name],
    }));

  const addFormTag = () => {
    const t = form.tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !form.tags.includes(t))
      setForm((f) => ({ ...f, tags: [...f.tags, t], tagInput: '' }));
    else setForm((f) => ({ ...f, tagInput: '' }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setForm((f) => ({
          ...f,
          assets: [
            ...f.assets,
            {
              name: file.name,
              dataUrl: ev.target?.result as string,
              type: file.type,
            },
          ],
        }));
      reader.readAsDataURL(file);
    });
  };

  // ── Toggle filter ─────────────────────────────────────────────────────────
  const toggleStatusFilter = (s: StatusValue) =>
    setFilters((f) => ({
      ...f,
      statuses: f.statuses.includes(s)
        ? f.statuses.filter((x) => x !== s)
        : [...f.statuses, s],
    }));
  const toggleOwnerFilter = (id: string) =>
    setFilters((f) => ({
      ...f,
      ownerIds: f.ownerIds.includes(id)
        ? f.ownerIds.filter((x) => x !== id)
        : [...f.ownerIds, id],
    }));

  // ── Style helpers ─────────────────────────────────────────────────────────
  const inputSx = {
    width: '100%',
    padding: '7px 10px',
    fontSize: '0.8rem',
    border: '1px solid var(--card-border)',
    borderRadius: '8px',
    background: 'var(--card)',
    color: 'var(--foreground)',
    outline: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxSizing: 'border-box' as const,
    '&:focus': { borderColor: 'var(--accent)' },
  };
  const labelSx = {
    fontSize: '0.68rem',
    fontWeight: 600,
    color: 'var(--foreground-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    display: 'block',
    mb: 0.75,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };
  const secSx = { mb: 1.75 };
  const tabBtnSx = (active: boolean) => ({
    flex: 1,
    padding: '7px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.74rem',
    fontWeight: 600,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    borderRadius: '7px',
    transition: 'all .15s',
    background: active ? 'var(--accent-muted)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--foreground-muted)',
  });

  // ── Active filters count ──────────────────────────────────────────────────
  const activeFilterCount =
    (filters.statuses.length || 0) +
    (filters.ownerIds.length || 0) +
    (filters.search ? 1 : 0);

  // ── Render ────────────────────────────────────────────────────────────────
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
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid var(--card-border)' }}>
        <span className="section-label">Tool · Productivity</span>
        {editingTitle ? (
          <Box
            component="input"
            autoFocus
            value={roadmapTitle}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRoadmapTitle(e.target.value)
            }
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e: React.KeyboardEvent) =>
              e.key === 'Enter' && setEditingTitle(false)
            }
            sx={{
              ...inputSx,
              fontSize: '1.5rem',
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              border: '1px solid var(--accent)',
              mb: 0.5,
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
            }}
            onClick={() => setEditingTitle(true)}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              {roadmapTitle}
            </Typography>
            <Box
              sx={{
                color: 'var(--foreground-muted)',
                opacity: 0.6,
                display: 'flex',
              }}
            >
              <IconEdit />
            </Box>
          </Box>
        )}
        {/* Global stats strip */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          {[
            {
              label: 'Total',
              value: stats.total,
              color: 'var(--foreground-muted)',
            },
            { label: '✅ Done', value: stats.done, color: '#22C55E' },
            {
              label: '🔄 In progress',
              value: stats.progress,
              color: '#3B82F6',
            },
            { label: '🔴 Blocked', value: stats.blocked, color: '#EF4444' },
            {
              label: 'Completion',
              value: `${stats.pct}%`,
              color: 'var(--accent)',
            },
          ].map(({ label, value, color }) => (
            <Box
              key={label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '20px',
                border: '1px solid var(--card-border)',
                background: 'var(--card)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  color: 'var(--foreground-muted)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {label}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {value}
              </Typography>
            </Box>
          ))}
          {/* Export button */}
          <Box
            component="button"
            onClick={handleExport}
            sx={{
              ml: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 12px',
              borderRadius: '20px',
              border: '1px solid var(--card-border)',
              background: 'var(--card)',
              cursor: 'pointer',
              color: 'var(--foreground-muted)',
              fontSize: '0.7rem',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              transition: 'all .15s',
              '&:hover': {
                borderColor: 'var(--accent)',
                color: 'var(--accent)',
              },
            }}
          >
            <IconExport /> Export JSON
          </Box>
        </Box>
      </Box>

      {/* ── Main two-panel layout ────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 2.5, flex: 1, minHeight: 0 }}>
        {/* ── LEFT PANEL ──────────────────────────────────────────────────────── */}
        <Box
          sx={{
            width: 290,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid var(--card-border)',
            borderRadius: '14px',
            background: 'var(--card)',
            overflow: 'hidden',
          }}
        >
          {/* Tab bar */}
          <Box
            sx={{
              display: 'flex',
              gap: '4px',
              padding: '8px',
              borderBottom: '1px solid var(--card-border)',
              flexShrink: 0,
            }}
          >
            <Box
              component="button"
              onClick={() => setLeftTab('card')}
              sx={tabBtnSx(leftTab === 'card')}
            >
              ✚ Carte
            </Box>
            <Box
              component="button"
              onClick={() => setLeftTab('team')}
              sx={tabBtnSx(leftTab === 'team')}
            >
              👥 Équipe
            </Box>
            <Box
              component="button"
              onClick={() => setLeftTab('filters')}
              sx={{ ...tabBtnSx(leftTab === 'filters'), position: 'relative' }}
            >
              ⚡ Filtres
              {activeFilterCount > 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 3,
                    right: 3,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  {activeFilterCount}
                </Box>
              )}
            </Box>
          </Box>

          {/* Tab content */}
          <Box sx={{ overflowY: 'auto', px: 2.5, py: 2, flex: 1 }}>
            {/* ── ADD CARD TAB ── */}
            {leftTab === 'card' && (
              <>
                {/* Phase selector */}
                <Box sx={secSx}>
                  <Typography component="label" sx={labelSx}>
                    Phase
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '6px' }}>
                    <Box
                      component="select"
                      value={form.phaseId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setForm((f) => ({ ...f, phaseId: e.target.value }))
                      }
                      sx={{ ...inputSx, flex: 1 }}
                    >
                      {sortedPhases.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Box>
                    <Box
                      component="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          showNewPhase: !f.showNewPhase,
                        }))
                      }
                      sx={{
                        padding: '6px 10px',
                        border: '1px solid var(--card-border)',
                        borderRadius: '8px',
                        background: 'var(--card)',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        color: 'var(--foreground-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        '&:hover': {
                          borderColor: 'var(--accent)',
                          color: 'var(--accent)',
                        },
                      }}
                      title="Nouvelle phase"
                    >
                      +
                    </Box>
                  </Box>
                  {form.showNewPhase && (
                    <Box sx={{ display: 'flex', gap: '6px', mt: 1 }}>
                      <Box
                        component="input"
                        value={form.newPhaseName}
                        placeholder="Nom de la phase…"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setForm((f) => ({
                            ...f,
                            newPhaseName: e.target.value,
                          }))
                        }
                        onKeyDown={(e: React.KeyboardEvent) =>
                          e.key === 'Enter' && handleAddPhase()
                        }
                        sx={{ ...inputSx, flex: 1 }}
                      />
                      <Box
                        component="button"
                        onClick={handleAddPhase}
                        sx={{
                          padding: '6px 12px',
                          background: 'var(--accent-muted)',
                          border: '1px solid var(--accent)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          color: 'var(--accent)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        Add
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Title */}
                <Box sx={secSx}>
                  <Typography component="label" sx={labelSx}>
                    Titre *
                  </Typography>
                  <Box
                    component="input"
                    value={form.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' && form.title.trim())
                        handleAddCard();
                    }}
                    placeholder="e.g. MAAP MCP fallback…"
                    sx={inputSx}
                  />
                </Box>

                {/* Description */}
                <Box sx={secSx}>
                  <Typography component="label" sx={labelSx}>
                    Description
                  </Typography>
                  <Box
                    component="textarea"
                    value={form.description}
                    rows={3}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Décrivez la tâche…"
                    sx={{ ...inputSx, resize: 'vertical', lineHeight: 1.55 }}
                  />
                </Box>

                {/* Status */}
                <Box sx={secSx}>
                  <Typography component="label" sx={labelSx}>
                    Statut
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {STATUS_OPTIONS.map((s) => (
                      <Box
                        key={s.value}
                        component="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, status: s.value }))
                        }
                        sx={{
                          padding: '4px 9px',
                          fontSize: '0.73rem',
                          borderRadius: '7px',
                          cursor: 'pointer',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          transition: 'all .12s',
                          fontWeight: form.status === s.value ? 600 : 400,
                          border:
                            form.status === s.value
                              ? `1.5px solid ${s.color}`
                              : '1px solid var(--card-border)',
                          background:
                            form.status === s.value
                              ? `${s.color}22`
                              : 'var(--card)',
                          color:
                            form.status === s.value
                              ? s.color
                              : 'var(--foreground-muted)',
                        }}
                      >
                        {s.icon} {s.label}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Priority */}
                <Box sx={secSx}>
                  <Typography component="label" sx={labelSx}>
                    Priorité
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {PRIORITY_OPTIONS.map((p) => (
                      <Box
                        key={p.value}
                        component="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, priority: p.value }))
                        }
                        sx={{
                          padding: '4px 9px',
                          fontSize: '0.73rem',
                          borderRadius: '7px',
                          cursor: 'pointer',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          transition: 'all .12s',
                          fontWeight: form.priority === p.value ? 600 : 400,
                          border:
                            form.priority === p.value
                              ? `1.5px solid ${p.color}`
                              : '1px solid var(--card-border)',
                          background:
                            form.priority === p.value
                              ? `${p.color}22`
                              : 'var(--card)',
                          color:
                            form.priority === p.value
                              ? p.color
                              : 'var(--foreground-muted)',
                        }}
                      >
                        {p.label}
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Owners */}
                <Box sx={secSx}>
                  <Typography component="label" sx={labelSx}>
                    Owners
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {owners.map((o) => {
                      const sel = form.selectedOwners.includes(o.name);
                      return (
                        <Box
                          key={o.name}
                          component="button"
                          onClick={() => toggleFormOwner(o.name)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            fontSize: '0.74rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            transition: 'all .12s',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            border: sel
                              ? `1.5px solid ${o.color}`
                              : '1px solid var(--card-border)',
                            background: sel ? `${o.color}18` : 'var(--card)',
                            color: sel ? o.color : 'var(--foreground-muted)',
                          }}
                        >
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              background: o.color,
                            }}
                          />
                          {o.name}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* Tags */}
                <Box sx={secSx}>
                  <Typography component="label" sx={labelSx}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: '6px' }}>
                    <Box
                      component="input"
                      value={form.tagInput}
                      placeholder="Tag…"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setForm((f) => ({ ...f, tagInput: e.target.value }))
                      }
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          addFormTag();
                        }
                      }}
                      sx={{ ...inputSx, flex: 1 }}
                    />
                    <Box
                      component="button"
                      onClick={addFormTag}
                      sx={{
                        padding: '7px 10px',
                        borderRadius: '8px',
                        background: 'var(--accent-muted)',
                        border: '1px solid var(--accent)',
                        cursor: 'pointer',
                        color: 'var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      <IconPlus />
                    </Box>
                  </Box>
                  {form.tags.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        mt: 0.75,
                      }}
                    >
                      {form.tags.map((tag) => (
                        <Box
                          key={tag}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: 'var(--accent-muted)',
                            border: '1px solid var(--accent)',
                            color: 'var(--accent)',
                            fontSize: '0.68rem',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          #{tag}
                          <Box
                            component="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                tags: f.tags.filter((t) => t !== tag),
                              }))
                            }
                            sx={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'inherit',
                              display: 'flex',
                              alignItems: 'center',
                              p: 0,
                              opacity: 0.7,
                              '&:hover': { opacity: 1 },
                            }}
                          >
                            <IconX size={8} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Assets */}
                <Box sx={secSx}>
                  <Typography component="label" sx={labelSx}>
                    Assets (images)
                  </Typography>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <Box
                    component="button"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      width: '100%',
                      padding: '9px',
                      border: '1px dashed var(--card-border)',
                      borderRadius: '8px',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--foreground-muted)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      '&:hover': {
                        borderColor: 'var(--accent)',
                        color: 'var(--accent)',
                      },
                    }}
                  >
                    ⬆ Upload images
                  </Box>
                  {form.assets.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        mt: 1,
                      }}
                    >
                      {form.assets.map((a, i) => (
                        <Box key={i} sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={a.dataUrl}
                            alt={a.name}
                            sx={{
                              width: 48,
                              height: 48,
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid var(--card-border)',
                              display: 'block',
                            }}
                          />
                          <Box
                            component="button"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                assets: f.assets.filter((_, idx) => idx !== i),
                              }))
                            }
                            sx={{
                              position: 'absolute',
                              top: -4,
                              right: -4,
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: '#ef4444',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '11px',
                            }}
                          >
                            ×
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Submit */}
                <Box
                  component="button"
                  onClick={handleAddCard}
                  disabled={!form.title.trim()}
                  sx={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    background: form.title.trim()
                      ? 'var(--accent-muted)'
                      : 'transparent',
                    color: form.title.trim()
                      ? 'var(--accent)'
                      : 'var(--foreground-muted)',
                    border: form.title.trim()
                      ? '1.5px solid var(--accent)'
                      : '1px solid var(--card-border)',
                    cursor: form.title.trim() ? 'pointer' : 'default',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: 'all .15s',
                  }}
                >
                  + Ajouter la carte
                </Box>
              </>
            )}

            {/* ── TEAM TAB ── */}
            {leftTab === 'team' && (
              <>
                <Typography component="label" sx={{ ...labelSx, mb: 1.5 }}>
                  Membres de l&apos;équipe
                </Typography>
                <ManageOwnersPanel
                  owners={owners}
                  onAddOwner={handleAddOwner}
                  onDeleteOwner={handleDeleteOwner}
                  onUpdateOwner={handleUpdateOwner}
                />
              </>
            )}

            {/* ── FILTERS TAB ── */}
            {leftTab === 'filters' && (
              <>
                {/* Search */}
                <Box sx={{ ...secSx, position: 'relative' }}>
                  <Typography component="label" sx={labelSx}>
                    Recherche
                  </Typography>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 9,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--foreground-muted)',
                        display: 'flex',
                      }}
                    >
                      <IconSearch />
                    </Box>
                    <Box
                      component="input"
                      value={filters.search}
                      placeholder="Titre, description, tag…"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFilters((f) => ({ ...f, search: e.target.value }))
                      }
                      sx={{ ...inputSx, pl: '30px' }}
                    />
                  </Box>
                </Box>

                {/* Status filter */}
                <Box sx={secSx}>
                  <Typography component="label" sx={labelSx}>
                    Statut
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {STATUS_OPTIONS.map((s) => {
                      const active = filters.statuses.includes(s.value);
                      return (
                        <Box
                          key={s.value}
                          component="button"
                          onClick={() => toggleStatusFilter(s.value)}
                          sx={{
                            padding: '4px 9px',
                            fontSize: '0.73rem',
                            borderRadius: '7px',
                            cursor: 'pointer',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            transition: 'all .12s',
                            fontWeight: active ? 600 : 400,
                            border: active
                              ? `1.5px solid ${s.color}`
                              : '1px solid var(--card-border)',
                            background: active ? `${s.color}22` : 'var(--card)',
                            color: active ? s.color : 'var(--foreground-muted)',
                          }}
                        >
                          {s.icon} {s.label}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* Owner filter */}
                <Box sx={secSx}>
                  <Typography component="label" sx={labelSx}>
                    Owner
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {owners.map((o) => {
                      const active = filters.ownerIds.includes(o.id);
                      return (
                        <Box
                          key={o.id}
                          component="button"
                          onClick={() => toggleOwnerFilter(o.id)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            fontSize: '0.74rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            transition: 'all .12s',
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            border: active
                              ? `1.5px solid ${o.color}`
                              : '1px solid var(--card-border)',
                            background: active ? `${o.color}18` : 'var(--card)',
                            color: active ? o.color : 'var(--foreground-muted)',
                          }}
                        >
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              background: o.color,
                            }}
                          />
                          {o.name}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* Clear filters */}
                {activeFilterCount > 0 && (
                  <Box
                    component="button"
                    onClick={() =>
                      setFilters({ search: '', statuses: [], ownerIds: [] })
                    }
                    sx={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      border: '1px solid var(--card-border)',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: 'var(--foreground-muted)',
                      fontSize: '0.75rem',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: 'all .15s',
                      '&:hover': { borderColor: '#ef4444', color: '#ef4444' },
                    }}
                  >
                    Effacer les filtres ({activeFilterCount})
                  </Box>
                )}

                {/* Legend */}
                <Box
                  sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: '1px solid var(--card-border)',
                  }}
                >
                  <Typography
                    component="label"
                    sx={{ ...labelSx, mt: 1.5, mb: 1 }}
                  >
                    Priorités
                  </Typography>
                  {PRIORITY_OPTIONS.map((p) => (
                    <Box
                      key={p.value}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 0.75,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '2px',
                          background: p.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.74rem',
                          color: 'var(--foreground-muted)',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {p.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────────────── */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            borderRadius: '14px',
            border: '1px solid var(--card-border)',
            background: 'var(--card)',
            padding: '20px 24px',
          }}
        >
          {/* Inline search bar (right panel quick filter) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                letterSpacing: '-0.02em',
                flex: 1,
              }}
            >
              {roadmapTitle}
            </Typography>
            <Box sx={{ position: 'relative', width: 200 }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--foreground-muted)',
                  display: 'flex',
                  pointerEvents: 'none',
                }}
              >
                <IconSearch />
              </Box>
              <Box
                component="input"
                value={filters.search}
                placeholder="Rechercher…"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                sx={{
                  width: '100%',
                  padding: '6px 10px 6px 28px',
                  fontSize: '0.75rem',
                  boxSizing: 'border-box',
                  border: '1px solid var(--card-border)',
                  borderRadius: '20px',
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  outline: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  '&:focus': { borderColor: 'var(--accent)' },
                }}
              />
            </Box>
            {/* Global completion bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 120,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: '2px',
                  background: 'var(--card-border)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${stats.pct}%`,
                    background: 'var(--accent)',
                    borderRadius: '2px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  minWidth: 30,
                  textAlign: 'right',
                }}
              >
                {stats.pct}%
              </Typography>
            </Box>
          </Box>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '5px', mb: 2 }}>
              {filters.search && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 9px',
                    borderRadius: '12px',
                    background: 'var(--accent-muted)',
                    border: '1px solid var(--accent)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      color: 'var(--accent)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {filters.search}
                  </Typography>
                  <Box
                    component="button"
                    onClick={() => setFilters((f) => ({ ...f, search: '' }))}
                    sx={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--accent)',
                      display: 'flex',
                      p: 0,
                    }}
                  >
                    <IconX size={9} />
                  </Box>
                </Box>
              )}
              {filters.statuses.map((s) => {
                const st = getStatus(s);
                return (
                  <Box
                    key={s}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 9px',
                      borderRadius: '12px',
                      background: `${st.color}22`,
                      border: `1px solid ${st.color}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: st.color,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {st.icon} {st.label}
                    </Typography>
                    <Box
                      component="button"
                      onClick={() => toggleStatusFilter(s)}
                      sx={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: st.color,
                        display: 'flex',
                        p: 0,
                      }}
                    >
                      <IconX size={9} />
                    </Box>
                  </Box>
                );
              })}
              {filters.ownerIds.map((id) => {
                const o = owners.find((ow) => ow.id === id);
                if (!o) return null;
                return (
                  <Box
                    key={id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 9px',
                      borderRadius: '12px',
                      background: `${o.color}22`,
                      border: `1px solid ${o.color}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: o.color,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {o.name}
                    </Typography>
                    <Box
                      component="button"
                      onClick={() => toggleOwnerFilter(id)}
                      sx={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: o.color,
                        display: 'flex',
                        p: 0,
                      }}
                    >
                      <IconX size={9} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Phases */}
          {sortedPhases.map((phase, idx) => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              allPhases={sortedPhases}
              cards={cards.filter((c) => c.phaseId === phase.id)}
              filteredCards={filteredCardsMap[phase.id] ?? []}
              owners={owners}
              collapsed={collapsedPhases.has(phase.id)}
              dropTarget={dropTarget}
              draggingCardId={draggingCardId}
              isFirstPhase={idx === 0}
              isLastPhase={idx === sortedPhases.length - 1}
              onCollapse={() => toggleCollapse(phase.id)}
              onDelete={() => setDeletingPhase(phase)}
              onRename={(name) => handleRenamePhase(phase.id, name)}
              onMoveUp={() => handleMovePhase(phase.id, 'up')}
              onMoveDown={() => handleMovePhase(phase.id, 'down')}
              onDeleteCard={handleDeleteCard}
              onEditCard={setEditingCard}
              onDuplicateCard={handleDuplicateCard}
              onCardDragStart={handleCardDragStart}
              onCardDragEnd={handleCardDragEnd}
              onCardDragOver={handleCardDragOver}
              onPhaseDragOver={handlePhaseDragOver}
              onDrop={handleDrop}
            />
          ))}

          {sortedPhases.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography
                sx={{
                  fontSize: '0.9rem',
                  color: 'var(--foreground-muted)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontStyle: 'italic',
                }}
              >
                Aucune phase — ajoutez-en depuis le panneau gauche.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Modals ── */}
      {editingCard && (
        <EditCardModal
          card={editingCard}
          phases={sortedPhases}
          owners={owners}
          onSave={handleUpdateCard}
          onClose={() => setEditingCard(null)}
          fileInputRef={editFileInputRef}
        />
      )}

      {deletingPhase && (
        <DeletePhaseModal
          phase={deletingPhase}
          cardsCount={
            cards.filter((c) => c.phaseId === deletingPhase.id).length
          }
          otherPhases={sortedPhases.filter((p) => p.id !== deletingPhase.id)}
          onDeleteAll={() => handleDeletePhase(deletingPhase)}
          onReassign={(targetId) => handleDeletePhase(deletingPhase, targetId)}
          onCancel={() => setDeletingPhase(null)}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </Container>
  );
}
