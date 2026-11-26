import "dotenv/config";

import {
  Agent,
  OpenAIChatCompletionsModel,
  run,
  setTracingDisabled,
  tool,
} from "@openai/agents";
import { z } from "zod";
import OpenAI from "openai";
import fs from "node:fs/promises";

// Disable OpenAI tracing
setTracingDisabled(true);

// Connect to remote Ollama
const openai = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL,
  apiKey: "ollama",
});

// Configure local model
const model = new OpenAIChatCompletionsModel(openai, process.env.OLLAMA_MODEL);

const fetchAvailablePlans = new tool({
  name: "fetch_available_plans",
  description: "fetch available internet for  plan",
  parameters: z.object({}),
  execute: async () => {
    return [
      { plan_id: "1", price_inr: 399, speed: "30MB/s" },
      { plan_id: "2", price_inr: 599, speed: "100MB/s" },
      { plan_id: "3", price_inr: 699, speed: "300MB/s" },
      { plan_id: "4", price_inr: 3599, speed: "1GB/s" },
    ];
  },
});

const processRefund = tool({
  name: "process_refund",
  description: "This tool processes the refund for a customer",
  parameters: z.object({
    customerId: z.string().describe("id of the customer"),
    reason: z.string().describe("reason for refund"),
  }),
  execute: async ({ customerId, reason }) => {
    console.log(
      `Processing refund for customer ${customerId} with reason ${reason}`,
    );
    fs.appendFile(
      "./refund.txt",
      `Refund for customer having ID ${customerId} for ${reason}`,
      "utf-8",
    );
    return `Refund processed for customer ${customerId}`;
  },
});

const refundAgent = new Agent({
  name: "Refund Agent",
  model: model,
  instructions: `
        You are an expert issuing refunds to Customer
    `,
  tools: [processRefund],
});

const salesAgent = new Agent({
  name: "Sales Agent",
  model: model,
  instructions: `
        You are an expert sales agent for an internet broadband Company,
        Talk to the user and help them with what they need
    `,
  tools: [
    fetchAvailablePlans,
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles refund questions and request",
    }),
  ],
});

async function runAgent(query = "") {
  try {
    // const result = await run(salesAgent, query);
    const result = await run(salesAgent, query);
    console.log(result.finalOutput);
  } catch (error) {
    console.log("Manger Error", error);
  }
}

runAgent(
  "I had a plan 3999, I need a refund right now. my customer id is cust123, Because I shifting to a new place",
);
