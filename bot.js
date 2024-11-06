const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const moment = require('moment-timezone');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Make sure to include MessageContent intent
    ],
});
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const PORT = process.env.PORT || 3000;

// Function to get football match details
async function getFootballMatchDetails() {
    const url = 'https://api.football-data.org/v4/matches';
    const headers = {
        'X-Auth-Token': FOOTBALL_API_KEY,
    };

    try {
        const response = await axios.get(url, { headers });
        const data = response.data;

        if (!data.matches || data.matches.length === 0) {
            return 'No matches available at the moment.';
        }

        const matches = data.matches.map(match => {
            const homeTeam = match.homeTeam.name;
            const awayTeam = match.awayTeam.name;
            const cmp = match.competition.name;
            const utcDate = new Date(match.utcDate);
            const istDate = moment.utc(utcDate).tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm:ss A');

            return `**${cmp}**:\n${homeTeam} vs ${awayTeam} at ${istDate}`;
        });

        return matches.join('\n');
    } catch (error) {
        console.error('Error fetching match details:', error);
        return 'Unable to fetch match details at the moment.';
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('error', error => {
    console.error('The WebSocket encountered an error:', error);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.content.toLowerCase().includes('match')) {
        const matchDetails = await getFootballMatchDetails();
        message.channel.send(matchDetails);
    }
});

client.login(TOKEN);

const app = express();
app.use(bodyParser.json());

// Webhook endpoint to handle goal events
app.post('/webhook', async (req, res) => {
    const event = req.body;

    if (event.type === 'goal') {
        const match = event.match;
        const team = event.team;
        const player = event.player;
        const minute = event.minute;

        const message = `${team.name} scored a goal!\nScorer: ${player.name}\nMinute: ${minute}'`;

        const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
        if (channel) {
            channel.send(message);
        }
    }

    res.status(200).send('Event received');
});

app.listen(PORT, () => {
    console.log(`Webhook server is running on port ${PORT}`);
});