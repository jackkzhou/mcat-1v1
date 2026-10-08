import { useEffect } from 'react';
import { useGameSocket } from './useGameSocket';
import Lobby from './screens/Lobby';
import Match from './screens/Match';                              // NEW

export default function Game({ token, user, onLogout }) {
  const { state, send, select, backToLobby } = useGameSocket(token);   // NEW: select, backToLobby

  // bad token on the socket → log out
  useEffect(() => {
    if (state.phase === 'auth_failed') onLogout();
  }, [state.phase, onLogout]);

  switch (state.phase) {
    case 'connecting':
      return <p>Connecting…</p>;

    case 'lobby':
    case 'queued':
      return (
        <Lobby
          user={user}
          phase={state.phase}
          error={state.error}
          onFindMatch={() => send({ type: 'queue' })}
          onLogout={onLogout}
        />
      );

    case 'match':                                                  // NEW: real match screen
      return (
        <Match
          match={state.match}
          onSelect={select}
          onSubmit={() => send({ type: 'submit' })}
        />
      );

    case 'results': {                                              // NEW: simple results (full version is Step 6)
      const r = state.result;
      return (
        <div>
          <h1>{r.result === 'win' ? 'You won!' : r.result === 'loss' ? 'You lost' : 'Draw'}</h1>
          <p>You {r.yourScore}/{r.total} — Opponent {r.opponentScore}/{r.total}</p>
          <button onClick={backToLobby}>Back to lobby</button>
        </div>
      );
    }

    case 'disconnected':
      return (
        <div>
          <p>{state.closeCode === 4001
                ? 'You signed in somewhere else.'
                : 'Lost connection to the server.'}</p>
          <button onClick={() => window.location.reload()}>Reconnect</button>
        </div>
      );

    default:
      return null;
  }
}