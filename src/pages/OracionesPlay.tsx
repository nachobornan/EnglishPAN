import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Sentence } from '../types';
import { Loader } from '../components/Loader';
import mascotThumbsUp from '../assets/mascot_thumbsup.png';
import { XCircle, Award, RotateCcw, Trophy, ArrowLeft, HelpCircle } from 'lucide-react';

const BACKUP_SENTENCES: Sentence[] = [
    { id: 'bs1', traduccion: 'Ellos fueron a nueva york', parte1: 'They', parte2: 'went', parte3: 'to new york', parte4: null, parte5: null },
    { id: 'bs2', traduccion: 'Ella fue hace 2 años', parte1: 'She', parte2: 'went', parte3: 'two years', parte4: 'ago', parte5: null },
    { id: 'bs3', traduccion: 'Soy bueno leyendo', parte1: 'I am', parte2: 'good at', parte3: 'reading', parte4: null, parte5: null },
    { id: 'bs4', traduccion: 'Cuando me levanto me lavo los dientes', parte1: 'When I', parte2: 'get up I', parte3: 'brush my', parte4: 'teeth', parte5: null },
    { id: 'bs5', traduccion: 'Me gusta tomar el desayuno con pan', parte1: 'I like', parte2: 'to have', parte3: 'breakfast', parte4: 'with bread', parte5: null },
    { id: 'bs6', traduccion: 'A qué hora vas a la escuela?', parte1: 'What time', parte2: 'do you', parte3: 'go to school?', parte4: null, parte5: null },
    { id: 'bs7', traduccion: 'Hace dos veranos, hicimos un viaje a Nueva York.', parte1: 'Two summers ago', parte2: 'we went', parte3: 'on a trip', parte4: 'to New York.', parte5: null },
    { id: 'bs8', traduccion: 'El viaje fue muy largo, pero estábamos muy emocionados.', parte1: 'The journey', parte2: 'was so long', parte3: 'but we were', parte4: 'very excited.', parte5: null },
    { id: 'bs9', traduccion: 'Cuando llegamos al hotel nos fuimos a dormir.', parte1: 'When we arrive', parte2: 'at the hotel', parte3: 'we went', parte4: 'to sleep.', parte5: null },
    { id: 'bs10', traduccion: 'Crees tu que ella es una buena conductora de biciletas?', parte1: 'Do you think', parte2: "she's a good", parte3: 'bike rider?', parte4: null, parte5: null },
    { id: 'bs11', traduccion: '¿Cree ella que nosotros somos buenos cantantes?', parte1: 'Does she', parte2: "think we're", parte3: 'good singers?', parte4: null, parte5: null },
    { id: 'bs12', traduccion: 'Me llamo Nora y vivo en Suecia.', parte1: 'My name', parte2: 'is Nora', parte3: 'and I live', parte4: 'in Sweden', parte5: null },
    { id: 'bs13', traduccion: 'Después de la escuela me gusta ayudar a mi papá a cuidar a los terneros', parte1: 'After school I', parte2: 'like to help', parte3: 'my dad', parte4: 'to take care', parte5: 'of calves.' },
    { id: 'bs14', traduccion: 'Estamos haciendo algo muy especial en la escuela hoy', parte1: "We're doing", parte2: 'something', parte3: 'very special', parte4: 'at school today.', parte5: null },
    { id: 'bs15', traduccion: 'Puedo oir tu respiración desde aquí.', parte1: 'I can', parte2: 'hear your', parte3: 'breathing', parte4: 'from here.', parte5: null },
    { id: 'bs16', traduccion: 'Sentí dolor de mi tobillo cuando caí.', parte1: 'I felt', parte2: 'pain in my', parte3: 'ankle', parte4: 'when I fell.', parte5: null },
    { id: 'bs17', traduccion: 'Estaba muy contento cuando jugué con mis amigos.', parte1: 'I was very', parte2: 'happy when I', parte3: 'played with', parte4: 'my friends.', parte5: null },
    { id: 'bs18', traduccion: '¿Cuándo estuvimos en la playa?', parte1: 'When', parte2: 'were we', parte3: 'at the', parte4: 'beach?', parte5: null },
    { id: 'bs19', traduccion: '¿Que comió ella? -Ella comió zanahorias', parte1: 'What did', parte2: 'she eat?', parte3: 'She ate', parte4: 'carrots.', parte5: null },
    { id: 'bs20', traduccion: 'Anoche hubo mucho ruido en la calle.', parte1: 'Last night', parte2: 'there was', parte3: 'loud noise', parte4: 'in the street.', parte5: null },
    { id: 'bs21', traduccion: '¿Qué ocurrió ayer en el parque?', parte1: 'What was', parte2: 'happening', parte3: 'yesterday', parte4: 'in the park?', parte5: null },
    { id: 'bs22', traduccion: 'Mientras mi madre estaba cocinando mi hermano comió los tomates.', parte1: 'While', parte2: 'my mother', parte3: 'was cooking', parte4: 'my brother', parte5: 'ate the tomatoes.' },
    { id: 'bs23', traduccion: 'Había mucha gente en el parque.', parte1: 'There were', parte2: 'a lot of', parte3: 'people', parte4: 'in the park.', parte5: null },
    { id: 'bs24', traduccion: 'Hay tres naranjas en la cocina.', parte1: 'There are', parte2: 'three oranges', parte3: 'in the kitchen.', parte4: null, parte5: null },
    { id: 'bs25', traduccion: 'Una chica estaba leyendo un libro sobre Messi.', parte1: 'A girl', parte2: 'was reading', parte3: 'a book', parte4: 'about Messi.', parte5: null },
    { id: 'bs26', traduccion: 'Un hombre estaba comiendo pasta cuando se quedó dormido.', parte1: 'A man', parte2: 'was eating', parte3: 'pasta', parte4: 'when he', parte5: 'fall asleep.' },
    { id: 'bs27', traduccion: 'Un chico estaba patinando cuando choco una piedra.', parte1: 'A boy', parte2: 'was skating', parte3: 'when he', parte4: 'hit a rock.', parte5: null },
    { id: 'bs28', traduccion: 'Los hombres estaban escribiendo en la calle cuando el coche se estrelló.', parte1: 'The men', parte2: 'were writing', parte3: 'on the street', parte4: 'when the', parte5: 'car crashed.' },
    { id: 'bs29', traduccion: 'Mientras estudiaba, mis amigos me llamaron.', parte1: 'While', parte2: 'I was studying', parte3: 'my friends', parte4: 'called me.', parte5: null },
    { id: 'bs30', traduccion: 'Se lastimó la pierna mientras jugaba al fútbol.', parte1: 'She hurt', parte2: 'her leg', parte3: 'while she', parte4: 'was playing', parte5: 'football.' }
];

const LOCAL_SENTENCES_KEY = 'englishpan_sentences';

interface OracionesPlayProps {
    userEmail: string | undefined | null;
    setCurrentView: (view: string) => void;
}

interface ScrambledPart {
    partNum: number;
    text: string;
}

export function OracionesPlay({ userEmail, setCurrentView }: OracionesPlayProps) {
    const [loading, setLoading] = useState(true);
    const [sessionSentences, setSessionSentences] = useState<Sentence[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Score states
    const [points, setPoints] = useState(0);
    const [errors, setErrors] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Refs to avoid stale closures in callbacks
    const pointsRef = useRef(0);
    const errorsRef = useRef(0);

    useEffect(() => {
        pointsRef.current = points;
    }, [points]);

    useEffect(() => {
        errorsRef.current = errors;
    }, [errors]);

    // Sentence state
    const [assembledIndices, setAssembledIndices] = useState<number[]>([]);
    const [shuffledParts, setShuffledParts] = useState<ScrambledPart[]>([]);
    const [usedHelp, setUsedHelp] = useState(false);
    const [showTranslation, setShowTranslation] = useState(false);
    const [isCurrentCompleted, setIsCurrentCompleted] = useState(false);
    const [wrongPartNum, setWrongPartNum] = useState<number | null>(null);

    useEffect(() => {
        loadGameData();
    }, []);

    // Set up sentence when current index changes
    useEffect(() => {
        if (sessionSentences.length > 0 && currentIndex < sessionSentences.length) {
            const sentence = sessionSentences[currentIndex];
            
            // Build the parts list
            const parts: ScrambledPart[] = [];
            if (sentence.parte1) parts.push({ partNum: 1, text: sentence.parte1 });
            if (sentence.parte2) parts.push({ partNum: 2, text: sentence.parte2 });
            if (sentence.parte3) parts.push({ partNum: 3, text: sentence.parte3 });
            if (sentence.parte4) parts.push({ partNum: 4, text: sentence.parte4 });
            if (sentence.parte5) parts.push({ partNum: 5, text: sentence.parte5 });

            // Shuffle
            const shuffled = [...parts].sort(() => Math.random() - 0.5);

            setShuffledParts(shuffled);
            setAssembledIndices([]);
            setUsedHelp(false);
            setShowTranslation(false);
            setIsCurrentCompleted(false);
            setWrongPartNum(null);
            

        }
    }, [currentIndex, sessionSentences]);

    const playSound = (type: 'success' | 'error' | 'round_complete') => {
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
                osc.frequency.setValueAtTime(587.33, now); // D5
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'round_complete') {
                // Harmonic C5 -> E5 -> G5 sequence
                const playTone = (freq: number, startDelay: number, duration: number) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(freq, now + startDelay);
                    gain.gain.setValueAtTime(0.15, now + startDelay);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + startDelay + duration);
                    osc.start(now + startDelay);
                    osc.stop(now + startDelay + duration);
                };
                playTone(523.25, 0, 0.15); // C5
                playTone(659.25, 0.1, 0.15); // E5
                playTone(783.99, 0.2, 0.35); // G5
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
            let dbSentences: Sentence[] = [];
            const { data, error } = await supabase.from('oraciones').select('*');

            if (error) {
                console.warn("Supabase query error, falling back to local storage oraciones:", error);
                const cached = localStorage.getItem(LOCAL_SENTENCES_KEY);
                dbSentences = cached ? JSON.parse(cached) : BACKUP_SENTENCES;
            } else if (!data || data.length < 5) {
                console.warn(`Only found ${data?.length || 0} sentences in Supabase. Supplementing with seed sentences.`);
                dbSentences = [...(data || [])];
                const existingTranslations = new Set(dbSentences.map(o => o.traduccion.toLowerCase()));
                for (const backup of BACKUP_SENTENCES) {
                    if (!existingTranslations.has(backup.traduccion.toLowerCase())) {
                        dbSentences.push(backup);
                    }
                    if (dbSentences.length >= 10) break;
                }
            } else {
                dbSentences = data;
            }

            // Shuffle and select exactly 5 sentences
            const shuffled = [...dbSentences].sort(() => 0.5 - Math.random());
            setSessionSentences(shuffled.slice(0, 5));
        } catch (err) {
            console.error("Error setting up sentences game:", err);
            const cached = localStorage.getItem(LOCAL_SENTENCES_KEY);
            const list = cached ? JSON.parse(cached) : BACKUP_SENTENCES;
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
                    correct_hits: Math.max(0, finalPoints),
                    incorrect_hits: totalErrors,
                    game_type: 'armar_oraciones'
                });
            if (error) throw error;
        } catch (err) {
            console.error("Error saving sentence assembly ranking:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePartClick = (part: ScrambledPart) => {
        if (isCurrentCompleted || assembledIndices.includes(part.partNum) || wrongPartNum !== null) return;

        const sentence = sessionSentences[currentIndex];
        const nextExpectedIndex = assembledIndices.length + 1; // 1-indexed

        if (part.partNum === nextExpectedIndex) {
            // Correct choice
            const updatedAssembled = [...assembledIndices, part.partNum];
            setAssembledIndices(updatedAssembled);

            // Calculate total parts in current sentence
            let totalPartsCount = 0;
            if (sentence.parte1) totalPartsCount++;
            if (sentence.parte2) totalPartsCount++;
            if (sentence.parte3) totalPartsCount++;
            if (sentence.parte4) totalPartsCount++;
            if (sentence.parte5) totalPartsCount++;

            if (updatedAssembled.length === totalPartsCount) {
                // Completed the sentence!
                playSound('round_complete');
                setIsCurrentCompleted(true);
                setShowTranslation(true); // Always reveal translation on completion
                const earned = usedHelp ? 16 : 20;
                const nextPoints = points + earned;
                setPoints(nextPoints);
                pointsRef.current = nextPoints;


            } else {
                playSound('success');
            }
        } else {
            // Incorrect choice
            playSound('error');
            setWrongPartNum(part.partNum);
            
            const nextErrors = errors + 1;
            const nextPoints = points - 5;
            setErrors(nextErrors);
            setPoints(nextPoints);
            errorsRef.current = nextErrors;
            pointsRef.current = nextPoints;

            setTimeout(() => {
                setWrongPartNum(null);
            }, 500);
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

    const handleUseHelp = () => {
        if (isCurrentCompleted || usedHelp) return;
        setUsedHelp(true);
        setShowTranslation(true);
    };

    const handleRestart = () => {
        setIsGameOver(false);
        setCurrentIndex(0);
        setPoints(0);
        setErrors(0);
        setAssembledIndices([]);
        setShuffledParts([]);
        setUsedHelp(false);
        setShowTranslation(false);
        setIsCurrentCompleted(false);
        setWrongPartNum(null);
        loadGameData();
    };

    if (loading) {
        return (
            <div className="glass-panel" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader />
                    <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.9rem' }}>Cargando oraciones...</p>
                </div>
            </div>
        );
    }

    if (isGameOver) {
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
                    Has completado las 5 oraciones de la sesión.
                </p>

                {/* Score panel */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', maxWidth: '360px', marginBottom: '2.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem 1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Puntos Totales</p>
                        <p style={{ color: 'var(--primary)', fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                            <Award size={24} />
                            {Math.max(0, points)}
                        </p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem 1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Errores Totales</p>
                        <p style={{ color: errors > 0 ? 'var(--danger)' : 'var(--text-muted)', fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                            <XCircle size={24} />
                            {errors}
                        </p>
                    </div>
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
                        onClick={() => setCurrentView('oraciones_intro')} 
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

    const currentSentence = sessionSentences[currentIndex];
    
    // Get text of assembled parts in correct sequential order
    const getPartText = (num: number): string => {
        if (num === 1) return currentSentence.parte1 || '';
        if (num === 2) return currentSentence.parte2 || '';
        if (num === 3) return currentSentence.parte3 || '';
        if (num === 4) return currentSentence.parte4 || '';
        if (num === 5) return currentSentence.parte5 || '';
        return '';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header info */}
            <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className="btn-icon" onClick={() => setCurrentView('oraciones_intro')} title="Salir del juego" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1.4rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                Armar Oraciones 🧩
                            </h1>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>PUNTOS</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                {Math.max(0, points)}
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
                    <div style={{ width: `${((currentIndex + (isCurrentCompleted ? 1 : 0)) / 5) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', height: '100%', transition: 'width 0.3s ease' }} />
                </div>
            </div>

            {/* Board card */}
            <div className="glass-panel" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: '380px' }}>
                
                {/* 1. Spanish Translation Box (Help / Completed state) */}
                <div style={{ minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
                    {showTranslation ? (
                        <div style={{ animation: 'fadeIn 0.3s' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Traducción</span>
                            <p style={{ fontSize: '1.25rem', color: 'white', fontWeight: 500, margin: '0.25rem 0 0' }}>
                                {currentSentence.traduccion}
                            </p>
                        </div>
                    ) : (
                        <button 
                            className="btn" 
                            onClick={handleUseHelp}
                            style={{ 
                                background: 'rgba(255, 183, 3, 0.05)', 
                                border: '1px dashed rgba(255, 183, 3, 0.3)', 
                                color: 'var(--primary)',
                                fontSize: '0.9rem',
                                padding: '0.6rem 1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                borderRadius: '12px'
                            }}
                        >
                            <HelpCircle size={16} />
                            Usar comodín (4 puntos)
                        </button>
                    )}
                </div>

                {/* 2. Assembled sentence area */}
                <div style={{ 
                    minHeight: '80px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: isCurrentCompleted ? '2px solid var(--success)' : '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '16px',
                    padding: '1rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: isCurrentCompleted ? '0 0 20px rgba(16, 185, 129, 0.15)' : 'none',
                    transition: 'all 0.3s ease'
                }}>
                    {assembledIndices.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontStyle: 'italic' }}>
                            Presiona las palabras abajo en el orden correcto
                        </span>
                    ) : (
                        assembledIndices.map((partNum, idx) => (
                            <span 
                                key={`assembled-${partNum}-${idx}`}
                                style={{ 
                                    background: isCurrentCompleted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.05)',
                                    border: isCurrentCompleted ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.1)',
                                    color: isCurrentCompleted ? 'var(--success)' : 'white',
                                    padding: '0.5rem 0.9rem',
                                    borderRadius: '10px',
                                    fontSize: '1.05rem',
                                    fontWeight: 500,
                                    animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                            >
                                {getPartText(partNum)}
                            </span>
                        ))
                    )}
                </div>

                {/* 3. Scrambled parts area */}
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.75rem', 
                    justifyContent: 'center', 
                    marginTop: 'auto',
                    opacity: isCurrentCompleted ? 0.4 : 1,
                    pointerEvents: isCurrentCompleted ? 'none' : 'auto',
                    transition: 'opacity 0.3s ease'
                }}>
                    {shuffledParts.map((part) => {
                        const isPlaced = assembledIndices.includes(part.partNum);
                        const isWrong = wrongPartNum === part.partNum;

                        return (
                            <button
                                key={`scrambled-${part.partNum}`}
                                onClick={() => handlePartClick(part)}
                                disabled={isPlaced || isWrong}
                                style={{
                                    padding: '0.75rem 1.2rem',
                                    borderRadius: '12px',
                                    fontSize: '1.05rem',
                                    fontWeight: 500,
                                    cursor: isPlaced ? 'default' : 'pointer',
                                    transition: 'all 0.2s',
                                    background: isWrong 
                                        ? 'rgba(255, 68, 68, 0.15)' 
                                        : isPlaced 
                                            ? 'rgba(255, 255, 255, 0.01)' 
                                            : 'rgba(255, 255, 255, 0.04)',
                                    border: isWrong
                                        ? '2px solid var(--danger)'
                                        : isPlaced
                                            ? '1px solid rgba(255, 255, 255, 0.02)'
                                            : '1px solid rgba(255, 255, 255, 0.08)',
                                    color: isWrong
                                        ? 'var(--danger)'
                                        : isPlaced
                                            ? 'transparent'
                                            : 'white',
                                    boxShadow: 'none',
                                    animation: isWrong ? 'shake 0.3s' : 'none'
                                }}
                            >
                                {part.text}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Success state delay actions */}
            {isCurrentCompleted && (
                <div style={{ display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.3s' }}>
                    <button 
                        className="btn btn-primary animate-pulse" 
                        onClick={handleNextSentence}
                        style={{ 
                            padding: '0.8rem 2.5rem', 
                            fontSize: '1.05rem',
                            boxShadow: '0 4px 15px rgba(255, 183, 3, 0.3)'
                        }}
                    >
                        {currentIndex + 1 === 5 ? 'Finalizar Partida 🏁' : 'Continuar ➡️'}
                    </button>
                </div>
            )}

            {/* Error footer count */}
            <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Errores en esta sesión: <strong style={{ color: errors > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{errors}</strong>
            </div>

            {/* Animations style */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
                @keyframes popIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
