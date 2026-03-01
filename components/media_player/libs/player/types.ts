// components/media_player/libs/player/types.ts

export type AudioState = {
  duration: number;
  playing: boolean;
  volume: number;
};

export type Track = {
  url: string;
  title: string;
  coverUrl: string | null;
};

export type State = AudioState & {
  tracks: Track[];
  currentTrack: Track | null;
  currentTrackIndex: number | null;
};
