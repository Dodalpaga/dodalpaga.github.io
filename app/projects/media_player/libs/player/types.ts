export type AudioState = {
  duration: number;
  playing: boolean;
  volume: number;
};

export type Track = {
  url: string;
  title: string;
};

export type State = AudioState & {
  tracks: Track[];
  currentTrack: Track | null;
  currentTrackIndex: number | null;
};
