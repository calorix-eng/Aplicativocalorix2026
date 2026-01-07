
import React, { useState, FormEvent } from 'react';
import { LogoIcon } from './icons/LogoIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { AuthUser } from '../types';
import ForgotPasswordModal from './ForgotPasswordModal';
import { auth } from '../firebase/config';
import { registerUser, loginUser, socialLogin } from '../services/authService';

type AuthTab = 'login' | 'register';

interface AuthProps {
    onLogin: (user: AuthUser) => void;
    onRegister: (user: AuthUser) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onRegister }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  }

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    resetForm();
  }

  // Função para extrair mensagem de erro amigável e garantir que seja STRING
  const getFriendlyErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;
    
    // Tenta extrair o código de erro do Firebase de várias formas comuns
    const code = err?.code || (err?.message?.includes('(') ? err.message.match(/\(([^)]+)\)/)?.[1] : '') || '';
    const message = err?.message || '';

    // Log seguro para evitar [object Object] em ambientes de produção
    console.error("Auth Error Code:", code);
    console.error("Auth Error Message:", message);

    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos. Verifique suas credenciais.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso por outra conta.';
      case 'auth/invalid-email':
        return 'O endereço de e-mail informado não é válido.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'auth/popup-closed-by-user':
        return 'O login foi cancelado antes de ser concluído.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas falhas. Tente novamente mais tarde.';
      default:
        // Fallback final: se não houver mensagem, retorna erro genérico em string
        if (typeof message === 'string' && message.length > 0) {
            // Remove o prefixo "Firebase:" para ficar mais limpo se não for mapeado
            return message.replace('Firebase: ', '');
        }
        return 'Ocorreu um erro inesperado na autenticação. Tente novamente.';
    }
  };
  
  const handleSocialLogin = async (providerName: 'Google' | 'Facebook') => {
      setIsLoading(true);
      setError(null);

      try {
          const { user, isNew } = await socialLogin(providerName);
          if (isNew) {
              onRegister(user);
          } else {
              onLogin(user);
          }
      } catch (err: any) {
          setError(getFriendlyErrorMessage(err));
      } finally {
          setIsLoading(false);
      }
  };

  const handleMockSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) {
        setError('O e-mail é obrigatório.');
        setIsLoading(false);
        return;
    }
    const users = JSON.parse(localStorage.getItem('calorix_users') || '{}');

    setTimeout(() => {
        if (activeTab === 'register') {
            if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); setIsLoading(false); return; }
            if (password !== confirmPassword) { setError('As senhas não coincidem.'); setIsLoading(false); return; }
            if (users[normalizedEmail]) { setError('Este e-mail já está cadastrado.'); setIsLoading(false); return; }
          
            const uid = crypto.randomUUID();
            users[normalizedEmail] = { name, password, uid };
            localStorage.setItem('calorix_users', JSON.stringify(users));
            onRegister({ uid, name, email: normalizedEmail });

        } else {
            const user = users[normalizedEmail];
            if (!user || user.password !== password) { setError('E-mail ou senha inválidos.'); setIsLoading(false); return; }
            onLogin({ uid: user.uid || crypto.randomUUID(), name: user.name, email: normalizedEmail });
        }
        setIsLoading(false);
    }, 1000);
  }

  const handleFirebaseSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (activeTab === 'register') {
        if (password.length < 6) { 
            setError('A senha deve ter pelo menos 6 caracteres.');
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) { 
            setError('As senhas não coincidem.');
            setIsLoading(false);
            return;
        }
        
        const user = await registerUser(email, password, name);
        onRegister(user);
      } else {
        const user = await loginUser(email, password);
        onLogin(user);
      }
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSubmit = auth ? handleFirebaseSubmit : handleMockSubmit;

  const inputClasses = "w-full mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition";
  const labelClasses = "block text-md font-semibold text-gray-700 dark:text-gray-300";

  return (
    <>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex justify-center mb-6">
              <LogoIcon />
          </div>
          <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-lg p-8">
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                  <button 
                      onClick={() => handleTabChange('login')}
                      className={`flex-1 py-2 text-center font-semibold transition ${activeTab === 'login' ? 'text-accent-green border-b-2 border-accent-green' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                      Entrar
                  </button>
                  <button 
                      onClick={() => handleTabChange('register')}
                      className={`flex-1 py-2 text-center font-semibold transition ${activeTab === 'register' ? 'text-accent-green border-b-2 border-accent-green' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                      Cadastrar-se
                  </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                  {activeTab === 'register' && (
                      <div>
                          <label htmlFor="name" className={labelClasses}>Nome</label>
                          <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className={inputClasses} />
                      </div>
                  )}
                  <div>
                      <label htmlFor="email" className={labelClasses}>E-mail</label>
                      <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClasses} />
                  </div>
                  <div>
                      <div className="flex justify-between items-center">
                        <label htmlFor="password" className={labelClasses}>Senha</label>
                        {activeTab === 'login' && (
                           <button 
                            type="button" 
                            onClick={() => setIsForgotPasswordOpen(true)}
                            className="text-sm text-accent-blue hover:underline focus:outline-none"
                           >
                            Esqueceu a senha?
                           </button>
                        )}
                      </div>
                      <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClasses} />
                  </div>
                  {activeTab === 'register' && (
                      <div>
                          <label htmlFor="confirmPassword" className={labelClasses}>Confirmar Senha</label>
                          <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className={inputClasses} />
                      </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-600 dark:text-red-400 text-xs font-bold text-center whitespace-pre-wrap">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={isLoading} className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed">
                      {isLoading ? 'Aguarde...' : (activeTab === 'login' ? 'Entrar' : 'Criar Conta')}
                  </button>
              </form>

              <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                      <span className="bg-light-card dark:bg-dark-card px-2 text-gray-500 dark:text-gray-400">Ou continue com</span>
                  </div>
              </div>

              <div className="flex space-x-4">
                  <button onClick={() => handleSocialLogin('Google')} disabled={isLoading} className="flex-1 flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                      <GoogleIcon />
                  </button>
                   <button onClick={() => handleSocialLogin('Facebook')} disabled={isLoading} className="flex-1 flex items-center justify-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50">
                      <FacebookIcon />
                  </button>
              </div>

          </div>
        </div>
      </div>
      {isForgotPasswordOpen && (
        <ForgotPasswordModal
          onClose={() => setIsForgotPasswordOpen(false)}
        />
      )}
    </>
  );
};

export default Auth;
