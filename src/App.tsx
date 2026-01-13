/**
 * V0 Design Integration - Main App Component
 * 集成 v0 设计的新 UI 与现有功能
 */

import React, { useCallback, useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { SettingsModal, AISettings } from './components/SettingsModal';
import { ConversationDetailModal } from './components/ConversationDetailModal';
import { SpeechRecognitionService } from './services/SpeechRecognitionService';
import { HybridSTTService } from './services/HybridSTTService';
import { AIConversationService } from './services/AIConversationService';
import { SpeechSynthesisService } from './services/SpeechSynthesisService';
import { ReplicateTTSService } from './services/ReplicateTTSService';
import { OpenAITTSService } from './services/OpenAITTSService';
import { SettingsService } from './services/SettingsService';
import { ConversationHistoryService, ConversationSession } from './services/ConversationHistoryService';
import { SmartPronunciationService } from './services/SmartPronunciationService';
import { Home, Clock, FileText, Settings, Menu, X, ChevronLeft, ChevronRight, Mic, Languages } from "lucide-react";
import { cn } from "./lib/utils";
import { Switch } from "./components/ui/switch";
import { HighlightedText } from "./components/HighlightedText";
import { WordCardModal } from "./components/WordCardModal";

// 场景卡片数据
const sceneCards = [
  { id: 1, title: "日常生活", image: "/cute-koala-cartoon-character-in-cozy-living-room-w.jpg" },
  { id: 2, title: "工作学习", image: "/cute-koala-cartoon-character-studying-at-desk-in-c.jpg" },
  { id: 3, title: "旅行探险", image: "/cute-koala-cartoon-character-hiking-in-mountains-a.jpg" },
  { id: 4, title: "运动健身", image: "/cute-koala-cartoon-character-exercising-gym-workou.jpg" },
  { id: 5, title: "社交聚会", image: "/cute-koala-cartoon-character-at-party-with-decorat.jpg" },
];

// 初始化语音识别服务
const initializeSTTService = (settings: AISettings): SpeechRecognitionService | HybridSTTService => {
  if (settings.sttProvider === 'whisper' && settings.apiKey) {
    // 使用混合模式：浏览器 STT 检测静音 + Whisper 高精度识别
    return new HybridSTTService({
      apiKey: settings.apiKey,
      language: 'en',
      silenceThreshold: 800, // 优化：0.8 秒静音自动提交（更快响应）
    });
  } else {
    return new SpeechRecognitionService();
  }
};

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

const initializeTTSService = (settings: AISettings): SpeechSynthesisService | ReplicateTTSService | OpenAITTSService => {
  if (settings.ttsProvider === 'openai' && settings.apiKey) {
    return new OpenAITTSService({
      apiKey: settings.apiKey, // 使用与 OpenAI 对话模型相同的 API Key
      voice: settings.openaiTTSVoice || 'nova',
      model: settings.openaiTTSModel || 'tts-1-hd',
      speed: settings.openaiTTSSpeed || 0.9,
    });
  } else if (settings.ttsProvider === 'replicate' && settings.replicateApiKey) {
    return new ReplicateTTSService({
      apiKey: settings.replicateApiKey,
      model: settings.replicateTTSModel || 'turbo',
    });
  } else {
    return new SpeechSynthesisService();
  }
};

const initializePronunciationService = (settings: AISettings): SmartPronunciationService | null => {
  if (settings.pronunciationEnabled && settings.azureSpeechKey && settings.azureSpeechRegion) {
    return new SmartPronunciationService(
      { apiKey: settings.azureSpeechKey, region: settings.azureSpeechRegion },
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
    isInSession,
    addMessage,
    setRecording,
    setProcessing,
    setSpeaking,
    toggleTranslation,
    setError,
    startSession,
    endSession,
  } = useAppContext();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<AISettings>(SettingsService.getSettings());
  const [showHistory, setShowHistory] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // 词汇卡片状态
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [wordContext, setWordContext] = useState<string>('');
  
  // 对话容器引用（用于自动滚动）
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const chatContainerMobileRef = React.useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  // 视频引用 - 桌面端和移动端
  const koalaVideoRef = React.useRef<HTMLVideoElement>(null);
  const koalaVideoMobileRef = React.useRef<HTMLVideoElement>(null);
  
  // 根据状态切换视频
  useEffect(() => {
    // 根据不同状态确定视频源
    let videoSrc = '/koala.mp4'; // 默认视频（idle状态）
    let stateName = 'idle';
    
    if (isRecording) {
      videoSrc = '/koala-listening.mp4'; // 录音时的视频
      stateName = 'listening';
    } else if (isProcessing) {
      videoSrc = '/koala-thinking.mp4'; // 思考时的视频
      stateName = 'thinking';
    } else if (isSpeaking) {
      videoSrc = '/koala-speaking.mp4'; // 说话时的视频
      stateName = 'speaking';
    }
    
    console.log(`[Video] State changed to: ${stateName}, video: ${videoSrc}`);
    
    // 更新桌面端视频
    const desktopVideo = koalaVideoRef.current;
    if (desktopVideo) {
      const currentSrc = desktopVideo.getAttribute('src');
      if (currentSrc !== videoSrc) {
        console.log(`[Video] Desktop - Switching from ${currentSrc} to ${videoSrc}`);
        desktopVideo.src = videoSrc;
        desktopVideo.load();
        desktopVideo.play().catch((err) => {
          console.warn('[Video] Desktop autoplay failed:', err);
        });
      }
    }
    
    // 更新移动端视频
    const mobileVideo = koalaVideoMobileRef.current;
    if (mobileVideo) {
      const currentSrc = mobileVideo.getAttribute('src');
      if (currentSrc !== videoSrc) {
        console.log(`[Video] Mobile - Switching from ${currentSrc} to ${videoSrc}`);
        mobileVideo.src = videoSrc;
        mobileVideo.load();
        mobileVideo.play().catch((err) => {
          console.warn('[Video] Mobile autoplay failed:', err);
        });
      }
    }
  }, [isRecording, isProcessing, isSpeaking]);
  
  const aiServiceRef = React.useRef<AIConversationService>(initializeAIService(currentSettings));
  const sttServiceRef = React.useRef<SpeechRecognitionService | HybridSTTService>(initializeSTTService(currentSettings));
  const ttsServiceRef = React.useRef<SpeechSynthesisService | ReplicateTTSService | OpenAITTSService>(initializeTTSService(currentSettings));
  const pronunciationServiceRef = React.useRef<SmartPronunciationService | null>(initializePronunciationService(currentSettings));
  
  // 自动保存对话记录 - 仅在会话结束时保存
  useEffect(() => {
    // 不再自动保存，只在用户点击"结束对话"时保存
  }, [messages]);

  const handleSaveSettings = (newSettings: AISettings) => {
    SettingsService.saveSettings(newSettings);
    setCurrentSettings(newSettings);
    aiServiceRef.current = initializeAIService(newSettings);
    sttServiceRef.current = initializeSTTService(newSettings);
    ttsServiceRef.current = initializeTTSService(newSettings);
    pronunciationServiceRef.current = initializePronunciationService(newSettings);
    alert('设置已保存！');
  };

  // 开始新对话
  const handleStartSession = useCallback(() => {
    startSession();
  }, [startSession]);

  // 结束对话并保存
  const handleEndSession = useCallback(async () => {
    if (messages.length === 0) {
      endSession();
      return;
    }

    try {
      setProcessing(true);
      // 生成AI摘要
      const summaryPrompt = ConversationHistoryService.generateSummaryPrompt(messages);
      const summary = await aiServiceRef.current.sendMessage(summaryPrompt, []);
      
      // 保存会话
      ConversationHistoryService.saveSession(messages, summary);
      
      // 结束会话
      endSession();
      
      alert('对话已保存到历史记录！');
    } catch (err) {
      console.error('保存对话失败:', err);
      // 即使摘要生成失败，也保存对话
      ConversationHistoryService.saveSession(messages);
      endSession();
      alert('对话已保存（摘要生成失败）');
    } finally {
      setProcessing(false);
    }
  }, [messages, endSession, setProcessing]);

  // 查看历史对话详情
  const handleViewSession = useCallback((sessionId: string) => {
    const session = ConversationHistoryService.getSession(sessionId);
    if (session) {
      setSelectedSession(session);
      setIsDetailModalOpen(true);
    }
  }, []);

  // 处理单词点击
  const handleWordClick = useCallback((word: string, context: string) => {
    setSelectedWord(word);
    setWordContext(context);
    setIsWordModalOpen(true);
  }, []);

  // 自动滚动到底部
  const scrollToBottom = useCallback((smooth = true) => {
    const containers = [chatContainerRef.current, chatContainerMobileRef.current];
    containers.forEach(container => {
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto',
        });
      }
    });
  }, []);

  // 监听消息变化，自动滚动
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      // 延迟滚动，确保DOM已更新
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, shouldAutoScroll, scrollToBottom]);

  // 监听滚动事件，判断是否需要暂停自动滚动
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  }, []);

  const handlePressStart = useCallback(async () => {
    // 如果正在处理或 AI 正在说话，不允许录音
    if (isProcessing || isSpeaking) {
      return;
    }

    try {
      if (!sttServiceRef.current.isSupported()) {
        setError('您的浏览器不支持语音识别。请使用Chrome或Edge浏览器。');
        return;
      }

      // 开始录音（不设置自动停止回调）
      await sttServiceRef.current.startRecording();
      setRecording(true);
      setError(null);
    } catch (err) {
      setError('无法访问麦克风。请检查权限设置。');
      console.error('麦克风权限错误:', err);
    }
  }, [isProcessing, isSpeaking, setRecording, setError]);

  const handlePressEnd = useCallback(async () => {
    // 如果没有在录音，忽略
    if (!isRecording) {
      return;
    }

    setRecording(false);
    setProcessing(true);

    try {
      const recognizedText = await sttServiceRef.current.stopRecording();
      
      // 只有当识别出的文本长度 >= 5 个字符时，才触发 AI 回复
      if (recognizedText.trim() && recognizedText.trim().length >= 5) {
        const audioBlob = sttServiceRef.current.getAudioBlob();
        const confidence = sttServiceRef.current.getConfidence ? sttServiceRef.current.getConfidence() : 0.95;
        addMessage('user', recognizedText);

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
            }
          } catch (err) {
            console.error('[Pronunciation] Assessment failed:', err);
          }
        }

        try {
          let userMessage = recognizedText;
          if (pronunciationFeedback) {
            userMessage = `[User said: "${recognizedText}"] [Pronunciation note: ${pronunciationFeedback}. Gently correct this in your response if appropriate.]`;
          }

          const aiResponse = await aiServiceRef.current.sendMessage(userMessage, messages);
          
          let translation: string | undefined;
          if (showTranslation) {
            try {
              translation = await aiServiceRef.current.translateToZh(aiResponse);
            } catch (err) {
              console.error('翻译失败:', err);
            }
          }

          addMessage('assistant', aiResponse, translation);
          
          try {
            setSpeaking(true);
            await ttsServiceRef.current.speak(aiResponse, 'en-US');
          } catch (err) {
            console.error('语音合成失败:', err);
          } finally {
            setSpeaking(false);
          }
        } catch (err) {
          console.error('[App] AI service error:', err);
          setError('AI服务暂时不可用，请稍后重试。');
        }
      }
    } catch (err) {
      setError('语音识别失败，请重试。');
      console.error('语音识别错误:', err);
    } finally {
      setProcessing(false);
    }
  }, [isRecording, messages, showTranslation, addMessage, setRecording, setProcessing, setSpeaking, setError]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % 2);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + 2) % 2);

  const recentSessions = ConversationHistoryService.getRecentSessions(20);
  const stats = ConversationHistoryService.getStatistics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-orange-100 to-blue-200 relative overflow-hidden">
      {/* Floating Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stars */}
        <div className="absolute top-20 left-10 text-amber-300 text-2xl animate-pulse">✦</div>
        <div className="absolute top-40 left-[15%] text-amber-400 text-xl animate-pulse" style={{animationDelay: '100ms'}}>✧</div>
        <div className="absolute top-16 right-[20%] text-amber-300 text-lg animate-pulse" style={{animationDelay: '200ms'}}>✦</div>
        <div className="absolute top-32 right-[30%] text-rose-300 text-xl animate-pulse" style={{animationDelay: '300ms'}}>✧</div>

        {/* Hearts */}
        <div className="absolute top-24 right-[10%] text-rose-400 text-xl animate-bounce">💗</div>
        <div className="absolute bottom-40 left-[5%] text-rose-300 text-lg animate-bounce" style={{animationDelay: '150ms'}}>💕</div>
        <div className="absolute bottom-20 right-[15%] text-rose-400 text-xl animate-bounce" style={{animationDelay: '200ms'}}>💗</div>
        <div className="absolute top-[60%] left-[8%] text-rose-300 text-lg animate-bounce" style={{animationDelay: '100ms'}}>💕</div>

        {/* More Stars scattered */}
        <div className="absolute bottom-[30%] right-[25%] text-amber-200 text-xl">⭐</div>
        <div className="absolute top-[45%] left-[20%] text-amber-300 text-lg">✨</div>
        <div className="absolute bottom-[15%] left-[40%] text-amber-200 text-xl">⭐</div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={currentSettings}
      />

      <ConversationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        session={selectedSession}
      />

      <WordCardModal
        word={selectedWord}
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        context={wordContext}
      />

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col h-screen relative z-10">
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-100 shadow-sm flex items-center justify-center">
              <span className="text-2xl">🐨</span>
            </div>
            <h1 className="text-xl font-bold text-amber-800">英语对话训练</h1>
          </div>
          <p className="hidden md:block text-amber-700 text-sm">与AI考拉练习英语口语</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full transition-all font-medium",
                showHistory
                  ? "bg-white/80 text-amber-700 shadow-sm"
                  : "bg-white/60 text-amber-700 hover:bg-white/80 shadow-sm"
              )}
            >
              <Clock className="w-5 h-5" />
              <span>历史</span>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 text-amber-700 hover:bg-white/80 shadow-sm transition-all font-medium"
            >
              <Settings className="w-5 h-5" />
              <span>设置</span>
            </button>
          </div>
        </header>

        <div className="flex flex-1 px-6 pb-6 gap-5 overflow-hidden">
          {/* History Sidebar */}
          {showHistory && (
            <aside className="w-72 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg flex flex-col border-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-amber-800">历史记录</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <X className="w-5 h-5 text-rose-400" />
                </button>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 mb-4 border border-amber-100/50">
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <span className="text-base">📊</span>
                  <span>总会话: <span className="font-semibold text-amber-600">{stats.totalSessions}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-rose-600 mt-2">
                  <span className="text-base">💬</span>
                  <span>总消息: <span className="font-semibold">{stats.totalMessages}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                  <span className="text-base">🏆</span>
                  <span>练习天数: <span className="font-semibold">{stats.totalDays}</span></span>
                </div>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {recentSessions.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">暂无历史记录</p>
                ) : (
                  recentSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => handleViewSession(session.id)}
                      className="bg-white rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100/50 hover:border-amber-200"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                        <span className="font-medium">{session.date}</span>
                        <span>{session.time}</span>
                      </div>
                      <div className="font-medium text-amber-800 text-sm">{session.summary || '对话练习'}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{session.messageCount} 条消息</span>
                        <span className="text-amber-300 text-lg">💬</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </aside>
          )}

          {/* Center: Koala Character */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Decorative leaves */}
            <div className="relative mb-6">
              <div className="absolute -left-16 top-0 text-amber-300 text-2xl transform -rotate-45">🌿</div>
              <div className="absolute -right-16 top-0 text-amber-300 text-2xl transform rotate-45">🌿</div>
              <div className="absolute -left-16 bottom-0 text-amber-300 text-2xl transform rotate-45">🌿</div>
              <div className="absolute -right-16 bottom-0 text-amber-300 text-2xl transform -rotate-45">🌿</div>
            </div>

            {/* Koala Video/Image */}
            <div className="w-72 h-72 mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full blur-3xl" />
              
              {/* 视频元素 - 优先显示 */}
              <video 
                ref={koalaVideoRef}
                src="/koala.mp4" 
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full relative z-10 object-contain drop-shadow-lg"
                onError={(e) => {
                  // 视频加载失败，尝试显示图片
                  e.currentTarget.style.display = 'none';
                  const img = e.currentTarget.nextElementSibling as HTMLElement;
                  if (img) img.style.display = 'block';
                }}
              />
              
              {/* 图片后备 */}
              <img 
                src="/koala.png" 
                alt="Koala Teacher"
                className="w-full h-full relative z-10 object-contain drop-shadow-lg hidden"
              />
            </div>

            <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400 bg-clip-text text-transparent mb-2">Koala Teacher</h2>
            <p className="text-amber-700 text-lg mb-10">Your Friendly AI Companion</p>

            {/* Push-to-Talk Button */}
            {!isInSession ? (
              // Start Session Button
              <button 
                onClick={handleStartSession}
                disabled={isProcessing}
                className="relative group mb-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity scale-150" />
                <div className="absolute inset-0 bg-amber-300 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity scale-125" />
                <div className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform border-4 border-white/30 bg-gradient-to-br from-amber-300 to-orange-400">
                  <Mic className="w-12 h-12 text-white drop-shadow-md" />
                </div>
              </button>
            ) : (
              // Push-to-Talk Button (in session)
              <button 
                onMouseDown={handlePressStart}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={handlePressStart}
                onTouchEnd={handlePressEnd}
                disabled={isProcessing || isSpeaking}
                className="relative group mb-4"
              >
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity scale-150 ${isRecording ? 'bg-gradient-to-br from-orange-400 to-amber-500' : isProcessing || isSpeaking ? 'bg-gray-400' : 'bg-gradient-to-br from-amber-300 to-orange-400'}`} />
                <div className={`absolute inset-0 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity scale-125 ${isRecording ? 'bg-orange-300' : isProcessing || isSpeaking ? 'bg-gray-300' : 'bg-amber-300'}`} />
                <div className={`relative w-32 h-32 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform border-4 border-white/30 ${isRecording ? 'bg-gradient-to-br from-orange-400 to-amber-500 scale-110' : isProcessing || isSpeaking ? 'bg-gradient-to-b from-gray-400 to-gray-500' : 'bg-gradient-to-br from-amber-300 to-orange-400'}`}>
                  <Mic className={`w-12 h-12 text-white drop-shadow-md ${isRecording ? 'animate-pulse' : ''}`} />
                </div>
              </button>
            )}
            
            <p className="text-amber-700 font-medium text-lg">
              {!isInSession 
                ? '点击开始新对话' 
                : isRecording 
                  ? '🎤 正在录音...' 
                  : isProcessing 
                    ? '🔄 正在识别...' 
                    : isSpeaking 
                      ? '🗣️ 考拉正在说话...' 
                      : '按住按钮说话'}
            </p>
            <p className="text-amber-600 text-sm mt-1">
              {!isInSession 
                ? '开始后按住按钮说话' 
                : isRecording 
                  ? '松开按钮停止录音' 
                  : isProcessing
                    ? 'Whisper正在进行高精度识别...'
                    : isSpeaking
                      ? 'AI 说完后可以继续说话'
                      : '按住按钮开始录音，松开停止'}
            </p>
          </div>

          {/* Right: Scene Cards & Chat */}
          <div className="w-[420px] flex flex-col gap-5">
            {/* Scene Cards Carousel */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border-0">
              <h3 className="text-lg font-bold text-amber-800 mb-4">话题选择</h3>
              <div className="relative">
                <button
                  onClick={prevSlide}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-105 border border-gray-100"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="overflow-hidden mx-4">
                  <div
                    className="flex gap-3 transition-transform duration-300"
                    style={{ transform: `translateX(-${currentSlide * 50}%)` }}
                  >
                    {sceneCards.map((card) => (
                      <div key={card.id} className="flex-shrink-0 w-[100px] cursor-pointer group">
                        <div className="aspect-square rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all border-2 border-transparent group-hover:border-amber-200 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-4xl">
                          🎭
                        </div>
                        <p className="text-center text-sm text-amber-700 mt-2 font-medium">{card.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={nextSlide}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-105 border border-gray-100"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Chat Record */}
            <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg flex flex-col border-0 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-amber-800">对话记录</h3>
                <div className="flex items-center gap-2 bg-amber-50 rounded-full px-4 py-2 border border-amber-100">
                  <Languages className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700">中文翻译:</span>
                  <span className="text-sm text-amber-600 font-medium">{showTranslation ? "开" : "关"}</span>
                  <Switch checked={showTranslation} onCheckedChange={toggleTranslation} className="scale-90 data-[state=checked]:bg-amber-500" />
                </div>
              </div>

              <div 
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto space-y-3 pr-2"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-8 h-full">
                    <h4 className="text-3xl font-bold bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400 bg-clip-text text-transparent mb-3">Start a conversation!</h4>
                    <p className="text-amber-600 text-lg">Click the microphone to begin speaking</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={cn("flex items-end gap-2", msg.role === "user" ? "flex-row-reverse" : "")}>
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-amber-100">
                          <img 
                            src="/koala.png" 
                            alt="Koala"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">👤</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl max-w-[70%]",
                          msg.role === "user" ? "bg-gradient-to-r from-rose-400 to-orange-400 text-white" : "bg-amber-50 text-gray-700"
                        )}
                      >
                        <p>
                          {msg.role === "assistant" ? (
                            <HighlightedText 
                              text={msg.content} 
                              onWordClick={(word) => handleWordClick(word, msg.content)}
                            />
                          ) : (
                            msg.content
                          )}
                        </p>
                        {showTranslation && msg.translation && (
                          <p className="text-sm mt-1 border-t pt-1" style={{borderColor: msg.role === "user" ? "rgba(255,255,255,0.3)" : "rgba(251,191,36,0.3)"}}>{msg.translation}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - 保持原有移动端布局 */}
      <div className="lg:hidden flex flex-col min-h-screen relative z-10">
        <header className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐨</span>
            <h1 className="text-lg font-bold text-amber-800">英语对话训练</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-amber-50 transition-colors"
          >
            <Menu className="w-6 h-6 text-amber-600" />
          </button>
        </header>

        <main className="flex-1 px-4 pb-24 overflow-y-auto">
          <div className="py-4">
            <div className="flex gap-3 overflow-x-auto pb-3">
              {sceneCards.map((card) => (
                <div key={card.id} className="flex-shrink-0 w-28">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-4xl">
                    🎭
                  </div>
                  <p className="text-center text-sm text-amber-700 mt-2">{card.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm mb-4">
            <div className="flex flex-col items-center">
              <div className="w-48 h-48 mb-4 relative overflow-hidden rounded-3xl">
                {/* 视频 */}
                <video 
                  ref={koalaVideoMobileRef}
                  src="/koala.mp4" 
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const img = e.currentTarget.nextElementSibling as HTMLElement;
                    if (img) img.style.display = 'block';
                  }}
                />
                {/* 图片后备 */}
                <img 
                  src="/koala.png" 
                  alt="Koala Teacher"
                  className="w-full h-full object-contain hidden"
                />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-500 via-orange-400 to-rose-400 bg-clip-text text-transparent">Koala Teacher</h2>
              <p className="text-amber-700 mb-4">Your Friendly AI Companion</p>

              {!isInSession ? (
                <button 
                  onClick={handleStartSession}
                  disabled={isProcessing}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full blur-lg opacity-50" />
                  <div className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-300 to-orange-400">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                </button>
              ) : (
                <button 
                  onMouseDown={handlePressStart}
                  onMouseUp={handlePressEnd}
                  onTouchStart={handlePressStart}
                  onTouchEnd={handlePressEnd}
                  disabled={isProcessing || isSpeaking}
                  className="relative group"
                >
                  <div className={`absolute inset-0 rounded-full blur-lg opacity-50 ${isRecording ? 'bg-gradient-to-br from-orange-400 to-amber-500' : isProcessing || isSpeaking ? 'bg-gray-400' : 'bg-gradient-to-br from-amber-300 to-orange-400'}`} />
                  <div className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${isRecording ? 'bg-gradient-to-br from-orange-400 to-amber-500 scale-110' : isProcessing || isSpeaking ? 'bg-gradient-to-b from-gray-400 to-gray-500' : 'bg-gradient-to-br from-amber-300 to-orange-400'}`}>
                    <Mic className={`w-7 h-7 text-white ${isRecording ? 'animate-pulse' : ''}`} />
                  </div>
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-amber-700 text-sm mb-4">
            {!isInSession 
              ? '点击开始新对话' 
              : isRecording 
                ? '🎤 正在录音...' 
                : isProcessing 
                  ? '🔄 正在识别...' 
                  : isSpeaking 
                    ? '🗣️ 考拉正在说话...' 
                    : '按住按钮说话'}
          </p>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-amber-800">对话记录</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-amber-700">中文翻译:</span>
                <span className="text-sm text-amber-600">{showTranslation ? "开" : "关"}</span>
                <Switch checked={showTranslation} onCheckedChange={toggleTranslation} className="scale-75 data-[state=checked]:bg-amber-500" />
              </div>
            </div>

            <div 
              ref={chatContainerMobileRef}
              onScroll={handleScroll}
              className="space-y-3"
            >
              {messages.length === 0 ? (
                <p className="text-center text-amber-600 text-sm mt-4">Start a conversation!</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={cn("flex items-end gap-2", msg.role === "user" ? "flex-row-reverse" : "")}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-amber-100">
                        <img 
                          src="/koala.png" 
                          alt="Koala"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-rose-400 to-orange-400 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">👤</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "px-4 py-2 rounded-2xl max-w-[70%]",
                        msg.role === "user" ? "bg-gradient-to-r from-rose-400 to-orange-400 text-white" : "bg-amber-50 text-gray-700"
                      )}
                    >
                      <p>
                        {msg.role === "assistant" ? (
                          <HighlightedText 
                            text={msg.content} 
                            onWordClick={(word) => handleWordClick(word, msg.content)}
                          />
                        ) : (
                          msg.content
                        )}
                      </p>
                      {showTranslation && msg.translation && (
                        <p className="text-sm mt-1">{msg.translation}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-amber-100 px-6 py-3 flex justify-around items-center">
          {[
            { id: "home", icon: Home, label: "首页" },
            { id: "history", icon: Clock, label: "历史" },
            { id: "records", icon: FileText, label: "记录" },
            { id: "settings", icon: Settings, label: "设置" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "settings") setIsSettingsOpen(true);
                if (tab.id === "history") setShowHistory(true);
              }}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                activeTab === tab.id ? "text-amber-500" : "text-gray-400"
              )}
            >
              <tab.icon className="w-6 h-6" />
            </button>
          ))}
        </nav>
      </div>
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
