import { useState, useEffect } from 'react';
import Login from './screens/login';
import { me } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);   // true until we know if the saved token is valid

  // On page load: if a token is saved, ask the server who it belongs to
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setChecking(false);          // nothing saved → show Login
      return;
    }
    me(token)
      .then((u) => setUser(u))                        // valid → logged in
      .catch(() => localStorage.removeItem('token'))  // expired/invalid → forget it
      .finally(() => setChecking(false));
  }, []);

  function handleLoggedIn(user, token) {
    localStorage.setItem('token', token);   // survives refresh
    setUser(user);                          // re-render → shows the logged-in view
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setUser(null);                          // re-render → shows Login
  }

  if (checking) return <p>Loading…</p>;
  if (!user) return <Login onLoggedIn={handleLoggedIn} />;

  return (
    <div>
      <p>Logged in as {user.username} (rating {user.rating})</p>
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
}