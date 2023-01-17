class Command {
  constructor(client, params = {}) {
    this.client = client;

    this.name = params.name;
    this.enable = params.enable;
    this.description = params.description;
    this.options = params.options;
  }

  run(args) {
    console.log(`${this.name} didn't provide a run method.`);
  }
}

module.exports = Command;
