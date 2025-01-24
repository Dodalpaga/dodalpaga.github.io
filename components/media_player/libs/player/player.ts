import { createPubSub } from '../pubsub';
import { createAudio } from './audio';
import { State, Track } from './types';

const createPlayer = () => {
  const pubsub = createPubSub();
  const audio = createAudio();

  let state: State = {
    ...audio.getState(),
    tracks: [],
    currentTrackIndex: null,
    currentTrack: null,
  };

  const setState = (value: Partial<State>) => {
    state = { ...state, ...value };

    pubsub.publish('change', state);
  };

  audio.subscribe(setState);

  const changeTrack = () => {
    const track = state.currentTrack;

    if (track) {
      audio.setUrl(track.url);
      audio.play();
    }
  };

  const next = () => {
    if (state.currentTrackIndex === null) {
      return;
    }

    const lastIndex = state.tracks.length - 1;
    const newIndex = state.currentTrackIndex + 1;

    if (newIndex <= lastIndex) {
      setState({
        currentTrackIndex: newIndex,
        currentTrack: state.tracks[newIndex],
      });

      changeTrack();
    }
  };

  audio.onEnded(next);

  return {
    play: audio.play,
    pause: audio.pause,
    seek: audio.seek,
    volume: audio.volume,
    getCurrentTime: audio.getCurrentTime,
    getElement: audio.getElement,
    onChangeCurrentTime: audio.onChangeCurrentTime,

    getState() {
      return state;
    },

    setQueue(tracks: Track[]) {
      setState({ tracks });
    },

    playTrack(trackIndex: number) {
      setState({
        currentTrackIndex: trackIndex,
        currentTrack: state.tracks[trackIndex],
      });

      changeTrack();
    },

    next,

    prev() {
      if (state.currentTrackIndex === null) {
        return;
      }

      const newIndex = state.currentTrackIndex - 1;

      if (newIndex >= 0) {
        setState({
          currentTrack: state.tracks[newIndex],
          currentTrackIndex: newIndex,
        });

        changeTrack();
      }
    },

    subscribe(listener: (newState: State) => void) {
      return pubsub.subscribe('change', listener);
    },
  };
};

const player = createPlayer();

export default player;
