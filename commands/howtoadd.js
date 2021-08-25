module.exports = {
	name: 'howtoadd',
	permission: 'none',
	description: 'Gives instructions on how to add this bot, as well as the client ID necessary for the process',
	examples: ['howtoadd'],
	execute(message) {
		message.channel.send(`To add a bot to your server, you must be an administrator in that server.
The client_ID of this bot is 720678773317435553. You can either click on this link and follow the instructions:
https://discord.com/oauth2/authorize?client_id=720678773317435553&scope=bot&permissions=0
Or if clicking on links and logging into Discord sounds fishy, you can also google how to add a bot and use the given clientID.`);
	},
};