'use client';

import { createContext, useContext, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Close, ChatBubbleOutline, MusicNote, Tune } from '@mui/icons-material';
import FloatingChat from './floating-chat';
import MediaPlayer from './media_player';
import BackendStatus from './backend_status_checker';
import CookieStatusChecker from './cookie_status_checker';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import './site-tools.css';

type Panel = 'chat' | 'music' | 'settings';
const ToolsContext = createContext<(() => void) | null>(null);
export const useSiteTools = () => useContext(ToolsContext);

export default function SiteToolsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>('chat');
  const mobile = useMediaQuery('(max-width:600px)');
  const pathname = usePathname();
  const { hasConsent, giveConsent, denyConsent } = useCookieConsent();
  const close = () => setOpen(false);

  return (
    <ToolsContext.Provider value={() => setOpen(true)}>
      {children}
      <Drawer
        anchor={mobile ? 'bottom' : 'right'}
        open={open}
        onClose={close}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          className: 'site-tools',
          role: 'dialog',
          'aria-label': 'Site tools',
          'aria-modal': true,
        }}
      >
        <div className="site-tools-heading">
          <div>
            <h2>Site tools</h2>
            <p>A little more from this portfolio.</p>
          </div>
          <IconButton
            onClick={close}
            aria-label="Close site tools"
            sx={{ color: 'var(--foreground)' }}
          >
            <Close />
          </IconButton>
        </div>
        <Tabs
          value={panel}
          onChange={(_, value: Panel) => setPanel(value)}
          variant="fullWidth"
          aria-label="Site tools"
          sx={{
            flexShrink: 0,
            borderBottom: '1px solid var(--card-border)',
            '& .MuiTab-root': {
              color: 'var(--foreground-muted)',
              minHeight: 56,
              textTransform: 'none',
            },
            '& .Mui-selected': { color: 'var(--accent) !important' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--accent)' },
          }}
        >
          <Tab
            value="chat"
            id="tools-tab-chat"
            aria-controls="tools-chat"
            icon={<ChatBubbleOutline fontSize="small" />}
            iconPosition="start"
            label="Chat"
          />
          <Tab
            value="music"
            id="tools-tab-music"
            aria-controls="tools-music"
            icon={<MusicNote fontSize="small" />}
            iconPosition="start"
            label="Music"
          />
          <Tab
            value="settings"
            id="tools-tab-settings"
            aria-controls="tools-settings"
            icon={<Tune fontSize="small" />}
            iconPosition="start"
            label="Settings"
          />
        </Tabs>
        <section
          className="tools-panel tools-chat"
          id="tools-chat"
          role="tabpanel"
          aria-labelledby="tools-tab-chat"
          hidden={panel !== 'chat'}
        >
          {pathname.startsWith('/projects/chatbot') ? (
            <div className="tools-copy">
              <h3>Your chat is already open</h3>
              <p>Continue the conversation on the page.</p>
              <button className="tools-action" onClick={close}>
                Back to conversation
              </button>
            </div>
          ) : (
            <FloatingChat
              embedded
              active={open && panel === 'chat'}
              onClose={close}
            />
          )}
        </section>
        <section
          className="tools-panel"
          id="tools-music"
          role="tabpanel"
          aria-labelledby="tools-tab-music"
          hidden={panel !== 'music'}
        >
          <div className="tools-copy">
            <h3>Made for listening</h3>
            <p>
              Explore the electronic music I produce. Playback continues when
              you close this panel.
            </p>
          </div>
          <MediaPlayer embedded />
          <Link
            className="tools-action"
            href="/projects/media_player"
            onClick={close}
          >
            Browse the full music library ↗
          </Link>
        </section>
        <section
          className="tools-panel"
          id="tools-settings"
          role="tabpanel"
          aria-labelledby="tools-tab-settings"
          hidden={panel !== 'settings'}
        >
          <div className="tools-copy">
            <h3>Connection & privacy</h3>
            <p>Service status and your analytics preference.</p>
          </div>
          <BackendStatus />
          <CookieStatusChecker />
          <div className="tools-copy">
            <h3>Optional analytics</h3>
            <p>
              Allow anonymous usage analytics to help improve this site. You can
              change your choice here at any time.
            </p>
          </div>
          <div className="tools-preferences">
            <button
              className="tools-action"
              onClick={denyConsent}
              aria-pressed={!hasConsent}
            >
              Keep analytics off
            </button>
            <button
              className="tools-action"
              onClick={giveConsent}
              aria-pressed={hasConsent}
            >
              Allow analytics
            </button>
          </div>
          <Link className="tools-link" href="/privacy" onClick={close}>
            Read the privacy policy ↗
          </Link>
        </section>
      </Drawer>
    </ToolsContext.Provider>
  );
}
