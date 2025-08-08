import OpenAI from 'openai';
import { supabase } from '../lib/supabase';
import { mcpManager } from './mcp/mcp-manager';
import { logger } from '../utils/logger';

export interface NarrativeRequest {
  prompt: string;
  context?: {
    campaignId?: string;
    sessionId?: string;
    characterNames?: string[];
    currentLocation?: string;
    recentEvents?: string[];
  };
  style?: 'dramatic' | 'humorous' | 'serious' | 'mysterious';
  length?: 'short' | 'medium' | 'long';
}

export interface NarrativeResponse {
  narrative: string;
  suggestions?: string[];
  npcDialogue?: string[];
  environmentalDetails?: string[];
  actionPrompts?: string[];
  metadata: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    model: string;
    timestamp: string;
  };
}

export interface EncounterRequest {
  partyLevel: number;
  partySize: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  environment?: string;
  monsterTypes?: string[];
  theme?: string;
}

export interface EncounterResponse {
  monsters: Array<{
    name: string;
    quantity: number;
    challengeRating: string;
    hitPoints: number;
    armorClass: number;
    abilities?: Record<string, unknown>;
  }>;
  encounterDescription: string;
  tacticalNotes: string[];
  estimatedDuration: string;
  xpReward: number;
}

export class AIDungeonMaster {
  private openai: OpenAI;
  private systemPrompt: string;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.systemPrompt = this.buildSystemPrompt();
  }

  public async generateNarrative(request: NarrativeRequest): Promise<NarrativeResponse> {
    try {
      logger.info('Generating narrative for AI DM', { prompt: request.prompt.substring(0, 100) });

      const contextualPrompt = await this.buildContextualPrompt(request);
      const styleInstructions = this.getStyleInstructions(request.style);
      const lengthInstructions = this.getLengthInstructions(request.length);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: `${this.systemPrompt}\n\n${styleInstructions}\n${lengthInstructions}` },
          { role: 'user', content: contextualPrompt }
        ],
        temperature: 0.8,
        max_tokens: this.getMaxTokens(request.length),
      });

      const narrative = completion.choices[0]?.message?.content || '';
      const usage = completion.usage;

      // Parse the response to extract different components
      const parsedResponse = this.parseNarrativeResponse(narrative);

      // Store the generated content for future reference
      if (request.context?.campaignId) {
        await this.storeAIContent({
          contentType: 'narrative',
          prompt: request.prompt,
          generatedContent: narrative,
          campaignId: request.context.campaignId,
          sessionId: request.context.sessionId,
          metadata: {
            style: request.style,
            length: request.length,
            context: request.context
          }
        });
      }

      return {
        ...parsedResponse,
        metadata: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
          model: 'gpt-4',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      logger.error('Error generating narrative:', error);
      throw new Error('Failed to generate narrative');
    }
  }

  public async generateEncounter(request: EncounterRequest): Promise<EncounterResponse> {
    try {
      logger.info('Generating encounter for AI DM', request);

      // Use MCP fetch service to get monster data
      const monsterData = await mcpManager.executeRequest('fetch', {
        method: 'fetch_monsters',
        params: {
          challenge_rating: this.getChallengeRatingForDifficulty(request.difficulty, request.partyLevel),
          type: request.monsterTypes?.[0],
          limit: 20
        }
      });

      const encounterPrompt = this.buildEncounterPrompt(request, monsterData.data);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.getEncounterSystemPrompt() },
          { role: 'user', content: encounterPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const encounterText = completion.choices[0]?.message?.content || '';
      const encounter = this.parseEncounterResponse(encounterText, request);

      // Store the encounter
      if (request) {
        await this.storeAIContent({
          contentType: 'encounter',
          prompt: encounterPrompt,
          generatedContent: encounterText,
          metadata: {
            partyLevel: request.partyLevel,
            partySize: request.partySize,
            difficulty: request.difficulty,
            environment: request.environment
          }
        });
      }

      return encounter;

    } catch (error) {
      logger.error('Error generating encounter:', error);
      throw new Error('Failed to generate encounter');
    }
  }

  public async generateNPC(params: {
    name?: string;
    race?: string;
    occupation?: string;
    personality?: string;
    campaignId?: string;
  }): Promise<{
    name: string;
    race: string;
    occupation: string;
    personality: string;
    backstory: string;
    quirks: string[];
    relationshipToParty: string;
  }> {
    try {
      logger.info('Generating NPC for AI DM', params);

      const npcPrompt = `Generate a detailed NPC with the following criteria:
        ${params.name ? `Name: ${params.name}` : 'Generate an appropriate name'}
        ${params.race ? `Race: ${params.race}` : 'Choose an interesting race'}
        ${params.occupation ? `Occupation: ${params.occupation}` : 'Choose a fitting occupation'}
        ${params.personality ? `Personality: ${params.personality}` : 'Create compelling personality traits'}
        
        Provide a rich backstory, unique quirks, and potential relationship to the party.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: this.getNPCSystemPrompt() },
          { role: 'user', content: npcPrompt }
        ],
        temperature: 0.9,
        max_tokens: 800,
      });

      const npcText = completion.choices[0]?.message?.content || '';
      const npc = this.parseNPCResponse(npcText, params);

      // Store the NPC
      if (params.campaignId) {
        await this.storeAIContent({
          contentType: 'npc_dialogue',
          prompt: npcPrompt,
          generatedContent: npcText,
          campaignId: params.campaignId,
          metadata: params
        });
      }

      return npc;

    } catch (error) {
      logger.error('Error generating NPC:', error);
      throw new Error('Failed to generate NPC');
    }
  }

  private async buildContextualPrompt(request: NarrativeRequest): Promise<string> {
    let prompt = request.prompt;

    if (request.context?.campaignId) {
      // Fetch campaign context using MCP
      const campaignData = await mcpManager.executeRequest('supabase', {
        method: 'query_campaigns',
        params: { campaign_id: request.context.campaignId }
      });

      if (campaignData.success && campaignData.data) {
        const campaign = (campaignData.data as any[])[0];
        prompt += `\n\nCampaign Context: ${campaign.title} - ${campaign.description}`;
        
        if (campaign.setting_info) {
          prompt += `\nSetting: ${JSON.stringify(campaign.setting_info)}`;
        }
      }

      // Fetch character context if available
      if (request.context.characterNames?.length) {
        const charactersData = await mcpManager.executeRequest('supabase', {
          method: 'query_characters',
          params: { campaign_id: request.context.campaignId }
        });

        if (charactersData.success && charactersData.data) {
          const characters = charactersData.data as any[];
          const characterInfo = characters.map(c => `${c.name} (${c.race} ${c.class}, Level ${c.level})`).join(', ');
          prompt += `\nParty: ${characterInfo}`;
        }
      }

      // Add recent events context
      if (request.context.recentEvents?.length) {
        prompt += `\nRecent Events: ${request.context.recentEvents.join(' ')}`;
      }

      // Add current location context
      if (request.context.currentLocation) {
        prompt += `\nCurrent Location: ${request.context.currentLocation}`;
      }
    }

    return prompt;
  }

  private buildSystemPrompt(): string {
    return `You are an expert Dungeon Master for Dungeons & Dragons 5th Edition. Your role is to create immersive, engaging narratives that respond dynamically to player actions and maintain campaign continuity.

Core Principles:
- Always prioritize player agency and choice
- Create vivid, sensory descriptions that bring scenes to life
- Maintain internal consistency within the campaign world
- Balance challenge with fun and storytelling
- Respond to player actions with logical consequences
- Encourage creative problem-solving and roleplay

Your responses should be well-structured and include:
1. Narrative description (main content)
2. Environmental details and atmosphere
3. NPC dialogue when appropriate
4. Clear action opportunities for players
5. Subtle hints and foreshadowing when relevant

Always maintain the tone and style appropriate to the campaign while being engaging and memorable.`;
  }

  private getStyleInstructions(style?: string): string {
    switch (style) {
      case 'dramatic':
        return 'Use dramatic language with heightened emotions and epic scope. Include vivid action and high stakes.';
      case 'humorous':
        return 'Include humor and lighthearted elements. Use wit and amusing situations while maintaining adventure.';
      case 'serious':
        return 'Maintain a serious, grounded tone. Focus on realism and consequence within the fantasy setting.';
      case 'mysterious':
        return 'Emphasize mystery and suspense. Leave questions unanswered and create atmospheric tension.';
      default:
        return 'Use a balanced narrative tone appropriate to the situation.';
    }
  }

  private getLengthInstructions(length?: string): string {
    switch (length) {
      case 'short':
        return 'Keep the response concise - 2-3 sentences maximum. Focus on immediate, actionable content.';
      case 'long':
        return 'Provide a detailed, immersive response with rich descriptions and multiple story elements.';
      default:
        return 'Provide a moderate-length response with good detail and clear direction.';
    }
  }

  private getMaxTokens(length?: string): number {
    switch (length) {
      case 'short':
        return 150;
      case 'long':
        return 800;
      default:
        return 400;
    }
  }

  private parseNarrativeResponse(narrative: string): Omit<NarrativeResponse, 'metadata'> {
    return {
      narrative,
      suggestions: [],
      npcDialogue: [],
      environmentalDetails: [],
      actionPrompts: []
    };
  }

  private async storeAIContent(content: {
    contentType: string;
    prompt: string;
    generatedContent: string;
    campaignId?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await supabase.from('ai_content').insert({
        content_type: content.contentType,
        prompt: content.prompt,
        generated_content: content.generatedContent,
        campaign_id: content.campaignId,
        session_id: content.sessionId,
        metadata: content.metadata || {}
      });
    } catch (error) {
      logger.warn('Failed to store AI content:', error);
    }
  }

  private buildEncounterPrompt(request: EncounterRequest, monsterData?: unknown): string {
    return `Create a balanced combat encounter for a party of ${request.partySize} level ${request.partyLevel} characters.
    Difficulty: ${request.difficulty}
    ${request.environment ? `Environment: ${request.environment}` : ''}
    ${request.theme ? `Theme: ${request.theme}` : ''}
    
    Include monster selection, tactical setup, and environmental considerations.`;
  }

  private getEncounterSystemPrompt(): string {
    return `You are a D&D 5e encounter designer. Create balanced, engaging combat encounters that match the requested difficulty and party composition. Consider tactics, environment, and story integration.`;
  }

  private parseEncounterResponse(encounterText: string, request: EncounterRequest): EncounterResponse {
    return {
      monsters: [
        {
          name: 'Generated Monster',
          quantity: 1,
          challengeRating: '1',
          hitPoints: 25,
          armorClass: 14
        }
      ],
      encounterDescription: encounterText,
      tacticalNotes: ['Tactical considerations to be parsed from response'],
      estimatedDuration: '30-45 minutes',
      xpReward: this.calculateXPReward(request.partyLevel, request.partySize, request.difficulty)
    };
  }

  private getNPCSystemPrompt(): string {
    return `You are an expert at creating memorable NPCs for D&D campaigns. Create characters with depth, interesting motivations, and clear hooks for player interaction.`;
  }

  private parseNPCResponse(npcText: string, params: any): any {
    return {
      name: params.name || 'Generated NPC',
      race: params.race || 'Human',
      occupation: params.occupation || 'Commoner',
      personality: params.personality || 'Friendly',
      backstory: npcText,
      quirks: ['To be parsed from response'],
      relationshipToParty: 'Neutral'
    };
  }

  private getChallengeRatingForDifficulty(difficulty: string, partyLevel: number): string {
    const crMap: Record<string, Record<number, string>> = {
      easy: { 1: '1/4', 2: '1/2', 3: '1', 4: '1', 5: '2' },
      medium: { 1: '1/2', 2: '1', 3: '2', 4: '3', 5: '4' },
      hard: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' },
      deadly: { 1: '2', 2: '3', 3: '4', 4: '5', 5: '6' }
    };

    return crMap[difficulty]?.[partyLevel] || '1';
  }

  private calculateXPReward(partyLevel: number, partySize: number, difficulty: string): number {
    const baseXP = partyLevel * 100;
    const difficultyMultiplier = { easy: 0.5, medium: 1, hard: 1.5, deadly: 2 }[difficulty] || 1;
    return Math.round(baseXP * difficultyMultiplier * partySize);
  }
}

export const aiDungeonMaster = new AIDungeonMaster();