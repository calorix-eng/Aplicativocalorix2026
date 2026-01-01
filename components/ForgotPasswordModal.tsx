

import React, { useState, FormEvent } from 'react';
import { XIcon } from './icons/XIcon';
import { MailIcon } from './icons/MailIcon';
import { auth } from '../firebase/config';
import { sendResetPasswordEmail } from '../services/authService';

interface ForgotPasswordModalProps {
    onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleMockSubmit = () => {
         // A mensagem é genérica para não revelar se um e-mail está ou não cadastrado (segurança).
        setMessage("Se uma conta com este e-mail existir, um link para redefinição de senha foi enviado.");
        setIsLoading(false);
        setTimeout(onClose, 3000);
    };

    const handleFirebaseSubmit = async () => {
        try {
            await sendResetPasswordEmail(email);
            setMessage("Se uma conta com este e-mail existir, um link para redefinição de senha foi enviado.");
        } catch (error: any) {
            console.error("Password reset error:", error);
            setError("Ocorreu um erro ao tentar enviar o e-mail. Tente novamente.");
        } finally {
            setIsLoading(false);
            setTimeout(onClose, 3000);
        }
    }


    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setMessage('');
        setError('');

        if (auth) {
            handleFirebaseSubmit();
        } else {
            // Fallback para simulação se o Firebase não estiver configurado
            setTimeout(handleMockSubmit, 1000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold font-display">Redefinir Senha</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <XIcon />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {!message && !error ? (
                        <>
                            <p className="text-gray-600 dark:text-gray-300">
                                Digite seu e-mail e enviaremos um link para você voltar a acessar sua conta.
                            </p>
                            <div>
                                <label htmlFor="reset-email" className="block text-md font-semibold text-gray-700 dark:text-gray-300">E-mail</label>
                                <input
                                    type="email"
                                    id="reset-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Enviando...' : 'Enviar Link de Redefinição'}
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <MailIcon className="w-12 h-12 text-accent-green mx-auto mb-4" />
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{message || error}</p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;