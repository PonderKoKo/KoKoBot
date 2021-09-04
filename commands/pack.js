const Discord = require('discord.js')
const Canvas = require('canvas')
const fetch = require('node-fetch')
const chance = require('chance').Chance()

// const CUBEDATA = require('../data.js').CUBEDATA
const scryfallCubes = ['Arena', 'Grixis', 'Legacy', 'Chuck', 'Twisted', 'Protour', 'Uncommon', 'April', 'Modern', 'Amaz', 'Tinkerer', 'Livethedream', 'Chromatic', 'Vintage']

module.exports = {
  name: 'pack',
  permission: 'none',
  description: 'Gives a Pack image for the selected cube, use a number after the cube name to choose the number of cards (default is 15)',
  examples: ['pack vintage cube', 'pack legacy cube 12'],
  execute (message, args) {
    if (args.length === 0) {
      message.channel.send(`You need to specify which cube you want a pack of. The available cubes are: ${scryfallCubes.join(', ')}. Let me know if you would like your cube to be added!`)
    } else if (scryfallCubes.map(x => x.toLowerCase()).includes(args[0].toLowerCase())) {
      generateCubePack(args[0], message.channel)
    } else {
      message.channel.send(`This was interpreted as a cubecobra ID, here's your pack: https://cubecobra.com/cube/samplepackimage/${args[0]}/${String(Math.floor(Math.random() * 10000000))}`)
    }
  },
  welcome (channel) {
    generateCubePack(scryfallCubes[Object.keys(scryfallCubes).length * Math.random() | 0], channel)
  }
}

async function generateCubePack (cubeName, channel, numberOfCards = 15) {
  const columns = 5
  const message = `Here is a ${cubeName} Cube pack, let us know what your first pick would be!`
  const spacing = 10
  const cardWidth = 149 * 2
  const cardHeight = 208 * 2
  const rows = Math.ceil(numberOfCards / columns)
  const canvas = Canvas.createCanvas(columns * (cardWidth + spacing) + spacing, rows * (cardHeight + spacing) + spacing)
  const ctx = canvas.getContext('2d')

  fetch(`https://api.scryfall.com/cards/search?format=json&include_multilingual=false&q=cube=${cubeName}`)
    .then((response) => response.json())
    .then((result) => {
      if (result.object !== 'list') {
        channel.send('Scryfall responded to the request with an error')
      } else {
        const indices = chance.unique(chance.natural, numberOfCards, { min: 0, max: result.total_cards - 1 })
        let drawn = 0
        for (let i = 1; i < Math.ceil(result.total_cards / 175) + 1; i++) {
          fetch(`https://api.scryfall.com/cards/search?format=json&include_extras=true&include_multilingual=false&order=name&page=${i}&q=cube=${cubeName}&unique=cards`)
            .then((response) => response.json())
            .then((page) => {
              for (const choice of indices) {
                if (175 * i > choice) {
                  Canvas.loadImage(page.data[choice % 175].image_uris.png)
                    .then(image => {
                      ctx.drawImage(image, spacing + (drawn % columns) * (cardWidth + spacing), spacing + Math.floor(drawn / columns) * (cardHeight + spacing), cardWidth, cardHeight)
                      drawn++
                      if (drawn === numberOfCards) {
                        channel.send(message, new Discord.MessageAttachment(canvas.toBuffer(), 'CubePack.png'))
                      }
                    })
                }
              }
            })
        }
      }
    })
}
