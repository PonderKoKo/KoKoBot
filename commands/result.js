const table = require('text-table')
const { started } = require('../config.json')

module.exports = {
  name: 'result',
  permission: 'none',
  description: 'Give results',
  examples: ['result'],
  execute (message) {
    if (!started) {
      message.channel.send('The tournament hasn\'t started yet')
      return
    }
    const teams = require('../index.js').decks
    const records = require('../index.js').records
    const playerNames = require('../index.js').playerNames
    const tournamentData = []
    for (const [id, team] of Object.entries(teams)) {
      let [missing, points] = [0, 0]
      for (const [opponent, submitted] of Object.entries(records[id])) {
        if (submitted === null) {
          missing++
        } else {
          points += submitted
        }
      }
      const name = playerNames[id]
      tournamentData.push({ name, team, points, missing })
    }
    tournamentData.sort((x, y) => y.points - x.points)
    const response = table(tournamentData.map(x => [x.name, ...x.team, x.points, `(${x.missing}M)`]))
    message.channel.send('```' + response + '```')
  }
}
