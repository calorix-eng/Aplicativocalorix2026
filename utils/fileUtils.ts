
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
 * Redimensiona um objeto File de forma resiliente usando Canvas e URL de objeto.
 * Este método é mais compatível com navegadores mobile do que createImageBitmap.
 */
export const resizeImageFile = async (file: File, maxWidth: number = 768, maxHeight: number = 768, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(objectUrl); // Limpeza de memória imediata
            
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Cálculo de proporções
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
            
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            const base64 = dataUrl.split(',')[1];
            
            if (!base64) {
                reject(new Error("Falha ao gerar Base64 da imagem."));
                return;
            }
            
            resolve(base64);
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Falha ao carregar a imagem da galeria. Tente uma foto diferente ou tire uma foto nova."));
        };

        img.src = objectUrl;
    });
};

/**
 * Redimensiona e comprime uma string imagem em base64.
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
                resolve(base64Str.includes(',') ? base64Str.split(',')[1] : base64Str);
            }
        };
        img.onerror = () => {
            reject(new Error("Erro ao processar base64 da imagem."));
        };
    });
};
