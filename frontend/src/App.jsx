import { useState, useEffect } from 'react';
import Login from './screens/login';
import Game from './Game';                                   // NEW
import { me } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);                  // NEW
  const [checking, setChecking] = useState(true);

  // On page load: if a token is saved, ask the server who it belongs to
  useEffect(() => {
    const saved = localStorage.getItem('token');             // renamed to avoid clashing with token state
    if (!saved) {
      setChecking(false);
      return;
    }
    me(saved)
      .then((u) => {
        setUser(u);
        setToken(saved);                                     // NEW
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setChecking(false));
  }, []);

  function handleLoggedIn(user, token) {
    localStorage.setItem('token', token);
    setToken(token);                                         // NEW
    setUser(user);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);                                          // NEW
    setUser(null);
  }

  if (checking) return <p>Loading…</p>;
  if (!user) return <Login onLoggedIn={handleLoggedIn} />;

  return <Game token={token} user={user} onLogout={handleLogout} />;   // NEW: replaces the div
}