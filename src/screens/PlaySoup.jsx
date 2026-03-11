/**
 * PlaySoup.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * The interactive word-search gameplay screen.
 *
 * Receives a soup payload via URL query param `?data=<encoded JSON>`.
 * The soup object includes a `language` field set at creation time.
 * UI labels use the soup's language when available, else the app language.
 *
 * Statistics saved to localStorage:
 *   words_found_<user>           – total words found across ALL puzzles
 *   vocab_wins_<lang>_<user>     – completed vocabulary puzzles per language
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Award, Sun, Moon } from 'lucide-react';
import { getT, LANGUAGES } from '../lib/i18n';
import { RAINBOW_COLORS } from '../lib/soupGenerator';

const USER_STORAGE_KEY = 'letter_soup_user';

export default function PlaySoup({ theme, onToggleTheme, language: appLanguage = 'en' }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [soupData,    setSoupData]    = useState(null);
  const [selection,   setSelection]   = useState([]);
  const [foundWords,  setFoundWords]  = useState([]);
  const [copied,      setCopied]      = useState(false);

  // Guard against double-counting the win in StrictMode
  const hasSavedWin = useRef(false);

  // ── Load soup from URL ────────────────────────────────────────────────────
  useEffect(() => {
    const raw = searchParams.get('data');
    const short = searchParams.get('s');
    
    if (short) {
      try {
        const decoded = decodeURIComponent(short);
        const [v, title, creator, lang, sizeStr, ...wordLines] = decoded.split('|');
        const size = parseInt(sizeStr, 10);
        
        const words = wordLines.map((line, i) => {
          const [word, r, c, dIdx, meaning] = line.split(',');
          const r0 = parseInt(r, 10);
          const c0 = parseInt(c, 10);
          const dI = parseInt(dIdx, 10);
          
          const DIRECTIONS = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
          const dir = DIRECTIONS[dI];
          
          const cells = [];
          for (let j = 0; j < word.length; j++) {
            cells.push({ r: r0 + dir[0] * j, c: c0 + dir[1] * j });
          }
          
          return {
            word,
            meaning: meaning || null,
            color: RAINBOW_COLORS[i % RAINBOW_COLORS.length],
            found: false,
            cells
          };
        });
        
        // Reconstruct grid
        const grid = Array.from({ length: size }, () => Array(size).fill(null));
        words.forEach(w => {
          w.cells.forEach((cell, j) => {
            grid[cell.r][cell.c] = w.word[j];
          });
        });
        
        // Fill random
        const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (grid[r][c] === null)
              grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
          }
        }
        
        setSoupData({ title, creator, language: lang, size, words, grid });
      } catch (err) {
        console.error('PlaySoup: failed to parse short link', err);
      }
      return;
    }

    if (!raw) return;
    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      parsed.words = parsed.words.map(w => ({ ...w, found: false }));
      setSoupData(parsed);
    } catch (err) {
      console.error('PlaySoup: failed to parse soup data from URL', err);
    }
  }, [searchParams]);

  // ── Translation – use the soup's own language, fall back to app language ─
  const soupLang = soupData?.language || appLanguage;
  const t        = getT(soupLang);

  // ── Check selection against unfound words ─────────────────────────────────
  useEffect(() => {
    if (!selection.length || !soupData) return;

    const selKey = [...selection]
      .sort((a, b) => a.r - b.r || a.c - b.c)
      .map(c => `${c.r}-${c.c}`)
      .join(',');

    const unmatched = soupData.words.filter(
      w => !foundWords.find(fw => fw.word === w.word)
    );

    for (const w of unmatched) {
      const wordKey = [...w.cells]
        .sort((a, b) => a.r - b.r || a.c - b.c)
        .map(c => `${c.r}-${c.c}`)
        .join(',');

      if (selKey === wordKey) {
        setFoundWords(prev => [...prev, w]);
        setSelection([]);

        // Increment global words-found counter
        const user = localStorage.getItem(USER_STORAGE_KEY);
        if (user) {
          const key  = `words_found_${user}`;
          const prev = parseInt(localStorage.getItem(key) || '0', 10);
          localStorage.setItem(key, (prev + 1).toString());
        }
        break;
      }
    }
  }, [selection, soupData, foundWords]);

  // ── Win detection ─────────────────────────────────────────────────────────
  const isWin =
    soupData &&
    soupData.words.length > 0 &&
    foundWords.length === soupData.words.length;

  // ── Save puzzle win – universal counter for ALL puzzle types ────────────
  useEffect(() => {
    if (!isWin || hasSavedWin.current) return;
    hasSavedWin.current = true;

    const user = localStorage.getItem(USER_STORAGE_KEY);
    if (user) {
      const key  = `puzzles_won_${user}`;
      const prev = parseInt(localStorage.getItem(key) || '0', 10);
      localStorage.setItem(key, (prev + 1).toString());
    }
  }, [isWin, soupData]);

  // ── Randomise hint order once per soup ───────────────────────────────────
  const randomizedHints = useMemo(() => {
    if (!soupData?.words) return [];
    return [...soupData.words].sort(() => Math.random() - 0.5);
  }, [soupData]);

  // ── Share ─────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!soupData) return;
    const encoded = encodeURIComponent(JSON.stringify(soupData));
    const base    = window.location.href.split('#')[0];
    const link    = `${base}#/play?data=${encoded}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: soupData.title, text: 'Try my letter soup! 🍲', url: link });
      } else {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) { console.error('Share failed', err); }
  };

  // ── Cell interaction helpers ──────────────────────────────────────────────
  const toggleCell = (r, c) => {
    if (isWin) return;
    setSelection(prev => {
      const idx = prev.findIndex(item => item.r === r && item.c === c);
      return idx >= 0 ? prev.filter((_, i) => i !== idx) : [...prev, { r, c }];
    });
  };

  const getCellBg = (r, c) => {
    for (const fw of foundWords)
      if (fw.cells.find(cell => cell.r === r && cell.c === c)) return fw.color;
    if (selection.find(cell => cell.r === r && cell.c === c)) return 'var(--gray-selection)';
    return 'var(--card-bg)';
  };

  const getCellColor = (r, c) => {
    for (const fw of foundWords)
      if (fw.cells.find(cell => cell.r === r && cell.c === c)) return '#fff';
    return 'var(--text-main)';
  };

  // ── Loading fallback ──────────────────────────────────────────────────────
  if (!soupData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{t.loading}</p>
        <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>
          {t.back}
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100vh', paddingBottom: '3rem' }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate('/')}
          style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
        >
          <ArrowLeft size={20} /> {t.back}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Share */}
          <button
            onClick={handleShare}
            style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}
          >
            {copied
              ? <span style={{ fontSize: '0.8rem' }}>{t.copied}</span>
              : <><Share2 size={16} /> {t.share}</>}
          </button>

          {/* Theme toggle */}
          {onToggleTheme && (
            <button onClick={onToggleTheme} style={{ color: 'var(--text-muted)' }}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {/* Progress */}
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.found(foundWords.length, soupData.words.length)}
          </div>
        </div>
      </div>

      {/* ── Soup title & author ── */}
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.2 }}>
          {soupData.title}
        </h1>
        {soupData.creator && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {t.from} <span style={{ fontWeight: 700 }}>{soupData.creator}</span>
          </p>
        )}
      </div>

      {/* ── Word-search grid ── */}
      <div className="glass-panel" style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${soupData.size}, 1fr)`,
          gap: soupData.size > 20 ? '1px' : '2px',
          backgroundColor: 'var(--gray-selection-border)',
          padding: '4px', borderRadius: '12px',
          width: '100%', aspectRatio: '1',
          touchAction: 'none',
        }}>
          {soupData.grid.map((row, rIdx) =>
            row.map((letter, cIdx) => (
              <div
                key={`${rIdx}-${cIdx}`}
                className="cell"
                onClick={() => toggleCell(rIdx, cIdx)}
                style={{
                  backgroundColor: getCellBg(rIdx, cIdx),
                  color: getCellColor(rIdx, cIdx),
                  borderRadius: '4px',
                  fontSize: soupData.size > 18 ? '0.7rem' : soupData.size > 14 ? '0.85rem' : '1.1rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {letter}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Word list / Win screen ── */}
      <div className="glass-panel" style={{ marginTop: '0.5rem' }}>
        {isWin ? (
          /* ── Win state ── */
          <div style={{ textAlign: 'center', animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <div style={{ color: '#FFCA3A', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <Award size={48} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t.youWon}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t.allWordsFound}</p>

            {/* Staggered word chips with optional definition tooltip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {soupData.words.map((w, idx) => (
                <div key={idx} className={w.meaning ? 'tooltip-container' : ''}>
                  <span style={{
                    backgroundColor: w.color, color: '#fff',
                    padding: '0.3rem 0.8rem', borderRadius: '100px',
                    fontWeight: 700, fontSize: '0.9rem',
                    animation: `popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.1}s both`,
                    display: 'inline-block',
                  }}>
                    {w.word}
                    {w.meaning && <div className="tooltip-text">{w.word}: {w.meaning}</div>}
                  </span>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={() => navigate('/')}>{t.backToMenu}</button>
          </div>
        ) : (
          /* ── In-progress hint list ── */
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              {t.wordsToFind}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {randomizedHints.map((w, idx) => {
                const found = !!foundWords.find(fw => fw.word === w.word);
                return (
                  <span key={idx} style={{
                    padding: '0.3rem 0.8rem', borderRadius: '100px',
                    fontWeight: 600, fontSize: '0.9rem',
                    backgroundColor: found ? w.color : 'transparent',
                    color: found ? '#fff' : 'var(--text-muted)',
                    border: found ? '2px solid transparent' : '2px solid var(--gray-selection)',
                    transition: 'all 0.3s ease',
                  }}>
                    {w.word}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
