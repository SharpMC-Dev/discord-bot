const Discord = require('discord.js'),
  path = require('path'),
  Command = require('../structures/Command.js');
const Embed = require('../utils/Embed.js');
const parseMsg = require('../utils/parseMsg.js');

class Warn extends Command {
  constructor(client) {
    super(client, {
      name: 'warn',
      description: 'Warn a user for breaking the rules',
      options: [
        {
          name: 'target',
          type: 'USER',
          description: 'The user you would like to warn',
          required: true,
        },
        {
          name: 'reason',
          type: 'STRING',
          description: 'The reason for warning',
          required: true,
        },
      ],
    });
    this.enable = true;

    this.auditLogger = new (require('../utils/auditLogger'))(client);
  }

  async run({ client, member, interaction, user, reason }) {
    let messages = client.config.messages;

    let ctx = {
      guild: interaction.guild,
      executingUser: member,
      targetUser: user,
      punishment: { reason: reason, action: 'warned' },
    };

    let auditLog = {
      isWarning: true,
      target: user,
      reason,
      executor: member,
    };

    let warnEmbed = new Embed()
      .setTitle(await parseMsg(messages.moderation.warning_notification_embed_title, ctx))
      .setDescription(await parseMsg(messages.moderation.warning_notification_embed_description, ctx))
      .build();

    user
      .send({ embeds: [warnEmbed] })
      .then(async () => {
        interaction.reply({
          ephemeral: true,
          content: await parseMsg(messages.moderation.warning_success, ctx),
        });
      })
      .catch(async err => {
        interaction.reply({
          ephemeral: true,
          content: "`I wasn't able to message the user, but the warning was still logged.`\n\n" + (await parseMsg(messages.moderation.warning_success, ctx)),
        });
      });

    if (!client.config.features.moderation.log_actions) return;
    this.auditLogger.log(auditLog, false);
  }
}

module.exports = Warn;
