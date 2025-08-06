require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.options('*', cors());

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers]
});

client.once('ready', () => {
  console.log(`${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);

app.get('/server/:guildId', async (req, res) => {
  const guildId = req.params.guildId;
  const guild = client.guilds.cache.get(guildId);

  if (!guild) {
    return res.status(404).json({ error: 'Guild not found or bot is not in the guild' });
  }

  try {
    await guild.members.fetch();

    const onlineCount = guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const totalCount = guild.memberCount;

    res.json({
      id: guild.id,
      name: guild.name,
      iconURL: guild.iconURL({ format: 'png', size: 128 }),
      onlineCount,
      totalCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
