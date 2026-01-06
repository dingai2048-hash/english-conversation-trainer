/**
 * TranslationToggle Component
 * Toggle button to show/hide Chinese translations
 * Requirements: 7.1, 7.2, 7.4, 7.5
 */

import React from 'react';
import { TranslationToggleProps } from '../types';

export const TranslationToggle: React.FC<TranslationToggleProps> = ({
  enabled,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`
        px-6 py-3 rounded-lg font-medium text-sm
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          enabled
            ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
            : 'bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-gray-500'
        }
      `}
      aria-label={enabled ? 'Hide translations' : 'Show translations'}
      aria-pressed={enabled}
    >
      <div className="flex items-center space-x-2">
        {/* Icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        
        {/* Label */}
        <span>{enabled ? '中文翻译：开' : '中文翻译：关'}</span>
      </div>
    </button>
  );
};

export default TranslationToggle;
