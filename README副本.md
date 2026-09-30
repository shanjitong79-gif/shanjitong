# shanjitong 4.0 公网版

## 架构

公网官网、Android App、手机新闻后台全部连接同一个 Node.js API 和 PostgreSQL 数据库。

- 官网：`https://你的域名/`
- 后台：`https://你的域名/admin`
- API：`https://你的域名/api/news`
- Android App：启动后加载同一个公网地址

## Render 部署（可用手机浏览器完成）

1. 把本项目上传到 GitHub。
2. 在 Render 创建 PostgreSQL 数据库，复制连接字符串 DATABASE_URL。
3. 创建 Web Service，连接 GitHub 仓库。
4. Build Command：`npm install`
5. Start Command：`npm start`
6. 环境变量：
   - DATABASE_URL = PostgreSQL 连接字符串
   - ADMIN_USER = 自己的管理员账号
   - ADMIN_PASSWORD = 自己的管理员密码
   - SESSION_SECRET = 随机长字符串
7. 部署后得到 `https://xxxx.onrender.com`。
8. 在 Android 工程 MainActivity.kt 中把 WEBSITE_URL 改成这个地址并重新构建 APK。

## 数据持久化

公网版使用 PostgreSQL，不依赖服务器本地文件，因此新闻不存放在某一部手机里。

## 安全

首次部署后务必修改 ADMIN_PASSWORD。正式上线建议绑定自己的 HTTPS 域名。
