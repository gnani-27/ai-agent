import { Agent, run, tool } from "@openai/agents";
import { json, z } from "zod";
import axios from "axios";

const getWeatherResultSchema = z.object({
  city: z.string().describe("Name of City"),
  degree: z.number().describe("temperature of the city"),
  condition: z.string().describe("condition of the weather"),
});

const getWeatherTool = tool({
  name: "get_weather",
  description: "Return the current weather form the given city",
  parameters: z.object({
    city: z.string().describe("Name of City"),
  }),

  execute: async function ({ city }) {
    // Todo Replace With Api Call
    const url = `https://wttr.in/${city.toLocaleLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: "text" });
    return `The weather of ${city} is ${response.data}`;
  },
});

const sendEmail = tool({
  name: "send_email",
  description: "This tool sends email",
  parameters: z.object({
    toEmail: z.string().describe("Email address to send email"),
    subject: z.string().describe("Email Subject"),
    body: z.string().describe("Email Body"),
  }),

  execute: async function ({ toEmail, subject, body }) {},
});

async function WeatherAgent(query = "", model) {
  const agent = new Agent({
    name: "Weather Agent",
    model,

    instructions: `
      You are a helpful weather assistant.

      Answer weather-related questions clearly.
      If you do not have access to real-time weather data,
      explicitly tell the user that you cannot verify current weather.
      Never invent live weather conditions.
    `,
    tools: [getWeatherTool, sendEmail],
    outputType: getWeatherResultSchema,
  });

  const result = await run(agent, query);

  return result.finalOutput;
}

export default WeatherAgent;
