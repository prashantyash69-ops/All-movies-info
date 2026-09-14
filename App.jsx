import React, { useState, useEffect } from 'react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [loading, setLoading] = useState(true);

  // The AniList GraphQL Endpoint
  const ANILIST_URL = 'https://graphql.anilist.co';

  // Load default trending and popular movies on initial load
  useEffect(() => {
    fetchDefaultAnime();
  }, []);

  // Run search when the user types (waits for at least 3 characters)
  useEffect(() => {
    if (searchQuery.length > 2) {
      const delayDebounce = setTimeout(() => searchAnime(searchQuery), 500);
      return () => clearTimeout(delayDebounce);
    } else if (searchQuery.length === 0) {
      fetchDefaultAnime(); // Reset to discover when search is cleared
    }
  }, [searchQuery]);

  // GraphQL Query for initial page load (Format: MOVIE)
  const fetchDefaultAnime = async () => {
    setLoading(true);
    const query = `
      query {
        trending: Page(page: 1, perPage: 10) {
          media(sort: TRENDING_DESC, type: ANIME, format: MOVIE) {
            id
            title { english romaji }
            coverImage { extraLarge }
          }
        }
        popular: Page(page: 1, perPage: 20) {
          media(sort: POPULARITY_DESC, type: ANIME, format: MOVIE) {
            id
            title { english romaji }
            coverImage { extraLarge }
          }
        }
      }
    `;
    
    try {
      const response = await fetch(ANILIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      setTrending(data.data.trending.media);
      setDiscover(data.data.popular.media);
    } catch (error) {
      console.error("Error fetching AniList", error);
    }
    setLoading(false);
  };

  // GraphQL Query for Search
  const searchAnime = async (search) => {
    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 20) {
          media(search: $search, type: ANIME, format: MOVIE, sort: SEARCH_MATCH) {
            id
            title { english romaji }
            coverImage { extraLarge }
          }
        }
      }
    `;
    
    try {
      const response = await fetch(ANILIST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { search } })
      });
      const data = await response.json();
      setDiscover(data.data.Page.media);
    } catch (error) {
      console.error("Error searching AniList", error);
    }
  };

  // Helper function to safely get the English title, or fallback to Romaji
  const getTitle = (anime) => anime.title.english || anime.title.romaji;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans pb-10">
      <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-500 tracking-tight">AniDiscover</h1>
          <input
            type="text"
            placeholder="Search anime movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:border-indigo-500 transition-colors text-sm"
          />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-10">
        
        {/* Trending Section */}
        {searchQuery.length === 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4 px-1">Trending Now</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar">
              {loading ? (
                <p className="text-gray-400 px-1">Loading trending...</p>
              ) : (
                trending.map((anime) => (
                  <div key={anime.id} className="snap-start shrink-0 w-64 md:w-80 group cursor-pointer">
                    <div className="overflow-hidden rounded-2xl relative aspect-video bg-gray-800">
                      <img 
                        src={anime.coverImage.extraLarge} 
                        alt={getTitle(anime)} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      <h3 className="absolute bottom-3 left-4 text-lg font-semibold">{getTitle(anime)}</h3>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Discover / Search Results Section */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-xl font-bold">
              {searchQuery.length > 0 ? `Search Results for "${searchQuery}"` : 'Discover'}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {loading && discover.length === 0 ? (
              <p className="text-gray-400 px-1 col-span-full">Loading movies...</p>
            ) : (
              discover.map((anime) => (
                <div key={anime.id} className="group cursor-pointer">
                  <div className="overflow-hidden rounded-xl bg-gray-800 aspect-[2/3] shadow-lg">
                    <img 
                      src={anime.coverImage.extraLarge} 
                      alt={getTitle(anime)} 
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-200"
                    />
                  </div>
                  <h3 className="mt-2 text-sm md:text-base font-medium truncate" title={getTitle(anime)}>
                    {getTitle(anime)}
                  </h3>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
