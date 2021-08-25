const fs = require('mz/fs');
const { pathToCubeFiles, dataFileName, threeCardFileName } = require('./config.json');

module.exports.CUBEDATA = {};
fs.readdir(pathToCubeFiles,
	{ withFileTypes: true },
	(err, files) => {
		files.forEach(file => {
			fs.readFile(`${pathToCubeFiles}/${file.name}`, function(err, content) {
				module.exports.CUBEDATA[file.name.split('.', 1)[0]] = content.toString().split('\r\n').filter(cardname => cardname != '');
			});
		});
	});
const CUBEDATA = module.exports.CUBEDATA;