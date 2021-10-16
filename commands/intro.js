const { prefix } = require('../config.json');

module.exports = {
	name: 'intro',
	permission: 'none',
	description: 'Gives a short introduction of this bot',
	examples: ['intro'],
	execute(message) {
		message.channel.send(`This bot was entirely written by @KoKonuts. It automatically posts spoilers to configured channels and can also be used to generate Pack 1 Pick 1 images of cubes. By default this bot does not do anything. Type ${prefix}howtoadd for instructions on how to add this bot to your server and ${prefix}help for info on the commands you can use. Me and this project are NOT endorsed by Scryfall. You can view the code on github.com/PonderKoKo/KoKoBot or buy me a ko-fi at Ko-fi.com/kokonuts.`);
	},
};
