// src/pages/ReaderPage.js

import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import Header from '../components/Header';
import { slugify } from '../utils/slugify';

const LazyReaderMenu = lazy(() => import('../components/ReaderMenu'));
const ReaderToggleButton = lazy(() => import('../components/ReaderHeader'));


function ReaderPage() {
  const [mangaData, setMangaData] = useState(null);
  const [selectedChapterKey, setSelectedChapterKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showReaderMenu, setShowReaderMenu] = useState(false);

  // --- START CHANGES FOR LOCAL STORAGE ---
  // Initialize state from localStorage, or use defaults
  const [readingMode, setReadingMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('readerReadingMode');
      return savedMode ? JSON.parse(savedMode) : 'vertical'; // Default to 'vertical'
    } catch (e) {
      console.error("Failed to load reading mode from localStorage:", e);
      return 'vertical'; // Fallback in case of error
    }
  });

  const [isHeaderHidden, setIsHeaderHidden] = useState(() => {
    try {
      const savedHeaderHidden = localStorage.getItem('readerIsHeaderHidden');
      // localStorage stores strings, convert back to boolean
      return savedHeaderHidden !== null ? JSON.parse(savedHeaderHidden) : false; // Default to false (header visible)
    } catch (e) {
      console.error("Failed to load header hidden state from localStorage:", e);
      return false; // Fallback in case of error
    }
  });
  // --- END CHANGES FOR LOCAL STORAGE ---


  const [currentPage, setCurrentPage] = useState(1);
  const [imageLoadErrors, setImageLoadErrors] = useState({});
  const preloadedImagesRef = useRef({});
  const imageRefs = useRef([]);
  const contentAreaRef = useRef(null);


  // --- START CHANGES FOR LOCAL STORAGE ---
  // Effect to save readingMode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('readerReadingMode', JSON.stringify(readingMode));
    } catch (e) {
      console.error("Failed to save reading mode to localStorage:", e);
    }
  }, [readingMode]);

  // Effect to save isHeaderHidden to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('readerIsHeaderHidden', JSON.stringify(isHeaderHidden));
    } catch (e) {
      console.error("Failed to save header hidden state to localStorage:", e);
    }
  }, [isHeaderHidden]);
  // --- END CHANGES FOR LOCAL STORAGE ---


  // Effect for fetching manga data based on URL
  useEffect(() => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const mangaSlug = pathSegments[0];
    const chapterKey = pathSegments[1];

    if (!mangaSlug || !chapterKey) {
      setError("Manga slug or chapter key missing from URL.");
      setLoading(false);
      return;
    }

    setSelectedChapterKey(chapterKey);

    const fetchMangaData = async () => {
      try {
        setLoading(true);
        let url = '';
        let fetchedGenre = 'Unknown Genre';

        if (mangaSlug === slugify('Tsumi to Batsu no Spica')) {
          url = 'https://raw.githubusercontent.com/ASSAROCKT/aphroditescans/refs/heads/main/Tsumi%20to%20Batsu%20no%20Spica.json';
          fetchedGenre = 'Shoujo';
        } else if (mangaSlug === slugify('Olympia of Infidelity')) {
          url = 'https://raw.githubusercontent.com/ASSAROCKT/aphroditescans/refs/heads/main/Olympia%20of%20Infidelity.json';
          fetchedGenre = 'Adult, Drama';
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
        setMangaData({ ...data, genre: fetchedGenre });
        setImageLoadErrors({});
        setCurrentPage(1);
        preloadedImagesRef.current = {};
      } catch (e) {
        console.error("Error fetching manga data for reader:", e);
        setError(`Failed to load manga or chapter data for "${mangaSlug}".`);
      } finally {
        setLoading(false);
      }
    };

    fetchMangaData();
  }, [window.location.pathname]);

  // Scroll to current page logic for single/double modes, or top for vertical
  useEffect(() => {
    if ((readingMode === 'single' || readingMode === 'double') && imageRefs.current[currentPage - 1]) {
      imageRefs.current[currentPage - 1].scrollIntoView({ behavior: 'smooth', block: 'start' }); // Changed to 'start'
    } else if (readingMode === 'vertical' && !selectedChapterKey) {
      window.scrollTo(0, 0);
    }
  }, [selectedChapterKey, readingMode, currentPage]);


  const chapters = mangaData?.chapters || {};
  const chapterKeys = Object.keys(chapters).sort((a, b) => parseFloat(a) - parseFloat(b));
  const currentChapterIndex = chapterKeys.indexOf(selectedChapterKey);

  const currentChapter = chapters[selectedChapterKey];
  const imageUrls = currentChapter?.groups?.[Object.keys(currentChapter.groups)[0]] || [];
  const totalImages = imageUrls.length;

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

  const handlePageChange = useCallback((newPage) => {
    const newPageIndex = Math.max(1, Math.min(newPage, totalImages));
    if (newPageIndex !== currentPage) {
      setCurrentPage(newPageIndex);
    }
  }, [totalImages, currentPage]);


  // Mouse click handler for single/double page modes
  const handleReaderClick = useCallback(() => {
    if ((readingMode === 'single' || readingMode === 'double') && !showReaderMenu) {
      if (currentPage < totalImages) {
        handlePageChange(currentPage + 1);
      } else {
        goToNextChapter();
      }
    }
  }, [readingMode, currentPage, totalImages, handlePageChange, goToNextChapter, showReaderMenu]);


  // Image Preloading Effect for next chapter
  useEffect(() => {
    if (mangaData && currentChapterIndex < chapterKeys.length - 1) {
      const nextChapterKey = chapterKeys[currentChapterIndex + 1];
      const nextChapter = chapters[nextChapterKey];

      if (nextChapter && nextChapter.groups) {
        const nextChapterImageUrls = nextChapter.groups[Object.keys(nextChapter.groups)[0]] || [];
        nextChapterImageUrls.forEach(url => {
          if (!preloadedImagesRef.current[url]) {
            const img = new Image();
            img.src = url;
            img.onload = () => {
              preloadedImagesRef.current[url] = true;
            };
            img.onerror = () => {
              preloadedImagesRef.current[url] = false;
            };
          }
        });
      }
    }
  }, [mangaData, currentChapterIndex, chapterKeys, chapters]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key) && (readingMode === 'single' || readingMode === 'double')) {
        event.preventDefault();
      }

      if (event.key === 'ArrowLeft') {
        if (readingMode === 'single' || readingMode === 'double') {
          handlePageChange(currentPage - 1);
        } else {
          goToPreviousChapter();
        }
      } else if (event.key === 'ArrowRight') {
        if (readingMode === 'single' || readingMode === 'double') {
          handlePageChange(currentPage + 1);
        } else {
          goToNextChapter();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToPreviousChapter, goToNextChapter, readingMode, currentPage, handlePageChange]);


  const handleChapterChange = (event) => {
    navigateToChapter(event.target.value);
  };

  const handleImageError = useCallback((index, e) => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/600x800/555555/FFFFFF?text=Image+Load+Error`;
    setImageLoadErrors(prevErrors => ({ ...prevErrors, [index]: true }));
  }, []);

  // Intersection Observer for Vertical Scroll Mode to update current page
  useEffect(() => {
    if (readingMode === 'vertical' && imageUrls.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              const index = parseInt(entry.target.dataset.index, 10);
              setCurrentPage(index + 1);
            }
          });
        },
        { threshold: [0.1, 0.5, 0.9] }
      );

      imageRefs.current.forEach((img) => {
        if (img) observer.observe(img);
      });

      return () => {
        imageRefs.current.forEach((img) => {
          if (img) observer.unobserve(img);
        });
      };
    }
  }, [imageUrls, readingMode, selectedChapterKey]);

  // Clear imageRefs on chapter change to prevent stale references
  useEffect(() => {
    imageRefs.current = [];
  }, [selectedChapterKey]);


  const getImageFitClass = () => {
    if (readingMode === 'vertical') {
        return 'w-auto max-w-full h-auto object-contain mx-auto';
    } else {
        return 'max-h-full max-w-full object-contain mx-auto';
    }
  };


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

  if (!mangaData || !selectedChapterKey || !currentChapter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-red-500">
        <div className="text-xl font-semibold">Chapter not found or data missing.</div>
        <a
          href={mangaData ? `/${slugify(mangaData.title)}` : '/'}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
        >
          Back to Chapters
        </a>
      </div>
    );
  }

  const mangaTitle = mangaData.title;
  const mangaGenre = mangaData.genre;


  return (
    <div className="min-h-screen bg-gray-950 font-inter text-white flex flex-col">
      {!isHeaderHidden && <Header />}

      <Suspense fallback={null}>
        <ReaderToggleButton onToggleMenu={() => setShowReaderMenu(true)} />
      </Suspense>

      <div
        ref={contentAreaRef}
        onClick={handleReaderClick}
        className={`flex-grow flex flex-col items-center justify-between px-4
                       ${!isHeaderHidden ? 'pt-[64px]' : 'pt-0'}
                       ${readingMode === 'vertical' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'}`}
      >
        {(readingMode === 'single' || readingMode === 'double') && (
          <div className="flex justify-between items-center mt-4 w-full max-w-2xl">
            <button
              onClick={(e) => { e.stopPropagation(); goToPreviousChapter(); }}
              disabled={currentChapterIndex === 0}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out ${
                currentChapterIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
              }`}
            >
              &larr; Previous Chapter
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNextChapter(); }}
              disabled={currentChapterIndex === chapterKeys.length - 1}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out ${
                currentChapterIndex === chapterKeys.length - 1 ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
              }`}
            >
              Next Chapter &rarr;
            </button>
          </div>
        )}


        <div className={`flex w-full justify-center items-center p-0 flex-grow
                         ${readingMode === 'vertical' ? 'flex-col' : 'flex-row'}`}>
          {imageUrls.length > 0 ? (
            readingMode === 'vertical' ? (
              imageUrls.map((imageUrl, index) => (
                <div key={index} className="relative w-full flex justify-center items-center">
                  {!imageLoadErrors[index] && !preloadedImagesRef.current[imageUrl] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 rounded-md">
                      <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  <img
                    ref={el => imageRefs.current[index] = el}
                    data-index={index}
                    src={imageUrl}
                    alt={`Page ${index + 1}`}
                    className={`rounded-md ${getImageFitClass()}`}
                    onLoad={(e) => {
                      setImageLoadErrors(prevErrors => ({ ...prevErrors, [index]: false }));
                      preloadedImagesRef.current[imageUrl] = true;
                    }}
                    onError={(e) => handleImageError(index, e)}
                  />
                  {imageLoadErrors[index] && (
                    <p className="text-red-400 mt-1">Error loading image {index + 1}.</p>
                  )}
                </div>
              ))
            ) : readingMode === 'single' ? (
              <div key={`single-page-wrapper`} className="flex-grow flex justify-center items-center h-full">
                <div key={`single-page-${currentPage - 1}`} className="relative h-full w-full flex justify-center items-center overflow-hidden">
                  {!imageLoadErrors[currentPage - 1] && !preloadedImagesRef.current[imageUrls[currentPage - 1]] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 rounded-md">
                      <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  <img
                    ref={el => imageRefs.current[currentPage - 1] = el}
                    src={imageUrls[currentPage - 1]}
                    alt={`Page ${currentPage}`}
                    className={`rounded-md ${getImageFitClass()}`}
                    onLoad={(e) => {
                      setImageLoadErrors(prevErrors => ({ ...prevErrors, [currentPage - 1]: false }));
                      preloadedImagesRef.current[imageUrls[currentPage - 1]] = true;
                    }}
                    onError={(e) => handleImageError(currentPage - 1, e)}
                  />
                  {imageLoadErrors[currentPage - 1] && (
                    <p className="text-red-400 mt-1">Error loading image {currentPage}.</p>
                  )}
                </div>
              </div>
            ) : ( // double page mode (always LTR now)
              <div className={`flex-grow flex justify-center items-center w-full gap-2 h-full flex-row`}>
                {/* Left Page (current page) */}
                {imageUrls[currentPage - 1] && (
                  <div key={`double-page-left-${currentPage - 1}`} className="relative flex-1 flex justify-center items-center h-full overflow-hidden">
                    {!imageLoadErrors[currentPage - 1] && !preloadedImagesRef.current[imageUrls[currentPage - 1]] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 rounded-md">
                          <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    <img
                      ref={el => imageRefs.current[currentPage - 1] = el}
                      src={imageUrls[currentPage - 1]}
                      alt={`Page ${currentPage}`}
                      className={`rounded-md ${getImageFitClass()}`}
                      onLoad={(e) => {
                        setImageLoadErrors(prevErrors => ({ ...prevErrors, [currentPage - 1]: false }));
                        preloadedImagesRef.current[imageUrls[currentPage - 1]] = true;
                      }}
                      onError={(e) => handleImageError(currentPage - 1, e)}
                    />
                    {imageLoadErrors[currentPage - 1] && (
                        <p className="text-red-400 mt-1">Error loading image {currentPage}.</p>
                    )}
                  </div>
                )}
                {/* Right Page (current page + 1) */}
                {imageUrls[currentPage] && (
                  <div key={`double-page-right-${currentPage}`} className="relative flex-1 flex justify-center items-center h-full overflow-hidden">
                    {!imageLoadErrors[currentPage] && !preloadedImagesRef.current[imageUrls[currentPage]] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 rounded-md">
                          <svg className="animate-spin h-10 w-10 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    <img
                      ref={el => imageRefs.current[currentPage] = el}
                      src={imageUrls[currentPage]}
                      alt={`Page ${currentPage + 1}`}
                      className={`rounded-md ${getImageFitClass()}`}
                      onLoad={(e) => {
                        setImageLoadErrors(prevErrors => ({ ...prevErrors, [currentPage]: false }));
                        preloadedImagesRef.current[imageUrls[currentPage]] = true;
                      }}
                      onError={(e) => handleImageError(currentPage, e)}
                    />
                    {imageLoadErrors[currentPage] && (
                        <p className="text-red-400 mt-1">Error loading image {currentPage + 1}.</p>
                    )}
                  </div>
                )}
              </div>
            )
          ) : (
            <p className="text-gray-400 text-lg">No images found for this chapter.</p>
          )}
        </div>

        {((readingMode === 'single' || readingMode === 'double') || (readingMode === 'vertical' && currentPage === totalImages)) && (
          <div className="flex justify-between items-center mb-10 mt-6 w-full max-w-2xl">
            <button
              onClick={(e) => { e.stopPropagation(); goToPreviousChapter(); }}
              disabled={currentChapterIndex === 0}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out ${
                currentChapterIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
              }`}
            >
              &larr; Previous Chapter
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNextChapter(); }}
              disabled={currentChapterIndex === chapterKeys.length - 1}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out ${
                currentChapterIndex === chapterKeys.length - 1 ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
              }`}
            >
              Next Chapter &rarr;
            </button>
          </div>
        )}
      </div>

      {showReaderMenu && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-90 flex items-center justify-center">
            <div className="text-white text-xl">Loading menu...</div>
          </div>
        }>
          <LazyReaderMenu
            mangaTitle={mangaTitle}
            mangaGenre={mangaGenre}
            chapterKeys={chapterKeys}
            selectedChapterKey={selectedChapterKey}
            currentChapterTitle={currentChapter.title}
            currentPage={currentPage}
            totalImages={totalImages}
            readingMode={readingMode}
            isHeaderHidden={isHeaderHidden}
            onChapterChange={handleChapterChange}
            onPageChange={handlePageChange}
            onSetReadingMode={setReadingMode}
            onToggleHeaderHidden={() => setIsHeaderHidden(prev => !prev)}
            onClose={() => setShowReaderMenu(false)}
            goToPreviousChapter={goToPreviousChapter}
            goToNextChapter={goToNextChapter}
            canGoPreviousChapter={currentChapterIndex > 0}
            canGoNextChapter={currentChapterIndex < chapterKeys.length - 1}
          />
        </Suspense>
      )}
    </div>
  );
}

export default ReaderPage;