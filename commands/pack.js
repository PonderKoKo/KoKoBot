const Discord = require('discord.js')
const Canvas = require('canvas')
const fetch = require('node-fetch')

const CUBEDATA = require('../data.js').CUBEDATA

module.exports = {
  name: 'pack',
  permission: 'none',
  description: 'Gives a Pack image for the selected cube, use a number after the cube name to choose the number of cards (default is 15)',
  examples: ['pack vintage cube', 'pack legacy cube 12'],
  execute (message, args) {
    if (args.length === 0) {
      message.channel.send(`You need to specify which cube you want a pack of. The available cubes are: ${Object.keys(CUBEDATA).join(', ')}. Let me know if you would like your cube to be added!`)
      return
    }
    if (args.length > 1 && Number(args[args.length - 1]) > 0 && Number(args[args.length - 1]) < 15) {
      generateCubePack(args.splice(0, args.length - 1).join(' '), message.channel, 'command', Number(args[args.length - 1]))
    } else {
      generateCubePack(args.join(' '), message.channel, 'command')
    }
  },
  welcome (channel) {
    generateCubePack(Object.keys(CUBEDATA)[Object.keys(CUBEDATA).length * Math.random() | 0], channel, 'welcome')
  }
}

async function generateCubePack (cubeNameInput, channel, messageType, numberOfCards = 15) {
  let cubeName
  for (const cube of Object.keys(CUBEDATA)) {
    if (cube.toLowerCase() === cubeNameInput.toLowerCase()) {
      cubeName = cube
      break
    }
  }
  if (!cubeName) {
    channel.send(`This was interpreted as a cubecobra ID, here's your pack: https://cubecobra.com/cube/samplepackimage/${cubeNameInput}/${String(Math.floor(Math.random() * 10000000))}`)
    // channel.send(`The cube ${cubeNameInput} doesn't exist. The available cubes are: ${Object.keys(CUBEDATA).join(', ')}. Let me know if you would like your cube to be added!`);
    return
  }
  const columns = 5
  let message
  switch (messageType) {
    case 'welcome':
      message = `Here is a ${cubeName} pack, let us know what your first pick would be!`
      break
    default:
      message = `Here is a pack of ${cubeName}.`
      break
  }
  const spacing = 10
  const cardWidth = 149 * 2
  const cardHeight = 208 * 2
  const rows = Math.ceil(numberOfCards / columns)
  const canvas = Canvas.createCanvas(columns * (cardWidth + spacing) + spacing, rows * (cardHeight + spacing) + spacing)
  const ctx = canvas.getContext('2d')
  const cardsInCube = [...CUBEDATA[cubeName]]
  const selectedCards = []
  for (let i = 0; i < numberOfCards; i++) {
    const cardIndex = Math.floor(Math.random() * cardsInCube.length)
    selectedCards.push(cardsInCube[cardIndex])
    cardsInCube.splice(cardIndex, 1)
  }
  let i = 0
  for (const card of selectedCards) {
    const url = `https://api.scryfall.com/cards/search?format=json&include_multilingual=false&q=!"${card}"`
    fetch(url)
      .then(response => response.json())
      .then(function (result) {
        if (result.object !== 'list') {
          channel.send(`I encountered a problem with finding ${card} on Scryfall.`)
        } else {
          const imageLink = result.data[0].image_uris.png
          Canvas.loadImage(imageLink)
            .then(image => {
              ctx.drawImage(image, spacing + (i % columns) * (cardWidth + spacing), spacing + Math.floor(i / columns) * (cardHeight + spacing), cardWidth, cardHeight)
              i++
              if (i === numberOfCards) {
                channel.send(message, new Discord.MessageAttachment(canvas.toBuffer(), 'CubePack.png'))
              }
            })
        }
      })
  }
}
