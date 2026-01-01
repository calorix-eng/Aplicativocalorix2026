
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Post, UserProfile, AuthUser, PostCategory, ReactionType } from '../types';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import CommunitySidebar from './CommunitySidebar';
import CommunityGuidelines from './CommunityGuidelines';

type CommunityTab = 'home' | 'notifications' | 'saved' | 'guidelines' | 'my-posts';
type PostFilter = PostCategory | 'all' | 'following';

interface CommunityFeedProps {
    posts: Post[];
    currentUserProfile: UserProfile;
    currentUserAuth: AuthUser;
    onCreatePost: (text: string, category: PostCategory, imageUrl?: string, videoUrl?: string) => void;
    onReactToPost: (postId: string, reaction: ReactionType) => void;
    onAddComment: (postId: string, commentText: string) => void;
    onFollowUser: (authorEmail: string, authorId: string) => void;
    onSavePost: (postId: string) => void;
    onSharePost: (text: string, imageUrl?: string, videoUrl?: string) => void;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ 
    posts, 
    currentUserProfile,
    currentUserAuth,
    onCreatePost,
    onReactToPost,
    onAddComment,
    onFollowUser,
    onSavePost,
    onSharePost,
}) => {
    const [activeTab, setActiveTab] = useState<CommunityTab>('home');
    const [activeFilter, setActiveFilter] = useState<PostFilter>('all');

    // --- Infinite Scroll State ---
    const POSTS_PER_PAGE = 5;
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const observer = useRef<IntersectionObserver>(null);

    // When filter or main posts array changes, reset the page number
    useEffect(() => {
        setPage(1);
    }, [activeFilter, posts, activeTab]);

    const savedPosts = useMemo(() => posts.filter(post => currentUserProfile.savedPosts?.includes(post.id)), [posts, currentUserProfile.savedPosts]);
    const myPosts = useMemo(() => posts.filter(post => post.author.email === currentUserAuth.email), [posts, currentUserAuth.email]);
    
    const filteredPosts = useMemo(() => {
        let base = posts;
        if (activeFilter === 'following') {
            base = posts.filter(post => currentUserProfile.following?.includes(post.author.email));
        } else if (activeFilter !== 'all') {
            base = posts.filter(post => post.category === activeFilter as PostCategory);
        }
        return base;
    }, [posts, activeFilter, currentUserProfile.following]);
    
    // The source of truth for the currently active list
    const activePostList = useMemo(() => {
        if (activeTab === 'saved') return savedPosts;
        if (activeTab === 'my-posts') return myPosts;
        return filteredPosts;
    }, [activeTab, savedPosts, myPosts, filteredPosts]);

    // Paginated list for display
    const displayedPosts = useMemo(() => {
        return activePostList.slice(0, page * POSTS_PER_PAGE);
    }, [activePostList, page]);

    const hasMore = useMemo(() => displayedPosts.length < activePostList.length, [displayedPosts, activePostList]);

    // The callback for the intersection observer
    const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setIsLoading(true);
                // Simulate loading more content
                setTimeout(() => {
                    setPage(prevPage => prevPage + 1);
                    setIsLoading(false);
                }, 500);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);
    
    const FilterButton: React.FC<{ filter: PostFilter, label: string }> = ({ filter, label }) => {
      const isActive = activeFilter === filter;
      return (
        <button
          onClick={() => setActiveFilter(filter)}
          className={`px-4 py-2 text-sm font-bold rounded-full transition flex-shrink-0 whitespace-nowrap ${isActive ? 'bg-accent-green text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
          {label}
        </button>
      )
    }

    const renderMainContent = () => {
        switch (activeTab) {
            case 'guidelines':
                return <CommunityGuidelines />;
            
            case 'notifications':
                return (
                    <div className="text-center py-16 bg-light-card dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-semibold">Nenhuma notificação por aqui</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Suas notificações sobre reações, comentários e novos seguidores aparecerão aqui.</p>
                    </div>
                );

            case 'my-posts':
            case 'saved':
            case 'home':
            default:
                 const postsToRender = displayedPosts;
                 let noPostsMessage = { title: 'Nenhuma publicação encontrada', body: 'Tente um filtro diferente ou seja o primeiro a postar!' };
                 
                 if (activeTab === 'saved') {
                    noPostsMessage = { title: 'Nenhuma publicação salva', body: 'Você ainda não salvou nenhuma publicação.' };
                 } else if (activeTab === 'my-posts') {
                    noPostsMessage = { title: 'Você ainda não postou nada', body: 'Compartilhe sua jornada com a comunidade na aba Página Inicial!' };
                 } else if (activeFilter === 'following') {
                    noPostsMessage = { title: 'Feed vazio', body: 'Você ainda não segue ninguém ou as pessoas que você segue ainda não postaram nada.' };
                 }

                return (
                    <div className="space-y-6">
                        {activeTab === 'home' && (
                            <>
                                <CreatePost userProfile={currentUserProfile} onCreatePost={onCreatePost} />
                                <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-hide">
                                   <FilterButton filter="all" label="🚀 Todos" />
                                   <FilterButton filter="following" label="👥 Seguindo" />
                                   <FilterButton filter="motivation" label="💪 Motivação" />
                                   <FilterButton filter="recipe" label="🍳 Receitas" />
                                   <FilterButton filter="tip" label="💡 Dicas" />
                                </div>
                            </>
                        )}

                        {activeTab === 'my-posts' && postsToRender.length > 0 && (
                            <div className="bg-accent-green/5 p-6 rounded-2xl border border-accent-green/10 mb-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-accent-green text-lg">Seu Perfil na Comunidade</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Você já compartilhou {myPosts.length} postagens inspiradoras.</p>
                                </div>
                                <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-sm">
                                    <span className="text-2xl font-bold text-accent-green">🔥</span>
                                </div>
                            </div>
                        )}

                        {postsToRender.length > 0 ? (
                            <div className="space-y-6">
                                {postsToRender.map((post) => (
                                    <PostCard 
                                        key={post.id}
                                        post={post}
                                        currentUserProfile={currentUserProfile}
                                        currentUserAuth={currentUserAuth}
                                        onReactToPost={onReactToPost}
                                        onAddComment={onAddComment}
                                        onFollowUser={onFollowUser}
                                        onSavePost={onSavePost}
                                        onSharePost={onSharePost}
                                    />
                                ))}
                            </div>
                        ) : !isLoading ? (
                            <div className="text-center py-20 bg-light-card dark:bg-dark-card rounded-2xl shadow-sm border-2 border-dashed border-gray-100 dark:border-gray-800 px-6">
                                <div className="bg-gray-50 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🏜️</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{noPostsMessage.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto text-sm">{noPostsMessage.body}</p>
                                {activeFilter === 'following' && (
                                    <button 
                                        onClick={() => setActiveFilter('all')}
                                        className="mt-6 text-accent-green font-bold hover:underline"
                                    >
                                        Explorar novos usuários
                                    </button>
                                )}
                            </div>
                        ) : null}

                        {/* Infinite scroll markers */}
                        <div ref={lastPostElementRef} className="h-4" />
                        {isLoading && (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent-green border-t-transparent"></div>
                            </div>
                        )}
                        {!hasMore && activePostList.length > POSTS_PER_PAGE && (
                            <div className="text-center p-8 text-gray-400 dark:text-gray-600 text-sm font-medium">
                                <p>✨ Você explorou tudo por aqui.</p>
                            </div>
                        )}
                    </div>
                );
        }
    };

    const getTitleForTab = (tab: CommunityTab): string => {
        switch (tab) {
            case 'home': return 'Comunidade';
            case 'notifications': return 'Notificações';
            case 'saved': return 'Publicações Salvas';
            case 'my-posts': return 'Meu Perfil';
            case 'guidelines': return ''; 
            default: return 'Comunidade';
        }
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1 hidden lg:block">
                <CommunitySidebar 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab}
                    unreadCount={0} 
                />
            </aside>
            <main className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between">
                    {getTitleForTab(activeTab) && (
                        <h1 className="text-3xl font-bold font-display text-gray-800 dark:text-white">
                            {getTitleForTab(activeTab)}
                        </h1>
                    )}
                    {/* Mobile Sidebar Trigger could go here if needed */}
                </div>
                {renderMainContent()}
            </main>
        </div>
    );
};

export default CommunityFeed;
