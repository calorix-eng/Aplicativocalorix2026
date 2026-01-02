
import React, { useState } from 'react';
import { UserProfile, AuthUser } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './CalorieRing';
import { UsersGroupIcon } from './icons/UsersGroupIcon';
import { ShareIcon } from './icons/ShareIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SearchIcon } from './icons/SearchIcon';
import { UserIcon } from './icons/UserIcon';

interface FriendsDashboardProps {
    userProfile: UserProfile;
    authUser: AuthUser;
    showToast: (message: string) => void;
}

const FriendsDashboard: React.FC<FriendsDashboardProps> = ({ userProfile, authUser, showToast }) => {
    const [searchTerm, setSearchTerm] = useState('');

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

    // Sugestões mockadas (em um app real viriam do backend)
    const suggestions = [
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
            <div className="bg-gradient-to-br from-accent-green to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-white/10 flex items-center justify-center">
                            {userProfile.avatar ? (
                                <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold">{userProfile.name.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{userProfile.name}</h3>
                            <p className="text-green-100 opacity-90 text-sm font-mono">ID: {authUser.uid.slice(0, 8)}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleShareProfile}
                        className="bg-white text-accent-green px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-50 transition-colors shadow-md w-full md:w-auto justify-center"
                    >
                        <ShareIcon className="w-5 h-5" />
                        Compartilhar Perfil
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Search and Following */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="relative">
                                <input 
                                    type="text"
                                    placeholder="Buscar amigos pelo nome ou ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-accent-green transition-all"
                                />
                                <SearchIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
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
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green">
                                                    <UserIcon />
                                                </div>
                                                <span className="font-bold text-sm">{email}</span>
                                            </div>
                                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">SEGUINDO</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 text-sm">Você ainda não segue ninguém.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Suggestions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sugestões</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {suggestions.map((person, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <img src={person.avatar} alt={person.name} className="w-10 h-10 rounded-full bg-gray-200" />
                                        <div>
                                            <p className="text-sm font-bold">{person.name}</p>
                                            <p className="text-[10px] text-gray-500">{person.goal}</p>
                                        </div>
                                    </div>
                                    <button className="text-accent-green p-2 rounded-full hover:bg-accent-green/10 transition-colors">
                                        <CheckCircleIcon className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-xs font-bold group-hover:hidden">+ Seguir</span>
                                    </button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default FriendsDashboard;
