import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Award, RefreshCcw } from 'lucide-react';

export default function PlaySoup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [soupData, setSoupData] = useState(null);
  const [selection, setSelection] = useState([]); // Array of {r, c}
  const [foundWords, setFoundWords] = useState([]); // Array of word objects

  // For touch drag implementation
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const dataEncoded = searchParams.get('data');
    if (dataEncoded) {
      try {
        const parsed = JSON.parse(decodeURIComponent(dataEncoded));
        // Ensure all words have a fresh 'found' state when initialized
        parsed.words = parsed.words.map(w => ({ ...w, found: false }));
        setSoupData(parsed);
      } catch (err) {
        console.error("Invalid soup data", err);
      }
    }
  }, [searchParams]);

  // We check if the current selection exactly matches any of the unfound words
  useEffect(() => {
     if (selection.length > 0 && soupData) {
         // Sort selection to make comparison independent of click order
         const sortedSelectionCells = [...selection].sort((a,b) => (a.r===b.r ? a.c - b.c : a.r - b.r));
         const selectionKeys = sortedSelectionCells.map(c => getCellKey(c.r, c.c)).join(',');

         // Check against unfound words
         const unfoundWords = soupData.words.filter(w => !foundWords.find(fw => fw.word === w.word));
         
         for (const w of unfoundWords) {
             const wordCellsSorted = [...w.cells].sort((a,b) => (a.r===b.r ? a.c - b.c : a.r - b.r));
             const wordKeys = wordCellsSorted.map(c => getCellKey(c.r, c.c)).join(',');
             
             if (selectionKeys === wordKeys) {
                 // Match found!
                 setFoundWords(prev => [...prev, w]);
                 setSelection([]); // Clear selection
                 
                 // If that was the last word, we win!
                 break;
             }
         }
     }
  }, [selection, soupData, foundWords]);

  if (!soupData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading soup...</p>
        <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '1rem' }}>Go Home</button>
      </div>
    );
  }

  const isWin = foundWords.length === soupData.words.length && soupData.words.length > 0;

  // --- Interaction Logic (Click / Drag to select) ---

  const getCellKey = (r, c) => `${r}-${c}`;

  const toggleCell = (r, c) => {
    if (isWin) return;
    
    setSelection(prev => {
        const exists = prev.findIndex(item => item.r === r && item.c === c);
        let newSel = [...prev];
        if (exists >= 0) {
            // Remove it
            newSel.splice(exists, 1);
        } else {
            // Add it
            newSel.push({ r, c });
        }
        return newSel;
    });
  };


  // Helper to determine cell styling
  const getCellBackground = (r, c) => {
      // 1. Is it part of a found word? (Takes precedence, colorized)
      for (const fw of foundWords) {
          if (fw.cells.find(cell => cell.r === r && cell.c === c)) {
              return fw.color;
          }
      }

      // 2. Is it currently selected? (Gray)
      if (selection.find(cell => cell.r === r && cell.c === c)) {
          return 'var(--gray-selection)';
      }

      // 3. Default
      return 'var(--card-bg)';
  };

  const getCellTextColor = (r, c) => {
    for (const fw of foundWords) {
          if (fw.cells.find(cell => cell.r === r && cell.c === c)) {
              return '#FFF'; // white text on colorful background
          }
      }
      return 'var(--text-main)';
  }


  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100vh', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/')} style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Home
        </button>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {foundWords.length} / {soupData.words.length} found
        </div>
      </div>

      {/* Soup Info */}
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.2 }}>
            {soupData.title}
        </h1>
        {soupData.creator && (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                From: <span style={{ fontWeight: 700 }}>{soupData.creator}</span>
            </p>
        )}
      </div>

      {/* Grid Container */}
      <div className="glass-panel" style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${soupData.size}, 1fr)`, 
              gap: soupData.size > 20 ? '1px' : '2px', // Reduce gap for huge grids
              backgroundColor: 'var(--gray-selection-border)',
              padding: '4px',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '100%',
              aspectRatio: '1', // Ensure it stays square
              touchAction: 'none' // Prevent scrolling when tapping dragging
          }}>
             {soupData.grid.map((row, rIdx) => 
               row.map((letter, cIdx) => {
                  return (
                      <div 
                        key={getCellKey(rIdx, cIdx)} 
                        className="cell"
                        onClick={() => toggleCell(rIdx, cIdx)}
                        style={{ 
                            backgroundColor: getCellBackground(rIdx, cIdx), 
                            color: getCellTextColor(rIdx, cIdx), 
                            borderRadius: '4px', 
                            fontSize: soupData.size > 18 ? '0.7rem' : soupData.size > 14 ? '0.85rem' : '1.1rem',
                            transition: 'all 0.15s ease'
                        }}
                      >
                         {letter}
                      </div>
                  )
               })
             )}
          </div>
      </div>

      {/* Win State / Word List */}
      <div className="glass-panel" style={{ marginTop: '0.5rem' }}>
         {isWin ? (
             <div style={{ textAlign: 'center', animation: 'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                 <div style={{ color: '#FFCA3A', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                     <Award size={48} />
                 </div>
                 <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>You won!</h2>
                 <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>All words found successfully.</p>
                 
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {soupData.words.map((w, idx) => (
                         <span key={idx} style={{ backgroundColor: w.color, color: '#FFF', padding: '0.3rem 0.8rem', borderRadius: '100px', fontWeight: 700, fontSize: '0.9rem' }}>
                             {w.word}
                         </span>
                    ))}
                 </div>

                 <button className="btn-primary" onClick={() => navigate('/')}>
                     Back to menu
                 </button>
             </div>
         ) : (
             <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                    Words to find:
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {/* Only show the words in order the creator added them, as requested */}
                    {soupData.words.map((w, idx) => {
                        const isFound = foundWords.find(fw => fw.word === w.word);
                        return (
                            <span 
                                key={idx} 
                                style={{ 
                                    padding: '0.3rem 0.8rem', 
                                    borderRadius: '100px', 
                                    fontWeight: 600, 
                                    fontSize: '0.9rem',
                                    backgroundColor: isFound ? w.color : 'transparent',
                                    color: isFound ? '#FFF' : 'var(--text-muted)',
                                    border: isFound ? '2px solid transparent' : '2px solid var(--gray-selection)',
                                    transition: 'all 0.3s ease'
                                }}
                            >
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
