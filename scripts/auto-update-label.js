const githubClient = require('../lib/github-client')

const labelMap = {
    build: { color: "#ff3333", description: "" },
    deploy: { color: "#ff9900", description: "" },
    examples: { color: "#ff7356", description: "" },
    packages: { color: "#FF9999", description: "" },
    docs: { color: "#66CCFF", description: "" },
    style: { color: "#a987ff", description: "" },
    mixins: { color: "#FFCC00", description: "" },
    locale: { color: "#CCCCCC", description: "" },
    unit: { color: "#30dfb3", description: "" },
    test: { color: "#00cc66", description: "" },
    default: { color: "#3399ff", description: "" }
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
