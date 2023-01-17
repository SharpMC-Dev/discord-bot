const Embed = require('./Embed');

class SocketListener {
  constructor(client, guild) {
    this.client = client;
    this.feedbackChannel = this.client.config.channels.optional.feedback_channel;
    this.runningGuild = guild;
  }

  async feedbackListener(g) {
    console.log('Feedback listening...');
    if (!this.feedbackChannel) return;
    this.client.socket.on('feedback', data => {
      let user = data.userId;
      let staff = data.staffId;
      let review = data.review;
      let rating = data.rating;

      // g.channels.cache
      //   .get(this.feedbackChannel)
      //   .send(`**New Feedback ( ${('<:star_full:995542623274152056> '.repeat(rating) + '<:star_empty:995542622137499708> '.repeat(5 - rating)).trim()} )**\n*From: <@${user}>* \n\n*Staff Member: <@${staff}>* \n\n` + review);
      let embed = new Embed()
        // .setTitle((':star_full: '.repeat(rating) + ':star_empty: '.repeat(5 - rating)).trim())
        .setTitle('**Feedback Received!**')
        .addField('From', `<@${user}>`, true)
        .addField('Staff Member', `<@${staff}>`, true)
        .addField('Rating', ('<:star_full:995542623274152056> '.repeat(rating) + '<:star_empty:995542622137499708> '.repeat(5 - rating)).trim(), true)
        .setTimestamp()

        .addField('Review', review)
        .build();
      g.channels.cache.get(this.feedbackChannel).send({ embeds: [embed] });
      console.log(data);
    });
  }
}

module.exports = SocketListener;
