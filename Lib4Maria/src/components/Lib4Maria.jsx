import React, { useState, useEffect } from 'react';
import { Search, Plus, Film, Tv, X, Shuffle, ExternalLink, Heart, Download, Upload, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';


const Lib4Maria = () => {
  // Load initial data from localStorage or use sample data
  const initialData = [
    {
      id: 1,
      title: "Inception",
      type: "movie",
      themes: ["Sci-Fi", "Action", "Thriller"],
      releaseYear: "2010",
      rating: "9",
      description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      isFavorite: false
    },
    {
      id: 2,
      title: "Breaking Bad",
      type: "series",
      themes: ["Drama", "Crime", "Thriller"],
      releaseYear: "2008",
      rating: "10",
      description: "A high school chemistry teacher turned methamphetamine manufacturer partners with a former student to secure his family's financial future.",
      isFavorite: true
    }
  ];
  const [isImporting, setIsImporting] = useState(false);

  // Load saved data on component mount
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('lib4maria-data');
      return saved ? JSON.parse(saved) : initialData;
    } catch (error) {
      console.error('Error loading data:', error);
      return initialData;
    }
  };

  // States
  const [mediaItems, setMediaItems] = useState(loadSavedData());
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState(localStorage.getItem('lib4maria-filter') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [randomMedia, setRandomMedia] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(
    localStorage.getItem('lib4maria-favorites') === 'true'
  );
  const [newMedia, setNewMedia] = useState({
    title: '',
    type: 'movie',
    themes: [],
    releaseYear: '',
    rating: '',
    description: ''
  });

  // Save data when it changes
  useEffect(() => {
    localStorage.setItem('lib4maria-data', JSON.stringify(mediaItems));
  }, [mediaItems]);

  useEffect(() => {
    localStorage.setItem('lib4maria-filter', filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem('lib4maria-favorites', showFavoritesOnly);
  }, [showFavoritesOnly]);

  // Available themes/genres
  const allThemes = [
    'Action', 'Comedy', 'Drama', 'Horror', 
    'Sci-Fi', 'Romance', 'Thriller', 'Documentary',
    'Crime', 'Mystery', 'History', 'Biography'
  ];
    
  // Theme colors
  // Add after your state declarations
  const isValidMediaItem = (item) => {
    return (
      item &&
      typeof item.title === 'string' &&
      ['movie', 'series'].includes(item.type) &&
      Array.isArray(item.themes) &&
      typeof item.releaseYear === 'string' &&
      typeof item.rating === 'string' &&
      typeof item.description === 'string' &&
      typeof item.isFavorite === 'boolean'
    );
  };
  const colors = {
    primary: 'bg-teal-600 hover:bg-teal-700',
    secondary: 'bg-pink-600 hover:bg-pink-700',
    accent: 'bg-indigo-600 hover:bg-indigo-700',
    neutral: 'bg-gray-100 hover:bg-gray-200',
    danger: 'bg-rose-600 hover:bg-rose-700',
    highlight: 'ring-teal-500'
  };

  // Data management functions
  const exportData = () => {
    try {
      const dataStr = JSON.stringify({ mediaItems: mediaItems }, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      const exportFileDefaultName = 'library4maria-backup.json';
  
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };
  
  const importData = (event) => {
    try {
      const file = event.target.files[0];
      if (!file) {
        alert('Please select a file to import');
        return;
      }
  
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          let newItems;
  
          // Handle both formats: array or {mediaItems: array}
          if (Array.isArray(content)) {
            newItems = content;
          } else if (content.mediaItems && Array.isArray(content.mediaItems)) {
            newItems = content.mediaItems;
          } else {
            throw new Error('Invalid file format');
          }
  
          // Validate items
          const validItems = newItems.filter(item => isValidMediaItem(item));
  
          if (validItems.length === 0) {
            throw new Error('No valid media items found in file');
          }
  
          // Update IDs to avoid conflicts
          const timestamp = Date.now();
          const itemsWithNewIds = validItems.map((item, index) => ({
            ...item,
            id: timestamp + index
          }));
  
          // Ask user about import behavior
          const importChoice = window.confirm(
            `Found ${validItems.length} valid items. Do you want to:\n` +
            'OK - Add to existing library\n' +
            'Cancel - Replace existing library'
          );
  
          if (importChoice) {
            // Add to existing library
            setMediaItems(current => [...current, ...itemsWithNewIds]);
            alert(`Successfully added ${validItems.length} items to your library`);
          } else {
            // Replace library
            setMediaItems(itemsWithNewIds);
            alert(`Successfully replaced library with ${validItems.length} items`);
          }
  
        } catch (error) {
          console.error('Error processing import file:', error);
          alert(`Error importing file: ${error.message}`);
        }
      };
  
      reader.onerror = () => {
        alert('Error reading file');
      };
  
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Failed to import data. Please check your file format.');
    } finally {
      // Reset the file input
      event.target.value = '';
    }
  };

  const clearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        localStorage.clear();
        setMediaItems([]);
        setFilter('all');
        setShowFavoritesOnly(false);
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Failed to clear data. Please try again.');
      }
    }
  };

  // Handlers
  const handleAddMedia = (e) => {
    e.preventDefault();
    try {
      const newItem = { ...newMedia, id: Date.now(), isFavorite: false };
      setMediaItems([...mediaItems, newItem]);
      setNewMedia({
        title: '',
        type: 'movie',
        themes: [],
        releaseYear: '',
        rating: '',
        description: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding media:', error);
      alert('Failed to add media. Please try again.');
    }
  };

  const handleThemeToggle = (theme) => {
    if (newMedia.themes.includes(theme)) {
      setNewMedia({
        ...newMedia,
        themes: newMedia.themes.filter(t => t !== theme)
      });
    } else {
      setNewMedia({
        ...newMedia,
        themes: [...newMedia.themes, theme]
      });
    }
  };

  const handleDelete = (id) => {
    try {
      setMediaItems(mediaItems.filter(item => item.id !== id));
      if (randomMedia?.id === id) {
        setRandomMedia(null);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const toggleFavorite = (id) => {
    try {
      setMediaItems(mediaItems.map(item => 
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  const findRandomMedia = () => {
    const availableMedia = filteredMedia;
    if (availableMedia.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableMedia.length);
      const selected = availableMedia[randomIndex];
      setRandomMedia(selected);
      
      setTimeout(() => {
        const element = document.getElementById(`media-${selected.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Filtering
  const filteredMedia = mediaItems.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.themes.some(theme => theme.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFavorites = !showFavoritesOnly || item.isFavorite;
    return matchesFilter && matchesSearch && matchesFavorites;
  });

  // Counts
  const favoritesCount = mediaItems.filter(item => item.isFavorite).length;
  const currentFilterCounts = {
    movies: filteredMedia.filter(item => item.type === 'movie').length,
    series: filteredMedia.filter(item => item.type === 'series').length
  };
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-teal-800">Library4Maria</h1>
      
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search media..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'all' ? `${colors.primary} text-white` : colors.neutral
            }`}
            onClick={() => {
              setFilter('all');
              setRandomMedia(null);
            }}
          >
            All ({filteredMedia.length})
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'movie' ? `${colors.primary} text-white` : colors.neutral
            }`}
            onClick={() => setFilter('movie')}
          >
            <Film className="h-4 w-4" /> Movies ({currentFilterCounts.movies})
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              filter === 'series' ? `${colors.primary} text-white` : colors.neutral
            }`}
            onClick={() => setFilter('series')}
          >
            <Tv className="h-4 w-4" /> Series ({currentFilterCounts.series})
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              showFavoritesOnly ? `${colors.secondary} text-white` : colors.neutral
            }`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Heart className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites ({favoritesCount})
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            className={`text-white px-4 py-2 rounded-lg flex items-center gap-2 ${colors.accent}`}
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4" /> Add Media
          </button>

          {(filter === 'movie' || filter === 'series') && (
            <button
              className={`text-white px-4 py-2 rounded-lg flex items-center gap-2 ${colors.secondary}`}
              onClick={findRandomMedia}
              disabled={filteredMedia.length === 0}
            >
              <Shuffle className="h-4 w-4" /> 
              Random {filter === 'movie' ? 'Movie' : 'Series'} ({filter === 'movie' ? currentFilterCounts.movies : currentFilterCounts.series})
            </button>
          )}

          <button
            className={`text-white px-4 py-2 rounded-lg flex items-center gap-2 ${colors.accent}`}
            onClick={exportData}
          >
            <Download className="h-4 w-4" /> Export
          </button>
          
          <label 
  className={`text-white px-4 py-2 rounded-lg flex items-center gap-2 ${
    isImporting ? 'opacity-50 cursor-not-allowed' : colors.accent
  } cursor-pointer`}
>
  <Upload className={`h-4 w-4 ${isImporting ? 'animate-spin' : ''}`} />
  {isImporting ? 'Importing...' : 'Import'}
  <input
    type="file"
    accept=".json"
    className="hidden"
    onChange={async (e) => {
      setIsImporting(true);
      await importData(e);
      setIsImporting(false);
    }}
    disabled={isImporting}
  />
</label>
          
          <button
            className={`text-white px-4 py-2 rounded-lg flex items-center gap-2 ${colors.danger}`}
            onClick={clearData}
          >
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        </div>
      </div>

      {/* Random Media Alert */}
      {randomMedia && (
        <Alert className="mb-6 bg-teal-50 border-teal-200">
          <Shuffle className="h-4 w-4" />
          <AlertTitle>Random {randomMedia.type === 'movie' ? 'Movie' : 'Series'} Pick!</AlertTitle>
          <AlertDescription className="flex items-center gap-2">
            We suggest: <span className="font-bold">{randomMedia.title}</span>
            <button
              className="text-teal-600 hover:text-teal-800 inline-flex items-center gap-1"
              onClick={() => {
                const element = document.getElementById(`media-${randomMedia.id}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              <ExternalLink className="h-4 w-4" /> Find in list
            </button>
            <button
              className="text-pink-600 hover:text-pink-800 inline-flex items-center gap-1"
              onClick={() => toggleFavorite(randomMedia.id)}
            >
              <Heart className={`h-4 w-4 ${randomMedia.isFavorite ? 'fill-current' : ''}`} />
              {randomMedia.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Add Media Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Add New Media
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMedia} className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full p-2 border rounded"
                  value={newMedia.title}
                  onChange={(e) => setNewMedia({...newMedia, title: e.target.value})}
                  required
                />
                
                <select
                  className="w-full p-2 border rounded"
                  value={newMedia.type}
                  onChange={(e) => setNewMedia({...newMedia, type: e.target.value})}
                  required
                >
                  <option value="movie">Movie</option>
                  <option value="series">Series</option>
                </select>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Genres (select multiple):</label>
                  <div className="flex flex-wrap gap-2">
                    {allThemes.map(theme => (
                      <button
                        key={theme}
                        type="button"
                        className={`px-2 py-1 rounded text-sm ${
                          newMedia.themes.includes(theme)
                            ? 'bg-teal-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => handleThemeToggle(theme)}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                
                <input
                  type="number"
                  placeholder="Release Year"
                  className="w-full p-2 border rounded"
                  value={newMedia.releaseYear}
                  onChange={(e) => setNewMedia({...newMedia, releaseYear: e.target.value})}
                  required
                />
                
                <input
                  type="number"
                  placeholder="Rating (1-10)"
                  min="1"
                  max="10"
                  className="w-full p-2 border rounded"
                  value={newMedia.rating}
                  onChange={(e) => setNewMedia({...newMedia, rating: e.target.value})}
                  required
                />
                
                <textarea
                  placeholder="Description"
                  className="w-full p-2 border rounded"
                  value={newMedia.description}
                  onChange={(e) => setNewMedia({...newMedia, description: e.target.value})}
                  required
                />
                
                <button
                  type="submit"
                  className={`w-full text-white p-2 rounded ${colors.primary}`}
                  disabled={newMedia.themes.length === 0}
                >
                  Add Media
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedia.map(item => (
          <Card 
            key={item.id} 
            id={`media-${item.id}`}
            className={`relative transition-all duration-300 ${
              randomMedia?.id === item.id ? `ring-2 ${colors.highlight} ring-offset-2` : ''
            }`}
          >
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => toggleFavorite(item.id)}
                className={`text-pink-500 hover:text-pink-700 ${item.isFavorite ? 'animate-bounce' : ''}`}
              >
                <Heart className={`h-4 w-4 ${item.isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-gray-500 hover:text-rose-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {item.type === 'movie' ? (
                    <Film className="h-4 w-4" />
                  ) : (
                    <Tv className="h-4 w-4" />
                  )}
                  <span className="capitalize">{item.type}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.themes.map(theme => (
                    <span 
                      key={theme}
                      className="px-2 py-1 text-sm bg-gray-100 rounded"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Lib4Maria;