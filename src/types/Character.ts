/**
 * Character data model for D&D 5e characters
 */
export interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  
  // Core D&D 5e abilities
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  
  // Hit points
  hitPoints: {
    current: number;
    maximum: number;
    temporary: number;
  };
  
  // Basic inventory
  inventory: Item[];
  
  // Character background
  background: string;
  
  // Creation timestamp
  createdAt: Date;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  weight: number;
  value: number; // in gold pieces
}

export interface CharacterStats {
  armorClass: number;
  speed: number;
  proficiencyBonus: number;
  savingThrows: Record<string, number>;
  skills: Record<string, number>;
}