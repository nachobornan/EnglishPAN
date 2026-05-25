import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Word, Verb, Sentence } from '../types';
import { Loader } from '../components/Loader';
import { Plus, Edit, Trash, Search, BookOpen, AlertCircle, Sparkles, Clock, Shuffle } from 'lucide-react';

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
const LOCAL_SENTENCES_KEY = 'englishpan_sentences';

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

export function Library() {
    const [activeTab, setActiveTab] = useState<'vocabulario' | 'tiempos_verbales' | 'oraciones'>('vocabulario');
    
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

    // Sentences states
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [loadingSentences, setLoadingSentences] = useState(true);
    const [isLocalModeSentences, setIsLocalModeSentences] = useState(false);
    const [searchQuerySentences, setSearchQuerySentences] = useState('');

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

    // Sentence Modal state
    const [isSentenceModalOpen, setIsSentenceModalOpen] = useState(false);
    const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);
    const [traduccionInputSentence, setTraduccionInputSentence] = useState('');
    const [parte1Input, setParte1Input] = useState('');
    const [parte2Input, setParte2Input] = useState('');
    const [parte3Input, setParte3Input] = useState('');
    const [parte4Input, setParte4Input] = useState('');
    const [parte5Input, setParte5Input] = useState('');
    const [isSavingSentence, setIsSavingSentence] = useState(false);
    const [modalErrorSentence, setModalErrorSentence] = useState<string | null>(null);

    useEffect(() => {
        loadWords();
        loadVerbs();
        loadSentences();
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

    // Load sentences from Supabase or LocalStorage
    const loadSentences = async () => {
        setLoadingSentences(true);
        try {
            let list: Sentence[] = [];
            const { data, error } = await supabase
                .from('oraciones')
                .select('*')
                .order('traduccion', { ascending: true });

            if (error) {
                console.warn("Supabase connection failed. Reading sentences from local cache.");
                const cached = localStorage.getItem(LOCAL_SENTENCES_KEY);
                if (cached) {
                    list = JSON.parse(cached);
                } else {
                    list = BACKUP_SENTENCES;
                    localStorage.setItem(LOCAL_SENTENCES_KEY, JSON.stringify(list));
                }
                setIsLocalModeSentences(true);
            } else {
                list = data || [];
                setIsLocalModeSentences(false);
                localStorage.setItem(LOCAL_SENTENCES_KEY, JSON.stringify(list));
            }
            setSentences(list);
        } catch (err) {
            console.error("Error loading sentences library:", err);
            const cached = localStorage.getItem(LOCAL_SENTENCES_KEY);
            setSentences(cached ? JSON.parse(cached) : BACKUP_SENTENCES);
            setIsLocalModeSentences(true);
        } finally {
            setLoadingSentences(false);
        }
    };

    // Save Sentence (Add or Edit)
    const handleSaveSentence = async (e: React.FormEvent) => {
        e.preventDefault();
        const translationText = traduccionInputSentence.trim();
        const p1 = parte1Input.trim();
        const p2 = parte2Input.trim();
        const p3 = parte3Input.trim() || null;
        const p4 = parte4Input.trim() || null;
        const p5 = parte5Input.trim() || null;

        if (!translationText || !p1 || !p2) {
            setModalErrorSentence('La traducción y al menos las partes 1 y 2 son requeridas.');
            return;
        }

        setIsSavingSentence(true);
        setModalErrorSentence(null);

        try {
            const sentenceData = {
                traduccion: translationText,
                parte1: p1,
                parte2: p2,
                parte3: p3,
                parte4: p4,
                parte5: p5
            };

            if (isLocalModeSentences) {
                let nextSentences = [...sentences];
                if (editingSentence) {
                    nextSentences = nextSentences.map(s => s.id === editingSentence.id 
                        ? { ...s, ...sentenceData } 
                        : s
                    );
                } else {
                    const newSentence: Sentence = {
                        id: 'local_sentence_' + Date.now(),
                        ...sentenceData
                    };
                    nextSentences = [newSentence, ...nextSentences];
                }
                nextSentences.sort((a, b) => a.traduccion.localeCompare(b.traduccion));
                setSentences(nextSentences);
                localStorage.setItem(LOCAL_SENTENCES_KEY, JSON.stringify(nextSentences));
                closeSentenceModal();
            } else {
                if (editingSentence) {
                    const { error } = await supabase
                        .from('oraciones')
                        .update(sentenceData)
                        .eq('id', editingSentence.id);
                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('oraciones')
                        .insert(sentenceData);
                    if (error) throw error;
                }
                await loadSentences();
                closeSentenceModal();
            }
        } catch (err: any) {
            console.error("Failed to save sentence:", err);
            setModalErrorSentence('Error al guardar la oración. Inténtalo de nuevo.');
        } finally {
            setIsSavingSentence(false);
        }
    };

    // Delete Sentence
    const handleDeleteSentence = async (id: string | number) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta oración?')) return;

        try {
            if (isLocalModeSentences) {
                const nextSentences = sentences.filter(s => s.id !== id);
                setSentences(nextSentences);
                localStorage.setItem(LOCAL_SENTENCES_KEY, JSON.stringify(nextSentences));
            } else {
                const { error } = await supabase
                    .from('oraciones')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
                await loadSentences();
            }
        } catch (err) {
            console.error("Error deleting sentence:", err);
            alert('No se pudo eliminar la oración. Inténtalo de nuevo.');
        }
    };

    // Sentence Modal operations
    const openAddSentenceModal = () => {
        setEditingSentence(null);
        setTraduccionInputSentence('');
        setParte1Input('');
        setParte2Input('');
        setParte3Input('');
        setParte4Input('');
        setParte5Input('');
        setModalErrorSentence(null);
        setIsSentenceModalOpen(true);
    };

    const openEditSentenceModal = (sentence: Sentence) => {
        setEditingSentence(sentence);
        setTraduccionInputSentence(sentence.traduccion);
        setParte1Input(sentence.parte1 || '');
        setParte2Input(sentence.parte2 || '');
        setParte3Input(sentence.parte3 || '');
        setParte4Input(sentence.parte4 || '');
        setParte5Input(sentence.parte5 || '');
        setModalErrorSentence(null);
        setIsSentenceModalOpen(true);
    };

    const closeSentenceModal = () => {
        setIsSentenceModalOpen(false);
        setEditingSentence(null);
        setTraduccionInputSentence('');
        setParte1Input('');
        setParte2Input('');
        setParte3Input('');
        setParte4Input('');
        setParte5Input('');
        setModalErrorSentence(null);
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

    const filteredSentences = sentences.filter(s => 
        s.traduccion.toLowerCase().includes(searchQuerySentences.toLowerCase()) ||
        (s.parte1 && s.parte1.toLowerCase().includes(searchQuerySentences.toLowerCase())) ||
        (s.parte2 && s.parte2.toLowerCase().includes(searchQuerySentences.toLowerCase())) ||
        (s.parte3 && s.parte3.toLowerCase().includes(searchQuerySentences.toLowerCase())) ||
        (s.parte4 && s.parte4.toLowerCase().includes(searchQuerySentences.toLowerCase())) ||
        (s.parte5 && s.parte5.toLowerCase().includes(searchQuerySentences.toLowerCase()))
    );

    const isAnyLocalMode = isLocalModeWords || isLocalModeVerbs || isLocalModeSentences;

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
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', width: '100%', maxWidth: '580px' }}>
                <button 
                    className={`btn ${activeTab === 'vocabulario' ? 'btn-primary' : ''}`}
                    style={{ 
                        flex: 1, 
                        padding: '0.7rem 0.5rem', 
                        background: activeTab === 'vocabulario' ? '' : 'transparent', 
                        border: 'none', 
                        color: activeTab === 'vocabulario' ? 'navy' : 'white', 
                        cursor: 'pointer', 
                        borderRadius: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem'
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
                        padding: '0.7rem 0.5rem', 
                        background: activeTab === 'tiempos_verbales' ? '' : 'transparent', 
                        border: 'none', 
                        color: activeTab === 'tiempos_verbales' ? 'navy' : 'white', 
                        cursor: 'pointer', 
                        borderRadius: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem'
                    }}
                    onClick={() => setActiveTab('tiempos_verbales')}
                >
                    <Clock size={16} />
                    Tiempos Verbales
                </button>
                <button 
                    className={`btn ${activeTab === 'oraciones' ? 'btn-primary' : ''}`}
                    style={{ 
                        flex: 1, 
                        padding: '0.7rem 0.5rem', 
                        background: activeTab === 'oraciones' ? '' : 'transparent', 
                        border: 'none', 
                        color: activeTab === 'oraciones' ? 'navy' : 'white', 
                        cursor: 'pointer', 
                        borderRadius: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem'
                    }}
                    onClick={() => setActiveTab('oraciones')}
                >
                    <Shuffle size={16} />
                    Armar Oraciones
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

            {/* TAB 3: ARMAR ORACIONES (SENTENCES) */}
            {activeTab === 'oraciones' && (
                <>
                    {/* Actions & Search */}
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                className="input-glass" 
                                value={searchQuerySentences}
                                onChange={(e) => setSearchQuerySentences(e.target.value)}
                                placeholder="Buscar traducción o parte..." 
                                style={{ paddingLeft: '2.8rem' }}
                            />
                        </div>
                        <button className="btn btn-primary" onClick={openAddSentenceModal}>
                            <Plus size={18} />
                            Agregar Oración
                        </button>
                    </div>

                    {/* Sentences Table */}
                    <div className="glass-panel" style={{ padding: '1.5rem', overflow: 'hidden' }}>
                        {loadingSentences ? (
                            <Loader />
                        ) : filteredSentences.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                <Shuffle size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p style={{ fontSize: '1rem' }}>Biblioteca de oraciones vacía</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                    {searchQuerySentences ? 'No hay resultados para esta búsqueda.' : 'Haz clic en "Agregar Oración" para registrar tu primera frase.'}
                                </p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', textAlign: 'left', fontSize: '0.85rem' }}>
                                            <th style={{ padding: '0.75rem 0.5rem', width: '30%' }}>Traducción (Español)</th>
                                            <th style={{ padding: '0.75rem 0.5rem', width: '60%' }}>Oración en partes (Inglés)</th>
                                            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', width: '10%' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSentences.map((item) => {
                                            const parts = [item.parte1, item.parte2, item.parte3, item.parte4, item.parte5].filter(Boolean).join(' | ');
                                            return (
                                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                    <td style={{ padding: '0.85rem 0.5rem', color: 'white', fontWeight: 500 }}>
                                                        {item.traduccion}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                                        {parts}
                                                    </td>
                                                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem' }}>
                                                            <button className="btn-icon" onClick={() => openEditSentenceModal(item)} title="Editar">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button className="btn-icon" onClick={() => handleDeleteSentence(item.id)} title="Eliminar" style={{ color: 'var(--danger)' }}>
                                                                <Trash size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {!loadingSentences && sentences.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Total en biblioteca: <strong style={{ color: 'white', marginLeft: '0.25rem' }}>{sentences.length} oraciones</strong>
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

            {/* Sentence Add/Edit Glass Modal */}
            {isSentenceModalOpen && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{ padding: '2rem', width: '90%', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                            {editingSentence ? 'Editar Oración' : 'Agregar Nueva Oración'}
                        </h2>

                        <form onSubmit={handleSaveSentence}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Traducción al Español
                                </label>
                                <input 
                                    type="text" 
                                    className="input-glass"
                                    value={traduccionInputSentence}
                                    onChange={(e) => setTraduccionInputSentence(e.target.value)}
                                    placeholder="e.g. Ellos fueron a nueva york"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <label className="form-label" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Partes de la Oración en Inglés (en orden correcto)
                                </label>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Parte 1:</span>
                                    <input 
                                        type="text" 
                                        className="input-glass" 
                                        value={parte1Input}
                                        onChange={(e) => setParte1Input(e.target.value)}
                                        placeholder="e.g. They"
                                        required
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Parte 2:</span>
                                    <input 
                                        type="text" 
                                        className="input-glass" 
                                        value={parte2Input}
                                        onChange={(e) => setParte2Input(e.target.value)}
                                        placeholder="e.g. went"
                                        required
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Parte 3:</span>
                                    <input 
                                        type="text" 
                                        className="input-glass" 
                                        value={parte3Input}
                                        onChange={(e) => setParte3Input(e.target.value)}
                                        placeholder="Opcional (e.g. to new york)"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Parte 4:</span>
                                    <input 
                                        type="text" 
                                        className="input-glass" 
                                        value={parte4Input}
                                        onChange={(e) => setParte4Input(e.target.value)}
                                        placeholder="Opcional"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Parte 5:</span>
                                    <input 
                                        type="text" 
                                        className="input-glass" 
                                        value={parte5Input}
                                        onChange={(e) => setParte5Input(e.target.value)}
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            {modalErrorSentence && (
                                <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', padding: '0.5rem 0.75rem', background: 'rgba(207, 102, 121, 0.1)', border: '1px solid rgba(207, 102, 121, 0.2)', borderRadius: '8px' }}>
                                    {modalErrorSentence}
                                </p>
                            )}

                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button 
                                    type="button" 
                                    className="btn" 
                                    onClick={closeSentenceModal} 
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                    disabled={isSavingSentence}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={isSavingSentence}
                                >
                                    {isSavingSentence ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
