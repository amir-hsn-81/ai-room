import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full max-w-7xl text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
        Virtual Try-On Studio
      </h1>
      <p className="mt-2 text-lg text-gray-300">
        Virtually try on clothes, hairstyles, and more before you buy.
      </p>
    </header>
  );
};