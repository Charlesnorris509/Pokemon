import React from 'react'
import './SearchBar.css'

export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="search-input-group">
      <span className="search-icon">🔍</span>
      <input
        className="search-input"
        type="text"
        placeholder='Search Pokemon...'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  )
}