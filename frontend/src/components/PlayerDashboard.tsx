import React, { useState } from 'react';
import { Character, GameState } from '@/types/game';
import { DashboardLayout, DashboardTheme, DashboardUpdate } from '@/types/terminal';
import { Heart, Shield, Zap, Package, MapPin, Scroll, Settings } from 'lucide-react';
import './PlayerDashboard.css';

interface PlayerDashboardProps {
  character?: Character;
  gameState?: GameState;
  theme: DashboardTheme;
  layout: DashboardLayout;
  onLayoutChange?: (layout: DashboardLayout) => void;
  className?: string;
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({
  character,
  gameState,
  theme,
  layout,
  onLayoutChange: _onLayoutChange,
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeAnimations] = useState<Set<string>>(new Set());

  // Function to apply dashboard updates with animations
  // const applyUpdate = (update: DashboardUpdate) => {
  //   if (update.animation) {
  //     setActiveAnimations(prev => new Set(prev).add(update.type));
  //     setTimeout(() => {
  //       setActiveAnimations(prev => {
  //         const newSet = new Set(prev);
  //         newSet.delete(update.type);
  //         return newSet;
  //       });
  //     }, 1000);
  //   }
  // };

  const dashboardStyle = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    borderColor: theme.borderColor,
    width: layout.collapsible && isCollapsed ? '40px' : `${layout.width}px`,
  };

  const getAbilityModifier = (score: number): string => {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const getHPPercentage = (): number => {
    if (!character?.hitPoints) return 100;
    return (character.hitPoints.current / character.hitPoints.maximum) * 100;
  };

  const getHPColor = (): string => {
    const percentage = getHPPercentage();
    if (percentage > 60) return theme.accentColor;
    if (percentage > 30) return '#ffaa00';
    return '#ff4444';
  };

  const renderCharacterSection = () => {
    if (!character) return null;

    return (
      <div className="dashboard-section character-section">
        <div className="section-header">
          <Heart className="section-icon" />
          <h3>Character</h3>
        </div>
        <div className="section-content">
          <div className="character-name">{character.name}</div>
          <div className="character-details">
            <span>{character.race} {character.class}</span>
            <span>Level {character.level}</span>
          </div>
          
          <div className={`hp-display ${activeAnimations.has('hitPoints') ? 'animated' : ''}`}>
            <div className="hp-bar">
              <div 
                className="hp-fill"
                style={{ 
                  width: `${getHPPercentage()}%`,
                  backgroundColor: getHPColor()
                }}
              />
            </div>
            <div className="hp-text">
              HP: {character.hitPoints.current}/{character.hitPoints.maximum}
              {character.hitPoints.temporary > 0 && (
                <span className="temp-hp"> (+{character.hitPoints.temporary})</span>
              )}
            </div>
          </div>

          <div className="abilities-grid">
            {Object.entries(character.abilities).map(([ability, score]) => (
              <div key={ability} className="ability-score">
                <div className="ability-name">{ability.slice(0, 3).toUpperCase()}</div>
                <div className="ability-value">{score}</div>
                <div className="ability-modifier">{getAbilityModifier(score)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSpellsSection = () => {
    if (!character?.spellSlots || Object.keys(character.spellSlots).length === 0) return null;

    return (
      <div className="dashboard-section spells-section">
        <div className="section-header">
          <Zap className="section-icon" />
          <h3>Spell Slots</h3>
        </div>
        <div className={`section-content ${activeAnimations.has('spellSlots') ? 'animated' : ''}`}>
          {Object.entries(character.spellSlots).map(([level, slots]) => (
            <div key={level} className="spell-level">
              <div className="spell-level-header">Level {level}</div>
              <div className="spell-slots">
                {Array.from({ length: slots.maximum }, (_, i) => (
                  <div 
                    key={i}
                    className={`spell-slot ${i < slots.current ? 'available' : 'used'}`}
                  />
                ))}
                <span className="slot-count">{slots.current}/{slots.maximum}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInventorySection = () => {
    const inventory = gameState?.inventory || character?.inventory || [];

    return (
      <div className="dashboard-section inventory-section">
        <div className="section-header">
          <Package className="section-icon" />
          <h3>Inventory</h3>
        </div>
        <div className={`section-content ${activeAnimations.has('inventory') ? 'animated' : ''}`}>
          {inventory.length === 0 ? (
            <div className="empty-inventory">No items</div>
          ) : (
            <div className="inventory-list">
              {inventory.slice(0, 10).map((item) => (
                <div key={item.id} className="inventory-item">
                  <div className="item-name">{item.name}</div>
                  <div className="item-quantity">×{item.quantity}</div>
                </div>
              ))}
              {inventory.length > 10 && (
                <div className="inventory-more">+{inventory.length - 10} more items</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderConditionsSection = () => {
    const conditions = gameState?.activeEffects || [];

    if (conditions.length === 0) return null;

    return (
      <div className="dashboard-section conditions-section">
        <div className="section-header">
          <Shield className="section-icon" />
          <h3>Conditions</h3>
        </div>
        <div className={`section-content ${activeAnimations.has('conditions') ? 'animated' : ''}`}>
          {conditions.map((effect) => (
            <div key={effect.id} className={`condition condition-${effect.type}`}>
              <div className="condition-name">{effect.name}</div>
              {effect.duration > 0 && (
                <div className="condition-duration">{effect.duration} rounds</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLocationSection = () => {
    const location = gameState?.location || 'Unknown';

    return (
      <div className="dashboard-section location-section">
        <div className="section-header">
          <MapPin className="section-icon" />
          <h3>Location</h3>
        </div>
        <div className={`section-content ${activeAnimations.has('location') ? 'animated' : ''}`}>
          <div className="current-location">{location}</div>
        </div>
      </div>
    );
  };

  const renderQuestSection = () => {
    const quests = gameState?.questLog || [];
    const activeQuests = quests.filter(q => q.status === 'active');

    if (activeQuests.length === 0) return null;

    return (
      <div className="dashboard-section quest-section">
        <div className="section-header">
          <Scroll className="section-icon" />
          <h3>Quests</h3>
        </div>
        <div className="section-content">
          {activeQuests.slice(0, 3).map((quest) => (
            <div key={quest.id} className="quest-item">
              <div className="quest-title">{quest.title}</div>
              <div className="quest-progress">
                {quest.objectives.filter(o => o.completed).length}/{quest.objectives.length} objectives
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isCollapsed) {
    return (
      <div className={`player-dashboard collapsed ${className}`} style={dashboardStyle}>
        <button 
          className="collapse-toggle"
          onClick={toggleCollapse}
          style={{ color: theme.textColor }}
        >
          <Settings />
        </button>
      </div>
    );
  }

  return (
    <div className={`player-dashboard ${className}`} style={dashboardStyle}>
      <div className="dashboard-header">
        <h2>Character Dashboard</h2>
        {layout.collapsible && (
          <button 
            className="collapse-toggle"
            onClick={toggleCollapse}
            style={{ color: theme.textColor }}
          >
            <Settings />
          </button>
        )}
      </div>

      <div className="dashboard-content">
        {layout.sections
          .filter(section => section.visible)
          .sort((a, b) => a.order - b.order)
          .map(section => {
            switch (section.type) {
              case 'character':
                return renderCharacterSection();
              case 'spells':
                return renderSpellsSection();
              case 'inventory':
                return renderInventorySection();
              case 'conditions':
                return renderConditionsSection();
              case 'location':
                return renderLocationSection();
              case 'quest':
                return renderQuestSection();
              default:
                return null;
            }
          })}
      </div>
    </div>
  );
};

// Export the applyUpdate function for external use
export const useDashboardUpdates = () => {
  const [updates, setUpdates] = useState<DashboardUpdate[]>([]);

  const applyUpdate = (update: DashboardUpdate) => {
    setUpdates(prev => [...prev, update]);
    // Remove update after animation completes
    setTimeout(() => {
      setUpdates(prev => prev.filter(u => u !== update));
    }, 1000);
  };

  return { updates, applyUpdate };
};