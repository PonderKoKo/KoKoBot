const fs = require('mz/fs');
const { prefix } = require('../config.json');
const commands = {};

fs.readdir('./commands',
	{ withFileTypes: true },
	(err, files) => {
		if (err) {
			console.log(err);
			process.exit(4);
		}
		else {
			files.forEach(file => {
				const command = require(`../commands/${file.name}`);
				commands[command.name] = command;
			});
		}
	});

module.exports = {
	name: 'help',
	permission: 'none',
	description: 'Gives the list of available commands or provides examples on a specific command',
	examples: ['help', 'help autowatch', 'help pack'],
	execute(message, args) {
		if (!args[0]) {
			let response = `The prefix for all commands is ${prefix}, capitalization does not matter. You can get more info on a specific command by calling help with the command name added.\n`;
			for (const [, value] of Object.entries(commands)) {
				if (value.permission !== 'KoKonuts') {
					response += `${value.name} - ${value.description}\n`;
				}
			}
			message.channel.send(response);
		}
		else if (Object.prototype.hasOwnProperty.call(commands, args[0]) && commands[args[0]].permission !== 'KoKonuts') {
			const command = commands[args[0]];
			message.channel.send(`**${command.name}**
required permission: ${command.permission}
description: ${command.description}
examples: ${prefix}${command.examples.join(`, ${prefix}`)}`);
		}
		else {
			message.channel.send(`The command ${args[0]} doesn't exist`);
		}
	},
};