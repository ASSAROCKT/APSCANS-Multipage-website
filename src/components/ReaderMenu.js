// src/components/ReaderMenu.js
import React from 'react';

function ReaderMenu({
  mangaTitle,
  mangaGenre,
  chapterKeys,
  selectedChapterKey,
  currentChapterTitle,
  currentPage,
  totalImages,
  readingMode,
  // Removed fitMode
  // Removed readingDirection
  isHeaderHidden,
  onChapterChange,
  onPageChange,
  onSetReadingMode,
  // Removed onSetFitMode
  // Removed onToggleReadingDirection
  onToggleHeaderHidden,
  onClose,
  goToPreviousChapter,
  goToNextChapter,
  canGoPreviousChapter,
  canGoNextChapter,
}) {
  const canGoPreviousPage = currentPage > 1;
  const canGoNextPage = currentPage < totalImages;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-90 flex justify-end transition-opacity duration-300 ease-in-out">
      <div className="bg-gray-800 w-full sm:w-80 md:w-96 p-6 shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0 overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold transition-colors"
          aria-label="Close menu"
        >
          &times;
        </button>

        <h3 className="text-xl font-bold text-indigo-400 mb-6 border-b border-gray-700 pb-3">Reader Settings</h3>

        {/* Manga Info */}
        <div className="mb-6">
          <div className="flex items-center text-gray-300 mb-2">
            <span className="mr-3 text-xl"><i className="fas fa-bookmark"></i></span>
            <div>
              <p className="text-sm">Chapter Title:</p>
              <p className="font-semibold text-lg text-red-400">{currentChapterTitle || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center text-gray-300">
            <span className="mr-3 text-xl"><i className="fas fa-book"></i></span>
            <div>
              <p className="text-sm">Manga:</p>
              <p className="font-semibold text-lg text-white">{mangaTitle || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Chapter Selector */}
        <div className="mb-6 bg-gray-700 p-4 rounded-lg shadow-inner">
          <label htmlFor="chapter-select" className="block text-gray-300 text-sm font-bold mb-2">
            Chapter: <span className="text-white font-semibold">{selectedChapterKey} {currentChapterTitle ? `(${currentChapterTitle})` : ''}</span>
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousChapter}
              disabled={!canGoPreviousChapter}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-md transition duration-200 ease-in-out ${!canGoPreviousChapter ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Previous Chapter"
            >
              &lsaquo;
            </button>
            <select
              id="chapter-select"
              value={selectedChapterKey}
              onChange={onChapterChange}
              className="flex-grow bg-gray-600 border border-gray-500 text-white py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              aria-label="Select Chapter"
            >
              {chapterKeys.length > 0 ? (
                chapterKeys.map((key) => (
                  <option key={key} value={key}>
                    Chapter {key}
                  </option>
                ))
              ) : (
                <option value="">No Chapters</option>
              )}
            </select>
            <button
              onClick={goToNextChapter}
              disabled={!canGoNextChapter}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-md transition duration-200 ease-in-out ${!canGoNextChapter ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Next Chapter"
            >
              &rsaquo;
            </button>
          </div>
        </div>

        {/* Page Selector */}
        <div className="mb-6 bg-gray-700 p-4 rounded-lg shadow-inner">
          <label htmlFor="page-select" className="block text-gray-300 text-sm font-bold mb-2">Page</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!canGoPreviousPage || readingMode === 'vertical'}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-md transition duration-200 ease-in-out ${(!canGoPreviousPage || readingMode === 'vertical') ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Previous Page"
            >
              &lsaquo;
            </button>
            <select
              id="page-select"
              value={currentPage}
              onChange={(e) => onPageChange(parseInt(e.target.value, 10))}
              disabled={readingMode === 'vertical'}
              className={`flex-grow bg-gray-600 border border-gray-500 text-white py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none ${readingMode === 'vertical' ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Select Page"
            >
              {Array.from({ length: totalImages }, (_, i) => i + 1).map(page => (
                <option key={page} value={page}>
                  Page {page}
                </option>
              ))}
            </select>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!canGoNextPage || readingMode === 'vertical'}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-md transition duration-200 ease-in-out ${(!canGoNextPage || readingMode === 'vertical') ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Next Page"
            >
              &rsaquo;
            </button>
          </div>
        </div>

        {/* Reading Mode */}
        <div className="mb-6 bg-gray-700 p-4 rounded-lg shadow-inner">
          <h4 className="text-gray-300 text-sm font-bold mb-2">Reading Mode</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              onClick={() => onSetReadingMode('vertical')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${readingMode === 'vertical' ? 'bg-indigo-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
            >
              <span className="mr-2"><i className="fas fa-columns"></i></span> Long Strip
            </button>
            <button
              onClick={() => onSetReadingMode('single')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${readingMode === 'single' ? 'bg-indigo-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
            >
              <span className="mr-2"><i className="fas fa-file-image"></i></span> Single Page
            </button>
            <button
              onClick={() => onSetReadingMode('double')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${readingMode === 'double' ? 'bg-indigo-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
            >
              <span className="mr-2"><i className="fas fa-images"></i></span> Double Page
            </button>
          </div>
        </div>

        {/* Header Hidden Toggle */}
        <div className="mb-6 bg-gray-700 p-4 rounded-lg shadow-inner">
          <label className="inline-flex items-center cursor-pointer text-gray-300">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out rounded border-gray-500 bg-gray-600"
              checked={isHeaderHidden}
              onChange={onToggleHeaderHidden}
            />
            <span className="ml-2">Header Hidden</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default ReaderMenu;