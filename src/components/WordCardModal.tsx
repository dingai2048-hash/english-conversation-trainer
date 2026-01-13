/**
 * 单词卡片弹窗组件
 * 显示单词的详细信息，支持发音和收藏
 */

import React, { useEffect, useState } from 'react';
import { X, Volume2, Heart, Loader2 } from 'lucide-react';
import VocabularyService, { WordDefinition, SavedWord } from '../services/VocabularyService';

interface WordCardModalProps {
  word: string;
  isOpen: boolean;
  onClose: () => void;
  context?: string; // 单词出现的上下文（例句）
}

export const WordCardModal: React.FC<WordCardModalProps> = ({
  word,
  isOpen,
  onClose,
  context,
}) => {
  const [definition, setDefinition] = useState<WordDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  useEffect(() => {
    if (isOpen && word) {
      const loadData = async () => {
        await loadDefinition();
        checkIfSaved();
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, word]);

  const loadDefinition = async () => {
    setLoading(true);
    try {
      const def = await VocabularyService.getDefinition(word);
      setDefinition(def);
    } catch (error) {
      console.error('Failed to load definition:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = () => {
    setIsSaved(VocabularyService.isWordSaved(word));
  };

  const handlePlayAudio = () => {
    if (!definition?.word) return;
    
    setPlayingAudio(true);
    const utterance = new SpeechSynthesisUtterance(definition.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    utterance.onend = () => setPlayingAudio(false);
    utterance.onerror = () => setPlayingAudio(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleSave = () => {
    if (!definition) return;

    if (isSaved) {
      // 取消收藏
      const savedWords = VocabularyService.getSavedWords();
      const wordToRemove = savedWords.find(w => w.word.toLowerCase() === word.toLowerCase());
      if (wordToRemove) {
        VocabularyService.removeWord(wordToRemove.id);
        setIsSaved(false);
      }
    } else {
      // 收藏单词
      const firstMeaning = definition.meanings[0];
      const firstDef = firstMeaning?.definitions[0];
      
      const savedWord: SavedWord = {
        id: `${Date.now()}-${word}`,
        word: definition.word,
        phonetic: definition.phonetic,
        definition: firstDef?.definition || '',
        partOfSpeech: firstMeaning?.partOfSpeech || '',
        example: context || firstDef?.example || '',
        savedAt: Date.now(),
      };

      VocabularyService.saveWord(savedWord);
      setIsSaved(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3 flex-1">
            <h2 className="text-2xl font-bold text-amber-800">
              {definition?.word || word}
            </h2>
            {definition?.phonetic && (
              <span className="text-amber-600 text-sm">
                {definition.phonetic}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayAudio}
              disabled={!definition || playingAudio}
              className="p-2 rounded-full hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              {playingAudio ? (
                <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
              ) : (
                <Volume2 className="w-5 h-5 text-amber-600" />
              )}
            </button>
            <button
              onClick={handleToggleSave}
              disabled={!definition}
              className="p-2 rounded-full hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              <Heart
                className={`w-5 h-5 ${
                  isSaved
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-amber-600'
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-amber-100 transition-colors"
            >
              <X className="w-5 h-5 text-amber-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : definition ? (
            <div className="space-y-6">
              {/* Meanings */}
              {definition.meanings.map((meaning, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                      {meaning.partOfSpeech}
                    </span>
                  </div>
                  
                  {meaning.definitions.map((def, defIdx) => (
                    <div key={defIdx} className="pl-4 border-l-2 border-amber-200">
                      <p className="text-gray-700 mb-2">{def.definition}</p>
                      {def.example && (
                        <p className="text-sm text-gray-500 italic">
                          "{def.example}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Context from conversation */}
              {context && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 mb-2">
                    来自对话
                  </p>
                  <p className="text-sm text-gray-700 italic">
                    "{context}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">无法加载单词释义</p>
              <p className="text-sm text-gray-400 mt-2">
                请检查网络连接或稍后重试
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
