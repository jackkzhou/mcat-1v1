export const initialState = {
  phase: 'connecting',   // connecting | lobby | queued | match | results | auth_failed | disconnected
  match: null,
  result: null,
  error: null,
  closeCode: null,
};

// Turns match_start / match_resume into the shape the Match screen uses
function matchFrom(msg) {
  return {
    matchId: msg.matchId,
    opponent: msg.opponent,                       // { id, username }
    passages: msg.passages,
    selections: msg.selections ?? {},             // questionId -> choiceId
    submitted: msg.submitted ?? false,
    opponentSubmitted: msg.opponentSubmitted ?? false,
    deadlineAt: msg.deadlineAt ?? null,           // set once someone submits
    opponentConnected: true,
  };
}

// Update fields of state.match, keeping the rest
function updateMatch(state, changes) {
  if (!state.match) return state;
  return { ...state, match: { ...state.match, ...changes } };
}

export function gameReducer(state, msg) {
  switch (msg.type) {
    // --- connection / lobby ---
    case 'auth_ok':      return { ...state, phase: 'lobby', error: null };
    case 'auth_failed':  return { ...state, phase: 'auth_failed', error: msg.message };
    case 'queued':       return { ...state, phase: 'queued' };
    case 'match_failed': return { ...state, phase: 'lobby', error: "Couldn't start a match, try again." };
    case 'error':        return { ...state, error: msg.message };

    // --- match ---
    case 'match_start':
    case 'match_resume': // same as start, but carries your saved selections/submitted/deadline
      return { ...state, phase: 'match', match: matchFrom(msg), result: null, error: null };

    case 'submitted':          return updateMatch(state, { submitted: true, deadlineAt: msg.deadlineAt });
    case 'opponent_submitted': return updateMatch(state, { opponentSubmitted: true, deadlineAt: msg.deadlineAt });
    case 'opponent_disconnected': return updateMatch(state, { opponentConnected: false });
    case 'opponent_reconnected':  return updateMatch(state, { opponentConnected: true });

    case 'match_end':
      return { ...state, phase: 'results', result: msg };

    // --- local actions (not from the server) ---
    case 'local_select': {
      if (!state.match || state.match.submitted) return state;
      return updateMatch(state, {
        selections: { ...state.match.selections, [msg.questionId]: msg.choiceId },
      });
    }
    case 'back_to_lobby':
      return { ...state, phase: 'lobby', match: null, result: null, error: null };
    case 'socket_closed':
      return { ...state, phase: 'disconnected', closeCode: msg.code };

    default: return state;
  }
}