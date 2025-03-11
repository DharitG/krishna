import axios from 'axios';

// You'll need to replace this with your actual API key and endpoint
const API_KEY = 'your-api-key';
const API_URL = 'https://api.openai.com/v1/chat/completions';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
});

export const sendMessage = async (messages) => {
  try {
    const response = await api.post(API_URL, {
      model: 'gpt-4', // You can change this to other models
      messages,
      temperature: 0.7,
    });
    
    return response.data.choices[0].message;
  } catch (error) {
    console.error('Error sending message to API:', error);
    throw error;
  }
};

// This is a fallback in case you don't have an API key yet
export const sendMessageMock = async (messages) => {
  // Simulate API response delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lastMessage = messages[messages.length - 1];
  
  // Simple responses for demo purposes
  return {
    role: 'assistant',
    content: `Hi there! I'm August, an AI super agent. ${lastMessage.content.includes('?') ? "As for your question, I'm just a demo response right now." : 'How can I help you today?'}`
  };
};