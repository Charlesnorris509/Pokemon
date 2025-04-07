import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  const path = location.pathname;
  
  const isActiveRoute = (route) => {
    if (route === '/' && path === '/') return true;
    if (route !== '/' && path.startsWith(route)) return true;
    return false;
  };
  
  return (
    <div className="sidebar">
      <div className="navbar-logo">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="Pokemon Logo" />
        <h3>Pokémon Data</h3>
      </div>
      
      <h2 className="nav-title">Navigation</h2>
      
      <ul className="nav-buttons">
        <li className={`nav-button ${isActiveRoute('/') ? 'active' : ''}`}>
          <Link to="/" className="nav-link">
            <span>📊</span> Dashboard
          </Link>
        </li>
        <li className={`nav-button ${isActiveRoute('/charts') ? 'active' : ''}`}>
          <Link to="/charts" className="nav-link">
            <span>📈</span> Charts
          </Link>
        </li>
        <li className={`nav-button ${isActiveRoute('/pokemon') && !path.includes('/pokemon/') ? 'active' : ''}`}>
          <Link to="/pokemon" className="nav-link">
            <span>🎮</span> Pokemon List
          </Link>
        </li>
        <li className={`nav-button ${path.includes('/pokemon/') ? 'active' : ''}`}>
          <Link to={path.includes('/pokemon/') ? path : '/pokemon'} className="nav-link">
            <span>ℹ️</span> {path.includes('/pokemon/') ? 'Pokémon Details' : 'View Details'}
          </Link>
        </li>
        <li className={`nav-button ${isActiveRoute('/about') ? 'active' : ''}`}>
          <Link to="/about" className="nav-link">
            <span>📝</span> About
          </Link>
        </li>
      </ul>
    </div>
  );
}