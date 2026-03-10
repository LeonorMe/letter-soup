import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './screens/Login';
import Home from './screens/Home';
import CreateSoup from './screens/CreateSoup';
import PlaySoup from './screens/PlaySoup';

export default function App() {
  const [user, setUser] = useState(null);

  // Simple mock auth persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('letter_soup_user');
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLogin = (username) => {
    localStorage.setItem('letter_soup_user', username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('letter_soup_user');
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={user ? <Home user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/create" 
          element={user ? <CreateSoup user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/play" 
          element={<PlaySoup />} 
          /* Play does not strictly require auth because users might get a link from a friend */
        />
      </Routes>
    </Router>
  );
}
