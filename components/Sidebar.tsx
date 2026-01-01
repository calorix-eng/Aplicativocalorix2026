
import React from 'react';
import { UserProfile } from '../types';
import { XIcon } from './icons/XIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { UsersIcon } from './icons/UsersIcon';
import { HomeIcon } from './icons/HomeIcon';
import { BellIcon } from './icons/BellIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { BadgeCheckIcon } from './icons/BadgeCheckIcon';
import { DumbbellIcon } from './icons/DumbbellIcon';
import { LinkIcon } from './icons/LinkIcon';

type View = 'dashboard' | 'community' | 'recipes' | 'reports' | 'workouts' | 'integrations';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    currentView: View;
    onNavigate: (view: View) => void;
    onLogout: () => void;
    onRemindersClick: () => void;
    onChallengesClick: () => void;
    onAchievementsClick: () => void;
}

const NavItem: React.FC<{
    view: View,
    label: string,
    icon: React.ReactNode,
    isActive: boolean,
    onClick: () => void
}> = ({ view, label, icon, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center p-4 rounded-lg text-left font-semibold transition-colors duration-200 ${
                isActive
                    ? 'bg-accent-green/10 text-accent-green'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
        >
            {icon}
            <span className="ml-4">{label}</span>
        </button>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userProfile, currentView, onNavigate, onLogout, onRemindersClick, onChallengesClick, onAchievementsClick }) => {
    return (
        <div 
            className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            ></div>

            {/* Sidebar Panel */}
            <nav 
                className={`absolute top-0 left-0 bottom-0 w-72 bg-light-card dark:bg-dark-card shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center font-semibold overflow-hidden">
                            {userProfile.avatar ? (
                                <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                userProfile.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <span className="font-bold">{userProfile.name}</span>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XIcon />
                    </button>
                </div>
                
                {/* Navigation */}
                <div className="flex-grow p-4 space-y-1 overflow-y-auto">
                    <NavItem 
                        view="dashboard"
                        label="Dashboard"
                        icon={<HomeIcon className="w-6 h-6" />}
                        isActive={currentView === 'dashboard'}
                        onClick={() => onNavigate('dashboard')}
                    />
                    <NavItem 
                        view="workouts"
                        label="Treinos"
                        icon={<DumbbellIcon className="w-6 h-6" />}
                        isActive={currentView === 'workouts'}
                        onClick={() => onNavigate('workouts')}
                    />
                    <NavItem 
                        view="reports"
                        label="Relatórios"
                        icon={<ChartBarIcon className="w-6 h-6" />}
                        isActive={currentView === 'reports'}
                        onClick={() => onNavigate('reports')}
                    />
                    <NavItem 
                        view="recipes"
                        label="Receitas"
                        icon={<BookOpenIcon className="w-6 h-6" />}
                        isActive={currentView === 'recipes'}
                        onClick={() => onNavigate('recipes')}
                    />
                    <NavItem 
                        view="community"
                        label="Comunidade"
                        icon={<UsersIcon />}
                        isActive={currentView === 'community'}
                        onClick={() => onNavigate('community')}
                    />
                    <NavItem 
                        view="integrations"
                        label="Integrações"
                        icon={<LinkIcon className="w-6 h-6" />}
                        isActive={currentView === 'integrations'}
                        onClick={() => onNavigate('integrations')}
                    />
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <button
                        onClick={onRemindersClick}
                        className="w-full flex items-center p-4 rounded-lg text-left font-semibold transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <BellIcon className="w-6 h-6" />
                        <span className="ml-4">Lembretes</span>
                    </button>
                    <button
                        onClick={onChallengesClick}
                        className="w-full flex items-center p-4 rounded-lg text-left font-semibold transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <TrophyIcon className="w-6 h-6" />
                        <span className="ml-4">Desafios</span>
                    </button>
                    <button
                        onClick={onAchievementsClick}
                        className="w-full flex items-center p-4 rounded-lg text-left font-semibold transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <BadgeCheckIcon className="w-6 h-6" />
                        <span className="ml-4">Conquistas</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
