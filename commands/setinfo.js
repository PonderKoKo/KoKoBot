module.exports = {
	name: 'setinfo',
	permission: 'none',
	description: 'Sends information on the available sets, whether they are watched or not and whether or not autowatch is enabled',
	examples: ['setinfo'],
	execute(userMessage, args) {
		const data = require('../index.js').spoilerData;
		let message = '';
		for (const setkey of Object.keys(data.sets)) {
			message += `\n${data.sets[setkey].name} - code: ${data.sets[setkey].CODE} - ${data.sets[setkey].channelIDs.includes(userMessage.channel.id) ? 'watched' : 'not watched'}`;
		}
		if (message == '') {
			message = 'There are currently no available sets.';
		}
		else {
			message = `The following sets are currently available:${message}`;
		}
		message = `${message}\nAutowatch is ${data.autowatch.includes(userMessage.channel.id) ? 'enabled' : 'disabled'}`;
		userMessage.channel.send(message);
	},
};