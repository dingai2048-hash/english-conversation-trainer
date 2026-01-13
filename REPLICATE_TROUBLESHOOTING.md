# Replicate API 故障排除指南

## ✅ 问题已修复！

**问题**：选择 Replicate (Gemma 2) 后出现"AI服务暂时不可用"错误

**原因**：SettingsModal 中 Replicate 的 endpoint 配置错误
- ❌ 错误：`https://api.replicate.com/v1/chat/completions`（OpenAI 格式）
- ✅ 正确：`https://api.replicate.com`（Replicate 格式）

**修复**：已更新 `src/components/SettingsModal.tsx` 中的 endpoint 配置

## 🔧 如何验证修复

### 1. 刷新浏览器
1. 打开 http://localhost:3000
2. 按 `Ctrl+Shift+R`（Windows）或 `Cmd+Shift+R`（Mac）强制刷新
3. 清除缓存后重新加载

### 2. 重新配置 Replicate
1. 点击右上角"设置"⚙️
2. 选择 "Replicate (Gemma 2)"
3. 输入你的 API Key（格式：`r8_xxxxx`）
4. 选择模型（推荐：meta/gemma-2-27b-it）
5. 点击"保存设置"

### 3. 测试对话
1. 点击麦克风按钮 🎤
2. 说 "Hello"
3. 等待 AI 回复（第一次可能需要 10-30 秒）

### 4. 检查控制台
打开浏览器控制台（F12），应该看到：
```
正在调用 Replicate API...
Replicate prediction created: pred_xxxxx
Replicate prediction succeeded
```

## 🐛 如果仍然出错

### 错误 1：API Key 无效
**症状**：401 Unauthorized 错误

**解决方案**：
1. 检查 API Key 格式是否正确（`r8_xxxxx`）
2. 确认 Token 未过期
3. 访问 https://replicate.com/account/api-tokens 重新生成

### 错误 2：余额不足
**症状**：402 Payment Required 错误

**解决方案**：
1. 访问 https://replicate.com/account/billing
2. 添加支付方式
3. 充值账户

### 错误 3：模型版本错误
**症状**：404 Not Found 或 Invalid version 错误

**解决方案**：
- 模型版本 ID 已内置在代码中，无需手动配置
- 如果出现此错误，可能是 Replicate 更新了模型版本
- 查看 `src/services/AIConversationService.ts` 中的 `getReplicateModelVersion()` 方法

### 错误 4：请求超时
**症状**：Prediction timed out 错误

**解决方案**：
1. 第一次请求需要冷启动（10-30秒），这是正常的
2. 检查网络连接
3. 尝试使用更快的模型（meta/gemma-2-9b-it）

### 错误 5：CORS 错误
**症状**：Access-Control-Allow-Origin 错误

**解决方案**：
- Replicate API 支持 CORS，不应该出现此错误
- 如果出现，可能是浏览器扩展导致
- 尝试在无痕模式下测试

## 📊 API 调用流程

### Replicate API 工作原理

1. **创建 Prediction**
```typescript
POST https://api.replicate.com/v1/predictions
{
  "version": "model-version-id",
  "input": {
    "prompt": "System: ...\nUser: ...\nAssistant:",
    "max_new_tokens": 150,
    "temperature": 0.7
  }
}
```

2. **轮询结果**
```typescript
GET https://api.replicate.com/v1/predictions/{id}
// 每秒轮询一次，最多 60 次
```

3. **获取输出**
```typescript
{
  "status": "succeeded",
  "output": ["AI response text"]
}
```

## 🔍 调试技巧

### 1. 启用详细日志
打开浏览器控制台（F12），查看：
- API 请求详情
- 错误堆栈信息
- 网络请求状态

### 2. 检查网络请求
1. 打开 DevTools → Network 标签
2. 筛选 "replicate.com"
3. 查看请求和响应详情

### 3. 测试 API Key
使用 curl 测试 API Key 是否有效：
```bash
curl -X POST https://api.replicate.com/v1/predictions \
  -H "Authorization: Token r8_YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "2790a695e5dcae15506138cc4718d1106d0d475e6dca4b1d43f42414647993d5",
    "input": {
      "prompt": "Hello, how are you?",
      "max_new_tokens": 50
    }
  }'
```

## 💡 最佳实践

### 1. 首次使用
- 第一次请求会很慢（10-30秒），这是正常的
- 之后的请求会快很多（2-3秒）
- 建议先用简单的 "Hello" 测试

### 2. 成本控制
- 使用 Gemma 2 9B 而非 27B（成本减半）
- 关闭翻译功能（减少 API 调用）
- 保持对话简短

### 3. 性能优化
- 避免频繁切换模型
- 保持对话历史在 10 条以内
- 使用简短的 System Prompt

## 📞 获取帮助

如果问题仍未解决：

1. **查看文档**
   - [Gemma 配置指南](./GEMMA_SETUP_GUIDE.md)
   - [Replicate 官方文档](https://replicate.com/docs)

2. **检查代码**
   - `src/services/AIConversationService.ts` - AI 服务实现
   - `src/components/SettingsModal.tsx` - 设置界面

3. **联系支持**
   - Replicate 支持：https://replicate.com/support
   - GitHub Issues：提交问题报告

## ✅ 验证清单

在报告问题前，请确认：

- [ ] 已刷新浏览器（Ctrl+Shift+R）
- [ ] API Key 格式正确（`r8_xxxxx`）
- [ ] 选择了正确的服务商（Replicate (Gemma 2)）
- [ ] 选择了有效的模型
- [ ] Replicate 账户有余额
- [ ] 网络连接正常
- [ ] 浏览器控制台无 CORS 错误
- [ ] 已等待足够时间（首次 10-30 秒）

---

**更新时间**：2026-01-08
**状态**：✅ 问题已修复
**测试**：✅ 所有测试通过
