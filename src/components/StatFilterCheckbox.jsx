import React from 'react';
import './StatFilterCheckbox.css';

const STAT_OPTIONS = [
  { id: 'hp', label: 'HP', description: 'Filter by Pokémon with high HP' },
  { id: 'attack', label: 'Attack', description: 'Filter by Pokémon with high Attack' },
  { id: 'defense', label: 'Defense', description: 'Filter by Pokémon with high Defense' },
  { id: 'special-attack', label: 'Sp. Attack', description: 'Filter by Pokémon with high Special Attack' },
  { id: 'special-defense', label: 'Sp. Defense', description: 'Filter by Pokémon with high Special Defense' },
  { id: 'speed', label: 'Speed', description: 'Filter by Pokémon with high Speed' }
];

export default function StatFilterCheckbox({ statOptionsFilter, setStatOptionsFilter }) {
  const handleCheckboxChange = (statId) => {
    setStatOptionsFilter(prev => ({
      ...prev,
      [statId]: {
        ...prev[statId],
        enabled: !prev[statId].enabled
      }
    }));
  };

  const handleThresholdChange = (e, statId) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) return;
    
    setStatOptionsFilter(prev => ({
      ...prev,
      [statId]: {
        ...prev[statId],
        threshold: value
      }
    }));
  };

  return (
    <div className="stat-filter-checkbox">
      <h3 className="filter-group-title">Filter by Stats</h3>
      <p className="filter-description">Select stats to filter Pokémon with values above the threshold</p>
      
      <div className="stat-options-grid">
        {STAT_OPTIONS.map(stat => (
          <div key={stat.id} className="stat-option">
            <div className="stat-checkbox-container">
              <input
                type="checkbox"
                id={`stat-${stat.id}`}
                checked={statOptionsFilter[stat.id]?.enabled || false}
                onChange={() => handleCheckboxChange(stat.id)}
                className="stat-checkbox"
              />
              <label htmlFor={`stat-${stat.id}`} className="stat-label">
                {stat.label}
                <span className="stat-description">{stat.description}</span>
              </label>
            </div>
            
            {statOptionsFilter[stat.id]?.enabled && (
              <div className="threshold-container">
                <input 
                  type="number"
                  min="1"
                  max="255"
                  value={statOptionsFilter[stat.id]?.threshold || 50}
                  onChange={(e) => handleThresholdChange(e, stat.id)}
                  className="threshold-input"
                />
                <span className="threshold-label">min value</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}