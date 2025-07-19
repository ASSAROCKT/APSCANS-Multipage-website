// src/components/HeroBanner.js

import React, { useState, useEffect } from 'react';
import { slugify } from '../utils/slugify'; // Assuming slugify is available

function HeroBanner() {
  const [bannerData, setBannerData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch banner data
  const fetchBannerData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://raw.githubusercontent.com/ASSAROCKT/aphroditescans/refs/heads/main/Banner.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBannerData(data);
    } catch (e) {
      console.error("Failed to fetch banner data:", e);
      setError("Failed to load banner content. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerData();
  }, []);

  // Automatic slide change
  useEffect(() => {
    if (bannerData.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerData.length);
      }, 7000); // Change slide every 7 seconds
      return () => clearInterval(interval);
    }
  }, [bannerData.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerData.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + bannerData.length) % bannerData.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg mb-12">
        <div className="text-xl font-semibold text-gray-400">Loading banner...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg mb-12">
        <div className="text-xl font-semibold text-red-500">{error}</div>
      </div>
    );
  }

  if (bannerData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg mb-12">
        <div className="text-xl font-semibold text-gray-400">No banner content available.</div>
      </div>
    );
  }

  const currentManga = bannerData[currentIndex];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-2xl mb-12 group">
      {/* Background Image */}
      <img
        src={currentManga.cover}
        alt={`${currentManga.title} Banner`}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 ease-in-out transform scale-100 group-hover:scale-105"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://placehold.co/1200x600/333333/FFFFFF?text=No+Banner";
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center p-4 md:p-8 lg:p-12">
        <div className="max-w-xl text-white">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 text-indigo-300 drop-shadow-lg">
            {currentManga.title}
          </h2>
          <p className="text-sm md:text-base lg:text-lg mb-6 line-clamp-4 md:line-clamp-5 text-gray-200 drop-shadow">
            {currentManga.description}
          </p>
          <a
            href={`/${slugify(currentManga.title)}`} // Use slugify for the series page link
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
            </svg>
            Start Reading
          </a>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full focus:outline-none transition duration-300 ease-in-out opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full focus:outline-none transition duration-300 ease-in-out opacity-0 group-hover:opacity-100"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {bannerData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ease-in-out ${
              currentIndex === index ? 'bg-indigo-500 w-6' : 'bg-gray-400 hover:bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
}

export default HeroBanner;
