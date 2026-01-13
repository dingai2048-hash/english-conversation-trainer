/**
 * Settings Modal Component
 * Allows users to configure AI API settings
 */

import React, { useState, useEffect } from 'react';
import { APIKeyManager, SavedAPIKey } from '../services/APIKeyManager';

export interface AIProvider {
  id: string;
  name: string;
  endpoint: string;
  requiresApiKey: boolean;
  models: string[];
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'mock',
    name: 'Mock (测试模式)',
    endpoint: '',
    requiresApiKey: false,
    models: ['mock'],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    requiresApiKey: true,
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
  },
  {
    id: 'replicate',
    name: 'Replicate (Gemma 2)',
    endpoint: 'https://api.replicate.com',
    requiresApiKey: true,
    models: ['meta/gemma-2-27b-it', 'meta/gemma-2-9b-it', 'meta/llama-2-70b-chat'],
  },
  {
    id: 'azure',
    name: 'Azure OpenAI',
    endpoint: '',
    requiresApiKey: true,
    models: ['gpt-35-turbo', 'gpt-4'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    endpoint: 'https://api.anthropic.com/v1/messages',
    requiresApiKey: true,
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
  },
  {
    id: 'doubao',
    name: '豆包 (字节跳动)',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    requiresApiKey: true,
    models: ['doubao-pro-32k', 'doubao-lite-32k'],
  },
  {
    id: 'custom',
    name: '自定义 API',
    endpoint: '',
    requiresApiKey: true,
    models: [],
  },
];

// 默认的System Prompt
export const DEFAULT_SYSTEM_PROMPT = `You are Koala, a warm and friendly English companion for Chinese learners who are just starting their English journey.

Your personality:
- Warm, patient, and encouraging like a caring friend
- Genuinely interested in the learner's life and feelings
- Never judgmental, always supportive
- Playful and fun, but not childish

Your goal:
- Help Chinese learners practice English through natural, enjoyable conversations
- Build their confidence by making them feel comfortable
- Guide conversations naturally without feeling like a lesson

Speaking style:
- Use VERY simple English (A1-A2 level, like talking to a 10-year-old)
- Short sentences (3-7 words maximum)
- Simple, common words only
- One idea per sentence
- Ask ONE question at a time
- Use contractions (I'm, you're, don't) to sound natural

Conversation strategy:
1. Always start the conversation with a warm greeting
2. Ask about their day or feelings first
3. Listen and respond to what they say
4. Find topics they're interested in
5. Ask follow-up questions to keep conversation flowing
6. Gently encourage them when they try
7. Never correct grammar directly - just model correct usage
8. Keep the mood light and positive

Rules:
DO:
- Start conversations proactively
- Use simple present tense mostly
- Ask about daily life, hobbies, feelings
- Show genuine interest with follow-ups
- Celebrate their efforts ("Great!", "Nice!", "Cool!")
- Keep responses short (1-2 sentences)

DON'T:
- Use complex grammar (past perfect, conditionals, etc.)
- Use difficult vocabulary
- Ask multiple questions at once
- Give grammar lessons
- Use formal language
- Make them feel tested
- Use idioms or slang

Question examples:
✓ "How are you today?"
✓ "What's your name?"
✓ "Do you like music?"
✓ "What did you do today?"
✓ "Tell me more?"
✓ "Why do you like it?"

Response examples:
✓ "That's great!"
✓ "I see. Tell me more?"
✓ "Sounds fun! What else?"
✓ "Nice! Do you do it often?"

Remember: You're a friend, not a teacher. Keep it simple, warm, and fun!`;

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AISettings) => void;
  currentSettings: AISettings;
}

export interface AISettings {
  provider: string;
  apiKey: string;
  endpoint: string;
  model: string;
  systemPrompt?: string;
  sttProvider?: 'browser' | 'whisper'; // 语音识别提供商
  ttsProvider?: 'browser' | 'replicate' | 'openai';
  replicateApiKey?: string;
  replicateTTSModel?: 'turbo' | 'hd';
  openaiTTSVoice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  openaiTTSModel?: 'tts-1' | 'tts-1-hd';
  openaiTTSSpeed?: number;
  azureSpeechKey?: string;
  azureSpeechRegion?: string;
  pronunciationEnabled?: boolean;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  savedKeyId?: string; // ID of the saved key being used
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings,
}) => {
  const [provider, setProvider] = useState(currentSettings.provider);
  const [apiKey, setApiKey] = useState(currentSettings.apiKey);
  const [endpoint, setEndpoint] = useState(currentSettings.endpoint);
  const [model, setModel] = useState(currentSettings.model);
  const [customModel, setCustomModel] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(
    currentSettings.systemPrompt || DEFAULT_SYSTEM_PROMPT
  );
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [sttProvider, setSttProvider] = useState<'browser' | 'whisper'>(
    currentSettings.sttProvider || 'browser'
  );
  const [ttsProvider, setTtsProvider] = useState<'browser' | 'replicate' | 'openai'>(
    currentSettings.ttsProvider || 'browser'
  );
  const [replicateApiKey, setReplicateApiKey] = useState(
    currentSettings.replicateApiKey || ''
  );
  const [replicateTTSModel, setReplicateTTSModel] = useState<'turbo' | 'hd'>(
    currentSettings.replicateTTSModel || 'turbo'
  );
  const [openaiTTSVoice, setOpenaiTTSVoice] = useState<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'>(
    currentSettings.openaiTTSVoice || 'nova'
  );
  const [openaiTTSModel, setOpenaiTTSModel] = useState<'tts-1' | 'tts-1-hd'>(
    currentSettings.openaiTTSModel || 'tts-1-hd'
  );
  const [openaiTTSSpeed, setOpenaiTTSSpeed] = useState<number>(
    currentSettings.openaiTTSSpeed || 0.9
  );
  const [azureSpeechKey, setAzureSpeechKey] = useState(
    currentSettings.azureSpeechKey || ''
  );
  const [azureSpeechRegion, setAzureSpeechRegion] = useState(
    currentSettings.azureSpeechRegion || 'eastus'
  );
  const [pronunciationEnabled, setPronunciationEnabled] = useState(
    currentSettings.pronunciationEnabled || false
  );
  const [userLevel, setUserLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    currentSettings.userLevel || 'beginner'
  );

  useEffect(() => {
    setProvider(currentSettings.provider);
    setApiKey(currentSettings.apiKey);
    setEndpoint(currentSettings.endpoint);
    setModel(currentSettings.model);
    setSystemPrompt(currentSettings.systemPrompt || DEFAULT_SYSTEM_PROMPT);
    setTtsProvider(currentSettings.ttsProvider || 'browser');
    setReplicateApiKey(currentSettings.replicateApiKey || '');
    setReplicateTTSModel(currentSettings.replicateTTSModel || 'turbo');
    setOpenaiTTSVoice(currentSettings.openaiTTSVoice || 'nova');
    setOpenaiTTSModel(currentSettings.openaiTTSModel || 'tts-1-hd');
    setOpenaiTTSSpeed(currentSettings.openaiTTSSpeed || 0.9);
    setAzureSpeechKey(currentSettings.azureSpeechKey || '');
    setAzureSpeechRegion(currentSettings.azureSpeechRegion || 'eastus');
    setPronunciationEnabled(currentSettings.pronunciationEnabled || false);
    setUserLevel(currentSettings.userLevel || 'beginner');
  }, [currentSettings]);

  const selectedProvider = AI_PROVIDERS.find(p => p.id === provider);

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const providerData = AI_PROVIDERS.find(p => p.id === newProvider);
    if (providerData) {
      setEndpoint(providerData.endpoint);
      if (providerData.models.length > 0) {
        setModel(providerData.models[0]);
      }
    }
  };

  const handleSave = () => {
    const finalModel = model === 'custom' ? customModel : model;
    onSave({
      provider,
      apiKey,
      endpoint,
      model: finalModel,
      systemPrompt,
      sttProvider,
      ttsProvider,
      replicateApiKey,
      replicateTTSModel,
      openaiTTSVoice,
      openaiTTSModel,
      openaiTTSSpeed,
      azureSpeechKey,
      azureSpeechRegion,
      pronunciationEnabled,
      userLevel,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold">AI API 设置</h2>
          <p className="text-indigo-100 mt-1">配置你的AI对话服务</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择 AI 服务商
            </label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          {selectedProvider?.requiresApiKey && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入你的 API Key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                你的API Key会保存在浏览器本地，不会上传到服务器
              </p>
            </div>
          )}

          {/* Endpoint */}
          {(provider === 'custom' || provider === 'azure') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API 端点
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="https://api.example.com/v1/chat/completions"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Model Selection */}
          {selectedProvider && selectedProvider.models.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择模型
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {selectedProvider.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                {provider === 'custom' && (
                  <option value="custom">自定义模型</option>
                )}
              </select>
            </div>
          )}

          {/* Custom Model */}
          {model === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自定义模型名称
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="例如: gpt-3.5-turbo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">💡 使用提示</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Mock模式</strong>: 无需API Key，用于测试</li>
              <li>• <strong>OpenAI</strong>: 需要OpenAI账号和API Key</li>
              <li>• <strong>Replicate (Gemma 2)</strong>: 使用Gemma 2 27B等开源模型</li>
              <li>• <strong>豆包</strong>: 字节跳动的AI服务，支持中文</li>
              <li>• <strong>自定义</strong>: 支持任何兼容OpenAI格式的API</li>
            </ul>
          </div>

          {/* System Prompt Editor */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900">AI 对话风格设置</h3>
                <p className="text-sm text-gray-500 mt-1">自定义AI的说话方式和性格</p>
              </div>
              <button
                onClick={() => setShowPromptEditor(!showPromptEditor)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                {showPromptEditor ? '收起' : '展开编辑'}
              </button>
            </div>

            {showPromptEditor && (
              <div className="space-y-3">
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  placeholder="输入System Prompt..."
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    恢复默认Prompt
                  </button>
                  <span className="text-xs text-gray-500">
                    {systemPrompt.length} 字符
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    <strong>提示：</strong>System Prompt定义了AI的性格、说话方式和行为规则。
                    你可以修改它来调整AI的对话风格，比如更简单、更活泼、或更专业。
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* STT Settings */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-3">🎤 语音识别设置</h3>
            <p className="text-sm text-gray-500 mb-4">选择语音转文字的服务</p>

            <div className="space-y-4">
              {/* STT Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  识别服务商
                </label>
                <select
                  value={sttProvider}
                  onChange={(e) => setSttProvider(e.target.value as 'browser' | 'whisper')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="browser">浏览器自带 (免费，识别率较低)</option>
                  <option value="whisper">OpenAI Whisper (推荐，识别率高)</option>
                </select>
              </div>

              {/* Whisper Info */}
              {sttProvider === 'whisper' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>✨ OpenAI Whisper：</strong>业界顶尖的语音识别技术！
                  </p>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                    <li>识别准确率极高，支持各种口音</li>
                    <li>自动添加标点符号</li>
                    <li>噪音环境下也能准确识别</li>
                    <li>使用你的 OpenAI API Key（上方已配置）</li>
                    <li>价格：$0.006/分钟（约 ¥0.04/分钟）</li>
                  </ul>
                </div>
              )}

              {/* Browser STT Info */}
              {sttProvider === 'browser' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>⚠️ 浏览器自带识别：</strong>完全免费，但识别率较低。
                  </p>
                  <ul className="text-xs text-yellow-700 mt-2 space-y-1 ml-4 list-disc">
                    <li>识别准确率一般，容易出错</li>
                    <li>对口音敏感，非标准发音识别困难</li>
                    <li>需要安静环境</li>
                    <li>建议升级到 Whisper 获得更好体验</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* TTS Settings */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-3">🔊 语音合成设置</h3>
            <p className="text-sm text-gray-500 mb-4">选择AI说话的声音来源</p>

            <div className="space-y-4">
              {/* TTS Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  语音服务商
                </label>
                <select
                  value={ttsProvider}
                  onChange={(e) => setTtsProvider(e.target.value as 'browser' | 'replicate' | 'openai')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="browser">浏览器自带 (免费)</option>
                  <option value="openai">OpenAI TTS (推荐)</option>
                  <option value="replicate">Replicate (高质量)</option>
                </select>
              </div>

              {/* OpenAI TTS Settings */}
              {ttsProvider === 'openai' && (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-green-800">
                      <strong>✨ OpenAI TTS：</strong>性价比最高的选择！声音自然流畅，
                      价格便宜（HD质量 $0.030/1K字符），速度快。
                      如果您已经有 OpenAI API Key，可以直接使用同一个 Key。
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OpenAI API Key
                    </label>
                    <input
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="输入你的 OpenAI API Key（与对话AI共用）"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      可以使用与 OpenAI 对话模型相同的 API Key
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      音色选择
                    </label>
                    <select
                      value={openaiTTSVoice}
                      onChange={(e) => setOpenaiTTSVoice(e.target.value as any)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="nova">Nova - 女声、友好、活泼（推荐）</option>
                      <option value="shimmer">Shimmer - 女声、温柔、甜美</option>
                      <option value="alloy">Alloy - 中性、清晰、适合教学</option>
                      <option value="echo">Echo - 男声、专业、沉稳</option>
                      <option value="fable">Fable - 英式口音、优雅</option>
                      <option value="onyx">Onyx - 男声、深沉、权威</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      语音质量
                    </label>
                    <select
                      value={openaiTTSModel}
                      onChange={(e) => setOpenaiTTSModel(e.target.value as 'tts-1' | 'tts-1-hd')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="tts-1-hd">HD 高清质量 - $0.030/1K字符（推荐）</option>
                      <option value="tts-1">标准质量 - $0.015/1K字符（更便宜）</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      语速调节: {openaiTTSSpeed}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={openaiTTSSpeed}
                      onChange={(e) => setOpenaiTTSSpeed(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>慢速 (0.5x)</span>
                      <span>正常 (1.0x)</span>
                      <span>快速 (1.5x)</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      推荐 0.9x，稍微慢一点更适合学习
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800 mb-2">
                      <strong>💰 费用说明：</strong>
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
                      <li>HD 质量：每小时对话约 $0.10-0.20</li>
                      <li>标准质量：每小时对话约 $0.05-0.10</li>
                      <li>比 Replicate 便宜，质量更好</li>
                      <li>与 OpenAI 对话模型共用 API Key</li>
                    </ul>
                  </div>
                </>
              )}

              {/* Replicate TTS Settings */}
              {ttsProvider === 'replicate' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Replicate API Key
                    </label>
                    <input
                      type="text"
                      value={replicateApiKey}
                      onChange={(e) => setReplicateApiKey(e.target.value)}
                      placeholder="输入你的 Replicate API Key"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      你的API Key会保存在浏览器本地，不会上传到服务器
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      语音质量
                    </label>
                    <select
                      value={replicateTTSModel}
                      onChange={(e) => setReplicateTTSModel(e.target.value as 'turbo' | 'hd')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="turbo">Turbo (快速，低延迟)</option>
                      <option value="hd">HD (高质量，自然)</option>
                    </select>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      <strong>💰 费用说明：</strong>Replicate TTS 按使用量计费，
                      大约每次生成 $0.01-0.02。Turbo模式更快更便宜，HD模式声音更自然。
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>🔑 如何获取 Replicate API Key：</strong>
                    </p>
                    <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
                      <li>访问 <a href="https://replicate.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Replicate.com</a></li>
                      <li>注册/登录账号</li>
                      <li>进入 Account Settings → API Tokens</li>
                      <li>创建新的 API Token 并复制</li>
                    </ol>
                  </div>
                </>
              )}

              {/* Browser TTS Info */}
              {ttsProvider === 'browser' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>ℹ️ 浏览器自带语音：</strong>完全免费，无需API Key。
                    使用浏览器内置的语音合成引擎，质量取决于你的操作系统和浏览器。
                    Chrome/Edge 通常有较好的英语语音。
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Azure Pronunciation Assessment Settings */}
          <div className="border-t pt-6">
            <h3 className="font-medium text-gray-900 mb-3">🎯 发音评估设置</h3>
            <p className="text-sm text-gray-500 mb-4">使用 Azure 语音服务智能评估发音（可选）</p>

            <div className="space-y-4">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    启用发音评估
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    AI会在适当时候自动评估你的发音并给出建议
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPronunciationEnabled(!pronunciationEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pronunciationEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pronunciationEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {pronunciationEnabled && (
                <>
                  {/* Azure API Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Azure Speech API Key
                    </label>
                    <input
                      type="text"
                      value={azureSpeechKey}
                      onChange={(e) => setAzureSpeechKey(e.target.value)}
                      placeholder="输入你的 Azure Speech API Key"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>

                  {/* Azure Region */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Azure 区域
                    </label>
                    <select
                      value={azureSpeechRegion}
                      onChange={(e) => setAzureSpeechRegion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="eastus">East US (美国东部)</option>
                      <option value="westus">West US (美国西部)</option>
                      <option value="eastasia">East Asia (东亚)</option>
                      <option value="southeastasia">Southeast Asia (东南亚)</option>
                      <option value="westeurope">West Europe (西欧)</option>
                    </select>
                  </div>

                  {/* User Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      你的英语水平
                    </label>
                    <select
                      value={userLevel}
                      onChange={(e) => setUserLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="beginner">初学者 (Beginner)</option>
                      <option value="intermediate">中级 (Intermediate)</option>
                      <option value="advanced">高级 (Advanced)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      水平越高，评估频率越低，节省更多费用
                    </p>
                  </div>

                  {/* Cost Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-800 mb-2">
                      <strong>💡 智能评估策略：</strong>
                    </p>
                    <ul className="text-xs text-green-800 space-y-1 ml-4 list-disc">
                      <li>仅在必要时评估（低置信度、困难发音、定期检查）</li>
                      <li>评估率约 20-25%，节省 75-80% 费用</li>
                      <li>每月约 $0.60-0.75（每天练习30分钟）</li>
                      <li>完全无感知，不影响对话流畅度</li>
                    </ul>
                  </div>

                  {/* Setup Guide */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>🔑 如何获取 Azure Speech API Key：</strong>
                    </p>
                    <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
                      <li>访问 <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Azure Portal</a></li>
                      <li>创建 "Speech Services" 资源</li>
                      <li>在资源页面找到 "Keys and Endpoint"</li>
                      <li>复制 Key 1 或 Key 2 和区域信息</li>
                    </ol>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* How to get API Key */}
          {selectedProvider?.requiresApiKey && provider !== 'custom' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">🔑 如何获取 API Key</h3>
              <div className="text-sm text-gray-700 space-y-2">
                {provider === 'openai' && (
                  <>
                    <p>1. 访问 <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">OpenAI Platform</a></p>
                    <p>2. 注册/登录账号</p>
                    <p>3. 进入 API Keys 页面创建新的 API Key</p>
                  </>
                )}
                {provider === 'replicate' && (
                  <>
                    <p>1. 访问 <a href="https://replicate.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Replicate.com</a></p>
                    <p>2. 注册/登录账号</p>
                    <p>3. 进入 Account Settings → API Tokens</p>
                    <p>4. 创建新的 API Token 并复制</p>
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-800">
                        <strong>💰 费用：</strong>Gemma 2 27B 约 $0.0001/token，对话成本很低
                      </p>
                    </div>
                  </>
                )}
                {provider === 'doubao' && (
                  <>
                    <p>1. 访问 <a href="https://console.volcengine.com/ark" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">火山引擎</a></p>
                    <p>2. 注册/登录账号</p>
                    <p>3. 创建推理接入点获取 API Key</p>
                  </>
                )}
                {provider === 'anthropic' && (
                  <>
                    <p>1. 访问 <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Anthropic Console</a></p>
                    <p>2. 注册/登录账号</p>
                    <p>3. 在 API Keys 页面创建新的 API Key</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};
