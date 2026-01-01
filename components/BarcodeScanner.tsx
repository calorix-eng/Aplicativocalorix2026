import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    BarcodeDetector: any;
  }
}

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const startScanner = async () => {
      if (!('BarcodeDetector' in window)) {
        setError('O leitor de código de barras não é suportado neste navegador.');
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const barcodeDetector = new window.BarcodeDetector({
          formats: ['ean_13', 'upc_a', 'qr_code'], // Common formats
        });

        const detect = async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              onScan(barcodes[0].rawValue);
              stopScanner();
              return; // Stop after first detection
            }
          }
          animationFrameId = requestAnimationFrame(detect);
        };
        detect();

      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Não foi possível acessar a câmera. Verifique as permissões.');
      }
    };

    const stopScanner = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [onScan]);
  
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
    <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        <p className="text-white bg-black bg-opacity-50 px-2 py-1 rounded-md text-sm text-center">
            Aponte a câmera para o código de barras
        </p>
        <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-md self-center">
            Cancelar
        </button>
      </div>
    </div>
  );
};

export default BarcodeScanner;
