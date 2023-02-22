const Discord = require('discord.js');

module.exports = async client => {
  let clientCommands = client.commands;
  let appCommands = client.application.commands;
  let commands = await appCommands.fetch();

  // appCommands.create({
  //   name: 'Get Data',
  //   type: 'MESSAGE',
  // });

  let builder = {};

  clientCommands.each(cmd => {
    let c = commands.find(cm => cm.name === cmd.name);

    if (!c) {
      appCommands
        .create({
          name: cmd.name,
          description: cmd.description,
          options: cmd.options,
          type: 'CHAT_INPUT',
        })
        .then(app => {
          console.log(`Loaded slash command: ${app.name}`);
        });
    } else {
      if (c.description !== cmd.description) builder.description = cmd.description;
      if (c.options !== cmd.options) builder.options = cmd.options;

      if (c.description !== cmd.description || c.options !== cmd.options) c.edit(builder);
    }

    console.log(`dealt with command: ${cmd.name}`);
  });
};
