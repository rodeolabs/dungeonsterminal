import { BaseMCPService, MCPTool, MCPRequest, MCPResponse } from './base';
import { supabase, supabaseAdmin } from '../../lib/supabase';

export class SupabaseMCPService extends BaseMCPService {
  name = 'supabase';
  description = 'Supabase database operations for campaigns, characters, and sessions';

  getAvailableTools(): MCPTool[] {
    return [
      {
        name: 'query_campaigns',
        description: 'Query campaigns with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            user_id: { type: 'string' },
            status: { type: 'string' },
            limit: { type: 'number', default: 10 }
          }
        }
      },
      {
        name: 'create_campaign',
        description: 'Create a new campaign',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            dm_user_id: { type: 'string' },
            setting_info: { type: 'object' },
            max_players: { type: 'number', default: 6 }
          },
          required: ['title', 'dm_user_id']
        }
      },
      {
        name: 'query_characters',
        description: 'Query characters with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            campaign_id: { type: 'string' },
            player_user_id: { type: 'string' },
            limit: { type: 'number', default: 10 }
          }
        }
      },
      {
        name: 'create_character',
        description: 'Create a new character',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            class: { type: 'string' },
            race: { type: 'string' },
            campaign_id: { type: 'string' },
            player_user_id: { type: 'string' },
            level: { type: 'number', default: 1 },
            stats: { type: 'object' },
            background: { type: 'string' },
            backstory: { type: 'string' }
          },
          required: ['name', 'class', 'race', 'campaign_id', 'player_user_id']
        }
      },
      {
        name: 'create_session',
        description: 'Create a new session',
        inputSchema: {
          type: 'object',
          properties: {
            campaign_id: { type: 'string' },
            session_number: { type: 'number' },
            title: { type: 'string' },
            session_date: { type: 'string' }
          },
          required: ['campaign_id', 'session_number']
        }
      },
      {
        name: 'update_session',
        description: 'Update session with narrative log, encounters, etc.',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: { type: 'string' },
            narrative_log: { type: 'array' },
            combat_encounters: { type: 'array' },
            npc_interactions: { type: 'array' },
            notes: { type: 'string' },
            status: { type: 'string' }
          },
          required: ['session_id']
        }
      }
    ];
  }

  async executeRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'query_campaigns':
          return await this.queryCampaigns(request.params);
        
        case 'create_campaign':
          return await this.createCampaign(request.params);
          
        case 'query_characters':
          return await this.queryCharacters(request.params);
          
        case 'create_character':
          return await this.createCharacter(request.params);
          
        case 'create_session':
          return await this.createSession(request.params);
          
        case 'update_session':
          return await this.updateSession(request.params);
          
        default:
          return { success: false, error: `Unknown method: ${request.method}` };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async queryCampaigns(params: Record<string, unknown>): Promise<MCPResponse> {
    let query = supabase.from('campaigns').select('*');
    
    if (params.user_id) {
      query = query.eq('dm_user_id', params.user_id);
    }
    if (params.status) {
      query = query.eq('status', params.status);
    }
    
    const limit = (params.limit as number) || 10;
    query = query.limit(limit);
    
    const { data, error } = await query;
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  }

  private async createCampaign(params: Record<string, unknown>): Promise<MCPResponse> {
    const { data, error } = await supabase.from('campaigns').insert({
      title: params.title as string,
      description: params.description as string || null,
      dm_user_id: params.dm_user_id as string,
      setting_info: params.setting_info as Record<string, unknown> || {},
      max_players: (params.max_players as number) || 6
    }).select().single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  }

  private async queryCharacters(params: Record<string, unknown>): Promise<MCPResponse> {
    let query = supabase.from('characters').select('*');
    
    if (params.campaign_id) {
      query = query.eq('campaign_id', params.campaign_id);
    }
    if (params.player_user_id) {
      query = query.eq('player_user_id', params.player_user_id);
    }
    
    const limit = (params.limit as number) || 10;
    query = query.limit(limit);
    
    const { data, error } = await query;
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  }

  private async createCharacter(params: Record<string, unknown>): Promise<MCPResponse> {
    const { data, error } = await supabase.from('characters').insert({
      name: params.name as string,
      class: params.class as string,
      race: params.race as string,
      campaign_id: params.campaign_id as string,
      player_user_id: params.player_user_id as string,
      level: (params.level as number) || 1,
      stats: params.stats as Record<string, unknown> || {
        strength: 10, dexterity: 10, constitution: 10,
        intelligence: 10, wisdom: 10, charisma: 10
      },
      background: params.background as string || null,
      backstory: params.backstory as string || null
    }).select().single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  }

  private async createSession(params: Record<string, unknown>): Promise<MCPResponse> {
    const { data, error } = await supabase.from('sessions').insert({
      campaign_id: params.campaign_id as string,
      session_number: params.session_number as number,
      title: params.title as string || null,
      session_date: params.session_date as string || null
    }).select().single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  }

  private async updateSession(params: Record<string, unknown>): Promise<MCPResponse> {
    const updateData: Record<string, unknown> = {};
    
    if (params.narrative_log) updateData.narrative_log = params.narrative_log;
    if (params.combat_encounters) updateData.combat_encounters = params.combat_encounters;
    if (params.npc_interactions) updateData.npc_interactions = params.npc_interactions;
    if (params.notes) updateData.notes = params.notes;
    if (params.status) updateData.status = params.status;
    
    const { data, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', params.session_id as string)
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  }
}