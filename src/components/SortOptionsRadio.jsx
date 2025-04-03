import React from 'react';
import './SortOptionsRadio.css';

const SORT_OPTIONS = [
  { id: 'id-asc', label: 'ID (Ascending)', field: 'id', direction: 'asc' },
  { id: 'id-desc', label: 'ID (Descending)', field: 'id', direction: 'desc' },
  { id: 'name-asc', label: 'Name (A-Z)', field: 'name', direction: 'asc' },
  { id: 'name-desc', label: 'Name (Z-A)', field: 'name', direction: 'desc' },
  { id: 'height-asc', label: 'Height (Low to High)', field: 'height', direction: 'asc' },
  { id: 'height-desc', label: 'Height (High to Low)', field: 'height', direction: 'desc' },
  { id: 'weight-asc', label: 'Weight (Low to High)', field: 'weight', direction: 'asc' },
  { id: 'weight-desc', label: 'Weight (High to Low)', field: 'weight', direction: 'desc' },
  { id: 'base-exp-asc', label: 'Base Exp (Low to High)', field: 'base_experience', direction: 'asc' },
  { id: 'base-exp-desc', label: 'Base Exp (High to Low)', field: 'base_experience', direction: 'desc' }
];

export default function SortOptionsRadio({ sortOption, setSortOption }) {
  const handleSortChange = (option) => {
    setSortOption({
      field: option.field,
      direction: option.direction
    });
  };

  return (
    <div className="sort-options-radio">
      <h3 className="filter-group-title">Sort Pokémon</h3>
      <p className="filter-description">Choose how to sort the Pokémon list</p>
      
      <div className="sort-options-grid">
        {SORT_OPTIONS.map(option => (
          <div key={option.id} className="sort-option">
            <input
              type="radio"
              id={`sort-${option.id}`}
              name="sort-option"
              checked={sortOption.field === option.field && sortOption.direction === option.direction}
              onChange={() => handleSortChange(option)}
              className="sort-radio"
            />
            <label htmlFor={`sort-${option.id}`} className="sort-label">
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}