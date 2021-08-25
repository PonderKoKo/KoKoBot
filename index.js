/* eslint quotes: ["error", "single", { "allowTemplateLiterals": true }] */

const Discord = require('discord.js');
const fs = require('mz/fs');
const fetch = require('node-fetch');
const request = require('request');
const Canvas = require('canvas');
const {
  dataFileName,
  threeCardFileName,
  recordsFileName,
  imagesPath,
  prefix,
  started,
  token,
  timeBetweenRefresh,
  scryfallRequestDelayTime,
  isTest,
} = require('./config.json');

const client = new Discord.Client();
module.exports.client = client;

let spoilerData = {};
const commands = {};

function logging(logMessage, importance = 'default') {
  const TODAY = new Date();
  const DATE = `${TODAY.getFullYear()}-${String((TODAY.getMonth() + 1)).padStart(2, '0')}-${String(TODAY.getDate()).padStart(2, '0')}`;
  const TIME = `${String(TODAY.getHours()).padStart(2, '0')}:${String(TODAY.getMinutes()).padStart(2, '0')}:${String(TODAY.getSeconds()).padStart(2, '0')}`;
  const COLOR = {
    automatic: '\x1b[36m',
    error: '\x1b[31m',
    response: '\x1b[35m',
    supplementary: '\x1b[33m',
    default: '',
    reset: '\x1b[0m',
  };
  console.log(COLOR[importance], `${DATE} ${TIME} -- ${logMessage}`, COLOR.reset);
}

function readFile(filename, callback) {
  logging(`Started reading ${filename}`, 'automatic');
  fs.readFile(`./${filename}`, (err, content) => {
    if (err) {
      logging(`Error with reading file: ${filename}, error: ${err}`, 'error');
      return (callback(err));
    }
    callback(null, content);
  });
}

function writeFile(filename, data) {
  fs.writeFile(`./${filename}`, JSON.stringify(data), (err) => {
    if (err) {
      logging(`Error with writing to file: ${filename}, error: ${err}`, 'error');
    } else {
      logging(`Successfully written to file: ${filename}`, 'automatic');
    }
  });
}

client.once('ready', () => {
  logging('Initializing...');
  readFile(dataFileName, (err, content) => {
    if (err) {
      process.exit(1);
    }
    spoilerData = JSON.parse(content);
    module.exports.spoilerData = spoilerData;
    scryfallAndBackup();
    client.setInterval(scryfallAndBackup, 1000 * 60 * timeBetweenRefresh);
  });
  readFile(threeCardFileName, (err, content) => {
    module.exports.decks = JSON.parse(content);
    readFile(recordsFileName, (err2, content2) => {
      const tmp = JSON.parse(content2);
      if (started && Object.keys(tmp).length === 0) {
        for (const player of Object.keys(module.exports.decks)) {
          tmp[player] = {};
          for (const player2 of Object.keys(module.exports.decks)) {
            if (player === player2) continue;
            tmp[player][player2] = null;
          }
        }
      }
      module.exports.records = tmp;
    });
  });
  fs.readdir('./commands',
    { withFileTypes: true },
    (err, files) => {
      if (err) {
        process.exit(4);
      } else {
        files.forEach((file) => {
          const command = require(`./commands/${file.name}`);
          commands[command.name] = command;
        });
      }
    });
});

client.login(token);

client.on('guildMemberAdd', (member) => {
  if (member.guild.id !== '626215981387350057' || member.user.bot) return;
  logging('Guild member was added');
  client.channels.fetch('626215981387350059')
    .then((channel) => {
      channel.send(`Welcome to the server, <@${member.user.id}>. We have both Custom Card Creation and 3-Card-Magic contests running in this server! Check out <#645407379151781899> if you're interested.`);
      commands.pack.welcome(channel);
    })
    .catch(() => { logging(`Couldn't retrieve welcome channel, no message was sent`, 'error'); });
});

client.on('guildMemberRemove', (member) => {
  if (member.guild.id !== '626215981387350057' || member.user.bot) return;
  client.channels.fetch('626215981387350059')
    .then((channel) => { channel.send(`${member.displayName} left :(. We are now ${String(200 - (member.guild.memberCount % 200))} members away from ${String(200 * (Math.floor(member.guild.memberCount / 200) + 1))}.`); })
    .catch(() => { logging(`Couldn't retrieve welcome channel, no message was sent`, 'error'); });
});

client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot || (isTest === true && message.author.id !== '448472133585207306')) return;
  const args = message.content.slice(prefix.length).replace(/[^0-9a-z ]/gi, '').toLowerCase().split(/ +/);
  const COMMAND = args.shift();
  logging(`The command ${COMMAND} was used with the arguments: ${args.join(' ')}`, 'response');
  if (Object.keys(commands).includes(COMMAND) && (message.author.id === '448472133585207306' || (commands[COMMAND].permission !== 'KoKonuts' && (message.guild === null || commands[COMMAND].permission === 'none' || message.member.hasPermission(commands[COMMAND].permission))))) {
    commands[COMMAND].execute(message, args);
  }
  switch (COMMAND) {
    case 'downloadimages':
      if (message.author.id === '448472133585207306') {
        if (args[0]) {
          downloadAllCardImages(message.content.slice(prefix.length).split(/ +/).splice(1).join(' '));
        } else {
          downloadAllCardImages();
        }
      }
      break;
    case 'testimage':
      if (message.author.id === '448472133585207306' && args[0]) {
        testimage(message.channel, args.join(' '));
      }
      break;
    case 'addset':
      if (message.author.id === '448472133585207306') {
        addSet(args[0], message.content.split(/ +/).splice(2).join(' '), message.channel);
      }
      break;
    case 'startchecking':
      if (message.author.id === '448472133585207306' && args[0]) startChecking(args[0], message.channel);
      break;
    case 'removeset':
      if (message.author.id === '448472133585207306') removeSet(args[0], message.channel);
      break;
    case 'scryfall':
      if (message.author.id === '448472133585207306') scryfallAndBackup();
      break;
    case 'backup':
      if (message.author.id === '448472133585207306') backup();
      break;
    case 'join':
      if (message.author.id === '448472133585207306') client.emit('guildMemberAdd', message.member);
      break;
    case 'leave':
      if (message.author.id === '448472133585207306' || args[0] === 'secret') client.emit('guildMemberRemove', message.member);
      break;
    case 'restart':
      if (message.author.id === '448472133585207306') process.exit(0);
      break;
  }
});

async function testimage(channel, cardname) {
  const cardWidth = 149 * 5;
  const cardHeight = 208 * 5;
  const canvas = Canvas.createCanvas(cardWidth, cardHeight);
  const ctx = canvas.getContext('2d');
  const image = await Canvas.loadImage(`${imagesPath}/${cardname.replace(/(\\|\/|<|>|:|"|\?|\||\*)/g, '')}.png`);
  ctx.drawImage(image, 0, 0, cardWidth, cardHeight);
  channel.send('Here is the currrent card image', new Discord.MessageAttachment(canvas.toBuffer(), 'testimage.png'));
}

function downloadAllCardImages(query = 'color<=WUBRG', startpage = 1) {
  logging(`download all cards called, query: ${query}; startpage: ${String(startpage)}`);
  fetch(`https://api.scryfall.com/cards/search?format=json&include_multilingual=false&order=name&unique=cards&q=${query}`)
    .then((response) => response.json())
    .then((firstRequest) => {
      for (let i = startpage; i <= Math.ceil(firstRequest.total_cards / 175); i++) {
        setTimeout(downloadOneCardPage, (i - startpage) * 175 * 1000, i, query);
      }
    })
    .catch((error) => logging(`Problem with retrieving Scryfall data, error: ${error}`, 'error'));
}

function downloadOneCardPage(pageNo, query) {
  logging(`downloading page: ${pageNo}`);
  fetch(`https://api.scryfall.com/cards/search?format=json&include_multilingual=false&order=name&page=${String(pageNo)}&unique=cards&q=${query}`)
    .then((response) => response.json())
    .then((pageData) => {
      for (const cardID of Object.keys(pageData.data)) {
        setTimeout(downloadCardImage, Number(cardID) * 1000, pageData.data[cardID]);
      }
    })
    .catch((error) => logging(`Problem with retrieving Scryfall data, error: ${error}`, 'error'));
}

function downloadCardImage(card) {
  logging(`started ${card.name}`);
  const download = (url, downloadPath) => {
    // callback as third parameter
    request.head(url, () => {
      request(url)
        .pipe(fs.createWriteStream(downloadPath));
      //  .on('close', callback);
    });
  };
  let url;
  let name;
  if (!Object.keys(card).includes('image_uris')) {
    url = card.card_faces[0].image_uris.png;
  } else {
    url = card.image_uris.png;
  }
  if (Object.keys(card).includes('card_faces')) {
    name = `${card.card_faces[0].name.replace(/(\\|\/|<|>|:|"|\?|\||\*)/g, '')}.png`;
  } else {
    name = `${card.name.replace(/(\\|\/|<|>|:|"|\?|\||\*)/g, '')}.png`;
  }
  download(url, imagesPath + name);
}

function scryfallAndBackup() {
  const ALLSETS = Object.keys(spoilerData.sets);
  for (let i = 0; i < ALLSETS.length; i += 1) {
    const setkey = ALLSETS[i];
    if (spoilerData.sets[setkey].isWatched) {
      client.setTimeout(scryfallRequest, scryfallRequestDelayTime * i, spoilerData.sets[setkey].CODE);
    }
  }
  client.setTimeout(backup, scryfallRequestDelayTime * ALLSETS.length);
}

function backup() {
  writeFile(dataFileName, spoilerData);
  writeFile(threeCardFileName, module.exports.decks);
  writeFile(recordsFileName, module.exports.records);
}

function addSet(setcode, name, channel) {
  const SETKEY = `SET${setcode.toUpperCase()}`;
  if (!Object.keys(spoilerData.sets).includes(SETKEY)) {
    spoilerData.sets[SETKEY] = {
      isWatched: false,
      CODE: setcode.toUpperCase(),
      name,
      channelIDs: spoilerData.autowatch,
      cardIDs: {},
    };
    channel.send(`The set ${setcode} was added`);
  } else {
    channel.send(`The set ${setcode} already existed`);
  }
}

function startChecking(setcode, channel) {
  const SETKEY = `SET${setcode.toUpperCase()}`;
  if (Object.keys(spoilerData.sets).includes(SETKEY)) {
    if (spoilerData.sets[SETKEY].isWatched) {
      channel.send(`The set ${setcode} was already being checked`);
    } else {
      spoilerData.sets[SETKEY].isWatched = true;
      channel.send(`The set ${setcode} is now being checked`);
    }
  } else {
    channel.send(`The set ${setcode} didn't exist`);
  }
}

function removeSet(setcode, channel) {
  const SETKEY = `SET${setcode.toUpperCase()}`;
  if (Object.keys(spoilerData.sets).includes(SETKEY)) {
    delete spoilerData.sets[SETKEY];
    channel.send(`The set ${setcode} was removed`);
  } else {
    channel.send(`The set ${setcode} didn't exist`);
  }
}

function scryfallRequest(setcode) {
  const SETKEY = `SET${setcode.toUpperCase()}`;
  logging(`Starting request to Scryfall, setcode is: ${setcode}`, 'automatic');
  let url = `https://api.scryfall.com/cards/search?format=json&include_extras=false&include_multilingual=false&order=set&page=1&q=set%3A${setcode}&unique=prints`;
  let further = false;
  do {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        further = data.has_more;
        if (further) {
          url = data.next_page;
        }
        for (const card of data.data) {
          if (!(Object.prototype.hasOwnProperty.call(spoilerData.sets[SETKEY].cardIDs, card.id))) {
            let message = '';
            spoilerData.sets[SETKEY].cardIDs[card.id] = [];
            if (card.name.charAt(0) === '"') {
              if (Object.prototype.hasOwnProperty.call(card, 'mana_cost') && card.mana_cost != '') {
                message += `**${card.name}** - ${card.mana_cost}` + '\n';
              } else {
                message += `**${card.name}**` + '\n';
              }
              message += `${card.type_line} (${card.rarity})` + '\n';
              if (Object.prototype.hasOwnProperty.call(card, 'oracle_text') && card.oracle_text != '') {
                message += `${card.oracle_text}\n`;
              }
              if (Object.prototype.hasOwnProperty.call(card, 'power') && Object.prototype.hasOwnProperty.call(card, 'toughness')) {
                message += `**${card.power}/${card.toughness}**` + '\n';
              }
            } else {
              message += `**${card.name}**` + '\n';
            }
            if (Object.prototype.hasOwnProperty.call(card.image_uris, 'png') && card.image_uris.png != '' && card.image_uris.png != 'https://c2.scryfall.com/file/scryfall-errors/soon.jpg') {
              message += `${card.image_uris.png}\n`;
            } else if (Object.prototype.hasOwnProperty.call(card.image_uris, 'large') && card.image_uris.large != '' && card.image_uris.large != 'https://c2.scryfall.com/file/scryfall-errors/soon.jpg') {
              message += `${card.image_uris.large}\n`;
            } else if (Object.prototype.hasOwnProperty.call(card.image_uris, 'normal') && card.image_uris.normal != '' && card.image_uris.normal != 'https://c2.scryfall.com/file/scryfall-errors/soon.jpg') {
              message += `${card.image_uris.normal}\n`;
            } else {
              logging(`Card: ${card.name} did not have an image. (${setcode})`, 'supplementary');
              continue;
            }
            if (!isTest) {
              for (const channelID of spoilerData.sets[SETKEY].channelIDs) {
                const channel = client.channels.cache.get(channelID);
                channel.send(message);
              }
            }
            spoilerData.sets[SETKEY].cardIDs[card.id] = message.split('\n');
            logging(`Card: ${card.name} was sent to channels. (${setcode})`, 'supplementary');
          }
        }
      })
      .catch((error) => logging(`Problem with retrieving Scryfall data, error: ${error}`, 'error'));
  } while (further);
}