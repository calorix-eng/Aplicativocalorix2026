
/**
 * Converte um File para Base64.
 */
export const fileToBase64 = (file: File): Promise<{mimeType: string, data: string, full: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const full = reader.result as string;
        const [mimeTypeInfo, data] = full.split(',');
        const mimeType = mimeTypeInfo.split(':')[1].split(';')[0];
        resolve({mimeType, data, full});
      };
      reader.onerror = error => reject(error);
    });
};

/**
 * Redimensiona um objeto File diretamente com suporte a fallback.
 */
export const resizeImageFile = async (file: File, maxWidth: number = 768, maxHeight: number = 768, quality: number = 0.6): Promise<string> => {
    try {
        let imgSource: CanvasImageSource;
        
        // Tenta usar createImageBitmap (mais rápido)
        if (typeof window.createImageBitmap === 'function') {
            try {
                imgSource = await createImageBitmap(file);
            } catch (e) {
                // Fallback se o blob for incompatível com o bitmap do hardware
                imgSource = await legacyImageLoader(file);
            }
        } else {
            imgSource = await legacyImageLoader(file);
        }

        const canvas = document.createElement('canvas');
        let width = (imgSource as any).width;
        let height = (imgSource as any).height;

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
            ctx.drawImage(imgSource, 0, 0, width, height);
        }
        
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Limpeza
        if (imgSource instanceof ImageBitmap) {
            imgSource.close();
        }

        return dataUrl.split(',')[1];
    } catch (err) {
        console.error("Erro fatal no redimensionamento:", err);
        throw new Error("Não conseguimos processar esta foto. Tente tirar uma foto nova em vez de usar a galeria.");
    }
};

const legacyImageLoader = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Falha ao carregar imagem legacy."));
        };
        img.src = url;
    });
};

/**
 * Redimensiona e comprime uma imagem em base64.
 */
export const resizeImage = (base64Str: string, maxWidth: number = 768, maxHeight: number = 768, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve) => {
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
            }
            
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl.split(',')[1]);
        };
        img.onerror = () => {
            resolve(base64Str.includes(',') ? base64Str.split(',')[1] : base64Str);
        };
    });
};