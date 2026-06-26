import React from 'react';
import Sidebar from './components/Sidebar';
import ChatPage from './pages/ChatPage';

const styles = {
  app: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--bg-base)',
  },
};

export default function App() {
  return (
    <div style={styles.app}>
      <Sidebar />
      <ChatPage />
    </div>
  );
}
