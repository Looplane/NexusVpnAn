import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Try to load .env.mcp file first, then fall back to .env
dotenv.config({ path: resolve(process.cwd(), '.env.mcp') });
dotenv.config(); // Also load .env for backward compatibility

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_KEY must be set');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const server = new Server(
  {
    name: 'supabase-mcp-server',
    version: '1.0.0',
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query_database',
        description: 'Execute a SQL query on the Supabase database',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL query to execute',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_table_info',
        description: 'Get information about database tables',
        inputSchema: {
          type: 'object',
          properties: {
            tableName: {
              type: 'string',
              description: 'Name of the table',
            },
          },
          required: ['tableName'],
        },
      },
      {
        name: 'test_connection',
        description: 'Test connection to Supabase database',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'query_database': {
        const { query } = z.object({ query: z.string() }).parse(args);
        const { data, error } = await supabase.rpc('exec_sql', { sql: query });
        
        if (error) {
          throw new Error(`Database query failed: ${error.message}`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'get_table_info': {
        const { tableName } = z.object({ tableName: z.string() }).parse(args);
        const { data, error } = await supabase
          .from('information_schema.columns')
          .select('*')
          .eq('table_name', tableName);
        
        if (error) {
          throw new Error(`Failed to get table info: ${error.message}`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'test_connection': {
        const { data, error } = await supabase.rpc('version');
        
        if (error) {
          throw new Error(`Connection test failed: ${error.message}`);
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully connected to Supabase! Database version: ${data}`,
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
  console.error('Supabase MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});