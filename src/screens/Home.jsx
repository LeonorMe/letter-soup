import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Dices, LogOut, Trash2, Award } from 'lucide-react';
import { generateRandomEnglishWords, generateSoup } from '../lib/soupGenerator';

export default function Home({ user, onLogout }) {
  const navigate = useNavigate();
  const [savedSoups, setSavedSoups] = useState([]);
  const [vocabWins, setVocabWins] = useState(0);

  useEffect(() => {
    // Load soups from local storage
    const loaded = JSON.parse(localStorage.getItem(`soups_${user}`) || '[]');
    setSavedSoups(loaded);
    
    // Load vocab win stats
    const wins = parseInt(localStorage.getItem(`vocab_wins_${user}`) || '0', 10);
    setVocabWins(wins);
  }, [user]);

  const handlePlayRandom = () => {
    const words = generateRandomEnglishWords();
    // Default 10x10 as per requirements (adjusted dynamically in generateSoup)
    const { grid, words: placedWords, size } = generateSoup(words, 10);
    
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

  const handlePlaySaved = (soup) => {
    const encoded = encodeURIComponent(JSON.stringify(soup));
    navigate(`/play?data=${encoded}`);
  };

  const handleDelete = (indexToDelete) => {
      const newSoups = savedSoups.filter((_, idx) => idx !== indexToDelete);
      setSavedSoups(newSoups);
      localStorage.setItem(`soups_${user}`, JSON.stringify(newSoups));
  };


  return (
    <div style={{ padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Welcome, {user}!
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>What's cooking today? 🍲</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          {vocabWins > 0 && (
             <div style={{ 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: '0.4rem', 
                 backgroundColor: 'rgba(255, 202, 58, 0.1)', 
                 color: '#eab308', /* Tailwind Yellow-500 equivalent */
                 padding: '0.4rem 0.8rem',
                 borderRadius: '100px',
                 fontWeight: 700,
                 fontSize: '0.9rem'
             }} title={`${vocabWins} Vocabulary Soups solved`}>
                 <Award size={18} /> {vocabWins}
             </div>
          )}
          <button onClick={onLogout} style={{ color: 'var(--text-muted)' }} title="Logout">
            <LogOut size={24} />
          </button>
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
