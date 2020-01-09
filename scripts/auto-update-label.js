const githubClient = require('../lib/github-client')

const labelMap = {
    build: { color: '#eb6420', description: '' },
    deploy: { color: '', description: '' },
    examples: { color: '', description: '' },
    packages: { color: '', description: '' },
    docs: { color: '#006b75', description: '' },
    style: { color: '', description: '' },
    mixins: { color: '', description: '' },
    locale: { color: '', description: '' },
    unit: { color: '#9944dd', description: '' },
    test: { color: '#990099', description: '' },
    default: { color: '#1eca26', description: '' },
}

function resolveLabel (label) {
    let  target = labelMap[label]
    target = labelMap[(target && target.color) ? label : 'default']
    target = JSON.parse(JSON.stringify(target))
    target.color = target.color.substring(1)
    if(target.description ===''){
        delete target.description
    }
    return target
}

module.exports = function (app) {
    app.on('label.created', async (data, owner, repo) => {
        // 本次创建的label
        const { name:current_name } = data.label
        githubClient.issues.updateLabel({
            owner,
            repo,
            current_name,
            ...resolveLabel(current_name)
        })
    })
}
