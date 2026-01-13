/**
 * 高亮文本组件
 * 将文本中的重点词汇高亮显示，并支持点击
 */

import React from 'react';
import VocabularyService, { HighlightedWord } from '../services/VocabularyService';

interface HighlightedTextProps {
  text: string;
  onWordClick: (word: string) => void;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, onWordClick }) => {
  const [keywords, setKeywords] = React.useState<HighlightedWord[]>([]);

  React.useEffect(() => {
    // 识别关键词
    const identified = VocabularyService.identifyKeywords(text);
    setKeywords(identified);
  }, [text]);

  if (keywords.length === 0) {
    return <>{text}</>;
  }

  // 将文本分割成片段
  const segments: Array<{ text: string; isKeyword: boolean; word?: string }> = [];
  let lastIndex = 0;

  keywords.forEach((kw) => {
    // 添加关键词之前的普通文本
    if (kw.startIndex > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, kw.startIndex),
        isKeyword: false,
      });
    }

    // 添加关键词
    segments.push({
      text: kw.word,
      isKeyword: true,
      word: kw.lemma,
    });

    lastIndex = kw.endIndex;
  });

  // 添加最后的普通文本
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isKeyword: false,
    });
  }

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.isKeyword) {
          return (
            <span
              key={index}
              onClick={() => onWordClick(segment.word!)}
              className="text-amber-600 underline decoration-dotted cursor-pointer hover:text-amber-700 hover:bg-amber-50 rounded px-0.5 transition-colors"
              style={{ textDecorationThickness: '1px', textUnderlineOffset: '2px' }}
            >
              {segment.text}
            </span>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </>
  );
};
