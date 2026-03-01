// components/media_player.tsx
'use client';

import './media_player.css';
import { useEffect, useState } from 'react';
import { Pause, Play, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import player, {
  usePlayerState,
  useCurrentTime,
} from './media_player/libs/player';
import { tracks } from './media_player/consts';

const MediaPlayer = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const state = usePlayerState();
  const currentTime = useCurrentTime();

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    player.setQueue(tracks);
  }, []);

  if (!mounted) return null;

  const { currentTrack, playing, duration } = state;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isVideo = currentTrack?.url?.match(/\.(mp4|webm|mov|avi)$/i);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    playing ? player.pause() : player.play();
  };

  return (
    <div className={`mp-widget ${open ? 'open' : ''}`}>
      <div
        className={`mp-pill ${open ? 'open' : ''} ${playing ? 'playing' : ''}`}
        onClick={() => setOpen((v) => !v)}
        title={open ? 'Collapse player' : 'Open player'}
      >
        {/* Equalizer bars */}
        <div className="mp-bars">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        {/* Track info */}
        <div className="mp-pill-info">
          <span className="mp-pill-title">
            {currentTrack?.title ?? 'No track'}
          </span>
          <span className="mp-pill-sub">
            {isVideo ? '▶ Video' : playing ? 'Now playing' : 'Paused'}
          </span>
        </div>

        {/* Open in full player link */}
        <Link
          href="/projects/media_player"
          className="mp-pill-link-btn"
          onClick={(e) => e.stopPropagation()}
          title="Open full player"
          aria-label="Open full player"
        >
          <ExternalLink size={11} strokeWidth={2.5} />
        </Link>

        {/* Play/pause */}
        <button
          className="mp-pill-btn"
          onClick={handlePlayPause}
          aria-label="Play/pause"
        >
          {playing ? (
            <Pause size={12} strokeWidth={2.5} />
          ) : (
            <Play size={12} strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Thin progress bar */}
      <div className="mp-progress-bar" style={{ width: open ? 300 : 44 }}>
        <div className="mp-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default MediaPlayer;
