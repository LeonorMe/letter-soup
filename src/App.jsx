/**
 * App.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Root component. Manages routing, mock authentication, theme, and language.
 *
 * Auth:       localStorage['letter_soup_user']  → username
 * Theme:      localStorage['letter_soup_theme'] → 'light' | 'dark'
 * Language:   localStorage['letter_soup_lang']  → 'en'|'pt'|'es'|'it'|'de'|'fr'
 *
 * Routes:
 *   /login  – Login  (public, redirects → / when authed)
 *   /       – Home   (requires auth)
 *   /create – Create (requires auth)
 *   /play   – Play   (public – shared links must work without login)
 */

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login      from './screens/Login';
import Home       from './screens/Home';
import CreateSoup from './screens/CreateSoup';
import PlaySoup   from './screens/PlaySoup';

export const USER_STORAGE_KEY  = 'letter_soup_user';
export const THEME_STORAGE_KEY = 'letter_soup_theme';
export const LANG_STORAGE_KEY  = 'letter_soup_lang';

export default function App() {
  const [user,     setUser]     = useState(null);
  const [theme,    setTheme]    = useState('light');
  const [language, setLanguage] = useState('en');

  // ── Restore persistent settings on first load ─────────────────────────────
  useEffect(() => {
    // Auth
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) setUser(savedUser);

    // Theme – fall back to OS preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const resolvedTheme = savedTheme
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(resolvedTheme);

    // Language – fall back to browser language, then English
    const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
    if (savedLang) {
      setLanguage(savedLang);
    } else {
      const browserLang = navigator.language?.split('-')[0] ?? 'en';
      const supported   = ['en', 'pt', 'es', 'it', 'de', 'fr'];
      const resolved    = supported.includes(browserLang) ? browserLang : 'en';
      setLanguage(resolved);
      localStorage.setItem(LANG_STORAGE_KEY, resolved);
    }
  }, []);

  // ── Theme helpers ─────────────────────────────────────────────────────────
  const applyTheme = (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setTheme(newTheme);
  };
  const toggleTheme = () => applyTheme(theme === 'dark' ? 'light' : 'dark');

  // ── Language helpers ──────────────────────────────────────────────────────
  const changeLanguage = (code) => {
    setLanguage(code);
    localStorage.setItem(LANG_STORAGE_KEY, code);
  };

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin  = (username) => {
    localStorage.setItem(USER_STORAGE_KEY, username);
    setUser(username);
  };
  const handleLogout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  // ── Shared props bundles ──────────────────────────────────────────────────
  const themeProps    = { theme, onToggleTheme: toggleTheme };
  const languageProps = { language, onChangeLanguage: changeLanguage };

  return (
    <Router>
      <Routes>
        <Route path="/login"
          element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
        />
        <Route path="/"
          element={user
            ? <Home user={user} onLogout={handleLogout} {...themeProps} {...languageProps} />
            : <Navigate to="/login" />}
        />
        <Route path="/create"
          element={user
            ? <CreateSoup user={user} language={language} />
            : <Navigate to="/login" />}
        />
        {/* Play is public so shared links work without logging in */}
        <Route path="/play"
          element={<PlaySoup {...themeProps} {...languageProps} />}
        />
      </Routes>
    </Router>
  );
}
