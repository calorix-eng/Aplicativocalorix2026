
import { create } from 'zustand';
import { Post, Comment, ReactionType } from '../types';
import { 
    fetchCommunityPosts, 
    savePostToSupabase, 
    updatePostReactions, 
    deletePostFromSupabase,
    saveCommentToSupabase,
    supabase
} from '../services/supabaseService';

interface CommunityState {
  posts: Post[];
  following: string[];
  hasNewPosts: boolean;
  isLoading: boolean;
  init: () => Promise<void>;
  setPosts: (posts: Post[]) => void;
  setFollowingStore: (list: string[]) => void;
  toggleFollowStore: (email: string) => void;
  addPost: (post: Post) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, comment: Comment) => Promise<void>;
  toggleReaction: (postId: string, reaction: ReactionType, userEmail: string) => Promise<void>;
  acknowledgeNewPosts: () => void;
}

const REACTION_TYPES: ReactionType[] = ['like', 'love', 'dislike'];

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  following: [],
  hasNewPosts: false,
  isLoading: false,
  
  init: async () => {
    set({ isLoading: true });
    const posts = await fetchCommunityPosts();
    set({ posts, isLoading: false });

    // Ouvinte em Tempo Real do Supabase
    supabase
      .channel('public:community_posts')
      .on('postgres_changes', { event: '*', table: 'community_posts' }, async () => {
        const updatedPosts = await fetchCommunityPosts();
        set({ posts: updatedPosts, hasNewPosts: true });
      })
      .subscribe();
  },

  setPosts: (posts) => set({ posts }),

  setFollowingStore: (list) => set({ following: list }),

  toggleFollowStore: (email) => set((state) => {
    const isFollowing = state.following.includes(email);
    const newList = isFollowing 
        ? state.following.filter(e => e !== email)
        : [...state.following, email];
    return { following: newList };
  }),

  addPost: async (post) => {
    await savePostToSupabase(post);
    // O ouvinte Realtime atualizará a lista automaticamente
  },

  deletePost: async (postId) => {
    await deletePostFromSupabase(postId);
    set((state) => ({ posts: state.posts.filter(p => p.id !== postId) }));
  },

  addComment: async (postId, comment) => {
    await saveCommentToSupabase(postId, comment);
    const updatedPosts = await fetchCommunityPosts();
    set({ posts: updatedPosts });
  },

  toggleReaction: async (postId, reaction, userEmail) => {
    const state = get();
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;

    const reactions = { ...post.reactions };
    const alreadyInTarget = (reactions[reaction] || []).includes(userEmail);

    REACTION_TYPES.forEach(type => {
      if (reactions[type]) {
        reactions[type] = reactions[type]!.filter(email => email !== userEmail);
      }
    });

    if (!alreadyInTarget) {
      reactions[reaction] = [...(reactions[reaction] || []), userEmail];
    }
    
    // Atualiza localmente para feedback instantâneo
    set({
        posts: state.posts.map(p => p.id === postId ? { ...p, reactions } : p)
    });

    // Salva no banco
    await updatePostReactions(postId, reactions);
  },

  acknowledgeNewPosts: () => set({ hasNewPosts: false }),
}));
