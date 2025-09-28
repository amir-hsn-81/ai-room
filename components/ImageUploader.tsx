import React, { useRef } from 'react';

interface ImageUploaderProps {
  id: string;
  onImageSelect: (file: File) => void;
  onOpenCameraClick: () => void;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 mr-2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, onImageSelect, onOpenCameraClick }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className="relative w-full aspect-square bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex flex-col justify-center items-center p-4 transition-all duration-300 overflow-hidden group"
    >
      <input
        type="file"
        id={id}
        ref={inputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="text-center flex flex-col items-center w-full">
          <p className="text-gray-400 font-semibold mb-6">Add a photo to continue</p>
          <button onClick={handleUploadClick} className="w-full max-w-xs mb-3 flex items-center justify-center py-3 px-4 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transform hover:scale-105 active:scale-95 transition-all duration-300">
            <UploadIcon />
            Upload File
          </button>
          <button onClick={onOpenCameraClick} className="w-full max-w-xs flex items-center justify-center py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transform hover:scale-105 active:scale-95 transition-all duration-300">
            <CameraIcon />
            Use Camera
          </button>
      </div>
    </div>
  );
};