# TTS 语音合成故障排除指南

## 🔊 问题：AI 没有声音

如果你发现 AI 回复时没有声音，请按照以下步骤排查：

## 📋 检查清单

### ✅ 步骤1: 检查浏览器支持

**支持的浏览器**:
- ✅ Chrome (推荐)
- ✅ Edge (推荐)
- ✅ Safari
- ⚠️ Firefox (部分支持)

**如何检查**:
1. 打开浏览器控制台 (按 F12)
2. 在 Console 标签中输入:
   ```javascript
   'speechSynthesis' in window
   ```
3. 如果返回 `true`，说明浏览器支持 TTS

### ✅ 步骤2: 检查音量设置

1. **系统音量**: 确保电脑/手机音量不是静音
2. **浏览器音量**: 检查浏览器标签页是否被静音
3. **应用音量**: 确保没有其他应用占用音频

### ✅ 步骤3: 检查 TTS 配置

1. 点击右上角 **⚙️ 设置** 按钮
2. 滚动到 **🔊 语音合成设置**
3. 检查当前配置:

**如果选择了"浏览器自带"**:
- 无需额外配置
- 应该立即可用
- 如果不工作，尝试刷新页面

**如果选择了"Replicate"**:
- 检查是否输入了 API Key
- 确认 API Key 格式正确 (`r8_xxxxx...`)
- 检查网络连接
- 查看浏览器控制台是否有错误

### ✅ 步骤4: 测试 TTS 功能

**测试浏览器 TTS**:
1. 打开浏览器控制台 (F12)
2. 输入以下代码:
   ```javascript
   const utterance = new SpeechSynthesisUtterance("Hello, this is a test");
   utterance.lang = 'en-US';
   window.speechSynthesis.speak(utterance);
   ```
3. 如果听到声音，说明浏览器 TTS 正常

**测试 Replicate TTS**:
1. 确保已配置 Replicate API Key
2. 在设置中选择 "Replicate (高质量)"
3. 保存设置
4. 尝试对话，看是否有声音

### ✅ 步骤5: 检查错误信息

1. 打开浏览器控制台 (F12)
2. 切换到 "Console" 标签
3. 查找红色错误信息
4. 常见错误及解决方法:

**错误1**: `Speech synthesis is not supported`
- **原因**: 浏览器不支持 TTS
- **解决**: 更换浏览器（推荐 Chrome/Edge）

**错误2**: `Replicate API key is not configured`
- **原因**: 未配置 Replicate API Key
- **解决**: 在设置中输入 API Key

**错误3**: `Failed to fetch` 或 `Network error`
- **原因**: 网络连接问题
- **解决**: 检查网络连接，或切换到浏览器 TTS

**错误4**: `401 Unauthorized`
- **原因**: Replicate API Key 无效
- **解决**: 重新获取 API Key

## 🔧 快速修复方案

### 方案1: 切换到浏览器 TTS (推荐)

1. 点击 **⚙️ 设置**
2. 在 **语音服务商** 选择 **"浏览器自带 (免费)"**
3. 点击 **保存设置**
4. 刷新页面
5. 重新测试

### 方案2: 重新配置 Replicate TTS

1. 点击 **⚙️ 设置**
2. 在 **语音服务商** 选择 **"Replicate (高质量)"**
3. 重新输入 **Replicate API Key**
4. 选择 **Turbo** 模式（更快）
5. 点击 **保存设置**
6. 重新测试

### 方案3: 清除缓存重新开始

1. 打开浏览器控制台 (F12)
2. 在 Console 中输入:
   ```javascript
   localStorage.clear()
   ```
3. 刷新页面
4. 重新配置设置

## 🎯 验证 TTS 是否工作

### 测试步骤:

1. **开始对话**
   - 点击麦克风按钮
   - 说 "Hello"
   - 停止录音

2. **观察状态**
   - 看到 "考拉正在说话..." 提示
   - 考拉角色有动画效果
   - 等待 1-3 秒

3. **听声音**
   - 应该听到 AI 用英语回复
   - 声音清晰可辨

4. **如果没有声音**
   - 检查上面的所有步骤
   - 查看控制台错误信息
   - 尝试快速修复方案

## 📱 不同设备的注意事项

### Windows 电脑
- ✅ Chrome/Edge 支持最好
- ✅ 浏览器 TTS 质量较好
- ✅ Replicate TTS 完全支持

### Mac 电脑
- ✅ Chrome/Safari 都支持
- ✅ Safari 的 TTS 质量很好
- ✅ Replicate TTS 完全支持

### iPhone/iPad
- ✅ Safari 支持 TTS
- ⚠️ 可能需要用户交互才能播放
- ⚠️ Replicate TTS 可能有延迟

### Android 手机
- ✅ Chrome 支持最好
- ✅ 浏览器 TTS 质量不错
- ✅ Replicate TTS 完全支持

## 🆘 仍然无法解决？

### 收集诊断信息:

1. **浏览器信息**
   - 浏览器名称和版本
   - 操作系统

2. **错误信息**
   - 控制台的完整错误信息
   - 截图

3. **配置信息**
   - 使用的 TTS 提供商
   - 是否配置了 API Key

4. **测试结果**
   - 浏览器 TTS 测试是否成功
   - Replicate TTS 测试是否成功

### 获取帮助:

1. 查看项目 README.md
2. 查看 REPLICATE_TTS_GUIDE.md
3. 提交 Issue 到 GitHub
4. 附上诊断信息

## 💡 常见问题 FAQ

### Q: 为什么有时候有声音，有时候没有？
A: 可能原因:
- 网络不稳定（Replicate TTS）
- 浏览器限制（需要用户交互）
- 系统资源不足

### Q: 声音很机械，怎么改善？
A: 
- 切换到 Replicate TTS（高质量）
- 或者接受浏览器 TTS 的质量（免费）

### Q: Replicate TTS 延迟太长？
A: 
- 切换到 Turbo 模式
- 或者使用浏览器 TTS（即时）

### Q: 可以调整语速吗？
A: 
- 浏览器 TTS: 已设置为 0.9x（略慢）
- Replicate TTS: 已设置为 0.9x（略慢）
- 暂不支持用户自定义

### Q: 可以选择不同的声音吗？
A: 
- 浏览器 TTS: 使用系统默认英语声音
- Replicate TTS: 使用默认声音
- 未来版本可能支持声音选择

## 🎉 成功标志

当 TTS 正常工作时，你会看到/听到:

1. ✅ AI 回复后显示 "考拉正在说话..."
2. ✅ 考拉角色有脉冲动画
3. ✅ 听到清晰的英语语音
4. ✅ 语音结束后动画停止
5. ✅ 可以继续下一轮对话

---

**祝你顺利解决问题！🔊**

如果以上方法都无法解决，请联系技术支持并提供详细的错误信息。
