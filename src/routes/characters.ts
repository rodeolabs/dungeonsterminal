import express from 'express';
import type { Character } from '../types/game.js';

const router = express.Router();

// In-memory storage for demo (replace with database in production)
const characters: Map<string, Character> = new Map();

// GET /api/characters - List all characters for a user
router.get('/', (_req, res) => {
  // In production, filter by user ID from authentication
  const userCharacters = Array.from(characters.values());
  return res.json(userCharacters);
});

// GET /api/characters/:id - Get specific character
router.get('/:id', (req, res) => {
  const character = characters.get(req.params.id);
  if (!character) {
    return res.status(404).json({ error: 'Character not found' });
  }
  return res.json(character);
});

// POST /api/characters - Create new character
router.post('/', (req, res) => {
  try {
    const characterData = req.body;
    
    // Generate ID and timestamps
    const character: Character = {
      id: Date.now().toString(),
      userId: 'demo-user', // In production, get from authentication
      name: characterData.name,
      race: characterData.race,
      class: characterData.class,
      level: characterData.level || 1,
      abilities: characterData.abilities,
      hitPoints: characterData.hitPoints,
      spellSlots: characterData.spellSlots || {},
      inventory: characterData.inventory || [],
      equipment: characterData.equipment || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    characters.set(character.id, character);
    
    return res.status(201).json(character);
  } catch (error) {
    console.error('Error creating character:', error);
    return res.status(400).json({ error: 'Invalid character data' });
  }
});

// PUT /api/characters/:id - Update character
router.put('/:id', (req, res) => {
  try {
    const character = characters.get(req.params.id);
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const updatedCharacter: Character = {
      ...character,
      ...req.body,
      id: character.id, // Prevent ID changes
      userId: character.userId, // Prevent user ID changes
      updatedAt: new Date(),
    };
    
    characters.set(character.id, updatedCharacter);
    
    return res.json(updatedCharacter);
  } catch (error) {
    console.error('Error updating character:', error);
    return res.status(400).json({ error: 'Invalid character data' });
  }
});

// DELETE /api/characters/:id - Delete character
router.delete('/:id', (req, res) => {
  const character = characters.get(req.params.id);
  if (!character) {
    return res.status(404).json({ error: 'Character not found' });
  }
  
  characters.delete(req.params.id);
  return res.status(204).send();
});

export default router;