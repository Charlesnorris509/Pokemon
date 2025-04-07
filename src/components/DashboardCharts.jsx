import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Sector 
} from 'recharts';
import './DashboardCharts.css';

// Custom colors for types
const TYPE_COLORS = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dark: '#705848',
  dragon: '#7038F8',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

// Helper function to get a color for a type
const getTypeColor = (type) => TYPE_COLORS[type] || '#777777';

export default function DashboardCharts({ pokemon }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCharts, setShowCharts] = useState(true);

  // Skip if no pokemon data
  if (!pokemon || pokemon.length === 0) {
    return null;
  }

  // Process data for type distribution chart
  const getTypeDistribution = () => {
    const typeCounts = {};
    
    pokemon.forEach(p => {
      p.types.forEach(typeInfo => {
        const typeName = typeInfo.type.name;
        typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
      });
    });
    
    return Object.entries(typeCounts)
      .map(([type, count]) => ({ 
        name: type, 
        value: count,
        color: getTypeColor(type)
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Process data for stat comparison chart
  const getStatAverages = () => {
    const statSums = {
      hp: 0,
      attack: 0,
      defense: 0,
      'special-attack': 0,
      'special-defense': 0,
      speed: 0
    };
    
    pokemon.forEach(p => {
      p.stats.forEach(stat => {
        statSums[stat.stat.name] += stat.base_stat;
      });
    });
    
    // Calculate averages and format for chart
    const statNames = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      speed: 'Speed'
    };
    
    return Object.entries(statSums).map(([stat, sum]) => ({
      name: statNames[stat] || stat,
      value: Math.round(sum / pokemon.length),
      fill: getStatColor(stat)
    }));
  };
  
  // Get color for stat bars
  const getStatColor = (stat) => {
    switch(stat) {
      case 'hp': return '#FF5959';
      case 'attack': return '#F5AC78';
      case 'defense': return '#FAE078';
      case 'special-attack': return '#9DB7F5';
      case 'special-defense': return '#A7DB8D';
      case 'speed': return '#FA92B2';
      default: return '#A0A0A0';
    }
  };

  // Custom active shape for pie chart
  const renderActiveShape = (props) => {
    const { 
      cx, cy, innerRadius, outerRadius, startAngle, endAngle,
      fill, payload, percent, value 
    } = props;
  
    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} className="pie-center-text">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={10} textAnchor="middle" fill={fill} className="pie-center-value">
          {value} Pokémon
        </text>
        <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#999" className="pie-center-percent">
          {`(${(percent * 100).toFixed(1)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const typeDistribution = getTypeDistribution();
  const statAverages = getStatAverages();

  return (
    <div className="dashboard-charts-container">
      <div className="charts-header">
        <h2 className="charts-title">Data Visualizations</h2>
        <div className="charts-controls">
          <button 
            className="toggle-charts-button"
            onClick={() => setShowCharts(!showCharts)}
          >
            {showCharts ? 'Hide Charts' : 'Show Charts'}
          </button>
        </div>
      </div>
      
      {showCharts && (
        <div className="charts-content">
          <div className="chart-description">
            <p>
              These visualizations provide insights into the current set of Pokémon. The pie chart shows the distribution 
              of types, while the bar chart displays the average base stats. Try filtering by type or other criteria to 
              see how these metrics change!
            </p>
          </div>
          
          <div className="charts-grid">
            <div className="chart-container">
              <h3 className="chart-title">Type Distribution</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                <p className="chart-insight">
                  <strong>Insight:</strong> {typeDistribution[0]?.name} is the most common type, 
                  making up {((typeDistribution[0]?.value / pokemon.length) * 100).toFixed(1)}% of the 
                  currently displayed Pokémon.
                </p>
              </div>
            </div>
            
            <div className="chart-container">
              <h3 className="chart-title">Average Base Stats</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={statAverages}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value}`, 'Average']}
                      labelFormatter={(label) => `${label} Stat`}
                    />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                      {statAverages.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                <p className="chart-insight">
                  <strong>Insight:</strong> {
                    statAverages.reduce((highest, current) => 
                      current.value > highest.value ? current : highest
                    ).name
                  } is the highest average stat at {
                    statAverages.reduce((highest, current) => 
                      current.value > highest.value ? current : highest
                    ).value
                  } points.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}