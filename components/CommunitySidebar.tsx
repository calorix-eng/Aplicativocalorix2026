
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

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ activeTab, onTabChange, unreadCount }) => {

    const NavItem: React.FC<{
        tab: CommunityTab,
        label: string,
        icon: React.ReactNode,
    }> = ({ tab, label, icon }) => {
        const isActive = activeTab === tab;
        return (
            <button
                onClick={() => onTabChange(tab)}
                className={`w-full flex items-center p-3 rounded-lg text-left font-semibold transition-colors duration-200 ${
                    isActive
                        ? 'bg-accent-green/10 text-accent-green'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
                {icon}
                <span className="ml-3">{label}</span>
            </button>
        );
    };

    return (
        <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-md sticky top-8">
            <nav className="space-y-2">
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
            </nav>
        </div>
    );
};

export default CommunitySidebar;
