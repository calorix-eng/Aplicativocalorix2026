import React, { useEffect, useRef, useState } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { XIcon } from './icons/XIcon';

interface CameraCaptureProps {
  onCapture: (imageData: { mimeType: string; data: string }) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Não foi possível acessar a câmera. Verifique as permissões.');
      }
    };

    startCamera();

    return () => {
      // Cleanup: stop the stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // Use jpeg with quality
        const [mimeTypeInfo, data] = dataUrl.split(',');
        const mimeType = mimeTypeInfo.split(':')[1].split(';')[0];
        onCapture({ mimeType, data });
      }
    }
  };
  
  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={onClose} className="bg-gray-300 dark:bg-gray-600 text-light-text dark:text-dark-text px-4 py-2 rounded-md">
          Fechar
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden flex flex-col items-center justify-center">
      <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/50 to-transparent">
        <p className="text-white bg-black bg-opacity-50 px-2 py-1 rounded-md text-sm text-center self-start">
            Aponte a câmera para sua refeição
        </p>
        <div className="flex justify-center items-center">
            <button onClick={handleCapture} className="bg-white p-4 rounded-full border-4 border-white/50 hover:bg-gray-200 transition-colors" aria-label="Capturar foto">
                <CameraIcon />
            </button>
        </div>
        <button onClick={onClose} className="absolute bottom-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors" aria-label="Cancelar">
            <XIcon />
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
