
export const fileToBase64 = (file: File): Promise<{mimeType: string, data: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const [mimeTypeInfo, data] = result.split(',');
        const mimeType = mimeTypeInfo.split(':')[1].split(';')[0];
        resolve({mimeType, data});
      };
      reader.onerror = error => reject(error);
    });
};

/**
 * Redimensiona e comprime uma imagem em base64.
 * Essencial para análise em tempo real e economia de banda/armazenamento.
 */
export const resizeImage = (base64Str: string, maxWidth: number = 768, maxHeight: number = 768, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
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
            }
            // Retorna apenas a string base64 sem o prefixo data:image/jpeg;base64,
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl.split(',')[1]);
        };
        img.onerror = () => resolve(base64Str.includes(',') ? base64Str.split(',')[1] : base64Str);
    });
};