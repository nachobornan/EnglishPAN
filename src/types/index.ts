export interface Word {
    id: string;
    word: string;
    translation: string;
    created_at?: string;
}

export interface RankingEntry {
    id: string;
    user_email: string;
    correct_hits: number;
    incorrect_hits: number;
    game_type?: string;
    created_at: string;
}

export interface Verb {
    id: string;
    verbo: string;
    traduccion: string;
    pasado: string;
    error1: string;
    error2: string;
    created_at?: string;
}

export interface Sentence {
    id: string;
    traduccion: string;
    parte1: string | null;
    parte2: string | null;
    parte3: string | null;
    parte4: string | null;
    parte5: string | null;
    created_at?: string;
}
