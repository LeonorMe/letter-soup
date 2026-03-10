import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateSoup, RAINBOW_COLORS } from '../lib/soupGenerator';
import { ArrowLeft, Save, Play, PlayCircle, Eye, EyeOff, Share2, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CreateSoup({ user }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [words, setWords] = useState(['', '', '']);
  const [gridSize, setGridSize] = useState(10);
  
  // Keep track of refs to focus the next input when hitting enter
  const inputRefs = useRef([]);

  // Preview state
  const [previewSoup, setPreviewSoup] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const cleanWords = words.filter(w => w.trim().length > 1);

  // Lowest safe dynamic grid size bounds purely based on letter count and longest word. Minimum 5.
  const longestWordLen = cleanWords.length > 0 ? Math.max(...cleanWords.map(w => w.length)) : 0;
  const areaReq = cleanWords.length > 0 ? Math.ceil(Math.sqrt(cleanWords.reduce((acc, curr) => acc + curr.length, 0))) : 0;
  const minRequiredGridSize = Math.max(5, longestWordLen, areaReq);

  // If user has a smaller grid size set, push it up to the minimum required one
  useEffect(() => {
     if (gridSize < minRequiredGridSize) setGridSize(minRequiredGridSize);
  }, [minRequiredGridSize, gridSize]);

  const handleWordChange = (index, value) => {
    const newWords = [...words];
    newWords[index] = value.toUpperCase().replace(/[^A-Z]/g, '');
    setWords(newWords);
  };

  const handleKeyDown = (e, index) => {
      // If pressing enter inside a word field
      if (e.key === 'Enter') {
          e.preventDefault();
          
          if (index < 11) {
              // Should we add a new word row, or just jump to next existing?
              if (index === words.length - 1 && words[index].length > 0) {
                 addWordField(() => {
                     // Focus next after state update
                     setTimeout(() => {
                         if (inputRefs.current[index + 1]) {
                             inputRefs.current[index + 1].focus();
                         }
                     }, 10);
                 });
              } else if (inputRefs.current[index + 1]) {
                 inputRefs.current[index + 1].focus();
              }
          } else if (index === 11 && cleanWords.length > 0) {
              // At max words, Enter triggers the generation
              handleGeneratePreview();
          }
      }
  }

  const addWordField = (callback) => {
    if (words.length < 12) {
      setWords(prev => [...prev, '']);
      if (typeof callback === 'function') callback();
    }
  };

  const adjustGridSize = (amount) => {
      setGridSize(prev => {
          const newSize = prev + amount;
          return Math.max(minRequiredGridSize, Math.min(newSize, 30));
      });
  }

  const handleGeneratePreview = () => {
    if (cleanWords.length === 0) return;
    
    // Explicitly clamp size before generating
    const finalSize = Math.max(parseInt(gridSize, 10) || 5, minRequiredGridSize);
    
    const result = generateSoup(cleanWords, finalSize);
    setPreviewSoup({
      title: title || 'Secret Message',
      creator: user,
      grid: result.grid,
      words: result.words,
      size: result.size
    });
    
    // Auto-scroll to preview
    setTimeout(() => {
       window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleSave = () => {
    if (!previewSoup) return;
    const existing = JSON.parse(localStorage.getItem(`soups_${user}`) || '[]');
    existing.push(previewSoup);
    localStorage.setItem(`soups_${user}`, JSON.stringify(existing));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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
            Title
          </label>
          <input
            type="text"
            placeholder='e.g. "Happy Birthday!" or "You are amazing"'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
           <label style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.3rem', display: 'block' }}>
            Grid Size (Min {minRequiredGridSize})
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                onClick={() => adjustGridSize(-1)}
                disabled={gridSize <= minRequiredGridSize}
                style={{ 
                    backgroundColor: gridSize <= minRequiredGridSize ? 'var(--gray-selection)' : 'var(--primary)', 
                    color: '#FFF', 
                    borderRadius: '12px', 
                    padding: '0.8rem',
                    opacity: gridSize <= minRequiredGridSize ? 0.5 : 1
                }}
              >
                  <ChevronLeft size={20} />
              </button>
              
              <div style={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  fontSize: '1.2rem', 
                  fontWeight: 800, 
                  background: 'rgba(148, 163, 184, 0.1)',
                  padding: '0.75rem',
                  borderRadius: '12px'
              }}>
                  {gridSize}
              </div>

              <button 
                onClick={() => adjustGridSize(1)}
                disabled={gridSize >= 30}
                style={{ 
                    backgroundColor: gridSize >= 30 ? 'var(--gray-selection)' : 'var(--primary)', 
                    color: '#FFF', 
                    borderRadius: '12px', 
                    padding: '0.8rem',
                    opacity: gridSize >= 30 ? 0.5 : 1
                }}
              >
                  <ChevronRight size={20} />
              </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>
              Size adapts to fit words safely. Max 30x30.
          </p>
        </div>

        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, opacity: 0.8, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Words ({cleanWords.length}/12)</span>
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {words.map((word, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  ref={el => inputRefs.current[idx] = el}
                  type="text"
                  placeholder={`Word ${idx + 1}`}
                  value={word}
                  onChange={(e) => handleWordChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  style={{ textTransform: 'uppercase', padding: '0.75rem 1rem', flex: 1 }}
                />
                {words.length > 1 && (
                    <button onClick={() => removeWordField(idx)} style={{ color: 'var(--text-muted)', padding: '0.5rem' }}>✕</button>
                )}
              </div>
            ))}
            
            {words.length < 12 && (
               <button 
                  onClick={() => addWordField()} 
                  style={{ 
                      color: 'var(--primary)', 
                      fontWeight: 600, 
                      fontSize: '0.95rem',
                      padding: '0.75rem',
                      border: '2px dashed var(--gray-selection)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      marginTop: '0.5rem',
                      width: '100%'
                  }}
               >
                   <Plus size={18} /> Add Word
               </button>
            )}
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
         /* ... rest of the code is unchanged ... */
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
             <button className="btn-secondary" onClick={handleSave} disabled={isSaved} style={{ fontSize: '0.9rem', padding: '0.8rem', opacity: isSaved ? 0.7 : 1 }}>
                 <Save size={18} /> {isSaved ? 'Saved!' : 'Save'}
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
