/**
 * Home.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Main landing screen after login.
 *
 * Sections:
 *   1. Header  – greeting, language picker, theme toggle, logout
 *   2. Stats   – always-visible Words Found + Vocab Wins panel
 *   3. Actions – "Create New Soup" and "Learn Vocabulary" buttons
 *   4. Kitchen – list of saved soups with Play / Share / Delete
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Dices, LogOut, Trash2, Award, Share2, BookOpen, Sun, Moon, ChevronDown } from 'lucide-react';
import { generateVocabularyWords, generateSoup } from '../lib/soupGenerator';
import { getT, LANGUAGES } from '../lib/i18n';

const USER_STORAGE_KEY = 'letter_soup_user';

export default function Home({ user, onLogout, theme, onToggleTheme, language, onChangeLanguage }) {
  const navigate = useNavigate();
  const t = getT(language); // UI translation strings

  // ── State ─────────────────────────────────────────────────────────────────
  const [savedSoups,      setSavedSoups]      = useState([]);
  const [wordsFound,      setWordsFound]       = useState(0);
  const [puzzlesWon,      setPuzzlesWon]        = useState(0);
  const [copiedIndex,     setCopiedIndex]      = useState(null);
  const [showLangPicker,  setShowLangPicker]   = useState(false);

  // ── Load stats from localStorage ──────────────────────────────────────────
  useEffect(() => {
    const soups  = JSON.parse(localStorage.getItem(`soups_${user}`) || '[]');
    const found  = parseInt(localStorage.getItem(`words_found_${user}`) || '0', 10);
    // Universal win counter – any puzzle type, any language
    const won    = parseInt(localStorage.getItem(`puzzles_won_${user}`) || '0', 10);

    setSavedSoups(soups);
    setWordsFound(found);
    setPuzzlesWon(won);
  }, [user, language]);

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Start a new random vocabulary puzzle in the current language */
  const handlePlayRandom = () => {
    const words = generateVocabularyWords(language);
    // ⚠️  TESTING: 5×5 grid. Change to generateSoup(words, 10) for production.
    const { grid, words: placedWords, size } = generateSoup(words, 5);

    const soupData = {
      title:    t.learnVocab,  // fully translated, e.g. "Aprender Vocabulario 🌍" in Spanish
      creator:  'The Universe',
      language,
      grid,
      words:    placedWords,
      size,
    };

    navigate(`/play?data=${encodeURIComponent(JSON.stringify(soupData))}`);
  };

  const handlePlaySaved = (soup) => {
    navigate(`/play?data=${encodeURIComponent(JSON.stringify(soup))}`);
  };

  const handleShareSaved = async (soup, idx) => {
    const encoded = encodeURIComponent(JSON.stringify(soup));
    const base    = window.location.href.split('#')[0];
    const link    = `${base}#/play?data=${encoded}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: soup.title, text: 'Try my letter soup! 🍲', url: link });
      } else {
        await navigator.clipboard.writeText(link);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
    } catch (err) { console.error('Share failed', err); }
  };

  const handleDelete = (idx) => {
    const updated = savedSoups.filter((_, i) => i !== idx);
    setSavedSoups(updated);
    localStorage.setItem(`soups_${user}`, JSON.stringify(updated));
  };

  // ── Current language metadata ─────────────────────────────────────────────
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Greeting */}
        <div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--primary)' }}>
            {t.welcome(user)}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{t.subtitle}</p>
        </div>

        {/* Header controls: Language picker, Theme toggle, Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', position: 'relative' }}>

          {/* Language picker button */}
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

            {/* Dropdown */}
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

          {/* Theme toggle */}
          <button onClick={onToggleTheme} style={{ color: 'var(--text-muted)' }} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>

          {/* Logout */}
          <button onClick={onLogout} style={{ color: 'var(--text-muted)' }} title="Logout">
            <LogOut size={22} />
          </button>
        </div>
      </div>

      {/* ── Stats panel (always visible) ── */}
      <div className="glass-panel" style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '1rem', gap: '1rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 800, fontSize: '1.6rem' }}>
            <BookOpen size={20} /> {wordsFound}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {t.wordsFound}
          </p>
        </div>

        <div style={{ width: '1px', height: '2.5rem', backgroundColor: 'var(--gray-selection)' }} />

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#eab308', fontWeight: 800, fontSize: '1.6rem' }}>
            <Award size={20} /> {puzzlesWon}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {t.puzzlesWon}
          </p>
        </div>
      </div>

      {/* ── Main action buttons ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="btn-primary" onClick={() => navigate('/create')} style={{ padding: '1.25rem' }}>
          <PlusCircle size={24} /> {t.createSoup}
        </button>

        <button className="btn-secondary" onClick={handlePlayRandom} style={{ padding: '1.25rem', backgroundColor: 'var(--card-bg)' }}>
          <Dices size={24} /> {t.learnVocab}
        </button>
      </div>

      {/* ── Your Kitchen ── */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem' }}>{t.yourKitchen}</h2>

        {savedSoups.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>{t.kitchenEmpty}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>{t.kitchenEmptySub}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {savedSoups.map((soup, idx) => {
              const soupLang = LANGUAGES.find(l => l.code === soup.language);
              return (
                <div key={idx} className="glass-panel"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}
                >
                  <div onClick={() => handlePlaySaved(soup)} style={{ cursor: 'pointer', flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{soup.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {soup.words?.length || 0} words • {soup.size}×{soup.size}
                      {soupLang && (
                        <span style={{
                          backgroundColor: 'rgba(148,163,184,0.15)', borderRadius: '100px',
                          padding: '0.1rem 0.5rem', fontSize: '0.78rem', fontWeight: 700,
                        }}>
                          {soupLang.flag} {soupLang.code.toUpperCase()}
                        </span>
                      )}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button onClick={() => handleShareSaved(soup, idx)} style={{ color: 'var(--text-main)' }}>
                      {copiedIndex === idx
                        ? <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.copied}</span>
                        : <Share2 size={20} />}
                    </button>
                    <button onClick={() => handlePlaySaved(soup)} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      {t.play}
                    </button>
                    <button onClick={() => handleDelete(idx)} style={{ color: '#FF595E' }}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
