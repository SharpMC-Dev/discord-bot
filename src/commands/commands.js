const Discord = require('discord.js'),
  path = require('path'),
  Command = require('../structures/Command.js');
const Embed = require('../utils/Embed.js');

class CommandList extends Command {
  constructor(client) {
    super(client, {
      name: 'commands',
      description: 'Get a list of usable commands',
    });
  }

  async run({ interaction, client }) {
    let embed = new Embed().setTitle('Available Commands').setDescription(client.commands.map(x => `/**${x.name}**\u2008\u2008${x.options ? x.options.map(o => `\`${o.name}\``).join('\u2008\u2008') : ''} *- ${x.description}*`).join('\n\n'));

    interaction.reply({ embeds: [embed] });
  }
}

module.exports = CommandList;
