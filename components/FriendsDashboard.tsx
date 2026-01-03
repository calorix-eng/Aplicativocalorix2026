
import React, { useState } from 'react';
import { UserProfile, AuthUser } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SearchIcon } from './icons/SearchIcon';
import { UserIcon } from './icons/UserIcon';
import { XIcon } from './icons/XIcon';
import { motion, AnimatePresence } from 'framer-motion';

interface FriendsDashboardProps {
    userProfile: UserProfile;
    authUser: AuthUser;
    showToast: (message: string) => void;
}

interface FriendInfo {
    name: string;
    email?: string;
    goal?: string;
    avatar?: string;
}

const FriendDetailModal: React.FC<{ friend: FriendInfo; onClose: () => void }> = ({ friend, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-dark-card w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative" 
            onClick={e => e.stopPropagation()}
        >
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 z-10 p-2 bg-black/10 dark:bg-white/10 rounded-full text-gray-600 dark:text-gray-300 hover:bg-black/20 transition-colors"
            >
                <XIcon className="w-5 h-5" />
            </button>

            <div className="h-28 bg-gradient-to-br from-accent-green to-accent-blue opacity-20"></div>
            
            <div className="px-8 pb-10 -mt-14 text-center">
                <div className="w-28 h-28 rounded-[2rem] border-4 border-white dark:border-dark-card bg-gray-200 dark:bg-gray-700 shadow-2xl mx-auto overflow-hidden flex items-center justify-center mb-4 relative">
                    {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-5xl font-bold text-gray-400">
                            {(friend.name || friend.email || "?").charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 dark:text-white truncate px-2">
                    {friend.name || friend.email}
                </h3>
                <p className="text-sm text-accent-green font-bold mt-1 uppercase tracking-widest">
                    {friend.goal || 'Membro da Comunidade'}
                </p>

                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">--</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Sequência</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">--</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Conquistas</p>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={onClose} 
                        className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Fechar
                    </button>
                    <button 
                        className="px-6 bg-accent-green/10 text-accent-green rounded-2xl font-bold hover:bg-accent-green hover:text-white transition-all active:scale-95"
                        onClick={() => alert('Em breve: Ver feed completo do amigo')}
                    >
                        Ver Perfil
                    </button>
                </div>
            </div>
        </motion.div>
    </div>
);

const FriendsDashboard: React.FC<FriendsDashboardProps> = ({ userProfile, authUser, showToast }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFriend, setSelectedFriend] = useState<FriendInfo | null>(null);

    const handleShareProfile = async () => {
        const shareData = {
            title: `Perfil de ${userProfile.name} no Calorix`,
            text: `Ei! Me acompanhe no Calorix para vermos nosso progresso juntos. Meu ID: ${authUser.uid.slice(0, 8)}`,
            url: window.location.origin
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
                showToast("Link copiado para a área de transferência!");
            }
        } catch (err) {
            console.error("Erro ao compartilhar:", err);
        }
    };

    const suggestions: FriendInfo[] = [
        { name: 'Ana Silva', goal: 'Perda de peso', avatar: 'https://i.pravatar.cc/150?u=ana' },
        { name: 'Carlos Santos', goal: 'Ganho de massa', avatar: 'https://i.pravatar.cc/150?u=carlos' },
        { name: 'Juliana Lima', goal: 'Manutenção', avatar: 'https://i.pravatar.cc/150?u=ju' }
    ];

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-display flex items-center">
                        <UsersGroupIcon className="mr-3 text-accent-green h-8 w-8" />
                        Amigos
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Conecte-se com outros usuários e compartilhem metas.</p>
                </div>
            </div>

            {/* Perfil Sharing Card */}
            <div className="bg-gradient-to-br from-accent-green to-green-600 rounded-3xl p-8 text-white shadow-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setSelectedFriend({ name: userProfile.name, avatar: userProfile.avatar, goal: userProfile.goal === 'lose' ? 'Perda de peso' : userProfile.goal === 'gain' ? 'Ganho de massa' : 'Manutenção' })}
                            className="w-24 h-24 rounded-3xl border-4 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center hover:scale-105 transition-transform shadow-2xl"
                        >
                            {userProfile.avatar ? (
                                <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold">{userProfile.name.charAt(0)}</span>
                            )}
                        </button>
                        <div>
                            <h3 className="text-2xl font-black">{userProfile.name}</h3>
                            <p className="text-green-100 opacity-90 text-sm font-mono tracking-tighter">ID: {authUser.uid.slice(0, 8)}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleShareProfile}
                        className="bg-white text-accent-green px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-green-50 transition-all shadow-lg w-full md:w-auto justify-center active:scale-95"
                    >
                        <ShareIcon className="w-6 h-6" />
                        Compartilhar Link
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="Buscar amigos pelo nome ou ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-4 focus:ring-accent-green/20 focus:border-accent-green transition-all"
                                />
                                <SearchIcon className="absolute left-4 top-4.5 h-5 w-5 text-gray-400" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Seguindo ({userProfile.following?.length || 0})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {userProfile.following && userProfile.following.length > 0 ? (
                                <div className="space-y-4">
                                    {userProfile.following.map((email, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <button 
                                                onClick={() => setSelectedFriend({ name: email.split('@')[0], email: email })}
                                                className="flex items-center gap-4 text-left group"
                                            >
                                                <div className="w-12 h-12 rounded-2xl bg-accent-green/10 flex items-center justify-center text-accent-green group-hover:bg-accent-green group-hover:text-white transition-all">
                                                    <UserIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-sm block group-hover:text-accent-green transition-colors">{email}</span>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ver Perfil</span>
                                                </div>
                                            </button>
                                            <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full font-black uppercase tracking-tighter">Seguindo</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                        <UserIcon className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-400 text-sm font-bold">Você ainda não segue ninguém.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sugestões</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {suggestions.map((person, idx) => (
                                <div key={idx} className="flex items-center justify-between group p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <button 
                                        onClick={() => setSelectedFriend(person)}
                                        className="flex items-center gap-3 text-left"
                                    >
                                        <img src={person.avatar} alt={person.name} className="w-11 h-11 rounded-2xl bg-gray-200 object-cover shadow-sm" />
                                        <div>
                                            <p className="text-sm font-black group-hover:text-accent-green transition-colors">{person.name}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase">{person.goal}</p>
                                        </div>
                                    </button>
                                    <button 
                                        className="text-accent-green p-2 rounded-xl hover:bg-accent-green/10 transition-all active:scale-90"
                                        title="Seguir"
                                    >
                                        <CheckCircleIcon className="w-6 h-6 opacity-40 group-hover:opacity-100" />
                                    </button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AnimatePresence>
                {selectedFriend && (
                    <FriendDetailModal 
                        friend={selectedFriend} 
                        onClose={() => setSelectedFriend(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default FriendsDashboard;
