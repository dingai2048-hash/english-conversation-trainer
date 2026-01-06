/**
 * KoalaCharacter Component
 * Displays the koala character with visual feedback based on state
 * Requirements: 1.1, 6.2, 6.3
 */

import React from 'react';
import { KoalaCharacterProps } from '../types';

/**
 * KoalaCharacter component
 * Shows a friendly koala character that provides visual feedback during interaction
 */
export const KoalaCharacter: React.FC<KoalaCharacterProps> = ({
  isListening,
  isThinking,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Koala Character Container */}
      <div className="relative">
        {/* Main Koala Circle */}
        <div
          className={`
            w-48 h-48 rounded-full bg-gradient-to-br from-gray-300 to-gray-400
            flex items-center justify-center shadow-lg
            transition-all duration-300
            ${isListening ? 'scale-110 ring-4 ring-blue-400 ring-opacity-50' : ''}
            ${isThinking ? 'animate-pulse' : ''}
          `}
        >
          {/* Koala Face */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Ears */}
            <div className="absolute -top-6 left-8 w-16 h-20 bg-gray-400 rounded-full transform -rotate-12"></div>
            <div className="absolute -top-6 right-8 w-16 h-20 bg-gray-400 rounded-full transform rotate-12"></div>
            
            {/* Inner Ears */}
            <div className="absolute -top-4 left-10 w-10 h-12 bg-pink-200 rounded-full transform -rotate-12"></div>
            <div className="absolute -top-4 right-10 w-10 h-12 bg-pink-200 rounded-full transform rotate-12"></div>

            {/* Face */}
            <div className="relative z-10">
              {/* Eyes */}
              <div className="flex gap-8 mb-4">
                <div className="relative">
                  <div className="w-8 h-8 bg-black rounded-full"></div>
                  {isListening && (
                    <div className="absolute inset-0 w-8 h-8 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                  )}
                </div>
                <div className="relative">
                  <div className="w-8 h-8 bg-black rounded-full"></div>
                  {isListening && (
                    <div className="absolute inset-0 w-8 h-8 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                  )}
                </div>
              </div>

              {/* Nose */}
              <div className="flex justify-center mb-2">
                <div className="w-12 h-10 bg-black rounded-full"></div>
              </div>

              {/* Mouth */}
              <div className="flex justify-center">
                <div
                  className={`
                    w-8 h-4 border-b-4 border-black rounded-b-full
                    transition-all duration-300
                    ${isThinking ? 'animate-bounce' : ''}
                  `}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {(isListening || isThinking) && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-full text-center">
            <div
              className={`
                inline-block px-4 py-2 rounded-full text-sm font-medium
                ${isListening ? 'bg-blue-100 text-blue-700' : ''}
                ${isThinking ? 'bg-purple-100 text-purple-700' : ''}
              `}
            >
              {isListening && '🎤 Listening...'}
              {isThinking && '💭 Thinking...'}
            </div>
          </div>
        )}
      </div>

      {/* Character Name */}
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700">Koala Teacher</h2>
        <p className="text-sm text-gray-500 mt-1">Your English Practice Partner</p>
      </div>
    </div>
  );
};

export default KoalaCharacter;
