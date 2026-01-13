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
import { ReplicateTTSService } from './services/ReplicateTTSService';
import { SettingsService } from './services/SettingsService';
import { ConversationHistoryService } from './services/ConversationHistoryService';
import { SmartPronunciationService } from './services/SmartPronunciationService';

// 初始化服务
const speechService = new SpeechRecognitionService();

// 初始化AI服务
const initializeAIService = (settings: AISettings) => {
  if (settings.provider === 'mock') {
    return new AIConversationService({ 
      apiKey: 'mock',
      systemPrompt: settings.systemPrompt 
    });
  } else {
    return new AIConversationService({
      apiKey: settings.apiKey,
      apiEndpoint: settings.endpoint,
      model: settings.model,
      systemPrompt: settings.systemPrompt,
    });
  }
};

// 初始化TTS服务
const initializeTTSService = (settings: AISettings): SpeechSynthesisService | ReplicateTTSService => {
  if (settings.ttsProvider === 'replicate' && settings.replicateApiKey) {
    return new ReplicateTTSService({
      apiKey: settings.replicateApiKey,
      model: settings.replicateTTSModel || 'turbo',
    });
  } else {
    return new SpeechSynthesisService();
  }
};

// 初始化发音评估服务
const initializePronunciationService = (settings: AISettings): SmartPronunciationService | null => {
  if (
    settings.pronunciationEnabled &&
    settings.azureSpeechKey &&
    settings.azureSpeechRegion
  ) {
    return new SmartPronunciationService(
      {
        apiKey: settings.azureSpeechKey,
        region: settings.azureSpeechRegion,
      },
      settings.userLevel || 'beginner'
    );
  }
  return null;
};

function AppContent() {
  const {
    messages,
    isRecording,
    isProcessing,
    isSpeaking,
    showTranslation,
    error,
    isContinuousMode,
    addMessage,
    setRecording,
    setProcessing,
    setSpeaking,
    toggleTranslation,
    setError,
    toggleContinuousMode,
  } = useAppContext();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<AISettings>(SettingsService.getSettings());
  const [showHistory, setShowHistory] = useState(false);
  
  // 使用 useRef 来保存服务实例
  const aiServiceRef = React.useRef<AIConversationService>(initializeAIService(currentSettings));
  const ttsServiceRef = React.useRef<SpeechSynthesisService | ReplicateTTSService>(initializeTTSService(currentSettings));
  const pronunciationServiceRef = React.useRef<SmartPronunciationService | null>(initializePronunciationService(currentSettings));
  
  // 自动保存对话记录
  useEffect(() => {
    // 当有至少2条消息时（一问一答），自动保存
    if (messages.length >= 2) {
      const saveConversation = async () => {
        try {
          // 生成对话摘要
          const summaryPrompt = ConversationHistoryService.generateSummaryPrompt(messages);
          const summary = await aiServiceRef.current.sendMessage(summaryPrompt, []);
          
          // 保存会话
          ConversationHistoryService.saveSession(messages, summary);
        } catch (err) {
          console.error('自动保存失败:', err);
          // 即使摘要生成失败，也保存对话
          ConversationHistoryService.saveSession(messages);
        }
      };

      // 延迟保存，避免频繁保存
      const timeoutId = setTimeout(saveConversation, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

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
    aiServiceRef.current = initializeAIService(newSettings);
    
    // 重新初始化TTS服务
    ttsServiceRef.current = initializeTTSService(newSettings);
    
    // 重新初始化发音评估服务
    pronunciationServiceRef.current = initializePronunciationService(newSettings);
    
    // 显示成功消息
    alert('设置已保存！');
  };

  // 处理发音评价请求
  const handleRequestFeedback = useCallback(async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || message.role !== 'user') return;

    try {
      setProcessing(true);
      
      // 构建发音评价请求
      const feedbackPrompt = `Please evaluate my pronunciation of: "${message.content}". Give me brief, encouraging feedback in simple English (A1-A2 level). Focus on: 1) Overall clarity (good/needs work), 2) One specific tip to improve. Keep it short (2-3 sentences max).`;
      
      const feedbackResponse = await aiServiceRef.current.sendMessage(feedbackPrompt, []);
      
      // 获取翻译
      let translation: string | undefined;
      if (showTranslation) {
        try {
          translation = await aiServiceRef.current.translateToZh(feedbackResponse);
        } catch (err) {
          console.error('翻译失败:', err);
        }
      }
      
      // 添加AI的发音评价
      addMessage('assistant', `🎤 ${feedbackResponse}`, translation);
      
      // 让AI说出评价
      try {
        setSpeaking(true);
        await ttsServiceRef.current.speak(feedbackResponse, 'en-US');
      } catch (err) {
        console.error('语音合成失败:', err);
      } finally {
        setSpeaking(false);
      }
    } catch (err) {
      setError('无法获取发音评价，请稍后重试。');
      console.error('发音评价错误:', err);
    } finally {
      setProcessing(false);
    }
  }, [messages, showTranslation, addMessage, setProcessing, setSpeaking, setError]);

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
            // 获取音频数据用于发音评估
            const audioBlob = speechService.getAudioBlob();
            const confidence = speechService.getConfidence();

            // 添加用户消息
            addMessage('user', recognizedText);

            // 发音评估（如果启用）
            let pronunciationFeedback: string | null = null;
            if (pronunciationServiceRef.current && audioBlob) {
              try {
                const assessmentResult = await pronunciationServiceRef.current.processUserSpeech(
                  audioBlob,
                  recognizedText,
                  confidence
                );
                
                if (assessmentResult && assessmentResult.shouldCorrect && assessmentResult.feedback) {
                  pronunciationFeedback = assessmentResult.feedback;
                  console.log('[Pronunciation] Assessment result:', assessmentResult);
                }
              } catch (err) {
                console.error('[Pronunciation] Assessment failed:', err);
                // 评估失败不影响主流程
              }
            }

            // 获取AI回复
            try {
              // 如果有发音反馈，将其注入到AI提示中
              let userMessage = recognizedText;
              if (pronunciationFeedback) {
                userMessage = `[User said: "${recognizedText}"] [Pronunciation note: ${pronunciationFeedback}. Gently correct this in your response if appropriate.]`;
              }

              console.log('[App] Calling AI service...');
              console.log('[App] Current settings:', {
                provider: currentSettings.provider,
                endpoint: currentSettings.endpoint,
                model: currentSettings.model,
                hasApiKey: !!currentSettings.apiKey,
              });

              const aiResponse = await aiServiceRef.current.sendMessage(userMessage, messages);
              
              console.log('[App] AI response received:', aiResponse);
              
              // 获取翻译（如果需要）
              let translation: string | undefined;
              if (showTranslation) {
                try {
                  translation = await aiServiceRef.current.translateToZh(aiResponse);
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
                await ttsServiceRef.current.speak(aiResponse, 'en-US');
              } catch (err) {
                console.error('语音合成失败:', err);
                // 语音合成失败不影响主流程
              } finally {
                setSpeaking(false);
              }
            } catch (err) {
              console.error('[App] AI service error details:', err);
              console.error('[App] Error type:', err instanceof Error ? err.constructor.name : typeof err);
              console.error('[App] Error message:', err instanceof Error ? err.message : String(err));
              console.error('[App] Error stack:', err instanceof Error ? err.stack : 'No stack trace');
              
              setError('AI服务暂时不可用，请稍后重试。');
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
  }, [isRecording, messages, showTranslation, addMessage, setRecording, setProcessing, setSpeaking, setError, currentSettings]);

  // 连续对话模式：AI说完后自动开始录音
  useEffect(() => {
    if (isContinuousMode && !isSpeaking && !isRecording && !isProcessing && messages.length > 0) {
      // AI刚说完，自动开始下一轮录音
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        // 延迟一点时间，让用户准备
        const timer = setTimeout(() => {
          handleToggleRecording();
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isContinuousMode, isSpeaking, isRecording, isProcessing, messages, handleToggleRecording]);

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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              title="查看历史记录"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>历史</span>
            </button>
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
        {/* 历史记录侧边栏 */}
        {showHistory && (
          <div className="lg:w-1/4 bg-white rounded-lg shadow-lg p-4 overflow-y-auto" style={{ maxHeight: '600px' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">历史记录</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {(() => {
              const recentSessions = ConversationHistoryService.getRecentSessions(20);
              const stats = ConversationHistoryService.getStatistics();
              
              return (
                <>
                  {/* 统计信息 */}
                  <div className="bg-indigo-50 rounded-lg p-3 mb-4 text-sm">
                    <p className="text-gray-700">📊 总会话: {stats.totalSessions}</p>
                    <p className="text-gray-700">💬 总消息: {stats.totalMessages}</p>
                    <p className="text-gray-700">📅 练习天数: {stats.totalDays}</p>
                  </div>

                  {/* 会话列表 */}
                  <div className="space-y-2">
                    {recentSessions.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">暂无历史记录</p>
                    ) : (
                      recentSessions.map((session) => (
                        <div
                          key={session.id}
                          className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs text-gray-500">{session.date}</span>
                            <span className="text-xs text-gray-500">{session.time}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 mb-1">
                            {session.summary || '对话练习'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {session.messageCount} 条消息
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 导出按钮 */}
                  {recentSessions.length > 0 && (
                    <button
                      onClick={() => {
                        const data = ConversationHistoryService.exportHistory();
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `conversation-history-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}
                      className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                    >
                      📥 导出历史记录
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* 左侧：考拉和麦克风 */}
        <div className={`${showHistory ? 'lg:w-1/4' : 'lg:w-1/3'} flex flex-col items-center justify-center space-y-8`}>
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
            isContinuousMode={isContinuousMode}
          />

          <div className="text-center text-sm text-gray-500">
            {isRecording && <p>正在录音...</p>}
            {isProcessing && <p>正在处理...</p>}
            {isSpeaking && <p>考拉正在说话...</p>}
            {!isRecording && !isProcessing && !isSpeaking && (
              <p>{isContinuousMode ? '连续对话模式已启用' : '点击麦克风开始对话'}</p>
            )}
          </div>

          {/* 连续模式切换按钮 */}
          <button
            onClick={toggleContinuousMode}
            className={`
              px-6 py-2 rounded-lg font-medium transition-all duration-300
              ${isContinuousMode 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
            `}
            disabled={isRecording || isProcessing || isSpeaking}
          >
            {isContinuousMode ? '🔄 退出连续模式' : '🔄 进入连续模式'}
          </button>
        </div>

        {/* 右侧：对话显示和翻译切换 */}
        <div className="lg:w-2/3 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center flex-shrink-0">
            <h2 className="text-xl font-semibold">对话记录</h2>
            <TranslationToggle
              enabled={showTranslation}
              onToggle={toggleTranslation}
            />
          </div>

          <ConversationDisplay
            messages={messages}
            showTranslation={showTranslation}
            onRequestFeedback={handleRequestFeedback}
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
