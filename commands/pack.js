const Discord = require('discord.js')
const Canvas = require('canvas')
const fetch = require('node-fetch')
const chance = require('chance').Chance()

// const CUBEDATA = require('../data.js').CUBEDATA
const scryfallCubes = ['Arena', 'Grixis', 'Legacy', 'Chuck', 'Twisted', 'Protour', 'Uncommon', 'April', 'Modern', 'Amaz', 'Tinkerer', 'Livethedream', 'Chromatic', 'Vintage']
const premierSets = ['MH2']

const booster = [
  {
    multiple: true,
    options: [
      {
        query: 'rarity=rare',
        weight: 7.4
      },
      {
        query: 'rarity=mythic',
        weight: 1
      }
    ],
    count: 1
  },
  {
    multiple: false,
    query: 'watermark=set',
    count: 1
  },
  {
    multiple: false,
    query: 'rarity=uncommon',
    count: 3
  },
  {
    multiple: false,
    query: 'rarity=common -type=basic',
    count: 10
  }
]

const ps = {
  columns: 5,
  spacing: 10,
  cardWidth: 2 * 149,
  cardHeight: 2 * 208
}

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
    } else if (premierSets.includes(args[0].toUpperCase())) {
      generateBoosterPack(args[0], message.channel)
    } else {
      message.channel.send(`This was interpreted as a cubecobra ID, here's your pack: https://cubecobra.com/cube/samplepackimage/${args[0]}/${String(Math.floor(Math.random() * 10000000))}`)
    }
  },
  welcome (channel) {
    generateCubePack(scryfallCubes[Object.keys(scryfallCubes).length * Math.random() | 0], channel)
  }
}

function generateCubePack (cubeName, channel, numberOfCards = 15) {
  const [canvas, context] = getCanvasAndContext(numberOfCards)
  let drawn = 0

  fetch(`https://api.scryfall.com/cards/search?format=json&include_multilingual=false&q=cube=${cubeName}`)
    .then((response) => response.json())
    .then((result) => {
      const indices = chance.unique(chance.natural, numberOfCards, { min: 0, max: result.total_cards - 1 })
      loadBatch(`cube=${cubeName}`, context, [...Array(numberOfCards).keys()], indices, function () {
        drawn++
        if (drawn === numberOfCards) {
          channel.send(`Here is a pack of ${cubeName} Cube!`, new Discord.MessageAttachment(canvas.toBuffer(), 'CubePack.png'))
        }
      }, channel)
    })
}

function generateBoosterPack (set, channel) {
  const numberOfCards = Object.keys(booster).reduce((accu, value) => accu + booster[value].count, 0)
  const [canvas, context] = getCanvasAndContext(numberOfCards)
  const spaces = [...Array(numberOfCards).keys()]
  let drawn = 0

  for (const slot of booster) {
    const space = spaces.splice(0, slot.count)
    const query = slot.multiple ? chance.weighted(slot.options.map(x => x.query), slot.options.map(x => x.weight)) : slot.query
    fetch(`https://api.scryfall.com/cards/search?format=json&include_multilingual=false&q=set=${set} ${query}`)
      .then((response) => response.json())
      .then((result) => {
        const indices = chance.unique(chance.natural, slot.count, { min: 0, max: result.total_cards - 1 })
        loadBatch(`set=${set} ${query}`, context, space, indices, function () {
          drawn++
          if (drawn === numberOfCards) {
            channel.send(`Here is a pack of ${set.toUpperCase()}!`, new Discord.MessageAttachment(canvas.toBuffer(), 'CubePack.png'))
          }
        }, channel)
      })
  }
}

function loadBatch (query, context, spaces, indices, callback, channel) {
  for (let i = 1; i < Math.ceil(Math.max(...indices) / 175) + 1; i++) {
    fetch(`https://api.scryfall.com/cards/search?format=json&include_extras=true&include_multilingual=false&order=name&page=${i}&q=${query}&unique=cards`)
      .then((response) => response.json())
      .then((page) => {
        for (const choice of indices) {
          if (175 * i > choice && choice > 175 * (i - 1)) {
            const card = page.data[choice % 175]
            try {
              Canvas.loadImage(Object.keys(card).includes('image_uris') ? card.image_uris.png : card.card_faces[0].image_uris.png)
                .then(image => {
                  drawCard(context, image, spaces.shift())
                })
                .catch(reason => {
                  console.log(`Error with loading the image of ${card.name}. Reason: ${reason}`)
                })
                .finally(() => callback())
            } catch (error) {
              if (error instanceof TypeError) {
                channel.send(`There was an issue with loading the image for ${card.name}. [<@448472133585207306>]`)
              } else {
                throw error
              }
              callback()
            }
          }
        }
      })
  }
}

function drawCard (context, image, slot) {
  context.drawImage(...[
    image,
    ps.spacing + (slot % ps.columns) * (ps.cardWidth + ps.spacing),
    ps.spacing + Math.floor(slot / ps.columns) * (ps.cardHeight + ps.spacing),
    ps.cardWidth,
    ps.cardHeight
  ])
}

function getCanvasAndContext (numberOfCards) {
  const rows = Math.ceil(numberOfCards / ps.columns)
  const canvas = Canvas.createCanvas(ps.columns * (ps.cardWidth + ps.spacing) + ps.spacing, rows * (ps.cardHeight + ps.spacing) + ps.spacing)
  return [canvas, canvas.getContext('2d')]
}
