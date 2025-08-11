import React, { useState } from 'react';
import { X, User } from 'lucide-react';

interface CharacterData {
  name: string;
  race: string;
  class: string;
  level: number;
}

interface CharacterCreatorProps {
  onCharacterCreated: (character: CharacterData) => void;
  onClose: () => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  onCharacterCreated,
  onClose,
}) => {
  const [characterData, setCharacterData] = useState<CharacterData>({
    name: '',
    race: 'human',
    class: 'fighter',
    level: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCharacterCreated(characterData);
  };

  return (
    <div className="theme-selector-overlay" role="dialog" aria-modal="true">
      <div className="theme-selector-modal">
        <div className="modal-header">
          <div className="modal-title">
            <User className="title-icon" />
            <h2>Create Character</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close character creator">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="theme-section">
            <label>
              Character Name:
              <input
                type="text"
                value={characterData.name}
                onChange={(e) => setCharacterData(prev => ({ ...prev, name: e.target.value }))}
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '8px',
                  background: '#333',
                  border: '1px solid #555',
                  color: '#fff',
                  borderRadius: '4px'
                }}
              />
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="apply-button">
              Create Character
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};