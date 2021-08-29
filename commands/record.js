const { started } = require('../config.json')

const fit = {
  0: 6,
  1: 4,
  2: 2,
  3: 3,
  4: 1,
  6: 0
}

module.exports = {
  name: 'record',
  permission: 'none',
  description: 'Check the matches in the threecardmagic tournament and record results.',
  examples: ['record', 'record OpponentID 6'],
  execute (message, args) {
    if (!started) {
      message.channel.send('The tournament hasn\'t started yet')
      return
    }
    const teams = require('../index.js').decks
    const records = require('../index.js').records
    const playerNames = require('../index.js').playerNames
    const playerIDs = require('../index.js').playerIDs
    if (!Object.keys(teams).includes(message.author.id)) {
      message.channel.send('You did not submit a team for this tournament.')
      return
    }
    if (args.length === 0) {
      let response = ''
      for (const [opponentID, submitted] of Object.entries(records[message.author.id])) {
        response += `${playerNames[opponentID]} — ${teams[opponentID].join(' | ')} — Y: ${resultFromSubmitted(submitted)} — O: ${resultFromSubmitted(records[opponentID][message.author.id])}\n`
      }
      message.channel.send(response)
      return
    }
    const opponent = args.slice(0, args.length - 1).join(' ')
    const score = Number(args[args.length - 1])
    if (!Object.keys(records[message.author.id]).map(x => playerNames[x]).includes(opponent)) {
      message.channel.send('The opponent you gave does not exist in the tournament. This process does not work over IDs anymore.')
      return
    }
    if (!Object.keys(fit).includes(args[args.length - 1])) {
      message.channel.send('The result you submitted is not possible. Make sure to submit 6 for 6-0, 4 for 4-1, 3 for 3-3, 2 for 2-2, 1 for 1-4 or 0 for 0-6')
      return
    }
    records[message.author.id][playerIDs[opponent]] = score
    message.channel.send(`You sucessfully submitted the result ${resultFromSubmitted(score)} for your opponent ${opponent}`)
  }
}

function resultFromSubmitted (submitted) {
  return submitted === null ? 'nothing' : `${submitted}-${fit[submitted]}`
}
