const githubClient = require('../lib/github-client')

const labelsMap = new Map([
    // Wot Design
    [/^examples\/docs\/docs\/(\w+)\.md$/, ['docs', '$1']],
    [/^examples\/demo\/pages\/(\w+)\.vue$/, ['examples', '$1']],
    [/^src\/mixins\/(\w+)(\/|\.js$)/, ['mixins', '$1']],
    [/^src\/style\/(\w+)\.scss$/, ['style', '$1']],
    [/^src\/mixins\/locale\.js$/, ['i18n']],
    [/^src\/locale\//, ['i18n']],
    [/^examples\/(\w+)\//, ['example', '$1']],
    [/^test\/unit\/(\S+)(\/|\.js$)/, ['test', 'unit', '$1']],
    // Wot Design Mini
    [/^docs\/docs\/(\w+)\.md$/, ['docs', '$1']],
    [/^example\/(\w+)\//, ['example', '$1']],
    // Common
    [/^build/, ['build']],
    [/^build\/deploy/, ['build', 'deploy']],
    [/^packages\/(\w+)\//, ['packages', '$1']],
    [/^\.travis\.yml$/, ['deploy','travis']],

])

/**
 * @description 获取PR的所有文件
 * @param {String} owner
 * @param {String} repo
 * @param {Number} pull_number
 * @return {Array<String>}
 */
async function listAllFiles (owner, repo, pull_number) {
    let pageNumber = 1
    let result = []
    while (true) {
        const { data: items } = await githubClient.pulls.listFiles({
            owner,
            repo,
            pull_number,
            per_page: 100,
            page: pageNumber++
        })
        if (items.length === 0) break
        const files = items.map(({ filename }) => filename)
        result = result.concat(files)
    }
    return Array.from(new Set(result))
}

/**
 * @description 为路径匹配标签
 * @param { String|Array<String> } filePaths
 * @return {Array<String>} labels
 */
function resolveLabels (filePaths) {
    filePaths = filePaths instanceof Array ? filePaths : [filePaths]
    const labelsSet = new Set()
    filePaths.forEach(path => {
        for (const [regex, labels] of labelsMap) {
            const matches = regex.exec(path)
            if (matches === null) {
                continue
            }
            labels.forEach(label => labelsSet.add(
                label.startsWith('$')
                    ? matches[label.substr(1)]
                    : label)
            )
        }
    })
    return Array.from(labelsSet)
}

module.exports = function (app) {
    app.on('pull_request.opened', async (data, owner, repo) => {
        const { number: pull_number } = data.pull_request

        const files = await listAllFiles(owner, repo, pull_number)

        const labels = resolveLabels(files)

        if (labels.length === 0) return

        await githubClient.issues.addLabels({
            owner,
            repo,
            issue_number: pull_number,
            labels
        })
    })
}

