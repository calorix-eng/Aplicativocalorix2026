
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon } from './icons/HomeIcon';
import { BellIcon } from './icons/BellIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { XIcon } from './icons/XIcon';
import { LogoIcon } from './icons/LogoIcon';

type CommunityTab = 'home' | 'notifications' | 'saved' | 'guidelines' | 'my-posts';

interface CommunitySidebarProps {
    activeTab: CommunityTab;
    onTabChange: (tab: CommunityTab) => void;
    unreadCount: number;
    isOpen?: boolean;
    onClose?: () => void;
}

const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ 
    activeTab, 
    onTabChange, 
    unreadCount, 
    isOpen = false, 
    onClose 
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
                className={`flex items-center w-full p-4 rounded-xl text-left font-bold transition-all duration-200 ${
                    isActive
                        ? 'bg-accent-green/10 text-accent-green scale-[1.02]'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            >
                <div className="flex-shrink-0">{icon}</div>
                <span className="ml-4 text-base">{label}</span>
            </button>
        );
    };

    const SidebarContent = () => (
        <div className="flex flex-col space-y-2">
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
    );

    return (
        <>
            {/* Desktop Sidebar (Persistent) */}
            <div className="hidden lg:block bg-white dark:bg-dark-card p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-8">
                <div className="mb-6 px-2 flex items-center space-x-2">
                    <LogoIcon />
                    <span className="text-xl font-bold text-accent-green font-display">Comunidade</span>
                </div>
                <SidebarContent />
            </div>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
                        />

                        {/* Drawer Panel */}
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-dark-card z-[60] shadow-2xl flex flex-col"
                        >
                            <div className="p-6 flex justify-between items-center border-b dark:border-gray-800">
                                <div className="flex items-center space-x-2">
                                    <LogoIcon />
                                    <span className="text-lg font-bold text-accent-green font-display">calorix</span>
                                </div>
                                <button 
                                    onClick={onClose}
                                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500"
                                >
                                    <XIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-grow p-4 overflow-y-auto">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Navegação</h3>
                                <SidebarContent />
                            </div>

                            <div className="p-6 border-t dark:border-gray-800">
                                <p className="text-xs text-center text-gray-400 font-medium">© 2025 calorix Community</p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default CommunitySidebar;
