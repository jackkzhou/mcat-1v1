import { useState, useEffect } from 'react';
import Login from './screens/Login';                         // capital L, to match Login.jsx
import Game from './Game';
import { me } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  // On page load: if a token is saved, ask the server who it belongs to
  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (!saved) {
      setChecking(false);
      return;
    }
    me(saved)
      .then((u) => {
        setUser(u);
        setToken(saved);
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setChecking(false));
  }, []);

  function handleLoggedIn(user, token) {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(user);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }                                                          // ← this was missing

  // NEW: re-fetch the user so the lobby shows the updated rating after a match
  function handleRefreshUser() {
    me(token)
      .then(setUser)
      .catch(() => {});      // if it fails, keep showing the old rating
  }

  if (checking) return <p>Loading…</p>;
  if (!user) return <Login onLoggedIn={handleLoggedIn} />;

  return (
    <Game
      token={token}
      user={user}
      onLogout={handleLogout}
      onRefreshUser={handleRefreshUser}                      // NEW
    />
  );
}