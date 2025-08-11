import { Character } from '@/types/game';

export interface CharacterTemplate {
  name: string;
  race: string;
  class: string;
  level: number;
  abilities: Character['abilities'];
  hitPoints: Character['hitPoints'];
  description: string;
}

export const CHARACTER_TEMPLATES: Record<string, CharacterTemplate> = {
  testFighter: {
    name: 'Test Hero',
    race: 'human',
    class: 'fighter',
    level: 1,
    abilities: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    hitPoints: {
      current: 15,
      maximum: 15,
      temporary: 0,
    },
    description: 'A basic fighter template for testing',
  },
  
  testWizard: {
    name: 'Arcane Scholar',
    race: 'elf',
    class: 'wizard',
    level: 1,
    abilities: {
      strength: 8,
      dexterity: 14,
      constitution: 13,
      intelligence: 16,
      wisdom: 12,
      charisma: 10,
    },
    hitPoints: {
      current: 8,
      maximum: 8,
      temporary: 0,
    },
    description: 'A wizard template with high intelligence for spellcasting',
  },
  
  testRogue: {
    name: 'Shadow Walker',
    race: 'halfling',
    class: 'rogue',
    level: 1,
    abilities: {
      strength: 10,
      dexterity: 16,
      constitution: 14,
      intelligence: 12,
      wisdom: 13,
      charisma: 8,
    },
    hitPoints: {
      current: 12,
      maximum: 12,
      temporary: 0,
    },
    description: 'A dexterous rogue template for stealth and skills',
  },
};

export const createCharacterFromTemplate = (
  templateKey: keyof typeof CHARACTER_TEMPLATES,
  overrides: Partial<CharacterTemplate> = {}
): Partial<Character> => {
  const template = CHARACTER_TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Character template '${templateKey}' not found`);
  }

  return {
    ...template,
    ...overrides,
    spellSlots: {},
    inventory: [],
    equipment: {},
  };
};