// One clock drives both the elapsed-time text and progress bar. Changing play
// state preserves the current position; only a speaker snapshot resets it.
export const createPlaybackClock = (
  initialElapsed: number,
  initialDuration: number,
  initialPlaying: boolean,
  now: () => number = () => performance.now(),
) => {
  let elapsed = initialElapsed;
  let duration = initialDuration;
  let playing = initialPlaying;
  let startedAt = now();

  const position = () =>
    Math.min(
      duration,
      Math.max(0, elapsed + (playing ? (now() - startedAt) / 1000 : 0)),
    );

  return {
    position,
    setPlaying(nextPlaying: boolean) {
      elapsed = position();
      startedAt = now();
      playing = nextPlaying;
      return position();
    },
    sync(nextElapsed: number, nextDuration: number) {
      elapsed = nextElapsed;
      duration = nextDuration;
      startedAt = now();
      return position();
    },
  };
};
