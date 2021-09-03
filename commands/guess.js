const operators = {
  basic: [':', '='],
  arithmetic: [':', '=', '>', '<', '>=', '<=', '!=']
}

const weights = {
  common: 30,
  uncommon: 9,
  rare: 3,
  mythic: 1
}

const keywords = {
  color: { aliases: ['color', 'c'], operators: operators.arithmetic, weight: weights.common },
  identity: { aliases: ['identity', 'id'], operators: operators.arithmetic, weight: weights.rare },
  has: { aliases: ['has'], operators: operators.basic, weight: weights.mythic },
  type: { aliases: ['type', 't'], operators: operators.basic, weight: weights.common },
  oracle: { aliases: ['oracle', 'o'], operators: operators.basic, weight: weights.common },
  fo: { aliases: ['fo'], operators: operators.basic, weight: weights.rare },
  keyword: { aliases: ['keyword', 'kw'], operators: operators.basic, weight: weights.rare },
  mana: { aliases: ['mana', 'm'], operators: operators.arithmetic, weight: weights.common },
  manavalue: { aliases: ['manavalue', 'mv', 'cmc'], operators: operators.arithmetic, weight: weights.uncommon },
  is: { aliases: ['is'], operators: operators.basic, weight: weights.rare },
  devotion: { aliases: ['devotion'], operators: operators.arithmetic, weight: weights.mythic },
  produces: { aliases: ['produces'], operators: operators.arithmetic, weight: weights.mythic }
}

const games = {}

module.exports = {
  name: 'guess',
  permission: 'KoKonuts',
  description: 'Lets you play the guessing game',
  examples: ['guess'],
  execute (message, args) {
    if (!Object.keys(games).includes(message.channel.id)) {

    }
  }
}
