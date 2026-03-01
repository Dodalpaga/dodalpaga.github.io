// Shared UI constants for project pages

export const projectInputSx = {
  '& .MuiOutlinedInput-root': {
    color: 'var(--foreground)',
    backgroundColor: 'var(--card)',
    borderRadius: '10px',
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.85rem',
    '& fieldset': { borderColor: 'var(--card-border)' },
    '&:hover fieldset': { borderColor: 'var(--accent)' },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--accent)',
      borderWidth: '1.5px',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'var(--foreground-muted)',
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.82rem',
  },
  '& .MuiFormHelperText-root': {
    fontFamily: "'DM Mono', monospace",
    fontSize: '0.72rem',
    color: 'var(--foreground-muted)',
  },
};

export const projectSelectSx = {
  color: 'var(--foreground)',
  fontFamily: "'DM Mono', monospace",
  fontSize: '0.85rem',
  borderRadius: '10px',
  backgroundColor: 'var(--card)',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--card-border)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--accent)',
  },
  '& .MuiSvgIcon-root': { color: 'var(--foreground-muted)' },
};

export const projectButtonSx = {
  fontFamily: "'DM Mono', monospace",
  fontSize: '0.8rem',
  letterSpacing: '0.06em',
  textTransform: 'none',
  borderRadius: '10px',
  padding: '8px 20px',
  backgroundColor: 'var(--accent)',
  color: '#fff',
  border: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'var(--accent-hover)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 16px var(--accent-muted)',
  },
  '&:disabled': {
    backgroundColor: 'var(--background-2)',
    color: 'var(--foreground-muted)',
    transform: 'none',
  },
};

export const projectOutlinedButtonSx = {
  fontFamily: "'DM Mono', monospace",
  fontSize: '0.8rem',
  letterSpacing: '0.04em',
  textTransform: 'none',
  borderRadius: '10px',
  padding: '8px 20px',
  color: 'var(--foreground-muted)',
  borderColor: 'var(--card-border)',
  '&:hover': {
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
    backgroundColor: 'var(--accent-muted)',
  },
};

export const projectPaperSx = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--card-border)',
  borderRadius: '14px',
  boxShadow: 'var(--card-shadow)',
  overflow: 'hidden',
};

export const projectCardSx = {
  backgroundColor: 'var(--card)',
  color: 'var(--foreground)',
  border: '1px solid var(--card-border)',
  borderRadius: '14px',
  boxShadow: 'var(--card-shadow)',
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  '&:hover': {
    boxShadow: 'var(--card-shadow-hover)',
    transform: 'translateY(-2px)',
  },
};
