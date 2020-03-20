# FTF GitHub Bot

京东FTF团队使用此机器人帮助成员管理其开源项目

它执行 [scripts](https://github.com/jd-ftf/github-bot/tree/master/src/scripts) 以响应通过 GitHub webhooks 推送过来的事件。
使用这个机器人的所有 [repositories](https://github.com/jd-ftf) 都有相同的 webhook 链接和密钥配置(只有一个机器人实例)。

### 环境变量

> 首先在项目根目录创建 `.env` 文件

- **`GITHUB_TOKEN`**<br>
  你的账号(或者虚拟机器人的账号)的 [GitHub API token](https://github.com/blog/1509-personal-api-tokens)，此令牌用于调用 GitHub API。此账号必须具有适当的访问权限才能执行脚本所需的操作。
- **`GITHUB_WEBHOOK_SECRET`**<br>
  GitHub 使用 webhook 密钥对请求 payloads 进行加密。此密钥是在配置 webhook 时输入的，默认值为：`hush-hush`，用来校验 github event payload 的有效性。
- **`NetLify_WEBHOOK_SECRET`**<br>
  [NetLify](https://www.netlify.com) 使用 webhook 密钥对请求 payloads 进行加密。此密钥是在配置 webhook 时输入的，默认值为：`hush-hush`，用来校验 netlify event payload 的有效性。

### 本地开发

机器人会尝试载入项目根目录下的 `.env` 文件，此文件用于配置nodejs运行时的环境变量。如果有需要，请按照下列内容的格式进行创建此文件。

```
GITHUB_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
那么在NodeJS中的进程变量中则有:

```javascript
process.env.GITHUB_TOKEN= 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

使用测试用例时，不需要配置 `WEBHOOK_SECRET`。

**运行此机器人:**

```bash
$ npm i
$ npm start
```
