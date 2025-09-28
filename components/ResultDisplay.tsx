import React from 'react';

interface ResultDisplayProps {
  loading: boolean;
  resultImage: string | null;
  error: string | null;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
    <p className="text-lg font-semibold text-gray-300">The magic is happening...</p>
    <p className="text-sm text-gray-500">This might take a moment</p>
  </div>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ loading, resultImage, error }) => {
  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'virtual-try-on-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
    
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return (
        <div className="text-center text-red-400">
          <p className="font-semibold">Error!</p>
          <p>{error}</p>
        </div>
      );
    }
    if (resultImage) {
      return (
        <div className="w-full h-full relative group">
          <img src={resultImage} alt="Generated result" className="w-full h-full max-h-[70vh] object-contain rounded-lg" />
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <button
                onClick={handleDownload}
                className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transform hover:scale-105 active:scale-95 transition-all duration-300"
             >
                <DownloadIcon />
                Download
            </button>
          </div>
        </div>
      );
    }
     // This state should ideally not be reached if generation is triggered, but serves as a fallback.
    return (
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold text-gray-300">Generating Image</h3>
          <p>Your result will be displayed here soon.</p>
        </div>
      );
  };

  return (
    <div className="w-full h-full min-h-[50vh] lg:min-h-full bg-gray-800 border-2 border-gray-700 rounded-lg flex items-center justify-center p-4">
      {renderContent()}
    </div>
  );
};
