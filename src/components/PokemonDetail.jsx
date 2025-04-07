import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PokemonDetail.css';

export default function PokemonDetail() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    const fetchPokemonDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        setPokemon(response.data);
      } catch (err) {
        console.error('Error fetching Pokemon details:', err);
        setError('Failed to load Pokemon details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="pokemon-detail-loading">
        <div className="spinner"></div>
        <p>Loading Pokemon details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pokemon-detail-error">
        <p>{error}</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  if (!pokemon) {
    return <div>No Pokemon data available.</div>;
  }

  // Calculate base stats total
  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  return (
    <div className="pokemon-detail-container">
      <div className="pokemon-detail-header">
        <h1 className="pokemon-detail-name">{pokemon.name}</h1>
        <div className="pokemon-detail-id">#{pokemon.id.toString().padStart(3, '0')}</div>
        <div className="pokemon-detail-types">
          {pokemon.types.map(typeInfo => (
            <span 
              key={typeInfo.type.name} 
              className={`type-badge ${typeInfo.type.name}`}
            >
              {typeInfo.type.name}
            </span>
          ))}
        </div>
      </div>

      <div className="pokemon-detail-main">
        <div className="pokemon-detail-image-container">
          <img 
            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
            alt={pokemon.name}
            className="pokemon-detail-image"
          />
        </div>

        <div className="pokemon-detail-info">
          <div className="pokemon-detail-tabs">
            <button 
              className={`detail-tab-button ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              Stats
            </button>
            <button 
              className={`detail-tab-button ${activeTab === 'abilities' ? 'active' : ''}`}
              onClick={() => setActiveTab('abilities')}
            >
              Abilities
            </button>
            <button 
              className={`detail-tab-button ${activeTab === 'moves' ? 'active' : ''}`}
              onClick={() => setActiveTab('moves')}
            >
              Moves
            </button>
          </div>

          <div className="pokemon-detail-tab-content">
            {activeTab === 'stats' && (
              <div className="pokemon-detail-stats">
                <div className="pokemon-detail-physical">
                  <div className="physical-stat">
                    <span className="physical-stat-label">Height</span>
                    <span className="physical-stat-value">{pokemon.height / 10} m</span>
                  </div>
                  <div className="physical-stat">
                    <span className="physical-stat-label">Weight</span>
                    <span className="physical-stat-value">{pokemon.weight / 10} kg</span>
                  </div>
                  <div className="physical-stat">
                    <span className="physical-stat-label">Base Experience</span>
                    <span className="physical-stat-value">{pokemon.base_experience || 'N/A'}</span>
                  </div>
                </div>

                <div className="stat-total-container">
                  <span className="stat-total-label">Total Base Stats</span>
                  <span className="stat-total-value">{totalStats}</span>
                </div>

                <div className="base-stats-container">
                  {pokemon.stats.map(stat => {
                    const statName = stat.stat.name;
                    const baseStat = stat.base_stat;
                    const maxStat = 255; // Max possible base stat value
                    const percentage = (baseStat / maxStat) * 100;
                    
                    // Map API stat names to display names
                    const displayName = 
                      statName === 'hp' ? 'HP' :
                      statName === 'attack' ? 'Attack' :
                      statName === 'defense' ? 'Defense' :
                      statName === 'special-attack' ? 'Sp. Attack' :
                      statName === 'special-defense' ? 'Sp. Defense' :
                      statName === 'speed' ? 'Speed' : statName;
                    
                    // Different colors for different stat ranges
                    const barColor = 
                      baseStat < 50 ? 'var(--stat-bar-low)' :
                      baseStat < 90 ? 'var(--stat-bar-medium)' : 
                      'var(--stat-bar-high)';
                    
                    return (
                      <div key={statName} className="base-stat">
                        <div className="stat-name">{displayName}</div>
                        <div className="stat-value">{baseStat}</div>
                        <div className="stat-bar-container">
                          <div 
                            className="stat-bar" 
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: barColor
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'abilities' && (
              <div className="pokemon-detail-abilities">
                <h3>Abilities</h3>
                <ul className="abilities-list">
                  {pokemon.abilities.map(abilityInfo => (
                    <li key={abilityInfo.ability.name} className="ability-item">
                      <span className="ability-name">
                        {abilityInfo.ability.name.replace('-', ' ')}
                      </span>
                      {abilityInfo.is_hidden && (
                        <span className="hidden-ability-badge">Hidden</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'moves' && (
              <div className="pokemon-detail-moves">
                <h3>Top Moves</h3>
                <div className="moves-list">
                  {pokemon.moves.slice(0, 10).map(moveInfo => (
                    <div key={moveInfo.move.name} className="move-item">
                      {moveInfo.move.name.replace('-', ' ')}
                    </div>
                  ))}
                </div>
                <p className="moves-note">
                  Showing 10 of {pokemon.moves.length} moves
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}