# FTF GitHub Bot

京东FTF团队使用此机器人帮助成员管理其开源项目

It executes [scripts](https://github.com/nodejs/github-bot/tree/master/scripts) in response to events that are
pushed to it via GitHub webhooks. All [repositories](https://github.com/nodejs) that use this bot have the same webhook url & secret configured (there is only 1 bot instance). Org-wide webhooks are not allowed.

## Contributing

Please do, contributions are more than welcome!
See [CONTRIBUTING.md](CONTRIBUTING.md).

### Environment Variables
> 首先在项目根目录创建 `.env` 文件

- **`GITHUB_TOKEN`**<br>
  The [GitHub API token](https://github.com/blog/1509-personal-api-tokens) for your account (or bot account) that will be used to make API calls to GitHub. The account must have proper access to perform the actions required by your script.
- **`GITHUB_WEBHOOK_SECRET`**<br>
  The webhook secret that GitHub signs the POSTed payloads with. This is created when the webhook is defined. The default is `hush-hush`.

### Developing Locally

The bot will try to load a `.env` file at the root of the project if it exists to set environment varaibles. You will need to create one similar to this:

```
GITHUB_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SSE_RELAY=https://hook-relay.herokuapp.com
```

**Note the additional `SSE_RELAY` variable:**
When developing locally, it is difficult to setup a GitHub webhook
pointing to the computer you are developing on. An easy workaround is to set the `SSE_RELAY` to the url of
[a SSE relay server](https://github.com/williamkapke/hook-relay) that will send the GitHub events via
[Server Sent Events](http://www.html5rocks.com/en/tutorials/eventsource/basics/) instead.

You can use the [TestOrgPleaseIgnore](https://github.com/TestOrgPleaseIgnore) GitHub Organization, to test
your changes. Actions performed on the repos there will be sent to
[the SSE Relay](https://github.com/williamkapke/hook-relay).

The `GITHUB_WEBHOOK_SECRET` environment variable is not required when using the relay.

**Run the bot:**
```bash
$ npm start
```

When developing a script, it is likely that you will only want to run the script(s) that you are working on. You may
pass an additional [glob](https://www.npmjs.com/package/glob) argument to specify which scripts to run.

```bash
$ SCRIPTS=./scripts/my-new-event-handler.js npm start
```


## License

[MIT](LICENSE.md)
