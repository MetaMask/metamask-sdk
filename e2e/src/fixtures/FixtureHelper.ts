import FixtureServer from '@fixtures/FixtureServer';
import { FixtureBuilder } from '@fixtures/FixtureBuilder';
import { FIXTURE_SERVER_URL } from '@util/constants';

// checks if server has already been started
const isFixtureServerStarted = async () => {
  try {
    const response = await fetch(FIXTURE_SERVER_URL);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const loadFixture = async (
  fixtureServer: FixtureServer,
  { fixture } = {} as { fixture?: any },
) => {
  // If no fixture is provided, the `onboarding` option is set to `true` by default, which means
  // the app will be loaded without any fixtures and will start and go through the onboarding process.
  const state = fixture || new FixtureBuilder().build();
  fixtureServer.loadJsonState(state);
  // Checks if state is loaded
  const response = await fetch(FIXTURE_SERVER_URL);

  // Throws if state is not properly loaded
  if (!response.ok) {
    throw new Error('Not able to load fixtures');
  }
};

// Start the fixture server
export const startFixtureServer = async (fixtureServer: FixtureServer) => {
  if (await isFixtureServerStarted()) {
    console.log(
      `The fixture server has already been started @ ${FIXTURE_SERVER_URL}`,
    );
    return;
  }

  try {
    await fixtureServer.start();
    console.log(`The fixture server is started @ ${FIXTURE_SERVER_URL}`);
  } catch (err) {
    console.log('Fixture server error:', err);
  }
};

// Stop the fixture server
export const stopFixtureServer = async (fixtureServer: FixtureServer) => {
  if (!(await isFixtureServerStarted())) {
    console.log('The fixture server has already been stopped');
    return;
  }
  await fixtureServer.stop();
  console.log('The fixture server is stopped');
};
