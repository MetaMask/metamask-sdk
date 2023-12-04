# Debug SDK Socket Server Locally

This guide provides instructions for setting up and debugging the SDK socket server locally, as well as using Docker and Ngrok for broader testing, including integration with MetaMask Mobile app.

## Prerequisites

- Node.js and Yarn installed
- Docker installed (for Docker-based setup)
- Ngrok account and CLI tool installed

## Local Setup

### Initial Configuration

1. **Set Up Environment Variables**:

   - Copy the sample environment file: `cp .env.sample .env`
   - Adjust the `.env` file with the correct settings as per your project requirements.

2. **Start the SDK Server**:
   - For standard development, use: `yarn start`
   - For debugging with more verbose output, use: `yarn debug`

### Using Ngrok for External Access

To expose your local server to the internet, particularly for testing with mobile apps like MetaMask Mobile, use Ngrok.

1. **Start Ngrok**:

   - Run the command: `ngrok http 4000`
   - Note the generated https (and http) URL, which will be used in the MetaMask Mobile app settings.

2. **Configure MetaMask Mobile App**:

   - Set `MM_SDK.SERVER_URL` in the MetaMask app to the https URL provided by Ngrok.

3. **Configure Your DApp**:
   - Set the `communicationServerUrl` in your DApp's SDK options to your local IP or `localhost` with port 4000. For example: `communicationServerUrl: "http://{yourLocalIP | localhost}:4000"`

## Debugging with Docker and Ngrok

For a more isolated environment, you can debug the SDK socket server using Docker and Ngrok.

### Docker Setup

1. **Build the Docker Image**:

   - Build the image for socket.io: `docker build -t socket-test .`

2. **Run the Docker Container**:
   - Start the container: `docker run -dp 4000:4000 socket-test`

### Ngrok Configuration

Follow the same Ngrok setup as mentioned in the Local Setup section above to expose your Docker-based server.

## Additional Notes

- **Logs and Monitoring**: Monitor the logs for any error messages or warnings during startup or operation. This can provide valuable insights into the behavior of the server.
- **Security Considerations**: When exposing your local server using Ngrok, be aware that it is accessible publicly. Ensure that you do not expose sensitive data or endpoints.
- **Troubleshooting**: If you encounter issues, verify your environment settings, check for common networking issues, and ensure that all required services are running.
