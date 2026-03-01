// app/projects/media_player/content.tsx
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Container from '@mui/material/Container';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Film,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import player, {
  usePlayerState,
  useCurrentTime,
} from '@/components/media_player/libs/player';
import { tracks } from '@/components/media_player/consts';
import './styles.css';

// ── Helpers ───────────────────────────────────────────────────────────────
const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
const fmt = (s: number) => `${pad(s / 60)}:${pad(s % 60)}`;
const isVideoUrl = (url: string) => /\.(mp4|webm|mov|avi)$/i.test(url);

// ── Draggable slider ──────────────────────────────────────────────────────
function Scrubber({
  value,
  onChange,
  className = '',
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const seek = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;
      const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onChange(v);
    },
    [onChange],
  );

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    seek(e);
    const onMove = (ev: MouseEvent) => seek(ev);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      ref={trackRef}
      className={`fp-slider-track ${className}`}
      onMouseDown={onMouseDown}
    >
      <div className="fp-slider-fill" style={{ width: `${value * 100}%` }} />
    </div>
  );
}

// ── Inline Video Panel ────────────────────────────────────────────────────
function VideoPanel({ isPlaying }: { isPlaying: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const videoEl = player.getElement();
    if (!videoEl) return;

    // Move the shared <video> element into our container
    videoEl.remove();
    videoEl.style.width = '100%';
    videoEl.style.height = '100%';
    videoEl.style.objectFit = 'contain';
    videoEl.style.borderRadius = '12px';
    videoEl.style.display = 'block';
    container.appendChild(videoEl);

    return () => {
      // Return element to body (detached) when unmounting
      if (container.contains(videoEl)) {
        container.removeChild(videoEl);
      }
      document.body.appendChild(videoEl);
      videoEl.style.display = 'none';
    };
  }, []);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div className="fp-video-wrap">
      <div ref={containerRef} className="fp-video-container" />
      <button
        className="fp-video-fullscreen-btn"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>
      {!isPlaying && (
        <div className="fp-video-paused-overlay">
          <Film size={32} strokeWidth={1} />
        </div>
      )}
    </div>
  );
}

// ── Full player ───────────────────────────────────────────────────────────
export default function Content() {
  const state = usePlayerState();
  const currentTime = useCurrentTime();
  const [volume, setVolume] = useState(player.volume?.() ?? 1);
  const [muted, setMuted] = useState(false);
  const prevVol = useRef(volume);

  // Boot queue once
  useEffect(() => {
    player.setQueue(tracks);
  }, []);

  const {
    currentTrack,
    playing,
    duration,
    currentTrackIndex,
    tracks: queueTracks,
  } = state;

  const progress = duration > 0 ? currentTime / duration : 0;
  const isVideo = currentTrack ? isVideoUrl(currentTrack.url) : false;

  const handleSeek = (v: number) => player.seek(duration * v);

  const handleVolume = (v: number) => {
    setVolume(v);
    setMuted(v === 0);
    player.volume?.(v);
  };

  const toggleMute = () => {
    if (muted) {
      setMuted(false);
      const restore = prevVol.current || 0.7;
      setVolume(restore);
      player.volume?.(restore);
    } else {
      prevVol.current = volume;
      setMuted(true);
      setVolume(0);
      player.volume?.(0);
    }
  };

  const prevTrack = () => {
    if (currentTrackIndex > 0) player.playTrack(currentTrackIndex - 1);
  };
  const nextTrack = () => {
    if (currentTrackIndex < queueTracks.length - 1)
      player.playTrack(currentTrackIndex + 1);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        playing ? player.pause() : player.play();
      }
      if (e.code === 'ArrowRight')
        player.seek(Math.min(currentTime + 5, duration));
      if (e.code === 'ArrowLeft') player.seek(Math.max(currentTime - 5, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [playing, currentTime, duration]);

  return (
    <Container
      maxWidth={false}
      sx={{ height: '100%', padding: '0 !important', overflow: 'hidden' }}
    >
      <div className="full-player">
        {/* Atmospheric blurred bg */}
        <div className="fp-bg">
          {!isVideo && currentTrack?.coverUrl && (
            <div
              className="fp-bg-img"
              style={{ backgroundImage: `url(${currentTrack.coverUrl})` }}
            />
          )}
          {isVideo && <div className="fp-bg-video-overlay" />}
        </div>

        {/* ── Left: cover/video + controls ── */}
        <div className="fp-left">
          {/* Media display: video or album art */}
          {isVideo ? (
            <VideoPanel isPlaying={playing} />
          ) : (
            <div className="fp-cover-wrap">
              {currentTrack?.coverUrl ? (
                <img
                  className="fp-cover-img"
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                />
              ) : (
                <div className="fp-cover-placeholder">
                  <Music size={64} strokeWidth={1} />
                </div>
              )}
            </div>
          )}

          {/* Track title + type badge */}
          <div className="fp-identity">
            <div className="fp-title-row">
              <p className="fp-track-title">
                {currentTrack?.title ?? 'No track selected'}
              </p>
              {isVideo && (
                <span className="fp-media-badge">
                  <Film size={10} />
                  VIDEO
                </span>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="fp-progress">
            <div className="fp-time-row">
              <span className="fp-time">{fmt(currentTime)}</span>
              <span className="fp-time">{fmt(duration)}</span>
            </div>
            <Scrubber value={progress} onChange={handleSeek} />
          </div>

          {/* Controls */}
          <div className="fp-controls">
            <button
              className="fp-ctrl-btn"
              onClick={prevTrack}
              disabled={currentTrackIndex === 0}
              aria-label="Previous"
            >
              <SkipBack size={17} strokeWidth={2} />
            </button>

            <button
              className="fp-ctrl-btn primary"
              onClick={() => (playing ? player.pause() : player.play())}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <Pause size={20} strokeWidth={2} fill="currentColor" />
              ) : (
                <Play size={20} strokeWidth={2} fill="currentColor" />
              )}
            </button>

            <button
              className="fp-ctrl-btn"
              onClick={nextTrack}
              disabled={currentTrackIndex >= queueTracks.length - 1}
              aria-label="Next"
            >
              <SkipForward size={17} strokeWidth={2} />
            </button>
          </div>

          {/* Volume */}
          <div className="fp-volume">
            <button
              onClick={toggleMute}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                display: 'flex',
              }}
              aria-label="Mute"
            >
              {muted || volume === 0 ? (
                <VolumeX size={15} />
              ) : (
                <Volume2 size={15} />
              )}
            </button>
            <div
              className="fp-vol-track"
              onMouseDown={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                const seek = (ev: MouseEvent | React.MouseEvent) => {
                  const rect = el.getBoundingClientRect();
                  handleVolume(
                    Math.max(
                      0,
                      Math.min(1, (ev.clientX - rect.left) / rect.width),
                    ),
                  );
                };
                seek(e as any);
                const move = (ev: MouseEvent) => seek(ev);
                const up = () => {
                  window.removeEventListener('mousemove', move);
                  window.removeEventListener('mouseup', up);
                };
                window.addEventListener('mousemove', move);
                window.addEventListener('mouseup', up);
              }}
            >
              <div
                className="fp-vol-fill"
                style={{ width: `${(muted ? 0 : volume) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="fp-divider" />

        {/* ── Right: playlist ── */}
        <div className="fp-right">
          <div className="fp-playlist-header">
            <span className="fp-playlist-title">Playlist</span>
            <span className="fp-playlist-count">
              {queueTracks.length} tracks
            </span>
          </div>

          <div className="fp-track-list">
            {queueTracks.map((track, i) => {
              const isActive = i === currentTrackIndex;
              const isPlaying = isActive && playing;
              const trackIsVideo = isVideoUrl(track.url);

              return (
                <div
                  key={track.url}
                  className={`fp-track-row${isActive ? ' active' : ''}`}
                  onClick={() => {
                    if (isActive) {
                      playing ? player.pause() : player.play();
                    } else {
                      player.playTrack(i);
                    }
                  }}
                >
                  <span className="fp-track-num">{i + 1}</span>

                  <div className="fp-track-cover">
                    {trackIsVideo ? (
                      <div className="fp-track-cover-video">
                        <Film size={14} strokeWidth={1.5} />
                      </div>
                    ) : track.coverUrl ? (
                      <img src={track.coverUrl} alt={track.title} />
                    ) : (
                      <Music size={16} strokeWidth={1.5} />
                    )}
                  </div>

                  <div className="fp-track-meta">
                    <p className="fp-track-name">{track.title}</p>
                    {trackIsVideo && (
                      <span className="fp-track-type-badge">Video</span>
                    )}
                  </div>

                  <button
                    className="fp-track-play-btn"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause size={12} fill="currentColor" />
                    ) : (
                      <Play size={12} fill="currentColor" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Container>
  );
}
