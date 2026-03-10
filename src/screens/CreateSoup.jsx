/**
 * CreateSoup.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Screen for building a custom word-search puzzle.
 *
 * User flow:
 *   1. Enter a title (optional)
 *   2. Type words (2–12, minimum 2 letters each), using Enter to advance
 *   3. Adjust grid size with the ‹ / › controls (auto-bounded to fit all words)
 *   4. Press "Generate Preview" to render the puzzle
 *   5. Optionally toggle answer highlighting
 *   6. Save (stays on screen), Share (native share / clipboard), or Play Now
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSoup, RAINBOW_COLORS } from '../lib/soupGenerator';
import { ArrowLeft, Save, PlayCircle, Eye, EyeOff, Share2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getT, LANGUAGES } from '../lib/i18n';

export default function CreateSoup({ user, language = 'en' }) {
  const navigate = useNavigate();
  const t = getT(language);
  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  // ── Form state ────────────────────────────────────────────────────────────
  const [title,    setTitle]    = useState('');
  const [words,    setWords]    = useState(['', '', '']); // raw input strings
  const [gridSize, setGridSize] = useState(10);

  // ── Preview state ─────────────────────────────────────────────────────────
  const [previewSoup,  setPreviewSoup]  = useState(null);
  const [showAnswers,  setShowAnswers]  = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [isSaved,      setIsSaved]      = useState(false);

  // Ref array to focus word inputs programmatically
  const inputRefs = useRef([]);

  // ── Derived values ────────────────────────────────────────────────────────

  /** Words that are valid (length > 1, uppercase letters only) */
  const cleanWords = words.filter(w => w.trim().length > 1);

  /** Minimum grid size required to fit all words */
  const longestLen       = cleanWords.length ? Math.max(...cleanWords.map(w => w.length)) : 0;
  const areaEstimate     = cleanWords.length
    ? Math.ceil(Math.sqrt(cleanWords.reduce((sum, w) => sum + w.length, 0)))
    : 0;
  const minRequiredSize  = Math.max(5, longestLen, areaEstimate);

  // Push grid size up if a new word made the minimum larger
  useEffect(() => {
    if (gridSize < minRequiredSize) setGridSize(minRequiredSize);
  }, [minRequiredSize, gridSize]);

  // ── Word list handlers ────────────────────────────────────────────────────

  const handleWordChange = (index, value) => {
    const updated = [...words];
    updated[index] = value.toUpperCase().replace(/[^A-Z]/g, '');
    setWords(updated);
  };

  /** Remove a word row by index */
  const removeWordField = (index) => {
    if (words.length <= 1) return;
    setWords(prev => prev.filter((_, i) => i !== index));
    inputRefs.current.splice(index, 1);
  };

  /** Add a new empty word row, then run an optional callback after state update */
  const addWordField = (callback) => {
    if (words.length >= 12) return;
    setWords(prev => [...prev, '']);
    if (typeof callback === 'function') callback();
  };

  /**
   * Enter key behaviour:
   *  - On a non-last field  → focus the next field
   *  - On the last field (with content) → add a new field and focus it
   *  - On the 12th field (max) → trigger Generate Preview
   */
  const handleKeyDown = (e, index) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    if (index < 11) {
      if (index === words.length - 1 && words[index].length > 0) {
        // Add new row, then focus it after React re-renders
        addWordField(() => {
          setTimeout(() => {
            inputRefs.current[index + 1]?.focus();
          }, 10);
        });
      } else {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (cleanWords.length > 0) {
      // At the maximum word count, Enter generates the preview
      handleGeneratePreview();
    }
  };

  // ── Grid size controls ────────────────────────────────────────────────────

  const adjustGridSize = (delta) => {
    setGridSize(prev => Math.max(minRequiredSize, Math.min(prev + delta, 30)));
  };

  // ── Preview generation ────────────────────────────────────────────────────

  const handleGeneratePreview = () => {
    if (cleanWords.length === 0) return;
    const size   = Math.max(parseInt(gridSize, 10) || 5, minRequiredSize);
    const result = generateSoup(cleanWords, size);

    setPreviewSoup({
      title:    title.trim() || 'Secret Message',
      creator:  user,
      language, // store the soup's language for display on the Kitchen card
      grid:     result.grid,
      words:    result.words,
      size:     result.size,
    });

    // Scroll to preview after render
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  // ── Save / Share / Play ───────────────────────────────────────────────────

  /** Save to localStorage and briefly show "Saved!" without navigating away */
  const handleSave = () => {
    if (!previewSoup) return;
    const key      = `soups_${user}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push(previewSoup);
    localStorage.setItem(key, JSON.stringify(existing));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const getShareLink = () => {
    if (!previewSoup) return '';
    const encoded = encodeURIComponent(JSON.stringify(previewSoup));
    const base    = window.location.href.split('#')[0];
    return `${base}#/play?data=${encoded}`;
  };

  const handleShare = async () => {
    const link = getShareLink();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Letter Soup', text: 'Try my secret message! 🍲', url: link });
      } else {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const handlePlayNow = () => {
    if (!previewSoup) return;
    navigate(`/play?data=${encodeURIComponent(JSON.stringify(previewSoup))}`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100vh', paddingBottom: '3rem' }}>

      {/* ── Back + title ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-main)' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t.createSoup}</h1>
        {/* Show active language flag so user knows which language they're creating in */}
        <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }} title={currentLang.label}>
          {currentLang.flag}
        </span>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* ── Soup title input ── */}
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.3rem', display: 'block' }}>
            {t.titleLabel}
          </label>
          <input
            type="text"
            placeholder={t.titlePlaceholder}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* ── Grid size control ── */}
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.3rem', display: 'block' }}>
            {t.gridSizeLabel(minRequiredSize)}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => adjustGridSize(-1)}
              disabled={gridSize <= minRequiredSize}
              style={{
                backgroundColor: gridSize <= minRequiredSize ? 'var(--gray-selection)' : 'var(--primary)',
                color: '#fff', borderRadius: '12px', padding: '0.8rem',
                opacity: gridSize <= minRequiredSize ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={20} />
            </button>

            <div style={{
              flex: 1, textAlign: 'center', fontSize: '1.2rem', fontWeight: 800,
              background: 'rgba(148,163,184,0.1)', padding: '0.75rem', borderRadius: '12px',
            }}>
              {gridSize}
            </div>

            <button
              onClick={() => adjustGridSize(1)}
              disabled={gridSize >= 30}
              style={{
                backgroundColor: gridSize >= 30 ? 'var(--gray-selection)' : 'var(--primary)',
                color: '#fff', borderRadius: '12px', padding: '0.8rem',
                opacity: gridSize >= 30 ? 0.5 : 1,
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>
            {t.gridSizeNote}
          </p>
        </div>

        {/* ── Word inputs ── */}
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t.wordsLabel(cleanWords.length)}</span>
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {words.map((word, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  ref={el => { inputRefs.current[idx] = el; }}
                  type="text"
                  placeholder={`Word ${idx + 1}`}
                  value={word}
                  onChange={e => handleWordChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(e, idx)}
                  style={{ textTransform: 'uppercase', padding: '0.75rem 1rem', flex: 1 }}
                />
                {words.length > 1 && (
                  <button
                    onClick={() => removeWordField(idx)}
                    style={{ color: 'var(--text-muted)', padding: '0.5rem' }}
                  >✕</button>
                )}
              </div>
            ))}

            {words.length < 12 && (
              <button
                onClick={() => addWordField()}
                style={{
                  color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem',
                  padding: '0.75rem', border: '2px dashed var(--gray-selection)',
                  borderRadius: '12px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem', width: '100%',
                }}
              >
                <Plus size={18} /> {t.addWord}
              </button>
            )}
          </div>
        </div>

        {/* ── Generate button ── */}
        <button
          className="btn-primary"
          onClick={handleGeneratePreview}
          disabled={cleanWords.length === 0}
          style={{ marginTop: '0.5rem', opacity: cleanWords.length === 0 ? 0.5 : 1 }}
        >
          {t.generatePreview}
        </button>
      </div>

      {/* ── Preview panel (shown after generation) ── */}
      {previewSoup && (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'popIn 0.3s ease-out' }}>

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t.generatePreview}</h2>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}
            >
              {showAnswers ? <EyeOff size={18} /> : <Eye size={18} />}
              {showAnswers ? t.hideAnswers || 'Hide Answers' : t.showAnswers || 'Show Answers'}
            </button>
          </div>

          {/* Grid preview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${previewSoup.size}, 1fr)`,
            gap: '2px',
            backgroundColor: 'var(--gray-selection-border)',
            padding: '4px', borderRadius: '12px',
            width: '100%', overflow: 'hidden',
          }}>
            {previewSoup.grid.map((row, rIdx) =>
              row.map((letter, cIdx) => {
                let bg    = 'var(--card-bg)';
                let color = 'var(--text-main)';

                if (showAnswers) {
                  for (const w of previewSoup.words) {
                    if (w.cells.some(c => c.r === rIdx && c.c === cIdx)) {
                      bg    = w.color;
                      color = '#fff';
                      break;
                    }
                  }
                }

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className="cell"
                    style={{ backgroundColor: bg, color, borderRadius: '4px', fontSize: previewSoup.size > 15 ? '0.75rem' : '1rem' }}
                  >
                    {letter}
                  </div>
                );
              })
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.5rem' }}>
            <button
              className="btn-secondary"
              onClick={handleSave}
              disabled={isSaved}
              style={{ fontSize: '0.9rem', padding: '0.8rem', opacity: isSaved ? 0.7 : 1 }}
            >
              <Save size={18} /> {isSaved ? t.saved : t.save}
            </button>
            <button className="btn-primary" onClick={handleShare} style={{ fontSize: '0.9rem', padding: '0.8rem' }}>
              <Share2 size={18} /> {copied ? t.copied : t.share}
            </button>
            <button className="btn-primary" onClick={handlePlayNow} style={{ gridColumn: 'span 2', fontSize: '1rem', padding: '1rem' }}>
              <PlayCircle size={20} /> {t.play}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
