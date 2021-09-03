/* eslint quotes: ["error", "single", { "allowTemplateLiterals": true }] */
const fetch = require('node-fetch')

module.exports = {
  name: 'flavor',
  permission: 'none',
  description: 'Show flavor text for the specified card (use Scryfall syntax)',
  examples: ['flavor Raging Goblin', 'flavor Raging Goblin set:8ED'],
  execute (message, args) {
    if (args.length === 0 || !args[0]) {
      message.channel.send(`I feel like you didn't specify a card`)
      return
    }
    const query = message.content.split(' ').slice(1).join(' ')
    const url = `https://api.scryfall.com/cards/search?format=json&include_multilingual=false&order=released&unique=prints&q=${query} order:released direction:ascending`
    fetch(url)
      .then(response => response.json())
      .then(function (data) {
        if (data.object !== 'list') {
          message.channel.send(`I couldn't find any matching cards on Scryfall :(`)
        } else {
          const hits = []
          let more = false
          for (const card of data.data) {
            if ('flavor_text' in card) {
              const [flavor, name, set] = ['flavor_text', 'name', 'set_name'].map(x => card[x])
              if (hits.every(x => x.flavor !== flavor)) {
                hits.push({ flavor, name, set })
                if (hits.length === 5) {
                  more = true
                  break
                }
              }
            }
          }
          if (hits.length === 0) {
            message.channel.send(`I couldn't find any flavor text for these cards :(`)
          } else {
            message.channel.send(hits.map(hit => `*${hit.flavor}* (${hit.name}, ${hit.set})`).join('\n') + more ? '\nThere were other matches as well.' : '')
          }
        }
      })
  }
}
