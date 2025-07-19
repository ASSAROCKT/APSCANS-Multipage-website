// src/pages/HomePage.js

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroBanner from '../components/HeroBanner'; // Import the new HeroBanner component
import { slugify } from '../utils/slugify';

function HomePage() {
  const [allMangaData, setAllMangaData] = useState([]);
  const [displayLatestMangaData, setDisplayLatestMangaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch all manga data for Latest Updates and All Series sections
  const fetchAllMangaData = async () => {
    try {
      setLoading(true);
      // These URLs are for the 'Latest Updates' and 'All Series' sections
      // The HeroBanner fetches its own data from Banner.json
      const urls = [
        'https://raw.githubusercontent.com/ASSAROCKT/aphroditescans/refs/heads/main/Tsumi%20to%20Batsu%20no%20Spica.json',
        'https://raw.githubusercontent.com/ASSAROCKT/aphroditescans/refs/heads/main/Olympia%20of%20Infidelity.json',
        'https://raw.githubusercontent.com/ASSAROCKT/aphroditescans/refs/heads/main/Kanojo%20wa%20Mada%20Sore%20o%20Shiranai.json' // Added another manga URL
      ];

      const fetchPromises = urls.map(url =>
        fetch(url).then(response => {
          if (!response.ok) {
            console.warn(`HTTP error! status: ${response.status} from ${url}`);
            return null;
          }
          return response.json();
        }).catch(e => {
            console.error(`Network or parsing error for ${url}:`, e);
            return null;
        })
      );

      const rawData = await Promise.all(fetchPromises);
      const successfulData = rawData.filter(data => data !== null);

      if (successfulData.length === 0 && urls.length > 0) {
          setError("No manga data could be loaded for Latest Updates/All Series. Please check source URLs.");
          setLoading(false);
          return;
      }

      setAllMangaData(successfulData); // Store all successful series data for both sections

      // --- Process data for "Latest Updates" (chapter-centric) ---
      let allChapterUpdates = [];
      successfulData.forEach(manga => {
        Object.keys(manga.chapters || {}).forEach(chapterKey => { // Added || {} for safety
          const chapter = manga.chapters[chapterKey];
          allChapterUpdates.push({
            mangaTitle: manga.title,
            mangaCover: manga.cover,
            chapterKey: chapterKey,
            chapterTitle: chapter.title,
            lastUpdated: chapter.last_updated
          });
        });
      });

      // Sort by lastUpdated (newest first)
      const sortedChapterUpdates = allChapterUpdates.sort((a, b) => b.lastUpdated - a.lastUpdated);
      // Display top 8 latest updates (2 columns * 4 rows = 8 items)
      setDisplayLatestMangaData(sortedChapterUpdates.slice(0, 8));

    } catch (e) {
      console.error("Critical error fetching all manga data:", e);
      setError("Failed to load manga data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMangaData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-xl font-semibold">Loading manga data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-500">
        <div className="text-xl font-semibold">{error}</div>
      </div>
    );
  }

  // This check is for the Latest Updates/All Series sections, not the banner
  if (allMangaData.length === 0 && !loading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        <div className="text-xl font-semibold">No manga data available for Latest Updates/All Series.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 font-inter text-white">
      <Header />
      <div className="container mx-auto p-4 min-h-[calc(100vh-64px)]">

        {/* ======================= Hero Banner Section (New) ======================= */}
        {/* The HeroBanner component now fetches its own data */}
        <HeroBanner />

        {/* ======================= Latest Updates Section ======================= */}
        <h1 className="text-4xl font-bold text-indigo-400 mb-8 text-center">Latest Updates</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {displayLatestMangaData.map((chapterUpdate, index) => (
            <div
              key={`${chapterUpdate.mangaTitle}-${chapterUpdate.chapterKey}`}
              className="group block bg-gray-900 rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden border border-gray-800 hover:border-indigo-600"
            >
              {/* This anchor tag now wraps the image and chapter info */}
              <a 
                href={`/${slugify(chapterUpdate.mangaTitle)}/${chapterUpdate.chapterKey}`}
                className="block" // Make the anchor tag a block to wrap content
              >
                <img
                  src={chapterUpdate.mangaCover}
                  alt={`${chapterUpdate.mangaTitle} Cover`}
                  className="w-full h-64 object-cover object-top rounded-t-lg transition duration-300 ease-in-out group-hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/200x280/333333/FFFFFF?text=No+Cover";
                  }}
                />
                <div className="p-3">
                  {/* Separate anchor tag for manga title only */}
                  <h3 className="mb-1 truncate">
                    <a
                      href={`/${slugify(chapterUpdate.mangaTitle)}`}
                      className="text-white font-semibold text-lg hover:text-indigo-400 hover:underline transition-colors duration-300"
                      onClick={(e) => e.stopPropagation()} // Prevent parent link from triggering
                    >
                      {chapterUpdate.mangaTitle}
                    </a>
                  </h3>
                  <p className="text-gray-400 text-sm">Ch. {chapterUpdate.chapterKey}</p>
                </div>
              </a>
            </div>
          ))}
        </div>

        {/* ======================= All Series Section (Previous List Style) ======================= */}
        <h1 className="text-4xl font-bold text-indigo-400 mb-8 text-center">All Series</h1>
        <div className="flex flex-col space-y-8">
          {allMangaData.map((manga, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-lg shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center max-w-4xl mx-auto w-full border border-gray-700"
            >
              <img
                src={manga.cover}
                alt={`${manga.title} Cover`}
                className="w-36 h-auto rounded-lg shadow-md mb-4 md:mb-0 md:mr-8 object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/144x216/333333/FFFFFF?text=No+Cover";
                }}
              />
              <div className="text-center md:text-left flex-grow">
                <h3 className="text-2xl font-bold text-white mb-2">
                  <a
                    href={`/${slugify(manga.title)}`}
                    className="text-indigo-400 hover:text-indigo-300 hover:underline transition duration-300 ease-in-out"
                  >
                    {manga.title}
                  </a>
                </h3>
                <p className="text-gray-300 text-sm mb-2">
                  <span className="font-semibold">Author:</span> {manga.author} | <span className="font-semibold">Artist:</span> {manga.artist}
                </p>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{manga.description}</p>
                <a
                  href={`/${slugify(manga.title)}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Go To Series Page
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default HomePage;