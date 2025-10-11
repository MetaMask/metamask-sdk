import { randomUUID } from 'node:crypto';
import fs from 'node:fs';

type ChannelID = { channelId: string };
type UUIDs = { uuids: ChannelID[] };

export const generateChannelIds = () => {
  console.log('Generating channel ids...');
  const roomIds: UUIDs = {
    uuids: [],
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

// Generating channel ids...
generateChannelIds();
