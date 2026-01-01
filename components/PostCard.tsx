import React, { useState, useRef } from 'react';
import { Post, AuthUser, UserProfile, ReactionType } from '../types';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { formatTimeAgo } from '../utils/timeUtils';

interface PostCardProps {
    post: Post;
    currentUserAuth: AuthUser;
    currentUserProfile: UserProfile;
    onReactToPost: (postId: string, reaction: ReactionType) => void;
    onAddComment: (postId: string, commentText: string) => void;
    onFollowUser: (authorEmail: string, authorId: string) => void;
    onSavePost: (postId: string) => void;
    onSharePost: (text: string, imageUrl?: string, videoUrl?: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserAuth, currentUserProfile, onReactToPost, onAddComment, onFollowUser, onSavePost, onSharePost }) => {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const commentInputRef = useRef<HTMLInputElement>(null);

    const userReaction = (Object.keys(post.reactions) as ReactionType[]).find(k => post.reactions[k]?.includes(currentUserAuth.email));
    const isSaved = currentUserProfile.savedPosts?.includes(post.id);
    const isFollowing = currentUserProfile.following?.includes(post.author.email);
    const isOwnPost = currentUserAuth.email === post.author.email;

    return (
        <div className="bg-light-card dark:bg-dark-card p-5 rounded-xl shadow-md animate-fade-in-up">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center font-semibold overflow-hidden">
                        {post.author.avatar ? <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" /> : post.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                        <p className="font-bold text-gray-800 dark:text-white">{post.author.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(post.timestamp)}</p>
                    </div>
                </div>
                {!isOwnPost && (
                    <button onClick={() => onFollowUser(post.author.email, post.author.uid)} className={`px-4 py-1 text-xs font-bold rounded-full transition-all ${isFollowing ? 'bg-blue-50 text-blue-500' : 'bg-accent-green text-white'}`}>
                        {isFollowing ? 'Seguindo' : '+ Seguir'}
                    </button>
                )}
            </div>

            {post.text && <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">{post.text}</p>}
            {post.imageUrl && <div className="mb-4 rounded-lg overflow-hidden border dark:border-gray-800"><img src={post.imageUrl} alt="Post content" className="w-full h-auto max-h-[500px] object-cover" /></div>}

            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-800 pt-3">
                <div className="flex space-x-4">
                    <button onClick={() => onReactToPost(post.id, 'like')} className={`flex items-center space-x-1 ${userReaction === 'like' ? 'text-blue-500' : ''}`}><span>👍</span> <span>{post.reactions.like?.length || 0}</span></button>
                    <button onClick={() => onReactToPost(post.id, 'love')} className={`flex items-center space-x-1 ${userReaction === 'love' ? 'text-red-500' : ''}`}><span>❤️</span> <span>{post.reactions.love?.length || 0}</span></button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1"><span>💬</span> <span>{post.comments.length}</span></button>
                </div>
                <div className="flex space-x-4">
                    <button onClick={() => onSharePost(post.text, post.imageUrl)} className="hover:text-accent-blue transition-colors">Compartilhar</button>
                    <button onClick={() => onSavePost(post.id)} className={isSaved ? 'text-accent-blue font-bold' : ''}>{isSaved ? 'Salvo' : 'Salvar'}</button>
                </div>
            </div>

            {showComments && (
                <div className="mt-4 pt-4 border-t dark:border-gray-800 space-y-4">
                    <form onSubmit={(e) => { e.preventDefault(); if (commentText.trim()) { onAddComment(post.id, commentText); setCommentText(''); } }} className="flex space-x-2">
                        <input ref={commentInputRef} type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Comentar..." className="flex-1 p-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-full border dark:border-gray-600 outline-none" />
                        <button type="submit" className="p-2 bg-accent-green text-white rounded-full"><PaperAirplaneIcon className="w-4 h-4" /></button>
                    </form>
                    {post.comments.map(c => (
                        <div key={c.id} className="flex space-x-2 text-xs">
                            <div className="font-bold">{c.author.name}:</div>
                            <div className="text-gray-600 dark:text-gray-400">{c.text}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default PostCard;