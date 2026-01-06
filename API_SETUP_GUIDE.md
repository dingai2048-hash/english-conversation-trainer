# AI API 配置指南

## 📋 概述

本应用支持多种AI服务提供商，你可以根据需要选择合适的服务。

## 🎯 快速开始

### 1. 打开设置
点击右上角的"设置"按钮（⚙️图标）

### 2. 选择AI服务商
从下拉菜单中选择你想使用的服务商

### 3. 输入API Key
根据选择的服务商，输入对应的API Key

### 4. 保存设置
点击"保存设置"按钮

## 🤖 支持的AI服务商

### 1. Mock模式（测试模式）
**特点**:
- ✅ 无需API Key
- ✅ 免费使用
- ✅ 适合测试功能
- ⚠️ AI回复为预设内容，不是真实对话

**使用场景**:
- 测试应用功能
- 演示应用
- 学习如何使用

**配置**:
- 无需任何配置
- 默认模式

---

### 2. OpenAI
**特点**:
- ✅ 高质量对话
- ✅ 支持多种模型
- ✅ 全球可用
- 💰 按使用量付费

**支持的模型**:
- `gpt-3.5-turbo` - 快速、经济
- `gpt-4` - 更智能、更准确
- `gpt-4-turbo` - 最新版本

**如何获取API Key**:

1. 访问 [OpenAI Platform](https://platform.openai.com)
2. 注册/登录账号
3. 进入 [API Keys](https://platform.openai.com/api-keys) 页面
4. 点击 "Create new secret key"
5. 复制生成的API Key
6. 在应用设置中粘贴

**费用**:
- GPT-3.5-turbo: ~$0.002/1K tokens
- GPT-4: ~$0.03/1K tokens
- 新用户通常有免费额度

**配置示例**:
```
服务商: OpenAI
API Key: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
模型: gpt-3.5-turbo
```

---

### 3. 豆包 (字节跳动)
**特点**:
- ✅ 中文支持优秀
- ✅ 国内访问快
- ✅ 价格实惠
- 🇨🇳 中国公司

**支持的模型**:
- `doubao-pro-32k` - 专业版
- `doubao-lite-32k` - 轻量版

**如何获取API Key**:

1. 访问 [火山引擎](https://console.volcengine.com/ark)
2. 注册/登录账号
3. 创建推理接入点
4. 获取API Key和Endpoint
5. 在应用设置中配置

**费用**:
- 按使用量计费
- 具体价格查看官网

**配置示例**:
```
服务商: 豆包 (字节跳动)
API Key: your-api-key
端点: https://ark.cn-beijing.volces.com/api/v3/chat/completions
模型: doubao-pro-32k
```

---

### 4. Azure OpenAI
**特点**:
- ✅ 企业级服务
- ✅ 数据隐私保护
- ✅ 全球部署
- 💼 适合企业用户

**支持的模型**:
- `gpt-35-turbo`
- `gpt-4`

**如何获取API Key**:

1. 访问 [Azure Portal](https://portal.azure.com)
2. 创建Azure OpenAI资源
3. 部署模型
4. 获取API Key和Endpoint
5. 在应用设置中配置

**配置示例**:
```
服务商: Azure OpenAI
API Key: your-azure-key
端点: https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-05-15
模型: gpt-35-turbo
```

---

### 5. Anthropic Claude
**特点**:
- ✅ 安全性高
- ✅ 长文本支持
- ✅ 对话质量好
- 🌍 全球可用

**支持的模型**:
- `claude-3-opus` - 最强大
- `claude-3-sonnet` - 平衡
- `claude-3-haiku` - 最快

**如何获取API Key**:

1. 访问 [Anthropic Console](https://console.anthropic.com)
2. 注册/登录账号
3. 创建API Key
4. 在应用设置中配置

**配置示例**:
```
服务商: Anthropic Claude
API Key: sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
模型: claude-3-sonnet
```

---

### 6. 自定义API
**特点**:
- ✅ 支持任何兼容OpenAI格式的API
- ✅ 灵活配置
- ✅ 适合自建服务

**使用场景**:
- 自建AI服务
- 第三方API代理
- 其他兼容服务

**配置示例**:
```
服务商: 自定义 API
API Key: your-custom-key
端点: https://your-api.com/v1/chat/completions
模型: your-model-name
```

## 🔒 安全说明

### 数据存储
- ✅ API Key保存在浏览器本地存储
- ✅ 不会上传到任何服务器
- ✅ 只在你的设备上使用

### 隐私保护
- 对话内容直接发送到你选择的AI服务
- 不经过第三方服务器
- 遵循各AI服务商的隐私政策

### 安全建议
- 🔐 不要分享你的API Key
- 🔐 定期更换API Key
- 🔐 使用完毕后可以清除设置
- 🔐 不要在公共设备上保存API Key

## 💰 费用对比

| 服务商 | 费用 | 特点 |
|--------|------|------|
| Mock | 免费 | 测试用 |
| OpenAI GPT-3.5 | ~$0.002/1K tokens | 经济实惠 |
| OpenAI GPT-4 | ~$0.03/1K tokens | 质量最高 |
| 豆包 | 按量计费 | 中文优秀 |
| Azure OpenAI | 企业定价 | 企业级 |
| Claude | 按量计费 | 安全性高 |

**估算**:
- 一次对话约100-200 tokens
- 1000次对话约100K-200K tokens
- GPT-3.5: 约$0.2-0.4
- GPT-4: 约$3-6

## 🛠️ 故障排除

### 问题1: API Key无效
**症状**: 提示"API Key错误"或"认证失败"

**解决方案**:
1. 检查API Key是否正确复制
2. 确认API Key没有过期
3. 检查账户是否有余额
4. 重新生成API Key

### 问题2: 网络错误
**症状**: 提示"网络错误"或"连接失败"

**解决方案**:
1. 检查网络连接
2. 确认API端点地址正确
3. 检查防火墙设置
4. 尝试使用VPN（如果需要）

### 问题3: 配额超限
**症状**: 提示"配额已用完"或"超出限制"

**解决方案**:
1. 检查账户余额
2. 查看使用配额
3. 升级账户套餐
4. 等待配额重置

### 问题4: 模型不可用
**症状**: 提示"模型不存在"或"无法访问模型"

**解决方案**:
1. 确认模型名称正确
2. 检查账户是否有模型访问权限
3. 尝试其他模型
4. 联系服务商支持

## 📞 获取帮助

### OpenAI
- 文档: https://platform.openai.com/docs
- 支持: https://help.openai.com

### 豆包
- 文档: https://www.volcengine.com/docs/82379
- 支持: 火山引擎控制台

### Azure OpenAI
- 文档: https://learn.microsoft.com/azure/ai-services/openai/
- 支持: Azure支持中心

### Anthropic
- 文档: https://docs.anthropic.com
- 支持: support@anthropic.com

## 🎓 推荐配置

### 个人学习
**推荐**: OpenAI GPT-3.5-turbo
- 性价比高
- 质量好
- 响应快

### 专业使用
**推荐**: OpenAI GPT-4
- 质量最高
- 理解能力强
- 适合复杂对话

### 中文用户
**推荐**: 豆包
- 中文支持好
- 国内访问快
- 价格实惠

### 企业用户
**推荐**: Azure OpenAI
- 企业级服务
- 数据安全
- 合规性好

## 📝 常见问题

### Q: 可以同时配置多个API吗？
A: 目前只能配置一个API，但可以随时切换。

### Q: API Key会过期吗？
A: 取决于服务商，建议定期检查和更新。

### Q: 可以使用免费的API吗？
A: 可以，但需要服务商提供免费额度或试用。

### Q: 如何知道使用了多少费用？
A: 登录对应服务商的控制台查看使用情况。

### Q: Mock模式和真实API有什么区别？
A: Mock模式返回预设回复，真实API返回AI生成的回复。

---

**祝你使用愉快！🎉**

如有问题，请查看应用内的帮助文档或联系技术支持。
