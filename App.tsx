
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { generateTryOnImage } from './services/geminiService';
import { CameraCapture } from './components/CameraCapture';

// --- Type Definitions ---
interface ImageData {
  dataUrl: string;
  base64: string;
  mimeType: string;
}
type Step = 'start' | 'upload_person' | 'select_category' | 'upload_item' | 'result';
type Category = 'shirt' | 'pants' | 'shoes' | 'hair';
type AnimationState = 'idle' | 'entering' | 'exiting';
type AnimationDirection = 'forward' | 'backward';

// --- Category Data ---
const categories: { id: Category; label: string; icon: React.ReactElement }[] = [
  { id: 'shirt', label: 'Shirt', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path></svg> },
  { id: 'pants', label: 'Pants', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2"><path d="M12 2v7.5"/><path d="m10 14 2-2.5 2 2.5"/><path d="M12 14v8"/><path d="M6 22h12"/></svg> },
  { id: 'shoes', label: 'Shoes', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2"><path d="M20 17h-3.3a1 1 0 0 0-.94.66l-1.5 4A1 1 0 0 1 13.3 22H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.5a1 1 0 0 1-1 1H15"/><path d="m4.4 11.5-.4-2c-.3-1.2.5-2.5 1.8-2.5H13V9"/></svg> },
  { id: 'hair', label: 'Hair', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2"><path d="M2 13.1a1 1 0 0 0 1 1.4 1 1 0 0 1 1 1.4 1 1 0 0 0 1.6 1.3 1 1 0 0 1 1.6 1.2 1 1 0 0 0 1.8.8 1 1 0 0 1 1.8.8 1 1 0 0 0 2 .4 1 1 0 0 1 2 .4 1 1 0 0 0 2-.4 1 1 0 0 1 1.8-.8 1 1 0 0 0 1.8-.8 1 1 0 0 1 1.6-1.2 1 1 0 0 0 1.6-1.3 1 1 0 0 1 1-1.4 1 1 0 0 0 1-1.4V12a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1.1Z"/><path d="M4 17.2V22"/><path d="M7 17.2V22"/><path d="M17 17.2V22"/><path d="M20 17.2V22"/></svg> },
];

const App: React.FC = () => {
  // --- State Management ---
  const [step, setStep] = useState<Step>('start');
  const [category, setCategory] = useState<Category | null>(null);
  const [personImage, setPersonImage] = useState<ImageData | null>(null);
  const [itemImage, setItemImage] = useState<ImageData | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'person' | 'item' | null>(null);

  // --- Animation State ---
  const [animation, setAnimation] = useState<{ state: AnimationState, direction: AnimationDirection }>({ state: 'entering', direction: 'forward' });
  const [stepToTransition, setStepToTransition] = useState<Step | null>(null);

  // --- Step Transition Logic ---
  const changeStep = (newStep: Step, direction: AnimationDirection) => {
    setStepToTransition(newStep);
    setAnimation({ state: 'exiting', direction });
  };

  const onAnimationEnd = () => {
    if (animation.state === 'exiting' && stepToTransition) {
      setStep(stepToTransition);
      setStepToTransition(null);
      setAnimation(prev => ({ ...prev, state: 'entering' }));
    }
  };

  let animationClass = '';
  if (animation.state === 'entering') {
    animationClass = animation.direction === 'forward' ? 'animate-step-enter-forward' : 'animate-step-enter-backward';
  } else if (animation.state === 'exiting') {
    animationClass = animation.direction === 'forward' ? 'animate-step-exit-forward' : 'animate-step-exit-backward';
  }

  // --- Handlers ---
  const handleGenerateClick = useCallback(async (currentItemImage: ImageData) => {
    if (!personImage || !currentItemImage || !category) {
      setError('Please ensure both images and a category are selected.');
      return;
    }

    setLoading(true);
    setError(null);
    setResultImage(null);
    changeStep('result', 'forward');

    try {
      const generatedImageBase64 = await generateTryOnImage(personImage.base64, personImage.mimeType, currentItemImage.base64, currentItemImage.mimeType, category);
      if (generatedImageBase64) {
        setResultImage(`data:image/png;base64,${generatedImageBase64}`);
      } else {
        setError('No image was generated. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setError('An unexpected error occurred during image generation.');
    } finally {
      setLoading(false);
    }
  }, [personImage, category]);

  const handleImageUpload = useCallback((file: File, type: 'person' | 'item') => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [header, base64] = dataUrl.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
      const imageData = { dataUrl, base64, mimeType };

      if (type === 'person') {
        setPersonImage(imageData);
        changeStep('select_category', 'forward');
      } else {
        setItemImage(imageData);
        handleGenerateClick(imageData);
      }
    };
    reader.onerror = () => setError('Error reading the file.');
    reader.readAsDataURL(file);
  }, [handleGenerateClick]);

  const handleCategorySelect = (selectedCategory: Category) => {
    setCategory(selectedCategory);
    changeStep('upload_item', 'forward');
  };

  const handleBack = () => {
    switch (step) {
      case 'result':        changeStep('upload_item', 'backward'); break;
      case 'upload_item':   changeStep('select_category', 'backward'); break;
      case 'select_category': changeStep('upload_person', 'backward'); break;
      case 'upload_person': changeStep('start', 'backward'); break;
    }
  };

  const handleReset = () => {
    changeStep('start', 'backward');
    setTimeout(() => {
        setCategory(null);
        setPersonImage(null);
        setItemImage(null);
        setResultImage(null);
        setError(null);
        setLoading(false);
    }, 500); // Wait for animation
  };

  const openCamera = (target: 'person' | 'item') => {
    setCameraTarget(target);
    setShowCamera(true);
  };
  
  const handleCapture = (file: File) => {
    if (cameraTarget) {
      handleImageUpload(file, cameraTarget);
    }
    setShowCamera(false);
    setCameraTarget(null);
  };
  
  // --- Render Logic ---
  const BackButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="absolute top-0 left-0 mt-2 ml-2 z-10 flex items-center text-gray-400 hover:text-white transition-colors duration-300">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-1"><path d="m15 18-6-6 6-6"/></svg>
      Back
    </button>
  );

  const renderStep = () => {
    switch (step) {
      case 'start':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Welcome to the Virtual Studio</h2>
            <p className="text-lg text-gray-400 mb-8">Ready to find your perfect look? Let's get started.</p>
            <button onClick={() => changeStep('upload_person', 'forward')} className="py-3 px-8 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transform hover:scale-105 active:scale-95 transition-all duration-300">
              Get Started
            </button>
          </div>
        );
      case 'upload_person':
        return (
          <div className="w-full max-w-sm relative">
            <BackButton onClick={handleBack} />
            <h2 className="text-2xl font-bold mb-4 text-center pt-8">Step 1: Your Photo</h2>
            <ImageUploader id="person-image" onImageSelect={(file) => handleImageUpload(file, 'person')} onOpenCameraClick={() => openCamera('person')} />
          </div>
        );
      case 'select_category':
        return (
          <div className="w-full max-w-4xl relative">
            <BackButton onClick={handleBack} />
            <h2 className="text-2xl font-bold mb-6 text-center pt-8">Step 2: Choose a Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {categories.map(({ id, label, icon }) => (
                <button key={id} onClick={() => handleCategorySelect(id)} className="group bg-gray-800 border-2 border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center text-gray-300 hover:text-white hover:border-blue-500 hover:scale-105 transform transition-all duration-300">
                  <span className="text-gray-400 group-hover:text-blue-400 transition-colors duration-300">{icon}</span>
                  <span className="font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'upload_item':
        return (
          <div className="w-full max-w-sm relative">
             <BackButton onClick={handleBack} />
            <h2 className="text-2xl font-bold mb-4 text-center pt-8">Step 3: {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Item'} Photo</h2>
            <ImageUploader id="item-image" onImageSelect={(file) => handleImageUpload(file, 'item')} onOpenCameraClick={() => openCamera('item')} />
          </div>
        );
      case 'result':
        return (
          <div className="w-full max-w-2xl flex flex-col items-center">
            <ResultDisplay loading={loading} resultImage={resultImage} error={error} />
            <div className="w-full max-w-xs sm:max-w-none flex flex-col sm:flex-row items-center gap-4 mt-6">
               <button onClick={handleBack} className="w-full sm:w-auto py-2 px-6 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transform hover:scale-105 active:scale-95 transition-all duration-300">
                  Try Another Item
                </button>
                <button onClick={handleReset} className="w-full sm:w-auto py-2 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transform hover:scale-105 active:scale-95 transition-all duration-300">
                  Start Over
                </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {showCamera && <CameraCapture onCapture={handleCapture} onCancel={() => setShowCamera(false)} />}
      <div className={`w-full h-full flex flex-col items-center transition-opacity duration-500 ${showCamera ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
        <Header />
        <main onAnimationEnd={onAnimationEnd} className={`w-full max-w-5xl flex-grow flex flex-col justify-center items-center mt-8 ${animationClass}`}>
          {renderStep()}
        </main>
      </div>
    </div>
  );
};

export default App;
