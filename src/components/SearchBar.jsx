import React from 'react';
import './SearchBar.css';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Rechercher par ange, tarot, lettre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button className="clear-btn" onClick={() => setSearchTerm('')}>
          x
        </button>
      )}
    </div>
  );
};

export default SearchBar;
