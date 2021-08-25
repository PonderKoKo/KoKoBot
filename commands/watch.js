/* eslint quotes: ["error", "single", { "allowTemplateLiterals": true }] */
const { prefix } = require('../config.json');

module.exports = {
	name: 'watch',
	permission: 'MANAGE_CHANNELS',
	description: 'Start or stop watching the specified set.',
	examples: ['watch SLD false', 'watch CMR true', 'watch JMP'],
	execute(message, args) {
		const data = require('../index.js').spoilerData;
		if (args.length === 0 || !args[0]) {
			message.channel.send(`You didn't specify the set (for example: ${module.exports.example})`);
			return;
		}
		let startwatch;
		if (args.length === 1) {
			startwatch = true;
		}
		else {
			switch (args[1]) {
			case 'true':
				startwatch = true;
				break;
			case 'false':
				startwatch = false;
				break;
			default:
				message.channel.send(`You must specify either true or false after the setcode (for example: ${module.exports.example})`);
				return;
			}
		}
		const setcode = args[0].toUpperCase();
		const datacode = 'SET' + setcode;
		if (!Object.prototype.hasOwnProperty.call(data.sets, datacode)) {
			message.channel.send(`The set ${setcode} isn't available. Please make sure you entered the setcode correctly.`);
		}
		else if (startwatch === data.sets[datacode].channelIDs.includes(message.channel.id)) {
			message.channel.send(`The set ${setcode} ${startwatch ? 'is already' : `was already not`} being watched in this channel.`);
		}
		else {
			message.channel.send(`The set ${setcode} will now ${startwatch ? `be watched in this channel. If you are an administrator, you can use the command ${prefix}catchup ${setcode} to get all previous spoilers for this set.` : 'no longer be watched in this channel.'}`);
			data.sets[datacode].channelIDs.push(message.channel.id);
		}
	},
};