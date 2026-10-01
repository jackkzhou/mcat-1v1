import { useState } from 'react';
import { login, signup } from '../api';                     // NEW: import signup

export default function Login({ onLoggedIn }) {
  const [mode, setMode] = useState('login');                // NEW: 'login' or 'signup'
  const [username, setUsername] = useState('');             // NEW
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';                       // NEW: shorthand used below

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = isSignup                      // NEW: pick the API call
        ? await signup(username, email, password)
        : await login(email, password);
      onLoggedIn(user, token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {                                   // NEW
    setMode(isSignup ? 'login' : 'signup');
    setError(null);              // don't carry an old error into the other form
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>{isSignup ? 'Sign up' : 'Log in'}</h1>

      {isSignup && (                                        // NEW: only in signup mode
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      )}
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button disabled={loading}>
        {loading ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p>
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button type="button" onClick={toggleMode}>        {/* NEW */}
          {isSignup ? 'Log in' : 'Sign up'}
        </button>
      </p>
    </form>
  );
}