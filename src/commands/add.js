const Discord = require('discord.js');
const Embed = require('../utils/Embed.js');
const Command = require('../structures/Command.js');
const TicketManager = require('../utils/TicketManager.js');

class Announce extends Command {
  constructor(client) {
    super(client, {
      name: 'add',
      description: 'Add a user to a ticket',
      options: [
        {
          name: 'target',
          type: 'USER',
          description: 'The user to add',
          required: true,
        },
      ],
    });

    this.TicketManager = new TicketManager(client);
  }

  async run({ channel, member, interaction, message, user }) {
    let isTicket = await this.TicketManager.getTicket(interaction.channel);
    console.log(isTicket);
    if (!isTicket)
      return interaction.reply({
        ephemeral: true,
        content: 'This command can only be used in open tickets.',
      });

    this.TicketManager.addUserToTicket(user, interaction.channel, interaction);
  }
}

module.exports = Announce;
