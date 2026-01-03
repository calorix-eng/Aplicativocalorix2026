
import React from 'react';
import { HomeIcon } from './icons/HomeIcon';
import { BellIcon } from './icons/BellIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';

type CommunityTab = 'home' | 'notifications' | 'saved' | 'guidelines' | 'my-posts';

interface CommunitySidebarProps {
    activeTab: CommunityTab;
    onTabChange: (tab: CommunityTab) => void;
    unreadCount: number;
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ 
    activeTab, 
    onTabChange, 
    unreadCount 
}) => {

    const NavItem: React.FC<{
        tab: CommunityTab,
        label: string,
        icon: React.ReactNode,
    }> = ({ tab, label, icon }) => {
        const isActive = activeTab === tab;
        return (
            <button
                onClick={() => onTabChange(tab)}
                className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start w-full p-2 lg:p-4 rounded-xl transition-all duration-200 ${
                    isActive
                        ? 'text-accent-green lg:bg-accent-green/10 scale-110 lg:scale-100'
                        : 'text-gray-500 lg:text-gray-600 dark:text-gray-400 lg:dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
            >
                <div className="flex-shrink-0 relative">
                    {icon}
                </div>
                <span className={`text-[10px] lg:text-base font-bold mt-1 lg:mt-0 lg:ml-4 ${isActive ? 'opacity-100' : 'opacity-70 lg:opacity-100'}`}>
                    {label}
                </span>
                {isActive && (
                    <div className="lg:hidden absolute -bottom-1 w-1 h-1 bg-accent-green rounded-full" />
                )}
            </button>
        );
    };

    return (
        <>
            {/* Mobile: Fixed Bottom Navigation Bar */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-dark-card/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-around h-14 max-w-md mx-auto">
                    <NavItem
                        tab="home"
                        label="Início"
                        icon={<HomeIcon className="h-6 w-6" />}
                    />
                    <NavItem
                        tab="my-posts"
                        label="Perfil"
                        icon={<UserCircleIcon className="h-6 w-6" />}
                    />
                    <NavItem
                        tab="notifications"
                        label="Alertas"
                        icon={<BellIcon className="h-6 w-6" unreadCount={unreadCount} />}
                    />
                    <NavItem
                        tab="saved"
                        label="Salvos"
                        icon={<BookmarkIcon className="h-6 w-6" />}
                    />
                    <NavItem
                        tab="guidelines"
                        label="Regras"
                        icon={<ShieldCheckIcon className="h-6 w-6" />}
                    />
                </div>
            </nav>

            {/* Desktop: Static Sidebar Panel */}
            <aside className="hidden lg:block bg-white dark:bg-dark-card p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-8">
                <div className="mb-6 px-2 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-accent-green rounded-lg flex items-center justify-center text-white">
                        <HomeIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold text-accent-green font-display">Comunidade</span>
                </div>
                
                <div className="flex flex-col space-y-1">
                    <NavItem
                        tab="home"
                        label="Página Inicial"
                        icon={<HomeIcon className="h-6 w-6" />}
                    />
                    <NavItem
                        tab="my-posts"
                        label="Meu Perfil"
                        icon={<UserCircleIcon className="h-6 w-6" />}
                    />
                    <NavItem
                        tab="notifications"
                        label="Notificações"
                        icon={<BellIcon className="h-6 w-6" unreadCount={unreadCount} />}
                    />
                    <NavItem
                        tab="saved"
                        label="Salvos"
                        icon={<BookmarkIcon className="h-6 w-6" />}
                    />
                    <NavItem
                        tab="guidelines"
                        label="Diretrizes"
                        icon={<ShieldCheckIcon className="h-6 w-6" />}
                    />
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 px-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sua Jornada</p>
                    <div className="mt-4 flex items-center space-x-3 grayscale opacity-60">
                        <div className="w-8 h-8 rounded-full bg-accent-blue/20" />
                        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    </div>
                </div>
            </aside>
        </>
    );
};

export default CommunitySidebar;
