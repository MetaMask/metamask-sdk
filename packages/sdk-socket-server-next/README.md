# Debug SDK Socket Server Locally

This guide provides instructions for setting up and debugging the SDK socket server locally, as well as using Docker Compose for broader testing, including integration with MetaMask Mobile app.

## Prerequisites

- Node.js and Yarn installed
- Docker and Docker Compose installed (for Docker-based setup)
- Ngrok account and CLI tool installed (for external access testing)

## QuickStart

```bash
# start local redis server
docker compose up -d redis
yarn debug
```

## Local Setup

### Initial Configuration

1. **Set Up Environment Variables**:

   - Copy the sample environment file: `cp .env.sample .env`
   - Adjust the `.env` file with the correct settings as per your project requirements.

2. **Start the REDIS cluster**:
   - For standard development, use: `yarn start`
   - For debugging with more verbose output, use: `yarn debug`

3. **Check cluster status**:
   - Use the command: `yarn docker:redis:check`
   - This command sets up a local redis cluster and connect to it to make sure everything is working.

4. **Start the SDK Socket Server via docker**:
    - Use the command: `yarn docker:debug`

### Using Ngrok for External Access

To expose your local server to the internet, particularly for testing with mobile apps like MetaMask Mobile, use Ngrok.

1. **Start Ngrok**:

   - Run the command: `ngrok http 4000`
   - Note the generated https (and http) URL, which will be used in the MetaMask Mobile app settings.

2. **Configure MetaMask Mobile App**:

   - Set `MM_SDK.SERVER_URL` in the MetaMask app to the https URL provided by Ngrok.

3. **Configure Your DApp**:
   - Set the `communicationServerUrl` in your DApp's SDK options to your local IP or `localhost` with port 4000. For example: `communicationServerUrl: "http://{yourLocalIP | localhost}:4000"`

### Ngrok Configuration

Follow the same Ngrok setup as mentioned in the Local Setup section above to expose your Docker Compose-based server.

## Additional Notes

- **Environment-Specific Configuration**: The development mode includes additional debugging tools and settings, while the production mode is streamlined for performance.
- **Redis Setup**: Ensure that Redis is properly configured and running when using Docker Compose.
- **Logs and Monitoring**: Monitor the logs for any error messages or warnings during startup or operation of the server.
- **Security Considerations**: When using Ngrok, be aware that your server is publicly accessible. Ensure that you do not expose sensitive data or endpoints.
- **Troubleshooting**: If you encounter issues, verify your Docker Compose and Ngrok configurations. Check for network connectivity issues and ensure that all containers are running as expected.
