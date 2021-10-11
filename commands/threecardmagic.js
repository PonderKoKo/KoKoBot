const { started } = require('../config.json')
const fetch = require('node-fetch')

const zonesizes = {
  hand: 5
}
const brackets = {
  library: ['[', ']'],
  hand: ['', '']
}

const banlist = ['Wistful Thinking', 'Burning Inquiry']

module.exports = {
  name: 'threecardmagic',
  permission: 'none',
  description: 'Submit a team for the three card magic competition or check your submitted team.',
  examples: ['threecardmagic Black Lotus|Channel|Emrakul, the Aeons Torn', 'threecardmagic'],
  execute (message, args) {
    const decks = require('../index.js').decks
    if (args.length === 0) {
      if (Object.keys(decks).includes(message.author.id)) {
        message.reply(`Your current team is: ${deckToString(decks[message.author.id])}`)
      } else {
        message.reply('No team has been saved for this Discord account.')
      }
      return
    }
    if (started) {
      message.reply('Submissions are over, use //record to submit your match results')
      return
    }
    const cardnames = message.content.split(' ').slice(1).join(' ').split('|')
    const requiredNumber = Object.keys(zonesizes).reduce((accu, value) => accu + zonesizes[value], 0)
    if (cardnames.length !== requiredNumber) {
      message.reply(`You sent ${cardnames.length} cards. Card names must be separated by only a "|" and nothing else. Three-card Magic requires exactly **${requiredNumber}** cards ;).`)
      return
    }
    const notfound = []
    let done = 0
    for (let i = 0; i < cardnames.length; i++) {
      const card = cardnames[i]
      const url = `https://api.scryfall.com/cards/search?format=json&include_multilingual=false&q=!"${card}" legal=pauper`
      fetch(url)
        .then((response) => response.json())
        .then((result) => {
          if (result.object !== 'list') {
            notfound.push(card)
          } else {
            cardnames[i] = result.data[0].name // Fix capitalization
          }
          done += 1
          if (done === cardnames.length) {
            if (notfound.length !== 0) {
              message.channel.send(`The team you submitted could not be saved. The following cards could not be found:\n${notfound.join('\n')}\nMake sure to check your spelling and note that only Pauper-legal cards are accepted.`)
            } else if (cardnames.some(x => banlist.includes(x))) {
              message.channel.send(`The cards ${cardnames.filter(x => banlist.includes(x)).join(' | ')} you submitted are banned.`)
            } else {
              const deck = {}
              for (const [zone, size] of Object.entries(zonesizes)) {
                deck[zone] = cardnames.splice(0, size)
                deck[zone].sort((a, b) => a.length - b.length)
              }
              decks[message.author.id] = deck
              message.reply(`Your new team has been submitted. It contains:\n${deckToString(deck)}`)
            }
          }
        })
    }
  }
}

function deckToString (deck) {
  return deckToArray(deck).join(' | ')
}
module.exports.deckToString = deckToString

function deckToArray (deck) {
  let cards = []
  for (const [zone, contents] of Object.entries(deck)) {
    cards = cards.concat(contents.map(x => brackets[zone][0] + x + brackets[zone][1]))
  }
  return cards
}
module.exports.deckToArray = deckToArray

function splitMessage (message) {
  if (message.length < 2000) {
    return [message]
  }
  const lines = message.split('\n')
  const chunks = []
  let chunk = []
  while (lines.length !== 0) {
    while (lines.length !== 0 && chunk.reduce((accu, value) => accu + value.length + 1, 0) + lines[0].length + 1 < 1900) {
      chunk.push(lines.shift())
    }
    chunks.push(chunk.join('\n'))
    chunk = []
  }
  return chunks
}
module.exports.splitMessage = splitMessage
