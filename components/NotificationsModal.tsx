
import React from 'react';
import { AppNotification } from '../types';
import { XIcon } from './icons/XIcon';
import { BellIcon } from './icons/BellIcon';
import { formatTimeAgo } from '../utils/timeUtils';

interface NotificationsModalProps {
    notifications: AppNotification[];
    onClose: () => void;
    onMarkAllAsRead: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ notifications, onClose, onMarkAllAsRead }) => {
    
    const getNotificationMessage = (notification: AppNotification): string => {
        switch (notification.type) {
            case 'reaction':
                return `reagiu à sua publicação: "${notification.postTextSnippet}"`;
            case 'comment':
                return `comentou na sua publicação: "${notification.postTextSnippet}"`;
            case 'follow':
                return 'começou a seguir você.';
            default:
                return 'enviou uma notificação.';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center">
                        <BellIcon className="w-6 h-6 mr-3 text-accent-green" />
                        <h2 className="text-xl font-bold font-display">Notificações</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon />
                    </button>
                </div>
                
                <div className="flex-grow p-4 overflow-y-auto">
                    {notifications.length > 0 ? (
                        <div className="space-y-3">
                            {notifications.map(notification => (
                                <div key={notification.id} className={`p-3 rounded-lg flex items-start space-x-3 transition-colors ${!notification.read ? 'bg-accent-blue/10' : ''}`}>
                                    {!notification.read && <div className="w-2 h-2 bg-accent-blue rounded-full mt-2 flex-shrink-0"></div>}
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 overflow-hidden">
                                        {notification.fromUser.avatar ? (
                                            <img src={notification.fromUser.avatar} alt={notification.fromUser.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="flex items-center justify-center w-full h-full font-bold">{notification.fromUser.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm">
                                            <span className="font-bold">{notification.fromUser.name}</span> {getNotificationMessage(notification)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(notification.timestamp)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                            <p>Você não tem nenhuma notificação.</p>
                        </div>
                    )}
                </div>
                
                {notifications.some(n => !n.read) && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            onClick={onMarkAllAsRead} 
                            className="w-full text-center text-sm font-semibold text-accent-blue hover:underline"
                        >
                            Marcar todas como lidas
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsModal;
