# 🔧 OpenAI TTS 故障排除指南

## 常见问题和解决方案

---

## 问题 1: 语音还是机器人声音

### 症状
- 保存设置后，语音听起来还是机器人
- 声音不自然，有明显的合成感

### 原因
可能还在使用浏览器自带的语音合成

### 解决方案

#### 步骤 1: 检查设置
1. 打开设置（点击右上角齿轮图标）
2. 滚动到 "🔊 语音合成设置"
3. 检查 "语音服务商" 是否选择了 "OpenAI TTS (推荐)"
4. 如果不是，重新选择并保存

#### 步骤 2: 检查 API Key
1. 确认 "OpenAI API Key" 输入框中有内容
2. 确认格式正确（sk-xxx...）
3. 如果为空，输入您的 OpenAI API Key

#### 步骤 3: 检查浏览器控制台
1. 按 F12 打开开发者工具
2. 点击 "Console" 标签
3. 开始一次对话
4. 查看是否有错误信息（红色文字）

**常见错误信息：**

```
🔊 [OpenAI TTS] Error: OpenAI API key is required
```
**解决**：在设置中输入 API Key

```
🔊 [OpenAI TTS] API error: Incorrect API key provided
```
**解决**：检查 API Key 是否正确

```
🔊 [OpenAI TTS] API error: You exceeded your current quota
```
**解决**：账户余额不足，需要充值

#### 步骤 4: 强制刷新
1. 按 `Cmd + Shift + R` (Mac)
2. 或 `Ctrl + Shift + R` (Windows)
3. 清除缓存并重新加载

---

## 问题 2: 报错 "API key is required"

### 症状
- 点击麦克风后报错
- 控制台显示："OpenAI API key is required"

### 原因
没有正确配置 OpenAI API Key

### 解决方案

#### 方案 A: 使用同一个 Key（推荐）
如果您已经配置了 OpenAI 对话模型：

1. 打开设置
2. 确认顶部 "API Key" 已输入
3. 滚动到 "语音合成设置"
4. "OpenAI API Key" 可以留空（会自动使用上面的 Key）
5. 保存设置

#### 方案 B: 单独输入
1. 打开设置
2. 滚动到 "语音合成设置"
3. 在 "OpenAI API Key" 输入框中输入 Key
4. 保存设置

#### 验证
1. 刷新浏览器
2. 开始对话
3. 检查控制台是否还有错误

---

## 问题 3: 报错 "Incorrect API key provided"

### 症状
- 控制台显示："Incorrect API key provided"
- 或："Invalid Authentication"

### 原因
API Key 格式错误或无效

### 解决方案

#### 步骤 1: 检查 Key 格式
OpenAI API Key 的正确格式：
```
sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
或
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**常见错误：**
- ❌ 多了空格
- ❌ 少了字符
- ❌ 复制不完整

#### 步骤 2: 重新获取 Key
1. 访问：https://platform.openai.com/api-keys
2. 删除旧的 Key（如果有）
3. 创建新的 Key
4. 完整复制（不要有空格）
5. 粘贴到设置中

#### 步骤 3: 测试
1. 保存设置
2. 刷新浏览器
3. 开始对话

---

## 问题 4: 报错 "You exceeded your current quota"

### 症状
- 控制台显示："You exceeded your current quota"
- 或："Insufficient quota"

### 原因
OpenAI 账户余额不足

### 解决方案

#### 步骤 1: 检查余额
1. 访问：https://platform.openai.com/account/billing/overview
2. 查看 "Credit balance"
3. 如果为 $0.00，需要充值

#### 步骤 2: 充值
1. 点击 "Add payment method"
2. 添加信用卡
3. 充值至少 $5（推荐 $10-20）

#### 步骤 3: 等待生效
1. 充值后等待 1-2 分钟
2. 刷新应用
3. 重新测试

---

## 问题 5: 没有声音

### 症状
- 对话正常，但听不到声音
- 控制台没有错误

### 原因
可能是浏览器音量或系统音量问题

### 解决方案

#### 步骤 1: 检查音量
1. 检查系统音量是否静音
2. 检查浏览器标签页是否静音
3. 调高音量

#### 步骤 2: 检查浏览器权限
1. 点击地址栏左侧的锁图标
2. 检查 "声音" 权限是否允许
3. 如果被阻止，改为允许

#### 步骤 3: 检查控制台
1. 按 F12 打开控制台
2. 查看是否有播放错误
3. 常见错误：
   ```
   Failed to play audio: NotAllowedError
   ```
   **解决**：点击页面任意位置，然后重试

---

## 问题 6: 语音延迟很高

### 症状
- 说完话后等很久才听到回复
- 超过 5 秒

### 原因
可能是网络问题或 API 响应慢

### 解决方案

#### 步骤 1: 检查网络
1. 测试网络速度
2. 确保网络稳定
3. 如果在中国，可能需要 VPN

#### 步骤 2: 检查控制台时间
1. 打开控制台
2. 查看日志：
   ```
   🔊 [OpenAI TTS] Generating speech: ...
   🔊 [OpenAI TTS] Audio loaded, duration: 2.5 seconds
   🔊 [OpenAI TTS] Starting playback
   ```
3. 计算从 "Generating" 到 "Starting playback" 的时间

**正常时间：**
- 应该在 1-3 秒内

**如果超过 5 秒：**
- 网络问题
- API 服务器响应慢
- 尝试切换网络或使用 VPN

#### 步骤 3: 降低质量
如果网络不好，可以降低质量：
1. 打开设置
2. 将 "语音质量" 改为 "标准质量"
3. 保存并测试

---

## 问题 7: 语音断断续续

### 症状
- 播放时有卡顿
- 声音不连贯

### 原因
网络不稳定或浏览器性能问题

### 解决方案

#### 步骤 1: 检查网络
1. 确保网络稳定
2. 关闭其他占用带宽的应用
3. 尝试切换网络

#### 步骤 2: 关闭其他标签页
1. 关闭不必要的浏览器标签
2. 释放内存
3. 重新测试

#### 步骤 3: 重启浏览器
1. 完全关闭浏览器
2. 重新打开
3. 访问应用

---

## 问题 8: 设置保存后丢失

### 症状
- 保存设置后刷新，设置又变回默认值
- 需要重新配置

### 原因
浏览器本地存储被清除或禁用

### 解决方案

#### 步骤 1: 检查浏览器设置
1. 确保浏览器允许本地存储
2. 不要使用无痕模式
3. 检查是否有清理工具自动清除数据

#### 步骤 2: 手动保存
1. 将 API Key 保存到安全的地方
2. 每次使用前检查设置
3. 如果丢失，重新输入

#### 步骤 3: 检查控制台
1. 打开控制台
2. 输入：
   ```javascript
   localStorage.getItem('aiSettings')
   ```
3. 如果返回 null，说明存储失败

---

## 问题 9: 语音和文字不匹配

### 症状
- 显示的文字和听到的语音内容不一样

### 原因
这不应该发生，可能是 bug

### 解决方案

#### 步骤 1: 检查控制台
1. 打开控制台
2. 查看 TTS 日志：
   ```
   🔊 [OpenAI TTS] Generating speech: [文字内容]
   ```
3. 确认文字是否正确

#### 步骤 2: 刷新重试
1. 刷新浏览器
2. 重新开始对话
3. 检查是否还有问题

#### 步骤 3: 报告 bug
如果问题持续：
1. 截图控制台日志
2. 记录复现步骤
3. 联系开发者

---

## 问题 10: 无法选择 OpenAI TTS

### 症状
- 下拉菜单中没有 "OpenAI TTS (推荐)" 选项
- 只有 "浏览器自带" 和 "Replicate"

### 原因
代码可能没有更新

### 解决方案

#### 步骤 1: 检查代码版本
1. 打开终端
2. 进入项目目录：
   ```bash
   cd english-conversation-trainer
   ```
3. 检查文件是否存在：
   ```bash
   ls src/services/OpenAITTSService.ts
   ```

#### 步骤 2: 强制刷新
1. 停止开发服务器（Ctrl + C）
2. 重新启动：
   ```bash
   npm start
   ```
3. 强制刷新浏览器（Cmd/Ctrl + Shift + R）

#### 步骤 3: 清除缓存
1. 打开浏览器设置
2. 清除缓存和 Cookie
3. 重新访问应用

---

## 🔍 调试技巧

### 1. 查看详细日志
打开控制台，查看 TTS 相关日志：

**成功的日志应该是：**
```
🔊 [OpenAI TTS] Generating speech: Hello, how are you?
🔊 [OpenAI TTS] Voice: nova, Model: tts-1-hd, Speed: 0.9
🔊 [OpenAI TTS] Audio loaded, duration: 2.5 seconds
🔊 [OpenAI TTS] Starting playback
🔊 [OpenAI TTS] Speech ended
```

**如果看到错误：**
```
🔊 [OpenAI TTS] Error: [错误信息]
```
根据错误信息查找对应的解决方案

### 2. 测试 API Key
在控制台中测试 API Key 是否有效：

```javascript
fetch('https://api.openai.com/v1/models', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(r => r.json())
.then(console.log)
```

如果返回模型列表，说明 Key 有效

### 3. 检查网络请求
1. 打开控制台
2. 切换到 "Network" 标签
3. 开始对话
4. 查找 "speech" 请求
5. 检查状态码：
   - 200: 成功
   - 401: API Key 错误
   - 429: 超出配额
   - 500: 服务器错误

---

## 📞 获取帮助

如果以上方法都无法解决问题：

### 1. 收集信息
- 浏览器类型和版本
- 操作系统
- 错误信息截图
- 控制台日志

### 2. 检查文档
- 查看 `快速配置OpenAI_TTS.md`
- 查看 `配置截图指南.md`
- 查看 `配置向导.md`

### 3. 联系支持
- 提供详细的错误信息
- 说明已尝试的解决方案
- 附上截图和日志

---

## ✅ 预防措施

### 1. 定期检查
- 每周检查 OpenAI 账户余额
- 确保有足够的额度

### 2. 备份设置
- 将 API Key 保存到安全的地方
- 记录您的配置选项

### 3. 保持更新
- 定期更新应用代码
- 关注 OpenAI API 的变化

---

## 🎯 快速诊断流程

遇到问题时，按此顺序检查：

1. ✅ 是否选择了 "OpenAI TTS (推荐)"？
2. ✅ API Key 是否正确输入？
3. ✅ 账户是否有余额？
4. ✅ 网络是否正常？
5. ✅ 浏览器控制台有错误吗？
6. ✅ 是否刷新了浏览器？
7. ✅ 音量是否打开？

如果全部检查通过，但仍有问题，查看控制台详细日志。

---

**祝您使用愉快！** 🐨✨
