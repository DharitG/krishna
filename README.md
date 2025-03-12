# August - AI Super Agent

August is a React Native mobile app that provides a clean, interactive chat interface with Azure OpenAI service integration.

## Features

- Modern, intuitive chat interface
- Multiple chat conversations
- Integration with Azure OpenAI service
- Easy to extend with agentic capabilities

## Prerequisites

- Node.js and npm
- Expo CLI: `npm install -g expo-cli`
- An Azure account with access to Azure OpenAI Service

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory (copy from `.env.example`)
4. Configure Azure OpenAI:
   - Follow the instructions in `AZURE_SETUP.md`
   - Add your Azure OpenAI API key, endpoint, and deployment name to the `.env` file

## Running the App

```bash
npm start
```

This will start the Expo development server. You can then run the app on:
- iOS simulator (requires macOS and Xcode)
- Android emulator (requires Android Studio)
- Physical device using the Expo Go app (scan the QR code)

## Using August

- Start a new chat by pressing the "+" button
- Navigate between chats using the sidebar
- Type your messages in the input field at the bottom
- If Azure OpenAI is configured, you'll see an "Azure" badge in the header

## Environment Configuration

August supports the following environment variables:

- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint URL
- `AZURE_OPENAI_DEPLOYMENT_NAME`: Your model deployment name
- `MODEL_TEMPERATURE`: Temperature parameter for responses (default: 0.7)
- `MODEL_MAX_TOKENS`: Maximum tokens for responses (default: 800)

## Future Extensions

August is designed to be extended with:
- Multi-modal capabilities (image, voice)
- Function calling and tool use
- Agentic behavior with different personas
- Integration with external systems

## License

[MIT License](LICENSE)