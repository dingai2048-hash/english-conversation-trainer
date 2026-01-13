/**
 * MicButton Component
 * Microphone button for voice input control
 * Requirements: 1.2, 2.1, 2.2, 2.3
 */

import React from 'react';
import { MicButtonProps } from '../types';

/**
 * MicButton component
 * Displays a microphone button that toggles recording state
 */
export const MicButton: React.FC<MicButtonProps> = ({
  isRecording,
  onToggleRecording,
  disabled,
  isContinuousMode = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <button
        onClick={onToggleRecording}
        disabled={disabled}
        className={`
          relative w-20 h-20 rounded-full
          flex items-center justify-center
          transition-all duration-300 transform
          focus:outline-none focus:ring-4 focus:ring-opacity-50
          ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 scale-110 animate-pulse'
              : disabled
              ? 'bg-gray-300 cursor-not-allowed'
              : isContinuousMode
              ? 'bg-green-500 hover:bg-green-600 focus:ring-green-300 hover:scale-105'
              : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300 hover:scale-105'
          }
          ${disabled ? '' : 'shadow-lg hover:shadow-xl'}
        `}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        aria-pressed={isRecording}
      >
        {/* Microphone Icon */}
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isRecording ? (
            // Stop icon when recording
            <rect x="6" y="6" width="12" height="12" fill="currentColor" />
          ) : (
            // Microphone icon when not recording
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </>
          )}
        </svg>

        {/* Recording indicator ring */}
        {isRecording && (
          <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-75"></div>
        )}
        
        {/* Continuous mode indicator ring */}
        {isContinuousMode && !isRecording && !disabled && (
          <div className="absolute inset-0 rounded-full border-4 border-green-300 opacity-50"></div>
        )}
      </button>

      {/* Status text */}
      <div className="mt-3 text-center">
        <p
          className={`
            text-sm font-medium transition-colors duration-300
            ${isRecording ? 'text-red-600' : disabled ? 'text-gray-400' : isContinuousMode ? 'text-green-600' : 'text-gray-600'}
          `}
        >
          {isRecording ? 'Recording...' : disabled ? 'Processing...' : isContinuousMode ? 'Continuous Mode' : 'Tap to speak'}
        </p>
        {isContinuousMode && !isRecording && !disabled && (
          <p className="text-xs text-gray-500 mt-1">自动录音已启用</p>
        )}
      </div>
    </div>
  );
};

export default MicButton;
