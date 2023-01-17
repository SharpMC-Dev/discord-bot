const config = require('../config');

function getChannelKey(key) {
  let parsedId = '';
  let parent = key.split(/\./gim)[0];
  let child = key.split(/\./gim)[1];

  parsedId = config.channels[parent][child];

  return parsedId;
}

function getMemberCount(guild) {
  return guild.memberCount || guild.members.cache.size;
}

function getBoosterCount(guild) {
  return guild.members.cache.filter(m =>
    m.roles.cache.has(config.roles.required.booster_role)
  ).size;
}

module.exports = async (msg, context = {}) => {
  /* 
        context?: {
            guild?: Guild,
            executingUser?: GuildMember
            targetUser?: GuildMember,
            client?: Client
        }
    */

  let guild;
  let targetUser;
  let executingUser;
  let client;
  let punishment;
  let levelRole;
  let level;

  if (context && context.guild) guild = context.guild;
  if (context && context.targetUser) targetUser = context.targetUser;
  if (context && context.executingUser) executingUser = context.executingUser;
  if (context && context.client) client = context.client;
  if (context && context.punishment) punishment = context.punishment;
  if (context && context.role) levelRole = context.role;
  if (context && context.level) level = context.level;

  // expected target & executor to be GuildMember

  let placeholders = {
    // target user
    'target': {
      placeholder: targetUser
        ? targetUser.user
          ? `${targetUser.user}`
          : `${targetUser}`
        : '',
    },
    'targetTag': {
      placeholder: targetUser
        ? targetUser.user
          ? targetUser.user.tag
          : targetUser.tag
        : '',
    },
    // executing user
    'ex': {
      placeholder: executingUser
        ? executingUser.user
          ? `${executingUser.user}`
          : `${executingUser}`
        : '',
    },
    'exTag': {
      placeholder: executingUser
        ? executingUser.user
          ? executingUser.user.tag
          : executingUser.tag
        : '',
    },
    // guild
    'guild': {
      placeholder: guild ? guild.id : '',
    },
    'guildName': {
      placeholder: guild ? guild.name : '',
    },
    'memberCount': {
      placeholder: guild ? getMemberCount(guild) : '',
    },
    'boosterCount': {
      placeholder: guild ? getBoosterCount(guild) : '',
    },
    'clientTag': {
      placeholder: client ? client.user.tag : '',
    },
    'reason': {
      placeholder: punishment ? punishment.reason : '',
    },
    'action': {
      placeholder: punishment ? punishment.action : '',
    },
    'levelRole': {
      placeholder: levelRole ? `<@&${levelRole}>` : '', // only used for level roles
    },
    'userLevel': {
      placeholder: level ? `${level}` : '', // only used for leveling
    },
  };

  let channelRegex = /{([^}]*)}/gm;
  let channelFlag = channelRegex.exec(msg);

  let channelFlags = [];
  let finalFlags = {};

  while (channelFlag != null) {
    channelFlags.push(channelFlag[0]);

    channelFlag = channelRegex.exec(msg);
  }

  let parsedFlags = channelFlags
    .join(' ')
    .replace(/channel\-/gim, '')
    .replace(/\{/gim, '')
    .replace(/\}/gim, '')
    .split(/ +/)
    .filter(x => /required\.|optional\./gm.test(x));

  parsedFlags.forEach(flag => {
    let key = getChannelKey(flag);
    finalFlags[flag] = key;
  });

  parsedFlags.forEach(f => {
    let re = new RegExp(f, 'gmi');
    msg = msg.replace(re, finalFlags[f]);
  });

  let flags = msg.split(/{([^}]*)}/);
  flags
    .filter(f => placeholders[f])
    .forEach(flag => {
      let re = new RegExp(flag, 'gm');
      msg = msg
        .replace(re, placeholders[flag].placeholder)
        .replace(/\{/gim, '')
        .replace(/\}/gim, '');
    });

  return msg;
};
