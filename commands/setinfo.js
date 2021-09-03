module.exports = {
  name: 'setinfo',
  permission: 'none',
  description: 'Sends information on the available sets, whether they are watched or not and whether or not autowatch is enabled',
  examples: ['setinfo'],
  execute (message) {
    const data = require('../index.js').spoilerData
    const response = [
      'The following sets are currently available:',
      ...Object.entries(data.sets).map(x => {
        const [, value] = x
        return [value.name, value.CODE, value.channelIDs.includes(message.channel.id) ? 'watched' : 'not watched'].join(' — ')
      }),
      `Autowatch is ${data.autowatch.includes(message.channel.id) ? 'en' : 'dis'}abled`
    ].join('\n')
    message.channel.send(response)
  }
}
