This is just a rough idea of what we can do to the backend

⏺ Full Backend Proxy Implementation for Composio with React Native

  Overview

  We'll create a complete backend proxy system that allows your React Native app to use Composio without
  dealing with Node.js compatibility issues. This architecture completely separates concerns:

  1. React Native App: Handles UI and user interactions
  2. Backend API Server: Manages all Composio operations and authentication flows
  3. Composio Services: Remain untouched, accessed only by the backend server

  Architecture Components

  1. Backend Server

  A Node.js Express server with these responsibilities:
  - Managing Composio SDK integration
  - Handling authentication flows
  - Processing tool calls
  - Storing and managing authentication states
  - Providing a REST API for the mobile app

  2. Mobile App Client

  React Native app changes:
  - Replace direct Composio SDK calls with API calls to the backend
  - Handle OAuth redirects through deep linking
  - Manage UI state for authentication and tool usage

  3. Authentication System

  A complete OAuth flow implementation:
  - Backend initiates auth and generates redirect URLs
  - Mobile app handles opening URLs and receiving callbacks
  - Backend validates and stores authentication tokens

  Detailed Implementation Plan

  Step 1: Backend Server Setup

  1. Create a new Node.js project:
  mkdir august-backend
  cd august-backend
  npm init -y
  npm install express cors body-parser dotenv composio-core

  2. Configure environment variables (.env file):
  PORT=3000
  COMPOSIO_API_KEY=your-key-here
  FRONTEND_URL=your-app-scheme://

  3. Create server entry point (server.js):
  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');
  const { OpenAIToolSet } = require('composio-core');
  require('dotenv').config();

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors());
  app.use(bodyParser.json({ limit: '10mb' }));

  // Service IDs for Composio integrations
  const SERVICE_IDS = {
    gmail: 'ab1ee96d-63fb-45f4-b7c9-78bb2b354dee',
    // Add other services as needed
  };

  // Initialize Composio toolset
  const toolset = new OpenAIToolSet({
    apiKey: process.env.COMPOSIO_API_KEY
  });

  // In-memory store for auth state (use a database in production)
  const authStates = {};

  // Routes will be added here

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  Step 2: Implement API Endpoints

  Add these routes to the server:

  1. Authentication Endpoints:

  // Initiate authentication for a service
  app.post('/api/auth/initiate', async (req, res) => {
    try {
      const { service, entityId = 'default' } = req.body;

      if (!SERVICE_IDS[service]) {
        return res.status(400).json({
          error: `Service "${service}" not supported. Available services: 
  ${Object.keys(SERVICE_IDS).join(', ')}`
        });
      }

      // Get the integration
      const integration = await toolset.integrations.get({
        integrationId: SERVICE_IDS[service]
      });

      // Start authentication process
      const connectedAccount = await toolset.connectedAccounts.initiate({
        integrationId: integration.id,
        entityId
      });

      // Store authentication state
      const stateId = Date.now().toString();
      authStates[stateId] = {
        service,
        entityId,
        connectedAccountId: connectedAccount.connectedAccountId,
        status: connectedAccount.connectionStatus,
        initiated: new Date().toISOString()
      };

      // Add callback URL parameters
      const callbackUrl = `${process.env.FRONTEND_URL}callback?state=${stateId}`;
      const redirectUrl =
  `${connectedAccount.redirectUrl}&redirect_uri=${encodeURIComponent(callbackUrl)}`;

      res.json({
        stateId,
        service,
        redirectUrl,
        status: connectedAccount.connectionStatus
      });
    } catch (error) {
      console.error('Authentication initiation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Verify authentication status
  app.get('/api/auth/verify/:stateId', async (req, res) => {
    try {
      const { stateId } = req.params;
      const authState = authStates[stateId];

      if (!authState) {
        return res.status(404).json({ error: 'Authentication state not found' });
      }

      // Check with Composio for current status
      // In a real implementation, you'd query Composio for the actual status
      // For simplicity, we're simulating successful authentication after 30 seconds
      const elapsedTime = Date.now() - parseInt(stateId);
      const isAuthenticated = elapsedTime > 30000;

      if (isAuthenticated) {
        authState.status = 'authenticated';
        authState.completedAt = new Date().toISOString();
      }

      res.json({
        stateId,
        service: authState.service,
        status: authState.status,
        isAuthenticated
      });
    } catch (error) {
      console.error('Authentication verification error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // List authenticated services
  app.get('/api/auth/services/:entityId', async (req, res) => {
    try {
      const { entityId = 'default' } = req.params;

      // In a real implementation, you'd query Composio for all authenticated services
      // For simplicity, we're returning from our in-memory store
      const authenticatedServices = Object.values(authStates)
        .filter(state => state.entityId === entityId && state.status === 'authenticated')
        .map(state => ({
          service: state.service,
          connectedAccountId: state.connectedAccountId,
          authenticatedAt: state.completedAt
        }));

      res.json({
        entityId,
        authenticatedServices
      });
    } catch (error) {
      console.error('Listing services error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  2. Tool Handling Endpoints:

  // Get available tools
  app.post('/api/tools/get', async (req, res) => {
    try {
      const { actions = [], entityId = 'default' } = req.body;

      // Get authenticated services for this entity
      const authenticatedServices = Object.values(authStates)
        .filter(state => state.entityId === entityId && state.status === 'authenticated')
        .map(state => state.service);

      // Filter actions based on authenticated services
      const availableActions = actions.filter(action => {
        const serviceName = action.split('_')[0].toLowerCase();
        return authenticatedServices.includes(serviceName);
      });

      // Get tools from Composio
      const tools = await toolset.getTools({
        actions: availableActions,
        entityId
      });

      res.json({
        tools,
        authenticatedServices,
        availableActions
      });
    } catch (error) {
      console.error('Error getting tools:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Handle tool calls
  app.post('/api/tools/execute', async (req, res) => {
    try {
      const { openaiResponse, entityId = 'default' } = req.body;

      if (!openaiResponse || !openaiResponse.choices ||
          !openaiResponse.choices[0].message.tool_calls) {
        return res.status(400).json({
          error: 'Invalid OpenAI response format. Must contain tool calls.'
        });
      }

      // Check if the tools being called are for authenticated services
      const toolCalls = openaiResponse.choices[0].message.tool_calls;
      const servicesNeeded = toolCalls.map(call => {
        const functionName = call.function.name;
        return functionName.split('_')[0].toLowerCase();
      });

      // Get authenticated services
      const authenticatedServices = Object.values(authStates)
        .filter(state => state.entityId === entityId && state.status === 'authenticated')
        .map(state => state.service);

      // Check if all needed services are authenticated
      const unauthenticatedServices = servicesNeeded.filter(
        service => !authenticatedServices.includes(service)
      );

      if (unauthenticatedServices.length > 0) {
        return res.status(401).json({
          error: 'Authentication required',
          unauthenticatedServices,
          message: `Please authenticate these services: ${unauthenticatedServices.join(', ')}`
        });
      }

      // Handle the tool calls with Composio
      const result = await toolset.handleToolCalls(openaiResponse, { entityId });

      res.json({
        result,
        toolCalls: toolCalls.map(call => call.function.name)
      });
    } catch (error) {
      console.error('Error executing tools:', error);
      res.status(500).json({ error: error.message });
    }
  });

  Step 3: React Native App Integration

  1. Create API client for the backend (services/backendApi.js):

  import axios from 'axios';
  import Constants from 'expo-constants';
  import * as Linking from 'expo-linking';

  const API_URL = 'https://your-backend-api.com/api'; // Replace with your actual backend URL

  class BackendApiService {
    constructor() {
      this.entityId = 'default';
      this.authenticatedServices = {};
    }

    // Initialize authentication for a service
    async initiateAuthentication(service) {
      try {
        const response = await axios.post(`${API_URL}/auth/initiate`, {
          service,
          entityId: this.entityId
        });

        const { stateId, redirectUrl } = response.data;

        // Store the state ID for verification later
        this.lastAuthStateId = stateId;

        return {
          service,
          redirectUrl,
          stateId
        };
      } catch (error) {
        console.error('Authentication initiation error:', error);
        return { error: error.response?.data?.error || error.message };
      }
    }

    // Verify authentication status
    async verifyAuthentication(stateId) {
      try {
        const response = await axios.get(`${API_URL}/auth/verify/${stateId}`);
        const { isAuthenticated, service } = response.data;

        if (isAuthenticated) {
          // Update our local cache of authenticated services
          this.authenticatedServices[service] = true;
        }

        return {
          isAuthenticated,
          service
        };
      } catch (error) {
        console.error('Authentication verification error:', error);
        return { error: error.response?.data?.error || error.message };
      }
    }

    // Get tools from the backend
    async getTools(actions = []) {
      try {
        const response = await axios.post(`${API_URL}/tools/get`, {
          actions,
          entityId: this.entityId
        });

        return response.data.tools;
      } catch (error) {
        console.error('Error getting tools:', error);
        return [];
      }
    }

    // Handle tool calls through the backend
    async handleToolCalls(openaiResponse) {
      try {
        const response = await axios.post(`${API_URL}/tools/execute`, {
          openaiResponse,
          entityId: this.entityId
        });

        return response.data;
      } catch (error) {
        console.error('Error handling tool calls:', error);

        // Check if it's an authentication error
        if (error.response?.status === 401) {
          const { unauthenticatedServices } = error.response.data;

          return {
            error: 'authentication_required',
            unauthenticatedServices,
            message: `Authentication required for: ${unauthenticatedServices.join(', ')}`
          };
        }

        return { error: error.response?.data?.error || error.message };
      }
    }

    // Get all authenticated services
    async getAuthenticatedServices() {
      try {
        const response = await axios.get(`${API_URL}/auth/services/${this.entityId}`);

        // Update local cache
        this.authenticatedServices = {};
        response.data.authenticatedServices.forEach(service => {
          this.authenticatedServices[service.service] = true;
        });

        return response.data.authenticatedServices;
      } catch (error) {
        console.error('Error getting authenticated services:', error);
        return [];
      }
    }

    // Check if a service is authenticated
    isServiceAuthenticated(service) {
      return !!this.authenticatedServices[service];
    }
  }

  export default new BackendApiService();

  2. Update ChatMessage component to use the backend API:

  // In handleAuth function
  const handleAuth = async (service) => {
    // Update loading state
    setAuthStates(prev => ({
      ...prev,
      [service]: { isLoading: true }
    }));

    try {
      // Request authentication via backend
      const result = await backendApi.initiateAuthentication(service);

      if (result.error) {
        // Set error state
        setAuthStates(prev => ({
          ...prev,
          [service]: { isLoading: false, error: result.message }
        }));
      } else if (result.redirectUrl) {
        // Open the authentication URL
        const redirectUrl = result.redirectUrl;
        console.log(`Opening URL for authentication: ${redirectUrl}`);

        try {
          // Open the URL in a browser
          const supported = await Linking.canOpenURL(redirectUrl);

          if (supported) {
            await Linking.openURL(redirectUrl);

            // Update state to indicate we're waiting for auth completion
            setAuthStates(prev => ({
              ...prev,
              [service]: {
                isLoading: true,
                waitingForRedirect: true,
                stateId: result.stateId,
                message: 'Waiting for authentication to complete...'
              }
            }));

            // Start polling for authentication status
            const pollInterval = setInterval(async () => {
              const verifyResult = await backendApi.verifyAuthentication(result.stateId);

              if (verifyResult.isAuthenticated) {
                clearInterval(pollInterval);

                setAuthStates(prev => ({
                  ...prev,
                  [service]: { isLoading: false, isAuthenticated: true }
                }));

                // Notify parent component of auth success
                if (onAuthSuccess) {
                  onAuthSuccess(service);
                }
              }
            }, 5000); // Poll every 5 seconds

            // Clear interval after 2 minutes if not authenticated
            setTimeout(() => {
              clearInterval(pollInterval);

              // Check if still waiting
              setAuthStates(prev => {
                if (prev[service]?.waitingForRedirect) {
                  return {
                    ...prev,
                    [service]: {
                      isLoading: false,
                      error: 'Authentication timed out. Please try again.'
                    }
                  };
                }
                return prev;
              });
            }, 120000);
          } else {
            console.error(`Cannot open URL: ${redirectUrl}`);
            setAuthStates(prev => ({
              ...prev,
              [service]: {
                isLoading: false,
                error: 'Cannot open authentication URL'
              }
            }));
          }
        } catch (error) {
          console.error('Error opening auth URL:', error);
          setAuthStates(prev => ({
            ...prev,
            [service]: {
              isLoading: false,
              error: `Error opening authentication URL: ${error.message}`
            }
          }));
        }
      }
    } catch (error) {
      setAuthStates(prev => ({
        ...prev,
        [service]: { isLoading: false, error: error.message }
      }));
    }
  };

  3. Update API service to use the backend:

  // In services/api.js
  export const sendMessage = async (
    messages,
    enabledTools = DEFAULT_ENABLED_TOOLS,
    useTools = true,
    authStatus = {}
  ) => {
    try {
      // Log environment variables (sanitized) for debugging
      console.log('Azure OpenAI Configuration:', {
        endpoint: AZURE_OPENAI_ENDPOINT ? AZURE_OPENAI_ENDPOINT.substring(0, 15) + '...' : 'not set',
        deploymentName: AZURE_OPENAI_DEPLOYMENT_NAME || 'not set',
        apiVersion: API_VERSION,
        hasApiKey: !!AZURE_OPENAI_API_KEY,
        usingTools: useTools
      });

      // Standard Azure OpenAI API URL format
      const azureApiUrl = `${normalizedEndpoint}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT_NAME}/chat/
  completions?api-version=${API_VERSION}`;

      // Get tools from backend if enabled
      const tools = useTools ? await backendApi.getTools(enabledTools) : [];

      // Rest of the function remains the same
      // ...

      // But update the tool handling section:
      if (hasToolCalls) {
        console.log('Response contains tool calls');

        try {
          // Use the backend to handle tool calls
          const result = await backendApi.handleToolCalls(response.data);

          // Check if authentication is required
          if (result.error === 'authentication_required') {
            // We need authentication for these services
            const authRequests = result.unauthenticatedServices.map(service =>
              `[AUTH_REQUEST:${service}]`
            ).join('\n');

            // Create a message asking for authentication
            return {
              role: 'assistant',
              content: `I need to access certain services to help you with this request. Please 
  authenticate with the following services:\n\n${authRequests}\n\nOnce authenticated, I'll be able to 
  complete your request.`
            };
          }

          // Tool calls processed successfully
          return {
            role: 'assistant',
            content: `I've used tools to help with your request: ${assistantMessage.tool_calls.map(tc => 
  tc.function.name).join(', ')}. ${result.result}`
          };
        } catch (error) {
          // Handle tool call failure
          return {
            role: 'assistant',
            content: `I tried to use tools to help with your request, but encountered an error: 
  ${error.message}. Could you try again or rephrase your request?`
          };
        }
      }
    } catch (error) {
      // Error handling remains the same
    }
  };

  Step 4: OAuth Deep Linking in React Native

  1. Setup deep linking in app.json:

  {
    "expo": {
      "scheme": "august",
      "ios": {
        "bundleIdentifier": "com.yourcompany.august"
      },
      "android": {
        "package": "com.yourcompany.august"
      }
    }
  }

  2. Handle authentication callback (in App.js or a Navigator component):

  import * as Linking from 'expo-linking';
  import { useEffect } from 'react';
  import backendApi from './services/backendApi';

  // Inside your component:
  useEffect(() => {
    // Handle deep linking
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = ({ url }) => {
    // Parse the URL
    const parsed = Linking.parse(url);

    // Check if it's an auth callback
    if (parsed.path === 'callback' && parsed.queryParams.state) {
      const { state } = parsed.queryParams;

      // Verify authentication status
      backendApi.verifyAuthentication(state).then(result => {
        console.log('Authentication callback result:', result);

        // Handle the result in your app
        if (result.isAuthenticated) {
          // You could show a toast message, update UI, etc.
          console.log(`Successfully authenticated with ${result.service}`);
        }
      });
    }
  };

  Step 5: Backend Deployment

  1. Setup a Node.js hosting service:
    - Render.com, Heroku, AWS Lambda, Vercel, etc.
  2. Configure environment variables:
    - COMPOSIO_API_KEY: Your Composio API key
    - FRONTEND_URL: Your React Native deep link URL (e.g., august://)
  3. Setup production-grade database (to replace in-memory storage):
    - MongoDB, PostgreSQL, etc., for storing auth states

  Step 6: Security Considerations

  1. API Key Security:
    - Never expose the Composio API key in the mobile app
    - Use environment variables on the server
  2. Authentication Token Storage:
    - Use secure storage for tokens on the backend
    - Consider encryption at rest
  3. Request Validation:
    - Implement proper validation for all API endpoints
    - Consider adding rate limiting
  4. HTTPS:
    - Ensure all communication is encrypted with HTTPS
  5. User Authentication:
    - Add user authentication to the backend API
    - Tie service authorizations to specific users

  Implementation Timeline

  1. Phase 1 (1-2 days):
    - Setup basic backend Express server
    - Implement authentication initiation endpoint
    - Create React Native API client
  2. Phase 2 (1-2 days):
    - Implement tool handling endpoints
    - Update React Native components to use backend
    - Setup deep linking for OAuth flow
  3. Phase 3 (1-2 days):
    - Implement authentication verification
    - Add polling mechanism for auth status
    - Test end-to-end authentication flow
  4. Phase 4 (1-2 days):
    - Deploy backend to production
    - Implement proper error handling
    - Add monitoring and logging

  This approach provides a clean separation of concerns, avoids React Native compatibility issues
  entirely, and gives you a more scalable architecture for the future.