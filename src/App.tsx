/**
 * Main App Component
 * Integrates all components and manages the conversation flow
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */

import React, { useCallback, useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { KoalaCharacter } from './components/KoalaCharacter';
import { MicButton } from './components/MicButton';
import { ConversationDisplay } from './components/ConversationDisplay';
import { TranslationToggle } from './components/TranslationToggle';
import { SettingsModal, AISettings } from './components/SettingsModal';
import { SpeechRecognitionService } from './services/SpeechRecognitionService';
import { AIConversationService } from './services/AIConversationService';
import { SpeechSynthesisService } from './services/SpeechSynthesisService';
import { SettingsService } from './services/SettingsService';

// 初始化服务
const speechService = new SpeechRecognitionService();
let aiService: AIConversationService;
const ttsService = new SpeechSynthesisService();

// 初始化AI服务
const initializeAIService = (settings: AISettings) => {
  if (settings.provider === 'mock') {
    return new AIConversationService({ apiKey: 'mock' });
  } else {
    return new AIConversationService({
      apiKey: settings.apiKey,
      apiEndpoint: settings.endpoint,
      model: settings.model,
    });
  }
};

// 从本地存储加载设置并初始化AI服务
const settings = SettingsService.getSettings();
aiService = initializeAIService(settings);

function AppContent() {
  const {
    messages,
    isRecording,
    isProcessing,
    isSpeaking,
    showTranslation,
    error,
    addMessage,
    setRecording,
    setProcessing,
    setSpeaking,
    toggleTranslation,
    setError,
  } = useAppContext();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<AISettings>(SettingsService.getSettings());

  // 检查是否需要显示设置提示
  useEffect(() => {
    const settings = SettingsService.getSettings();
    if (settings.provider === 'mock') {
      // 可以在这里添加提示用户配置API的逻辑
      console.log('当前使用Mock模式，可以在设置中配置真实的AI API');
    }
  }, []);

  const handleSaveSettings = (newSettings: AISettings) => {
    SettingsService.saveSettings(newSettings);
    setCurrentSettings(newSettings);
    
    // 重新初始化AI服务
    aiService = initializeAIService(newSettings);
    
    // 显示成功消息
    alert('设置已保存！');
  };

  // 处理录音切换
  const handleToggleRecording = useCallback(async () => {
    try {
      if (!speechService.isSupported()) {
        setError('您的浏览器不支持语音识别。请使用Chrome或Edge浏览器。');
        return;
      }

      if (isRecording) {
        // 停止录音
        setRecording(false);
        setProcessing(true);

        try {
          const recognizedText = await speechService.stopRecording();
          
          if (recognizedText.trim()) {
            // 添加用户消息
            addMessage('user', recognizedText);

            // 获取AI回复
            try {
              const aiResponse = await aiService.sendMessage(recognizedText, messages);
              
              // 获取翻译（如果需要）
              let translation: string | undefined;
              if (showTranslation) {
                try {
                  translation = await aiService.translateToZh(aiResponse);
                } catch (err) {
                  console.error('翻译失败:', err);
                  // 翻译失败不影响主流程
                }
              }

              // 添加AI消息
              addMessage('assistant', aiResponse, translation);
              
              // 让考拉说出回复（语音合成）
              try {
                setSpeaking(true);
                await ttsService.speak(aiResponse, 'en-US');
              } catch (err) {
                console.error('语音合成失败:', err);
                // 语音合成失败不影响主流程
              } finally {
                setSpeaking(false);
              }
            } catch (err) {
              setError('AI服务暂时不可用，请稍后重试。');
              console.error('AI服务错误:', err);
            }
          }
        } catch (err) {
          setError('语音识别失败，请重试。');
          console.error('语音识别错误:', err);
        } finally {
          setProcessing(false);
        }
      } else {
        // 开始录音
        try {
          await speechService.startRecording();
          setRecording(true);
          setError(null);
        } catch (err) {
          setError('无法访问麦克风。请检查权限设置。');
          console.error('麦克风权限错误:', err);
        }
      }
    } catch (err) {
      setError('发生未知错误，请刷新页面重试。');
      console.error('未知错误:', err);
      setRecording(false);
      setProcessing(false);
    }
  }, [isRecording, messages, showTranslation, addMessage, setRecording, setProcessing, setSpeaking, setError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={currentSettings}
      />

      {/* Header with Settings Button */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🐨</span>
            <h1 className="text-xl font-bold text-gray-800">英语对话训练</h1>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>设置</span>
          </button>
        </div>
      </div>

      {/* API Status Indicator */}
      {currentSettings.provider === 'mock' && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-yellow-800 text-sm">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>当前使用测试模式，AI回复为预设内容</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-yellow-800 hover:text-yellow-900 underline text-sm"
            >
              配置真实API
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4 rounded">
          <p className="font-medium">错误</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            关闭
          </button>
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex-1 container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* 左侧：考拉和麦克风 */}
        <div className="lg:w-1/3 flex flex-col items-center justify-center space-y-8">
          <div className="text-center">
            <p className="text-gray-600">与AI考拉练习英语口语</p>
          </div>

          <KoalaCharacter
            isListening={isRecording}
            isThinking={isProcessing || isSpeaking}
          />

          <MicButton
            isRecording={isRecording}
            onToggleRecording={handleToggleRecording}
            disabled={isProcessing || isSpeaking}
          />

          <div className="text-center text-sm text-gray-500">
            {isRecording && <p>正在录音...</p>}
            {isProcessing && <p>正在处理...</p>}
            {isSpeaking && <p>考拉正在说话...</p>}
            {!isRecording && !isProcessing && !isSpeaking && <p>点击麦克风开始对话</p>}
          </div>
        </div>

        {/* 右侧：对话显示和翻译切换 */}
        <div className="lg:w-2/3 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
            <h2 className="text-xl font-semibold">对话记录</h2>
            <TranslationToggle
              enabled={showTranslation}
              onToggle={toggleTranslation}
            />
          </div>

          <ConversationDisplay
            messages={messages}
            showTranslation={showTranslation}
          />
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-600">
        <p>建议使用Chrome或Edge浏览器以获得最佳体验</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
