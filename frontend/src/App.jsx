import Login from './screens/login';

export default function App() {
  return <Login onLoggedIn={(user, token) => console.log('logged in!', user, token)} />
}