const { started } = require('../config.json')
const teams = require('../index.js').decks
const records = require('../index.js').records
const client = require('../index.js').client

const fit = {
  0: 6,
  1: 4,
  2: 2,
  3: 3,
  4: 1,
  6: 0
}

module.exports = {
  name: 'stats',
  permission: 'KoKonuts',
  description: 'Check your stats for the tournament',
  examples: ['stats'],
  execute (message, args) {
    if (!started) {
      message.channel.send('The tournament hasn\'t started yet')
      return
    }
    let id = message.author.id
    if (Object.keys(teams).includes(args[0])) {
      id = args[0]
      client.users.fetch(id)
        .then(user => message.channel.send(user.username))
    } else if (!Object.keys(teams).includes(id)) {
      message.channel.send('You did not submit a team for this tournament.')
      return
    }
    let [missingYou, missingOppo, agreed, disputed, points] = [0, 0, 0, 0, 0]
    for (const [opponent, submitted] of Object.entries(records[id])) {
      if (submitted === null) {
        missingYou++
      } else {
        points += submitted
      }
      if (records[opponent][id] === null) {
        missingOppo++
      }
      if (submitted !== null && records[opponent][id] !== null) {
        if (fit[submitted] === records[opponent][id]) {
          agreed++
        } else {
          disputed++
        }
      }
    }
    const response = `You still need to submit ${missingYou} results.\nYou are waiting on ${missingOppo} opponents to submit their results.\nYou have ${agreed} agreed results.\nYou have ${disputed} disputed results.\nYour point total according to your own submissions is **${points}**`
    message.channel.send(response)
  }
}
