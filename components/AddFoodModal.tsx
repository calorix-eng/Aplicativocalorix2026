
import React, { useState, useMemo } from 'react';
import { Food, Micronutrient } from '../types';
import { getNutritionFromImage, getNutritionFromText, getNutritionFromBarcode } from '../services/geminiService';
import { fileToBase64, resizeImage, resizeImageFile } from '../utils/fileUtils';
import { SearchIcon } from './icons/SearchIcon';
import { CameraIcon } from './icons/CameraIcon';
import { BarcodeIcon } from './icons/BarcodeIcon';
import { XIcon } from './icons/XIcon';
import BarcodeScanner from './BarcodeScanner';
import { ScannerIcon } from './icons/ScannerIcon';
import { ImageIcon } from './icons/ImageIcon';
import CameraCapture from './CameraCapture';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { LibraryFood } from '../utils/brazilianFoodData';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface AddFoodModalProps {
  mealName: string;
  onClose: () => void;
  onAddFoods: (foods: Food[]) => void;
  foodLibrary: LibraryFood[];
  onUpdateFoodLibrary: (updatedLibrary: LibraryFood[]) => void;
}

type Tab = 'search' | 'photo' | 'barcode' | 'library';

const AddFoodModal: React.FC<AddFoodModalProps> = ({ mealName, onClose, onAddFoods, foodLibrary, onUpdateFoodLibrary }) => {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Analisando...');
  const [error, setError] = useState<string | null>(null);
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const filteredLibrary = useMemo(() => {
    return foodLibrary.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(librarySearch.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || f.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [foodLibrary, librarySearch, selectedCategory]);

  const selectionSummary = useMemo(() => {
    if (selectedFoodIds.size === 0) return null;
    const combinedResults = [...results, ...foodLibrary];
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    combinedResults.forEach(food => {
        if (selectedFoodIds.has(food.id)) {
            totals.calories += food.calories;
            totals.protein += food.protein;
            totals.carbs += food.carbs;
            totals.fat += food.fat;
        }
    });
    return totals;
  }, [results, foodLibrary, selectedFoodIds]);

  const processResults = (foundFoods: Food[]) => {
    if (foundFoods.length === 0) {
      setError(activeTab === 'photo' 
        ? "A IA não conseguiu identificar alimentos nesta foto. Tente tirar em um ângulo diferente." 
        : "Nenhum resultado encontrado.");
    }
    setResults(foundFoods);
    setSelectedFoodIds(new Set(foundFoods.map(f => f.id)));
  };
  
  const processAndAnalyzeImage = async (base64Image: string, mimeType: string) => {
    setIsLoading(true);
    setLoadingMessage("Otimizando imagem...");
    setError(null);
    setResults([]);
    
    try {
        // Redimensionamento agressivo para garantir funcionamento em qualquer rede (Wi-Fi/4G)
        const optimizedBase64 = await resizeImage(base64Image, 768, 768, 0.6);
        
        setLoadingMessage("Identificando alimentos...");
        const foundFoods = await getNutritionFromImage(optimizedBase64, 'image/jpeg');
        processResults(foundFoods);
    } catch (e) {
        console.error("Análise de imagem falhou:", e);
        setError('Falha na análise. Verifique se a foto está clara e tente novamente.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setIsLoading(true);
      setLoadingMessage("Lendo foto da galeria...");
      setError(null);
      
      try {
        // Processa o arquivo File diretamente para maior performance e sucesso em arquivos grandes
        const optimizedBase64 = await resizeImageFile(file, 768, 768, 0.6);
        
        setLoadingMessage("Identificando alimentos...");
        const foundFoods = await getNutritionFromImage(optimizedBase64, 'image/jpeg');
        processResults(foundFoods);
      } catch (err) {
        console.error("Erro no upload da galeria:", err);
        setError('Falha ao processar imagem da galeria. Verifique as permissões ou tente outra foto.');
      } finally {
        setIsLoading(false);
        e.target.value = ''; // Limpa o input
      }
  };

  const handlePhotoTaken = async ({ mimeType, data }: { mimeType: string; data: string }) => {
      setIsCameraOpen(false);
      processAndAnalyzeImage(data, mimeType);
  };

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    setLoadingMessage("Buscando dados...");
    setError(null);
    try {
      const foundFoods = await getNutritionFromText(query);
      processResults(foundFoods);
    } catch (e) {
      setError('Falha ao buscar dados nutricionais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    setIsScanning(false);
    setIsLoading(true);
    setLoadingMessage("Consultando código...");
    setError(null);
    try {
      const foundFoods = await getNutritionFromBarcode(barcode);
      processResults(foundFoods);
    } catch (e) {
      setError('Produto não encontrado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelection = (foodId: string) => {
    setSelectedFoodIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(foodId)) newSet.delete(foodId);
      else newSet.add(foodId);
      return newSet;
    });
  };

  const handleAddSelected = () => {
    const combinedResults = [...results, ...foodLibrary];
    const foodsToAdd = combinedResults.filter(food => selectedFoodIds.has(food.id));
    if (foodsToAdd.length > 0) onAddFoods(foodsToAdd);
  };

  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactElement }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setResults([]);
        setError(null);
        setSelectedFoodIds(new Set());
        setIsScanning(false);
        setIsCameraOpen(false);
      }}
      className={`flex-1 flex flex-col items-center justify-center p-3 text-[10px] font-bold border-b-4 transition ${
        activeTab === tab
          ? 'border-accent-green text-accent-green bg-accent-green/5'
          : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      {icon}
      <span className="mt-1 uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
      <div className="bg-white dark:bg-dark-card rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg h-[92dvh] sm:h-auto sm:max-h-[90dvh] flex flex-col overflow-hidden animate-slide-in-bottom">
        
        <div className="p-5 border-b dark:border-gray-800 flex justify-between items-center bg-white dark:bg-dark-card sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-gray-800 dark:text-white">{mealName}</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Adicionar Alimentos</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="flex">
            <TabButton tab="search" label="Busca" icon={<SearchIcon className="w-5 h-5" />} />
            <TabButton tab="photo" label="Foto IA" icon={<CameraIcon className="w-5 h-5" />} />
            <TabButton tab="barcode" label="Código" icon={<BarcodeIcon />} />
            <TabButton tab="library" label="Livro" icon={<BookOpenIcon className="w-5 h-5"/>} />
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-grow scrollbar-hide">
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ex: 'Tapioca com queijo coalho'"
                  className="w-full p-4 pl-12 border-2 border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900 focus:ring-4 focus:ring-accent-green/20 focus:border-accent-green outline-none transition"
                />
                <SearchIcon className="absolute left-4 top-4.5 w-5 h-5 text-gray-400" />
                <button onClick={handleSearch} className="absolute right-2 top-2 bg-accent-green text-white px-4 py-2 rounded-xl font-bold hover:bg-green-600 transition shadow-lg">
                   IR
                </button>
              </div>
            </div>
          )}

          {activeTab === 'photo' && (
             isCameraOpen ? (
                <CameraCapture onCapture={handlePhotoTaken} onClose={() => setIsCameraOpen(false)} />
            ) : (
                <div className="text-center space-y-6 py-4">
                    <div className="w-20 h-20 bg-accent-blue/10 text-accent-blue rounded-full flex items-center justify-center mx-auto">
                        <SparklesIcon className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Inteligência Artificial</h3>
                        <p className="text-sm text-gray-500 max-w-[240px] mx-auto">Tire uma foto do seu prato e o calorix identificará os nutrientes.</p>
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-4">
                        <button 
                            onClick={() => setIsCameraOpen(true)}
                            className="w-full flex items-center justify-center space-x-3 bg-accent-blue text-white p-5 rounded-2xl font-bold hover:bg-blue-600 transition shadow-xl active:scale-[0.98]"
                        >
                            <CameraIcon className="w-6 h-6" />
                            <span>Tirar Foto Agora</span>
                        </button>
        
                        <input type="file" id="photo-upload" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <label 
                            htmlFor="photo-upload" 
                            className="w-full flex items-center justify-center space-x-3 cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white p-5 rounded-2xl font-bold hover:bg-gray-200 transition"
                        >
                            <ImageIcon className="w-6 h-6" />
                            <span>Escolher da Galeria</span>
                        </label>
                    </div>
                </div>
            )
          )}
          
          {activeTab === 'barcode' && (
            isScanning ? (
                <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setIsScanning(false)} />
            ) : (
                <div className="text-center py-6 space-y-6">
                    <div className="w-16 h-16 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center mx-auto">
                        <ScannerIcon className="w-8 h-8" />
                    </div>
                    <button onClick={() => setIsScanning(true)} className="bg-accent-green text-white p-5 rounded-2xl font-bold hover:bg-green-600 transition inline-flex items-center justify-center w-full shadow-lg">
                        <span className="ml-2">Ativar Scanner</span>
                    </button>
                </div>
            )
          )}

          {activeTab === 'library' && (
              <div className="space-y-4">
                  <div className="relative">
                    <input
                        type="text"
                        value={librarySearch}
                        onChange={(e) => setLibrarySearch(e.target.value)}
                        placeholder="Pesquisar alimentos comuns..."
                        className="w-full p-3 pl-10 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900"
                    />
                    <SearchIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                      {filteredLibrary.slice(0, 15).map(food => (
                          <div 
                            key={food.id} 
                            onClick={() => handleToggleSelection(food.id)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${selectedFoodIds.has(food.id) ? 'border-accent-green bg-accent-green/5' : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50'}`}
                          >
                              <div className="flex justify-between items-center">
                                  <span className="font-bold">{food.name}</span>
                                  <span className="text-accent-green font-black">{food.calories} kcal</span>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {isLoading && (
              <div className="fixed inset-0 bg-white/90 dark:bg-dark-card/90 z-20 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-accent-green border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <SparklesIcon className="w-8 h-8 text-accent-green animate-pulse" />
                    </div>
                </div>
                <h3 className="text-xl font-black mb-2">{loadingMessage}</h3>
              </div>
          )}

          {error && <div className="mt-4 p-4 text-red-500 text-sm font-bold bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">{error}</div>}

          {results.length > 0 && !isLoading && (
            <div className="mt-6 space-y-4">
              <ul className="space-y-3">
                {results.map(food => (
                  <li 
                    key={food.id} 
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${selectedFoodIds.has(food.id) ? 'border-accent-green bg-accent-green/5 shadow-md' : 'border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40'}`} 
                    onClick={() => handleToggleSelection(food.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <p className="font-bold text-gray-800 dark:text-white">{food.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{food.servingSize}</p>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                            <p className="font-black text-lg text-accent-green">{food.calories}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase -mt-1 text-center">kcal</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-5 border-t dark:border-gray-800 bg-white dark:bg-dark-card pb-10 sm:pb-5">
            <button
                onClick={handleAddSelected}
                disabled={selectedFoodIds.size === 0 || isLoading}
                className="w-full bg-accent-green text-white p-5 rounded-2xl font-black text-lg hover:bg-green-600 transition disabled:bg-gray-200 dark:disabled:bg-gray-800 shadow-xl"
            >
                {selectedFoodIds.size === 0 ? 'Selecione Alimentos' : `ADICIONAR ${selectedFoodIds.size} ITEM(S)`}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddFoodModal;