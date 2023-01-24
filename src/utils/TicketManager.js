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

  async buildTicketOptionsRow() {
    const row = new MessageActionRow().addComponents([
      new MessageButton().setCustomId(`upgrade-ticket`).setEmoji(this.client.config.settings.tickets.upgrade_ticket_emoji).setStyle('SECONDARY').setLabel('Escalate Ticket'),
      new MessageButton().setCustomId(`close-ticket`).setEmoji(this.client.config.settings.tickets.close_ticket_emoji).setStyle('SECONDARY').setLabel('Close Ticket'),
    ]);

    return row;
  }

  async buildTicketOptionsRowWithoutUpgrade() {
    const row = new MessageActionRow().addComponents([new MessageButton().setCustomId(`close-ticket`).setEmoji(this.client.config.settings.tickets.close_ticket_emoji).setStyle('SECONDARY').setLabel('Close Ticket')]);

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

  async addUserToTicket(user, ticket, interaction) {
    let userPerms = ticket.permissionsFor(user).toArray();
    if (userPerms.includes('VIEW_CHANNEL')) return interaction.reply({ ephemeral: true, content: `${user} is already a member of this ticket.` });
    ticket.permissionOverwrites
      .create(
        user,
        {
          'VIEW_CHANNEL': true,
          'SEND_MESSAGES': true,
          'READ_MESSAGE_HISTORY': true,
          'ATTACH_FILES': true,
          'EMBED_LINKS': true,
          'USE_EXTERNAL_EMOJIS': true,
        },
        1
      )
      .then(c => {
        interaction.channel.send({ embeds: [new Embed().setDescription(`${interaction.user} added ${user} to the ticket.`).build()], ephemeral: true });

        interaction.reply({ embeds: [new Embed().setDescription(`Successfully added ${user} to the ticket!`).build()], ephemeral: true });
      });
  }

  async removeUserFromTicket(user, ticket, interaction) {
    let userPerms = ticket.permissionsFor(user).toArray();

    if (!userPerms.includes('VIEW_CHANNEL')) return interaction.reply({ ephemeral: true, content: `${user} is not a member of this ticket.` });

    ticket.permissionOverwrites
      .create(
        user,
        {
          'VIEW_CHANNEL': false,
          'SEND_MESSAGES': false,
          'READ_MESSAGE_HISTORY': false,
          'ATTACH_FILES': false,
          'EMBED_LINKS': false,
          'USE_EXTERNAL_EMOJIS': false,
        },
        1
      )
      .then(c => {
        interaction.channel.send({ embeds: [new Embed().setDescription(`${interaction.user} removed ${user} from the ticket.`).build()], ephemeral: true });

        interaction.reply({ embeds: [new Embed().setDescription(`Successfully removed ${user} from the ticket!`).build()], ephemeral: true });
      });
  }

  async upgradeTicket(ticket, interaction, user) {
    let adminRoleId = this.client.config.roles.required.ticket_admin_role;
    let staffRoleId = this.client.config.roles.required.support_team;

    ticket.permissionOverwrites.create(
      adminRoleId,
      {
        'VIEW_CHANNEL': true,
        'SEND_MESSAGES': true,
        'READ_MESSAGE_HISTORY': true,
        'ATTACH_FILES': true,
        'EMBED_LINKS': true,
        'USE_EXTERNAL_EMOJIS': true,
      },
      0
    );

    ticket.permissionOverwrites.create(
      staffRoleId,
      {
        'VIEW_CHANNEL': false,
        'SEND_MESSAGES': false,
        'READ_MESSAGE_HISTORY': false,
        'ATTACH_FILES': false,
        'EMBED_LINKS': false,
        'USE_EXTERNAL_EMOJIS': false,
      },
      0
    );

    let msgs = await ticket.messages.fetch();
    msgs.first().edit({ components: this.buildTicketOptionsRowWithoutUpgrade() });

    interaction.reply({ embeds: [new Embed().setDescription(`Successfully upgraded the ticket!`).build()], ephemeral: true });
    interaction.channel.send({ embeds: [new Embed().setDescription(`${user} upgraded the ticket.`).build()], ephemeral: true });
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
      embeds: [closedEmbed],
      components: [await this.buildDeleteArchiveRow()],
    });

    dbTicket.remove();
    ticket.setName(`archived-${ticket.name}`);
    let msgs = await ticket.messages.fetch();
    msgs.first().edit({ components: [] });
    return ticket.setParent(this.archiveCategory, { lockPermissions: true });
  }

  async sendWelcomeMessage(user, ticket) {
    let embed = new Embed().setDescription(`Hello, ${user}! Please be patient and a member of <@&${this.staffRole}> will be with you soon.`).build();

    let tMsg = await ticket.send({
      content: `${user}`,
      embeds: [embed],
      components: [await this.buildTicketOptionsRow()],
    });

    tMsg.pin().then(m => {
      let lastSysMsg = m.channel.lastMessage;

      if (lastSysMsg.system) lastSysMsg.delete();
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
