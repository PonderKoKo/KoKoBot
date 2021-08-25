const Discord = require('discord.js');
const Canvas = require('canvas');
const fs = require('mz/fs');
const request = require('request');

const { imagesPath } = require('../config.json');
const client = require('../index.js').client;
const CUBEDATA = require('../cubedata.js').cubedata;

const draftData = {};
const packReactions = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴'];

module.exports = {
	name: 'draft',
	permission: 'KoKonuts',
	description: 'draft',
	examples: ['draft'],
	execute(message, args) {
		const vintageCube = [...CUBEDATA['Vintage Cube']];
		draftData.packSize = 15;
		draftData.playerIDs = args;
		draftData.allPacks = [];
		draftData.picks = [];
		draftData.packQueue = [];
		draftData.hasPack = Array(draftData.playerIDs.length).fill(false);
		draftData.doneWithPack = Array(draftData.playerIDs.length).fill(false);
		draftData.clockwise = true;
		for (let i = 0; i < draftData.playerIDs.length; i++) {
			const threePacks = [[], [], []];
			for (const pack of threePacks) {
				for (let j = 0; j < draftData.packSize; j++) {
					pack.push(...vintageCube.splice(Math.floor(Math.random() * vintageCube.length), 1));
				}
			}
			draftData.allPacks.push(threePacks);
			draftData.picks.push([]);
			draftData.packQueue.push([]);
		}
		for (let i = 0; i < draftData.playerIDs.length; i++) {	
			draftData.packQueue[i].push(draftData.allPacks[i].shift());
			checkPlayer(i);
		}
	}
};

function getNextPlayerIndex(i) {
	if (draftData.clockwise) {
		return (i + 1) % draftData.playerIDs.length;
	}
	else {
		let j = i - 1;
		if (j === -1) {
			j = draftData.playerIDs.length - 1;
		}
		return j;
	}
}

async function checkPlayer(i) {
	if (draftData.hasPack[i] || draftData.packQueue[i].length === 0) return;
	draftData.hasPack[i] = true;
	client.users.fetch(draftData.playerIDs[i])
		.then(async user => {
			const filter = (reaction) => {
				return packReactions.includes(reaction.emoji.name) && packReactions.indexOf(reaction.emoji.name) < draftData.packQueue[i][0].length;
			}
			const packMessage = await generateDraftPack(user, draftData.packQueue[i][0]);
			const collector = packMessage.createReactionCollector(filter, { max: 1 });
			collector.on('collect', (reaction, user) => {
				const pickedIndex = packReactions.indexOf(reaction.emoji.name);
				const pickedCard = draftData.packQueue[i][0].splice(pickedIndex, 1)[0];
				draftData.picks[i].push(pickedCard);
				user.send(`You have picked ${pickedCard}!`);
				const passedPack = draftData.packQueue[i].shift();
				if (passedPack.length === 0) {
					if (draftData.picks[i].length === 3 * draftData.packSize) {
						const buffer = Buffer.from(`1 ${draftData.picks[i].join('\n1 ')}`);
						const logAttachment = new Discord.MessageAttachment(buffer, 'draftLog.txt');
						user.send(`The draft has finished, here's your log.`, logAttachment);
					}
					else {
						draftData.doneWithPack[i] = true;
						if (draftData.doneWithPack.every(a => {return a})) {
							draftData.doneWithPack = Array(draftData.playerIDs.length).fill(false);
							draftData.clockwise = !draftData.clockwise;
							for (let i = 0; i < draftData.playerIDs.length; i++) {
								draftData.packQueue[i].push(draftData.allPacks[i].shift());
								checkPlayer(i);
							}
						}
					}
				}
				else {
					draftData.packQueue[getNextPlayerIndex(i)].push(passedPack);
				}
				draftData.hasPack[i] = false;
				checkPlayer(i);
				checkPlayer(getNextPlayerIndex(i));
			});
		});
}

/*
async function sendPackstoPeeps() {
	if (draftData.picks.every(a => {return a.length % 15 === 0}) && draftData.packQueue.every(b => {return b.length === 0})) {
		if (draftData.allPacks[0].length === 0) {
			for (let i = 0; i < draftData.playerIDs.length; i++) {
				client.users.fetch(draftData.playerIDs[i])
					.then(async user => {
						user.send(`The draft has finished. Here's your log:`);
						user.send(draftData.picks[i].join(`\n`));
						});
			}
			clearInterval(draftData.intervalID);
		}
		else {
			draftData.clockwise = !draftData.clockwise;
			for (let i = 0; i < draftData.playerIDs.length; i++) {
				draftData.packQueue[i].push(draftData.allPacks[i].shift());
				checkPlayer(i);
			}
		}
	}
}
*/

async function generateDraftPack(user, cards) {
	const promises = [];
	for (const card of cards) {
		promises.push(Canvas.loadImage(`${imagesPath}${card}.png`).catch((error) => {console.log(`Error with loading a card image (${cardIndex}), error: ${error}`);}));
	}
	const numberOfCards = cards.length;
	const columns = 5;
	const spacing = 10;
	const cardWidth = 149 * 2;
	const cardHeight = 208 * 2;
	const rows = Math.ceil(numberOfCards / columns);
	const canvas = Canvas.createCanvas(columns * (cardWidth + spacing) + spacing, rows * (cardHeight + spacing) + spacing);
	const ctx = canvas.getContext('2d');
	const images = await Promise.allSettled(promises);
	for (let i = 0; i < images.length; i++) {
		if (images[i].status === 'fulfilled') {
			ctx.drawImage(images[i].value, spacing + (i % columns) * (cardWidth + spacing), spacing + Math.floor(i / columns) * (cardHeight + spacing), cardWidth, cardHeight);
		}
	}
	const attachment = await new Discord.MessageAttachment(canvas.toBuffer(), 'CubePack.png');
	return user.send(`Here's your pack!`, attachment);
}

function downloadImage(cardname) {
	console.log('Started downloading ' + cardname);
	const download = (url, downloadPath) => {
		// callback as third parameter
		request.head(url, () => {
			request(url)
				.pipe(fs.createWriteStream(downloadPath));
			//  .on('close', callback);
		});
	};
	const url = 'https://api.scryfall.com/cards/named?format=image&version=png&exact=' + cardname;
	download(url, imagesPath + cardname + '.png');
}
