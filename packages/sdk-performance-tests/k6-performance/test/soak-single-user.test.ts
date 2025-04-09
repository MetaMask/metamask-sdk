import ws from 'k6/ws';
import scenario from 'k6/execution';
import { check } from 'k6';
import { Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import {
  PROTOCOL,
  socketResponseCode,
  socketResponseType,
} from '../src/constants';

const SOCKET_IO_URL = `${__ENV.SOCKET_IO_URL}`;
if (!SOCKET_IO_URL) {
  throw new Error('SOCKET_IO_URL is required');
}

const DEBUG_LEVEL = `${__ENV.DEBUG_LEVEL}` || 'info';

console.log(`Starting with DEBUG_LEVEL: ${DEBUG_LEVEL}`);
console.log(`Starting with SOCKET_IO_URL: ${SOCKET_IO_URL}`);

// Custom Counters
const crashes = new Counter('socketio_connection_crashes');

// Generate Channel IDs
const channelIds = new SharedArray('users', function () {
  return JSON.parse(open('../../socketioUUID.json')).uuids;
});

// Base Test Scenario
export const options = {
  thresholds: {},
  scenarios: {
    test: {
      executor: 'ramping-vus',
      gracefulStop: '20s',
      stages: [
        { target: 150, duration: '3m' },
        { target: 1500, duration: '5m' },
        { target: 1500, duration: '20m' },
        { target: 0, duration: '2m' },
      ],
      gracefulRampDown: '30s',
    },
  },
};

// Cloud
// export const options = {
//   vus: 5,
//   duration: '30s',
//   ext: {
//     loadimpact: {
//       // Project: Default project
//       projectID: 3687587,
//       // Test runs with the same name groups test runs together.
//       name: 'Test'
//     }
//   }
// };

export default function baseTest() {
  const url = `${PROTOCOL}${SOCKET_IO_URL}/socket.io/?EIO=4&transport=websocket`;

  const roomId = channelIds[scenario.scenario.iterationInTest].channelId;
  console.log(`VU: ${__VU} <-> room_id: ${roomId}`);

  const response = ws.connect(url, {}, function (socket) {
    socket.on('open', function open() {
      console.log(`Connected VU: ${__VU}`);

      // Starter packet to get the connection going
      socket.send(`${socketResponseType.message}${socketResponseCode.connect}`);

      socket.on('close', function close() {
        console.log('disconnected');
      });

      // socket.on('message', function incoming(msg) {
      //   if (DEBUG_LEVEL === 'debug') {
      //     console.log(`VU: ${__VU} <-> got message: ${msg}`);
      //   }

      //   if (!msg) {
      //     return; // ignore empty messages
      //   }

      //   const messageCode = msg.substring(0, 2);

      //   switch (messageCode) {
      //     case `${socketResponseType.ping}`:
      //       socket.send(`${socketResponseType.pong}`);
      //       break;
      //     case `${socketResponseType.pong}`:
      //       break;
      //     default:
      //       console.log(`VU: ${__VU} <-> Unknown message received: ${msg}`);
      //   }
      // });

      socket.setInterval(function timeout() {
        // 420["join_channel",{"channelId":"1c21bc27-6886-46e9-95bf-48fcbccf5164","context":"dappcreateChannel","clientType":"dapp"}]
        socket.send(
          `420["join_channel",{"channelId":"${roomId}","context":"dappcreateChannel","clientType":"dapp"}]`,
        );
      }, 1000);

      socket.on('error', function (e) {
        console.log(`error on VU ${__VU}: `, JSON.stringify(e));
        if (e.error() !== 'websocket: close sent') {
          crashes.add(1);
          console.log('An unexpected error occured: ', e.error());
          socket.close();
        }
      });

      socket.setTimeout(function () {
        console.log('30m seconds passed, closing the socket');
        socket.close();
      }, 1000 * 60 * 30);

      socket.setInterval(function timeout() {
        socket.ping();
        console.log(
          'Pinging every 5sec (setInterval test). Keeping the socket alive',
        );
      }, 1000 * 5);
    });
  });

  check(response, { 'status is 101': (r) => r && r.status === 101 });
}
