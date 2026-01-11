
/**
 * Converte um File para Base64 de forma robusta.
 */
export const fileToBase64 = (file: File): Promise<{mimeType: string, data: string, full: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const full = reader.result as string;
        const parts = full.split(',');
        if (parts.length < 2) {
            reject(new Error("Erro ao ler formato do arquivo."));
            return;
        }
        const mimeTypeInfo = parts[0];
        const data = parts[1];
        const mimeType = mimeTypeInfo.split(':')[1].split(';')[0];
        resolve({mimeType, data, full});
      };
      reader.onerror = error => reject(error);
    });
};

/**
 * Converte uma data URL (base64) para um objeto File.
 * Útil para CameraCapture que retorna data URL.
 */
export const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type:mime});
}


/**
 * Redimensiona um objeto File de forma resiliente usando Canvas e URL de objeto.
 * Este método é mais compatível com navegadores mobile do que createImageBitmap.
 * NOTA: Esta função foi substituída ou adaptada em outros contextos para o envio direto de File ao backend.
 * Ela é mais útil para pré-processamento no frontend antes de conversão para Base64 se o envio for puro Base64.
 * Para FormData com File, a compressão pode ser feita diretamente no File antes de anexar.
 */
export const resizeImageFile = async (file: File, maxWidth: number = 768, maxHeight: number = 768, quality: number = 0.6): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                reject(new Error("Não foi possível inicializar o contexto do Canvas."));
                return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob(blob => {
                if (blob) {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                } else {
                    reject(new Error("Falha ao comprimir imagem para Blob."));
                }
            }, 'image/jpeg', quality);
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Falha ao carregar a imagem da galeria. Tente uma foto diferente ou tire uma foto nova."));
        };

        img.src = objectUrl;
    });
};

/**
 * Redimensiona e comprime uma string imagem em base64, retornando Base64.
 * NOTA: Para a nova arquitetura, o envio é via File, então esta função é menos usada diretamente para o envio.
 * Pode ser útil para pré-visualizações ou se o backend pedir Base64 puro.
 */
export const resizeImage = (base64Str: string, maxWidth: number = 768, maxHeight: number = 768, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Str.startsWith('data:') ? base64Str : `data:image/jpeg;base64,${base64Str}`;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl.split(',')[1]);
            } else {
                // Fallback: se o contexto não for obtido, retorna o base64 original (sem data: prefix)
                resolve(base64Str.includes(',') ? base64Str.split(',')[1] : base64Str);
            }
        };
        img.onerror = () => {
            reject(new Error("Erro ao processar base64 da imagem."));
        };
    });
};
