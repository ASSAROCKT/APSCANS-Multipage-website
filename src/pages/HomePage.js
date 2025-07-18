// src/pages/HomePage.js

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroCarousel from '../components/HeroCarousel'; // Import the new component
import { slugify } from '../utils/slugify';

function HomePage() {
  const [allMangaData, setAllMangaData] = useState([]);
  const [displayLatestMangaData, setDisplayLatestMangaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch all manga data
  const fetchAllMangaData = async () => {
    try {
      setLoading(true);
      const urls = [
        // CORRECTED URLS TO MATCH YOUR SERIESPAGE AND LIKELY ACTUAL LOCATION
        'https://raw.githubusercontent.com/ASSAROCKT/aphroditescans/refs/heads/main/Tsumi%20to%20Batsu%20no%20Spica.json',
        'https://raw.githubusercontent.com/ASSAROCKT/aphroditescans/refs/heads/main/Olympia%20of%20Infidelity.json'
        // IMPORTANT: Add more manga JSON URLs here for more items in the carousel and latest updates
      ];

      const fetchPromises = urls.map(url =>
        fetch(url).then(response => {
          if (!response.ok) {
            // Log the specific URL that failed for easier debugging
            console.warn(`HTTP error! status: ${response.status} from ${url}`);
            // Instead of throwing, return null to filter out failed fetches later
            return null;
          }
          return response.json();
        }).catch(e => {
            console.error(`Network or parsing error for ${url}:`, e);
            return null; // Return null on network/parsing errors too
        })
      );

      const rawData = await Promise.all(fetchPromises);
      // Filter out any nulls from failed fetches
      const successfulData = rawData.filter(data => data !== null);

      if (successfulData.length === 0 && urls.length > 0) {
          setError("No manga data could be loaded. Please check source URLs.");
          setLoading(false);
          return;
      }

      setAllMangaData(successfulData); // Store all successful series data for both sections

      // --- Process data for "Latest Updates" (chapter-centric) ---
      let allChapterUpdates = [];
      successfulData.forEach(manga => { // Use successfulData
        Object.keys(manga.chapters).forEach(chapterKey => {
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

      const sortedChapterUpdates = allChapterUpdates.sort((a, b) => b.lastUpdated - a.lastUpdated);
      setDisplayLatestMangaData(sortedChapterUpdates.slice(0, 8));

    } catch (e) {
      // This catch block will primarily catch errors from Promise.all itself,
      // not individual fetch failures if we handle them within the map.
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

  if (allMangaData.length === 0 && !loading && !error) { // Ensure we only show this if no data and no active error
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        <div className="text-xl font-semibold">No manga data available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 font-inter text-white">
      <Header />
      <div className="container mx-auto p-4 min-h-[calc(100vh-64px)]">

        {/* ======================= Hero Carousel Section ======================= */}
        {/* Pass allMangaData to the HeroCarousel */}
        <HeroCarousel mangaData={allMangaData} />

        {/* ======================= Latest Updates Section ======================= */}
        <h1 className="text-4xl font-bold text-indigo-400 mb-8 text-center">Latest Updates</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {displayLatestMangaData.map((chapterUpdate, index) => (
            <a
              key={`${chapterUpdate.mangaTitle}-${chapterUpdate.chapterKey}`}
              href={`/${slugify(chapterUpdate.mangaTitle)}/${chapterUpdate.chapterKey}`}
              className="group block bg-gray-900 rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden border border-gray-800 hover:border-indigo-600"
            >
              <img
                src={chapterUpdate.mangaCover}
                alt={`${chapterUpdate.mangaTitle} Cover`}
                className="w-full h-48 object-cover object-top rounded-t-lg transition duration-300 ease-in-out group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/200x280/333333/FFFFFF?text=No+Cover";
                }}
              />
              <div className="p-3">
                <h3 className="text-white font-semibold text-lg mb-1 truncate">{chapterUpdate.mangaTitle}</h3>
                <p className="text-gray-400 text-sm">Ch. {chapterUpdate.chapterKey}</p>
              </div>
            </a>
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