const Bot = require('./structures/Bot');
const sl = require('./utils/socketListener');

const client = new Bot({
  intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_BANS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES'],
  partials: ['CHANNEL'],
  allowedMentions: {
    parse: ['everyone', 'roles', 'users'],
  },
});

client.init();
