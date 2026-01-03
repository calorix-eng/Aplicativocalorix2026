
import { create } from 'zustand';
import { Post, Comment, ReactionType } from '../types';
import { deleteCommunityPost } from '../services/firestoreService';

interface CommunityState {
  posts: Post[];
  following: string[]; // Lista de e-mails/IDs de quem o usuário segue
  hasNewPosts: boolean;
  setPosts: (posts: Post[]) => void;
  setFollowingStore: (list: string[]) => void;
  toggleFollowStore: (email: string) => void;
  addPost: (post: Post) => void;
  deletePost: (postId: string) => Promise<void>;
  updateUserMetadata: (uid: string, name: string, avatar?: string) => void;
  addComment: (postId: string, comment: Comment, parentCommentId?: string) => void;
  toggleReaction: (postId: string, reaction: ReactionType, userEmail: string) => void;
  toggleCommentReaction: (postId: string, commentId: string, reaction: ReactionType, userEmail: string) => void;
  acknowledgeNewPosts: () => void;
  simulateExternalPost: (post: Post) => void;
}

const REACTION_TYPES: ReactionType[] = ['like', 'love', 'dislike'];

export const useCommunityStore = create<CommunityState>((set) => ({
  posts: JSON.parse(localStorage.getItem('communityPosts') || '[]'),
  following: [],
  hasNewPosts: false,
  
  setPosts: (posts) => {
    localStorage.setItem('communityPosts', JSON.stringify(posts));
    set({ posts });
  },

  setFollowingStore: (list) => set({ following: list }),

  toggleFollowStore: (email) => set((state) => {
    const isFollowing = state.following.includes(email);
    const newList = isFollowing 
        ? state.following.filter(e => e !== email)
        : [...state.following, email];
    return { following: newList };
  }),

  addPost: (post) => set((state) => {
    const newPosts = [post, ...state.posts];
    localStorage.setItem('communityPosts', JSON.stringify(newPosts));
    return { posts: newPosts };
  }),

  deletePost: async (postId) => {
    try {
        await deleteCommunityPost(postId);
    } catch (error) {
        console.error("Erro ao deletar post do Firestore:", error);
    }

    set((state) => {
        const newPosts = state.posts.filter(p => p.id !== postId);
        localStorage.setItem('communityPosts', JSON.stringify(newPosts));
        return { posts: newPosts };
    });
  },

  updateUserMetadata: (uid, name, avatar) => set((state) => {
    const updateCommentMetadata = (comments: Comment[]): Comment[] => {
      return comments.map(c => ({
        ...c,
        author: c.author.uid === uid ? { ...c.author, name, avatar } : c.author,
        replies: updateCommentMetadata(c.replies)
      }));
    };

    const newPosts = state.posts.map(p => ({
      ...p,
      author: p.author.uid === uid ? { ...p.author, name, avatar } : p.author,
      comments: updateCommentMetadata(p.comments)
    }));

    localStorage.setItem('communityPosts', JSON.stringify(newPosts));
    return { posts: newPosts };
  }),

  addComment: (postId, comment, parentCommentId) => set((state) => {
    const newPosts = state.posts.map(p => {
        if (p.id !== postId) return p;
        if (!parentCommentId) {
            return { ...p, comments: [...p.comments, comment] };
        } else {
            const updateReplies = (comments: Comment[]): Comment[] => {
                return comments.map(c => {
                    if (c.id === parentCommentId) {
                        return { ...c, replies: [...c.replies, comment] };
                    }
                    return { ...c, replies: updateReplies(c.replies) };
                });
            };
            return { ...p, comments: updateReplies(p.comments) };
        }
    });
    localStorage.setItem('communityPosts', JSON.stringify(newPosts));
    return { posts: newPosts };
  }),

  toggleReaction: (postId, reaction, userEmail) => set((state) => {
    const newPosts = state.posts.map(p => {
      if (p.id !== postId) return p;
      const reactions = { ...p.reactions };
      
      const alreadyInTarget = (reactions[reaction] || []).includes(userEmail);

      REACTION_TYPES.forEach(type => {
        if (reactions[type]) {
          reactions[type] = reactions[type]!.filter(email => email !== userEmail);
        }
      });

      if (!alreadyInTarget) {
        reactions[reaction] = [...(reactions[reaction] || []), userEmail];
      }
        
      return { ...p, reactions };
    });
    localStorage.setItem('communityPosts', JSON.stringify(newPosts));
    return { posts: newPosts };
  }),

  toggleCommentReaction: (postId, commentId, reaction, userEmail) => set((state) => {
    const updateCommentList = (comments: Comment[]): Comment[] => {
        return comments.map(c => {
            if (c.id === commentId) {
                const reactions = { ...c.reactions };
                const alreadyInTarget = (reactions[reaction] || []).includes(userEmail);

                REACTION_TYPES.forEach(type => {
                    if (reactions[type]) {
                        reactions[type] = reactions[type]!.filter(email => email !== userEmail);
                    }
                });

                if (!alreadyInTarget) {
                    reactions[reaction] = [...(reactions[reaction] || []), userEmail];
                }

                return { ...c, reactions };
            }
            return { ...c, replies: updateCommentList(c.replies) };
        });
    };

    const newPosts = state.posts.map(p => {
        if (p.id !== postId) return p;
        return { ...p, comments: updateCommentList(p.comments) };
    });
    localStorage.setItem('communityPosts', JSON.stringify(newPosts));
    return { posts: newPosts };
  }),

  acknowledgeNewPosts: () => set({ hasNewPosts: false }),

  simulateExternalPost: (post) => set((state) => ({
    posts: [post, ...state.posts],
    hasNewPosts: true
  }))
}));
