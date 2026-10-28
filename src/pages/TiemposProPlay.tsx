import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { VerbPro } from '../types';
import { Loader } from '../components/Loader';
import mascotThumbsUp from '../assets/mascot_thumbsup.png';
import { CheckCircle2, XCircle, Award, RotateCcw, Trophy, ArrowLeft, HelpCircle } from 'lucide-react';

export const BACKUP_VERBS_PRO: VerbPro[] = [
    { id: 'bp1', sentence: 'I ___ to the school yesterday. (Go)', correctverbform: 'went', wrongtverbform1: 'gone', wrongtverbform2: 'going', traduction: 'Yo fui a la escuela ayer.' },
    { id: 'bp2', sentence: 'She is ___ a book right now. (Read)', correctverbform: 'reading', wrongtverbform1: 'read', wrongtverbform2: 'reads', traduction: 'Ella está leyendo un libro ahora mismo.' },
    { id: 'bp3', sentence: 'They have ___ all the orange juice. (Drink)', correctverbform: 'drunk', wrongtverbform1: 'drank', wrongtverbform2: 'drinking', traduction: 'Ellos han bebido todo el jugo de naranja.' },
    { id: 'bp4', sentence: 'We ___ soccer in the park last Sunday. (Play)', correctverbform: 'played', wrongtverbform1: 'playing', wrongtverbform2: 'plays', traduction: 'Jugamos al fútbol en el parque el domingo pasado.' },
    { id: 'bp5', sentence: 'He ___ his keys this morning. (Lose)', correctverbform: 'lost', wrongtverbform1: 'losing', wrongtverbform2: 'loses', traduction: 'Él perdió sus llaves esta mañana.' },
    { id: 'bp6', sentence: 'They are ___ to music in their room. (Listen)', correctverbform: 'listening', wrongtverbform1: 'listened', wrongtverbform2: 'listens', traduction: 'Ellos están escuchando música en su habitación.' },
    { id: 'bp7', sentence: 'She has ___ three letters today. (Write)', correctverbform: 'written', wrongtverbform1: 'wrote', wrongtverbform2: 'writing', traduction: 'Ella ha escrito tres cartas hoy.' },
    { id: 'bp8', sentence: 'My brother ___ early yesterday. (Wake up)', correctverbform: 'woke up', wrongtverbform1: 'woken up', wrongtverbform2: 'waking up', traduction: 'Mi hermano se despertó temprano ayer.' },
    { id: 'bp9', sentence: 'We are ___ dinner right now. (Cook)', correctverbform: 'cooking', wrongtverbform1: 'cooked', wrongtverbform2: 'cooks', traduction: 'Estamos cocinando la cena ahora mismo.' },
    { id: 'bp10', sentence: 'He ___ a new car last month. (Buy)', correctverbform: 'bought', wrongtverbform1: 'buying', wrongtverbform2: 'buys', traduction: 'Él compró un auto nuevo el mes pasado.' },
    { id: 'bp11', sentence: 'I have ___ this movie twice. (See)', correctverbform: 'seen', wrongtverbform1: 'saw', wrongtverbform2: 'seeing', traduction: 'He visto esta película dos veces.' },
    { id: 'bp12', sentence: 'Look! The baby is ___. (Sleep)', correctverbform: 'sleeping', wrongtverbform1: 'slept', wrongtverbform2: 'sleeps', traduction: '¡Mira! El bebé está durmiendo.' },
    { id: 'bp13', sentence: 'She ___ English very well every day. (Speak)', correctverbform: 'speaks', wrongtverbform1: 'speaking', wrongtverbform2: 'spoke', traduction: 'Ella habla inglés muy bien todos los días.' },
    { id: 'bp14', sentence: 'They ___ the museum two days ago. (Visit)', correctverbform: 'visited', wrongtverbform1: 'visiting', wrongtverbform2: 'visits', traduction: 'Ellos visitaron el museo hace dos días.' },
    { id: 'bp15', sentence: 'He has ___ his homework already. (Do)', correctverbform: 'done', wrongtverbform1: 'did', wrongtverbform2: 'doing', traduction: 'Él ya ha hecho su tarea.' }
];

export const LOCAL_VERBS_PRO_KEY = 'englishpan_verbs_pro';

interface TiemposProPlayProps {
    userEmail: string | undefined | null;
    setCurrentView: (view: string) => void;
}

export function TiemposProPlay({ userEmail, setCurrentView }: TiemposProPlayProps) {
    const [loading, setLoading] = useState(true);
    const [sessionSentences, setSessionSentences] = useState<VerbPro[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Score states
    const [points, setPoints] = useState(0);
    const [errors, setErrors] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Current question states
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

    const pointsRef = useRef(0);
    const errorsRef = useRef(0);

    useEffect(() => {
        pointsRef.current = points;
    }, [points]);

    useEffect(() => {
        errorsRef.current = errors;
    }, [errors]);

    useEffect(() => {
        loadGameData();
    }, []);

    // Set up options when currentIndex changes
    useEffect(() => {
        if (sessionSentences.length > 0 && currentIndex < sessionSentences.length) {
            const current = sessionSentences[currentIndex];
            const opts = [current.correctverbform, current.wrongtverbform1, current.wrongtverbform2];
            const shuffled = [...opts].sort(() => Math.random() - 0.5);
            setShuffledOptions(shuffled);
            setSelectedOption(null);
            setIsAnswered(false);
            setIsCorrect(null);
        }
    }, [currentIndex, sessionSentences]);

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
            console.error("Audio Context error:", err);
        }
    };

    const loadGameData = async () => {
        setLoading(true);
        try {
            let dbVerbsPro: VerbPro[] = [];
            const { data, error } = await supabase.from('verbs_pro').select('*');

            if (error) {
                console.warn("Supabase query error, falling back to local storage verbs_pro:", error);
                const cached = localStorage.getItem(LOCAL_VERBS_PRO_KEY);
                dbVerbsPro = cached ? JSON.parse(cached) : BACKUP_VERBS_PRO;
            } else if (!data || data.length < 5) {
                console.warn(`Only found ${data?.length || 0} verbs_pro in Supabase. Supplementing with backup records.`);
                dbVerbsPro = [...(data || [])];
                const existingSentences = new Set(dbVerbsPro.map(v => v.sentence.toLowerCase()));
                for (const backup of BACKUP_VERBS_PRO) {
                    if (!existingSentences.has(backup.sentence.toLowerCase())) {
                        dbVerbsPro.push(backup);
                    }
                    if (dbVerbsPro.length >= 15) break;
                }
            } else {
                dbVerbsPro = data;
            }

            // Shuffle and select exactly 5 sentences
            const shuffled = [...dbVerbsPro].sort(() => 0.5 - Math.random());
            setSessionSentences(shuffled.slice(0, 5));
        } catch (err) {
            console.error("Error setting up Tiempos Verbales Pro game:", err);
            const cached = localStorage.getItem(LOCAL_VERBS_PRO_KEY);
            const list = cached ? JSON.parse(cached) : BACKUP_VERBS_PRO;
            const shuffled = [...list].sort(() => 0.5 - Math.random());
            setSessionSentences(shuffled.slice(0, 5));
        } finally {
            setLoading(false);
        }
    };

    const saveGameResult = async (totalErrors: number, finalPoints: number) => {
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('rankings')
                .insert({
                    user_email: userEmail,
                    correct_hits: finalPoints,
                    incorrect_hits: totalErrors,
                    game_type: 'tiempos_verbales_pro'
                });
            if (error) throw error;
        } catch (err) {
            console.error("Error saving Tiempos Verbales Pro ranking:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleOptionClick = (option: string) => {
        if (isAnswered) return;

        const current = sessionSentences[currentIndex];
        const correct = option === current.correctverbform;

        setSelectedOption(option);
        setIsAnswered(true);
        setIsCorrect(correct);

        if (correct) {
            playSound('success');
            const newPoints = points + 20;
            setPoints(newPoints);
            pointsRef.current = newPoints;
        } else {
            playSound('error');
            const newErrors = errors + 1;
            setErrors(newErrors);
            errorsRef.current = newErrors;
        }
    };

    const handleNextSentence = () => {
        if (currentIndex + 1 < sessionSentences.length) {
            setCurrentIndex(idx => idx + 1);
        } else {
            setIsGameOver(true);
            saveGameResult(errorsRef.current, pointsRef.current);
        }
    };

    const handleRestart = () => {
        setIsGameOver(false);
        setCurrentIndex(0);
        setPoints(0);
        setErrors(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setIsCorrect(null);
        loadGameData();
    };

    if (loading) {
        return (
            <div className="glass-panel" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader />
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem' }}>Cargando oraciones Pro...</p>
                </div>
            </div>
        );
    }

    if (isGameOver) {
        const accuracy = Math.round((points / 100) * 100);
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
                    Has completado las 5 oraciones de Tiempos Verbales Pro.
                </p>

                {/* Score panel */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '360px', marginBottom: '2rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Puntos Totales</p>
                        <p style={{ color: 'var(--primary)', fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                            <Award size={22} />
                            {points}
                        </p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Errores</p>
                        <p style={{ color: errors > 0 ? 'var(--danger)' : 'var(--text-muted)', fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                            <XCircle size={22} />
                            {errors}
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
                        onClick={() => setCurrentView('tiempos_pro_intro')} 
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

    const current = sessionSentences[currentIndex];

    // Helper to render sentence with interactive gap
    const renderSentenceWithGap = () => {
        const parts = current.sentence.split('___');
        if (parts.length < 2) {
            return <span>{current.sentence}</span>;
        }

        const beforeGap = parts[0];
        const afterGap = parts.slice(1).join('___');

        return (
            <div style={{ fontSize: '1.4rem', lineHeight: '2.2rem', color: 'white', fontWeight: 500 }}>
                <span>{beforeGap}</span>
                <span 
                    style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '90px',
                        padding: '0.15rem 0.8rem',
                        margin: '0 0.4rem',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        transition: 'all 0.3s ease',
                        border: !isAnswered 
                            ? '2px dashed rgba(255, 183, 3, 0.6)' 
                            : isCorrect 
                                ? '2px solid var(--success)' 
                                : '2px solid var(--danger)',
                        background: !isAnswered 
                            ? 'rgba(255, 183, 3, 0.08)' 
                            : isCorrect 
                                ? 'rgba(16, 185, 129, 0.15)' 
                                : 'rgba(255, 68, 68, 0.15)',
                        color: !isAnswered 
                            ? 'var(--primary)' 
                            : isCorrect 
                                ? 'var(--success)' 
                                : 'var(--danger)',
                        boxShadow: isAnswered 
                            ? (isCorrect ? '0 0 14px rgba(16, 185, 129, 0.25)' : '0 0 14px rgba(255, 68, 68, 0.25)')
                            : 'none'
                    }}
                >
                    {isAnswered ? (isCorrect ? selectedOption : current.correctverbform) : '___'}
                </span>
                <span>{afterGap}</span>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header info */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => setCurrentView('tiempos_pro_intro')} title="Salir del juego" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                Tiempos Verbales Pro ⚡
                            </h1>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>PUNTOS</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {points}
                            </span>
                        </div>
                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>
                                {currentIndex + 1}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                /5
                            </span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', height: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / 5) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', height: '100%', transition: 'width 0.3s ease' }} />
                </div>
            </div>

            {/* Question card */}
            <div className="glass-panel" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Completa la oración</span>
                </div>

                {/* Sentence Display */}
                <div style={{ 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.06)', 
                    borderRadius: '16px', 
                    padding: '1.5rem',
                    width: '100%',
                    maxWidth: '540px'
                }}>
                    {renderSentenceWithGap()}
                </div>

                {/* Instruction */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <HelpCircle size={16} />
                    <span>Selecciona la forma verbal correcta:</span>
                </div>

                {/* 3 Options Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', width: '100%', maxWidth: '380px' }}>
                    {shuffledOptions.map((option, idx) => {
                        const isThisSelected = selectedOption === option;
                        const isThisCorrect = option === current.correctverbform;

                        let btnBg = 'rgba(255, 255, 255, 0.03)';
                        let btnBorder = '1px solid rgba(255, 255, 255, 0.08)';
                        let btnColor = 'white';
                        let btnShadow = 'none';

                        if (isAnswered) {
                            if (isThisCorrect) {
                                btnBg = 'rgba(16, 185, 129, 0.18)';
                                btnBorder = '2px solid var(--success)';
                                btnColor = 'var(--success)';
                                btnShadow = '0 0 16px rgba(16, 185, 129, 0.25)';
                            } else if (isThisSelected && !isThisCorrect) {
                                btnBg = 'rgba(255, 68, 68, 0.18)';
                                btnBorder = '2px solid var(--danger)';
                                btnColor = 'var(--danger)';
                                btnShadow = '0 0 16px rgba(255, 68, 68, 0.25)';
                            } else {
                                btnBg = 'rgba(255, 255, 255, 0.01)';
                                btnBorder = '1px solid rgba(255, 255, 255, 0.03)';
                                btnColor = 'rgba(255, 255, 255, 0.3)';
                            }
                        }

                        return (
                            <button
                                key={`${option}-${idx}`}
                                onClick={() => handleOptionClick(option)}
                                disabled={isAnswered}
                                style={{
                                    padding: '1.1rem',
                                    borderRadius: '16px',
                                    fontSize: '1.2rem',
                                    fontWeight: 600,
                                    cursor: isAnswered ? 'default' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center',
                                    background: btnBg,
                                    border: btnBorder,
                                    color: btnColor,
                                    boxShadow: btnShadow,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.6rem',
                                    animation: (isAnswered && isThisSelected && !isThisCorrect) ? 'shake 0.3s' : 'none'
                                }}
                            >
                                {isAnswered && isThisCorrect && <CheckCircle2 size={20} />}
                                {isAnswered && isThisSelected && !isThisCorrect && <XCircle size={20} />}
                                {option}
                            </button>
                        );
                    })}
                </div>

                {/* Translation revealed upon answering */}
                {isAnswered && (
                    <div style={{ 
                        animation: 'fadeIn 0.3s ease-out', 
                        background: 'rgba(255, 183, 3, 0.06)', 
                        border: '1px solid rgba(255, 183, 3, 0.2)', 
                        padding: '1rem 1.5rem', 
                        borderRadius: '14px', 
                        width: '100%', 
                        maxWidth: '480px' 
                    }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Traducción
                        </span>
                        <p style={{ fontSize: '1.15rem', color: 'white', fontWeight: 500, margin: '0.25rem 0 0' }}>
                            {current.traduction}
                        </p>
                    </div>
                )}
            </div>

            {/* Next button */}
            {isAnswered && (
                <div style={{ display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.3s' }}>
                    <button 
                        className="btn btn-primary animate-pulse" 
                        onClick={handleNextSentence}
                        style={{ 
                            padding: '0.85rem 2.5rem', 
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 15px rgba(255, 183, 3, 0.3)'
                        }}
                    >
                        {currentIndex + 1 === 5 ? 'Finalizar Partida 🏁' : 'Siguiente Oración ➡️'}
                    </button>
                </div>
            )}

            {/* Error footer count */}
            <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Errores en esta sesión: <strong style={{ color: errors > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{errors}</strong>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
