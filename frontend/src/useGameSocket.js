import { useEffect, useReducer, useRef, useCallback } from 'react';
import { gameReducer, initialState } from './gameReducer';

export function useGameSocket(token) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const wsRef = useRef(null);   // holds the current socket across renders, without causing re-renders

  useEffect(() => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/ws`);   // goes through the Vite proxy
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', token }));
    ws.onmessage = (e) => dispatch(JSON.parse(e.data));
    ws.onclose = (e) => {
      if (wsRef.current !== ws) return;          // we closed it on purpose (cleanup), ignore
      dispatch({ type: 'socket_closed', code: e.code });
    };

    return () => {                               // cleanup: logout, unmount, or StrictMode remount
      wsRef.current = null;
      ws.close();
    };
  }, [token]);

  const send = useCallback((msg) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
  }, []);

    const select = useCallback((questionId, choiceId) => {
    dispatch({ type: 'local_select', questionId, choiceId });   // update the screen now
    send({ type: 'select', questionId, choiceId });             // tell the server (no reply comes)
  }, [send]);

  const backToLobby = useCallback(() => dispatch({ type: 'back_to_lobby' }), []);

  return { state, send, select, backToLobby };
}