// src/pages/SeriesPage.js

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { slugify } from '../utils/slugify'; // Import slugify

function SeriesPage() {
  const [mangaData, setMangaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const mangaSlug = pathSegments[0];

    if (!mangaSlug) {
      setError("No manga slug provided in the URL.");
      setLoading(false);
      return;
    }

    const fetchMangaData = async () => {
      try {
        setLoading(true);
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
          console.error(`HTTP error! status: ${response.status} from ${url}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (slugify(data.title) !== mangaSlug) {
          throw new Error("Manga title mismatch for slug.");
        }
        setMangaData(data);
      } catch (e) {
        console.error("Error fetching manga data for series:", e);
        setError(`Failed to load series data for "${mangaSlug}". Please check the URL and try again later.`);
      } finally {
        setLoading(false);
      }
    };

    fetchMangaData();
  }, [window.location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-xl font-semibold">Loading series data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-red-500">
        <div className="text-xl font-semibold">{error}</div>
        <a
          href="/"
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
        >
          Back to Home
        </a>
      </div>
    );
  }

  if (!mangaData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400">
        <div className="text-xl font-semibold">Manga data not loaded.</div>
      </div>
    );
  }

  const sortedChapterKeys = Object.keys(mangaData.chapters).sort((a, b) => {
    return parseFloat(b) - parseFloat(a);
  });

  const firstChapterKey = Object.keys(mangaData.chapters).sort((a, b) => parseFloat(a) - parseFloat(b))[0];

  const formatTimestampToDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncatedDescription = mangaData.description.length > 300 && !showFullDescription
    ? mangaData.description.substring(0, 300) + '...'
    : mangaData.description;

  return (
    <div className="min-h-screen bg-gray-950 font-inter text-white">
      <Header />
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden mb-8 border border-gray-700 flex flex-col lg:flex-row">
          {/* Left Panel */}
          <div className="lg:w-1/3 p-4 flex flex-col items-start border-b lg:border-b-0 lg:border-r border-gray-700">
            <img
              src={mangaData.cover}
              alt={`${mangaData.title} Cover`}
              className="w-full h-auto max-w-[280px] rounded-lg shadow-md mb-6 object-cover mx-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/280x400/333333/FFFFFF?text=No+Cover";
              }}
            />

            {/* Genres - Left aligned, rectangle shape */}
            {mangaData.genres && mangaData.genres.length > 0 && (
              <div className="mb-4 text-left w-full">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2 justify-start">
                  {mangaData.genres.map((genre, index) => (
                    <span key={index} className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-md border border-gray-600">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Themes - Left aligned, rectangle shape */}
            {mangaData.themes && mangaData.themes.length > 0 && (
              <div className="mb-4 text-left w-full">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Themes</h3>
                <div className="flex flex-wrap gap-2 justify-start">
                  {mangaData.themes.map((theme, index) => (
                    <span key={index} className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-md border border-gray-600">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Demographic - Left aligned, rectangle shape */}
            {mangaData.demographic && (
              <div className="mb-6 text-left w-full">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Demographic</h3>
                <span className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-md border border-gray-600">
                  {mangaData.demographic}
                </span>
              </div>
            )}

            {/* Start Reading Button - remains full width, content is centered by justify-center */}
            <a
              href={`/${slugify(mangaData.title)}/${firstChapterKey}`}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center text-lg"
            >
              Start Reading
            </a>

          </div>

          {/* Right Panel */}
          <div className="lg:w-2/3 flex flex-col">
            {/* Banner Image - Hidden on small screens, shown on large screens */}
            <div
              className="w-full h-80 bg-cover rounded-tr-xl lg:rounded-tl-none hidden lg:block"
              style={{
                backgroundImage: `url(${mangaData.cover})`,
                backgroundPosition: 'center top'
              }}
              aria-label={`${mangaData.title} Banner`}
            ></div>

            <div className="p-6 flex-grow">
              <h1 className="text-4xl font-bold text-indigo-400 mb-2">{mangaData.title}</h1>
              <p className="text-gray-300 text-lg mb-4">
                <span className="font-semibold">Artist:</span> {mangaData.artist} | <span className="font-semibold">Author:</span> {mangaData.author}
              </p>

              {/* Description with Show More/Less */}
              <div className="text-gray-300 text-base mb-6">
                <p>{truncatedDescription}</p>
                {mangaData.description.length > 300 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-indigo-400 hover:underline mt-2 text-sm"
                  >
                    {showFullDescription ? 'Show Less ^' : 'Show More v'}
                  </button>
                )}
              </div>

              {/* Chapters Section */}
              <div className="bg-gray-800 rounded-lg shadow-inner p-4 border border-gray-700">
                <h2 className="text-2xl font-bold text-indigo-400 mb-4">Chapters</h2>
                <div className="overflow-x-auto max-h-96 custom-scrollbar pr-2">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="sticky top-0 bg-gray-800 z-10">
                      <tr>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-20"> {/* Added width class for Chapter */}
                          Chapter
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Title
                        </th>
                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider rounded-tr-lg w-32"> {/* Added width class for Last Updated */}
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                      {sortedChapterKeys.map((chapterKey) => {
                        const chapter = mangaData.chapters[chapterKey];
                        const lastUpdatedDate = formatTimestampToDate(chapter.last_updated);

                        return (
                          <tr
                            key={chapterKey}
                            className="hover:bg-gray-800 transition duration-150 ease-in-out"
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white" colSpan="3">
                              <a
                                href={`/${slugify(mangaData.title)}/${chapterKey}`}
                                className="block w-full h-full text-indigo-400 hover:text-indigo-300"
                              >
                                <div className="grid grid-cols-[80px_1fr_120px] gap-4 items-center"> {/* Adjusted grid-cols to specify widths */}
                                  <div className="text-left">{chapterKey}</div> {/* No col-span needed here, grid handles it */}
                                  <div className="text-left">{chapter.title}</div>
                                  <div className="text-left">{lastUpdatedDate}</div>
                                </div>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeriesPage;