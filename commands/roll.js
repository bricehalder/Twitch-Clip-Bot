// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const {Command} = require('./command');
const {prefix} = require('../config.json');

module.exports = {
  Roll:
    class Roll extends Command {
      constructor() {
        super();
        this.name = 'roll';
        this.aliases = [this.name];
        this.usage = `${prefix}${this.name} [integer]`;
        this.help = 'Rolls a random number.';
        this.description = 'Rolls a random number between 1 and the number provided (default 100).';
      }

      /**
    * Executes the command.
    * @param {string[]} args - The arguments provided for the command.
    * @param {Discord.Message} message - The Discord message calling the command.
    */
      async execute(args, message) {
        if (args.length === 0) {
          message.channel.send(Math.floor((Math.random() * 100) + 1));
        } else {
          const num = Number.parseInt(args[0]);
          if (isNaN(num)) {
            throw Error('Not a number!');
          }
          message.channel.send(Math.floor((Math.random() * num) + 1));
        }
      };
    },
};
