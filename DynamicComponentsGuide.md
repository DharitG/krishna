# Dynamic UI Components Guide

This guide demonstrates how to use the new dynamic UI components for in-chat authentication and action confirmations.

## DynamicAuthBlob

The `DynamicAuthBlob` component provides an animated, visually appealing authentication UI for third-party services.

### Usage

```jsx
import DynamicAuthBlob from './components/chat/DynamicAuthBlob';

// In your component
<DynamicAuthBlob
  service="github"                // Service name (github, gmail, slack, etc.)
  onAuthenticate={handleAuth}     // Function to call when authenticate button is pressed
  isLoading={false}               // Set to true while authentication is in progress
  isConnected={false}             // Set to true when service is connected
  error={null}                    // Error message to display, if any
  onErrorDismiss={handleDismiss}  // Function to call when error dismiss button is pressed
  size="default"                  // 'default' or 'large'
/>
```

### Supported Services

The component includes built-in styles for these services:
- github
- gmail
- slack
- calendar
- dropbox
- asana

For other services, a default style will be used.

## DynamicConfirmationBlob

The `DynamicConfirmationBlob` component provides an animated confirmation UI for tool actions with varying risk levels.

### Usage

```jsx
import DynamicConfirmationBlob from './components/chat/DynamicConfirmationBlob';

// In your component
<DynamicConfirmationBlob
  action="email"                     // Action type (email, delete, post, access, create)
  service="Gmail"                    // Service name (optional)
  details={[                         // Array of action details to display
    { label: "To", value: "user@example.com" },
    { label: "Subject", value: "Meeting tomorrow" },
    { label: "Content", value: "Let's discuss the project..." }
  ]}
  onConfirm={handleConfirm}          // Function to call when confirm button is pressed
  onCancel={handleCancel}            // Function to call when cancel button is pressed
  isLoading={false}                  // Set to true while action is in progress
  size="default"                     // 'default' or 'large'
/>
```

### Supported Action Types

The component includes built-in styles with appropriate risk levels:
- email (medium risk)
- delete (high risk)
- post (medium risk)
- access (low risk)
- create (medium risk)

For other action types, a default style will be used.

## ToolConfirmation Component

For easier integration, use the `ToolConfirmation` wrapper component:

```jsx
import ToolConfirmation from './components/chat/ToolConfirmation';

// In your component
<ToolConfirmation
  action={{
    type: 'email',             // Action type
    service: 'Gmail',          // Service name
    details: {                 // Object with action details
      to: 'user@example.com',
      subject: 'Project Update',
      body: 'Here is the latest update...'
    }
  }}
  onConfirm={handleConfirm}    // Function to call when action is confirmed
  onCancel={handleCancel}      // Function to call when action is canceled
/>
```

## Integration with Chat Service

To use these components with the chat service:

1. Parse messages for authentication requests using the AUTH_REQUEST_PATTERN regex
2. Parse messages for action confirmations using a similar pattern
3. Render the appropriate component based on the message content

### Example with Chat Flow

```jsx
// In your chat message component
const renderMessageContent = (content) => {
  // Check for auth request
  if (content.includes('[AUTH_REQUEST:')) {
    // Extract service name
    const match = AUTH_REQUEST_PATTERN.exec(content);
    if (match && match[1]) {
      const service = match[1];
      return (
        <DynamicAuthBlob
          service={service}
          onAuthenticate={() => handleAuth(service)}
          isLoading={authStates[service]?.isLoading}
          isConnected={authStates[service]?.isAuthenticated}
          error={authStates[service]?.error}
          onErrorDismiss={() => clearError(service)}
        />
      );
    }
  }
  
  // Check for action confirmation
  if (content.includes('[CONFIRM_ACTION:')) {
    // Extract action details
    const match = ACTION_CONFIRMATION_PATTERN.exec(content);
    if (match && match[1]) {
      const actionData = JSON.parse(match[1]);
      return (
        <ToolConfirmation
          action={actionData}
          onConfirm={() => handleConfirmAction(actionData)}
          onCancel={() => handleCancelAction()}
        />
      );
    }
  }
  
  // Regular message content
  return <Markdown>{content}</Markdown>;
};
```

## Customizing Styles

Both components use the app's Theme constants for consistent styling. You can customize the appearance by:

1. Modifying the service or action configurations in each component
2. Updating the styles in the StyleSheet objects
3. Passing custom gradientColors as part of the service/action config

For extensive customization, consider creating variants of these components with your preferred styling.

## Action Confirmation Pattern

To implement a standardized action confirmation flow, add a regex pattern to detect action confirmation requests in messages:

```jsx
// Add this pattern to ChatMessage.js
const ACTION_CONFIRMATION_PATTERN = /\[CONFIRM_ACTION:({.*?})\]/g;
```

You'll need to update the backend LLM prompt to generate messages with this format when actions need confirmation:

```
[CONFIRM_ACTION:{"type":"email","service":"Gmail","details":{"to":"user@example.com","subject":"Meeting Request","body":"Hello, I'd like to schedule a meeting..."}}]
```