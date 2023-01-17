class ChatGames {
  constructor(client) {
    this.client = client;
  }

  scrambler(str) {
    str = str.split('');
    for (var b = str.length - 1; 0 < b; b--) {
      var c = Math.floor(Math.random() * (b + 1));
      var d = str[b];
      str[b] = str[c];
      str[c] = d;
    }
    return str.join('');
  }

  scramble() {
    let words = this.client.config.settings.chat_games.unscramble.questions;
    let i = Math.floor(Math.random() * words.length);

    return { correctWord: words[i].word, scrambledWord: this.scrambler(words[i].word) };
  }

  math() {
    let operation = ['+', '-'];
    operation = operation[Math.floor(Math.random() * operation.length)];
    let r1 = Math.floor(Math.random() * 1000);
    let r2 = Math.floor(Math.random() * 1000);

    if (r1 < r2) operation = '+';

    return { equation: `${r1} ${operation} ${r2}`, answer: operation === '+' ? parseInt(r1 + r2) : parseInt(r1 - r2) };
  }
}

module.exports = ChatGames;
