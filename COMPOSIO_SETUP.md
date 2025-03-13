# Setting Up Composio Integration with August

This guide will help you set up the Composio integration for August, allowing your AI assistant to use external tools like GitHub, Slack, and Gmail.

## Prerequisites

1. A valid Composio API key (Get one from [composio.dev](https://composio.dev))
2. Azure OpenAI configured and working with your August app

## Setup Steps

### 1. Configure Environment Variables

Add your Composio API key to your environment variables or `.env` file:

```
COMPOSIO_API_KEY=your-composio-api-key-here
```

This will automatically be picked up by the app's configuration.

### 2. Run the App

Start the app with:

```bash
npm start
```

### 3. Enable and Authenticate Services

1. Navigate to **Settings** in the app
2. Find the **Composio Integration** section
3. Ensure "Use Tools" is toggled on
4. For each service you want to use (GitHub, Slack, Gmail):
   - Toggle the service on
   - Tap "Authenticate [Service]" to connect your account
   - You'll be redirected to authorize the app

## Testing the Integration

Once configured, try these sample prompts in a chat:

- "Star the repository composiohq/composio on GitHub"
- "Send an email to [email] with the subject 'Hello from August'"
- "Send a message to the #general channel on Slack saying 'Hello from August'"

## Troubleshooting

If you encounter issues:

1. **Authentication Errors**: Re-attempt the authentication process from Settings
2. **Tool Not Working**: Check that the specific tool is enabled in Settings
3. **API Key Issues**: Verify your Composio API key is correctly set in the environment variables

## Supported Actions

The current integration supports:

### GitHub
- Star repositories
- Create issues
- View repository information

### Slack
- Send messages to channels
- Create channels

### Gmail
- Send emails
- Read emails (with authentication)

## Adding More Tools

To add additional tools, you need to modify:

1. `/services/api.js` - Update the `DEFAULT_ENABLED_TOOLS` array
2. `/services/composio.js` - Customize the tool definitions
3. `/app/settings/index.js` - Add UI controls for the new tools

For more information, refer to the [Composio documentation](/August/composio_docs.md).