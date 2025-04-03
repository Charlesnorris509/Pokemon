import React, { useState } from 'react';
import './Stats.css';

export default function Stats({ stats }) {
  const [activeTab, setActiveTab] = useState('basic');
  
  // Find the most common type
  const mostCommonType = Object.entries(stats.typeDistribution)
    .sort((a, b) => b[1] - a[1])[0] || ['unknown', 0];
    
  return (
    <div className="stats-container">
      <div className="stats-tabs">
        <button 
          className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Stats
        </button>
        <button 
          className={`tab-button ${activeTab === 'strongest' ? 'active' : ''}`}
          onClick={() => setActiveTab('strongest')}
        >
          Strongest Pokémon
        </button>
      </div>
      
      {activeTab === 'basic' ? (
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">Total Pokémon</div>
            <div className="stat-number">{stats.totalCount}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Average Weight (kg)</div>
            <div className="stat-number">{(stats.averageWeight / 10).toFixed(1)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Average Height (m)</div>
            <div className="stat-number">{(stats.averageHeight / 10).toFixed(1)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Most Common Type</div>
            <div className="stat-number stat-with-label">
              <span className={`type-indicator ${mostCommonType[0]}`}>{mostCommonType[0]}</span>
              <span className="stat-count">({mostCommonType[1]})</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">Highest HP</div>
            <div className="stat-number stat-with-detail">
              <span className="pokemon-name">{stats.highestHP.name}</span>
              <span className="stat-value">{stats.highestHP.value}</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Highest Attack</div>
            <div className="stat-number stat-with-detail">
              <span className="pokemon-name">{stats.highestAttack.name}</span>
              <span className="stat-value">{stats.highestAttack.value}</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Highest Defense</div>
            <div className="stat-number stat-with-detail">
              <span className="pokemon-name">{stats.highestDefense.name}</span>
              <span className="stat-value">{stats.highestDefense.value}</span>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Strongest Overall</div>
            <div className="stat-number stat-with-detail">
              <span className="pokemon-name">{stats.strongestPokemon.name}</span>
              <span className="stat-value">{stats.strongestPokemon.totalStats}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}