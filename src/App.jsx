import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './App.css';
import Stats from './components/Stats';
import SearchBar from './components/SearchBar';
import TypeFilter from './components/TypeFilter';
import StatsFilter from './components/StatsFilter';
import StatFilterCheckbox from './components/StatFilterCheckbox';
import SortOptionsRadio from './components/SortOptionsRadio';
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
    typeDistribution: {},
    highestHP: { name: '', value: 0 },
    highestAttack: { name: '', value: 0 },
    highestDefense: { name: '', value: 0 },
    strongestPokemon: { name: '', totalStats: 0 }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [minMaxValues, setMinMaxValues] = useState({
    minHeight: 0,
    maxHeight: 100,
    minWeight: 0,
    maxWeight: 1000,
    minExperience: 0,
    maxExperience: 500
  });
  const [statFilters, setStatFilters] = useState({
    height: 100,
    weight: 1000,
    baseExperience: 500,
    minHeight: 0,
    minWeight: 0,
    minBaseExperience: 0
  });
  
  // New state for stat option filtering with checkboxes
  const [statOptionsFilter, setStatOptionsFilter] = useState({
    hp: { enabled: false, threshold: 50 },
    attack: { enabled: false, threshold: 50 },
    defense: { enabled: false, threshold: 50 },
    'special-attack': { enabled: false, threshold: 50 },
    'special-defense': { enabled: false, threshold: 50 },
    speed: { enabled: false, threshold: 50 }
  });
  
  // New state for sorting options using radio buttons
  const [sortOption, setSortOption] = useState({
    field: 'id',
    direction: 'asc'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  const [allPokemon, setAllPokemon] = useState([]); // New state to store all fetched Pokemon
  
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
      setAllPokemon(prev => [...prev, ...detailedPokemon]); // Store all fetched Pokemon
      calculateStats(detailedPokemon);
      calculateMinMaxValues(detailedPokemon);
    } catch (err) {
      console.error("Error fetching Pokemon data:", err);
      setError("Failed to fetch Pokemon data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [pokemonCache]);

  // Fetch more Pokemon data to handle filtered pagination 
  // This function will be used to load more Pokemon when we need to display filtered results
  const fetchMorePokemon = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculate the next page to fetch
      const nextPage = Math.ceil(allPokemon.length / itemsPerPage) + 1;
      const offset = (nextPage - 1) * itemsPerPage;
      
      // Check if we've fetched all available Pokemon
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${itemsPerPage}`
      );
      
      // If there are no more results, return false
      if (response.data.results.length === 0) {
        setLoading(false);
        return false;
      }
      
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
      
      // Add the new Pokemon to our allPokemon array
      setAllPokemon(prev => [...prev, ...detailedPokemon]);
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error("Error fetching more Pokemon data:", err);
      setLoading(false);
      return false;
    }
  }, [allPokemon.length, itemsPerPage, pokemonCache]);

  // Calculate min and max values for sliders
  const calculateMinMaxValues = useCallback((pokemonData) => {
    if (!pokemonData.length) return;
    
    let minH = Number.MAX_SAFE_INTEGER;
    let maxH = 0;
    let minW = Number.MAX_SAFE_INTEGER;
    let maxW = 0;
    let minExp = Number.MAX_SAFE_INTEGER;
    let maxExp = 0;
    
    pokemonData.forEach(p => {
      minH = Math.min(minH, p.height);
      maxH = Math.max(maxH, p.height);
      minW = Math.min(minW, p.weight);
      maxW = Math.max(maxW, p.weight);
      if (p.base_experience) {
        minExp = Math.min(minExp, p.base_experience);
        maxExp = Math.max(maxExp, p.base_experience);
      }
    });
    
    setMinMaxValues({
      minHeight: minH,
      maxHeight: maxH,
      minWeight: minW,
      maxWeight: maxW,
      minExperience: minExp,
      maxExperience: maxExp
    });
    
    // Set initial slider values to max
    setStatFilters({
      height: maxH,
      weight: maxW,
      baseExperience: maxExp,
      minHeight: minH,
      minWeight: minW,
      minBaseExperience: minExp
    });
  }, []);

  // Calculate statistics from Pokemon data
  const calculateStats = useCallback((pokemonData) => {
    if (!pokemonData.length) return;
    
    let totalWeight = 0;
    let totalHeight = 0;
    const typeCount = {};
    let highestHP = { name: '', value: 0 };
    let highestAttack = { name: '', value: 0 };
    let highestDefense = { name: '', value: 0 };
    let strongestPokemon = { name: '', totalStats: 0 };
    
    pokemonData.forEach(p => {
      totalWeight += p.weight;
      totalHeight += p.height;
      
      // Track type distribution
      p.types.forEach(type => {
        const typeName = type.type.name;
        typeCount[typeName] = (typeCount[typeName] || 0) + 1;
      });
      
      // Track highest stat values
      const hp = p.stats.find(stat => stat.stat.name === 'hp')?.base_stat || 0;
      const attack = p.stats.find(stat => stat.stat.name === 'attack')?.base_stat || 0;
      const defense = p.stats.find(stat => stat.stat.name === 'defense')?.base_stat || 0;
      
      if (hp > highestHP.value) {
        highestHP = { name: p.name, value: hp };
      }
      
      if (attack > highestAttack.value) {
        highestAttack = { name: p.name, value: attack };
      }
      
      if (defense > highestDefense.value) {
        highestDefense = { name: p.name, value: defense };
      }
      
      // Calculate total stats for each Pokemon
      const totalStats = p.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
      if (totalStats > strongestPokemon.totalStats) {
        strongestPokemon = { name: p.name, totalStats };
      }
    });
    
    setStats({
      totalCount: pokemonData.length,
      averageWeight: totalWeight / pokemonData.length,
      averageHeight: totalHeight / pokemonData.length,
      typeDistribution: typeCount,
      highestHP,
      highestAttack,
      highestDefense,
      strongestPokemon
    });
  }, []);

  // Initial data fetch on component mount
  useEffect(() => {
    // Only fetch initial data once when the component mounts
    if (allPokemon.length === 0) {
      fetchPokemonList(1);
    }
  }, [fetchPokemonList, allPokemon.length]); // Only depend on fetchPokemonList and allPokemon.length

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top when page changes
      window.scrollTo(0, 0);
    }
  };

  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    
    // Use our custom handler for resetting the type filter
    handleTypeFilterChange('');
    
    setStatFilters({
      height: minMaxValues.maxHeight,
      weight: minMaxValues.maxWeight,
      baseExperience: minMaxValues.maxExperience,
      minHeight: minMaxValues.minHeight,
      minWeight: minMaxValues.minWeight,
      minBaseExperience: minMaxValues.minExperience
    });
    setStatOptionsFilter({
      hp: { enabled: false, threshold: 50 },
      attack: { enabled: false, threshold: 50 },
      defense: { enabled: false, threshold: 50 },
      'special-attack': { enabled: false, threshold: 50 },
      'special-defense': { enabled: false, threshold: 50 },
      speed: { enabled: false, threshold: 50 }
    });
    setSortOption({
      field: 'id',
      direction: 'asc'
    });
  };

  // Enhanced filtered and sorted Pokemon list
  const filteredAndSortedPokemon = useMemo(() => {
    // First filter the Pokémon
    const filtered = pokemon.filter(p => {
      // Name search filter
      const nameMatch = p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      // Type filter - exact same implementation as in getFilteredPokemonWithPagination for consistency
      const typeMatch = typeFilter === '' || 
        p.types.some(t => t.type.name.toLowerCase() === typeFilter.toLowerCase());
      
      // Basic stat filters with min and max bounds
      const heightMatch = p.height >= statFilters.minHeight && p.height <= statFilters.height;
      const weightMatch = p.weight >= statFilters.minWeight && p.weight <= statFilters.weight;
      const expMatch = !p.base_experience || 
        (p.base_experience >= statFilters.minBaseExperience && 
         p.base_experience <= statFilters.baseExperience);
      
      // Advanced stat filters using checkboxes
      let statsMatch = true;
      
      // Check each enabled stat filter
      for (const [statName, statOption] of Object.entries(statOptionsFilter)) {
        if (statOption.enabled) {
          // Find the corresponding stat in the Pokémon's stats array
          const statData = p.stats.find(stat => {
            // Convert our stat names to match the API format exactly
            return stat.stat.name === statName;
          });
          
          // If the stat exists and is below the threshold, this Pokémon doesn't match
          if (!statData || statData.base_stat < statOption.threshold) {
            statsMatch = false;
            break;
          }
        }
      }
      
      return nameMatch && typeMatch && heightMatch && weightMatch && expMatch && statsMatch;
    });
    
    // Then sort the filtered list
    return [...filtered].sort((a, b) => {
      let valueA, valueB;
      
      // Handle null/undefined values gracefully
      if (sortOption.field === 'base_experience') {
        valueA = a[sortOption.field] ?? 0;
        valueB = b[sortOption.field] ?? 0;
      } else {
        valueA = a[sortOption.field];
        valueB = b[sortOption.field];
      }
      
      // String comparison for text fields
      if (typeof valueA === 'string') {
        const comparison = valueA.localeCompare(valueB);
        return sortOption.direction === 'asc' ? comparison : -comparison;
      }
      
      // Numeric comparison for number fields
      const comparison = valueA - valueB;
      return sortOption.direction === 'asc' ? comparison : -comparison;
    });
  }, [pokemon, debouncedSearchQuery, typeFilter, statFilters, statOptionsFilter, sortOption]);

  // Get filtered Pokemon and handle client-side pagination
  const getFilteredPokemonWithPagination = useCallback(() => {
    // Filter all Pokemon based on current filters
    const filtered = allPokemon.filter(p => {
      // Name search filter
      const nameMatch = p.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      // Type filter - ensure we're correctly matching Pokemon types
      const typeMatch = typeFilter === '' || 
        p.types.some(t => t.type.name.toLowerCase() === typeFilter.toLowerCase());
      
      // Basic stat filters with min and max bounds
      const heightMatch = p.height >= statFilters.minHeight && p.height <= statFilters.height;
      const weightMatch = p.weight >= statFilters.minWeight && p.weight <= statFilters.weight;
      const expMatch = !p.base_experience || 
        (p.base_experience >= statFilters.minBaseExperience && 
          p.base_experience <= statFilters.baseExperience);
      
      // Advanced stat filters using checkboxes
      let statsMatch = true;
      
      // Check each enabled stat filter
      for (const [statName, statOption] of Object.entries(statOptionsFilter)) {
        if (statOption.enabled) {
          // Find the corresponding stat in the Pokémon's stats array
          const statData = p.stats.find(stat => {
            // Convert our stat names to match the API format exactly
            return stat.stat.name === statName;
          });
          
          // If the stat exists and is below the threshold, this Pokémon doesn't match
          if (!statData || statData.base_stat < statOption.threshold) {
            statsMatch = false;
            break;
          }
        }
      }
      
      return nameMatch && typeMatch && heightMatch && weightMatch && expMatch && statsMatch;
    });

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      let valueA, valueB;
      
      // Handle null/undefined values gracefully
      if (sortOption.field === 'base_experience') {
        valueA = a[sortOption.field] ?? 0;
        valueB = b[sortOption.field] ?? 0;
      } else {
        valueA = a[sortOption.field];
        valueB = b[sortOption.field];
      }
      
      // String comparison for text fields
      if (typeof valueA === 'string') {
        const comparison = valueA.localeCompare(valueB);
        return sortOption.direction === 'asc' ? comparison : -comparison;
      }
      
      // Numeric comparison for number fields
      const comparison = valueA - valueB;
      return sortOption.direction === 'asc' ? comparison : -comparison;
    });

    // Calculate total pages based on filtered results
    const totalFilteredPages = Math.ceil(sorted.length / itemsPerPage);
    setTotalPages(totalFilteredPages > 0 ? totalFilteredPages : 1);
    
    // Get current page of data
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = sorted.slice(startIndex, endIndex);
    
    // Also update the pokemon state to match our filtered results for stats calculation
    setPokemon(sorted);
    
    return { 
      filteredPokemon: currentPageData,
      totalFiltered: sorted.length
    };
  }, [allPokemon, debouncedSearchQuery, typeFilter, statFilters, statOptionsFilter, sortOption, currentPage, itemsPerPage]);
  
  // Enhanced direct filtering function for type filters
  const applyTypeFilter = useCallback((selectedType) => {
    if (!selectedType || allPokemon.length === 0) return;
    
    console.log(`Applying type filter: ${selectedType}`);
    
    // Filter Pokémon that have the selected type
    const filtered = allPokemon.filter(p => 
      p.types.some(t => t.type.name.toLowerCase() === selectedType.toLowerCase())
    );
    
    console.log(`Found ${filtered.length} Pokémon with type: ${selectedType}`);
    
    // Update the filtered Pokémon state directly
    setPokemon(filtered);
    
    // Reset to page 1
    setCurrentPage(1);
    
    // Calculate pages for pagination
    const totalFilteredPages = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(totalFilteredPages > 0 ? totalFilteredPages : 1);
    
    return filtered;
  }, [allPokemon, itemsPerPage]);
  
  // Modified type filter handler to use our direct filtering function
  const handleTypeFilterChange = (selectedType) => {
    // Set the type filter value in state
    setTypeFilter(selectedType);
    
    // If a type is selected, apply the filter immediately using our dedicated function
    if (selectedType) {
      applyTypeFilter(selectedType);
    } else {
      // If no type filter, restore all Pokemon (up to the current itemsPerPage)
      // Start with the initial data from allPokemon
      const initialPage = allPokemon.slice(0, itemsPerPage);
      setPokemon(allPokemon);
      setCurrentPage(1);
      setTotalPages(Math.ceil(allPokemon.length / itemsPerPage));
    }
  };
  
  // Retry fetching if there's an error
  const handleRetry = () => {
    fetchPokemonList(currentPage);
  };
  
  // Effect to handle filter changes and pagination
  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [debouncedSearchQuery, typeFilter, statFilters, statOptionsFilter]);

  // Effect to check if we need to load more Pokemon for filtered results
  useEffect(() => {
    const checkAndLoadMorePokemon = async () => {
      // Get filtered results with current data
      const { filteredPokemon, totalFiltered } = getFilteredPokemonWithPagination();
      
      // If we're on the last page and don't have enough items, try to fetch more
      if (currentPage === totalPages && filteredPokemon.length < itemsPerPage && !loading) {
        const hasMore = await fetchMorePokemon();
        
        // If we fetched more, we need to recalculate filtered results
        if (hasMore) {
          // Re-filter with new data
          getFilteredPokemonWithPagination();
        }
      }
    };
    
    checkAndLoadMorePokemon();
  }, [currentPage, fetchMorePokemon, getFilteredPokemonWithPagination, itemsPerPage, loading, totalPages]);

  // Calculate paginated and filtered Pokemon for display
  const { filteredPokemon, totalFiltered } = useMemo(() => 
    getFilteredPokemonWithPagination(), 
  [getFilteredPokemonWithPagination]);

  // Update the effects to properly respond to filter changes
  useEffect(() => {
    // When filters change, recalculate the displayed Pokemon
    if (allPokemon.length > 0) {
      getFilteredPokemonWithPagination();
      
      // Also update stats based on filtered Pokemon
      calculateStats(pokemon);
    }
  }, [debouncedSearchQuery, typeFilter, statFilters, statOptionsFilter, sortOption, allPokemon.length]);

  // Update the Stats component with new stats whenever pokemon changes
  useEffect(() => {
    if (pokemon.length > 0) {
      calculateStats(pokemon);
    }
  }, [pokemon, calculateStats]);

  // Effect to force immediate filtered data update when type filter changes
  useEffect(() => {
    if (typeFilter !== '' && allPokemon.length > 0) {
      // Immediately apply the filter and update the display
      const result = getFilteredPokemonWithPagination();
      
      // Force reset to page 1 when type filter changes
      setCurrentPage(1);
      
      // Log the filtering result for debugging
      console.log(`Applied ${typeFilter} filter: found ${result.totalFiltered} matching Pokémon`);
    }
  }, [typeFilter, getFilteredPokemonWithPagination, allPokemon.length]);

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
        ) : loading && allPokemon.length === 0 ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <Stats stats={stats} />
            
            <div className="filters-container">
              <div className="filters-header">
                <h3>Filters</h3>
                <div className="filter-actions">
                  <button 
                    className="toggle-filters-button" 
                    onClick={toggleAdvancedFilters}
                  >
                    {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
                  </button>
                  <button 
                    className="reset-filters-button" 
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
              
              <div className="basic-filters">
                <div className="search-container">
                  <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </div>
                <div className="filter-container">
                  <TypeFilter typeFilter={typeFilter} setTypeFilter={handleTypeFilterChange} />
                </div>
              </div>
              
              {showAdvancedFilters && (
                <>
                  <StatsFilter 
                    statFilters={statFilters} 
                    setStatFilters={setStatFilters}
                    minMaxValues={minMaxValues}
                  />
                  
                  <StatFilterCheckbox 
                    statOptionsFilter={statOptionsFilter}
                    setStatOptionsFilter={setStatOptionsFilter}
                  />
                  
                  <SortOptionsRadio 
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                  />
                </>
              )}
              
              <div className="filter-results">
                <p>Found <strong>{totalFiltered}</strong> Pokemon matching your filters</p>
              </div>
            </div>

            {loading && filteredPokemon.length === 0 ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : (
              <PokemonList pokemon={filteredPokemon} />
            )}
            
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
                  {totalFiltered > 0 && ` (${totalFiltered} Pokemon total)`}
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
            
            {loading && filteredPokemon.length > 0 && (
              <div className="loading-more">
                <div className="spinner-small"></div>
                <p>Loading more Pokemon...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
