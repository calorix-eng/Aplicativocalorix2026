import React, { useState, useEffect } from 'react';

interface InteractiveTutorialProps {
    onComplete: () => void;
}

const tutorialSteps = [
    {
        targetSelector: null,
        title: 'Bem-vindo ao calorix!',
        content: 'Vamos fazer um tour rápido pelas principais funcionalidades para você começar sua jornada de bem-estar.',
        position: 'center',
        imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=500&q=80',
    },
    {
        targetSelector: '#tutorial-calorie-ring',
        title: 'Sua Meta Principal',
        content: 'Este é o seu anel de calorias. Ele mostra o quanto você consumiu em relação à sua meta diária. O objetivo é completá-lo!',
        position: 'bottom',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=500&q=80',
    },
    {
        targetSelector: '#tutorial-add-food-button',
        title: 'Adicionar Refeições é Fácil',
        content: 'Clique em qualquer botão "Adicionar Alimento". Você pode tirar uma foto, pesquisar ou escanear um código de barras. A IA faz o resto!',
        position: 'bottom',
        imageUrl: 'https://images.unsplash.com/photo-1565895742202-ce6270832361?auto=format&fit=crop&w=500&q=80',
    },
    {
        targetSelector: '#tutorial-water-tracker',
        title: 'Não Esqueça da Água',
        content: 'Manter-se hidratado é fundamental. Use esta seção para registrar facilmente sua ingestão de água ao longo do dia.',
        position: 'top',
        imageUrl: 'https://images.unsplash.com/photo-1563209995-8a8f19b21f3a?auto=format&fit=crop&w=500&q=80',
    },
    {
        targetSelector: '#tutorial-sidebar-button',
        title: 'Explore o Aplicativo',
        content: 'Clique aqui para abrir o menu principal. Nele você encontrará a Comunidade, Receitas, Desafios e muito mais!',
        position: 'right',
        imageUrl: 'https://images.unsplash.com/photo-1543353071-873f6b6a6a89?auto=format&fit=crop&w=500&q=80',
    },
    {
        targetSelector: '#tutorial-profile-button',
        title: 'Seu Perfil e Configurações',
        content: 'Toque no seu avatar para ver seu perfil, ajustar suas metas, configurar lembretes e gerenciar sua conta.',
        position: 'left',
        imageUrl: 'https://images.unsplash.com/photo-1623945484089-8d6d84f8c47a?auto=format&fit=crop&w=500&q=80',
    },
    {
        targetSelector: null,
        title: 'Você está pronto!',
        content: 'Agora você conhece o básico. Comece adicionando sua primeira refeição e explore tudo que o calorix tem a oferecer. Boa sorte!',
        position: 'center',
        imageUrl: 'https://images.unsplash.com/photo-1522898467493-49726bf28798?auto=format&fit=crop&w=500&q=80',
    }
];

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({ onComplete }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [styles, setStyles] = useState({ highlight: {}, tooltip: {} });

    useEffect(() => {
        const step = tutorialSteps[stepIndex];
        const timer = setTimeout(() => {
            if (step.targetSelector) {
                const element = document.querySelector(step.targetSelector) as HTMLElement;
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const rect = element.getBoundingClientRect();
                    const highlightStyle = {
                        width: `${rect.width + 20}px`,
                        height: `${rect.height + 20}px`,
                        top: `${rect.top - 10}px`,
                        left: `${rect.left - 10}px`,
                    };
                    
                    let tooltipStyle = {};
                    switch (step.position) {
                        case 'top':
                            tooltipStyle = {
                                bottom: `${window.innerHeight - rect.top + 20}px`,
                                left: `${rect.left + rect.width / 2}px`,
                                transform: 'translateX(-50%)',
                            };
                            break;
                        case 'left':
                            tooltipStyle = {
                                top: `${rect.top + rect.height / 2}px`,
                                right: `${window.innerWidth - rect.left + 20}px`,
                                transform: 'translateY(-50%)',
                            };
                            break;
                        case 'right':
                             tooltipStyle = {
                                top: `${rect.top + rect.height / 2}px`,
                                left: `${rect.right + 20}px`,
                                transform: 'translateY(-50%)',
                            };
                            break;
                        case 'bottom':
                        default:
                            tooltipStyle = {
                                top: `${rect.bottom + 20}px`,
                                left: `${rect.left + rect.width / 2}px`,
                                transform: 'translateX(-50%)',
                            };
                            break;
                    }
                    
                    setStyles({ highlight: highlightStyle, tooltip: tooltipStyle });
                }
            } else {
                setStyles({
                    highlight: { display: 'none' },
                    tooltip: {
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }
                });
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [stepIndex]);

    const handleNext = () => {
        if (stepIndex < tutorialSteps.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onComplete();
        }
    };
    
    const handlePrev = () => {
        if (stepIndex > 0) {
            setStepIndex(stepIndex - 1);
        }
    };
    
    const currentStep = tutorialSteps[stepIndex];

    return (
        <div className="fixed inset-0 z-[100]">
            <div className="fixed inset-0 bg-black/75 transition-opacity duration-300"></div>

            <div
                className="absolute border-4 border-white rounded-lg transition-all duration-300 shadow-2xl"
                style={{ ...styles.highlight, pointerEvents: 'none' }}
            ></div>
            
            <div 
                className="absolute bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-80 transition-all duration-300"
                style={styles.tooltip}
            >
                {currentStep.imageUrl && (
                    <img 
                        src={currentStep.imageUrl} 
                        alt={currentStep.title} 
                        className="rounded-t-lg w-full h-40 object-cover"
                    />
                )}
                <div className="p-5">
                    <h3 className="text-xl font-bold mb-2 font-display">{currentStep.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{currentStep.content}</p>
                    
                    <div className="flex justify-between items-center">
                        <button onClick={onComplete} className="text-sm font-semibold text-gray-500 hover:underline">Pular</button>
                        <div className="flex items-center space-x-2">
                            {stepIndex > 0 && tutorialSteps[stepIndex].targetSelector && (
                                <button onClick={handlePrev} className="px-4 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition">
                                    Anterior
                                </button>
                            )}
                            <button onClick={handleNext} className="px-4 py-2 text-sm font-semibold bg-accent-green text-white rounded-md hover:bg-green-600 transition">
                                {stepIndex === tutorialSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractiveTutorial;
