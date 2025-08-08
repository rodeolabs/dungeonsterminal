import { BaseMCPService, MCPTool, MCPRequest, MCPResponse } from './base';

export class GitHubMCPService extends BaseMCPService {
  name = 'github';
  description = 'GitHub repository management and documentation for the AI DM project';

  private readonly token = process.env.GITHUB_TOKEN;
  private readonly baseUrl = 'https://api.github.com';

  getAvailableTools(): MCPTool[] {
    return [
      {
        name: 'create_documentation',
        description: 'Create or update project documentation',
        inputSchema: {
          type: 'object',
          properties: {
            repo: { type: 'string' },
            path: { type: 'string' },
            content: { type: 'string' },
            message: { type: 'string' },
            branch: { type: 'string', default: 'main' }
          },
          required: ['repo', 'path', 'content', 'message']
        }
      },
      {
        name: 'create_issue',
        description: 'Create GitHub issues for bug tracking and feature requests',
        inputSchema: {
          type: 'object',
          properties: {
            repo: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
            labels: { type: 'array', items: { type: 'string' } },
            assignees: { type: 'array', items: { type: 'string' } }
          },
          required: ['repo', 'title', 'body']
        }
      },
      {
        name: 'create_release',
        description: 'Create GitHub releases for version management',
        inputSchema: {
          type: 'object',
          properties: {
            repo: { type: 'string' },
            tag_name: { type: 'string' },
            name: { type: 'string' },
            body: { type: 'string' },
            draft: { type: 'boolean', default: false },
            prerelease: { type: 'boolean', default: false }
          },
          required: ['repo', 'tag_name', 'name']
        }
      },
      {
        name: 'get_repository_info',
        description: 'Get repository information and statistics',
        inputSchema: {
          type: 'object',
          properties: {
            repo: { type: 'string' }
          },
          required: ['repo']
        }
      },
      {
        name: 'manage_project_board',
        description: 'Manage GitHub project boards for task tracking',
        inputSchema: {
          type: 'object',
          properties: {
            repo: { type: 'string' },
            action: { type: 'string', enum: ['create', 'list', 'update'] },
            project_data: { type: 'object' }
          },
          required: ['repo', 'action']
        }
      },
      {
        name: 'analyze_code_quality',
        description: 'Analyze code quality and generate reports',
        inputSchema: {
          type: 'object',
          properties: {
            repo: { type: 'string' },
            branch: { type: 'string', default: 'main' },
            include_metrics: { 
              type: 'array',
              items: { type: 'string' },
              default: ['complexity', 'coverage', 'dependencies']
            }
          },
          required: ['repo']
        }
      }
    ];
  }

  async executeRequest(request: MCPRequest): Promise<MCPResponse> {
    if (!this.token) {
      return { success: false, error: 'GitHub token not configured' };
    }

    try {
      switch (request.method) {
        case 'create_documentation':
          return await this.createDocumentation(request.params);
        
        case 'create_issue':
          return await this.createIssue(request.params);
          
        case 'create_release':
          return await this.createRelease(request.params);
          
        case 'get_repository_info':
          return await this.getRepositoryInfo(request.params);
          
        case 'manage_project_board':
          return await this.manageProjectBoard(request.params);
          
        case 'analyze_code_quality':
          return await this.analyzeCodeQuality(request.params);
          
        default:
          return { success: false, error: `Unknown method: ${request.method}` };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async createDocumentation(params: Record<string, unknown>): Promise<MCPResponse> {
    const repo = params.repo as string;
    const path = params.path as string;
    const content = params.content as string;
    const message = params.message as string;
    const branch = (params.branch as string) || 'main';

    const encodedContent = Buffer.from(content).toString('base64');
    
    // First, try to get the file to see if it exists
    let sha: string | undefined;
    try {
      const getResponse = await fetch(`${this.baseUrl}/repos/${repo}/contents/${path}?ref=${branch}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }
    } catch (error) {
      // File doesn't exist, which is fine for creation
    }

    const requestBody: Record<string, unknown> = {
      message,
      content: encodedContent,
      branch
    };
    
    if (sha) {
      requestBody.sha = sha;
    }

    const response = await fetch(`${this.baseUrl}/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      return { success: false, error: `GitHub API error: ${response.statusText}` };
    }

    const data = await response.json();
    return { success: true, data };
  }

  private async createIssue(params: Record<string, unknown>): Promise<MCPResponse> {
    const repo = params.repo as string;
    const title = params.title as string;
    const body = params.body as string;
    const labels = params.labels as string[] || [];
    const assignees = params.assignees as string[] || [];

    const response = await fetch(`${this.baseUrl}/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        body,
        labels,
        assignees
      })
    });

    if (!response.ok) {
      return { success: false, error: `GitHub API error: ${response.statusText}` };
    }

    const data = await response.json();
    return { success: true, data };
  }

  private async createRelease(params: Record<string, unknown>): Promise<MCPResponse> {
    const repo = params.repo as string;
    const tagName = params.tag_name as string;
    const name = params.name as string;
    const body = params.body as string || '';
    const draft = params.draft as boolean || false;
    const prerelease = params.prerelease as boolean || false;

    const response = await fetch(`${this.baseUrl}/repos/${repo}/releases`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag_name: tagName,
        name,
        body,
        draft,
        prerelease
      })
    });

    if (!response.ok) {
      return { success: false, error: `GitHub API error: ${response.statusText}` };
    }

    const data = await response.json();
    return { success: true, data };
  }

  private async getRepositoryInfo(params: Record<string, unknown>): Promise<MCPResponse> {
    const repo = params.repo as string;

    const response = await fetch(`${this.baseUrl}/repos/${repo}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      return { success: false, error: `GitHub API error: ${response.statusText}` };
    }

    const data = await response.json();
    return { 
      success: true, 
      data: {
        name: data.name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        language: data.language,
        created_at: data.created_at,
        updated_at: data.updated_at,
        default_branch: data.default_branch,
        open_issues: data.open_issues_count
      }
    };
  }

  private async manageProjectBoard(params: Record<string, unknown>): Promise<MCPResponse> {
    const repo = params.repo as string;
    const action = params.action as string;
    
    switch (action) {
      case 'list':
        return await this.listProjectBoards(repo);
      case 'create':
        return await this.createProjectBoard(repo, params.project_data as Record<string, unknown>);
      default:
        return { success: false, error: `Unsupported project board action: ${action}` };
    }
  }

  private async listProjectBoards(repo: string): Promise<MCPResponse> {
    const response = await fetch(`${this.baseUrl}/repos/${repo}/projects`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.inertia-preview+json'
      }
    });

    if (!response.ok) {
      return { success: false, error: `GitHub API error: ${response.statusText}` };
    }

    const data = await response.json();
    return { success: true, data };
  }

  private async createProjectBoard(repo: string, projectData: Record<string, unknown>): Promise<MCPResponse> {
    const response = await fetch(`${this.baseUrl}/repos/${repo}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.inertia-preview+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      return { success: false, error: `GitHub API error: ${response.statusText}` };
    }

    const data = await response.json();
    return { success: true, data };
  }

  private async analyzeCodeQuality(params: Record<string, unknown>): Promise<MCPResponse> {
    const repo = params.repo as string;
    const branch = (params.branch as string) || 'main';
    const includeMetrics = (params.include_metrics as string[]) || ['complexity', 'coverage'];

    const analysis = {
      repository: repo,
      branch,
      timestamp: new Date().toISOString(),
      metrics: {},
      recommendations: []
    };

    // This is a simplified implementation
    // In a real scenario, you'd integrate with code analysis tools
    if (includeMetrics.includes('complexity')) {
      analysis.metrics.complexity = {
        average_cyclomatic_complexity: 'TBD',
        high_complexity_functions: []
      };
      analysis.recommendations.push('Consider breaking down complex functions');
    }

    if (includeMetrics.includes('coverage')) {
      analysis.metrics.coverage = {
        line_coverage: 'TBD',
        branch_coverage: 'TBD'
      };
      analysis.recommendations.push('Increase test coverage to at least 80%');
    }

    if (includeMetrics.includes('dependencies')) {
      analysis.metrics.dependencies = {
        total_dependencies: 'TBD',
        outdated_dependencies: [],
        security_vulnerabilities: []
      };
      analysis.recommendations.push('Keep dependencies up to date');
    }

    return { success: true, data: analysis };
  }
}