const fs = require('mz/fs')
const commands = {}

fs.readdir('./commands',
  { withFileTypes: true },
  (err, files) => {
    if (err) {
      console.log(err)
      process.exit(4)
    } else {
      files.forEach(file => {
        const command = require(`../commands/${file.name}`)
        if (command.permission !== 'KoKonuts') {
          commands[command.name] = command
        }
      })
    }
  })

module.exports = {
  name: 'help',
  permission: 'none',
  description: 'Gives the list of available commands or provides examples on a specific command',
  examples: ['help', 'help autowatch', 'help pack'],
  execute (message, args) {
    if (!args[0]) {
      message.channel.send(Object.keys(commands).map(name => `${name} — ${commands[name].description}`).join('\n'))
    } else if (Object.keys(commands).includes(args[0])) {
      const command = commands[args[0]]
      message.channel.send([
        `**${command.name}**`,
        `required permission: ${command.permission}`,
        `description: ${command.description}`,
        `examples: ${command.examples.join(', ')}`
      ].join('\n'))
    } else {
      message.channel.send(`The command ${args[0]} doesn't exist`)
    }
  }
}
