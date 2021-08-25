/* eslint quotes: ["error", "single", { "allowTemplateLiterals": true }] */
const fetch = require('node-fetch');
const client = require('../index.js').client;
const previousSubmissions = [];
const closeSubmissions = false;

module.exports = {
	name: 'threecardmagic',
	permission: 'none',
	description: 'Submit a team for the three card magic competition or check your submitted team.',
	examples: ['threecardmagic Black Lotus|Channel|Emrakul, the Aeons Torn', 'threecardmagic'],
	execute(message, args) {
		const decks = require('../index.js').decks;
		const cardnames = message.content.split(' ').slice(1).join(' ').split('|');
		if (args.length === 0) {
			if (message.author.id in decks) {
				message.reply(`Your current team is:\n${decks[message.author.id].join('\n')}`);
			}
			else {
				message.reply(`No team has been saved for this Discord account.`);
			}
			return;
		}
		else if (args[0] === 'show') {
			let response = '';
			for (const [opponentID, cards] of Object.entries(decks)) {
				response += `${opponentID} - ${cards.join(' | ')}\n`;
			}
			message.channel.send(response);
			return;
		}
		else if (closeSubmissions) {
			message.reply(`Submissions are over, use //record to submit your match results`);
			return;
		}
		if (cardnames.length !== 3) {
			message.reply(`You sent ${cardnames.length} cards. Card names must be separated by only a "|" and nothing else. Three-card Magic requires exactly **three** cards.`);
			return;
		}
		const notfound = [];
		const found = []; // So that capitalization etc. is correct
		for (const card of cardnames) {
			const url = `https://api.scryfall.com/cards/search?format=json&include_multilingual=false&q=!"${card}" legal=vintage`;
			fetch(url)
			.then(response => response.json())
			.then(function(result) {
				if (result.object !== 'list') {
					notfound.push(card);
				}
				else {
					found.push(result.data[0].name);
				}
				if (found.length + notfound.length === 3) {
					if (notfound.length !== 0) {
						message.reply(`The team you submitted could not be saved. The following cards could not be found:\n${notfound.join('\n')}\nMake sure to check your spelling and note that only Vintage-legal cards are accepted.`);
					}
					else if (found.every(x => previousSubmissions.includes(x))) {
						message.reply(`All cards you submitted were submitted in the last tournament. Your team is thus not legal.`);
					}
					else {
						decks[message.author.id] = found;
						message.reply(`Your new team has been submitted. It contains:\n${found.join('\n')}`);
					}			
				}
			});
		}
	},
};

/*
const notfound = [];
		const found = []; // So that capitalization etc. is correct
		for (const card of cardnames) {
			const url = `https://api.scryfall.com/cards/search?format=json&include_multilingual=false&q=!"${card}" legal=vintage`;
			fetch(url)
			.then(response => response.json())
			.then(function(data) {
				if (data.object !== 'list') {
					notfound.push(card);
				}
				else {
					found.push(data[0].name);
				}
			});
		}
*/