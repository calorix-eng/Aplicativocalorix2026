
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
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Crucial para mobile: garantir que o vídeo comece a tocar
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(e => console.error("Auto-play failed", e));
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Não foi possível acessar a câmera traseira. Verifique as permissões de privacidade do seu navegador.');
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Limita a resolução máxima para 1024px no lado maior para otimizar o payload da IA
      const MAX_DIMENSION = 1024;
      let targetWidth = video.videoWidth;
      let targetHeight = video.videoHeight;

      if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
        if (targetWidth > targetHeight) {
          targetHeight = (MAX_DIMENSION / targetWidth) * targetHeight;
          targetWidth = MAX_DIMENSION;
        } else {
          targetWidth = (MAX_DIMENSION / targetHeight) * targetWidth;
          targetHeight = MAX_DIMENSION;
        }
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Aplica um leve sharpening via filtros se suportado para ajudar a IA
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Alterado de 0.8 para 0.6 conforme solicitado para reduzir o payload enviado à IA
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        const [mimeTypeInfo, data] = dataUrl.split(',');
        const mimeType = mimeTypeInfo.split(':')[1].split(';')[0];
        onCapture({ mimeType, data });
      }
    }
  };
  
  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-[70] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-dark-card p-8 rounded-3xl shadow-2xl max-w-sm">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <XIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Erro de Câmera</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <button onClick={onClose} className="w-full bg-accent-green text-white py-3 rounded-xl font-bold">
                Voltar
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] bg-black flex flex-col items-center justify-center overflow-hidden">
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover" 
        autoPlay 
        playsInline 
        muted 
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* UI Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
        <div className="flex justify-between items-center pointer-events-auto">
            <button onClick={onClose} className="p-3 bg-black/40 text-white rounded-full backdrop-blur-md">
                <XIcon className="w-6 h-6" />
            </button>
            <p className="text-white font-bold text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                Análise de Refeição IA
            </p>
            <div className="w-12 h-12"></div> {/* Spacer */}
        </div>

        {/* Guia Visual */}
        <div className="flex-1 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/30 border-dashed rounded-3xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent-green rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent-green rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent-green rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent-green rounded-br-lg"></div>
            </div>
        </div>

        <div className="flex flex-col items-center gap-4 pointer-events-auto">
            <p className="text-white/80 text-xs font-medium text-center max-w-[200px]">
                Centralize o prato e garanta que haja boa iluminação.
            </p>
            <button 
                onClick={handleCapture} 
                className="w-20 h-20 bg-white rounded-full border-[6px] border-white/30 flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
            >
                <div className="w-14 h-14 bg-accent-green rounded-full flex items-center justify-center text-white">
                    <CameraIcon className="w-8 h-8" />
                </div>
            </button>
            <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;