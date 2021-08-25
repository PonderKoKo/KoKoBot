/* eslint quotes: ["error", "single", { "allowTemplateLiterals": true }] */
const { prefix } = require('../config.json');

const links = [
	'https://calebgannon.com/contest_gallery1-355474/',
	'https://calebgannon.com/contest_gallery2-2379624/',
	'https://calebgannon.com/contest_gallery3-6293562/',
	'https://calebgannon.com/contest_gallery4-1243432/',
	'https://calebgannon.com/contest_gallery5-239595/',
	'https://calebgannon.com/contest_gallery6-1356346/',
	'https://calebgannon.com/contest_gallery7-1246966/',
	'https://calebgannon.com/contest_gallery8-2323095/',
	'https://calebgannon.com/contest_gallery9-120952/',
	'https://calebgannon.com/contest_gallery10-230592/',
	'https://calebgannon.com/contest_gallery11-321546/',
	'https://calebgannon.com/contest_gallery12-2093420/',
	'https://calebgannon.com/contest_gallery13-89078/',
	'https://calebgannon.com/contest_gallery14-098214/',
	'https://calebgannon.com/contest_gallery15-125608/',
	'https://calebgannon.com/contest_gallery16-124784/',
	'https://calebgannon.com/contest_gallery17-1275563/',
	'https://calebgannon.com/contest_gallery18-044661/',
	'https://calebgannon.com/contest_gallery19-111128/',
	'https://calebgannon.com/contest_gallery20-1245025/'
];
let tempLinks = links.slice(0);
const numberToSend = 3;


module.exports = {
	name: 'vote',
	permission: 'none',
	description: 'Set up a distribution message',
	examples: ['pollhelper start TestPoll Option1 Option2 Option3 Option4'],
	async execute(message) {
		if (message.guild.id !== '626215981387350057' && message.guild.id !== '720680322869755934') return;
		let thingyToSend = 'Vote in these 3 galleries! Caleb also made a YouTube video to explain (https://youtu.be/Shjf-PGTKN4)';
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