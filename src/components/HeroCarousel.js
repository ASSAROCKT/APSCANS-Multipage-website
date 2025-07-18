// src/components/HeroCarousel.js
import React, { useRef, useEffect } from 'react';
import { slugify } from '../utils/slugify';

function HeroCarousel({ mangaData }) {
  const scrollContainerRef = useRef(null);
  const isDragging = useRef(false);
  const startPos = useRef(0);
  const scrollLeftValue = useRef(0);

  // Mouse down event for dragging
  const handleMouseDown = (e) => {
    if (scrollContainerRef.current) {
      isDragging.current = true;
      startPos.current = e.pageX - scrollContainerRef.current.offsetLeft;
      scrollLeftValue.current = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.style.cursor = 'grabbing'; // Change cursor while dragging
      scrollContainerRef.current.style.userSelect = 'none'; // Prevent text selection
    }
  };

  // Mouse leave event
  const handleMouseLeave = () => {
    isDragging.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'; // Reset cursor
      scrollContainerRef.current.style.userSelect = 'auto'; // Re-enable text selection
    }
  };

  // Mouse up event
  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'; // Reset cursor
      scrollContainerRef.current.style.userSelect = 'auto'; // Re-enable text selection
    }
  };

  // Mouse move event for dragging
  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault(); // Prevent default browser drag behavior
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startPos.current) * 1.5; // Adjust scroll speed
    scrollContainerRef.current.scrollLeft = scrollLeftValue.current - walk;
  };

  // Set up event listeners on mount
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('mousedown', handleMouseDown);
      scrollContainer.addEventListener('mouseleave', handleMouseLeave);
      scrollContainer.addEventListener('mouseup', handleMouseUp);
      scrollContainer.addEventListener('mousemove', handleMouseMove);

      // Set initial cursor style
      scrollContainer.style.cursor = 'grab';

      return () => {
        // Clean up event listeners on unmount
        scrollContainer.removeEventListener('mousedown', handleMouseDown);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
        scrollContainer.removeEventListener('mouseup', handleMouseUp);
        scrollContainer.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  if (!mangaData || mangaData.length === 0) {
    return null;
  }

  return (
    <div className="relative mb-12">
      <h2 className="text-4xl font-bold text-indigo-400 mb-8 text-center">Featured Series</h2>
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-hidden space-x-4 p-4 md:pb-6" // Changed to overflow-x-hidden, as drag handles scroll
        // Optional: Keep scroll-snap if you want items to align neatly after dragging stops
        // style={{ scrollSnapType: 'x mandatory' }}
      >
        {mangaData.map((manga) => (
          <a
            key={manga.title}
            href={`/${slugify(manga.title)}`}
            className="flex-shrink-0 w-[80vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw]
                       rounded-lg shadow-xl overflow-hidden cursor-pointer
                       transform transition duration-300 hover:scale-[1.02] border border-gray-800
                       relative group" // Removed bg-gray-900 for cleaner image display
          >
            <img
              src={manga.cover}
              alt={`${manga.title} Cover`}
              className="w-full h-96 object-cover object-center rounded-lg // Rounded corners for image
                         transform transition duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x600/333333/FFFFFF?text=No+Cover";
              }}
            />
            {/* Removed the text overlay div */}
          </a>
        ))}
      </div>

      {/* Custom CSS for hiding scrollbar and cursor styling */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none;    /* Firefox */
        }
      `}</style>
    </div>
  );
}

export default HeroCarousel;