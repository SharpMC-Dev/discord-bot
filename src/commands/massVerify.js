const Discord = require('discord.js'),
  path = require('path'),
  Command = require('../structures/Command.js');

class MassVerify extends Command {
  constructor(client) {
    super(client, {
      name: 'mf',
      description: 'Verify all unverified members',
    });
  }

  async run({ interaction, member, guild, client }) {
    await guild.members.fetch();
    const allMembers = guild.members.cache;

    const msg = await interaction.channel.send(`Starting verification...`);

    allMembers.forEach(member => {
      if (!member.roles.cache.has(client.config.roles.required.chatter_role) && !member.user.bot)
        member.roles.add(client.config.roles.required.chatter_role).then(m => {
          msg.edit(`Verified ${m.user.tag} :+1:`);
        });
    });
  }
}

module.exports = MassVerify;
