
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

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUserAuth, 
  currentUserProfile, 
  onFollowUser, 
  onSavePost, 
  onSharePost 
}) => {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const { getReactionInfo, handleToggle } = useReactions(post.id, currentUserAuth.email);
    const deletePost = useCommunityStore((state) => state.deletePost);
    
    const likeInfo = getReactionInfo('like');
    const loveInfo = getReactionInfo('love');
    const dislikeInfo = getReactionInfo('dislike');

    const isSaved = currentUserProfile.savedPosts?.includes(post.id);
    
    // Mais seguro comparar por UID para evitar problemas com caixa alta em emails
    const isOwnPost = currentUserAuth.uid === post.author.uid;
    const isFollowing = currentUserProfile.following?.includes(post.author.email);

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Deseja realmente excluir esta publicação? Esta ação é permanente.")) {
            await deletePost(post.id);
        }
    };

    return (
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
                        <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{post.author.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{formatTimeAgo(post.timestamp)}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {isOwnPost ? (
                        <button 
                          onClick={handleDelete}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all group"
                          title="Excluir publicação"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    ) : (
                        <button 
                          onClick={() => onFollowUser(post.author.email, post.author.uid)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isFollowing ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-accent-green/10 text-accent-green hover:bg-accent-green hover:text-white'}`}
                        >
                            {isFollowing ? 'Deixar de Seguir' : '+ Seguir'}
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
                  currentUserEmail={currentUserAuth.email}
                  onClose={() => setIsCommentsOpen(false)} 
                />
              )}
            </AnimatePresence>
        </motion.div>
    );
};
export default PostCard;
