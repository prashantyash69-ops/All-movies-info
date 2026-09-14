import React, { useState, useEffect } from 'react';

// Icons
const HomeIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>);
const SearchIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>);
const ListIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>);
const BackIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>);
const StarIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>);

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [myList, setMyList] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null); // Controls Details Page

  const ANILIST_URL = 'https://graphql.anilist.co';

  // Load MyList from LocalStorage on start
  useEffect(() => {
    const saved = localStorage.getItem('myAnimeList');
    if (saved) setMyList(JSON.parse(saved));
    fetchDefaultAnime();
  }, []);

  // Save to LocalStorage whenever MyList changes
  useEffect(() => {
    localStorage.setItem('myAnimeList', JSON.stringify(myList));
  }, [myList]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delay = setTimeout(() => searchAnime(searchQuery), 500);
      return () => clearTimeout(delay);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchDefaultAnime = async () => {
    const query = `
      query {
        trending: Page(page: 1, perPage: 10) {
          media(sort: TRENDING_DESC, type: ANIME) { id title { english romaji } coverImage { extraLarge } bannerImage genres description averageScore }
        }
        popular: Page(page: 1, perPage: 15) {
          media(sort: POPULARITY_DESC, type: ANIME) { id title { english romaji } coverImage { extraLarge } bannerImage genres description averageScore }
        }
      }
    `;
    try {
      const response = await fetch(ANILIST_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
      const data = await response.json();
      setTrending(data.data.trending.media);
      setPopular(data.data.popular.media);
    } catch (e) { console.error(e); }
  };

  const searchAnime = async (search) => {
    const query = `
      query ($search: String) {
        Page(page: 1, perPage: 20) {
          media(search: $search, type: ANIME, sort: SEARCH_MATCH) { id title { english romaji } coverImage { extraLarge } bannerImage genres description averageScore }
        }
      }
    `;
    try {
      const response = await fetch(ANILIST_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, variables: { search } }) });
      const data = await response.json();
      setSearchResults(data.data.Page.media);
    } catch (e) { console.error(e); }
  };

  const getTitle = (anime) => anime?.title?.english || anime?.title?.romaji;
  const toggleMyList = (anime) => {
    const exists = myList.find(item => item.id === anime.id);
    if (exists) setMyList(myList.filter(item => item.id !== anime.id));
    else setMyList([...myList, anime]);
  };
  const isInList = (id) => myList.some(item => item.id === id);

  const heroAnime = trending.length > 0 ? trending[0] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans overflow-x-hidden">
      
      {/* FULL SCREEN DETAILS PAGE OVERLAY */}
      {selectedAnime && (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0f] animate-slide-in-right overflow-y-auto pb-24">
          <div className="relative w-full h-[50vh]">
            <img src={selectedAnime.bannerImage || selectedAnime.coverImage.extraLarge} alt="banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
            <button 
              onClick={() => setSelectedAnime(null)}
              className="absolute top-6 left-4 p-3 bg-black/50 backdrop-blur-md rounded-full"
            >
              <BackIcon />
            </button>
          </div>
          <div className="px-6 -mt-10 relative z-10 animate-slide-in-up">
            <h1 className="text-3xl font-bold mb-2">{getTitle(selectedAnime)}</h1>
            <div className="flex gap-4 items-center text-sm text-gray-300 mb-6 font-medium">
              <span className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-md"><StarIcon /> {selectedAnime.averageScore || 'N/A'}%</span>
              <span>{selectedAnime.genres?.slice(0, 2).join(' • ')}</span>
            </div>
            
            <div className="flex gap-4 w-full mb-8">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex justify-center items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Play
              </button>
              <button 
                onClick={() => toggleMyList(selectedAnime)}
                className={`flex-1 font-bold py-3 px-4 rounded-xl border transition ${isInList(selectedAnime.id) ? 'bg-white text-black' : 'bg-gray-800 border-gray-600'}`}
              >
                {isInList(selectedAnime.id) ? '✓ Added' : '+ My List'}
              </button>
            </div>

            <h3 className="text-lg font-bold mb-2 text-gray-400">Synopsis</h3>
            <p className="text-gray-300 leading-relaxed text-sm mb-10" dangerouslySetInnerHTML={{ __html: selectedAnime.description || "No description available." }}></p>
          </div>
        </div>
      )}

      {/* HOME TAB */}
      {!selectedAnime && activeTab === 'home' && (
        <main className="animate-fade-in pb-24">
          {heroAnime && (
            <div className="relative w-full h-[60vh]">
              <img src={heroAnime.bannerImage || heroAnime.coverImage.extraLarge} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent"></div>
              <div className="absolute bottom-0 w-full p-6 flex flex-col items-center text-center animate-slide-in-up">
                <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">{getTitle(heroAnime)}</h1>
                <p className="text-sm text-gray-300 mb-6">{heroAnime.genres?.slice(0, 3).join(' • ')}</p>
                <div className="flex gap-4 w-full max-w-md">
                  <button onClick={() => setSelectedAnime(heroAnime)} className="flex-1 bg-red-600 py-3 rounded-xl font-bold flex justify-center gap-2">Play</button>
                  <button onClick={() => toggleMyList(heroAnime)} className="flex-1 bg-gray-800/80 py-3 rounded-xl border border-gray-600 font-bold backdrop-blur">
                    {isInList(heroAnime.id) ? '✓ Added' : '+ My List'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto space-y-8 mt-6">
            <section className="animate-slide-in-right">
              <h2 className="text-xl font-bold mb-4 px-4">Top Hits Anime</h2>
              <div className="flex overflow-x-auto gap-4 px-4 pb-4 snap-x snap-mandatory hide-scrollbar">
                {trending.slice(1).map((anime, idx) => (
                  <div key={anime.id} onClick={() => setSelectedAnime(anime)} className="snap-start shrink-0 w-36 group cursor-pointer relative">
                    <img src={anime.coverImage.extraLarge} className="w-full aspect-[2/3] object-cover rounded-xl bg-gray-800" />
                    <div className="absolute -top-2 -left-2 bg-red-600 font-bold w-8 h-8 rounded-lg flex items-center justify-center shadow-lg border border-[#0a0a0f]">{idx + 1}</div>
                    <h3 className="mt-2 text-sm font-medium truncate">{getTitle(anime)}</h3>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* SEARCH TAB */}
      {!selectedAnime && activeTab === 'search' && (
        <main className="max-w-6xl mx-auto px-4 pt-12 pb-24 animate-fade-in">
          <h2 className="text-3xl font-bold mb-6">Search</h2>
          <div className="relative mb-6">
            <input type="text" placeholder="Find anime..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-2xl focus:border-red-500 outline-none" />
            <div className="absolute left-4 top-4 text-gray-400"><SearchIcon /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {searchResults.map((anime) => (
              <div key={anime.id} onClick={() => setSelectedAnime(anime)} className="cursor-pointer animate-slide-in-up">
                <img src={anime.coverImage.extraLarge} className="w-full aspect-[2/3] object-cover rounded-xl bg-gray-800" />
                <h3 className="mt-2 text-sm font-medium truncate">{getTitle(anime)}</h3>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* MY LIST TAB */}
      {!selectedAnime && activeTab === 'list' && (
        <main className="max-w-6xl mx-auto px-4 pt-12 pb-24 animate-fade-in">
          <h2 className="text-3xl font-bold mb-6">My List</h2>
          {myList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
              <ListIcon />
              <p className="mt-4">Your list is empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {myList.map((anime) => (
                <div key={anime.id} onClick={() => setSelectedAnime(anime)} className="cursor-pointer animate-slide-in-up">
                  <img src={anime.coverImage.extraLarge} className="w-full aspect-[2/3] object-cover rounded-xl bg-gray-800" />
                  <h3 className="mt-2 text-sm font-medium truncate">{getTitle(anime)}</h3>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* BOTTOM NAVIGATION */}
      <nav className={`fixed bottom-0 w-full bg-[#0a0a0f]/95 backdrop-blur-md border-t border-gray-800/50 pb-safe z-50 transition-transform duration-300 ${selectedAnime ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className="max-w-md mx-auto flex justify-between items-center px-8 py-3">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-red-500' : 'text-gray-500'}`}><HomeIcon /><span className="text-[10px]">Home</span></button>
          <button onClick={() => setActiveTab('search')} className={`flex flex-col items-center gap-1 ${activeTab === 'search' ? 'text-red-500' : 'text-gray-500'}`}><SearchIcon /><span className="text-[10px]">Search</span></button>
          <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center gap-1 ${activeTab === 'list' ? 'text-red-500' : 'text-gray-500'}`}><ListIcon /><span className="text-[10px]">My List</span></button>
        </div>
      </nav>
    </div>
  );
}
