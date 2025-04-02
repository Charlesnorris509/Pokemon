import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './App.css';
import Stats from './components/Stats';
import SearchBar from './components/SearchBar';
import TypeFilter from './components/TypeFilter';
import PokemonList from './components/PokemonList';

// Debounce utility for search optimization
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pokemon, setPokemon] = useState([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    averageWeight: 0,
    averageHeight: 0,
    typeDistribution: {}
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  
  // Debounce search query to prevent excessive filtering on every keystroke
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Cache for storing detailed Pokemon data
  const [pokemonCache, setPokemonCache] = useState({});

  // Fetch list of Pokemon (initial data)
  const fetchPokemonList = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const offset = (page - 1) * itemsPerPage;
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${itemsPerPage}`
      );
      
      // Set total pages based on count from API
      const totalCount = response.data.count;
      setTotalPages(Math.ceil(totalCount / itemsPerPage));
      
      // Fetch detailed data for each Pokemon in parallel
      const detailedPokemonPromises = response.data.results.map(async (pokemon) => {
        // Check if we already have this Pokemon in cache
        if (pokemonCache[pokemon.name]) {
          return pokemonCache[pokemon.name];
        }
        
        // If not in cache, fetch it
        const detailResponse = await axios.get(pokemon.url);
        return detailResponse.data;
      });
      
      const detailedPokemon = await Promise.all(detailedPokemonPromises);
      
      // Update the cache with newly fetched Pokemon
      const newCache = { ...pokemonCache };
      detailedPokemon.forEach(pokemon => {
        newCache[pokemon.name] = pokemon;
      });
      setPokemonCache(newCache);
      
      setPokemon(detailedPokemon);
      calculateStats(detailedPokemon);
    } catch (err) {
      console.error("Error fetching Pokemon data:", err);
      setError("Failed to fetch Pokemon data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pokemonCache]);

  // Calculate statistics from Pokemon data
  const calculateStats = useCallback((pokemonData) => {
    if (!pokemonData.length) return;
    
    let totalWeight = 0;
    let totalHeight = 0;
    const typeCount = {};
    
    pokemonData.forEach(p => {
      totalWeight += p.weight;
      totalHeight += p.height;
      
      p.types.forEach(type => {
        const typeName = type.type.name;
        typeCount[typeName] = (typeCount[typeName] || 0) + 1;
      });
    });
    
    setStats({
      totalCount: pokemonData.length,
      averageWeight: totalWeight / pokemonData.length,
      averageHeight: totalHeight / pokemonData.length,
      typeDistribution: typeCount
    });
  }, []);

  // Initial data fetch on component mount
  useEffect(() => {
    fetchPokemonList(currentPage);
  }, [fetchPokemonList, currentPage]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top when page changes
      window.scrollTo(0, 0);
    }
  };

  // Memoized filtered Pokemon list to prevent unnecessary filtering
  const filteredPokemon = useMemo(() => {
    return pokemon.filter(p => {
      return (
        p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) &&
        (typeFilter === '' || p.types.some(t => t.type.name === typeFilter))
      );
    });
  }, [pokemon, debouncedSearchQuery, typeFilter]);

  // Retry fetching if there's an error
  const handleRetry = () => {
    fetchPokemonList(currentPage);
  };
  
  return (
    <div className="app">
      <div className="navbar">
        <div className="navbar-logo">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" alt="Pokemon Logo" />
          <h3>Pokémon Data</h3>
        </div>
        
        <h2 className="nav-title">Navigation</h2>
        
        <ul className="nav-buttons">
          <li className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('dashboard')}>
              <span>📊</span> Dashboard
            </button>
          </li>
          <li className={`nav-button ${activeTab === 'pokemon' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('pokemon')}>
              <span>🎮</span> Pokemon List
            </button>
          </li>
          <li className={`nav-button ${activeTab === 'stats' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('stats')}>
              <span>📈</span> Statistics
            </button>
          </li>
          <li className={`nav-button ${activeTab === 'about' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('about')}>
              <span>ℹ️</span> About
            </button>
          </li>
          <li className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('settings')}>
              <span>⚙️</span> Settings
            </button>
          </li>
        </ul>
      </div>
      
      <div className="container">
        <div className="header">
          <h1 className="title">Pokemon Data Dashboard</h1>
          <p className="subtitle">Explore and analyze Pokemon statistics</p>
        </div>

        {error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={handleRetry}>Retry</button>
          </div>
        ) : loading && pokemon.length === 0 ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <Stats stats={stats} />
            
            <div className="horizontal-stack">
              <div className="search-container">
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              </div>
              <div className="filter-container">
                <TypeFilter typeFilter={typeFilter} setTypeFilter={setTypeFilter} />
              </div>
            </div>

            <PokemonList pokemon={filteredPokemon} />
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-button" 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </button>
                <span className="page-indicator">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  className="pagination-button" 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
