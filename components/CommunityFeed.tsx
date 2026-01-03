
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, UserProfile, AuthUser, PostCategory } from '../types';
import { useCommunityStore } from '../store/communityStore';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import CommunitySidebar from './CommunitySidebar';
import CommunityGuidelines from './CommunityGuidelines';
import { UserIcon } from './icons/UserIcon';
import { XIcon } from './icons/XIcon';
import { MenuIcon } from './icons/MenuIcon';

type CommunityTab = 'home' | 'notifications' | 'saved' | 'guidelines' | 'my-posts';
type PostFilter = PostCategory | 'all' | 'following';

interface CommunityFeedProps {
    currentUserProfile: UserProfile;
    currentUserAuth: AuthUser;
    onFollowUser: (authorEmail: string, authorId: string) => void;
    onSavePost: (postId: string) => void;
    onSharePost: (text: string, imageUrl?: string, videoUrl?: string) => void;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ 
    currentUserProfile,
    currentUserAuth,
    onFollowUser,
    onSavePost,
    onSharePost,
}) => {
    const { posts, addPost, hasNewPosts, acknowledgeNewPosts } = useCommunityStore();
    const [activeTab, setActiveTab] = useState<CommunityTab>('home');
    const [activeFilter, setActiveFilter] = useState<PostFilter>('all');
    const [showFollowingList, setShowFollowingList] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleCreatePost = (text: string, category: PostCategory, imageUrl?: string, videoUrl?: string) => {
        const newPost: Post = {
            id: crypto.randomUUID(),
            author: {
                uid: currentUserAuth.uid,
                name: currentUserProfile.name,
                email: currentUserAuth.email,
                avatar: currentUserProfile.avatar
            },
            text,
            imageUrl,
            videoUrl,
            timestamp: Date.now(),
            category,
            reactions: { like: [] },
            comments: []
        };
        addPost(newPost);
    };

    const myPostsCount = posts.filter(p => p.author.email === currentUserAuth.email).length;
    const followingCount = currentUserProfile.following?.length || 0;
    const followersCount = Math.floor((myPostsCount * 2.5) + (followingCount * 0.5));

    const filteredPosts = posts.filter(post => {
        if (activeTab === 'saved') return currentUserProfile.savedPosts?.includes(post.id);
        if (activeTab === 'my-posts') return post.author.email === currentUserAuth.email;
        if (activeFilter === 'following') return currentUserProfile.following?.includes(post.author.email);
        if (activeFilter !== 'all') return post.category === activeFilter;
        return true;
    });

    const FilterButton: React.FC<{ filter: PostFilter, label: string }> = ({ filter, label }) => {
      const isActive = activeFilter === filter;
      return (
        <button
          onClick={() => setActiveFilter(filter)}
          className={`px-4 py-2 text-sm font-bold rounded-2xl transition-all whitespace-nowrap ${isActive ? 'bg-accent-green text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          {label}
        </button>
      )
    };

    return (
        <div className="max-w-7xl mx-auto px-2 sm:px-6 relative">
            {/* Sidebar Toggle Button (Mobile Only) */}
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden fixed bottom-6 left-6 z-40 bg-accent-green text-white p-4 rounded-full shadow-2xl flex items-center space-x-2 border-2 border-white dark:border-gray-800"
            >
                <MenuIcon className="w-6 h-6" />
                <span className="font-bold pr-1">Menu</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                {/* Sidebar - Desktop e Mobile (via isSidebarOpen) */}
                <aside className="lg:col-span-1">
                    <CommunitySidebar 
                        activeTab={activeTab} 
                        onTabChange={(tab) => {
                            setActiveTab(tab);
                            setIsSidebarOpen(false);
                        }}
                        unreadCount={0}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                </aside>

                <main className="lg:col-span-3 space-y-6">
                    <AnimatePresence>
                      {hasNewPosts && (
                        <motion.button
                          initial={{ y: -50, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -50, opacity: 0 }}
                          onClick={acknowledgeNewPosts}
                          className="fixed top-24 left-1/2 -translate-x-1/2 z-40 bg-accent-blue text-white px-6 py-2 rounded-full shadow-2xl font-bold text-sm flex items-center space-x-2"
                        >
                          <span>✨ Nova postagem disponível!</span>
                        </motion.button>
                      )}
                    </AnimatePresence>

                    {activeTab === 'my-posts' && (
                        <div className="space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
                            >
                                <div className="h-32 bg-gradient-to-r from-accent-green to-accent-blue opacity-20 relative">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <div className="px-8 pb-8 -mt-12 relative">
                                    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
                                        <div className="relative">
                                            <div className="w-28 h-28 rounded-3xl border-4 border-white dark:border-dark-card bg-gray-200 dark:bg-gray-700 shadow-xl overflow-hidden flex items-center justify-center">
                                                {currentUserProfile.avatar ? (
                                                    <img src={currentUserProfile.avatar} alt={currentUserProfile.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-4xl font-bold text-gray-400">{currentUserProfile.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-green border-2 border-white dark:border-dark-card rounded-full shadow-sm"></div>
                                        </div>

                                        <div className="flex items-center space-x-4 sm:space-x-12 mb-2">
                                            <div className="text-center">
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{myPostsCount}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Publicações</p>
                                            </div>
                                            <button 
                                                onClick={() => setShowFollowingList(!showFollowingList)}
                                                className="text-center border-x border-gray-100 dark:border-gray-800 px-8 hover:bg-gray-50 dark:hover:bg-gray-800 transition rounded-xl p-2"
                                            >
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{followingCount}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seguindo</p>
                                            </button>
                                            <div className="text-center">
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{followersCount}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seguidores</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 text-center sm:text-left">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUserProfile.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sua jornada no <span className="text-accent-green font-bold">calorix</span></p>
                                    </div>
                                </div>
                            </motion.div>

                            <AnimatePresence>
                                {showFollowingList && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-white dark:bg-dark-card rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-bold text-lg">Pessoas que você segue</h4>
                                                <button onClick={() => setShowFollowingList(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><XIcon className="w-5 h-5"/></button>
                                            </div>
                                            {currentUserProfile.following && currentUserProfile.following.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {currentUserProfile.following.map((email) => (
                                                        <div key={email} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green">
                                                                    <UserIcon />
                                                                </div>
                                                                <span className="text-sm font-bold truncate max-w-[120px]">{email}</span>
                                                            </div>
                                                            <button 
                                                                onClick={() => onFollowUser(email, '')}
                                                                className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full hover:bg-red-100 transition"
                                                            >
                                                                Deixar de seguir
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 text-center py-4">Você ainda não segue ninguém.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {activeTab === 'home' && (
                    <div className="space-y-6">
                        <CreatePost userProfile={currentUserProfile} onCreatePost={handleCreatePost} />
                        
                        <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-hide">
                        <FilterButton filter="all" label="🚀 Todos" />
                        <FilterButton filter="following" label="👥 Seguindo" />
                        <FilterButton filter="motivation" label="💪 Motivação" />
                        <FilterButton filter="recipe" label="🍳 Receitas" />
                        <FilterButton filter="tip" label="💡 Dicas" />
                        </div>
                    </div>
                    )}

                    {activeTab === 'guidelines' ? (
                    <CommunityGuidelines />
                    ) : (
                    <div className="space-y-8 pb-12">
                        <AnimatePresence mode="popLayout">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                            <PostCard 
                                key={post.id}
                                post={post}
                                currentUserProfile={currentUserProfile}
                                currentUserAuth={currentUserAuth}
                                onFollowUser={onFollowUser}
                                onSavePost={onSavePost}
                                onSharePost={onSharePost}
                            />
                            ))
                        ) : (
                            <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 bg-white dark:bg-dark-card rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800"
                            >
                            <span className="text-4xl">🌵</span>
                            <h3 className="mt-4 font-bold text-gray-500">Nada por aqui ainda.</h3>
                            <p className="text-sm text-gray-400 mt-1">Sua jornada está apenas começando!</p>
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CommunityFeed;
