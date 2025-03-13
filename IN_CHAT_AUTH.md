# In-Chat Authentication for August

This feature allows August to request authentication for third-party services directly within the chat interface when it needs to perform actions on behalf of the user.

## How It Works

1. When the AI detects it needs access to a service that hasn't been authenticated yet (e.g., Gmail, GitHub), it will:
   - Include an authentication request tag in its response: `[AUTH_REQUEST:service]`
   - Explain to the user why authentication is needed
   - Generate an interactive authentication button in the chat

2. The user can click the authentication button which will:
   - Start the OAuth flow for the selected service
   - Redirect the user to authorize August with the service
   - Return the user to the chat after authentication
   - Automatically resume the conversation once authenticated

3. After authentication:
   - August will remember the service is authenticated for this chat
   - The AI can use the service for tool calls without further authentication
   - The UI will update to show the connected status

## Implementation Details

### Components

- **AuthButton**: The interactive button component that appears in chat messages
- **ChatMessage**: Enhanced to parse and render auth request tags as buttons
- **API Service**: Modified to detect when authentication is needed and format messages accordingly
- **ChatStore**: Updated to track authentication status per chat

### Authentication Flow

```
User: "Send an email to john@example.com"
┌─────────────────────────────────────────────┐
│ AI detects need for Gmail access            │
│ Constructs response with auth request       │
└─────────────────────────────────────────────┘
AI: "I'll need access to your Gmail account to send an email.
     [AUTH_REQUEST:gmail]
     Once you grant access, I can send the email for you."
┌─────────────────────────────────────────────┐
│ ChatMessage component renders Auth Button   │
└─────────────────────────────────────────────┘
User: *clicks "Connect to Gmail" button*
┌─────────────────────────────────────────────┐
│ App redirects to OAuth consent screen       │
│ User authorizes the app                     │
│ Redirect back to app                        │
└─────────────────────────────────────────────┘
*Auth button shows "Connected to Gmail"*
┌─────────────────────────────────────────────┐
│ App sends confirmation message              │
└─────────────────────────────────────────────┘
User: "I've successfully authenticated with gmail"
┌─────────────────────────────────────────────┐
│ AI continues with the original task         │
└─────────────────────────────────────────────┘
AI: "Great! I'll send that email to john@example.com now.
     Would you like to include a subject?"
```

## Feature Notes

1. **Authentication Persistence**:
   - Auth status is stored per chat session
   - Users can see which services are connected in settings
   - Authentication can be revoked for security

2. **Multiple Services**:
   - The system supports multiple auth buttons in a single message
   - Current supported services: Gmail, GitHub, Slack
   - More services can be added by updating the AuthButton component

3. **Security Considerations**:
   - Authentication is handled via OAuth to ensure security
   - No credentials are stored in the app
   - Access tokens are managed securely via Composio

## Future Enhancements

1. Add authentication status indicators in the chat interface
2. Support re-authentication when tokens expire
3. Add ability to pre-authenticate services before they're needed
4. Improve handling of authentication errors and retry flows
5. Support more granular permission scopes based on the specific action needed