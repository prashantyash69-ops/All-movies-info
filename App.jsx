import React, { useState } from 'react';

const TRENDING_ANIME = [
  { id: '1', title: 'Your Name', image: 'https://cdn.myanimelist.net/images/anime/5/87048.jpg' },
  { id: '2', title: 'Spirited Away', image: 'https://cdn.myanimelist.net/images/anime/6/79597.jpg' },
  { id: '3', title: 'Akira', image: 'https://cdn.myanimelist.net/images/anime/10/43003.jpg' },
  { id: '4', title: 'Suzume', image: 'https://cdn.myanimelist.net/images/anime/1120/136178.jpg' },
];

const DISCOVER_ANIME = [
  { id: '5', title: 'A Silent Voice', image: 'https://cdn.myanimelist.net/images/anime/1122/96435.jpg' },
  { id: '6', title: 'Perfect Blue', image: 'https://cdn.myanimelist.net/images/anime/11/79131.jpg' },
  { id: '7', title: 'Ghost in the Shell', image: 'https://cdn.myanimelist.net/images/anime/10/82594.jpg' },
  { id: '8', title: 'Princess Mononoke', image: 'https://cdn.myanimelist.net/images/anime/7/75919.jpg' },
  { id: '9', title: 'Weathering with You', image: 'https://cdn.myanimelist.net/images/anime/1880/101146.jpg' },
  { id: '10', title: 'Howl\'s Moving Castle', image: 'https://cdn.myanimelist.net/images/anime/5/73199.jpg' },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

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
        
        <section>
          <h2 className="text-xl font-bold mb-4 px-1">Trending Now</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar">
            {TRENDING_ANIME.map((anime) => (
              <div key={anime.id} className="snap-start shrink-0 w-64 md:w-80 group cursor-pointer">
                <div className="overflow-hidden rounded-2xl relative aspect-video">
                  <img 
                    src={anime.image} 
                    alt={anime.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <h3 className="absolute bottom-3 left-4 text-lg font-semibold">{anime.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-xl font-bold">Discover</h2>
            <div className="hidden md:flex gap-2 text-xs">
              <button className="px-3 py-1 bg-indigo-600 rounded-full">All</button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full">Action</button>
              <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full">Romance</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {DISCOVER_ANIME.map((anime) => (
              <div key={anime.id} className="group cursor-pointer">
                <div className="overflow-hidden rounded-xl bg-gray-800 aspect-[2/3] shadow-lg">
                  <img 
                    src={anime.image} 
                    alt={anime.title} 
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-200"
                  />
                </div>
                <h3 className="mt-2 text-sm md:text-base font-medium truncate">{anime.title}</h3>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
