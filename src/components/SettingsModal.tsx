/**
 * Settings Modal Component
 * Allows users to configure AI API settings
 */

import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    setProvider(currentSettings.provider);
    setApiKey(currentSettings.apiKey);
    setEndpoint(currentSettings.endpoint);
    setModel(currentSettings.model);
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
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入你的 API Key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <li>• <strong>豆包</strong>: 字节跳动的AI服务，支持中文</li>
              <li>• <strong>自定义</strong>: 支持任何兼容OpenAI格式的API</li>
            </ul>
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
