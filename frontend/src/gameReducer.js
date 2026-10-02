export const initialState = {
  phase: 'connecting',   // connecting | lobby | queued | match | auth_failed | disconnected
  match: null,
  error: null,
  closeCode: null,
};

export function gameReducer(state, msg) {
  switch (msg.type) {
    case 'auth_ok':      return { ...state, phase: 'lobby', error: null };
    case 'auth_failed':  return { ...state, phase: 'auth_failed', error: msg.message };
    case 'queued':       return { ...state, phase: 'queued' };
    case 'match_failed': return { ...state, phase: 'lobby', error: "Couldn't start a match, try again." };
    case 'match_start':  return { ...state, phase: 'match', match: msg, error: null };
    case 'error':        return { ...state, error: msg.message };

    // not from the server: the hook dispatches this when the socket closes
    case 'socket_closed': return { ...state, phase: 'disconnected', closeCode: msg.code };

    default: return state;
  }
}