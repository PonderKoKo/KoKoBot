/* eslint quotes: ["error", "single", { "allowTemplateLiterals": true }] */
const { prefix } = require('../config.json')

module.exports = {
  name: 'watch',
  permission: 'MANAGE_CHANNELS',
  description: 'Start or stop watching the specified set.',
  examples: ['watch SLD', 'watch CMR', 'watch JMP false'],
  execute (message, args) {
    const data = require('../index.js').spoilerData
    if (args.length === 0 || !args[0]) {
      message.channel.send(`You didn't specify the set (for example: ${module.exports.example})`)
      return
    }
    const startwatch = args.length === 1 || args[1] === 'true'
    const setcode = args[0].toUpperCase()
    const datacode = 'SET' + setcode
    if (!Object.prototype.hasOwnProperty.call(data.sets, datacode)) {
      message.channel.send(`The set ${setcode} isn't available. Please make sure you entered the setcode correctly.`)
    } else if (startwatch === data.sets[datacode].channelIDs.includes(message.channel.id)) {
      message.channel.send(`The set ${setcode} ${startwatch ? 'is already' : `was already not`} being watched in this channel.`)
    } else if (startwatch) {
      message.channel.send(`The set ${setcode} will now be watched in this channel. If you are an administrator, you can use the command ${prefix}catchup ${setcode} to get all previous spoilers for this set.`)
      data.sets[datacode].channelIDs.push(message.channel.id)
    } else {
      message.channel.send(`The set ${setcode} will no longer be watched in this channel.`)
      data.sets[datacode].channelIDs = data.sets[datacode].channelIDs.filter(e => e !== message.channel.id)
    }
  }
}
