export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          id: string
          title: string
          description: string | null
          setting_info: Json
          dm_user_id: string | null
          status: string
          max_players: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          setting_info?: Json
          dm_user_id?: string | null
          status?: string
          max_players?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          setting_info?: Json
          dm_user_id?: string | null
          status?: string
          max_players?: number
          created_at?: string
          updated_at?: string
        }
      }
      characters: {
        Row: {
          id: string
          name: string
          class: string
          race: string
          level: number
          stats: Json
          background: string | null
          equipment: Json
          spells: Json
          backstory: string | null
          campaign_id: string | null
          player_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          class: string
          race: string
          level?: number
          stats?: Json
          background?: string | null
          equipment?: Json
          spells?: Json
          backstory?: string | null
          campaign_id?: string | null
          player_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          class?: string
          race?: string
          level?: number
          stats?: Json
          background?: string | null
          equipment?: Json
          spells?: Json
          backstory?: string | null
          campaign_id?: string | null
          player_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          campaign_id: string | null
          session_number: number
          title: string | null
          summary: string | null
          notes: string | null
          narrative_log: Json
          combat_encounters: Json
          npc_interactions: Json
          treasure_found: Json
          experience_gained: number
          session_date: string | null
          duration_minutes: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          session_number: number
          title?: string | null
          summary?: string | null
          notes?: string | null
          narrative_log?: Json
          combat_encounters?: Json
          npc_interactions?: Json
          treasure_found?: Json
          experience_gained?: number
          session_date?: string | null
          duration_minutes?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          session_number?: number
          title?: string | null
          summary?: string | null
          notes?: string | null
          narrative_log?: Json
          combat_encounters?: Json
          npc_interactions?: Json
          treasure_found?: Json
          experience_gained?: number
          session_date?: string | null
          duration_minutes?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      npcs: {
        Row: {
          id: string
          name: string
          race: string | null
          class: string | null
          level: number | null
          stats: Json
          personality_traits: string | null
          background: string | null
          relationship_to_party: string | null
          campaign_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          race?: string | null
          class?: string | null
          level?: number | null
          stats?: Json
          personality_traits?: string | null
          background?: string | null
          relationship_to_party?: string | null
          campaign_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          race?: string | null
          class?: string | null
          level?: number | null
          stats?: Json
          personality_traits?: string | null
          background?: string | null
          relationship_to_party?: string | null
          campaign_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          type: string
          description: string | null
          geography: Json
          notable_features: Json
          inhabitants: Json
          campaign_id: string | null
          parent_location_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          description?: string | null
          geography?: Json
          notable_features?: Json
          inhabitants?: Json
          campaign_id?: string | null
          parent_location_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          description?: string | null
          geography?: Json
          notable_features?: Json
          inhabitants?: Json
          campaign_id?: string | null
          parent_location_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_content: {
        Row: {
          id: string
          content_type: string
          prompt: string
          generated_content: string
          metadata: Json
          campaign_id: string | null
          session_id: string | null
          quality_rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          content_type: string
          prompt: string
          generated_content: string
          metadata?: Json
          campaign_id?: string | null
          session_id?: string | null
          quality_rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          content_type?: string
          prompt?: string
          generated_content?: string
          metadata?: Json
          campaign_id?: string | null
          session_id?: string | null
          quality_rating?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}