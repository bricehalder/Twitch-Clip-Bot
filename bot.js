const Discord = require('discord.js');
const SQLite = require('better-sqlite3');
const config = require('./config.json');
const {commands} = require('./commands/commands');

const client = new Discord.Client();
const sql = new SQLite('./scores.sqlite');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const guildList = client.guilds.cache.array();
  guildList.forEach((guild) => console.log(guild.name));

  const table = sql.prepare(
      'SELECT count(*) \
       FROM sqlite_master \
       WHERE type=\'table\' AND name = \'scores\';').get();

  if (!table['count(*)']) {
    sql.prepare(
        'CREATE TABLE scores ( \
          id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER \
        );').run();
    sql.prepare('CREATE UNIQUE INDEX idx_scores_id ON scores (id);').run();
    sql.pragma('synchronous = 1');
    sql.pragma('journal_mode = wal');
  }

  client.getScore = sql.prepare('SELECT * FROM scores WHERE user = ? AND guild = ?');
  client.setScore = sql.prepare(
      'INSERT OR REPLACE INTO scores (id, user, guild, points, level) \
       VALUES (@id, @user, @guild, @points, @level);');
});

client.on('message', (message) => {
  try {
    if (!message.guild ||
        !message.content.startsWith(config.prefix) ||
         message.author.bot) return;

    if (!config.prod) {
      if (!config.testServers.includes(message.guild.id)) return;
    }

    score = client.getScore.get(message.author.id, message.guild.id);
    if (!score) {
      if (!score) {
        score = {
          id: `${message.guild.id}-${message.author.id}`,
          user: message.author.id,
          guild: message.guild.id,
          points: 0,
          level: 1,
        };
      }
    }
    score.points++;
    const curLevel = Math.floor(0.1 * Math.sqrt(score.points));
    if (score.level < curLevel) {
      score.level++;
      message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
    }
    client.setScore.run(score);

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const userCommand = args.shift().toLowerCase();

    if (userCommand === 'points') {
      message.reply(`You currently have ${score.points} points and are level ${score.level}!`);
    }

    for (Command of commands) {
      cmd = new Command();
      if (cmd.aliases.includes(userCommand)) {
        cmd.executeHandler(args, message);
        return;
      }
    }

    if (userCommand === 'help' || userCommand === '?') {
      helpStr = 'The available commands are:\n\n';
      for (Command of commands) {
        cmd = new Command();
        helpStr += `${config.prefix}${cmd.name} - ${cmd.help}\n`;
      }
      message.channel.send(helpStr);
      return;
    }

    console.log(`Unrecognized command: ${userCommand}\n`);
  } catch (err) {
    console.log(err);
  }
});

client.login(config.token);
