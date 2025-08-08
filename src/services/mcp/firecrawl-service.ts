import { BaseMCPService, MCPTool, MCPRequest, MCPResponse } from './base';

export class FirecrawlMCPService extends BaseMCPService {
  name = 'firecrawl';
  description = 'Firecrawl web scraping for D&D research and content inspiration';

  private readonly apiKey = process.env.FIRECRAWL_API_KEY;
  private readonly baseUrl = 'https://api.firecrawl.dev/v0';

  getAvailableTools(): MCPTool[] {
    return [
      {
        name: 'scrape_dnd_content',
        description: 'Scrape D&D content from official or community sources',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            include_tags: { type: 'array', items: { type: 'string' } },
            exclude_tags: { type: 'array', items: { type: 'string' } },
            only_main_content: { type: 'boolean', default: true }
          },
          required: ['url']
        }
      },
      {
        name: 'search_dnd_wikis',
        description: 'Search D&D wikis and databases for specific content',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            sources: { 
              type: 'array', 
              items: { type: 'string' },
              default: ['https://forgottenrealms.fandom.com', 'https://dnd.wizards.com']
            },
            max_pages: { type: 'number', default: 5 }
          },
          required: ['query']
        }
      },
      {
        name: 'scrape_adventure_inspiration',
        description: 'Scrape content for adventure and campaign inspiration',
        inputSchema: {
          type: 'object',
          properties: {
            topic: { type: 'string' },
            content_type: { 
              type: 'string',
              enum: ['adventure_hooks', 'npcs', 'locations', 'magic_items', 'encounters']
            },
            difficulty_level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] }
          },
          required: ['topic', 'content_type']
        }
      },
      {
        name: 'monitor_official_updates',
        description: 'Monitor official D&D sources for new content',
        inputSchema: {
          type: 'object',
          properties: {
            sources: { 
              type: 'array',
              items: { type: 'string' },
              default: ['https://dnd.wizards.com/news']
            },
            content_types: {
              type: 'array',
              items: { type: 'string' },
              default: ['announcements', 'errata', 'unearthed_arcana']
            }
          }
        }
      }
    ];
  }

  async executeRequest(request: MCPRequest): Promise<MCPResponse> {
    if (!this.apiKey) {
      return { success: false, error: 'Firecrawl API key not configured' };
    }

    try {
      switch (request.method) {
        case 'scrape_dnd_content':
          return await this.scrapeDndContent(request.params);
        
        case 'search_dnd_wikis':
          return await this.searchDndWikis(request.params);
          
        case 'scrape_adventure_inspiration':
          return await this.scrapeAdventureInspiration(request.params);
          
        case 'monitor_official_updates':
          return await this.monitorOfficialUpdates(request.params);
          
        default:
          return { success: false, error: `Unknown method: ${request.method}` };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async scrapeDndContent(params: Record<string, unknown>): Promise<MCPResponse> {
    const url = params.url as string;
    const includeTags = params.include_tags as string[] || [];
    const excludeTags = params.exclude_tags as string[] || [];
    const onlyMainContent = params.only_main_content as boolean ?? true;

    const scrapeOptions = {
      url,
      includeTags,
      excludeTags,
      onlyMainContent,
      formats: ['markdown', 'html']
    };

    const response = await fetch(`${this.baseUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scrapeOptions)
    });

    if (!response.ok) {
      return { success: false, error: `Firecrawl API error: ${response.statusText}` };
    }

    const data = await response.json();
    return { 
      success: true, 
      data: {
        content: data.data.content,
        metadata: data.data.metadata,
        scraping_info: {
          url,
          timestamp: new Date().toISOString(),
          source: 'firecrawl'
        }
      }
    };
  }

  private async searchDndWikis(params: Record<string, unknown>): Promise<MCPResponse> {
    const query = params.query as string;
    const sources = params.sources as string[] || ['https://forgottenrealms.fandom.com'];
    const maxPages = params.max_pages as number || 5;

    const results = [];

    for (const source of sources) {
      try {
        const searchUrl = this.buildSearchUrl(source, query);
        
        const response = await fetch(`${this.baseUrl}/search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query,
            limit: maxPages,
            domain: new URL(source).hostname
          })
        });

        if (response.ok) {
          const searchData = await response.json();
          results.push({
            source,
            query,
            results: searchData.data || []
          });
        }
      } catch (error) {
        console.warn(`Failed to search ${source}:`, error);
      }
    }

    return { success: true, data: results };
  }

  private async scrapeAdventureInspiration(params: Record<string, unknown>): Promise<MCPResponse> {
    const topic = params.topic as string;
    const contentType = params.content_type as string;
    const difficultyLevel = params.difficulty_level as string || 'intermediate';

    const inspirationSources = this.getInspirationSources(contentType);
    const results = [];

    for (const source of inspirationSources) {
      try {
        const searchQuery = `${topic} ${contentType} ${difficultyLevel} D&D`;
        
        const response = await fetch(`${this.baseUrl}/scrape`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: source,
            onlyMainContent: true,
            formats: ['markdown']
          })
        });

        if (response.ok) {
          const scrapeData = await response.json();
          results.push({
            source,
            content_type: contentType,
            topic,
            difficulty_level: difficultyLevel,
            content: scrapeData.data.content,
            metadata: scrapeData.data.metadata
          });
        }
      } catch (error) {
        console.warn(`Failed to scrape ${source}:`, error);
      }
    }

    return { success: true, data: results };
  }

  private async monitorOfficialUpdates(params: Record<string, unknown>): Promise<MCPResponse> {
    const sources = params.sources as string[] || ['https://dnd.wizards.com/news'];
    const contentTypes = params.content_types as string[] || ['announcements'];

    const updates = [];

    for (const source of sources) {
      try {
        const response = await fetch(`${this.baseUrl}/scrape`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: source,
            onlyMainContent: true,
            formats: ['markdown'],
            includeTags: ['article', 'news', 'update']
          })
        });

        if (response.ok) {
          const scrapeData = await response.json();
          updates.push({
            source,
            content_types: contentTypes,
            content: scrapeData.data.content,
            metadata: scrapeData.data.metadata,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.warn(`Failed to monitor ${source}:`, error);
      }
    }

    return { success: true, data: updates };
  }

  private buildSearchUrl(baseUrl: string, query: string): string {
    if (baseUrl.includes('fandom.com')) {
      return `${baseUrl}/wiki/Special:Search?query=${encodeURIComponent(query)}`;
    }
    if (baseUrl.includes('dnd.wizards.com')) {
      return `${baseUrl}/search?q=${encodeURIComponent(query)}`;
    }
    return `${baseUrl}/search?q=${encodeURIComponent(query)}`;
  }

  private getInspirationSources(contentType: string): string[] {
    const sourceMap: Record<string, string[]> = {
      adventure_hooks: [
        'https://www.dndbeyond.com/posts/adventure-hooks',
        'https://www.reddit.com/r/DMAcademy'
      ],
      npcs: [
        'https://www.dndbeyond.com/npcs',
        'https://forgottenrealms.fandom.com'
      ],
      locations: [
        'https://forgottenrealms.fandom.com',
        'https://www.dmsguild.com'
      ],
      magic_items: [
        'https://www.dndbeyond.com/magic-items',
        'https://roll20.net/compendium/dnd5e'
      ],
      encounters: [
        'https://kobold.club/fight/',
        'https://www.reddit.com/r/DMAcademy'
      ]
    };

    return sourceMap[contentType] || ['https://www.dndbeyond.com'];
  }
}