// src/pages/ReaderPage.js

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import { slugify } from '../utils/slugify'; // Import slugify

function ReaderPage() {
  const [mangaData, setMangaData] = useState(null);
  const [selectedChapterKey, setSelectedChapterKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This effect runs on component mount and when URL changes
  useEffect(() => {
    // Extract slug and chapter key from URL path (e.g., /tsumi-to-batsu-no-spica/21)
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const mangaSlug = pathSegments[0];
    const chapterKey = pathSegments[1];

    if (!mangaSlug || !chapterKey) {
      setError("Manga slug or chapter key missing from URL.");
      setLoading(false);
      return;
    }

    setSelectedChapterKey(chapterKey); // Update local state for rendering

    const fetchMangaData = async () => {
      try {
        setLoading(true);
        // Similar to SeriesPage, we're hardcoding the mapping from slug to JSON URL.
        let url = '';
        if (mangaSlug === slugify('Tsumi to Batsu no Spica')) {
          url = 'https://raw.githubusercontent.com/ASSAROCKT/aphroditescans/refs/heads/main/Tsumi%20to%20Batsu%20no%20Spica.json';
        } else if (mangaSlug === slugify('Olympia of Infidelity')) {
          url = 'https://raw.githubusercontent.com/ASSAROCKT/aphroditescans/refs/heads/main/Olympia%20of%20Infidelity.json';
        } else {
            throw new Error(`Manga data for slug "${mangaSlug}" not found.`);
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} from ${url}`);
        }
        const data = await response.json();
        if (slugify(data.title) !== mangaSlug) {
            throw new Error("Manga title mismatch for slug.");
        }
        setMangaData(data);
      } catch (e) {
        console.error("Error fetching manga data for reader:", e);
        setError(`Failed to load manga or chapter data for "${mangaSlug}".`);
      } finally {
        setLoading(false);
      }
    };

    fetchMangaData();
  }, [window.location.pathname]); // Trigger effect when path changes

  // Scroll to top when chapter changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedChapterKey]);

  const chapters = mangaData?.chapters || {};
  const chapterKeys = Object.keys(chapters).sort((a, b) => parseFloat(a) - parseFloat(b));
  const currentChapterIndex = chapterKeys.indexOf(selectedChapterKey);

  // Navigate using window.location.href directly for MPAs
  const navigateToChapter = useCallback((newChapterKey) => {
    if (mangaData && newChapterKey) {
        window.location.href = `/${slugify(mangaData.title)}/${newChapterKey}`;
    }
  }, [mangaData]);


  const goToPreviousChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      const prevChapterKey = chapterKeys[currentChapterIndex - 1];
      navigateToChapter(prevChapterKey);
    }
  }, [currentChapterIndex, chapterKeys, navigateToChapter]);

  const goToNextChapter = useCallback(() => {
    if (currentChapterIndex < chapterKeys.length - 1) {
      const nextChapterKey = chapterKeys[currentChapterIndex + 1];
      navigateToChapter(nextChapterKey);
    }
  }, [currentChapterIndex, chapterKeys, navigateToChapter]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        goToPreviousChapter();
      } else if (event.key === 'ArrowRight') {
        goToNextChapter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToPreviousChapter, goToNextChapter]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-xl font-semibold">Loading chapter...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-red-500">
        <div className="text-xl font-semibold">{error}</div>
        <a
          href={mangaData ? `/${slugify(mangaData.title)}` : '/'}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
        >
          Back to Chapters
        </a>
      </div>
    );
  }

  // Ensure mangaData and current chapter are available before rendering content
  if (!mangaData || !selectedChapterKey || !chapters[selectedChapterKey]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-red-500">
        <div className="text-xl font-semibold">Chapter not found or data missing.</div>
        <a
            href={mangaData ? `/${slugify(mangaData.title)}` : '/'}
            className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
        >
            Back to Chapters
        </a>
      </div>
    );
  }

  const currentChapter = chapters[selectedChapterKey];
  const imageUrls = currentChapter.groups[Object.keys(currentChapter.groups)[0]] || [];


  return (
    <div className="min-h-screen bg-gray-950 font-inter text-white">
      <Header />
      <div className="container mx-auto p-4"> {/* This is the main page content container */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <a
            // Back to series page with clean URL
            href={`/${slugify(mangaData.title)}`}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out mb-4 md:mb-0"
          >
            &larr; Back to Chapters
          </a>
          <h2 className="text-3xl font-bold text-indigo-400 text-center flex-grow">
            Chapter {selectedChapterKey}: {currentChapter.title}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousChapter}
              disabled={currentChapterIndex === 0}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out ${
                currentChapterIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
              }`}
            >
              Previous
            </button>
            <button
              onClick={goToNextChapter}
              disabled={currentChapterIndex === chapterKeys.length - 1}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out ${
                currentChapterIndex === chapterKeys.length - 1 ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* This is the container wrapping your images */}
        <div className="flex flex-col items-center p-0"> {/* Removed bg, rounded, shadow, border. Set p-0 */}
          {imageUrls.length > 0 ? (
            imageUrls.map((imageUrl, index) => (
              <img
                key={index}
                src={imageUrl}
                alt={`Page ${index + 1}`}
                // Responsive image sizing:
                // w-full on small screens (fit to width)
                // md:w-auto and md:max-w-full on medium screens and up (original size, but don't overflow)
                className="w-full h-auto max-w-full rounded-md mb-2 object-contain md:w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/600x800/555555/FFFFFF?text=Image+Load+Error`;
                }}
              />
            ))
          ) : (
            <p className="text-gray-400 text-lg">No images found for this chapter.</p>
          )}
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={goToPreviousChapter}
            disabled={currentChapterIndex === 0}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out ${
              currentChapterIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
            }`}
          >
            Previous
          </button>
          <button
            onClick={goToNextChapter}
            disabled={currentChapterIndex === chapterKeys.length - 1}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out ${
              currentChapterIndex === chapterKeys.length - 1 ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReaderPage;