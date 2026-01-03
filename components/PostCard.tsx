
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, AuthUser, UserProfile } from '../types';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import { HeartIcon } from './icons/HeartIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ShareIcon } from './icons/ShareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { XIcon } from './icons/XIcon';
import { formatTimeAgo } from '../utils/timeUtils';
import { useReactions } from '../hooks/useLikes';
import { useCommunityStore } from '../store/communityStore';
import CommentsModal from './CommentsModal';

interface PostCardProps {
    post: Post;
    currentUserAuth: AuthUser;
    currentUserProfile: UserProfile;
    onFollowUser: (authorEmail: string, authorId: string) => void;
    onSavePost: (postId: string) => void;
    onSharePost: (text: string, imageUrl?: string, videoUrl?: string) => void;
}

const DeleteConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; isDeleting: boolean }> = ({ onConfirm, onCancel, isDeleting }) => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancel}>
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-dark-card w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center"
            onClick={e => e.stopPropagation()}
        >
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <TrashIcon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Excluir Postagem?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                Esta ação não pode ser desfeita. Sua publicação e todos os comentários serão removidos permanentemente.
            </p>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={onCancel}
                    className="py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                    Cancelar
                </button>
                <button 
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 disabled:opacity-50"
                >
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
            </div>
        </motion.div>
    </div>
);

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUserAuth, 
  currentUserProfile, 
  onFollowUser, 
  onSavePost, 
  onSharePost 
}) => {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeletingInProgress, setIsDeletingInProgress] = useState(false);

    const { getReactionInfo, handleToggle } = useReactions(post.id, currentUserAuth.email);
    const deletePost = useCommunityStore((state) => state.deletePost);
    const followingList = useCommunityStore((state) => state.following);
    
    const likeInfo = getReactionInfo('like');
    const loveInfo = getReactionInfo('love');
    const dislikeInfo = getReactionInfo('dislike');

    const isSaved = currentUserProfile.savedPosts?.includes(post.id);
    const isOwnPost = currentUserAuth.uid === post.author.uid;
    const isFollowing = followingList.includes(post.author.email);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setIsDeletingInProgress(true);
        try {
            await deletePost(post.id);
            // O store remove o post e anima o exit se configurado, o modal fecha automaticamente ao o post sumir do DOM
        } catch (error) {
            console.error(error);
            setIsDeletingInProgress(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow"
            >
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-green to-accent-blue p-0.5 shadow-inner">
                          <div className="w-full h-full rounded-full bg-white dark:bg-dark-card overflow-hidden">
                            {post.author.avatar ? (
                              <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                                {post.author.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-none">{post.author.name}</p>
                                {!isOwnPost && (
                                    <button 
                                        onClick={() => onFollowUser(post.author.email, post.author.uid)}
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all border ${
                                            isFollowing 
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700' 
                                                : 'bg-accent-green/10 text-accent-green border-accent-green hover:bg-accent-green hover:text-white'
                                        }`}
                                    >
                                        {isFollowing ? 'Seguindo' : 'Seguir'}
                                    </button>
                                )}
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{formatTimeAgo(post.timestamp)}</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {isOwnPost && (
                            <button 
                              onClick={handleDeleteClick}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all group"
                              title="Excluir publicação"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 pb-3">
                    {post.text && <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base leading-relaxed mb-3 whitespace-pre-wrap">{post.text}</p>}
                    {post.imageUrl && (
                        <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3 border dark:border-gray-700">
                            <img src={post.imageUrl} alt="Conteúdo" className="w-full h-auto max-h-[500px] object-cover" loading="lazy" />
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t dark:border-gray-800 flex items-center justify-between overflow-x-auto scrollbar-hide">
                    <div className="flex items-center space-x-4 sm:space-x-6 min-w-max">
                        {/* Like */}
                        <motion.button 
                          whileTap={{ scale: 1.2 }}
                          onClick={() => handleToggle('like')}
                          className={`flex items-center space-x-1.5 group ${likeInfo.isActive ? 'text-accent-blue' : 'text-gray-500 hover:text-accent-blue'}`}
                        >
                            <ThumbsUpIcon className="w-5 h-5" filled={likeInfo.isActive} />
                            <span className="text-xs font-bold">{likeInfo.count}</span>
                        </motion.button>

                        {/* Love */}
                        <motion.button 
                          whileTap={{ scale: 1.2 }}
                          onClick={() => handleToggle('love')}
                          className={`flex items-center space-x-1.5 group ${loveInfo.isActive ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                        >
                            <HeartIcon className="w-5 h-5" filled={loveInfo.isActive} />
                            <span className="text-xs font-bold">{loveInfo.count}</span>
                        </motion.button>

                        {/* Dislike */}
                        <motion.button 
                          whileTap={{ scale: 1.2 }}
                          onClick={() => handleToggle('dislike')}
                          className={`flex items-center space-x-1.5 group ${dislikeInfo.isActive ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
                        >
                            <ThumbsDownIcon className="w-5 h-5" filled={dislikeInfo.isActive} />
                            <span className="text-xs font-bold">{dislikeInfo.count}</span>
                        </motion.button>

                        <button 
                          onClick={() => setIsCommentsOpen(true)}
                          className="flex items-center space-x-1.5 text-gray-500 hover:text-accent-blue group transition-colors"
                        >
                            <ChatBubbleIcon className="w-5 h-5" />
                            <span className="text-xs font-bold">{post.comments.length}</span>
                        </button>

                        <button 
                          onClick={() => onSharePost(post.text, post.imageUrl)}
                          className="text-gray-500 hover:text-accent-green transition-colors"
                        >
                            <ShareIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onSavePost(post.id)}
                      className={`${isSaved ? 'text-accent-blue' : 'text-gray-500 hover:text-accent-blue'} transition-colors ml-4`}
                    >
                        <BookmarkIcon className="w-5 h-5" filled={isSaved} />
                    </motion.button>
                </div>

                <AnimatePresence>
                  {isCommentsOpen && (
                    <CommentsModal 
                      post={post} 
                      userProfile={currentUserProfile} 
                      currentUserAuth={currentUserAuth}
                      onClose={() => setIsCommentsOpen(false)} 
                    />
                  )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {showDeleteModal && (
                    <DeleteConfirmationModal 
                        onConfirm={confirmDelete} 
                        onCancel={() => setShowDeleteModal(false)}
                        isDeleting={isDeletingInProgress}
                    />
                )}
            </AnimatePresence>
        </>
    );
};
export default PostCard;
