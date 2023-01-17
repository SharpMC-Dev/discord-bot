const { MessageActionRow, MessageButton } = require('discord.js');
const Embed = require('./Embed');

class TicketManager {
  constructor(client) {
    this.client = client;
    this.embedChannel = this.client.config.settings.tickets.ticket_embed_channel;
    this.category = this.client.config.settings.tickets.ticket_category;
    this.archiveCategory = this.client.config.settings.tickets.ticket_archive_category;
    this.staffRole = this.client.config.roles.required.support_team;
  }

  async buildOpenTicketRow() {
    const row = new MessageActionRow().addComponents(new MessageButton().setCustomId('open-ticket').setEmoji(this.client.config.settings.tickets.open_ticket_emoji).setStyle('SECONDARY'));

    return row;
  }

  async buildCloseTicketRow() {
    const row = new MessageActionRow().addComponents(new MessageButton().setCustomId(`close-ticket`).setEmoji(this.client.config.settings.tickets.close_ticket_emoji).setStyle('SECONDARY'));

    return row;
  }

  async buildDeleteArchiveRow() {
    const row = new MessageActionRow().addComponents(new MessageButton().setCustomId(`delete-ticket`).setEmoji('🗑️').setStyle('DANGER'));

    return row;
  }

  async buildOpenTicketEmbed() {
    let embed = new Embed().setTitle(this.client.config.messages.tickets.open_ticket_embed_title).setDescription(this.client.config.messages.tickets.open_ticket_embed_description).build();

    return embed;
  }

  async sendOpenEmbed() {
    let embed = await this.buildOpenTicketEmbed();
    let actionRow = await this.buildOpenTicketRow();

    let channel = this.client.guilds.cache.get(this.client.config.bot.guildId).channels.cache.get(this.embedChannel);

    let dbGuild = await this.client.DB.findGuild(this.client.config.bot.guildId);
    if (!dbGuild) {
      await this.client.DB.createGuild(this.client.config.bot.guildId);
    }

    if (dbGuild?.ticketMessageId) {
      let msg = await channel.messages.fetch(dbGuild.ticketMessageId);
      msg.delete();

      return channel.send({ embeds: [embed], components: [actionRow] }).then(m => {
        dbGuild.ticketMessageId = m.id;
        dbGuild.save();
      });
    } else {
      return channel.send({ embeds: [embed], components: [actionRow] }).then(m => {
        dbGuild.ticketMessageId = m.id;
        dbGuild.save();
      });
    }
  }

  async getTicket(ticket) {
    return await this.client.DB.findTicket(ticket.id, false);
  }

  async createTicket(guild, user) {
    return await guild.channels.create(`ticket-${user.tag}`, {
      parent: this.category,
      permissionOverwrites: [
        {
          id: this.client.user.id,
          type: 'member',
          allow: ['ADMINISTRATOR'],
        },
        {
          id: guild.id,
          type: 'role',
          deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
        },
        {
          id: user.id,
          type: 'member',
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'ATTACH_FILES', 'EMBED_LINKS', 'USE_EXTERNAL_EMOJIS'],
        },
        {
          id: this.staffRole,
          type: 'role',
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'ATTACH_FILES', 'EMBED_LINKS', 'USE_EXTERNAL_EMOJIS'],
        },
      ],
    });
  }

  async closeTicket(ticket, user, i) {
    let dbTicket = await this.getTicket(ticket);
    if (!dbTicket)
      return i.reply({
        ephemeral: true,
        content: 'This ticket is already closed.',
      });
    await this.client.DB.updateUserTicket(dbTicket.userId, false);

    let closedEmbed = new Embed().setDescription(`This ticket was closed by ${user}. It was originally opened by <@${dbTicket.userId}>\n\nPress 🗑️ to delete this archive.`).build();

    i.deferUpdate();
    i.channel.send({
      // content: `**Like how we did? Want to help us improve? Submit feedback here: https://chathubfeedback.com/?id=${dbTicket.userId}**`,
      embeds: [closedEmbed],
      components: [await this.buildDeleteArchiveRow()],
    });

    dbTicket.remove();
    ticket.setName(`archived-${ticket.name}`);
    return ticket.setParent(this.archiveCategory, { lockPermissions: true });
  }

  async sendWelcomeMessage(user, ticket) {
    let embed = new Embed()
      .setDescription(`Hello, ${user}! Please be patient and a member of <@&${this.staffRole}> will be with you soon.\n\nPress the ${this.client.config.settings.tickets.close_ticket_emoji} button below any time to close this ticket.`)
      .build();

    await ticket.send({
      content: `${user}`,
      embeds: [embed],
      components: [await this.buildCloseTicketRow()],
    });
  }

  // might be used later.
  async logTicketMessage(message, ticket) {
    let author = await message.guild.members.fetch(message.author.id).user;
    let embed = new Embed().setTitle(author.tag).setThumbnail(author.avatarURL()).setDescription(message.content).setColor(author.accentColor).build();

    ticket.send(embed);
  }
}

module.exports = TicketManager;
