import React, { useState, useRef } from 'react';
import { UserProfile, PostCategory } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { ImageIcon } from './icons/ImageIcon';
import { VideoIcon } from './icons/VideoIcon';
import { XIcon } from './icons/XIcon';
import { fileToBase64 } from '../utils/fileUtils';

interface CreatePostProps {
    userProfile: UserProfile;
    onCreatePost: (text: string, category: PostCategory, imageUrl?: string, videoUrl?: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ userProfile, onCreatePost }) => {
    const [text, setText] = useState('');
    const [media, setMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [category, setCategory] = useState<PostCategory>('motivation');
    
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        const { data, mimeType } = await fileToBase64(file);
        const url = `data:${mimeType};base64,${data}`;

        if (file.type.startsWith('image/')) {
            setMedia({ url, type: 'image' });
        } else if (file.type.startsWith('video/')) {
            setMedia({ url, type: 'video' });
        }
        setIsProcessing(false);
        e.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const removeMedia = () => {
        setMedia(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() || media) {
            onCreatePost(
                text,
                category,
                media?.type === 'image' ? media.url : undefined,
                media?.type === 'video' ? media.url : undefined
            );
            setText('');
            setMedia(null);
            setCategory('motivation');
        }
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center font-semibold overflow-hidden">
                    {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt="Seu avatar" className="w-full h-full object-cover" />
                    ) : (
                        userProfile.name.charAt(0).toUpperCase()
                    )}
                </div>
                <div className="flex-1">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Compartilhe algo com a comunidade..."
                        className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition resize-none"
                        rows={3}
                    />

                    {isProcessing && <p className="text-sm text-gray-500 mt-2">Processando mídia...</p>}
                    
                    {media && (
                        <div className="mt-4 relative">
                            {media.type === 'image' ? (
                                <img src={media.url} alt="Pré-visualização" className="rounded-lg max-h-60 w-auto" />
                            ) : (
                                <video src={media.url} controls className="rounded-lg max-h-60 w-auto" />
                            )}
                            <button 
                                type="button" 
                                onClick={removeMedia}
                                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-75"
                            >
                                <XIcon />
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                         <div className="flex items-center space-x-2">
                             <input type="file" ref={imageInputRef} onChange={handleMediaChange} accept="image/*" className="hidden" />
                             <input type="file" ref={videoInputRef} onChange={handleMediaChange} accept="video/*" className="hidden" />
                             <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-500 hover:text-accent-green rounded-full transition-colors" aria-label="Adicionar foto">
                                 <ImageIcon />
                             </button>
                             <button type="button" onClick={() => videoInputRef.current?.click()} className="p-2 text-gray-500 hover:text-accent-blue rounded-full transition-colors" aria-label="Adicionar vídeo">
                                 <VideoIcon />
                             </button>
                             <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as PostCategory)}
                                className="text-sm p-1 border-gray-300 rounded-md bg-gray-100 dark:bg-gray-800 dark:border-gray-600"
                             >
                                <option value="motivation">Motivação</option>
                                <option value="recipe">Receita</option>
                                <option value="tip">Dica</option>
                             </select>
                         </div>
                        <button
                            type="submit"
                            disabled={(!text.trim() && !media) || isProcessing}
                            className="bg-accent-green text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                        >
                            <PaperAirplaneIcon />
                            <span className="ml-2">Postar</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;