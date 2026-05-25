import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getUserName } from '../authConfig';
import { RankingEntry } from '../types';
import { Loader } from './Loader';
import { Trophy, Award, Play, ArrowLeft } from 'lucide-react';

interface GameIntroProps {
    title: string;
    description: string;
    mascot: string;
    gameType: 'vocabulario' | 'tiempos_verbales' | 'armar_oraciones';
    userEmail: string | undefined | null;
    onStart: () => void;
    onBack: () => void;
}

export function GameIntro({ title, description, mascot, gameType, userEmail, onStart, onBack }: GameIntroProps) {
    const [rankings, setRankings] = useState<RankingEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            try {
                // Calculate date 5 days ago (ISO string)
                const fiveDaysAgo = new Date();
                fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
                const dateLimit = fiveDaysAgo.toISOString();

                // Fetch top 10 rankings filtered by game type and created in the last 5 days
                const { data, error } = await supabase
                    .from('rankings')
                    .select('*')
                    .eq('game_type', gameType)
                    .gte('created_at', dateLimit)
                    .order('correct_hits', { ascending: false })
                    .order('incorrect_hits', { ascending: true })
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (error) throw error;
                if (data) setRankings(data);
            } catch (err) {
                console.error(`Error fetching rankings for ${gameType}:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, [gameType]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header / Back Action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="btn-icon" onClick={onBack} title="Volver al Inicio" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={20} />
                </button>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Volver al menú</span>
            </div>

            {/* Game Info Card */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                <img 
                    src={mascot} 
                    alt={`${title} Mascot`} 
                    style={{ 
                        height: "120px", 
                        width: "120px", 
                        objectFit: "contain",
                        marginBottom: '1rem',
                        animation: "bounce 2.5s infinite"
                    }} 
                />
                <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{title}</h1>
                <p className="item-subtitle" style={{ fontSize: '1rem', marginBottom: '1.5rem', maxWidth: '500px' }}>
                    {description}
                </p>

                <button className="btn btn-primary" onClick={onStart} style={{ padding: '0.9rem 2.5rem', fontSize: '1.1rem', gap: '0.75rem', boxShadow: '0 4px 20px rgba(255, 183, 3, 0.4)' }}>
                    <Play size={20} fill="currentColor" />
                    Comenzar Partida
                </button>
            </div>

            {/* Leaderboard filtered for this game */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'white' }}>
                    <Trophy size={20} style={{ color: 'gold' }} />
                    Tabla de Posiciones - {title}
                </h2>

                {loading ? (
                    <Loader />
                ) : rankings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                        <Award size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                        <p style={{ fontSize: '0.95rem' }}>Aún no hay puntuaciones registradas para este juego.</p>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>¡Sé la primera persona en jugar y liderar la tabla!</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '0.5rem 0.25rem' }}>Puesto / Usuario</th>
                                    <th style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>
                                        {gameType === 'armar_oraciones' ? 'Puntos' : 'Aciertos'}
                                    </th>
                                    <th style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>Errores</th>
                                    <th style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rankings.map((item, index) => {
                                    const isCurrentUser = item.user_email.toLowerCase() === userEmail?.toLowerCase();
                                    return (
                                        <tr 
                                            key={item.id} 
                                            style={{ 
                                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                                backgroundColor: isCurrentUser ? 'rgba(255, 183, 3, 0.08)' : 'transparent',
                                            }}
                                        >
                                            <td style={{ padding: '0.75rem 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    width: '22px', 
                                                    height: '22px', 
                                                    borderRadius: '50%', 
                                                    background: index === 0 ? 'gold' : index === 1 ? '#d1d5db' : index === 2 ? '#b45309' : 'rgba(255,255,255,0.08)',
                                                    color: index < 3 ? '#000' : 'var(--text-muted)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {index + 1}
                                                </span>
                                                <span style={{ fontWeight: isCurrentUser ? 600 : 400, color: isCurrentUser ? 'white' : 'var(--text-main)', fontSize: '0.9rem' }}>
                                                    {getUserName(item.user_email)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem 0.25rem', textAlign: 'center', color: 'var(--success)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                                {item.correct_hits}
                                            </td>
                                            <td style={{ padding: '0.75rem 0.25rem', textAlign: 'center', color: 'var(--danger)', fontSize: '0.9rem' }}>
                                                {item.incorrect_hits}
                                            </td>
                                            <td style={{ padding: '0.75rem 0.25rem', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                {new Date(item.created_at).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
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
