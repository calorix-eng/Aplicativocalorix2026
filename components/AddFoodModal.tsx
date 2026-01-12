
import React, { useState, useMemo } from 'react';
import { Food } from '../types';
import { getNutritionFromImage, getNutritionFromText, getNutritionFromBarcode } from '../services/geminiService';
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
import { PlusIcon } from './icons/PlusIcon';
import EditLibraryFoodModal from './EditLibraryFoodModal';
import { dataURLtoFile, resizeImageFile } from '../utils/fileUtils';

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
  const [foodToEditInLib, setFoodToEditInLib] = useState<LibraryFood | null>(null);
  const [isAddingNewToLib, setIsAddingNewToLib] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(foodLibrary.map(f => f.category));
    return ['Todas', ...Array.from(cats).sort()];
  }, [foodLibrary]);

  const filteredLibrary = useMemo(() => {
    return foodLibrary.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(librarySearch.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || f.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [foodLibrary, librarySearch, selectedCategory]);

  const processResults = (foundFoods: Food[]) => {
    if (foundFoods.length === 0) {
      setError(activeTab === 'photo' 
        ? "Não identificamos alimentos. Tente uma foto mais próxima." 
        : "Nenhum resultado.");
    }
    setResults(foundFoods);
    setSelectedFoodIds(new Set(foundFoods.map(f => f.id)));
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsLoading(true);
      setLoadingMessage("Otimizando imagem...");
      setError(null);
      setResults([]);
      try {
        // Redimensionamento para 768px com qualidade 0.6 para velocidade máxima
        const resizedFile = await resizeImageFile(file, 768, 768, 0.6); 
        setLoadingMessage("IA identificando alimentos...");
        const foundFoods = await getNutritionFromImage(resizedFile);
        processResults(foundFoods);
      } catch (err: any) {
        setError(err.message || 'Falha ao processar.');
      } finally {
        setIsLoading(false);
      }
  };

  const handlePhotoTaken = async ({ mimeType, data }: { mimeType: string; data: string }) => {
      setIsCameraOpen(false);
      setIsLoading(true);
      setLoadingMessage("Analisando foto...");
      setError(null);
      setResults([]);
      try {
        const file = dataURLtoFile(`data:${mimeType};base64,${data}`, 'capture.jpeg');
        // Redimensionamento para 768px com qualidade 0.6 para velocidade máxima
        const resizedFile = await resizeImageFile(file, 768, 768, 0.6);
        const foundFoods = await getNutritionFromImage(resizedFile);
        processResults(foundFoods);
      } catch (err: any) {
        setError(err.message || 'Falha ao processar.');
      } finally {
        setIsLoading(false);
      }
  };

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    setLoadingMessage("Buscando...");
    setError(null);
    try {
      const foundFoods = await getNutritionFromText(query);
      processResults(foundFoods);
    } catch (e: any) {
      setError(e.message || 'Erro na busca.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    setIsScanning(false);
    setIsLoading(true);
    setLoadingMessage("Consultando...");
    setError(null);
    try {
      const foundFoods = await getNutritionFromBarcode(barcode);
      processResults(foundFoods);
    } catch (e: any) {
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

  const handleDeleteFromLibrary = (e: React.MouseEvent, foodId: string) => {
    e.stopPropagation();
    if (window.confirm('Excluir este alimento?')) {
        onUpdateFoodLibrary(foodLibrary.filter(f => f.id !== foodId));
    }
  };

  const handleEditInLibrary = (e: React.MouseEvent, food: LibraryFood) => {
    e.stopPropagation();
    setFoodToEditInLib(food);
  };

  const handleSaveLibraryFood = (food: LibraryFood) => {
    if (foodLibrary.some(f => f.id === food.id)) {
        onUpdateFoodLibrary(foodLibrary.map(f => f.id === food.id ? food : f));
    } else {
        onUpdateFoodLibrary([...foodLibrary, food]);
    }
    setFoodToEditInLib(null);
    setIsAddingNewToLib(false);
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
      className={`flex-1 flex flex-col items-center justify-center p-4 text-[10px] font-black border-b-4 transition ${
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className="bg-white dark:bg-dark-card rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl w-full max-w-lg h-[95dvh] sm:h-auto sm:max-h-[90dvh] flex flex-col overflow-hidden animate-slide-in-bottom">
        
        <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-white dark:bg-dark-card sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{mealName}</h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Adicionar Alimentos</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-900 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="border-b dark:border-gray-800 bg-white dark:bg-dark-card shadow-sm">
          <div className="flex px-2">
            <TabButton tab="search" label="Busca" icon={<SearchIcon className="w-5 h-5" />} />
            <TabButton tab="photo" label="IA Rápida" icon={<CameraIcon className="w-5 h-5" />} />
            <TabButton tab="barcode" label="Scanner" icon={<BarcodeIcon />} />
            <TabButton tab="library" label="Livro" icon={<BookOpenIcon className="w-5 h-5"/>} />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto scrollbar-hide px-6 py-6">
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="O que você comeu?"
                  className="w-full p-5 pl-14 border-2 border-gray-100 dark:border-gray-800 rounded-3xl bg-gray-50 dark:bg-gray-900 focus:ring-4 focus:ring-accent-green/10 focus:border-accent-green outline-none transition-all text-lg font-medium"
                />
                <SearchIcon className="absolute left-5 top-5.5 w-6 h-6 text-gray-300" />
                <button onClick={handleSearch} className="absolute right-3 top-2.5 bg-accent-green text-white px-5 py-2.5 rounded-2xl font-black hover:bg-green-600 transition shadow-lg active:scale-95 uppercase text-xs">
                   Buscar
                </button>
              </div>
            </div>
          )}

          {activeTab === 'photo' && (
             isCameraOpen ? (
                <div className="absolute inset-0 z-50 bg-black">
                  <CameraCapture onCapture={handlePhotoTaken} onClose={() => setIsCameraOpen(false)} />
                </div>
            ) : (
                <div className="text-center space-y-8 py-4">
                    <div className="w-24 h-24 bg-accent-blue/10 text-accent-blue rounded-[2.5rem] flex items-center justify-center mx-auto rotate-12">
                        <SparklesIcon className="w-12 h-12" />
                    </div>
                    <div className="max-w-[280px] mx-auto">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white">Identificação Instantânea</h3>
                        <p className="text-sm text-gray-500 mt-2">Nossa IA Gemini Flash identifica o prato e estima porções e nutrientes em segundos.</p>
                    </div>
                    
                    <div className="flex flex-col gap-4 pt-4">
                        <button 
                            onClick={() => setIsCameraOpen(true)}
                            className="w-full flex items-center justify-center space-x-3 bg-accent-blue text-white p-6 rounded-3xl font-black text-lg hover:bg-blue-600 transition shadow-xl active:scale-95"
                        >
                            <CameraIcon className="w-6 h-6" />
                            <span>Tirar Foto</span>
                        </button>
        
                        <input type="file" id="photo-upload" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <label 
                            htmlFor="photo-upload" 
                            className="w-full flex items-center justify-center space-x-3 cursor-pointer bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-white p-6 rounded-3xl font-bold hover:bg-gray-100 transition active:scale-95"
                        >
                            <ImageIcon className="w-6 h-6" />
                            <span>Abrir Galeria</span>
                        </label>
                    </div>
                </div>
            )
          )}
          
          {activeTab === 'barcode' && (
            isScanning ? (
                <div className="absolute inset-0 z-50 bg-black">
                  <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setIsScanning(false)} />
                </div>
            ) : (
                <div className="text-center py-10 space-y-8">
                    <div className="w-24 h-24 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center mx-auto">
                        <ScannerIcon className="w-12 h-12" />
                    </div>
                    <div className="max-w-[280px] mx-auto">
                        <h3 className="text-xl font-black">Scanner de Código</h3>
                        <p className="text-sm text-gray-500 mt-2">Consulte informações de produtos industrializados rapidamente.</p>
                    </div>
                    <button onClick={() => setIsScanning(true)} className="bg-accent-green text-white p-6 rounded-3xl font-black text-lg hover:bg-green-600 transition w-full shadow-lg active:scale-95">
                        Ativar Câmera
                    </button>
                </div>
            )
          )}

          {activeTab === 'library' && (
              <div className="space-y-6">
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={librarySearch}
                            onChange={(e) => setLibrarySearch(e.target.value)}
                            placeholder="Pesquisar no livro..."
                            className="w-full p-4 pl-12 border-2 border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-900 focus:border-accent-green outline-none"
                        />
                        <SearchIcon className="absolute left-4 top-4.5 w-5 h-5 text-gray-300" />
                    </div>
                    <button 
                        onClick={() => setIsAddingNewToLib(true)}
                        className="bg-accent-blue text-white p-4 rounded-2xl shadow-lg hover:bg-blue-600 transition active:scale-95"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide -mx-1">
                      {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-accent-green text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 pb-20">
                      {filteredLibrary.length > 0 ? filteredLibrary.map(food => (
                          <div 
                            key={food.id} 
                            onClick={() => handleToggleSelection(food.id)}
                            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer group ${selectedFoodIds.has(food.id) ? 'border-accent-green bg-accent-green/5 ring-4 ring-accent-green/5' : 'border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50'}`}
                          >
                              <div className="flex justify-between items-center">
                                  <div className="flex-grow">
                                    <span className="font-bold block text-gray-900 dark:text-white text-base leading-tight">{food.name}</span>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{food.category}</span>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">• {food.servingSize}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                      <div className="text-right">
                                        <span className="text-accent-green font-black text-xl">{food.calories}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase block -mt-1">kcal</span>
                                      </div>
                                      <div className="flex flex-col gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={(e) => handleEditInLibrary(e, food)} className="p-2 bg-white dark:bg-gray-800 rounded-xl text-accent-blue shadow-sm border dark:border-gray-700">
                                              <PencilIcon className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={(e) => handleDeleteFromLibrary(e, food.id)} className="p-2 bg-white dark:bg-gray-800 rounded-xl text-red-500 shadow-sm border dark:border-gray-700">
                                              <TrashIcon className="w-3.5 h-3.5" />
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )) : (
                          <div className="text-center py-10 opacity-30">
                              <BookOpenIcon className="w-12 h-12 mx-auto mb-2" />
                              <p className="font-black uppercase text-xs tracking-widest">Vazio</p>
                          </div>
                      )}
                  </div>
              </div>
          )}

          {isLoading && (
              <div className="fixed inset-0 bg-white/95 dark:bg-dark-card/95 z-[110] flex flex-col items-center justify-center p-10 text-center animate-fade-in">
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 border-[6px] border-accent-green/20 rounded-full"></div>
                    <div className="absolute inset-0 border-[6px] border-accent-green border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <SparklesIcon className="w-10 h-10 text-accent-green animate-pulse" />
                    </div>
                </div>
                <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-tighter">{loadingMessage}</h3>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">IA calorix processando</p>
              </div>
          )}

          {error && (
            <div className="mt-4 p-5 text-red-500 text-sm font-black bg-red-50 dark:bg-red-900/10 rounded-3xl border-2 border-red-100 dark:border-red-900/20 text-center animate-shake">
                {error}
            </div>
          )}

          {results.length > 0 && !isLoading && (
            <div className="mt-4 space-y-4 pb-24">
              <ul className="space-y-3">
                {results.map(food => (
                  <li 
                    key={food.id} 
                    className={`p-5 rounded-3xl border-2 transition-all duration-200 cursor-pointer ${selectedFoodIds.has(food.id) ? 'border-accent-green bg-accent-green/5 shadow-lg scale-[1.02]' : 'border-gray-50 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40'}`} 
                    onClick={() => handleToggleSelection(food.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <p className="font-black text-gray-900 dark:text-white text-lg leading-tight">{food.name}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{food.servingSize}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-2xl text-accent-green">{food.calories}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase -mt-1">kcal</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 border-t dark:border-gray-800 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md sticky bottom-0 z-20 pb-10 sm:pb-6">
            <button
                onClick={handleAddSelected}
                disabled={selectedFoodIds.size === 0 || isLoading}
                className="w-full bg-accent-green text-white p-6 rounded-[2rem] font-black text-xl hover:bg-green-600 transition-all disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 shadow-2xl active:scale-95 flex items-center justify-center space-x-3"
            >
                {selectedFoodIds.size === 0 ? 'SELECIONE ITENS' : `ADICIONAR ${selectedFoodIds.size} ITEM(S)`}
            </button>
        </div>
      </div>

      {(foodToEditInLib || isAddingNewToLib) && (
          <EditLibraryFoodModal 
            food={foodToEditInLib || undefined}
            onClose={() => { setFoodToEditInLib(null); setIsAddingNewToLib(false); }}
            onSave={handleSaveLibraryFood}
            categories={categories.filter(c => c !== 'Todas')}
          />
      )}
    </div>
  );
};

export default AddFoodModal;
