const { started } = require('../config.json')
const { deckToString } = require('./threecardmagic.js')

const fit = {
  0: 6,
  1: 4,
  2: 2,
  3: 3,
  4: 1,
  6: 0
}

module.exports = {
  name: 'disputes',
  permission: 'none',
  description: 'Check for disputes',
  examples: ['disputes'],
  execute (message, args) {
    if (!started) {
      message.channel.send('The tournament hasn\'t started yet')
      return
    }
    const teams = require('../index.js').decks
    const records = require('../index.js').records
    const playerNames = require('../index.js').playerNames
    const checkedAlready = []
    const checkAll = args.length > 0 && args[0] === 'all'
    let noDisputes = true
    for (const [player, opponents] of Object.entries(records)) {
      if (!checkAll && player !== message.author.id) {
        continue
      }
      checkedAlready.push(player)
      for (const [opponent, submitted] of Object.entries(opponents)) {
        if (checkedAlready.includes(opponent)) {
          continue
        }
        if (submitted !== null && records[opponent][player] !== null && fit[submitted] !== records[opponent][player]) {
          noDisputes = false
          message.channel.send([
            generateSide(playerNames[player], teams[player], submitted),
            generateSide(playerNames[opponent], teams[opponent], records[opponent][player])
          ].join('\n'))
        }
      }
    }
    if (noDisputes) {
      message.channel.send('There are no disputes.')
    }
  }
}

function resultFromSubmitted (submitted) {
  return submitted === null ? 'nothing' : `${submitted}-${fit[submitted]}`
}

function generateSide (name, deck, submitted) {
  return `${name} — ${deckToString(deck)} — ${resultFromSubmitted(submitted)}`
}
