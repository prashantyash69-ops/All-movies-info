import React, { useState, useEffect } from 'react';

// Simple SVG Icons for the Bottom Navigation
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
const ListIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const ANILIST_URL = 'https://graphql.anilist.co';

  useEffect(() => {
    fetchDefaultAnime();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delayDebounce = setTimeout(() => searchAnime(searchQuery), 500);
      return () => clearTimeout(delayDebounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchDefaultAnime = async () => {
    setLoading(true);
    const query = `
      query {
        trending: Page(page: 1, perPage: 10) {
          media(sort: TRENDING_DESC, type: ANIME) {
            id
            title { english romaji }
            coverImage { extraLarge }
            bannerImage
            genres
          }
        }
        popular: Page(page: 1, perPage: 15) {
          media(sort: POPULARITY_DESC, type: ANIME) {
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
      setPopular(data.data.popular.media);
    } catch (error) {
      console.error("Error fetching AniList", error);
    }
    setLoading(false);
  };

  const searchAnime = async (search) => {
    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 20) {
          media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
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
      setSearchResults(data.data.Page.media);
    } catch (error) {
      console.error("Error searching", error);
    }
  };

  const getTitle = (anime) => anime?.title?.english || anime?.title?.romaji;
  
  // The Hero is the #1 trending anime
  const heroAnime = trending.length > 0 ? trending[0] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans pb-24">
      
      {/* HOME TAB */}
      {activeTab === 'home' && (
        <main>
          {/* Hero Section (Matches center screen of your image) */}
          {heroAnime && (
            <div className="relative w-full h-[60vh] md:h-[70vh]">
              <img 
                // Use banner if available, otherwise cover
                src={heroAnime.bannerImage || heroAnime.coverImage.extraLarge} 
                alt={getTitle(heroAnime)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center">
                <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">{getTitle(heroAnime)}</h1>
                <p className="text-sm text-gray-300 mb-6 font-medium">
                  {heroAnime.genres?.slice(0, 3).join(' • ')}
                </p>
                
                <div className="flex gap-4 w-full max-w-md">
                  <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2 transition">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Play
                  </button>
                  <button className="flex-1 bg-gray-800/80 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl border border-gray-600 backdrop-blur transition">
                    + My List
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto space-y-10 mt-8">
            
            {/* Top Hits (With Number Badges) */}
            <section>
              <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-xl font-bold">Top Hits Anime</h2>
                <button className="text-red-500 text-sm font-semibold">See All</button>
              </div>
              <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory hide-scrollbar">
                {trending.slice(1).map((anime, index) => (
                  <div key={anime.id} className="snap-start shrink-0 w-36 md:w-48 group cursor-pointer relative">
                    <div className="overflow-hidden rounded-xl bg-gray-800 aspect-[2/3] border border-gray-800">
                      <img 
                        src={anime.coverImage.extraLarge} 
                        alt={getTitle(anime)} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {/* The Number Badge */}
                    <div className="absolute -top-2 -left-2 bg-red-600 text-white font-bold text-lg w-8 h-8 rounded-lg flex items-center justify-center shadow-lg border border-[#0a0a0f]">
                      {index + 1}
                    </div>
                    <h3 className="mt-2 text-sm font-medium truncate">{getTitle(anime)}</h3>
                  </div>
                ))}
              </div>
            </section>

            {/* Discover Section */}
            <section>
              <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-xl font-bold">New Releases</h2>
                <button className="text-red-500 text-sm font-semibold">See All</button>
              </div>
              <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory hide-scrollbar">
                {popular.map((anime) => (
                  <div key={anime.id} className="snap-start shrink-0 w-36 md:w-48 group cursor-pointer">
                    <div className="overflow-hidden rounded-xl bg-gray-800 aspect-[2/3] border border-gray-800">
                      <img 
                        src={anime.coverImage.extraLarge} 
                        alt={getTitle(anime)} 
                        className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-200"
                      />
                    </div>
                    <h3 className="mt-2 text-sm font-medium truncate">{getTitle(anime)}</h3>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* SEARCH TAB */}
      {activeTab === 'search' && (
        <main className="max-w-6xl mx-auto px-4 pt-12 space-y-6">
          <h2 className="text-3xl font-bold">Search</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Find anime, genres, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl focus:outline-none focus:border-red-500 transition-colors"
            />
            <div className="absolute left-4 top-4 text-gray-400">
              <SearchIcon />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {searchResults.map((anime) => (
              <div key={anime.id} className="group cursor-pointer">
                <div className="overflow-hidden rounded-xl bg-gray-800 aspect-[2/3]">
                  <img 
                    src={anime.coverImage.extraLarge} 
                    alt={getTitle(anime)} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="mt-2 text-sm font-medium truncate">{getTitle(anime)}</h3>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 w-full bg-[#0a0a0f]/95 backdrop-blur-md border-t border-gray-800/50 pb-safe z-50">
        <div className="max-w-md mx-auto flex justify-between items-center px-8 py-3">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'home' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <HomeIcon />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'search' ? 'text-red-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <SearchIcon />
            <span className="text-[10px] font-medium">Search</span>
          </button>

          <button 
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition"
          >
            <ListIcon />
            <span className="text-[10px] font-medium">My List</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
