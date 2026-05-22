import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Word, Verb } from '../types';
import { Loader } from '../components/Loader';
import { Plus, Edit, Trash, Search, BookOpen, AlertCircle, Sparkles, Clock } from 'lucide-react';

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

const LOCAL_WORDS_KEY = 'englishpan_words';
const LOCAL_VERBS_KEY = 'englishpan_verbs';

export function Library() {
    const [activeTab, setActiveTab] = useState<'vocabulario' | 'tiempos_verbales'>('vocabulario');
    
    // Words states
    const [words, setWords] = useState<Word[]>([]);
    const [loadingWords, setLoadingWords] = useState(true);
    const [isLocalModeWords, setIsLocalModeWords] = useState(false);
    const [searchQueryWords, setSearchQueryWords] = useState('');

    // Verbs states
    const [verbs, setVerbs] = useState<Verb[]>([]);
    const [loadingVerbs, setLoadingVerbs] = useState(true);
    const [isLocalModeVerbs, setIsLocalModeVerbs] = useState(false);
    const [searchQueryVerbs, setSearchQueryVerbs] = useState('');

    // Word Modal state
    const [isWordModalOpen, setIsWordModalOpen] = useState(false);
    const [editingWord, setEditingWord] = useState<Word | null>(null);
    const [wordInput, setWordInput] = useState('');
    const [translationInput, setTranslationInput] = useState('');
    const [isSavingWord, setIsSavingWord] = useState(false);
    const [modalErrorWord, setModalErrorWord] = useState<string | null>(null);

    // Verb Modal state
    const [isVerbModalOpen, setIsVerbModalOpen] = useState(false);
    const [editingVerb, setEditingVerb] = useState<Verb | null>(null);
    const [verboInput, setVerboInput] = useState('');
    const [traduccionInputVerb, setTraduccionInputVerb] = useState('');
    const [pasadoInput, setPasadoInput] = useState('');
    const [error1Input, setError1Input] = useState('');
    const [error2Input, setError2Input] = useState('');
    const [isSavingVerb, setIsSavingVerb] = useState(false);
    const [modalErrorVerb, setModalErrorVerb] = useState<string | null>(null);

    useEffect(() => {
        loadWords();
        loadVerbs();
    }, []);

    // Load words from Supabase or LocalStorage
    const loadWords = async () => {
        setLoadingWords(true);
        try {
            let list: Word[] = [];
            const { data, error } = await supabase
                .from('words')
                .select('*')
                .order('word', { ascending: true });

            if (error) {
                console.warn("Supabase connection failed. Reading words from local cache.");
                const cached = localStorage.getItem(LOCAL_WORDS_KEY);
                if (cached) {
                    list = JSON.parse(cached);
                } else {
                    list = BACKUP_WORDS;
                    localStorage.setItem(LOCAL_WORDS_KEY, JSON.stringify(list));
                }
                setIsLocalModeWords(true);
            } else {
                list = data || [];
                setIsLocalModeWords(false);
                localStorage.setItem(LOCAL_WORDS_KEY, JSON.stringify(list));
            }
            setWords(list);
        } catch (err) {
            console.error("Error loading words library:", err);
            const cached = localStorage.getItem(LOCAL_WORDS_KEY);
            setWords(cached ? JSON.parse(cached) : BACKUP_WORDS);
            setIsLocalModeWords(true);
        } finally {
            setLoadingWords(false);
        }
    };

    // Load verbs from Supabase or LocalStorage
    const loadVerbs = async () => {
        setLoadingVerbs(true);
        try {
            let list: Verb[] = [];
            const { data, error } = await supabase
                .from('verbs')
                .select('*')
                .order('verbo', { ascending: true });

            if (error) {
                console.warn("Supabase connection failed. Reading verbs from local cache.");
                const cached = localStorage.getItem(LOCAL_VERBS_KEY);
                if (cached) {
                    list = JSON.parse(cached);
                } else {
                    list = BACKUP_VERBS;
                    localStorage.setItem(LOCAL_VERBS_KEY, JSON.stringify(list));
                }
                setIsLocalModeVerbs(true);
            } else {
                list = data || [];
                setIsLocalModeVerbs(false);
                localStorage.setItem(LOCAL_VERBS_KEY, JSON.stringify(list));
            }
            setVerbs(list);
        } catch (err) {
            console.error("Error loading verbs library:", err);
            const cached = localStorage.getItem(LOCAL_VERBS_KEY);
            setVerbs(cached ? JSON.parse(cached) : BACKUP_VERBS);
            setIsLocalModeVerbs(true);
        } finally {
            setLoadingVerbs(false);
        }
    };

    // Save Word (Add or Edit)
    const handleSaveWord = async (e: React.FormEvent) => {
        e.preventDefault();
        const wordText = wordInput.trim().toLowerCase();
        const translationText = translationInput.trim().toLowerCase();

        if (!wordText || !translationText) {
            setModalErrorWord('Ambos campos son requeridos.');
            return;
        }

        setIsSavingWord(true);
        setModalErrorWord(null);

        try {
            if (isLocalModeWords) {
                let nextWords = [...words];
                if (editingWord) {
                    nextWords = nextWords.map(w => w.id === editingWord.id 
                        ? { ...w, word: wordText, translation: translationText } 
                        : w
                    );
                } else {
                    const newWord: Word = {
                        id: 'local_word_' + Date.now(),
                        word: wordText,
                        translation: translationText
                    };
                    nextWords = [newWord, ...nextWords];
                }
                nextWords.sort((a, b) => a.word.localeCompare(b.word));
                setWords(nextWords);
                localStorage.setItem(LOCAL_WORDS_KEY, JSON.stringify(nextWords));
                closeWordModal();
            } else {
                if (editingWord) {
                    const { error } = await supabase
                        .from('words')
                        .update({ word: wordText, translation: translationText })
                        .eq('id', editingWord.id);
                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('words')
                        .insert({ word: wordText, translation: translationText });
                    if (error) throw error;
                }
                await loadWords();
                closeWordModal();
            }
        } catch (err: any) {
            console.error("Failed to save word:", err);
            if (err.code === '23505') {
                setModalErrorWord('Esta palabra ya existe en la biblioteca.');
            } else {
                setModalErrorWord('Error al guardar la palabra. Inténtalo de nuevo.');
            }
        } finally {
            setIsSavingWord(false);
        }
    };

    // Save Verb (Add or Edit)
    const handleSaveVerb = async (e: React.FormEvent) => {
        e.preventDefault();
        const verboText = verboInput.trim().toLowerCase();
        const traduccionText = traduccionInputVerb.trim().toLowerCase();
        const pasadoText = pasadoInput.trim().toLowerCase();
        const error1Text = error1Input.trim().toLowerCase();
        const error2Text = error2Input.trim().toLowerCase();

        if (!verboText || !traduccionText || !pasadoText || !error1Text || !error2Text) {
            setModalErrorVerb('Todos los campos son requeridos.');
            return;
        }

        setIsSavingVerb(true);
        setModalErrorVerb(null);

        try {
            if (isLocalModeVerbs) {
                let nextVerbs = [...verbs];
                if (editingVerb) {
                    nextVerbs = nextVerbs.map(v => v.id === editingVerb.id 
                        ? { ...v, verbo: verboText, traduccion: traduccionText, pasado: pasadoText, error1: error1Text, error2: error2Text } 
                        : v
                    );
                } else {
                    const newVerb: Verb = {
                        id: 'local_verb_' + Date.now(),
                        verbo: verboText,
                        traduccion: traduccionText,
                        pasado: pasadoText,
                        error1: error1Text,
                        error2: error2Text
                    };
                    nextVerbs = [newVerb, ...nextVerbs];
                }
                nextVerbs.sort((a, b) => a.verbo.localeCompare(b.verbo));
                setVerbs(nextVerbs);
                localStorage.setItem(LOCAL_VERBS_KEY, JSON.stringify(nextVerbs));
                closeVerbModal();
            } else {
                if (editingVerb) {
                    const { error } = await supabase
                        .from('verbs')
                        .update({ verbo: verboText, traduccion: traduccionText, pasado: pasadoText, error1: error1Text, error2: error2Text })
                        .eq('id', editingVerb.id);
                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('verbs')
                        .insert({ verbo: verboText, traduccion: traduccionText, pasado: pasadoText, error1: error1Text, error2: error2Text });
                    if (error) throw error;
                }
                await loadVerbs();
                closeVerbModal();
            }
        } catch (err: any) {
            console.error("Failed to save verb:", err);
            setModalErrorVerb('Error al guardar el verbo. Inténtalo de nuevo.');
        } finally {
            setIsSavingVerb(false);
        }
    };

    // Delete Word
    const handleDeleteWord = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta palabra?')) return;

        try {
            if (isLocalModeWords) {
                const nextWords = words.filter(w => w.id !== id);
                setWords(nextWords);
                localStorage.setItem(LOCAL_WORDS_KEY, JSON.stringify(nextWords));
            } else {
                const { error } = await supabase
                    .from('words')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                await loadWords();
            }
        } catch (err) {
            console.error("Error deleting word:", err);
            alert('No se pudo eliminar la palabra. Inténtalo de nuevo.');
        }
    };

    // Delete Verb
    const handleDeleteVerb = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este verbo?')) return;

        try {
            if (isLocalModeVerbs) {
                const nextVerbs = verbs.filter(v => v.id !== id);
                setVerbs(nextVerbs);
                localStorage.setItem(LOCAL_VERBS_KEY, JSON.stringify(nextVerbs));
            } else {
                const { error } = await supabase
                    .from('verbs')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                await loadVerbs();
            }
        } catch (err) {
            console.error("Error deleting verb:", err);
            alert('No se pudo eliminar el verbo. Inténtalo de nuevo.');
        }
    };

    // Word Modal operations
    const openAddWordModal = () => {
        setEditingWord(null);
        setWordInput('');
        setTranslationInput('');
        setModalErrorWord(null);
        setIsWordModalOpen(true);
    };

    const openEditWordModal = (word: Word) => {
        setEditingWord(word);
        setWordInput(word.word);
        setTranslationInput(word.translation);
        setModalErrorWord(null);
        setIsWordModalOpen(true);
    };

    const closeWordModal = () => {
        setIsWordModalOpen(false);
        setEditingWord(null);
        setWordInput('');
        setTranslationInput('');
        setModalErrorWord(null);
    };

    // Verb Modal operations
    const openAddVerbModal = () => {
        setEditingVerb(null);
        setVerboInput('');
        setTraduccionInputVerb('');
        setPasadoInput('');
        setError1Input('');
        setError2Input('');
        setModalErrorVerb(null);
        setIsVerbModalOpen(true);
    };

    const openEditVerbModal = (verb: Verb) => {
        setEditingVerb(verb);
        setVerboInput(verb.verbo);
        setTraduccionInputVerb(verb.traduccion);
        setPasadoInput(verb.pasado);
        setError1Input(verb.error1);
        setError2Input(verb.error2);
        setModalErrorVerb(null);
        setIsVerbModalOpen(true);
    };

    const closeVerbModal = () => {
        setIsVerbModalOpen(false);
        setEditingVerb(null);
        setVerboInput('');
        setTraduccionInputVerb('');
        setPasadoInput('');
        setError1Input('');
        setError2Input('');
        setModalErrorVerb(null);
    };

    // Filters
    const filteredWords = words.filter(w => 
        w.word.toLowerCase().includes(searchQueryWords.toLowerCase()) ||
        w.translation.toLowerCase().includes(searchQueryWords.toLowerCase())
    );

    const filteredVerbs = verbs.filter(v => 
        v.verbo.toLowerCase().includes(searchQueryVerbs.toLowerCase()) ||
        v.traduccion.toLowerCase().includes(searchQueryVerbs.toLowerCase()) ||
        v.pasado.toLowerCase().includes(searchQueryVerbs.toLowerCase())
    );

    const isAnyLocalMode = isLocalModeWords || isLocalModeVerbs;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease-out' }}>
            {/* Header info */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.8rem' }}>
                    Biblioteca de Prácticas 📚
                </h1>
                <p className="item-subtitle" style={{ margin: 0 }}>
                    Administra el vocabulario y los verbos irregulares de tus sesiones de juego.
                </p>

                {isAnyLocalMode && (
                    <div style={{ 
                        marginTop: '1rem', 
                        background: 'rgba(255, 179, 0, 0.08)', 
                        border: '1px solid rgba(255, 179, 0, 0.2)', 
                        borderRadius: '12px', 
                        padding: '0.75rem 1rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        color: '#ffb300',
                        fontSize: '0.85rem'
                    }}>
                        <AlertCircle size={16} />
                        <span>Modo Local Activado: Conecta Supabase en el archivo .env para sincronizar tus bases de datos.</span>
                    </div>
                )}
            </div>

            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', width: '100%', maxWidth: '480px' }}>
                <button 
                    className={`btn ${activeTab === 'vocabulario' ? 'btn-primary' : ''}`}
                    style={{ 
                        flex: 1, 
                        padding: '0.7rem 1rem', 
                        background: activeTab === 'vocabulario' ? '' : 'transparent', 
                        border: 'none', 
                        color: activeTab === 'vocabulario' ? 'navy' : 'white', 
                        cursor: 'pointer', 
                        borderRadius: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                    onClick={() => setActiveTab('vocabulario')}
                >
                    <BookOpen size={16} />
                    Vocabulario
                </button>
                <button 
                    className={`btn ${activeTab === 'tiempos_verbales' ? 'btn-primary' : ''}`}
                    style={{ 
                        flex: 1, 
                        padding: '0.7rem 1rem', 
                        background: activeTab === 'tiempos_verbales' ? '' : 'transparent', 
                        border: 'none', 
                        color: activeTab === 'tiempos_verbales' ? 'navy' : 'white', 
                        cursor: 'pointer', 
                        borderRadius: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                    }}
                    onClick={() => setActiveTab('tiempos_verbales')}
                >
                    <Clock size={16} />
                    Tiempos Verbales
                </button>
            </div>

            {/* TAB 1: VOCABULARIO (WORDS) */}
            {activeTab === 'vocabulario' && (
                <>
                    {/* Actions & Search */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                className="input-glass" 
                                value={searchQueryWords}
                                onChange={(e) => setSearchQueryWords(e.target.value)}
                                placeholder="Buscar palabra o traducción..." 
                                style={{ paddingLeft: '2.8rem' }}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={openAddWordModal}>
                            <Plus size={18} />
                            Agregar Palabra
                        </button>
                    </div>

                    {/* Words Table */}
                    <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                        {loadingWords ? (
                            <Loader />
                        ) : filteredWords.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                <BookOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '1rem' }}>Biblioteca de palabras vacía</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                    {searchQueryWords ? 'No hay resultados para esta búsqueda.' : 'Haz clic en "Agregar Palabra" para registrar tu primer vocablo.'}
                                </p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.85rem' }}>
                                            <th style={{ padding: '0.75rem 0.5rem', width: '45%' }}>Inglés</th>
                                            <th style={{ padding: '0.75rem 0.5rem', width: '40%' }}>Español</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', width: '15%' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredWords.map((item) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <td style={{ padding: '0.85rem 0.5rem', color: 'white', fontWeight: 500, textTransform: 'capitalize' }}>
                                                    {item.word}
                                                </td>
                                                <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                                    {item.translation}
                                                </td>
                                                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                                        <button className="btn-icon" onClick={() => openEditWordModal(item)} title="Editar">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button className="btn-icon" onClick={() => handleDeleteWord(item.id)} title="Eliminar" style={{ color: 'var(--danger)' }}>
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {!loadingWords && words.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Total en biblioteca: <strong style={{ color: 'white', marginLeft: '0.25rem' }}>{words.length} palabras</strong>
                        </div>
                    )}
                </>
            )}

            {/* TAB 2: TIEMPOS VERBALES (VERBS) */}
            {activeTab === 'tiempos_verbales' && (
                <>
                    {/* Actions & Search */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                className="input-glass" 
                                value={searchQueryVerbs}
                                onChange={(e) => setSearchQueryVerbs(e.target.value)}
                                placeholder="Buscar verbo, traducción o pasado..." 
                                style={{ paddingLeft: '2.8rem' }}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={openAddVerbModal}>
                            <Plus size={18} />
                            Agregar Verbo
                        </button>
                    </div>

                    {/* Verbs Table */}
                    <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                        {loadingVerbs ? (
                            <Loader />
                        ) : filteredVerbs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '1rem' }}>Biblioteca de verbos vacía</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                    {searchQueryVerbs ? 'No hay resultados para esta búsqueda.' : 'Haz clic en "Agregar Verbo" para registrar tu primer verbo irregular.'}
                                </p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.85rem' }}>
                                            <th style={{ padding: '0.75rem 0.5rem', width: '20%' }}>Infinitivo</th>
                                            <th style={{ padding: '0.75rem 0.5rem', width: '20%' }}>Traducción</th>
                                            <th style={{ padding: '0.75rem 0.5rem', width: '20%', color: 'var(--success)' }}>Pasado Correcto</th>
                                            <th style={{ padding: '0.75rem 0.5rem', width: '15%', color: 'var(--danger)' }}>Error 1</th>
                                            <th style={{ padding: '0.75rem 0.5rem', width: '15%', color: 'var(--danger)' }}>Error 2</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', width: '10%' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVerbs.map((item) => (
                                            <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <td style={{ padding: '0.85rem 0.5rem', color: 'white', fontWeight: 500 }}>
                                                    {item.verbo}
                                                </td>
                                                <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)' }}>
                                                    {item.traduccion}
                                                </td>
                                                <td style={{ padding: '0.85rem 0.5rem', color: 'var(--success)', fontWeight: 500 }}>
                                                    {item.pasado}
                                                </td>
                                                <td style={{ padding: '0.85rem 0.5rem', color: '#ff8a8a' }}>
                                                    {item.error1}
                                                </td>
                                                <td style={{ padding: '0.85rem 0.5rem', color: '#ff8a8a' }}>
                                                    {item.error2}
                                                </td>
                                                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                                        <button className="btn-icon" onClick={() => openEditVerbModal(item)} title="Editar">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button className="btn-icon" onClick={() => handleDeleteVerb(item.id)} title="Eliminar" style={{ color: 'var(--danger)' }}>
                                                            <Trash size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {!loadingVerbs && verbs.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Total en biblioteca: <strong style={{ color: 'white', marginLeft: '0.25rem' }}>{verbs.length} verbos</strong>
                        </div>
                    )}
                </>
            )}

            {/* Word Add/Edit Glass Modal */}
            {isWordModalOpen && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ padding: '2rem', width: '90%', maxWidth: '400px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                            {editingWord ? 'Editar Palabra' : 'Agregar Nueva Palabra'}
                        </h2>

                        <form onSubmit={handleSaveWord}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Palabra (Inglés)
                                </label>
                                <input 
                                    type="text" 
                                    className="input-glass"
                                    value={wordInput}
                                    onChange={(e) => setWordInput(e.target.value)}
                                    placeholder="e.g. apple"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Traducción (Español)
                                </label>
                                <input 
                                    type="text" 
                                    className="input-glass"
                                    value={translationInput}
                                    onChange={(e) => setTranslationInput(e.target.value)}
                                    placeholder="e.g. manzana"
                                    required
                                />
                            </div>

                            {modalErrorWord && (
                                <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(207, 102, 121, 0.1)', border: '1px solid rgba(207, 102, 121, 0.2)', borderRadius: '8px' }}>
                                    {modalErrorWord}
                                </p>
                            )}

                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button 
                                    type="button" 
                                    className="btn" 
                                    onClick={closeWordModal} 
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                    disabled={isSavingWord}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={isSavingWord}
                                >
                                    {isSavingWord ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Verb Add/Edit Glass Modal */}
            {isVerbModalOpen && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ padding: '2rem', width: '90%', maxWidth: '460px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                            {editingVerb ? 'Editar Verbo Irregular' : 'Agregar Nuevo Verbo'}
                        </h2>

                        <form onSubmit={handleSaveVerb}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Verbo (Infinitivo)
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input-glass"
                                        value={verboInput}
                                        onChange={(e) => setVerboInput(e.target.value)}
                                        placeholder="e.g. build"
                                        autoFocus
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Traducción
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input-glass"
                                        value={traduccionInputVerb}
                                        onChange={(e) => setTraduccionInputVerb(e.target.value)}
                                        placeholder="e.g. construir"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--success)' }}>
                                    Pasado Simple Correcto
                                </label>
                                <input 
                                    type="text" 
                                    className="input-glass"
                                    value={pasadoInput}
                                    onChange={(e) => setPasadoInput(e.target.value)}
                                    placeholder="e.g. built"
                                    required
                                    style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#ff8a8a' }}>
                                        Opción Incorrecta 1
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input-glass"
                                        value={error1Input}
                                        onChange={(e) => setError1Input(e.target.value)}
                                        placeholder="e.g. builded"
                                        required
                                        style={{ borderColor: 'rgba(255, 68, 68, 0.2)' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#ff8a8a' }}>
                                        Opción Incorrecta 2
                                    </label>
                                    <input 
                                        type="text" 
                                        className="input-glass"
                                        value={error2Input}
                                        onChange={(e) => setError2Input(e.target.value)}
                                        placeholder="e.g. builted"
                                        required
                                        style={{ borderColor: 'rgba(255, 68, 68, 0.2)' }}
                                    />
                                </div>
                            </div>

                            {modalErrorVerb && (
                                <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(207, 102, 121, 0.1)', border: '1px solid rgba(207, 102, 121, 0.2)', borderRadius: '8px' }}>
                                    {modalErrorVerb}
                                </p>
                            )}

                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button 
                                    type="button" 
                                    className="btn" 
                                    onClick={closeVerbModal} 
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                    disabled={isSavingVerb}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={isSavingVerb}
                                >
                                    {isSavingVerb ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
