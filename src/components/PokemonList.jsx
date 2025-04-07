import React from 'react';
import { Link } from 'react-router-dom';
import './PokemonList.css';

export default function PokemonList({ pokemon }) {
  return (
    <div className="pokemon-list-container">
      <table className="pokemon-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Types</th>
            <th>Height (m)</th>
            <th>Weight (kg)</th>
            <th>Base Experience</th>
          </tr>
        </thead>
        <tbody>
          {pokemon.map(p => (
            <tr key={p.id} className="pokemon-row">
              <td>
                <Link to={`/pokemon/${p.id}`} className="pokemon-link">
                  <img 
                    src={p.sprites.front_default} 
                    alt={p.name}
                    className="pokemon-image"
                  />
                </Link>
              </td>
              <td className="pokemon-name">
                <Link to={`/pokemon/${p.id}`} className="pokemon-link">
                  {p.name}
                </Link>
              </td>
              <td>
                {p.types.map(type => (
                  <span 
                    key={type.type.name} 
                    className={`type-badge ${type.type.name}`}
                  >
                    {type.type.name}
                  </span>
                ))}
              </td>
              <td>{p.height / 10}</td>
              <td>{p.weight / 10}</td>
              <td>{p.base_experience}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}