import { useEffect } from 'react';
import { useGameSocket } from './useGameSocket';
import Lobby from './screens/Lobby';

export default function Game({ token, user, onLogout }) {
  const { state, send } = useGameSocket(token);

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

    case 'match':   // placeholder until Step 5
      return <p>Match found! vs {JSON.stringify(state.match.opponent)}</p>;

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