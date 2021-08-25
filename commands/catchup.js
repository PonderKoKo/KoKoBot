/* eslint quotes: ["error", "single", { "allowTemplateLiterals": true }] */

module.exports = {
	name: 'catchup',
	permission: 'ADMINISTRATOR',
	description: 'Sends all card images + transcripts from the specified set to the channel (This can be very spammy if a lot of cards have already been spoiled so make sure you actually want this)',
	examples: ['catchup CMR', 'catchup M21'],
	execute(userMessage, args) {
		const spoilerData = require('../index.js').spoilerData;
		if (!args[0]) {
			userMessage.channel.send(`You didn't specify which set to catch up with.`);
		}
		else {
			const datacode = 'SET' + args[0].toUpperCase();
			if (Object.prototype.hasOwnProperty.call(spoilerData.sets, datacode)) {
				for (const id of Object.keys(spoilerData.sets[datacode].cardIDs)) {
					let message = '';
					for (const line of spoilerData.sets[datacode].cardIDs[id]) {
						message += line + '\n';
					}
					userMessage.channel.send(message);
				}
			}
			else {
				userMessage.channel.send('There is no card data available for this setcode.');
			}
		}
	},
};