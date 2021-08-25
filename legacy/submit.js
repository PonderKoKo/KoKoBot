/* eslint quotes: ["error", "single", { "allowTemplateLiterals": true }] */
const { prefix } = require('../config.json');

const links = [
	'https://calebgannon.com/contest_gallery1-355474/',
	'https://calebgannon.com/contest_gallery8-2323095/',
	'https://calebgannon.com/contest_gallery14-098214/',
];
let tempLinks = links.slice(0);
const numberToSend = 2;


module.exports = {
	name: 'submit',
	permission: 'none',
	description: 'Set up a distribution message',
	examples: ['pollhelper start TestPoll Option1 Option2 Option3 Option4'],
	async execute(message) {
		if (message.guild.id !== '626215981387350057' && message.guild.id !== '720680322869755934') return;
		let thingyToSend = 'Upload your commissions to these links (one to each). Caleb also made a YouTube video to explain (https://youtu.be/XREM7zJ6U_I)';
		for (let i = 0; i < numberToSend; i++) {
			thingyToSend += '\n' + tempLinks.splice(Math.floor(Math.random() * tempLinks.length), 1)[0];
		}
		message.author.send(thingyToSend);
		if (tempLinks.length < numberToSend) {
			tempLinks = links.slice(0);
		}
		message.delete();
	},
};