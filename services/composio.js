import Constants from 'expo-constants';
import axios from 'axios';

// Get configuration from environment
const { 
  BACKEND_URL = 'http://localhost:3000',
  COMPOSIO_API_KEY = 'your-composio-api-key'
} = Constants.expoConfig?.extra || {};

class ComposioService {
  constructor() {
    this.backendUrl = BACKEND_URL;
    this.apiKey = COMPOSIO_API_KEY;
    this.isConfigured = !!COMPOSIO_API_KEY;
    
    // Log configuration status for debugging
    console.log('Composio service configuration:', { 
      backendUrl: this.backendUrl,
      isConfigured: this.isConfigured,
      hasApiKey: !!COMPOSIO_API_KEY
    });
  }

  /**
   * Get tools for specific actions
   * @param {Array} actions - Array of actions to enable (e.g., ["GITHUB_STAR_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER"])
   * @returns {Array} - Array of tools in the OpenAI tool format
   */
  async getTools(actions = []) {
    if (!this.isConfigured) {
      console.warn('Composio is not configured. Tools will not be available.');
      return [];
    }

    try {
      const response = await axios.post(
        `${this.backendUrl}/api/composio/tools`,
        { actions },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data.tools;
    } catch (error) {
      console.error('Error getting tools:', error.message);
      return [];
    }
  }

  /**
   * Handle tool calls from OpenAI response
   * @param {Object} response - The response from OpenAI API
   * @returns {Object} - Processed result
   */
  async handleToolCalls(response) {
    if (!this.isConfigured) {
      console.warn('Composio is not configured. Tool calls will not be processed.');
      return { error: 'Composio not configured' };
    }

    if (!response?.choices?.[0]?.message?.tool_calls) {
      console.log('No tool calls in response');
      return { result: 'No tool calls found in response' };
    }

    const toolCalls = response.choices[0].message.tool_calls;
    console.log('Processing tool calls:', toolCalls);

    try {
      const response = await axios.post(
        `${this.backendUrl}/api/composio/tool_calls`,
        { toolCalls },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error handling tool calls:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Initialize authentication for a specific app
   * @param {String} appName - Name of the app to authenticate (e.g., "github")
   * @returns {Object} - Authentication information
   */
  async initAuthentication(appName) {
    if (!this.isConfigured) {
      console.warn('Composio is not configured. Authentication will not be initialized.');
      return { error: 'Composio not configured' };
    }

    console.log(`Initializing authentication for ${appName}`);
    
    try {
      const response = await axios.post(
        `${this.backendUrl}/api/composio/auth/${appName}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error initializing authentication for ${appName}:`, error.message);
      return { error: error.message };
    }
  }

  /**
   * Get authentication URL for a service
   * @param {String} serviceName - Name of the service to authenticate with
   * @returns {Object} - Authentication URL and status
   */
  async getAuthUrl(serviceName) {
    try {
      console.log(`Getting auth URL for ${serviceName}`);
      
      // This will now be handled by the backend
      const response = await axios.post(
        `${this.backendUrl}/api/composio/auth/${serviceName}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error getting auth URL for ${serviceName}:`, error.message);
      throw error;
    }
  }

  /**
   * Handle OAuth callback
   * @param {String} url - Callback URL with auth code
   * @returns {Object} - Authentication result
   */
  async handleOAuthCallback(url) {
    try {
      console.log('Handling OAuth callback URL:', url);
      
      // Extract the service name and auth code from the URL
      // Example URL: august://auth/callback?service=github&code=abc123
      const urlObj = new URL(url);
      const service = urlObj.searchParams.get('service');
      const code = urlObj.searchParams.get('code');
      
      if (!service || !code) {
        throw new Error('Missing service or code in callback URL');
      }
      
      // Send the auth code to the backend
      const response = await axios.post(
        `${this.backendUrl}/api/composio/auth/${service}/callback`,
        { code },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        service,
        success: true,
        ...response.data
      };
    } catch (error) {
      console.error('Error handling OAuth callback:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if a user is authenticated for a specific service
   * @param {String} serviceName - Name of the service to check
   * @returns {Boolean} - Whether the user is authenticated
   */
  async isAuthenticated(serviceName) {
    try {
      const response = await axios.get(
        `${this.backendUrl}/api/composio/auth/${serviceName}/status`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.authenticated;
    } catch (error) {
      console.error(`Error checking auth status for ${serviceName}:`, error.message);
      return false;
    }
  }
}

export default new ComposioService();