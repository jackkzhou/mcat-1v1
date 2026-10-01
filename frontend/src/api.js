export async function login(email, password) {
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;   // { token, user }
}

export async function signup(username, email, password) {
    const res = await fetch('/api/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username,email,password}),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
}

export async function me(token) {
  const res = await fetch('/api/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}