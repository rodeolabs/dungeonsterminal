import { TerminalOutput } from '@/types/terminal';

/**
 * Format terminal output for display
 */
export const formatOutput = (output: TerminalOutput): string => {
  const timestamp = output.metadata?.showTimestamp 
    ? `[${output.timestamp.toLocaleTimeString()}] ` 
    : '';

  switch (output.type) {
    case 'narrative':
      return `${timestamp}${output.text}`;
    
    case 'dialogue':
      return `${timestamp}"${output.text}"`;
    
    case 'system':
      return `${timestamp}${output.text}`;
    
    case 'error':
      return `${timestamp}ERROR: ${output.text}`;
    
    case 'success':
      return `${timestamp}✓ ${output.text}`;
    
    case 'combat':
      return `${timestamp}⚔️ ${output.text}`;
    
    case 'description':
      return `${timestamp}${output.text}`;
    
    case 'help':
      return `${timestamp}${output.text}`;
    
    default:
      return `${timestamp}${output.text}`;
  }
};

/**
 * Format dice roll results for display
 */
export const formatDiceRoll = (
  dice: string,
  result: number,
  modifier?: number,
  advantage?: boolean,
  disadvantage?: boolean
): string => {
  let formatted = `🎲 Rolling ${dice}`;
  
  if (advantage) formatted += ' (Advantage)';
  if (disadvantage) formatted += ' (Disadvantage)';
  
  formatted += `: ${result}`;
  
  if (modifier) {
    formatted += ` + ${modifier} = ${result + modifier}`;
  }
  
  return formatted;
};

/**
 * Format combat action results
 */
export const formatCombatAction = (
  action: string,
  attacker: string,
  target: string,
  damage?: number,
  critical?: boolean
): string => {
  let formatted = `⚔️ ${attacker} ${action} ${target}`;
  
  if (damage !== undefined) {
    if (critical) {
      formatted += ` for ${damage} damage! CRITICAL HIT!`;
    } else {
      formatted += ` for ${damage} damage`;
    }
  }
  
  return formatted;
};

/**
 * Format spell casting results
 */
export const formatSpellCast = (
  caster: string,
  spell: string,
  target?: string,
  level?: number,
  success?: boolean
): string => {
  let formatted = `✨ ${caster} casts ${spell}`;
  
  if (level) {
    formatted += ` (Level ${level})`;
  }
  
  if (target) {
    formatted += ` on ${target}`;
  }
  
  if (success === false) {
    formatted += ' - The spell fails!';
  }
  
  return formatted;
};

/**
 * Format location descriptions
 */
export const formatLocationDescription = (
  name: string,
  description: string,
  exits?: string[]
): string => {
  let formatted = `📍 ${name}\n\n${description}`;
  
  if (exits && exits.length > 0) {
    formatted += `\n\nExits: ${exits.join(', ')}`;
  }
  
  return formatted;
};

/**
 * Format NPC dialogue with speaker identification
 */
export const formatNPCDialogue = (
  npcName: string,
  dialogue: string,
  emotion?: string
): string => {
  let formatted = `💬 ${npcName}`;
  
  if (emotion) {
    formatted += ` (${emotion})`;
  }
  
  formatted += `: "${dialogue}"`;
  
  return formatted;
};

/**
 * Format inventory item display
 */
export const formatInventoryItem = (
  name: string,
  quantity: number,
  description?: string,
  weight?: number
): string => {
  let formatted = `📦 ${name}`;
  
  if (quantity > 1) {
    formatted += ` (×${quantity})`;
  }
  
  if (weight) {
    formatted += ` [${weight} lbs]`;
  }
  
  if (description) {
    formatted += `\n   ${description}`;
  }
  
  return formatted;
};

/**
 * Format character stats display
 */
export const formatCharacterStats = (
  name: string,
  level: number,
  hp: { current: number; maximum: number },
  ac?: number
): string => {
  const hpPercentage = (hp.current / hp.maximum) * 100;
  let hpStatus = '';
  
  if (hpPercentage <= 25) {
    hpStatus = ' (Critically Wounded)';
  } else if (hpPercentage <= 50) {
    hpStatus = ' (Wounded)';
  } else if (hpPercentage <= 75) {
    hpStatus = ' (Injured)';
  }
  
  let formatted = `👤 ${name} (Level ${level})\n`;
  formatted += `❤️ HP: ${hp.current}/${hp.maximum}${hpStatus}`;
  
  if (ac) {
    formatted += `\n🛡️ AC: ${ac}`;
  }
  
  return formatted;
};

/**
 * Format quest updates
 */
export const formatQuestUpdate = (
  questName: string,
  objective: string,
  completed: boolean
): string => {
  const status = completed ? '✅' : '📋';
  return `${status} Quest "${questName}": ${objective}`;
};

/**
 * Format level up notification
 */
export const formatLevelUp = (
  characterName: string,
  newLevel: number,
  benefits?: string[]
): string => {
  let formatted = `🎉 ${characterName} has reached Level ${newLevel}!`;
  
  if (benefits && benefits.length > 0) {
    formatted += '\n\nNew benefits:';
    benefits.forEach(benefit => {
      formatted += `\n• ${benefit}`;
    });
  }
  
  return formatted;
};

/**
 * Format rest results
 */
export const formatRestResult = (
  restType: 'short' | 'long',
  hpRecovered?: number,
  spellSlotsRecovered?: Record<number, number>,
  abilitiesRecovered?: string[]
): string => {
  let formatted = `😴 You complete a ${restType} rest.`;
  
  if (hpRecovered) {
    formatted += `\n❤️ Recovered ${hpRecovered} hit points`;
  }
  
  if (spellSlotsRecovered && Object.keys(spellSlotsRecovered).length > 0) {
    formatted += '\n✨ Spell slots recovered:';
    Object.entries(spellSlotsRecovered).forEach(([level, count]) => {
      formatted += `\n  Level ${level}: ${count} slots`;
    });
  }
  
  if (abilitiesRecovered && abilitiesRecovered.length > 0) {
    formatted += '\n🔄 Abilities recovered:';
    abilitiesRecovered.forEach(ability => {
      formatted += `\n  • ${ability}`;
    });
  }
  
  return formatted;
};

/**
 * Format error messages with helpful suggestions
 */
export const formatErrorWithSuggestion = (
  error: string,
  suggestions?: string[]
): string => {
  let formatted = `❌ ${error}`;
  
  if (suggestions && suggestions.length > 0) {
    formatted += '\n\nTry:';
    suggestions.forEach(suggestion => {
      formatted += `\n• ${suggestion}`;
    });
  }
  
  return formatted;
};

/**
 * Format help command output
 */
export const formatHelpCommand = (
  commands: Record<string, string>,
  examples?: Record<string, string>
): string => {
  let formatted = '📚 Available Commands:\n\n';
  
  Object.entries(commands).forEach(([command, description]) => {
    formatted += `• ${command} - ${description}\n`;
  });
  
  if (examples && Object.keys(examples).length > 0) {
    formatted += '\n💡 Examples:\n';
    Object.entries(examples).forEach(([example, description]) => {
      formatted += `• "${example}" - ${description}\n`;
    });
  }
  
  return formatted.trim();
};

/**
 * Apply text effects for special formatting
 */
export const applyTextEffects = (
  text: string,
  _effects: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
  }
): string => {
  // This would be used with CSS classes or inline styles
  // For now, return the text as-is since we're using CSS for styling
  return text;
};

/**
 * Truncate long text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Word wrap text to fit terminal width
 */
export const wrapText = (text: string, width: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length > width) {
      if (currentLine) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        // Word is longer than width, force break
        lines.push(word);
      }
    } else {
      currentLine += word + ' ';
    }
  });
  
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  
  return lines;
};