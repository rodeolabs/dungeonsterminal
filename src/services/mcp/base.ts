export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPRequest {
  method: string;
  params: Record<string, unknown>;
}

export interface MCPResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export abstract class BaseMCPService {
  abstract name: string;
  abstract description: string;
  
  abstract getAvailableTools(): MCPTool[];
  abstract executeRequest(request: MCPRequest): Promise<MCPResponse>;
  
  protected handleError(error: unknown): MCPResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage
    };
  }
}