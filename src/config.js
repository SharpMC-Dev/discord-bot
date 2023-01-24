require('dotenv/config');

module.exports = {
  //  General bot information
  test: false,
  bot: {
    token: process.env.TOKEN, // Edit ".env" to change this value
    tatsu_token: process.env.TATSU_TOKEN,
    db_uri: process.env.MONGO_URI, // Edit ".env" to change this value
    guildId: '1064696443102826536', // The ID of the server the bot works in
    brand: {
      name: 'SharpMC', // This will appear at the bottom of all embeds by default
      logo: 'https://media.discordapp.net/attachments/1062842711750742126/1064697937415901315/sharpmc.png', // This will appear at the bottom of all embeds by default
    },
  },

  //  The hex values of the colors the bot will use
  //  Value should be: #XXXXXX
  colors: {
    embeds: {
      default: '#49B5D8', // The default embed color
      boost: '#8C6AD8', // The color of the boost message embed
      success: '#32a852',
      failure: '#ed3532',
    },
  },

  //   Toggleable features
  //   Values of "true" or "false" only
  features: {
    messaging: {
      boost_messages: false, // Sends a message when a member boosts the server
      join_messages: false, // Sends a message when a member joins the server
      leave_messages: false, // Sends a message when a member leaves the server
    },
    moderation: {
      log_actions: true, // Logs all moderation action to the specified channel
    },
  },

  // Settings for features

  settings: {
    // Chat Games
    chat_games: {
      unscramble: {
        questions: [
          {
            id: 1,
            word: 'chathub',
          },
          {
            id: 2,
            word: 'discord',
          },
          {
            id: 3,
            word: 'chat',
          },
          {
            id: 4,
            word: 'channel',
          },
          {
            id: 5,
            word: 'announcement',
          },
          {
            id: 6,
            word: 'bots',
          },
          {
            id: 7,
            word: 'coins',
          },
          {
            id: 8,
            word: 'giveaway',
          },
          {
            id: 9,
            word: 'events',
          },
        ],
      },
      math: {},
      trivia: {},
    },
    // Leveling
    leveling: {
      level_perks: {
        shout: 40,
        chat_games: 60,
        ticket_priority: 70,
      },

      xp_multiplier: 1.0, // Multiply each amount of gained xp by this amount
      xp_min_per_message: 50, // The amount of XP a user will earn per message
      xp_max_per_message: 150, // The max amount of xp a user can gain on one message
      required_xp: 1000, // XP = level * 4(required_xp) EXAMPLE: Required XP for level 6 = 6000xp (at 1000) [4(1000 [rate]) = 4000 * 6 [level] = 24k required xp]
      roles: {
        '5': '953733957848006716', // 'Level': 'role id'
        '10': '953733989775056936', // 'Level': 'role id'
        '20': '953734050194022420', // 'Level': 'role id'
        '30': '953734056162500700', // 'Level': 'role id'
        '40': '953734116019437618', // 'Level': 'role id'
        '50': '953734144054161519', // 'Level': 'role id'
        '60': '953734169257717831', // 'Level': 'role id'
        '70': '953734192464810085', // 'Level': 'role id'
        '80': '953734214803656704', // 'Level': 'role id'
        '90': '953734243257827378', // 'Level': 'role id'
        '100': '953734250560110793', // 'Level': 'role id'
      },
    },
    // Tickets
    tickets: {
      ticket_embed_channel: '1064696443790692417', // Where the main Ticket embed will send
      ticket_category: '1064696443790692416', // Where all new Tickets will go
      ticket_archive_category: '1064703158787506237', // Where all closed Tickets will go
      open_ticket_emoji: '🎟️', // The emoji that appears in the button to open a new ticket
      close_ticket_emoji: '❌', // The emoji that appears in the button to close an existing ticket
      upgrade_ticket_emoji: '⬆️',
    },

    // Reaction roles
    reaction_roles: {
      // emoji : role
      role_embeds: [
        {
          embed_title: 'Updates',
          embed_color: '#49B5D8',
          roles: {
            '1064700189027340380': '1064696443102826537',
          },
        },
      ],
    },
  },

  //  All messages the bot sends

  // PLACEHOLDERS:
  // {clientTag} will be replaced by the bot's tag
  // {target} will be replaced with the target user's mention
  // {targetTag} will be replaced by the target user's tag (User#0000)
  // {ex} will be replaced with the executing user's mention *
  // {exTag} will be replaced by the executing user's tag (User#0000) *
  // {key} CHANNELS ONLY: will be replaced by the ID set for that key EXAMPLE: {required.boost_message_channel} or {optional.optional_channel_key}
  // {guild} will be replaced by the running guild's ID
  // {guildName} will be replaced by the running guild's name
  // {memberCount} will be replaced by the running guild's member count (if available)
  // {boosterCount} will be replaced by the running guild's booster count (if available) **

  // {action} PUNISHMENTS ONLY: will be replaced by the past tense of the action taken "banned", "kicked", etc
  // {reason} PUNISHMENTS ONLY: will be replaced by the punishment reason, or messages.moderation.default_reason

  // FOR HYPERLINKS, USE THIS FORMAT: [text](url)
  // * - Executing user = the user the initiated the command
  // ** - Due to Discord limitations, boosterCount uses the amount of users with the booster_role

  messages: {
    bot: {
      successfully_logged_in: '{clientTag} is logged in!',
    },
    boost_message: {
      boost_embed_title: '{targetTag} just boosted the server!',
      boost_embed_description: 'Thank you for boosting, {target}!\n\nCurrent Boosters: ** {boosterCount} **',
    },
    join_message: {
      join_embed_title: 'Someone just joined the server!',
      join_embed_description: 'Welcome to the server, {target}!\n\nWe now have **{memberCount}** members!',
    },
    leave_message: {
      leave_embed_title: '{targetTag} just left the server.',
      leave_embed_description: 'We now have **{memberCount}** members.',
    },
    moderation: {
      default_reason: 'No reason was provided. \n\n{guildName}', // If a reason isn't provided
      action_log_message: '{targetTag} was {action} by {exTag} for {reason}', // This will send in channels.required.mod_logs_channel
      warning_success: 'Successfully warned {target} for {reason}', // Sent to the user when their warning successfully goes through

      warning_notification_embed_title: 'You were warned by {exTag}', // Sent to the target of a warning
      warning_notification_embed_description: 'You were warned by {exTag} for `{reason}` in {guildName}', // Sent to the target of a warning
    },
    leveling: {
      level_up_message: '{ex}, you leveled up! New level: **{userLevel}**', // Will be sent in chat when a user levels up (USE EXECUTING USER PLACEHOLDERS) (Special placeholders: {levelRole} & {userLevel})
      level_role_add_message: '{ex}, you unlocked a new role: {levelRole}', // Lets the user know they gained a new level role (Special placeholders: {levelRole} & {userLevel})
    },
    // Placeholders not supported in Tickets.
    tickets: {
      open_ticket_embed_title: 'Open a new Ticket',
      open_ticket_embed_description: 'Press the button below to open a new Ticket!',
    },
    // Placeholders not supported in Tickets.
  },

  //   The IDs of the channels the bot will use
  //   Duplicate channels are OK
  channels: {
    required: {
      boost_message_channel: '', // The channel where boost messages will be sent
      join_message_channel: '', // The channel where welcome messages will be sent
      leave_message_channel: '', // The channel the bot will use when a member leaves the server
      boost_perks_channel: '', // The channel that contains the list of booster perks
      mod_logs_channel: '1064696444075921455', // Where the bot will send all moderation/audit logs
      reaction_role_channel: '1064696443593572391', // Where users will go to get reaction roles
      // user_verify_channel: '991176436222275594',
      // staff_selfie_verification: '1008087091621679156',
    },
    optional: {
      // feedback_channel: '',
    },
  },

  //   The IDs of the roles the bot will use
  //   Duplicate roles are OK
  roles: {
    required: {
      booster_role: '1064696443102826539', // The automatically assigned role for those who boost the server. This role is assigned by Discord and cannot be removed.
      support_team: '1064696443102826543', // This role will have access to all tickets
      chatter_role: '1064700994375651401',
      chat_revival_role: '1064696443119620138',
      ticket_admin_role: '1064696443102826545',
    },
    optional: {},
  },
};
