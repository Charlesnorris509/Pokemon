import React from 'react'
import './Stats.css'

export default function Stats({ stats }) {
  return (
    <div className="stats-container">
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-label">Total Pokemon</div>
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
          <div className="stat-number">
            {Object.entries(stats.typeDistribution)
              .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  )
}