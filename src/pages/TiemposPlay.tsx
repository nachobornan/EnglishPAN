import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Verb } from '../types';
import { Loader } from '../components/Loader';
import mascotThumbsUp from '../assets/mascot_thumbsup.png';
import { CheckCircle2, XCircle, Award, RotateCcw, Trophy, ArrowLeft, HelpCircle } from 'lucide-react';

const BACKUP_VERBS: Verb[] = [
    { id: 'bv1', verbo: 'be', traduccion: 'ser/estar', pasado: 'was/were', error1: 'beed', error2: 'ben' },
    { id: 'bv2', verbo: 'beat', traduccion: 'golpear', pasado: 'beat', error1: 'beated', error2: 'beaten' },
    { id: 'bv3', verbo: 'become', traduccion: 'convertirse', pasado: 'became', error1: 'becomed', error2: 'becumen' },
    { id: 'bv4', verbo: 'begin', traduccion: 'empezar', pasado: 'began', error1: 'begined', error2: 'begun' },
    { id: 'bv5', verbo: 'bite', traduccion: 'morder', pasado: 'bit', error1: 'bited', error2: 'bitten' },
    { id: 'bv6', verbo: 'blow', traduccion: 'soplar', pasado: 'blew', error1: 'blowed', error2: 'blown' },
    { id: 'bv7', verbo: 'break', traduccion: 'romper', pasado: 'broke', error1: 'breaked', error2: 'broked' },
    { id: 'bv8', verbo: 'bring', traduccion: 'traer', pasado: 'brought', error1: 'bringed', error2: 'brang' },
    { id: 'bv9', verbo: 'burn', traduccion: 'quemar', pasado: 'burnt/burned', error1: 'burned', error2: 'burn' },
    { id: 'bv10', verbo: 'build', traduccion: 'construir', pasado: 'built', error1: 'builded', error2: 'builted' },
    { id: 'bv11', verbo: 'buy', traduccion: 'comprar', pasado: 'bought', error1: 'buyed', error2: 'buyed' },
    { id: 'bv12', verbo: 'can', traduccion: 'poder', pasado: 'could', error1: 'caned', error2: 'canned' }
];

const LOCAL_VERBS_KEY = 'englishpan_verbs';

interface TiemposPlayProps {
    userEmail: string | undefined | null;
    setCurrentView: (view: string) => void;
}

export function TiemposPlay({ userEmail, setCurrentView }: TiemposPlayProps) {
    const [loading, setLoading] = useState(true);
    const [sessionVerbs, setSessionVerbs] = useState<Verb[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Score states
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Answer states for the current verb
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [wrongOptions, setWrongOptions] = useState<Set<string>>(new Set());
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

    useEffect(() => {
        loadGameData();
    }, []);

    // Shuffle options when the verb index changes
    useEffect(() => {
        if (sessionVerbs.length > 0 && currentIndex < sessionVerbs.length) {
            const verb = sessionVerbs[currentIndex];
            const opts = [verb.pasado, verb.error1, verb.error2];
            // Shuffle
            const shuffled = [...opts].sort(() => Math.random() - 0.5);
            setShuffledOptions(shuffled);
            setSelectedOption(null);
            setWrongOptions(new Set());
        }
    }, [currentIndex, sessionVerbs]);

    const playSound = (type: 'success' | 'error') => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            const ctx = new AudioContextClass();
            const now = ctx.currentTime;

            if (type === 'success') {
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
            console.error("Audio Context failed:", err);
        }
    };

    const loadGameData = async () => {
        setLoading(true);
        try {
            let dbVerbs: Verb[] = [];
            const { data, error } = await supabase.from('verbs').select('*');

            if (error) {
                console.warn("Supabase query error, falling back to local storage verbs:", error);
                const cached = localStorage.getItem(LOCAL_VERBS_KEY);
                dbVerbs = cached ? JSON.parse(cached) : BACKUP_VERBS;
            } else if (!data || data.length < 8) {
                console.warn(`Only found ${data?.length || 0} verbs in Supabase. Supplementing with seed verbs.`);
                dbVerbs = [...(data || [])];
                const existingVerbs = new Set(dbVerbs.map(v => v.verbo.toLowerCase()));
                for (const backup of BACKUP_VERBS) {
                    if (!existingVerbs.has(backup.verbo.toLowerCase())) {
                        dbVerbs.push(backup);
                    }
                    if (dbVerbs.length >= 12) break;
                }
            } else {
                dbVerbs = data;
            }

            // Shuffle and slice to select exactly 8 verbs for the session
            const shuffled = [...dbVerbs].sort(() => 0.5 - Math.random());
            setSessionVerbs(shuffled.slice(0, 8));
        } catch (err) {
            console.error("Error setting up verbal tenses game:", err);
            const cached = localStorage.getItem(LOCAL_VERBS_KEY);
            const list = cached ? JSON.parse(cached) : BACKUP_VERBS;
            const shuffled = [...list].sort(() => 0.5 - Math.random());
            setSessionVerbs(shuffled.slice(0, 8));
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
                    correct_hits: 8,
                    incorrect_hits: errors,
                    game_type: 'tiempos_verbales'
                });
            if (error) throw error;
        } catch (err) {
            console.error("Error saving verbal tenses ranking:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOptionClick = (option: string) => {
        if (selectedOption || wrongOptions.has(option)) return;

        const currentVerb = sessionVerbs[currentIndex];
        if (option === currentVerb.pasado) {
            playSound('success');
            setSelectedOption(option);

            setTimeout(() => {
                if (currentIndex + 1 < sessionVerbs.length) {
                    setCorrectCount(c => c + 1);
                    setCurrentIndex(idx => idx + 1);
                } else {
                    setCorrectCount(c => c + 1); // completes to 8
                    setIsGameOver(true);
                    saveGameResult(incorrectCount);
                }
            }, 800);
        } else {
            playSound('error');
            setWrongOptions(prev => {
                const next = new Set(prev);
                next.add(option);
                return next;
            });
            setIncorrectCount(c => c + 1);
        }
    };

    const handleRestart = () => {
        setIsGameOver(false);
        setCurrentIndex(0);
        setCorrectCount(0);
        setIncorrectCount(0);
        setSelectedOption(null);
        setWrongOptions(new Set());
        loadGameData();
    };

    if (loading) {
        return (
            <div className="glass-panel" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader />
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem' }}>Cargando verbos...</p>
                </div>
            </div>
        );
    }

    if (isGameOver) {
        const accuracy = Math.round((8 / (8 + incorrectCount)) * 100);
        return (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 2rem', animation: 'fadeIn 0.3s ease-out' }}>
                <img 
                    src={mascotThumbsUp} 
                    alt="Mascot Thumbs Up" 
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
                    Has completado los 8 verbos en pasado.
                </p>

                {/* Score panel */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '360px', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aciertos</p>
                        <p style={{ color: 'var(--secondary)', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={20} />
                            8
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '300px' }}>
                    <button className="btn btn-primary" onClick={handleRestart} style={{ width: '100%' }}>
                        <RotateCcw size={18} />
                        Volver a jugar
                    </button>
                    <button 
                        className="btn" 
                        onClick={() => setCurrentView('tiempos_intro')} 
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

    const currentVerb = sessionVerbs[currentIndex];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header info */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => setCurrentView('tiempos_intro')} title="Salir del juego" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                Tiempos Verbales ⚡
                            </h1>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            {correctCount}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            /8
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', height: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: `${(correctCount / 8) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', height: '100%', transition: 'width 0.3s ease' }} />
                </div>
            </div>

            {/* Question card */}
            <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Verbo Infinitivo</span>
                    <h2 style={{ fontSize: '2.2rem', color: 'white', fontWeight: 700, margin: 0 }}>{currentVerb.verbo}</h2>
                    <span style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 500 }}>({currentVerb.traduccion})</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                    <HelpCircle size={16} />
                    <span>Selecciona la forma correcta en pasado simple:</span>
                </div>

                {/* Shuffled Options buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '360px' }}>
                    {shuffledOptions.map((option, idx) => {
                        const isSelected = selectedOption === option;
                        const isWrong = wrongOptions.has(option);

                        let btnStyle = {
                            padding: '1.1rem',
                            borderRadius: '16px',
                            fontSize: '1.05rem',
                            fontWeight: 600,
                            cursor: (isSelected || isWrong) ? 'default' : 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'center' as const,
                            background: isSelected 
                                ? 'rgba(16, 185, 129, 0.15)' 
                                : isWrong 
                                    ? 'rgba(255, 68, 68, 0.15)' 
                                    : 'rgba(255, 255, 255, 0.03)',
                            border: isSelected
                                ? '2px solid var(--success)'
                                : isWrong
                                    ? '2px solid var(--danger)'
                                    : '1px solid rgba(255, 255, 255, 0.08)',
                            color: isSelected
                                ? 'var(--success)'
                                : isWrong
                                    ? 'var(--danger)'
                                    : 'white',
                            boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.2)' : 'none',
                            animation: isWrong ? 'shake 0.3s' : 'none'
                        };

                        return (
                            <button
                                key={`${option}-${idx}`}
                                style={btnStyle}
                                onClick={() => handleOptionClick(option)}
                                disabled={!!selectedOption || isWrong}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Error count footer */}
            <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Errores en esta sesión: <strong style={{ color: incorrectCount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{incorrectCount}</strong>
            </div>

            {/* Shake animation stylesheet */}
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
