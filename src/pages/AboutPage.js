import React from 'react';
import Header from '../components/Header';

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 font-inter text-white">
      <Header />
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-indigo-400 mb-8 text-center">About Aphrodite Scans</h1>
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 md:p-8 max-w-3xl mx-auto border border-gray-700">
          <p className="text-gray-300 mb-4">
            Welcome to Aphrodite Scans, your destination for high-quality manga translations.
            We are a dedicated group of enthusiasts passionate about bringing captivating stories
            from Japanese to English, ensuring a smooth and enjoyable reading experience for our community.
          </p>
          <p className="text-gray-300 mb-4">
            Our mission is to provide accurate and timely releases,
            with a focus on lesser-known gems and fan-favorite series alike.
            We appreciate your support and hope you enjoy our work!
          </p>
          <p className="text-gray-300">
            For more updates and to connect with our community, join us on Discord.
          </p>
          <div className="flex justify-center mt-6">
            <a href="https://discord.gg/x22HkcVKHT" target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center">
              <i className="fab fa-discord mr-2 text-2xl"></i> Join Our Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;