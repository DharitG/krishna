Using Composio With OpenAI
Star A Repository on Github

In this example, we will use OpenAI Assistant to star a repository on Github using Composio Tools

1
Install Packages


Python

JavaScript

npm i composio-core openai
2
Import Libraries & Initialize ComposioToolSet & LLM


Python

JavaScript

import { OpenAIToolSet } from "composio-core";
import OpenAI from "openai";
const toolset = new OpenAIToolSet();
const openai = new OpenAI();
3
Connect Your GitHub Account

You need to have an active GitHub Integration. Learn how to do this here

CLI

Python

JavaScript

const connection = await toolset.connectedAccounts.initiate({appName: "github"})
console.log(`Open this URL to authenticate: ${connection.redirectUrl}`);
Don’t forget to set your COMPOSIO_API_KEY and OPENAI_API_KEY in your environment variables.

4
Get All Github Tools

You can get all the tools for a given app as shown below, but you can get specific actions and filter actions using usecase & tags. Learn more here


Python

JavaScript

const tools = await toolset.getTools({ apps: ["github"] });
5
Define the Assistant


Python

JavaScript

async function createGithubAssistant(openai, tools) {
    return await openai.beta.assistants.create({
        name: "Github Assistant",
        instructions: "You're a GitHub Assistant, you can do operations on GitHub",
        tools: tools,
        model: "gpt-4o-mini"
    });
}
6
Execute the Agent


Python

JavaScript

//With Streaming
async function executeAssistantTask(openai, toolset, assistant, task) {
    const thread = await openai.beta.threads.create();
    const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
        instructions: task,
        tools: tools,
        model: "gpt-4o-mini",
        stream: true
    });
    for await (const result of toolset.waitAndHandleAssistantStreamToolCalls(openai, run, thread)) {
        console.log(result);
    }
}
// Without Streaming
async function executeAssistantTask(openai, toolset, assistant, task) {
    const thread = await openai.beta.threads.create();
    const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
        instructions: task,
        tools: tools,
        model: "gpt-4o-mini",
        stream: false
    });
    const call = await toolset.waitAndHandleAssistantToolCalls(openai, run, thread);
    console.log(call);
}
(async() => {
    const githubAssistant = await createGithubAssistant(openai, tools);
    await executeAssistantTask(
        openai, 
        toolset, 
        githubAssistant, 
        "Star the repository 'composiohq/composio'"
    );
})();
Was this page helpful?



from openai import AzureOpenAI
from composio_openai import ComposioToolSet, Action

toolset = ComposioToolSet(api_key="<composio-api-key>")tools = toolset.get_tools( actions=[Action.GITHUB_STAR_A_REPOSITORY_FOR_THE_AUTHENTICATED_USER])client = AzureOpenAI( api_key="<azure-key>", api_version="2023-05-15", azure_endpoint="https://testingswedencentral.openai.azure.com",)

prompt = "Star the repository composiohq/composio"response = client.chat.completions.create( model="test", tools=tools, messages=[ {"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": prompt}, ], temperature=0.7,)res = toolset.handle_tool_calls(response=response)print(res)
​

Research Agent
Research Agent GitHub Repository
Explore the complete source code for the Research Agent project. This repository contains all the necessary files and scripts to set up and run the Research Agent using Composio.
1
Install the required packages


Python

JavaScript

pnpm add express openai composio-core dotenv
Create a .env file and add your API keys.

2
Import base packages

Next, we’ll import the essential libraries for our project.


Python

JavaScript

import express from 'express';
import { OpenAI } from "openai";
import { OpenAIToolSet, Action } from "composio-core";
import dotenv from 'dotenv';
dotenv.config();
3
Configure environments and parameters

Set up the necessary configurations for our agent.


Python

JavaScript

// Create Express app
const app = express();
const PORT = process.env.PORT || 2001;
// Set research parameters
const researchTopic = "LLM agents function calling";
const targetRepo = "composiohq/composio";
const nIssues = 3;
// Configure Express
app.use(express.json());
4
Set up Composio tools

Initialize the tools that our agent will use.


Python

JavaScript

// Initialize the Composio toolset
const toolset = new OpenAIToolSet({
    apiKey: process.env.COMPOSIO_API_KEY,
});
// Get the necessary tools for research and GitHub interaction
const getTools = async () => {
    return await toolset.get_actions([
        Action.SERPAPI_SEARCH,
        Action.GITHUB_USERS_GET_AUTHENTICATED,
        Action.GITHUB_ISSUES_CREATE
    ]);
};
5
Create the agent

Set up the agent with the tools and capabilities it needs.


Python

JavaScript

// Initialize OpenAI client
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
// Create an OpenAI Assistant with the tools
const createAssistant = async (tools) => {
    return await client.beta.assistants.create({
        model: "gpt-4-turbo",
        description: "Research Agent that interacts with GitHub",
        instructions: "You are a helpful assistant that researches topics and creates GitHub issues",
        tools: tools,
    });
};
6
Implement the research functionality

Create the main logic for the research agent.


Python

JavaScript

// Create endpoint to trigger the research
app.get('/research', async (req, res) => {
    try {
        // Get the tools
        const tools = await getTools();
        
        // Create assistant
        const assistant = await createAssistant(tools);
        
        // Create the research prompt
        const prompt = `Please research about \`${researchTopic}\`, organize 
            the top ${nIssues} results as ${nIssues} issues for 
            a GitHub repository, and finally raise those issues with proper 
            title, body, implementation guidance, and references in 
            the ${targetRepo} repo, as well as relevant tags and assignees as 
            the repo owner.`;
        
        // Create a thread with the user's request
        const thread = await client.beta.threads.create({
            messages: [{
                role: "user",
                content: prompt
            }]
        });
        
        // Start the assistant run
        let run = await client.beta.threads.runs.create(thread.id, {
            assistant_id: assistant.id,
        });
        
        // Handle tool calls and wait for completion
        run = await toolset.wait_and_handle_assistant_tool_calls(client, run, thread);
        
        // Check if the run completed successfully
        if (run.status === "completed") {
            const messages = await client.beta.threads.messages.list(thread.id);
            res.json({ status: 'success', messages: messages.data });
        } else {
            res.status(500).json({ status: 'error', message: 'Run did not complete', run });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});
// Start the Express server
app.listen(PORT, () => {
    console.log(`Research Agent server is running on port ${PORT}`);
});
Complete Code


Python

JavaScript

import express from 'express';
import { OpenAI } from "openai";
import { OpenAIToolSet, Action } from "composio-core";
import dotenv from 'dotenv';
dotenv.config();
// Create Express app
const app = express();
const PORT = process.env.PORT || 2001;
// Set research parameters
const researchTopic = "LLM agents function calling";
const targetRepo = "composiohq/composio";
const nIssues = 3;
// Configure Express
app.use(express.json());
// Initialize the Composio toolset
const toolset = new OpenAIToolSet({
    apiKey: process.env.COMPOSIO_API_KEY,
});
// Initialize OpenAI client
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
// Create endpoint to trigger the research
app.get('/research', async (req, res) => {
    try {
        // Get the necessary tools for research and GitHub interaction
        const tools = await toolset.get_actions([
            Action.SERPAPI_SEARCH,
            Action.GITHUB_USERS_GET_AUTHENTICATED,
            Action.GITHUB_ISSUES_CREATE
        ]);
        
        // Create assistant
        const assistant = await client.beta.assistants.create({
            model: "gpt-4-turbo",
            description: "Research Agent that interacts with GitHub",
            instructions: "You are a helpful assistant that researches topics and creates GitHub issues",
            tools: tools,
        });
        
        // Create the research prompt
        const prompt = `Please research about \`${researchTopic}\`, organize 
            the top ${nIssues} results as ${nIssues} issues for 
            a GitHub repository, and finally raise those issues with proper 
            title, body, implementation guidance, and references in 
            the ${targetRepo} repo, as well as relevant tags and assignees as 
            the repo owner.`;
        
        // Create a thread with the user's request
        const thread = await client.beta.threads.create({
            messages: [{
                role: "user",
                content: prompt
            }]
        });
        
        // Start the assistant run
        let run = await client.beta.threads.runs.create(thread.id, {
            assistant_id: assistant.id,
        });
        
        // Handle tool calls and wait for completion
        run = await toolset.wait_and_handle_assistant_tool_calls(client, run, thread);
        
        // Check if the run completed successfully
        if (run.status === "completed") {
            const messages = await client.beta.threads.messages.list(thread.id);
            res.json({ status: 'success', messages: messages.data });
        } else {
            res.status(500).json({ status: 'error', message: 'Run did not complete', run });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});
// Start the Express server
app.listen(PORT, () => {
    console.log(`Research Agent server is running on port ${PORT}`);
});

Tool Calling and Composio
Tool calling enables AI models to perform tasks beyond simple conversations, allowing them to interact with external services and applications. Instead of just answering questions, your AI assistant can now browse the internet, schedule meetings, update CRM records, or even manage tasks in project management tools.

With Composio, your AI apps and agents gain access to over 250 integrations, including popular services like GitHub, Google Calendar, Salesforce, Slack, and many more. This means your AI agents can seamlessly handle real-world tasks, saving you time and effort.

Overview

Tool calling flow

Here’s the above example in code:


llm-with-calculator.py

llm-with-calculator.js

import { OpenAIToolSet } from "composio-core"
import { OpenAI } from "openai";
import { z } from "zod"
import dotenv from "dotenv";
dotenv.config();
const openai_client = new OpenAI();
const toolset = new OpenAIToolSet();
await toolset.createAction({
  actionName: "calculateSquareRoot",
  description: "Calculate the square root of a number",
  inputParams: z.object({
      number: z.number()
  }),
  callback: async (inputParams) => {
      const number = inputParams.number;
      const squareRoot = Math.sqrt(number);
      return squareRoot;
  }
});
const tools = await toolset.getTools({
  actions: ["calculateSquareRoot"]
});
const instruction = "What is the square root of 212?";
const response = await openai_client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: instruction }],
  tools: tools,
  tool_choice: "auto",
});
const result = await toolset.handleToolCall(response);
console.log(result);
1
Create tool

Convert a function into LLM-readable form using the @action wrapper (Python) or the callback function (JS)
2
LLM calls the tool

The LLM reasons about the user’s query and decides whethere to use a tool.
If yes, the LLM generate a properly formatted tool use request with the input parameters specified.
3
Handling of the tool call

Composio intercepts, interprets, and calls the actual method defined. handle_tool_calls method interprets the tool call and calls the actual method defined.
Tool Calling with Composio

Composio supports three main ways to use tool calling:

Hosted Tools
Pre-built tools that Composio hosts and maintains, giving you instant access to thousands of actions across hundreds of apps.
Local Tools
Tools that run locally in your environment, like file operations or custom business logic.
Custom Tools
Your own tools defined using Composio’s tool definition format, which can be hosted anywhere.
Using Composio’s Hosted Tools

Composio hosts a growing list of tools from various popular apps like Gmail, Notion to essential apps for AI Engineers like Firecrawl, Browserbase.

This lets you build AI apps and agents without having to manually write the API calls and integrations in the tool format.

Here’s an example of using Firecrawl with to scrape a webpage.

You will need to add a Firecrawl integration. Learn how to do it here

Python

JavaScript

import { OpenAIToolSet } from "composio-core"
import { OpenAI } from "openai";
const openai_client = new OpenAI();
const toolset = new OpenAIToolSet();
const tools = await toolset.getTools({
  actions: ["FIRECRAWL_SCRAPE_EXTRACT_DATA_LLM"]
});
const instruction = "Scrape https://example.com and extract the data";
const response = await openai_client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: instruction }],
  tools: tools,
  tool_choice: "auto",
});
const result = await toolset.handleToolCalls(response);
console.log(result);
Using Composio’s Local Tools

Composio ships with a host of tools that run locally on your system for performing common development tasks like file operations, shell commands, and code execution.

These don’t require any integration or authentication.

Local tools are currently only supported on our Python SDK
These tools run directly on the defined workspace while maintaining security through permission controls.

Workspaces
Workspaces are environments where local tools are fun. Read more about them here.
Workspaces?
from composio_claude import ComposioToolSet, action
from anthropic import Anthropic
client = Anthropic()
toolset = ComposioToolSet()
tools = toolset.get_tools(["FILETOOL_LIST_FILES"])
question = "List all files in the current directory"
response = client.messages.create(
    model="claude-3-5-haiku-latest",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": question}],
)
result = toolset.handle_tool_calls(response)
print(result)

Using Custom Tools

Custom tools allow you to define your own functions for LLMs to call without manually writing JSON schemas. This provides a unified tool calling experience across your application.

These can be:

Functions you define in your codebase
External APIs you want to expose to the LLM
Business logic specific to your application
Custom tools can be seamlessly combined with both local and hosted tools

For creating custom tools using OpenAPI specifications, visit the Custom Tools Dashboard where you can upload and manage your API specs.

Here’s how to create and use custom tools with Composio:


Python

JavaScript

import { OpenAIToolSet } from "composio-core"
import { OpenAI } from "openai";
import { z } from "zod"
import dotenv from "dotenv";
dotenv.config();
const openai_client = new OpenAI();
const toolset = new OpenAIToolSet();
// Create a custom tool
await toolset.createAction({
  actionName: "calculateSum",
  description: "Calculate the sum of two numbers",
  inputParams: z.object({
      a: z.number(),
      b: z.number()
  }),
  callback: async (inputParams) => {
      const a = inputParams.a;
      const b = inputParams.b;
      const sum = a + b;
      return sum;
  }
});
const tools = await toolset.getTools({
  actions: ["calculateSum"]
});
const instruction = "What is 3932 + 2193?";
const response = await openai_client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: instruction }],
  tools: tools,
  tool_choice: "auto",
});
const result = await toolset.handleToolCall(response);
console.log(result);

Triggers
Triggers monitor specific events in apps and notify your AI agents via webhooks or websockets. They send in relevant data that your agents can act upon.

Use gpt-4.5 to reply in greentexts to Slack messages.

Make sure you’ve created an integration and a connection to your Slack account.

Managing Integrations
Learn how to manage integrations and connected accounts.
Managing triggers

1
Enable the Trigger

Enable the “New Message Received” trigger for your Slack app through the dashboard, CLI, or code.

2
Configure Webhook URL

Set up a publicly accessible URL where Composio can send event payloads.

3
Implement Handler

Create a webhook handler to process incoming Slack messages.

Dashboard
CLI
Code
Head to the Slack app in the dashboard and enable the “New Message Recieved” trigger


Specifying Trigger Configuration
Some triggers expect certain configuration in order to set the correct events. You can inspect and add these properties while enabling the triggers!
Viewing the expected configuration

trigger = toolset.get_trigger("GITHUB_STAR_ADDED_EVENT")
print(trigger.config.model_dump_json(indent=4))
Expected properties

{
    "properties": {
        "owner": {
            "description": "Owner of the repository",
            "title": "Owner",
            "default": null,
            "type": "string"
        },
        "repo": {
            "description": "Repository name",
            "title": "Repo",
            "default": null,
            "type": "string"
        }
    },
    "title": "WebhookConfigSchema",
    "type": "object",
    "required": [
        "owner",
        "repo"
    ]
}
Specifying the configuration

response = entity.enable_trigger(
    app=App.GITHUB,
    trigger_name="GITHUB_PULL_REQUEST_EVENT",
    config={"owner": "composiohq", "repo": "composio"},
)
Listeners

Once you have the triggers set up, you can specify listener functions using websockets through the SDK or webhooks.

Specifying Listeners through Websockets

We create a listener and then define a callback function that executes when a listener recieves a payload.

Creating a listener and defining a callback

from composio_openai import ComposioToolSet, App, Action
toolset = ComposioToolSet()
entity = toolset.get_entity(id="default")
listener = toolset.create_trigger_listener()
@listener.callback(
    filters={
        "trigger_name": "SLACK_RECEIVE_MESSAGE",
    }
)
def handle_slack_message(event):
    print(event)
listener.wait_forever()
Specifying Listeners through Webhooks

Assuming you’ve already set up a trigger as discussed in previous steps, here’s how you can use webhooks instead to listen in on new events happening in an app.

1
Configure Webhook URL

To receive trigger events via webhooks, you need to configure a publicly accessible URL where Composio can send the event payloads. This URL should point to an endpoint in your application that can process incoming webhook requests.


2
Listening on the webhooks

To demonstrate, here’s a FastAPI server to handle incoming webhook requests.

from fastapi import FastAPI, Request
from typing import Dict, Any
import uvicorn
import json
app = FastAPI(title="Webhook Demo")
@app.post("/webhook")
async def webhook_handler(request: Request):
    # Get the raw payload
    payload = await request.json()
    
    # Log the received webhook data
    print("Received webhook payload:")
    print(json.dumps(payload, indent=2))
    
    # Return a success response
    return {"status": "success", "message": "Webhook received"}
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

To test out webhooks locally, use an SSH tunnel like ngrok
Demo: Roast Slack Messages

Let’s build a fun bot that generates snarky greentext responses to Slack messages using gpt-4.5.

1
Set up the FastAPI Server

First, let’s create a FastAPI server to handle webhook events:

from fastapi import FastAPI, Request
from openai import OpenAI
from composio_openai import ComposioToolSet, App, Action
from dotenv import load_dotenv
import uvicorn
load_dotenv()
app = FastAPI()
client = OpenAI()
toolset = ComposioToolSet()
entity = toolset.get_entity(id="default")

2
Track Responded Threads

Create a set to avoid duplicate responses:

# Set to keep track of threads we've already responded to
responded_threads = set()

3
Implement Response Generation

Create a function to generate snarky responses using gpt-4.5. We’ll also set up a preprocessor to handle Slack-specific message parameters:

async def generate_response(payload: Dict[str, Any]):
    ts = payload.get("data", {}).get("ts", "")
    thread_ts = payload.get("data", {}).get("thread_ts", ts)
    channel = payload.get("data", {}).get("channel", "")
    
    # Skip if already responded
    if thread_ts in responded_threads:
        return
    
    responded_threads.add(thread_ts)
    
    # Preprocessor to automatically inject Slack-specific parameters
    def slack_send_message_preprocessor(inputs: Dict[str, Any]) -> Dict[str, Any]:
        inputs["thread_ts"] = ts          # Ensure reply goes to the correct thread
        inputs["channel"] = channel       # Target the specific channel
        inputs["mrkdwn"] = False         # Disable markdown for greentext formatting
        return inputs

4
Configure the tools

Set up the tools for sending Slack messages. We attach our preprocessor to automatically handle message threading and formatting:

# Configure tools with the preprocessor to handle Slack-specific parameters
tools = toolset.get_tools(
    [Action.SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL],
    processors={
        "pre": {
            Action.SLACK_SENDS_A_MESSAGE_TO_A_SLACK_CHANNEL: slack_send_message_preprocessor
        }
    }
)
response = client.chat.completions.create(
    model="gpt-4.5-preview",
    messages=[
        {"role": "system", "content": "Given a slack text. Generate a snarky greentext response mocking the user. Render the response in ``` codeblocks"},
        {"role": "user", "content": payload.get("data", {}).get("text")}
    ],
    tools=tools,
    tool_choice="required"
)
toolset.handle_tool_calls(response, entity_id="default")

The preprocessor ensures that every message is automatically configured with the correct thread, channel, and formatting settings, reducing the chance of misconfigured responses.

5
Create Webhook Handler

Set up the webhook endpoint to process incoming messages:

@app.post("/webhook")
async def webhook_handler(request: Request):
    payload = await request.json()
    if payload.get("type") == "slack_receive_message":
        channel = payload.get("data", {}).get("channel")
        if channel == "YOUR_CHANNEL_ID":  # Replace with your channel ID
            await generate_response(payload)
    return {"status": "success", "message": "Webhook received"}
uvicorn.run(app, host="0.0.0.0", port=8000)

Testing Locally
Run your server locally and use ngrok to expose it:
# Start your FastAPI server
python webhook.py
# In another terminal, start ngrok
ngrok http 8000

Remember to update your webhook URL in the Composio dashboard with your ngrok URL.

Troubleshooting

If you encounter issues with triggers or webhook listeners, you can use the Composio dashboard to inspect detailed trigger logs. The dashboard allows you to review event payloads, identify errors, and manually resend events for testing purposes.