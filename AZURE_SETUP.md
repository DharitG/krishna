# Setting Up Azure OpenAI for August

This guide will help you set up Azure OpenAI Service for use with August.

## Prerequisites

1. An Azure account with access to Azure OpenAI Service
2. Access to Azure OpenAI Service (requires approval)

## Step 1: Create an Azure OpenAI resource

1. Log in to the [Azure Portal](https://portal.azure.com)
2. Search for "Azure OpenAI" and select it
3. Click "Create"
4. Fill in the required information:
   - Subscription: Your Azure subscription
   - Resource group: Create a new one or use an existing one
   - Region: Choose a region where Azure OpenAI is available
   - Name: Choose a unique name for your resource
   - Pricing tier: Select the appropriate tier
5. Click "Review + create" and then "Create"

## Step 2: Deploy a model

1. Once your resource is created, go to the resource
2. Click on "Go to Azure OpenAI Studio"
3. Go to "Deployments" in the left menu
4. Click "Create new deployment"
5. Select a model (e.g., "gpt-4" or the latest available model)
6. Give your deployment a name (you'll need this for the app configuration)
7. Click "Create"

## Step 3: Get your API key and endpoint

1. In your Azure OpenAI resource in the Azure Portal, go to "Keys and Endpoint" in the left menu
2. Copy "KEY 1" or "KEY 2" - this will be your AZURE_OPENAI_API_KEY
3. Copy the "Endpoint" - this will be your AZURE_OPENAI_ENDPOINT

## Step 4: Configure August

1. Create a `.env` file in the root directory of the August project (copy from `.env.example`)
2. Add the following environment variables:

```
AZURE_OPENAI_API_KEY=your-azure-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name
```

Replace the values with your actual Azure OpenAI information.

## Step 5: Run the app

The app will automatically use your Azure OpenAI configuration when you run it.

```
npm start
```

## Troubleshooting

If you encounter errors:

1. Verify your API key, endpoint, and deployment name are correct
2. Check that your deployment is active in Azure OpenAI Studio
3. Make sure your Azure subscription has sufficient quota for the model you're using