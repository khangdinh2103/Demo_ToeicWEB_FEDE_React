import axiosInstance from './axiosConfig';

export interface FlashCard {
  _id: string;
  term: string;
  mainMeaning: string;
  ipa?: string;
  // Backend may return array of strings or { phrase, meaning }
  collocations?: Array<string | { phrase: string; meaning?: string }>;
  // Backend may return a single string or an object { sentence, translation }
  example?:
    | string
    | {
        sentence: string;
        translation?: string;
      };
  audioUS_url?: string;
  audioUK_url?: string;
}

export interface VocabularySet {
  _id: string;
  course_id: string;
  title: string;
  part_of_speech: 'noun' | 'verb' | 'adjective' | 'adverb';
  day_number: number;
  // Detail endpoint returns cards; list endpoint returns total_cards
  cards?: FlashCard[];
  total_cards?: number;
}

export interface PronunciationResult {
  word: string;
  scores: {
    accuracy: number | null;
    fluency: number | null;
    completeness: number | null;
    overall: number | null;
  };
  syllables: Array<{
    ipa: string;
    grapheme?: string;
    accuracy: number;
    phonemes: Array<{
      target: string;
      accuracy: number;
      result: 'perfect' | 'near_correct' | 'medium' | 'wrong';
      altPh?: string;
      diff?: number;
      feedback: string;
      NBestPhonemes?: any[];
    }>;
  }>;
}

// Normalize various _id shapes to a plain string for URLs
export const normalizeId = (id: unknown): string => {
  const isValidIdString = (s: string) => {
    // 24-hex MongoId or UUID-like
    return /^[a-f0-9]{24}$/i.test(s) || /^[0-9a-f-]{8,}$/i.test(s);
  };

  const visit = (val: unknown, depth = 0): string | null => {
    if (depth > 5 || val == null) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      const obj: any = val as any;
      // Handle plain Buffer JSON shape: { type: 'Buffer', data: number[] }
      if (obj && obj.type === 'Buffer' && Array.isArray(obj.data)) {
        try {
          const dataArr: number[] = obj.data as number[];
          // Try decode as ASCII string first (in case the buffer stores ascii hex)
          const ascii = String.fromCharCode(...dataArr);
          if (/^[0-9a-f]{24}$/i.test(ascii)) return ascii;

          // Otherwise, treat as raw bytes → hex
          const hex = dataArr.map((b) => Number(b & 0xff).toString(16).padStart(2, '0')).join('');
          // If 12 bytes → 24 hex chars (ObjectId)
          if (hex.length === 24 && /^[0-9a-f]{24}$/i.test(hex)) return hex;
          // If 24 bytes → maybe already a 24-char ASCII inside; try pick likely slice
          const m = hex.match(/[0-9a-f]{24}/i);
          if (m) return m[0];
          if (hex) return hex;
        } catch {}
      }
      if (typeof obj.$oid === 'string') return obj.$oid;
      if (typeof obj._id === 'string') return obj._id;
      if (typeof obj._id === 'object') {
        const nested = visit(obj._id, depth + 1);
        if (nested) return nested;
      }
      // Try toString()
      if (typeof (obj as any).toString === 'function') {
        const s = (obj as any).toString();
        if (typeof s === 'string' && s && s !== '[object Object]') return s;
      }
      // Walk keys to find first string-ish
      for (const key of Object.keys(obj)) {
        const nested = visit(obj[key], depth + 1);
        if (nested) return nested;
      }
    }
    return null;
  };

  const out = visit(id) || '';
  // If out includes ObjectId('xxx'), extract inner
  const match = out.match(/ObjectId\(['"]([0-9a-f]{24})['"]\)/i);
  if (match) return match[1];
  if (isValidIdString(out)) return out;
  return out; // return whatever best-effort we found
};

export const vocabularyApi = {
  // Lấy danh sách bộ vocabulary cho học viên
  // GET /student/vocabulary/sets?part_of_speech=xxx
  getVocabularySets: async (params?: {
    part_of_speech?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await axiosInstance.get('/student/vocabulary/sets', { params });
    // Standard ResponseFormat: { data: { total, data: [...] }, ... }
    return response.data?.data;
  },

  // Lấy chi tiết 1 set kèm danh sách cards
  // GET /student/vocabulary/sets/:setId
  getVocabularySetById: async (setId: string | unknown) => {
    const id = normalizeId(setId);
    const response = await axiosInstance.get(`/student/vocabulary/sets/${encodeURIComponent(id)}`);
    return response.data?.data;
  },

  // Đánh giá phát âm
  assessPronunciation: async (audioBlob: Blob, referenceText: string): Promise<PronunciationResult> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('referenceText', referenceText);

    const response = await axiosInstance.post('/student/vocabulary/pronunciation', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};
