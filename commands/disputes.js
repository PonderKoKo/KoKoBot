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
  name: 'disputes',
  permission: 'none',
  description: 'Check for disputes',
  examples: ['disputes'],
  execute (message, args) {
    if (!started) {
      message.channel.send('The tournament hasn\'t started yet')
    }
    const checkedAlready = []
    if (args[0] === 'all') {
      for (const [player, opponents] of Object.entries(records)) {
        checkedAlready.push(player)
        for (const [opponent, submitted] of Object.entries(opponents)) {
          if (checkedAlready.includes(opponent)) continue
          if (submitted !== null && records[opponent][player] !== null && fit[submitted] !== records[opponent][player]) {
            client.users.fetch(player)
              .then((playeruser) => {
                client.users.fetch(opponent)
                  .then((opponentuser) => {
                    message.channel.send(`${playeruser.username} — ${resultFromSubmitted(submitted)} — ${teams[player].join(' | ')}\n${opponentuser.username} — ${resultFromSubmitted(records[opponent][player])} — ${teams[opponent].join(' | ')}`)
                  })
              })
          }
        }
      }
    } else if (Object.keys(teams).includes(message.author.id)) {
      const [player, opponents] = [message.author.id, records[message.author.id]]
      for (const [opponent, submitted] of Object.entries(opponents)) {
        if (checkedAlready.includes(opponent)) continue
        if (submitted !== null && records[opponent][player] !== null && fit[submitted] !== records[opponent][player]) {
          client.users.fetch(player)
            .then((playeruser) => {
              client.users.fetch(opponent)
                .then((opponentuser) => {
                  message.channel.send(`${playeruser.username} — ${resultFromSubmitted(submitted)} — ${teams[player].join(' | ')}\n${opponentuser.username} — ${resultFromSubmitted(records[opponent][player])} — ${teams[opponent].join(' | ')}`)
                })
            })
        }
      }
    }
  }
}

function resultFromSubmitted (submitted) {
  return submitted === null ? 'nothing' : `${submitted}-${fit[submitted]}`
}
