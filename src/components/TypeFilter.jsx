import React from 'react'
import './TypeFilter.css'

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dark', 'dragon', 
  'steel', 'fairy'
]

export default function TypeFilter({ typeFilter, setTypeFilter }) {
  return (
    <select 
      className="type-select"
      value={typeFilter} 
      onChange={(e) => setTypeFilter(e.target.value)}
    >
      <option value="">Filter by type</option>
      {POKEMON_TYPES.map(type => (
        <option key={type} value={type}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </option>
      ))}
    </select>
  )
}