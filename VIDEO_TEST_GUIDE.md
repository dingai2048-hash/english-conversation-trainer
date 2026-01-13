# 视频功能测试指南

## ✅ 视频文件已上传

您已成功上传以下视频文件到 `public/` 文件夹：

- ✅ `koala.mp4` (7.7MB) - 默认状态视频
- ✅ `koala-listening.mp4` (7.6MB) - 录音时视频
- ✅ `koala-thinking.mp4` (7.6MB) - 思考处理时视频
- ✅ `koala-speaking.mp4` (7.6MB) - AI说话时视频
- ✅ `koala-placeholder.jpg` (509KB) - 图片后备

## 🎬 视频功能说明

### 自动状态切换
应用会根据不同状态自动切换视频：

1. **默认状态** → `koala.mp4`
   - 应用启动时
   - 对话结束后的空闲状态

2. **录音状态** → `koala-listening.mp4`
   - 点击麦克风按钮开始录音
   - 显示 "🎤 正在录音... (2秒静音后自动提交)"

3. **思考状态** → `koala-thinking.mp4`
   - 录音结束后处理语音
   - 显示 "正在处理..."

4. **说话状态** → `koala-speaking.mp4`
   - AI考拉回复时
   - 显示 "考拉正在说话..."

### 智能后备机制
如果视频加载失败，会自动降级：
```
视频 → 图片 (koala.png) → Emoji (🐨)
```

## 🧪 测试步骤

### 1. 打开应用
```bash
# 应用已在运行，打开浏览器访问：
http://localhost:3000
```

### 2. 测试默认视频
- [ ] 页面加载后，应该看到 `koala.mp4` 自动播放
- [ ] 视频应该循环播放
- [ ] 视频应该静音播放

### 3. 测试录音视频切换
- [ ] 点击麦克风按钮（蓝色圆形按钮）
- [ ] 视频应该立即切换到 `koala-listening.mp4`
- [ ] 按钮变成红色并显示脉冲动画
- [ ] 提示文字显示 "🎤 正在录音... (2秒静音后自动提交)"

### 4. 测试思考视频切换
- [ ] 说一句英语（例如："Hello, how are you?"）
- [ ] 保持2秒静音，系统自动提交
- [ ] 视频应该切换到 `koala-thinking.mp4`
- [ ] 提示文字显示 "正在处理..."

### 5. 测试说话视频切换
- [ ] AI处理完成后开始回复
- [ ] 视频应该切换到 `koala-speaking.mp4`
- [ ] 提示文字显示 "考拉正在说话..."
- [ ] 同时播放AI语音

### 6. 测试循环
- [ ] AI说话结束后，视频应该切换回 `koala.mp4`
- [ ] 如果开启了连续对话模式，会自动开始下一轮录音

### 7. 测试移动端
- [ ] 打开浏览器开发者工具 (F12)
- [ ] 切换到移动设备模式
- [ ] 验证视频在移动端也能正常播放和切换

## 📱 移动端特别说明

视频使用了 `playsInline` 属性，确保在 iOS 设备上：
- 视频不会全屏播放
- 视频可以在页面内自动播放
- 视频切换流畅

## ⚠️ 可能的问题和解决方案

### 问题1: 视频不播放
**原因**: 浏览器自动播放策略限制
**解决**: 
- 确保视频设置了 `muted` 属性（已设置）
- 用户与页面交互后（点击按钮）视频会正常播放

### 问题2: 视频切换有延迟
**原因**: 视频文件较大 (7.6-7.7MB)
**解决方案**:
1. 压缩视频文件（推荐）
2. 添加视频预加载
3. 使用更小的视频格式

### 问题3: 视频加载慢
**原因**: 视频文件总大小约30MB
**建议**:
- 压缩视频到 2-3MB 每个
- 使用 H.264 编码
- 降低分辨率到 480p 或 720p

## 🎨 视频优化建议

如果您发现视频加载慢或切换不流畅，可以使用以下工具压缩视频：

### 使用 FFmpeg 压缩（推荐）
```bash
# 安装 FFmpeg (如果还没安装)
brew install ffmpeg

# 压缩视频到约 2MB
ffmpeg -i koala.mp4 -vcodec h264 -acodec aac -b:v 500k -b:a 128k koala-compressed.mp4
ffmpeg -i koala-listening.mp4 -vcodec h264 -acodec aac -b:v 500k -b:a 128k koala-listening-compressed.mp4
ffmpeg -i koala-thinking.mp4 -vcodec h264 -acodec aac -b:v 500k -b:a 128k koala-thinking-compressed.mp4
ffmpeg -i koala-speaking.mp4 -vcodec h264 -acodec aac -b:v 500k -b:a 128k koala-speaking-compressed.mp4
```

### 在线压缩工具
- https://www.freeconvert.com/video-compressor
- https://www.videosmaller.com/
- https://clideo.com/compress-video

## 📊 性能监控

打开浏览器开发者工具查看：

1. **Network 标签**
   - 查看视频加载时间
   - 查看视频文件大小
   - 查看是否有加载失败

2. **Console 标签**
   - 查看是否有错误信息
   - 查看视频切换日志

3. **Performance 标签**
   - 查看视频播放性能
   - 查看是否有卡顿

## ✨ 功能亮点

1. **自动状态检测**: 根据应用状态自动切换视频
2. **无缝切换**: 使用 React useEffect 监听状态变化
3. **智能后备**: 视频 → 图片 → Emoji 三级后备
4. **移动端优化**: 支持 iOS 内联播放
5. **自动播放**: 视频自动循环播放
6. **静音播放**: 避免干扰 AI 语音

## 🎯 下一步

测试完成后，如果一切正常：
- ✅ 视频功能已完美集成
- ✅ 状态切换流畅
- ✅ 移动端兼容

如果发现问题：
- 📝 记录具体问题（哪个视频、什么状态）
- 🔍 查看浏览器控制台错误信息
- 💬 告诉我具体情况，我会帮您解决

---

**当前状态**: 应用正在运行在 http://localhost:3000
**测试时间**: 现在就可以开始测试！
