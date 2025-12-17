import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { z } from 'zod';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Try to load .env.mcp file first, then fall back to .env
dotenv.config({ path: resolve(process.cwd(), '.env.mcp') });
dotenv.config(); // Also load .env for backward compatibility

const RENDER_API_KEY = process.env.RENDER_API_KEY;

if (!RENDER_API_KEY) {
  throw new Error('Missing required environment variable: RENDER_API_KEY must be set');
}
const RENDER_API_BASE = 'https://api.render.com/v1';

const server = new Server(
  {
    name: 'render-mcp-server',
    version: '1.0.0',
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_services',
        description: 'List all services in your Render account',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of services to return',
            },
          },
        },
      },
      {
        name: 'get_service_info',
        description: 'Get detailed information about a specific service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceId: {
              type: 'string',
              description: 'ID of the service',
            },
          },
          required: ['serviceId'],
        },
      },
      {
        name: 'get_service_logs',
        description: 'Get logs for a specific service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceId: {
              type: 'string',
              description: 'ID of the service',
            },
            lines: {
              type: 'number',
              description: 'Number of log lines to retrieve',
            },
          },
          required: ['serviceId'],
        },
      },
      {
        name: 'trigger_deploy',
        description: 'Trigger a new deployment for a service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceId: {
              type: 'string',
              description: 'ID of the service',
            },
            clearCache: {
              type: 'boolean',
              description: 'Whether to clear build cache',
            },
          },
          required: ['serviceId'],
        },
      },
      {
        name: 'update_env_vars',
        description: 'Update environment variables for a service',
        inputSchema: {
          type: 'object',
          properties: {
            serviceId: {
              type: 'string',
              description: 'ID of the service',
            },
            envVars: {
              type: 'object',
              description: 'Object containing environment variables',
            },
          },
          required: ['serviceId', 'envVars'],
        },
      },
      {
        name: 'test_render_connection',
        description: 'Test connection to Render API',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

async function makeRenderRequest(endpoint: string, method: string = 'GET', data?: any) {
  const config = {
    method,
    url: `${RENDER_API_BASE}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${RENDER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    data,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Render API error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
    }
    throw error;
  }
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_services': {
        const { limit = 20 } = z.object({ limit: z.number().optional() }).parse(args);
        const services = await makeRenderRequest(`/services?limit=${limit}`);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(services, null, 2),
            },
          ],
        };
      }

      case 'get_service_info': {
        const { serviceId } = z.object({ serviceId: z.string() }).parse(args);
        const service = await makeRenderRequest(`/services/${serviceId}`);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(service, null, 2),
            },
          ],
        };
      }

      case 'get_service_logs': {
        const { serviceId, lines = 100 } = z.object({ 
          serviceId: z.string(), 
          lines: z.number().optional() 
        }).parse(args);
        const logs = await makeRenderRequest(`/services/${serviceId}/logs?lines=${lines}`);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(logs, null, 2),
            },
          ],
        };
      }

      case 'trigger_deploy': {
        const { serviceId, clearCache = false } = z.object({ 
          serviceId: z.string(), 
          clearCache: z.boolean().optional() 
        }).parse(args);
        
        const deployData = {
          clearCache,
        };
        
        const result = await makeRenderRequest(`/services/${serviceId}/deploys`, 'POST', deployData);
        
        return {
          content: [
            {
              type: 'text',
              text: `Deployment triggered successfully! Deploy ID: ${result.id}`,
            },
          ],
        };
      }

      case 'update_env_vars': {
        const { serviceId, envVars } = z.object({ 
          serviceId: z.string(), 
          envVars: z.record(z.string()) 
        }).parse(args);
        
        const envVarArray = Object.entries(envVars).map(([key, value]) => ({
          key,
          value,
        }));
        
        const result = await makeRenderRequest(`/services/${serviceId}/env-vars`, 'PUT', envVarArray);
        
        return {
          content: [
            {
              type: 'text',
              text: 'Environment variables updated successfully!',
            },
          ],
        };
      }

      case 'test_render_connection': {
        const result = await makeRenderRequest('/services?limit=1');
        
        return {
          content: [
            {
              type: 'text',
              text: 'Successfully connected to Render API!',
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Render MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});