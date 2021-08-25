/* eslint quotes: ["error", "single", { "allowTemplateLiterals": true }] */

module.exports = {
	name: 'autowatch',
	permission: 'MANAGE_CHANNELS',
	description: 'Change whether or not autowatch is enabled, this decides if newly added sets are automatically watched.',
	examples: ['autowatch', 'autowatch true', 'autowatch false'],
	execute(message, args) {
		const data = require('../index.js').spoilerData;
		let startautowatch;
		if (args.length === 0 || args[0] === 'true') {
			startautowatch = true;
		}
		else if (args[0] === 'false') {
			startautowatch = false;
		}
		else {
			message.channel.send('You must specify either true or false');
		}
		if (startautowatch === data.autowatch.includes(message.channel.id)) {
			message.channel.send(`Autowatch is already ${startautowatch ? 'en' : 'dis'}abled in this channel.`);
			return;
		}
		if (startautowatch) {
			data.autowatch.push(message.channel.id);
		}
		else {
			data.autowatch.splice(data.autowatch.indexOf(message.channel.id), 1);
		}
		message.channel.send(`Autowatch is now ${startautowatch ? 'en' : 'dis'}abled. Your previous watches have been maintained.`);
		// return { "UpdateData": true, data};
	},
};