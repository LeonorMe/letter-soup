import { useState } from 'react';
import { LogIn, ChevronDown } from 'lucide-react';
import { LANGUAGES, getT } from '../lib/i18n';

export default function Login({ onLogin, language, onChangeLanguage }) {
  const [username, setUsername] = useState('');
  const [showLangPicker, setShowLangPicker] = useState(false);
  
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const t           = getT(language);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="login-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', padding: '2rem', position: 'relative' }}>
      
      {/* Language Picker in Top Right */}
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 100 }}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangPicker(p => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              backgroundColor: 'rgba(148,163,184,0.12)',
              borderRadius: '100px', padding: '0.4rem 0.7rem',
              fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)'
            }}
          >
            {currentLang.flag} {currentLang.code.toUpperCase()}
            <ChevronDown size={14} />
          </button>

          {showLangPicker && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              backgroundColor: 'var(--card-bg)',
              borderRadius: '16px', padding: '0.5rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              zIndex: 100, minWidth: '140px',
              border: '1px solid var(--gray-selection)',
            }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { onChangeLanguage(lang.code); setShowLangPicker(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    width: '100%', padding: '0.6rem 0.8rem',
                    borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem',
                    color: lang.code === language ? 'var(--primary)' : 'var(--text-main)',
                    backgroundColor: lang.code === language ? 'rgba(14,116,144,0.1)' : 'transparent',
                    textAlign: 'left',
                  }}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
          Letter Soup
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          {t.loginSubtitle}
        </p>
      </div>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)' }}>
              {t.usernameLabel}
            </label>
            <input
              id="username"
              type="text"
              placeholder={t.usernamePlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
            <LogIn size={20} />
            {t.loginButton}
          </button>
        </form>
      </div>
      
    </div>
  );
}
