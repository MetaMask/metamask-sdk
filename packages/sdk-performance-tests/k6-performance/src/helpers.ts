import { randomUUID } from 'crypto';
import fs from "fs";

type ChannelID = { channelId: string };
type UUIDs = { uuids: ChannelID[] };

export const generateChannelIds = () => {
    console.log('Generating channel ids...');
    let roomIds: UUIDs = {
        "uuids": []
    };
    // Generate 1,000,000 channel ids
    for (let i = 0; i < 1_000_000; i++) {
        roomIds.uuids.push({
            channelId: randomUUID(),
        });
    }
    fs.writeFile('socketioUUID.json', JSON.stringify(roomIds), (error) => {
        if (error) {
            throw error;
        }
    });
    console.log('Channel ids generated.');
};