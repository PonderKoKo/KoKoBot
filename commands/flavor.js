/* eslint quotes: ["error", "single", { "allowTemplateLiterals": true }] */
const fetch = require('node-fetch');

module.exports = {
	name: 'flavor',
	permission: 'none',
	description: 'Show flavor text for the specified card (use Scryfall syntax)',
	examples: ['flavor Raging Goblin', 'flavor Raging Goblin set:8ED'],
	execute(message, args) {
		if (args.length === 0 || !args[0]) {
			message.channel.send(`I feel like you didn't specify a card`);
			return;
		}
		const query = message.content.split(' ').slice(1).join(' ');
		const url = `https://api.scryfall.com/cards/search?format=json&include_multilingual=false&order=released&unique=prints&q=${query} order:released direction:ascending` 
		fetch(url)
			.then(response => response.json())
			.then(function(data) {
				if (data.object !== 'list') {
					message.channel.send(`I couldn't find any matching cards on Scryfall :(`);
				}
				else {
					const hits = [];
					let more = false;
					cardLoop: for (const card of data.data) {
						if ('flavor_text' in card) {
							const [flavor, name, set] = ['flavor_text', 'name', 'set_name'].map(x => card[x]);
							for (const prev of hits) {
								if (prev.flavor === flavor) {
									continue cardLoop;
								}
							}
							if (hits.length === 5) {
								more = true;
								break cardLoop;
							}
							hits.push({ flavor, name, set});
						}
					}
					let response = '';
					if (hits.length == 0) {
						response = `I couldn't find any flavor text for these cards :(`;
					}
					for (const hit of hits) {
						response += `*${hit.flavor}* (${hit.name}, ${hit.set})\n`;
					}
					if (more) {
						response += 'There were also more hits, narrow down your search for those';
					}
					message.channel.send(response);
				}
			});
	},
};
