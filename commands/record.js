const { started } = require('../config.json')
const teams = require('../index.js').decks
const records = require('../index.js').records

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
    if (!Object.keys(teams).includes(message.author.id)) {
      message.channel.send('You did not submit a team for this tournament.')
      return
    }
    if (args.length === 0) {
      let response = ''
      for (const [opponent, submitted] of Object.entries(records[message.author.id])) {
        response += `${opponent} — ${teams[opponent].join(' | ')} — Y: ${resultFromSubmitted(submitted)} — O: ${resultFromSubmitted(records[opponent][message.author.id])}\n`
      }
      message.channel.send(response)
      return
    }
    if (args.length !== 2) {
      message.channel.send('This command requires exactly two arguments, the opponentID and your submitted score')
      return
    }
    const opponentID = args[0]
    const score = Number(args[1])
    if (!Object.keys(records[message.author.id]).includes(opponentID)) {
      message.channel.send('The opponentID you gave does not exist in the tournament. Make sure to copy it from this bot\'s message')
      return
    }
    if (!Object.keys(fit).includes(args[1])) {
      message.channel.send('The result you submitted is not possible. Make sure to submit 6 for 6-0, 4 for 4-1, 3 for 3-3, 2 for 2-2, 1 for 1-4 or 0 for 0-6')
      return
    }
    records[message.author.id][opponentID] = score
    message.channel.send(`You sucessfully submitted the result ${resultFromSubmitted(score)} for your opponent ${opponentID}`)
  }
}

function resultFromSubmitted (submitted) {
  return submitted === null ? 'nothing' : `${submitted}-${fit[submitted]}`
}
