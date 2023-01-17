const Discord = require('discord.js'),
  path = require('path'),
  Command = require('../structures/Command.js');
const Embed = require('../utils/Embed.js');

class ReviveChat extends Command {
  constructor(client) {
    super(client, {
      name: 'revivechat',
      description: 'Revive a dead chat',
    });
  }

  async run({ interaction, member, client }) {
    let embed = new Embed().setDescription(`${member} has called the Chat Revival Service!\n\nSave the chat by talking!`).build();

    interaction.channel.send({ content: `<@&${client.config.roles.required.chat_revival_role}>`, embeds: [embed] }).then(m => interaction.reply({ ephemeral: true, content: 'Called the CRS :+1:' }));
  }
}

module.exports = ReviveChat;
