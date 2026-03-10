import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSoup, RAINBOW_COLORS } from '../lib/soupGenerator';
import { ArrowLeft, Save, Play, PlayCircle, Eye, EyeOff, Share2 } from 'lucide-react';

export default function CreateSoup({ user }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [words, setWords] = useState(['', '', '']);
  const [gridSize, setGridSize] = useState(10);
  
  // Preview state
  const [previewSoup, setPreviewSoup] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleWordChange = (index, value) => {
    const newWords = [...words];
    newWords[index] = value.toUpperCase().replace(/[^A-Z]/g, '');
    setWords(newWords);
  };

  const addWordField = () => {
    if (words.length < 12) {
      setWords([...words, '']);
    }
  };

  const removeWordField = (index) => {
    if (words.length > 1) {
       const newWords = [...words];
       newWords.splice(index, 1);
       setWords(newWords);
    }
  };

  const cleanWords = words.filter(w => w.trim().length > 0);

  const handleGeneratePreview = () => {
    if (cleanWords.length === 0) return;
    const result = generateSoup(cleanWords, parseInt(gridSize, 10) || 10);
    setPreviewSoup({
      title: title || 'Secret Message',
      creator: user,
      grid: result.grid,
      words: result.words,
      size: result.size
    });
  };

  const handleSave = () => {
    if (!previewSoup) return;
    const existing = JSON.parse(localStorage.getItem(`soups_${user}`) || '[]');
    existing.push(previewSoup);
    localStorage.setItem(`soups_${user}`, JSON.stringify(existing));
    navigate('/');
  };

  const getShareLink = () => {
      if(!previewSoup) return '';
      const encoded = encodeURIComponent(JSON.stringify(previewSoup));
      // Using window.location.origin but since it's a hashrouter we need the full base path
      const base = window.location.href.split('#')[0];
      return `${base}#/play?data=${encoded}`;
  };

  const handleShare = async () => {
      const link = getShareLink();
      try {
          if (navigator.share) {
              await navigator.share({
                  title: 'Letter Soup',
                  text: 'I made a secret message for you! 🍲',
                  url: link
              });
          } else {
              await navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
          }
      } catch (err) {
          console.error("Share failed", err);
      }
  };

  const handlePlayNow = () => {
      if(!previewSoup) return;
      const encoded = encodeURIComponent(JSON.stringify(previewSoup));
      navigate(`/play?data=${encoded}`);
  };


  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '100vh', paddingBottom: '3rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate(-1)} style={{ color: 'var(--text-main)' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create Soup</h1>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.3rem', display: 'block' }}>
            Title / Secret Message
          </label>
          <input
            type="text"
            placeholder='e.g. "Happy Birthday Mom"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
           <label style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.3rem', display: 'block' }}>
            Grid Size (Min 10 default)
          </label>
          <input
            type="number"
            min="5"
            max="30"
            value={gridSize}
            onChange={(e) => setGridSize(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '2px solid transparent', background: 'rgba(148, 163, 184, 0.1)', outline: 'none', fontFamily: 'Outfit' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.5rem', display: 'block', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Words ({cleanWords.length}/12)</span>
            {words.length < 12 && (
               <button onClick={addWordField} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>+ Add Word</button>
            )}
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {words.map((word, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder={`Word ${idx + 1}`}
                  value={word}
                  onChange={(e) => handleWordChange(idx, e.target.value)}
                  style={{ textTransform: 'uppercase', padding: '0.75rem 1rem' }}
                />
                {words.length > 1 && (
                    <button onClick={() => removeWordField(idx)} style={{ color: 'var(--text-muted)' }}>✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button 
           className="btn-primary" 
           onClick={handleGeneratePreview}
           disabled={cleanWords.length === 0}
           style={{ marginTop: '0.5rem', opacity: cleanWords.length === 0 ? 0.5 : 1 }}
        >
          Generate Preview
        </button>
      </div>

      {previewSoup && (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', animation: 'popIn 0.3s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Preview</h2>
             <button onClick={() => setShowAnswers(!showAnswers)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                {showAnswers ? <EyeOff size={18} /> : <Eye size={18} />}
                {showAnswers ? 'Hide Answers' : 'Show Answers'}
             </button>
          </div>

          <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${previewSoup.size}, 1fr)`, 
              gap: '2px',
              backgroundColor: 'var(--gray-selection-border)',
              padding: '4px',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden'
          }}>
             {previewSoup.grid.map((row, rIdx) => 
               row.map((letter, cIdx) => {
                  let bgColor = 'var(--card-bg)';
                  let color = 'var(--text-main)';
                  
                  if (showAnswers) {
                      // Check if this cell belongs to any answered word
                      for (const w of previewSoup.words) {
                          if (w.cells.some(c => c.r === rIdx && c.c === cIdx)) {
                              bgColor = w.color;
                              color = '#ffffff';
                              break;
                          }
                      }
                  }

                  return (
                      <div 
                        key={`${rIdx}-${cIdx}`} 
                        className="cell"
                        style={{ backgroundColor: bgColor, color, borderRadius: '4px', fontSize: previewSoup.size > 15 ? '0.75rem' : '1rem' }}
                      >
                         {letter}
                      </div>
                  )
               })
             )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginTop: '0.5rem' }}>
             <button className="btn-secondary" onClick={handleSave} style={{ fontSize: '0.9rem', padding: '0.8rem' }}>
                 <Save size={18} /> Save
             </button>
             <button className="btn-primary" onClick={handleShare} style={{ fontSize: '0.9rem', padding: '0.8rem' }}>
                 <Share2 size={18} /> {copied ? 'Copied!' : 'Share'}
             </button>
             <button className="btn-primary" onClick={handlePlayNow} style={{ gridColumn: 'span 2', fontSize: '1rem', padding: '1rem' }}>
                 <PlayCircle size={20} /> Play Now
             </button>
          </div>
        </div>
      )}

    </div>
  );
}
