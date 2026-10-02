export default function Lobby({ user, phase, error, onFindMatch, onLogout }) {
  const queued = phase === 'queued';
  return (
    <div>
      <p>Logged in as {user.username} (rating {user.rating})</p>
      <button onClick={onFindMatch} disabled={queued}>
        {queued ? 'Searching…' : 'Find match'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={onLogout}>Log out</button>
    </div>
  );
}