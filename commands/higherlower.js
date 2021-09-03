const fetch = require('node-fetch')

module.exports = {
  name: 'guess',
  permission: 'KoKonuts',
  description: 'Lets you play the guessing game',
  examples: ['guess'],
  execute (message, args) {
    const query = message.content.split(' ').slice(1).join(' ')
    const url = `https://api.scryfall.com/cards/search?format=json&include_multilingual=false&q=${query}`
    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        if (result.object !== 'list') {
          message.channel.send('The Scryfall request returned an error. This most likely means, your search didn\'t match any cards.')
        } else {
          
        }
      })
  }
}
