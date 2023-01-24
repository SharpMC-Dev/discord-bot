const { MessageActionRow, MessageButton, Modal, TextInputComponent } = require('discord.js');
const Embed = require('../utils/Embed');
const parseMsg = require('../utils/parseMsg');

class InteractionCreate {
  constructor(client) {
    this.client = client;
    this.enable = true;

    this.TicketManager = new (require('../utils/TicketManager'))(this.client);
    this.VerifyManager = new (require('../utils/VerificationManager'))(this.client);
  }

  async run(interaction) {
    const commands = this.client.commands;
    const runningGuild = this.client.guilds.cache.get(this.client.config.bot.guildId);

    if (interaction.isCommand()) {
      let cmd = commands.get(interaction.commandName);
      let channel = interaction.options && interaction.options.getChannel('channel') ? interaction.options.getChannel('channel') : null;
      let user = interaction.options && interaction.options.getUser('target') ? interaction.options.getUser('target') : null;
      let member = interaction.member ? interaction.member : null;
      let message = interaction.options && interaction.options.getString('message') ? interaction.options.getString('message') : null;
      let color = interaction.options && interaction.options.getString('color') ? interaction.options.getString('color') : null;
      let game = interaction.options && interaction.options.getString('game') ? interaction.options.getString('game') : null;
      let ping = interaction.options && interaction.options.getBoolean('ping') ? interaction.options.getBoolean('ping') : null;
      let reason =
        interaction.options && interaction.options.getString('reason')
          ? interaction.options.getString('reason')
          : await parseMsg(this.client.config.messages.moderation.default_reason, {
              guild: interaction.guild,
            });

      cmd.run({
        client: this.client,
        interaction: interaction,
        options: interaction.options,
        channel,
        user,
        reason,
        member,
        message,
        ping,
        color,
        game,
        guild: interaction.guild,
      });
    } else if (interaction.isModalSubmit()) {
      // if (interaction.customId.startsWith('deny-reason-')) {
      //   //deny-reason-msg-member
      //   let parse1 = interaction.customId.split('deny-reason-')[1];
      //   let parse2 = parse1.split('-');
      //   let messageId = parse2[0];
      //   let userId = parse2[1];
      //   let message = await interaction.guild.channels.cache.get(this.client.config.channels.required.staff_selfie_verification).messages.fetch(messageId);
      //   let member = await interaction.guild.members.fetch(userId);
      //   let reason = interaction.components[0].components[0].value;
      //   console.log(`MESSAGE ID: ${message.id}`);
      //   console.log(`MEMBER ID: ${member.id}`);
      //   console.log(`REASON: ${reason}`);
      //   let embed = message.embeds[0];
      //   embed.addFields([{ name: 'Reason', value: `\`\`\`${reason}\`\`\`` }]);
      //   message.edit({ embeds: [embed] });
      //   let newReasonEmbed = new Embed().setTitle('Verification Request').setDescription(`A staff member has added a denial reason:\n\`\`\`${reason}\`\`\`\n\nAdded: <t:${Math.floor(message.editedAt.getTime() / 1000)}:F>`);
      //   member.send({ embeds: [newReasonEmbed] }).then(m => {
      //     interaction.reply({ ephemeral: true, content: `${member} was notified of the denial reason.` });
      //   });
      // }
    } else if (interaction.isButton()) {
      // ButtonInteraction
      if (interaction.customId === 'open-ticket') {
        let dbUser = await this.client.DB.findUser(interaction.user.id);
        if (!dbUser)
          dbUser = await this.client.DB.createUser(interaction.user.id, {
            ticket: true,
          });
        if (dbUser.ticket)
          return interaction.reply({
            ephemeral: true,
            content: 'You already have an open ticket. Close it and try again.',
          });
        this.TicketManager.createTicket(interaction.guild, interaction.user)
          .then(async newTicketChannel => {
            interaction.deferUpdate();
            this.TicketManager.sendWelcomeMessage(interaction.user, newTicketChannel);
            await this.client.DB.createTicket(newTicketChannel.id, interaction.user);
            await this.client.DB.updateUserTicket(interaction.user.id, true);
          })
          .catch(err => {
            console.log(err);
            interaction.reply({
              ephemeral: true,
              content: 'Something went wrong.',
            });
          });
      } else if (interaction.customId === 'upgrade-ticket') {
        let ticket = interaction.channel;
        let user = interaction.user;

        if (!interaction.member.roles.cache.has(this.client.config.roles.required.support_team))
          return interaction.reply({
            ephemeral: true,
            content: `Only <@&${this.client.config.roles.required.support_team}> can upgrade tickets.`,
          });

        this.TicketManager.upgradeTicket(ticket, interaction, user);
      } else if (interaction.customId === 'close-ticket') {
        let ticket = interaction.channel;
        let user = interaction.user;

        this.TicketManager.closeTicket(ticket, user, interaction);
      } else if (interaction.customId === 'delete-ticket') {
        if (!interaction.member.roles.cache.has(this.client.config.roles.required.support_team))
          return interaction.reply({
            ephemeral: true,
            content: `Only <@&${this.client.config.roles.required.support_team}> can delete ticket archives.`,
          });
        interaction.channel.delete();
      } else if (interaction.customId.includes('role-')) {
        const ReactionRoleManager = new (require('../utils/ReactionRoleManager'))(this.client, interaction.guild);
        ReactionRoleManager.giveRole(interaction.customId, interaction.member, interaction);
      }
      // else if (interaction.customId === 'verify-member') {
      //   this.VerifyManager.addChatterRole(interaction.member).then(m => {
      //     interaction.deferUpdate();
      //   });
      // }
      // else if (interaction.customId === 'verify-selfie-send') {
      //   let attachmentURL = interaction.message.embeds[0].image.url;
      //   let newEmbed = new Embed()
      //     .setTitle('Verification Request')
      //     .setDescription(`Successfully sent your verification request. Please wait up to 48 hours for a response.\n\nPlease do not disable \` Allow Direct Messages from Server Members \` until your verification is complete.`)
      //     .setThumbnail(attachmentURL)
      //     .setColor(this.client.config.colors.embeds.success);
      //   interaction.message.edit({ embeds: [newEmbed.build()], components: [] });

      //   let staffEmbed = new Embed()
      //     .setTitle(`Verification Request | ${interaction.user.tag}`)
      //     .setImage(attachmentURL)
      //     .addField('Mention', `${interaction.user}`)
      //     .addField('Username', interaction.user.tag)
      //     .addField('Requested Date', `<t:${Math.floor(interaction.message.createdAt.getTime() / 1000)}:d>`)
      //     .setFooter(`User ID: ${interaction.user.id}`)
      //     .build();

      //   let channel = runningGuild.channels.cache.get(this.client.config.channels.required.staff_selfie_verification);
      //   let row = new MessageActionRow().addComponents([
      //     new MessageButton().setCustomId(`selfie-verify-${interaction.user.id}`).setLabel('Accept').setStyle('SUCCESS'),
      //     new MessageButton().setCustomId(`staff-deny-selfie-${interaction.user.id}`).setLabel('Deny').setStyle('DANGER'),
      //   ]);

      //   channel.send({ embeds: [staffEmbed], components: [row] });
      // }
      // else if (interaction.customId === 'deny-selfie-send') {
      //   let newEmbed = new Embed().setTitle('Verification Request').setDescription(`Successfully cancelled your verification request. You may resubmit any time.`).setColor(this.client.config.colors.embeds.failure);
      //   interaction.message.edit({ embeds: [newEmbed.build()], components: [] });
      // }
      // else if (interaction.customId.startsWith('selfie-verify-')) {
      //   let userId = interaction.customId.split('selfie-verify-')[1];
      //   let member = await interaction.guild.members.fetch(userId);
      //   let verifiedRole = interaction.guild.roles.cache.get(this.client.config.roles.required.selfie_verified);
      //   let attachmentURL = interaction.message.embeds[0].image.url;

      //   let newEmbed = new Embed()
      //     .setTitle(`Verification Request | ${member.user.tag}`)
      //     .setDescription(`Approved by ${interaction.member} on <t:${Math.floor(interaction.message.createdAt.getTime() / 1000)}:d>`)
      //     .addField('Mention', `${member}`)
      //     .addField('Username', member.user.tag)
      //     .addField('Requested Date', `<t:${Math.floor(interaction.message.createdAt.getTime() / 1000)}:d>`)
      //     .setFooter(`User ID: ${member.user.id}`)
      //     .setThumbnail(attachmentURL)
      //     .setColor(this.client.config.colors.embeds.success);
      //   interaction.message.edit({ embeds: [newEmbed.build()], components: [] }).then(msg => {
      //     newEmbed.setDescription(`Approved by ${interaction.member} on <t:${Math.floor(msg.editedAt.getTime() / 1000)}:F>`);

      //     msg.edit({ embeds: [newEmbed.build()], components: [] });

      //     member.roles.add(verifiedRole).then(m => {
      //       interaction.reply({ ephemeral: true, content: `Successfully added ${m} to the ${verifiedRole} role!` });
      //     });

      //     let approvedEmbed = new Embed()
      //       .setTitle('Verification Request')
      //       .setColor(this.client.config.colors.embeds.success)
      //       .setDescription(`Your verification request was approved on <t:${Math.floor(msg.editedAt.getTime() / 1000)}:F>! Enjoy our selfie channels!`);

      //     member.send({ embeds: [approvedEmbed] });
      //   });
      // }
      // else if (interaction.customId.startsWith('staff-deny-selfie-')) {
      //   let userId = interaction.customId.split('staff-deny-selfie-')[1];
      //   let member = await interaction.guild.members.fetch(userId);
      //   let attachmentURL = interaction.message.embeds[0].image.url;

      //   let newEmbed = new Embed()
      //     .setTitle(`Verification Request | ${member.user.tag}`)
      //     .setDescription(`Denied by ${interaction.member} on <t:${Math.floor(interaction.message.createdAt.getTime() / 1000)}:d>`)
      //     .addField('Mention', `${member}`)
      //     .addField('Username', member.user.tag)
      //     .addField('Requested Date', `<t:${Math.floor(interaction.message.createdAt.getTime() / 1000)}:d>`)
      //     .setFooter(`User ID: ${member.user.id}`)
      //     .setThumbnail(attachmentURL)
      //     .setColor(this.client.config.colors.embeds.failure);
      //   interaction.message.edit({ embeds: [newEmbed.build()], components: [] }).then(msg => {
      //     newEmbed.setDescription(`Denied by ${interaction.member} on <t:${Math.floor(msg.editedAt.getTime() / 1000)}:F>`);

      //     msg.edit({ embeds: [newEmbed.build()], components: [] });

      //     let deniedEmbed = new Embed()
      //       .setTitle('Verification Request')
      //       .setColor(this.client.config.colors.embeds.failure)
      //       .setDescription(`Your verification request was denied on <t:${Math.floor(msg.editedAt.getTime() / 1000)}:F>. You may resubmit any time, but spamming the requests will result in a punishment.`);

      //     member.send({ embeds: [deniedEmbed] }).then(m => {
      //       let modal = new Modal()
      //         .setCustomId(`deny-reason-${msg.id}-${member.id}`)
      //         .setTitle(`Would you like to add a reason?`)
      //         .addComponents(new MessageActionRow().addComponents(new TextInputComponent().setCustomId('reason-modal').setLabel('Reason').setPlaceholder(`Reason for denying ${member.user.tag}`).setStyle('PARAGRAPH')));
      //       interaction.showModal(modal);
      //     });
      //   });
      // }
    }
  }
}

module.exports = InteractionCreate;
