import mascotImage from '../assets/mascot.png';
import { Flame, BookOpen, Clock, Play } from 'lucide-react';
import { getUserName } from '../authConfig';

interface PrincipalProps {
    userEmail: string | undefined | null;
    setCurrentView: (view: string) => void;
}

export function Principal({ userEmail, setCurrentView }: PrincipalProps) {
    const userName = getUserName(userEmail);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
            {/* Mascot and Welcome card */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                <img 
                    src={mascotImage} 
                    alt="EnglishPAN Mascot" 
                    style={{ 
                        height: "120px", 
                        width: "120px", 
                        objectFit: "contain",
                        marginBottom: '1rem',
                        animation: "bounce 2.5s infinite"
                    }} 
                />
                <h1 className="page-title" style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>EnglishPAN</h1>
                <p className="item-subtitle" style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>
                    Aprende vocabulario y conjugaciones con tu compañero de pan
                </p>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', width: '100%', maxWidth: '400px' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Flame size={18} style={{ color: 'var(--primary)' }} />
                        ¡Hola, {userName}!
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        ¿Qué te gustaría practicar hoy? Elige uno de los juegos disponibles abajo para ver su ranking y comenzar.
                    </p>
                </div>
            </div>

            {/* Selector de Juegos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.3rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.25rem' }}>
                    <Play size={18} style={{ color: 'var(--primary)' }} />
                    Tus Sesiones de Juego
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    
                    {/* Juego 1: Vocabulario */}
                    <div 
                        className="glass-panel game-card"
                        onClick={() => setCurrentView('vocabulario_intro')}
                        style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                        <div style={{ background: 'rgba(255, 183, 3, 0.1)', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={32} style={{ color: 'var(--primary)' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', color: 'white', fontWeight: 600 }}>Juego 1: Vocabulario</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                                Juego de emparejar palabras en inglés y español. ¡Completa las 15 palabras con la menor cantidad de errores posible!
                            </p>
                        </div>
                        <div style={{ marginTop: 'auto', width: '100%' }}>
                            <button className="btn btn-primary" style={{ width: '100%', pointerEvents: 'none' }}>
                                Ver Ranking y Jugar
                            </button>
                        </div>
                    </div>

                    {/* Juego 2: Tiempos Verbales */}
                    <div 
                        className="glass-panel game-card"
                        onClick={() => setCurrentView('tiempos_intro')}
                        style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                    >
                        <div style={{ background: 'rgba(255, 107, 0, 0.1)', padding: '1rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Clock size={32} style={{ color: 'var(--primary-hover)' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', color: 'white', fontWeight: 600 }}>Juego 2: Tiempos Verbales</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.4' }}>
                                Practica estructuras gramaticales y conjugaciones en pasado, presente y futuro. ¡Pronto disponible!
                            </p>
                        </div>
                        <div style={{ marginTop: 'auto', width: '100%' }}>
                            <button 
                                className="btn" 
                                style={{ 
                                    width: '100%', 
                                    background: 'rgba(255,255,255,0.05)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    color: 'white',
                                    pointerEvents: 'none'
                                }}
                            >
                                Ver Ranking y Jugar
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
            `}</style>
        </div>
    );
}
