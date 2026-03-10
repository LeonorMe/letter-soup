import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Dices, LogOut, Trash2, Award, Share2, Target } from 'lucide-react';
import { generateRandomEnglishWords, generateSoup } from '../lib/soupGenerator';

export default function Home({ user, onLogout }) {
  const navigate = useNavigate();
  const [savedSoups, setSavedSoups] = useState([]);
  const [vocabWins, setVocabWins] = useState(0);
  const [vocabPoints, setVocabPoints] = useState(0);

  useEffect(() => {
    // Load soups from local storage
    const loaded = JSON.parse(localStorage.getItem(`soups_${user}`) || '[]');
    setSavedSoups(loaded);
    
    // Load vocab stats
    const wins = parseInt(localStorage.getItem(`vocab_wins_${user}`) || '0', 10);
    setVocabWins(wins);
    
    const points = parseInt(localStorage.getItem(`vocab_points_${user}`) || '0', 10);
    setVocabPoints(points);
  }, [user]);

  const handlePlayRandom = () => {
    const words = generateRandomEnglishWords();
    // Temporary testing: 5x5
    const { grid, words: placedWords, size } = generateSoup(words, 5);
    
    const soupData = {
      title: "Learn English Vocabulary",
      creator: "The Universe",
      grid,
      words: placedWords,
      size
    };
    
    // Encode in URL and navigate to Play
    const encoded = encodeURIComponent(JSON.stringify(soupData));
    navigate(`/play?data=${encoded}`);
  };

  const [copiedIndex, setCopiedIndex] = useState(null);

  const handlePlaySaved = (soup) => {
    const encoded = encodeURIComponent(JSON.stringify(soup));
    navigate(`/play?data=${encoded}`);
  };

  const handleShareSaved = async (soup, idx) => {
      const encoded = encodeURIComponent(JSON.stringify(soup));
      const base = window.location.href.split('#')[0];
      const link = `${base}#/play?data=${encoded}`;
      
      try {
          if (navigator.share) {
              await navigator.share({
                  title: soup.title,
                  text: 'I made a letter soup for you! 🍲',
                  url: link
              });
          } else {
              await navigator.clipboard.writeText(link);
              setCopiedIndex(idx);
              setTimeout(() => setCopiedIndex(null), 2000);
          }
      } catch (err) {
          console.error("Share failed", err);
      }
  };

  const handleDelete = (indexToDelete) => {
      const newSoups = savedSoups.filter((_, idx) => idx !== indexToDelete);
      setSavedSoups(newSoups);
      localStorage.setItem(`soups_${user}`, JSON.stringify(newSoups));
  };


  return (
    <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Welcome, {user}!
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>What's cooking today? 🍲</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
             {/* Word Points Badge */}
             {vocabPoints > 0 && (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    backgroundColor: 'rgba(82, 166, 117, 0.15)', // Mint Green
                    color: 'var(--primary)', 
                    padding: '0.3rem 0.6rem',
                    borderRadius: '100px',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                }} title={`${vocabPoints} vocabulary words found`}>
                    <Target size={16} /> {vocabPoints} pts
                </div>
             )}
             
             {/* Wins Badge */}
             {vocabWins > 0 && (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem', 
                    backgroundColor: 'rgba(255, 202, 58, 0.1)', 
                    color: '#eab308', /* Tailwind Yellow-500 equivalent */
                    padding: '0.3rem 0.6rem',
                    borderRadius: '100px',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                }} title={`${vocabWins} full vocabulary puzzles solved`}>
                    <Award size={16} /> {vocabWins}
                </div>
             )}
              <button onClick={onLogout} style={{ color: 'var(--text-muted)' }} title="Logout">
                <LogOut size={24} />
              </button>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="btn-primary" onClick={() => navigate('/create')} style={{ padding: '1.25rem' }}>
          <PlusCircle size={24} />
          Create New Soup
        </button>
        
        <button className="btn-secondary" onClick={handlePlayRandom} style={{ padding: '1.25rem', backgroundColor: 'var(--card-bg)' }}>
          <Dices size={24} />
          Learn English Vocabulary
        </button>
      </div>

      {/* Saved Soups */}
      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem' }}>
          Your Kitchen
        </h2>
        
        {savedSoups.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
             <p style={{ color: 'var(--text-muted)' }}>It's quiet in here...</p>
             <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>Create your first letter soup to share with friends!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {savedSoups.map((soup, idx) => (
              <div key={idx} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem' }}>
                <div onClick={() => handlePlaySaved(soup)} style={{ cursor: 'pointer', flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{soup.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {soup.words?.length || 0} words • {soup.size}x{soup.size}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => handleShareSaved(soup, idx)} style={{ color: 'var(--text-main)' }}>
                        {copiedIndex === idx ? <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Copied!</span> : <Share2 size={20}/>}
                    </button>
                    <button onClick={() => handlePlaySaved(soup)} style={{ color: 'var(--primary)', fontWeight: 600 }}>Play</button>
                    <button onClick={() => handleDelete(idx)} style={{ color: '#FF595E' }}><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
