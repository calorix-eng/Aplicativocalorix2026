
import { ReactionType } from '../types';
import { useCommunityStore } from '../store/communityStore';

export const useReactions = (postId: string, userEmail: string, commentId?: string) => {
  const toggleReaction = useCommunityStore((state) => state.toggleReaction);
  const toggleCommentReaction = useCommunityStore((state) => state.toggleCommentReaction);
  const post = useCommunityStore((state) => state.posts.find(p => p.id === postId));
  
  let targetReactions: { [key in ReactionType]?: string[] } = {};

  if (commentId) {
    const findComment = (comments: any[]): any => {
        for (const c of comments) {
            if (c.id === commentId) return c;
            const found = findComment(c.replies);
            if (found) return found;
        }
    };
    const comment = findComment(post?.comments || []);
    targetReactions = comment?.reactions || {};
  } else {
    targetReactions = post?.reactions || {};
  }

  const getReactionInfo = (type: ReactionType) => {
    const list = targetReactions[type] || [];
    return {
        isActive: list.includes(userEmail),
        count: list.length
    };
  };

  const handleToggle = (type: ReactionType) => {
    if (commentId) {
        toggleCommentReaction(postId, commentId, type, userEmail);
    } else {
        toggleReaction(postId, type, userEmail);
    }
  };

  return { getReactionInfo, handleToggle };
};
