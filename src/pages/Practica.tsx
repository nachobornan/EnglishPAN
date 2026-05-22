import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Word } from '../types';
import mascotThumbsUp from '../assets/mascot_thumbsup.png';
import { Loader } from '../components/Loader';
import { Trophy, RotateCcw, Award, CheckCircle2, XCircle } from 'lucide-react';

// 20 Seed words as robust fallback
const BACKUP_WORDS: Word[] = [
    { id: 'b1', word: 'cat', translation: 'gato' },
    { id: 'b2', word: 'dog', translation: 'perro' },
    { id: 'b3', word: 'climb', translation: 'escalar' },
    { id: 'b4', word: 'like', translation: 'gustar' },
    { id: 'b5', word: 'have', translation: 'tener' },
    { id: 'b6', word: 'beautiful', translation: 'hermoso' },
    { id: 'b7', word: 'house', translation: 'casa' },
    { id: 'b8', word: 'apple', translation: 'manzana' },
    { id: 'b9', word: 'run', translation: 'correr' },
    { id: 'b10', word: 'water', translation: 'agua' },
    { id: 'b11', word: 'book', translation: 'libro' },
    { id: 'b12', word: 'friend', translation: 'amigo' },
    { id: 'b13', word: 'sleep', translation: 'dormir' },
    { id: 'b14', word: 'happy', translation: 'feliz' },
    { id: 'b15', word: 'green', translation: 'verde' },
    { id: 'b16', word: 'speak', translation: 'hablar' },
    { id: 'b17', word: 'write', translation: 'escribir' },
    { id: 'b18', word: 'work', translation: 'trabajar' },
    { id: 'b19', word: 'easy', translation: 'fácil' },
    { id: 'b20', word: 'love', translation: 'amor' }
];

interface PracticaProps {
    userEmail: string | undefined | null;
    setCurrentView: (view: string) => void;
}

export function Practica({ userEmail, setCurrentView }: PracticaProps) {
    const [loading, setLoading] = useState(true);
    const [leftCol, setLeftCol] = useState<(Word | null)[]>([]);
    const [rightCol, setRightCol] = useState<(Word | null)[]>([]);
    const [queue, setQueue] = useState<Word[]>([]);

    // Game selections
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);

    // Matching states for visual feedback
    const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
    const [wrongLeftId, setWrongLeftId] = useState<string | null>(null);
    const [wrongRightId, setWrongRightId] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    // Scores
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Keep refs of columns and queue to avoid stale closures in timeouts and prevent loop dependencies
    const leftColRef = useRef(leftCol);
    const rightColRef = useRef(rightCol);
    const queueRef = useRef(queue);
    const incorrectCountRef = useRef(incorrectCount);

    useEffect(() => { leftColRef.current = leftCol; }, [leftCol]);
    useEffect(() => { rightColRef.current = rightCol; }, [rightCol]);
    useEffect(() => { queueRef.current = queue; }, [queue]);
    useEffect(() => { incorrectCountRef.current = incorrectCount; }, [incorrectCount]);

    // Initialize game
    useEffect(() => {
        loadGameData();
    }, []);

    // Handle Game Over when correct count reaches 15
    useEffect(() => {
        if (correctCount === 15) {
            setIsGameOver(true);
            saveGameResult(incorrectCountRef.current);
        }
    }, [correctCount]);

    // Game Loop / Matching Check
    useEffect(() => {
        if (selectedLeft && selectedRight) {
            setIsChecking(true);
            
            if (selectedLeft === selectedRight) {
                // Correct match
                playSound('success');
                setMatchedIds(prev => {
                    const next = new Set(prev);
                    next.add(selectedLeft);
                    return next;
                });

                const timer = setTimeout(() => {
                    // Find positions of the matched pair using refs
                    const leftIdx = leftColRef.current.findIndex(w => w?.id === selectedLeft);
                    const rightIdx = rightColRef.current.findIndex(w => w?.id === selectedRight);

                    const nextWord = queueRef.current[0] || null;

                    setLeftCol(prev => {
                        const next = [...prev];
                        if (leftIdx !== -1) next[leftIdx] = nextWord;
                        return next;
                    });

                    setRightCol(prev => {
                        const next = [...prev];
                        if (rightIdx !== -1) next[rightIdx] = nextWord;
                        return next;
                    });

                    if (queueRef.current.length > 0) {
                        setQueue(prev => prev.slice(1));
                    }

                    // Remove current matched item from set (it's getting replaced)
                    setMatchedIds(prev => {
                        const next = new Set(prev);
                        next.delete(selectedLeft);
                        return next;
                    });

                    setCorrectCount(c => c + 1);

                    setSelectedLeft(null);
                    setSelectedRight(null);
                    setIsChecking(false);
                }, 500);

                return () => clearTimeout(timer);
            } else {
                // Incorrect match
                playSound('error');
                setWrongLeftId(selectedLeft);
                setWrongRightId(selectedRight);
                setIncorrectCount(c => c + 1);

                const timer = setTimeout(() => {
                    setWrongLeftId(null);
                    setWrongRightId(null);
                    setSelectedLeft(null);
                    setSelectedRight(null);
                    setIsChecking(false);
                }, 500);

                return () => clearTimeout(timer);
            }
        }
    }, [selectedLeft, selectedRight]);

    const playSound = (type: 'success' | 'error') => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const now = ctx.currentTime;

            if (type === 'success') {
                // Ascending C5 to G5
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.setValueAtTime(523.25, now); // C5
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                osc.start(now);

                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'triangle';
                osc2.connect(gain2);
                gain2.connect(ctx.destination);

                osc2.frequency.setValueAtTime(783.99, now + 0.12); // G5
                gain2.gain.setValueAtTime(0.15, now + 0.12);
                gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                osc2.start(now + 0.12);

                osc.stop(now + 0.2);
                osc2.stop(now + 0.4);
            } else {
                // Descending sawtooth buzz
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.setValueAtTime(160, now);
                osc.frequency.linearRampToValueAtTime(70, now + 0.25);

                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

                osc.start(now);
                osc.stop(now + 0.3);
            }
        } catch (err) {
            console.error("Failed to play sound via AudioContext:", err);
        }
    };

    const loadGameData = async () => {
        setLoading(true);
        try {
            let dbWords: Word[] = [];
            const { data, error } = await supabase.from('words').select('*');

            if (error) {
                console.warn("Supabase query error, falling back to seed words:", error);
                dbWords = BACKUP_WORDS;
            } else if (!data || data.length < 15) {
                console.warn(`Only found ${data?.length || 0} words in Supabase. Supplementing with seed words.`);
                dbWords = [...(data || [])];
                const existingWords = new Set(dbWords.map(w => w.word.toLowerCase()));
                for (const backup of BACKUP_WORDS) {
                    if (!existingWords.has(backup.word.toLowerCase())) {
                        dbWords.push(backup);
                    }
                    if (dbWords.length >= 20) break;
                }
            } else {
                dbWords = data;
            }

            // Shuffle and slice to get exactly 15 words
            const shuffled = [...dbWords].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 15);

            const initial5 = selected.slice(0, 5);
            const remaining = selected.slice(5);

            setLeftCol(initial5);
            setRightCol([...initial5].sort(() => 0.5 - Math.random()));
            setQueue(remaining);
        } catch (err) {
            console.error("Error setting up game:", err);
            const selected = BACKUP_WORDS.slice(0, 15);
            setLeftCol(selected.slice(0, 5));
            setRightCol([...selected.slice(0, 5)].sort(() => 0.5 - Math.random()));
            setQueue(selected.slice(5));
        } finally {
            setLoading(false);
        }
    };

    const saveGameResult = async (errors: number) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('rankings')
                .insert({
                    user_email: userEmail,
                    correct_hits: 15,
                    incorrect_hits: errors,
                    game_type: 'vocabulario'
                });
            if (error) throw error;
        } catch (err) {
            console.error("Error persisting game rankings to Supabase:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRestart = () => {
        setIsGameOver(false);
        setCorrectCount(0);
        setIncorrectCount(0);
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongLeftId(null);
        setWrongRightId(null);
        setMatchedIds(new Set());
        setIsChecking(false);
        loadGameData();
    };

    const handleLeftClick = (id: string) => {
        if (isChecking) return;
        if (selectedLeft === id) {
            setSelectedLeft(null);
        } else {
            setSelectedLeft(id);
        }
    };

    const handleRightClick = (id: string) => {
        if (isChecking) return;
        if (selectedRight === id) {
            setSelectedRight(null);
        } else {
            setSelectedRight(id);
        }
    };

    if (loading) {
        return (
            <div className="glass-panel" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader />
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem' }}>Cargando palabras...</p>
                </div>
            </div>
        );
    }

    if (isGameOver) {
        const accuracy = Math.round((15 / (15 + incorrectCount)) * 100);
        return (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 2rem', animation: 'fadeIn 0.3s ease-out' }}>
                <img 
                    src={mascotThumbsUp} 
                    alt="EnglishPAN Thumbs Up Mascot" 
                    style={{ 
                        height: "150px", 
                        width: "150px", 
                        objectFit: "contain",
                        marginBottom: '1.5rem',
                        animation: "thumbsUpBounce 2.5s infinite"
                    }} 
                />
                
                <h1 className="page-title" style={{ fontSize: '2rem', color: 'white', marginBottom: '0.5rem' }}>
                    ¡Sesión Completada! 🎉
                </h1>
                <p className="item-subtitle" style={{ fontSize: '1rem', marginBottom: '2rem' }}>
                    Has emparejado las 15 palabras de hoy.
                </p>

                {/* Score panel */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '360px', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aciertos</p>
                        <p style={{ color: 'var(--secondary)', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={20} />
                            15
                        </p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Errores</p>
                        <p style={{ color: incorrectCount > 0 ? 'var(--danger)' : 'var(--text-muted)', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                            <XCircle size={20} />
                            {incorrectCount}
                        </p>
                    </div>
                </div>

                <div style={{ marginBottom: '2.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={18} style={{ color: 'gold' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Precisión:</span>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>{accuracy}%</span>
                </div>

                {isSaving && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="animate-pulse">💾 Guardando puntuación en Supabase...</span>
                    </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '300px' }}>
                    <button className="btn btn-primary" onClick={handleRestart} style={{ width: '100%' }}>
                        <RotateCcw size={18} />
                        Volver a jugar
                    </button>
                    <button 
                        className="btn" 
                        onClick={() => setCurrentView('vocabulario_intro')} 
                        style={{ 
                            width: '100%', 
                            background: 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            color: 'white' 
                        }}
                    >
                        <Trophy size={18} style={{ color: 'gold' }} />
                        Ver Ranking
                    </button>
                </div>

                <style>{`
                    @keyframes thumbsUpBounce {
                        0%, 100% { transform: translateY(0) scale(1); }
                        50% { transform: translateY(-8px) scale(1.02); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header info */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Práctica 🎯
                        </h1>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            Selecciona una palabra en inglés y su traducción correcta.
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {correctCount}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            /15
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', height: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: `${(correctCount / 15) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', height: '100%', transition: 'width 0.3s ease' }} />
                </div>
            </div>

            {/* Board grid */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Left Column (English) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem', paddingLeft: '0.25rem' }}>Inglés</h3>
                    {leftCol.map((item, idx) => {
                        if (!item) return <div key={`empty-left-${idx}`} style={{ height: '54px' }} />;
                        
                        const isSelected = selectedLeft === item.id;
                        const isMatched = matchedIds.has(item.id);
                        const isWrong = wrongLeftId === item.id;

                        let btnStyle = {
                            height: '54px',
                            borderRadius: '14px',
                            background: isSelected 
                                ? 'rgba(255, 183, 3, 0.15)' 
                                : isMatched 
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : isWrong
                                        ? 'rgba(255, 68, 68, 0.15)'
                                        : 'rgba(255,255,255,0.03)',
                            border: isSelected
                                ? '1px solid var(--primary)'
                                : isMatched
                                    ? '1px solid var(--success)'
                                    : isWrong
                                        ? '1px solid var(--danger)'
                                        : '1px solid rgba(255, 255, 255, 0.08)',
                            color: isMatched
                                ? 'var(--success)'
                                : isWrong
                                    ? 'var(--danger)'
                                    : isSelected
                                        ? 'var(--primary)'
                                        : 'white',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isSelected ? '0 0 12px rgba(255, 183, 3, 0.2)' : 'none',
                            animation: isWrong ? 'shake 0.3s' : 'none'
                        };

                        return (
                            <button
                                key={`left-${item.id}-${idx}`}
                                style={btnStyle}
                                onClick={() => handleLeftClick(item.id)}
                                disabled={isChecking || isMatched || isWrong}
                            >
                                {item.word}
                            </button>
                        );
                    })}
                </div>

                {/* Right Column (Spanish) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem', paddingLeft: '0.25rem' }}>Español</h3>
                    {rightCol.map((item, idx) => {
                        if (!item) return <div key={`empty-right-${idx}`} style={{ height: '54px' }} />;
                        
                        const isSelected = selectedRight === item.id;
                        const isMatched = matchedIds.has(item.id);
                        const isWrong = wrongRightId === item.id;

                        let btnStyle = {
                            height: '54px',
                            borderRadius: '14px',
                            background: isSelected 
                                ? 'rgba(255, 183, 3, 0.15)' 
                                : isMatched 
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : isWrong
                                        ? 'rgba(255, 68, 68, 0.15)'
                                        : 'rgba(255,255,255,0.03)',
                            border: isSelected
                                ? '1px solid var(--primary)'
                                : isMatched
                                    ? '1px solid var(--success)'
                                    : isWrong
                                        ? '1px solid var(--danger)'
                                        : '1px solid rgba(255, 255, 255, 0.08)',
                            color: isMatched
                                ? 'var(--success)'
                                : isWrong
                                    ? 'var(--danger)'
                                    : isSelected
                                        ? 'var(--primary)'
                                        : 'white',
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isSelected ? '0 0 12px rgba(255, 183, 3, 0.2)' : 'none',
                            animation: isWrong ? 'shake 0.3s' : 'none'
                        };

                        return (
                            <button
                                key={`right-${item.id}-${idx}`}
                                style={btnStyle}
                                onClick={() => handleRightClick(item.id)}
                                disabled={isChecking || isMatched || isWrong}
                            >
                                {item.translation}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* In-game live error count */}
            <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Errores en esta sesión: <strong style={{ color: incorrectCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{incorrectCount}</strong>
            </div>

            {/* Animations style */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
            `}</style>
        </div>
    );
}
