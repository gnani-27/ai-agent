import "dotenv/config";

import {
  Agent,
  run,
  OpenAIChatCompletionsModel,
  setTracingDisabled,
} from "@openai/agents";

import OpenAI from "openai";
import WeatherAgent from "./agent_tool.js";

// Disable OpenAI tracing
setTracingDisabled(true);

// Connect to remote Ollama
const openai = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL,
  apiKey: "ollama",
});

// Configure local model
const model = new OpenAIChatCompletionsModel(openai, process.env.OLLAMA_MODEL);

const query = "What is the weather in Chitradurga, Bengaluru, and Mysore?";
async function main() {
  try {
    const result = await WeatherAgent(query, model);
    console.log("Agent Response:");
    console.log(result);
  } catch (error) {
    console.error("Agent Error:", error.message);
  }
}

main();
