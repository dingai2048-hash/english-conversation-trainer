/**
 * 词汇识别和管理服务
 * 负责识别重点词汇、过滤基础词汇、管理单词本
 */

// 基础词汇列表（CEFR A1级别 + 常见功能词）
const BASIC_WORDS = new Set([
  // 冠词
  'a', 'an', 'the',
  // be动词
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  // 助动词
  'do', 'does', 'did', 'done', 'doing',
  'have', 'has', 'had', 'having',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  // 代词
  'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'mine', 'yours', 'hers', 'ours', 'theirs',
  'this', 'that', 'these', 'those',
  // 介词
  'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by', 'about',
  'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 'against',
  'during', 'without', 'before', 'under', 'around', 'among',
  // 连词
  'and', 'but', 'or', 'so', 'because', 'if', 'when', 'than', 'then',
  'while', 'where', 'after', 'before', 'since', 'until', 'although',
  // 疑问词
  'what', 'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how',
  // 常见动词
  'go', 'get', 'make', 'know', 'think', 'take', 'see', 'come', 'want',
  'look', 'use', 'find', 'give', 'tell', 'work', 'call', 'try', 'ask',
  'need', 'feel', 'become', 'leave', 'put', 'mean', 'keep', 'let', 'begin',
  'seem', 'help', 'talk', 'turn', 'start', 'show', 'hear', 'play', 'run',
  'move', 'live', 'believe', 'bring', 'happen', 'write', 'sit', 'stand',
  'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change',
  'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read',
  'spend', 'grow', 'open', 'walk', 'win', 'teach', 'offer', 'remember',
  'consider', 'appear', 'buy', 'serve', 'die', 'send', 'build', 'stay',
  'fall', 'cut', 'reach', 'kill', 'remain', 'suggest', 'raise', 'pass',
  // 常见形容词
  'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other',
  'old', 'right', 'big', 'high', 'different', 'small', 'large', 'next',
  'early', 'young', 'important', 'few', 'public', 'bad', 'same', 'able',
  // 常见副词
  'not', 'so', 'up', 'out', 'just', 'now', 'how', 'then', 'more', 'also',
  'here', 'well', 'only', 'very', 'even', 'back', 'there', 'down', 'still',
  'too', 'really', 'never', 'always', 'often', 'sometimes', 'usually',
  // 其他常见词
  'yes', 'no', 'ok', 'okay', 'please', 'thank', 'thanks', 'sorry', 'hello',
  'hi', 'bye', 'goodbye', 'yeah', 'oh', 'um', 'uh', 'hmm',
]);

// 短语动词列表
const PHRASAL_VERBS = [
  'look up', 'give up', 'take off', 'put on', 'turn on', 'turn off',
  'pick up', 'set up', 'break down', 'come back', 'go on', 'find out',
  'work out', 'figure out', 'carry out', 'bring up', 'grow up',
];

export interface HighlightedWord {
  word: string;
  startIndex: number;
  endIndex: number;
  lemma: string; // 词根形式
}

export interface WordDefinition {
  word: string;
  phonetic?: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

export interface SavedWord {
  id: string;
  word: string;
  phonetic?: string;
  definition: string;
  partOfSpeech: string;
  example: string;
  savedAt: number;
  conversationId?: string;
}

class VocabularyService {
  private definitionCache: Map<string, WordDefinition> = new Map();
  private readonly STORAGE_KEY = 'vocabulary_book';
  private readonly MAX_HIGHLIGHTS = 20;

  /**
   * 识别文本中的重点词汇
   */
  identifyKeywords(text: string): HighlightedWord[] {
    const words: HighlightedWord[] = [];
    const seenWords = new Set<string>();

    // 先检查短语动词
    for (const phrase of PHRASAL_VERBS) {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        const word = match[0];
        const lemma = phrase.toLowerCase();
        
        if (!seenWords.has(lemma)) {
          words.push({
            word,
            startIndex: match.index,
            endIndex: match.index + word.length,
            lemma,
          });
          seenWords.add(lemma);
        }
      }
    }

    // 识别单个单词
    const wordRegex = /\b[a-zA-Z]+(?:'[a-zA-Z]+)?\b/g;
    let match;
    
    while ((match = wordRegex.exec(text)) !== null) {
      const word = match[0];
      const lemma = this.getLemma(word.toLowerCase());
      
      // 过滤条件
      if (
        word.length < 3 || // 太短
        BASIC_WORDS.has(lemma) || // 基础词汇
        seenWords.has(lemma) || // 已经识别过
        /^\d+$/.test(word) || // 纯数字
        !this.isContentWord(word) // 不是实词
      ) {
        continue;
      }

      words.push({
        word,
        startIndex: match.index,
        endIndex: match.index + word.length,
        lemma,
      });
      seenWords.add(lemma);

      // 限制数量
      if (words.length >= this.MAX_HIGHLIGHTS) {
        break;
      }
    }

    return words.sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * 获取单词的词根形式（简化版）
   */
  private getLemma(word: string): string {
    // 处理常见的词形变化
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y';
    }
    if (word.endsWith('es')) {
      return word.slice(0, -2);
    }
    if (word.endsWith('s') && word.length > 3) {
      return word.slice(0, -1);
    }
    if (word.endsWith('ed') && word.length > 4) {
      return word.slice(0, -2);
    }
    if (word.endsWith('ing') && word.length > 5) {
      return word.slice(0, -3);
    }
    return word;
  }

  /**
   * 判断是否为实词（名词、动词、形容词、副词）
   */
  private isContentWord(word: string): boolean {
    // 简化判断：长度大于3的词大概率是实词
    // 实际应用中可以使用词性标注库
    return word.length >= 3;
  }

  /**
   * 获取单词定义（使用Free Dictionary API）
   */
  async getDefinition(word: string): Promise<WordDefinition | null> {
    const lemma = this.getLemma(word.toLowerCase());
    
    // 检查缓存
    if (this.definitionCache.has(lemma)) {
      return this.definitionCache.get(lemma)!;
    }

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${lemma}`
      );
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const entry = data[0];

      const definition: WordDefinition = {
        word: entry.word,
        phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
        meanings: entry.meanings.map((m: any) => ({
          partOfSpeech: m.partOfSpeech,
          definitions: m.definitions.slice(0, 2).map((d: any) => ({
            definition: d.definition,
            example: d.example,
          })),
        })),
      };

      // 缓存结果
      this.definitionCache.set(lemma, definition);
      return definition;
    } catch (error) {
      console.error('Failed to fetch definition:', error);
      return null;
    }
  }

  /**
   * 保存单词到单词本
   */
  saveWord(word: SavedWord): void {
    const savedWords = this.getSavedWords();
    
    // 检查是否已存在
    const existingIndex = savedWords.findIndex(w => w.word.toLowerCase() === word.word.toLowerCase());
    
    if (existingIndex >= 0) {
      // 更新现有单词
      savedWords[existingIndex] = word;
    } else {
      // 添加新单词
      savedWords.unshift(word);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedWords));
  }

  /**
   * 从单词本删除单词
   */
  removeWord(wordId: string): void {
    const savedWords = this.getSavedWords();
    const filtered = savedWords.filter(w => w.id !== wordId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * 获取所有保存的单词
   */
  getSavedWords(): SavedWord[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load saved words:', error);
      return [];
    }
  }

  /**
   * 检查单词是否已保存
   */
  isWordSaved(word: string): boolean {
    const savedWords = this.getSavedWords();
    return savedWords.some(w => w.word.toLowerCase() === word.toLowerCase());
  }

  /**
   * 获取单词本统计
   */
  getStatistics() {
    const savedWords = this.getSavedWords();
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    return {
      total: savedWords.length,
      todayAdded: savedWords.filter(w => w.savedAt > oneDayAgo).length,
    };
  }
}

const vocabularyService = new VocabularyService();

export default vocabularyService;
