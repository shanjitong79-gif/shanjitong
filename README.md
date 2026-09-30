# shanjitong Web Mobile 3.0

这是一个可直接部署到公网服务器的 Node.js 企业官网。

## 功能
- Windows 11 / Fluent Glass 风格企业官网
- 手机端自适应
- 新闻中心实时读取数据库
- 手机新闻后台 `/admin`
- 管理员登录
- 发布 / 草稿 / 编辑 / 删除新闻
- 手机上传新闻图片（最大 5MB）
- SQLite 持久化
- 局域网 / 公网部署
- 绑定域名后，手机浏览器直接访问

## 部署
服务器安装 Node.js 20+ 后：

```bash
npm install
export ADMIN_USER="你的管理员账号"
export ADMIN_PASSWORD="你的强密码"
export SESSION_SECRET="一串很长的随机字符串"
npm start
```

然后通过服务器的 80/443 反向代理访问。

## 默认账号
如果不设置环境变量：
- 用户名：admin
- 密码：ChangeMe_123!

公网部署前必须修改。

## 手机访问
部署完成后：
- 官网：`https://你的域名/`
- 新闻后台：`https://你的域名/admin`

## 图片
后台上传图片后，图片保存在 `public/uploads/`。
生产环境建议使用云服务器磁盘或对象存储，并定期备份 `news.db`。

## 推荐生产架构
手机浏览器
  ↓ HTTPS
域名
  ↓
Nginx / Caddy
  ↓
Node.js + Express
  ↓
SQLite

这个压缩包已经是“部署版”，但我不能在此替你购买服务器、注册域名或让公网地址自动生成；部署后即可直接通过手机浏览器访问。
