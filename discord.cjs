require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { DateTime } = require('luxon');

const client = new Client();

// Config
const TARGET_CHANNEL_ID = "1337313992657338400";
const BOT_APP_ID = "1329398484486328320"; // App ID, not user ID
const COMMAND_NAME = 'co';
const TEST_COMMAND = 'ci';
const TIMEZONE = 'Asia/Kathmandu';
const TARGET_HOUR = 5;
const TARGET_MINUTE = 45;
const msg = `
CO REPORT

GENERAL
traffic was really bad. 
no sales made

SPECIFICS
N/A

NEGATIVES
N/A
`;

function getDelayUntilTargetTime() {
    const now = DateTime.now().setZone(TIMEZONE);
    let target = now.set({ hour: TARGET_HOUR, minute: TARGET_MINUTE, second: 0, millisecond: 0 });

    if (target <= now) {
        target = target.plus({ days: 1 });
    }

    const delayMs = target.diff(now).as('milliseconds');

    console.log(`Current time: ${now.toFormat('ff')}`);
    console.log(`Scheduled for: ${target.toFormat('ff')} (${TIMEZONE})`);
    console.log(`Waiting ${(delayMs / 1000 / 60).toFixed(2)} minutes...`);

    return delayMs;
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    try {
        const channel = await client.channels.fetch(TARGET_CHANNEL_ID);
        if (!channel || !channel.guild) {
            throw new Error('Channel not found or not part of a guild.');
        }

        // ✅ Attempt test slash command using the App ID to verify
        try {
            await channel.sendSlash(BOT_APP_ID, TEST_COMMAND);
            console.log(`✅ Bot App ID is valid. Test command /${TEST_COMMAND} sent.`);
        } catch (slashError) {
            throw new Error(`Bot App ID failed: Cannot send /${TEST_COMMAND} – ${slashError.message}`);
        }

        const delay = getDelayUntilTargetTime();

        setTimeout(async () => {
            try {
                await channel.send(msg);
                console.log('Sent normal message.');

                await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3s

                await channel.sendSlash(BOT_APP_ID, COMMAND_NAME);
                console.log(`Executed slash command: /${COMMAND_NAME}`);
            } catch (error) {
                console.error('Error during scheduled execution:', error);
            }
        }, delay);

    } catch (error) {
        console.error('Startup verification failed:', error.message);
    }
});

client.login(process.env.DISCORD_TOKEN);
