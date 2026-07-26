export const SESSION_TRACK_TONES = Object.freeze({
  main: 'neutral',
  frontend: 'accent',
  backend: 'info',
  devops: 'warning',
})

/**
 * Resolve a stable semantic tone for a session track.
 *
 * @param {unknown} track
 * @returns {'neutral' | 'accent' | 'info' | 'warning'}
 */
export function getSessionTrackTone(track) {
  return typeof track === 'string'
    ? SESSION_TRACK_TONES[track] ?? 'neutral'
    : 'neutral'
}
