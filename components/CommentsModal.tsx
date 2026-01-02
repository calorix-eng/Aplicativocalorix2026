
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, UserProfile, Comment, ReactionType } from '../types';
import { XIcon } from './icons/XIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';
import { HeartIcon } from './icons/HeartIcon';
import { formatTimeAgo } from '../utils/timeUtils';
import { useCommunityStore } from '../store/communityStore';
import { useReactions } from '../hooks/useLikes';

interface CommentItemProps {
    comment: Comment;
    postId: string;
    userProfile: UserProfile;
    // FIX: Added currentUserEmail prop since UserProfile does not contain email.
    currentUserEmail: string;
    onReply: (comment: Comment) => void;
    level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, postId, userProfile, currentUserEmail, onReply, level = 0 }) => {
    // FIX: Use currentUserEmail instead of missing userProfile.email.
    const { getReactionInfo, handleToggle } = useReactions(postId, currentUserEmail || 'user@calorix.app', comment.id);
    const likeInfo = getReactionInfo('like');
    const loveInfo = getReactionInfo('love');
    const dislikeInfo = getReactionInfo('dislike');

    return (
        <div className={`space-y-4 ${level > 0 ? 'ml-8 sm:ml-12 border-l-2 border-gray-100 dark:border-gray-800 pl-4' : ''}`}>
            <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start space-x-3"
            >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden shadow-sm">
                  {comment.author.avatar ? (
                    <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-xs">
                      {comment.author.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl rounded-tl-none">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm">{comment.author.name}</span>
                            <span className="text-[10px] text-gray-500">{formatTimeAgo(comment.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.text}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1.5 px-1">
                        <button onClick={() => handleToggle('like')} className={`flex items-center space-x-1 text-[10px] font-bold ${likeInfo.isActive ? 'text-accent-blue' : 'text-gray-500'}`}>
                            <ThumbsUpIcon className="w-3.5 h-3.5" filled={likeInfo.isActive} />
                            <span>{likeInfo.count > 0 ? likeInfo.count : 'Curtir'}</span>
                        </button>
                        <button onClick={() => handleToggle('love')} className={`flex items-center space-x-1 text-[10px] font-bold ${loveInfo.isActive ? 'text-red-500' : 'text-gray-500'}`}>
                            <HeartIcon className="w-3.5 h-3.5" filled={loveInfo.isActive} />
                            <span>{loveInfo.count > 0 ? loveInfo.count : 'Amei'}</span>
                        </button>
                        <button onClick={() => handleToggle('dislike')} className={`flex items-center space-x-1 text-[10px] font-bold ${dislikeInfo.isActive ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500'}`}>
                            <ThumbsDownIcon className="w-3.5 h-3.5" filled={dislikeInfo.isActive} />
                            <span>{dislikeInfo.count > 0 ? dislikeInfo.count : 'Não gostei'}</span>
                        </button>
                        <button 
                            onClick={() => onReply(comment)} 
                            className="text-[10px] font-bold text-gray-500 hover:text-accent-green"
                        >
                            Responder
                        </button>
                    </div>
                </div>
            </motion.div>

            {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-4">
                    {comment.replies.map(reply => (
                        <CommentItem 
                            key={reply.id} 
                            comment={reply} 
                            postId={postId} 
                            userProfile={userProfile} 
                            currentUserEmail={currentUserEmail}
                            onReply={onReply}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

interface CommentsModalProps {
  post: Post;
  userProfile: UserProfile;
  // FIX: Added currentUserEmail prop to resolve errors when creating/reacting to comments.
  currentUserEmail: string;
  onClose: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ post, userProfile, currentUserEmail, onClose }) => {
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const addComment = useCommunityStore((state) => state.addComment);
  const currentPost = useCommunityStore((state) => state.posts.find(p => p.id === post.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newComment: Comment = {
      id: crypto.randomUUID(),
      author: {
        name: userProfile.name,
        // FIX: Use currentUserEmail prop.
        email: currentUserEmail || 'user@calorix.app',
        avatar: userProfile.avatar
      },
      text: text.trim(),
      timestamp: Date.now(),
      reactions: {},
      replies: []
    };

    addComment(post.id, newComment, replyingTo?.id);
    setText('');
    setReplyingTo(null);
  };

  const countAllComments = (comments: Comment[]): number => {
    return comments.reduce((acc, c) => acc + 1 + countAllComments(c.replies), 0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center">
          <h3 className="font-bold text-lg">Comentários ({currentPost ? countAllComments(currentPost.comments) : 0})</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <XIcon />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-hide">
          {currentPost?.comments.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>Nenhum comentário ainda. Seja o primeiro!</p>
            </div>
          ) : (
            currentPost?.comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                postId={post.id} 
                userProfile={userProfile} 
                currentUserEmail={currentUserEmail}
                onReply={setReplyingTo}
              />
            ))
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-dark-card pb-8 sm:pb-4">
          <AnimatePresence>
            {replyingTo && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-t-xl text-xs mb-2 border-l-4 border-accent-green"
                >
                    <span className="text-gray-500">Respondendo a <span className="font-bold text-gray-700 dark:text-gray-300">{replyingTo.author.name}</span></span>
                    <button onClick={() => setReplyingTo(null)} className="text-red-500 font-bold">Cancelar</button>
                </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={replyingTo ? "Escreva sua resposta..." : "Escreva um comentário..."}
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-accent-green outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="absolute right-2 top-1.5 p-2 bg-accent-green text-white rounded-xl disabled:opacity-50 hover:bg-green-600 transition-colors shadow-lg active:scale-95"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CommentsModal;