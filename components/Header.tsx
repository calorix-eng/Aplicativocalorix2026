import React from 'react';
import { UserProfile } from '../types';
import { AppleIcon } from './icons/AppleIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { StarIcon } from './icons/StarIcon';
import { MenuIcon } from './icons/MenuIcon';
import { LayoutGridIcon } from './icons/LayoutGridIcon';
import { BellIcon } from './icons/BellIcon';

type View = 'dashboard' | 'community' | 'recipes' | 'reports';

interface HeaderProps {
    userProfile: UserProfile;
    darkMode: boolean;
    toggleDarkMode: () => void;
    onProfileClick: () => void;
    currentView: View;
    onNavigate: (view: View) => void;
    toggleSidebar: () => void;
    toggleDataSidebar: () => void;
    unreadNotificationsCount: number;
    onNotificationsClick: () => void;
    onPremiumClick: () => void;
}

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ userProfile, darkMode, toggleDarkMode, onProfileClick, currentView, onNavigate, toggleSidebar, toggleDataSidebar, unreadNotificationsCount, onNotificationsClick, onPremiumClick }) => {
    return (
        <header className="bg-light-card dark:bg-dark-card shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
                <button
                    id="tutorial-sidebar-button"
                    onClick={toggleSidebar}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Abrir menu"
                >
                    <MenuIcon />
                </button>
                <button onClick={() => onNavigate('dashboard')} className="flex items-center space-x-2 focus:outline-none" aria-label="Voltar ao dashboard">
                    <AppleIcon className="w-12 h-12 text-accent-green" />
                    <h1 className="text-2xl font-bold text-accent-green font-display hidden sm:block">calorix</h1>
                </button>
            </div>

            <div className="flex-1 flex justify-center">
                {!userProfile.isPremium && (
                    <button
                        onClick={onPremiumClick}
                        className="flex items-center space-x-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-semibold hover:bg-yellow-500 transition-colors shadow-md animate-fade-in-up"
                    >
                        <StarIcon className="w-5 h-5" />
                        <span className="hidden sm:block">Seja Premium</span>
                    </button>
                )}
            </div>

            {/* Right-side Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                    onClick={toggleDataSidebar}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-green"
                    aria-label="Ver resumo rápido"
                >
                    <LayoutGridIcon />
                </button>
                <button
                    onClick={onNotificationsClick}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-green"
                    aria-label="Ver notificações"
                >
                    <BellIcon className="h-6 w-6" unreadCount={unreadNotificationsCount} />
                </button>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-green"
                    aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
                >
                    {darkMode ? <SunIcon /> : <MoonIcon />}
                </button>
                 <button
                    id="tutorial-profile-button"
                    onClick={onProfileClick}
                    className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center font-semibold text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-green overflow-hidden"
                 >
                    {userProfile.avatar ? (
                        <img src={userProfile.avatar} alt="Avatar do usuário" className="w-full h-full object-cover" />
                    ) : (
                        userProfile.name.charAt(0).toUpperCase()
                    )}
                </button>
            </div>
        </header>
    );
};

export default Header;