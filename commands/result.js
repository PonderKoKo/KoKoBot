const table = require('text-table')
const { started } = require('../config.json')
const { deckToArray } = require('./threecardmagic.js')

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
      for (const opponent in records[id]) {
        const submitted = records[id][opponent]
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
    const response = table(tournamentData.map(x => [x.name, ...deckToArray(x.team), x.points, `(${x.missing}M)`]))
    for (const chunk of splitMessage(response)) {
      message.channel.send('```' + chunk + '```')
    }
  }
}

function splitMessage (message) {
  if (message.length < 2000) {
    return [message]
  }
  const lines = message.split('\n')
  const chunks = []
  let chunk = []
  while (lines.length !== 0) {
    while (chunk.reduce((accu, value) => accu + value.length + 1, 0) + lines[0].length + 1 < 2000) {
      chunk.push(lines.shift())
    }
    chunks.push(chunk.join('\n'))
    chunk = []
  }
}
