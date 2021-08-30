const { started } = require('../config.json')
const fetch = require('node-fetch')

const previousSubmissions = ['Chancellor of the Dross', 'Force of Despair', 'Strip Mine', 'Gitaxian Probe', 'Black Lotus', 'Laboratory Maniac', 'Urza\'s Saga', 'Karakas', 'Urza\'s Saga', 'Chancellor of the Annex', 'Invisible Stalker', 'Black Lotus', 'Gideon of the Trials', 'City of Traitors', 'Black Lotus', 'Calciform Pools', 'Mishra\'s Factory', 'Chancellor of the Annex', 'Leyline of Anticipation', 'Black Lotus', 'Mesmeric Fiend', 'Strip Mine', 'Chancellor of the Forge', 'Chancellor of the Annex', 'Cavern of Souls', 'Scythe Tiger', 'Chancellor of the Annex', 'Greater Gargadon', 'Chalice of the Void', 'Rustvale Bridge', 'Dryad Arbor', 'Dryad Arbor', 'Crashing Footfalls', 'Chancellor of the Dross', 'Force of Despair', 'Subterranean Hangar', 'Cavern of Souls', 'Swarm Shambler', 'Swarm Shambler', 'Solitude', 'Chancellor of the Annex', 'Sheltered Valley', 'Chancellor of the Annex', 'Strip Mine', 'Fountain of Cho', 'Laboratory Maniac', 'Gitaxian Probe', 'Black Lotus', 'Grief', 'Dryad Arbor', 'Force of Despair', 'Providence', 'Solitude', 'Leyline of Lifeforce', 'Cavern of Souls', 'Chancellor of the Annex', 'Scythe Tiger', 'Pyrokinesis', 'Chancellor of the Forge', 'Strip Mine', 'Elite Spellbinder', 'Memnite']
const banlist = ['Thassa\'s Oracle']

module.exports = {
  name: 'threecardmagic',
  permission: 'none',
  description: 'Submit a team for the three card magic competition or check your submitted team.',
  examples: ['threecardmagic Black Lotus|Channel|Emrakul, the Aeons Torn', 'threecardmagic'],
  execute (message, args) {
    const decks = require('../index.js').decks
    if (args.length === 0) {
      if (Object.keys(decks).includes(message.author.id)) {
        message.reply(`Your current team is:\n${decks[message.author.id].join('\n')}`)
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
    if (cardnames.length !== 3) {
      message.reply(`You sent ${cardnames.length} cards. Card names must be separated by only a "|" and nothing else. Three-card Magic requires exactly **three** cards.`)
      return
    }
    const notfound = []
    const found = [] // So that capitalization etc. is correct
    for (const card of cardnames) {
      const url = `https://api.scryfall.com/cards/search?format=json&include_multilingual=false&q=!"${card}" legal=vintage`
      fetch(url)
        .then((response) => response.json())
        .then((result) => {
          if (result.object !== 'list') {
            notfound.push(card)
          } else {
            found.push(result.data[0].name)
          }
          if (found.length + notfound.length === 3) {
            if (notfound.length !== 0) {
              message.channel.send(`The team you submitted could not be saved. The following cards could not be found:\n${notfound.join('\n')}\nMake sure to check your spelling and note that only Vintage-legal cards are accepted.`)
            } else if (found.every((x) => previousSubmissions.includes(x))) {
              message.channel.send('All cards you submitted were submitted in the last tournament. Your team is thus not legal.')
            } else if (found.some(x => banlist.includes(x))) {
              message.channel.send(`The cards ${found.filter(x => banlist.includes(x).join(' | '))} you submitted are banned.`)
            } else {
              const sortedDeck = found.sort((a, b) => a.length - b.length)
              decks[message.author.id] = sortedDeck
              message.reply(`Your new team has been submitted. It contains:\n${sortedDeck.join(' | ')}`)
            }
          }
        })
    }
  }
}
