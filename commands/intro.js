const { prefix } = require('../config.json');

module.exports = {
	name: 'intro',
	permission: 'none',
	description: 'Gives a short introduction of this bot',
	examples: ['intro'],
	execute(message) {
		message.channel.send(`This bot was entirely written by @KoKonuts. It is intended to automatically provide spoilers for the newest MtG sets. To do so it fetches Scryfall-Data in certain intervals and sends any new cards it finds. By default this bot does not do anything. Type ${prefix}howtoadd for instructions on how to add this bot to your server and ${prefix}help for info on the commands you can use. Me and this project are NOT endorsed by Scryfall.`);
	},
};