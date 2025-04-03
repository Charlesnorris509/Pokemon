import React, { useState } from 'react';
import './StatsFilter.css';

export default function StatsFilter({ 
  statFilters, 
  setStatFilters,
  minMaxValues
}) {
  const [minValues, setMinValues] = useState({
    height: minMaxValues.minHeight,
    weight: minMaxValues.minWeight,
    baseExperience: minMaxValues.minExperience
  });
  
  const handleSliderChange = (e, filterType) => {
    const value = parseInt(e.target.value);
    setStatFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  const handleMinValueChange = (e, filterType) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) return;
    
    const newMinValue = Math.max(
      minMaxValues[`min${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`],
      Math.min(value, statFilters[filterType] - 1)
    );
    
    setMinValues(prev => ({
      ...prev,
      [filterType]: newMinValue
    }));
    
    // Update the filter in App component to use this min value
    setStatFilters(prev => ({
      ...prev,
      [`min${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`]: newMinValue
    }));
  };
  
  const handleMaxValueChange = (e, filterType) => {
    const value = parseInt(e.target.value);
    if (isNaN(value)) return;
    
    const max = minMaxValues[`max${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`];
    const min = minValues[filterType];
    
    const newMaxValue = Math.min(
      max,
      Math.max(value, min)
    );
    
    setStatFilters(prev => ({
      ...prev,
      [filterType]: newMaxValue
    }));
  };

  return (
    <div className="stats-filter">
      <div className="filter-section">
        <div className="filter-header">
          <label htmlFor="height-filter">Height (m)</label>
          <div className="filter-value">{(statFilters.height / 10).toFixed(1)} m</div>
        </div>
        
        <div className="input-bounds">
          <div className="bound-input">
            <label>Min:</label>
            <input
              type="number"
              min={(minMaxValues.minHeight / 10).toFixed(1)}
              max={(statFilters.height / 10).toFixed(1)}
              step="0.1"
              value={(minValues.height / 10).toFixed(1)}
              onChange={(e) => handleMinValueChange(
                {target: {value: parseInt(parseFloat(e.target.value) * 10)}}, 
                'height'
              )}
              className="bound-input-field"
            />
            <span>m</span>
          </div>
          <div className="bound-input">
            <label>Max:</label>
            <input
              type="number"
              min={(minValues.height / 10).toFixed(1)}
              max={(minMaxValues.maxHeight / 10).toFixed(1)}
              step="0.1"
              value={(statFilters.height / 10).toFixed(1)}
              onChange={(e) => handleMaxValueChange(
                {target: {value: parseInt(parseFloat(e.target.value) * 10)}}, 
                'height'
              )}
              className="bound-input-field"
            />
            <span>m</span>
          </div>
        </div>
        
        <div className="slider-container">
          <input
            type="range"
            id="height-filter"
            min={minValues.height}
            max={minMaxValues.maxHeight}
            value={statFilters.height}
            onChange={(e) => handleSliderChange(e, 'height')}
            className="slider"
          />
          <div className="slider-values">
            <span>{(minValues.height / 10).toFixed(1)}</span>
            <span>{(minMaxValues.maxHeight / 10).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <label htmlFor="weight-filter">Weight (kg)</label>
          <div className="filter-value">{(statFilters.weight / 10).toFixed(1)} kg</div>
        </div>
        
        <div className="input-bounds">
          <div className="bound-input">
            <label>Min:</label>
            <input
              type="number" 
              min={(minMaxValues.minWeight / 10).toFixed(1)}
              max={(statFilters.weight / 10).toFixed(1)}
              step="0.1"
              value={(minValues.weight / 10).toFixed(1)}
              onChange={(e) => handleMinValueChange(
                {target: {value: parseInt(parseFloat(e.target.value) * 10)}}, 
                'weight'
              )}
              className="bound-input-field"
            />
            <span>kg</span>
          </div>
          <div className="bound-input">
            <label>Max:</label>
            <input
              type="number"
              min={(minValues.weight / 10).toFixed(1)}
              max={(minMaxValues.maxWeight / 10).toFixed(1)}
              step="0.1"
              value={(statFilters.weight / 10).toFixed(1)}
              onChange={(e) => handleMaxValueChange(
                {target: {value: parseInt(parseFloat(e.target.value) * 10)}}, 
                'weight'
              )}
              className="bound-input-field"
            />
            <span>kg</span>
          </div>
        </div>
        
        <div className="slider-container">
          <input
            type="range"
            id="weight-filter"
            min={minValues.weight}
            max={minMaxValues.maxWeight}
            value={statFilters.weight}
            onChange={(e) => handleSliderChange(e, 'weight')}
            className="slider"
          />
          <div className="slider-values">
            <span>{(minValues.weight / 10).toFixed(1)}</span>
            <span>{(minMaxValues.maxWeight / 10).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-header">
          <label htmlFor="experience-filter">Base Experience</label>
          <div className="filter-value">{statFilters.baseExperience}</div>
        </div>
        
        <div className="input-bounds">
          <div className="bound-input">
            <label>Min:</label>
            <input
              type="number"
              min={minMaxValues.minExperience}
              max={statFilters.baseExperience}
              value={minValues.baseExperience}
              onChange={(e) => handleMinValueChange(e, 'baseExperience')}
              className="bound-input-field"
            />
          </div>
          <div className="bound-input">
            <label>Max:</label>
            <input
              type="number"
              min={minValues.baseExperience}
              max={minMaxValues.maxExperience}
              value={statFilters.baseExperience}
              onChange={(e) => handleMaxValueChange(e, 'baseExperience')}
              className="bound-input-field"
            />
          </div>
        </div>
        
        <div className="slider-container">
          <input
            type="range"
            id="experience-filter"
            min={minValues.baseExperience}
            max={minMaxValues.maxExperience}
            value={statFilters.baseExperience}
            onChange={(e) => handleSliderChange(e, 'baseExperience')}
            className="slider"
          />
          <div className="slider-values">
            <span>{minValues.baseExperience}</span>
            <span>{minMaxValues.maxExperience}</span>
          </div>
        </div>
      </div>
    </div>
  );
}