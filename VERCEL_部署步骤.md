# 🚀 Vercel 部署步骤（5分钟完成）

## ✅ 已完成
- [x] 代码已配置为子路径部署 `/english`
- [x] `vercel.json` 已配置
- [x] `package.json` 已设置 `homepage: "/english"`
- [x] 代码已提交到本地 Git

---

## 📝 接下来的步骤

### 第1步：创建 GitHub 仓库（1分钟）

1. 访问：https://github.com/new
2. 仓库名称：`english-conversation-trainer`
3. 设置为 **Public** 或 **Private**（都可以）
4. **不要**勾选 "Add a README file"
5. 点击 "Create repository"

### 第2步：推送代码到 GitHub（1分钟）

复制 GitHub 显示的命令，或者使用下面的命令（替换成你的用户名）：

```bash
cd /Users/hjstudio/Kiro_DoubaoEnglishpal/english-conversation-trainer

# 关联远程仓库（替换 YOUR_USERNAME）
git remote add origin https://github.com/YOUR_USERNAME/english-conversation-trainer.git

# 推送代码
git push -u origin main
```

### 第3步：在 Vercel 部署（2分钟）

1. 访问：https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择你刚创建的 `english-conversation-trainer` 仓库
4. 配置项目：
   - **Framework Preset**: Create React App
   - **Root Directory**: `./`（保持默认）
   - **Build Command**: `npm run build`（保持默认）
   - **Output Directory**: `build`（保持默认）
5. 点击 **Deploy**
6. 等待部署完成（约1-2分钟）

### 第4步：配置自定义域名（1分钟）

部署成功后：

1. 在 Vercel 项目页面，点击 **Settings** → **Domains**
2. 输入：`drama-com.com`
3. 点击 **Add**
4. Vercel 会显示 DNS 配置信息

### 第5步：配置 DNS（在你的域名服务商）

在你购买 `drama-com.com` 的地方（如 Namecheap、GoDaddy、阿里云等）：

添加 **A 记录**：
```
类型: A
主机: @
值: 76.76.21.21
TTL: 自动
```

或者添加 **CNAME 记录**：
```
类型: CNAME
主机: @
值: cname.vercel-dns.com
TTL: 自动
```

---

## 🎯 完成后访问

- **临时地址**（立即可用）：`https://你的项目名.vercel.app/english`
- **正式地址**（DNS生效后）：`https://drama-com.com/english`

DNS 通常在 5-30 分钟内生效，最长可能需要 48 小时。

---

## 🔍 验证部署

访问 `https://drama-com.com/english` 后：

1. ✅ 页面正常加载
2. ✅ 点击"开始新对话"
3. ✅ 按住麦克风说话
4. ✅ 查看词汇高亮
5. ✅ 点击单词查看卡片
6. ✅ 收藏单词功能正常

---

## 💡 提示

- 每次 `git push` 到 GitHub，Vercel 会自动重新部署
- 可以在 Vercel Dashboard 查看部署日志和访问统计
- 如果遇到问题，查看 Vercel 的 "Deployments" 页面的错误日志

---

## 🆘 需要帮助？

如果遇到问题，告诉我具体的错误信息，我会帮你解决！
