
import React, { useState, useMemo } from 'react';
import { Food, Micronutrient } from '../types';
import { getNutritionFromImage, getNutritionFromText, getNutritionFromBarcode } from '../services/geminiService';
import { fileToBase64 } from '../utils/fileUtils';
import { SearchIcon } from './icons/SearchIcon';
import { CameraIcon } from './icons/CameraIcon';
import { BarcodeIcon } from './icons/BarcodeIcon';
import { XIcon } from './icons/XIcon';
import BarcodeScanner from './BarcodeScanner';
import { ScannerIcon } from './icons/ScannerIcon';
import { ImageIcon } from './icons/ImageIcon';
import CameraCapture from './CameraCapture';
import { FireIcon } from './icons/FireIcon';
import { BoltIcon } from './icons/BoltIcon';
import { LeafIcon } from './icons/LeafIcon';
import { OilIcon } from './icons/OilIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';
import { LibraryFood } from '../utils/brazilianFoodData';


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
  const [error, setError] = useState<string | null>(null);
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  // Library-specific state
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [editingFood, setEditingFood] = useState<LibraryFood | null>(null);

  const categories = useMemo(() => ['Todas', ...Array.from(new Set(foodLibrary.map(f => f.category)))], [foodLibrary]);

  const filteredLibrary = useMemo(() => {
    return foodLibrary.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(librarySearch.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || f.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [foodLibrary, librarySearch, selectedCategory]);

  const selectionSummary = useMemo(() => {
    if (selectedFoodIds.size === 0) {
        return null;
    }
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
      if (activeTab === 'photo') {
        setError("Não foi possível identificar nenhum alimento na imagem. Por favor, tente outra.");
      } else if (activeTab === 'barcode') {
        setError("Nenhum produto encontrado para este código de barras.");
      } else {
        setError("Nenhum resultado encontrado. Tente um termo de busca diferente.");
      }
    }
    setResults(foundFoods);
    setSelectedFoodIds(new Set(foundFoods.map(f => f.id)));
  };
  
  const processAndAnalyzeImage = async (base64Image: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setSelectedFoodIds(new Set());
    try {
        const foundFoods = await getNutritionFromImage(base64Image, mimeType);
        processResults(foundFoods);
    } catch (e) {
        setError('Falha ao analisar a imagem. Por favor, tente novamente.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const { mimeType, data } = await fileToBase64(file);
      processAndAnalyzeImage(data, mimeType);
  };

  const handlePhotoTaken = async ({ mimeType, data }: { mimeType: string; data: string }) => {
      setIsCameraOpen(false);
      processAndAnalyzeImage(data, mimeType);
  };

  const handleSearch = async () => {
    if (!query) return;
    setIsLoading(true);
    setError(null);
    setResults([]);
    setSelectedFoodIds(new Set());
    try {
      const foundFoods = await getNutritionFromText(query);
      processResults(foundFoods);
    } catch (e) {
      setError('Falha ao buscar dados nutricionais. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    setIsScanning(false);
    setIsLoading(true);
    setError(null);
    setResults([]);
    setSelectedFoodIds(new Set());
    try {
      const foundFoods = await getNutritionFromBarcode(barcode);
      processResults(foundFoods);
    } catch (e) {
      setError('Falha ao buscar dados do código de barras. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelection = (foodId: string) => {
    setSelectedFoodIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(foodId)) {
        newSet.delete(foodId);
      } else {
        newSet.add(foodId);
      }
      return newSet;
    });
  };

  const handleAddSelected = () => {
    const combinedResults = [...results, ...foodLibrary];
    const foodsToAdd = combinedResults.filter(food => selectedFoodIds.has(food.id));
    if (foodsToAdd.length > 0) {
      onAddFoods(foodsToAdd);
    }
  };

  // Library Management Actions
  const handleDeleteFromLibrary = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este alimento da biblioteca permanentemente?')) {
        onUpdateFoodLibrary(foodLibrary.filter(f => f.id !== id));
        setSelectedFoodIds(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }
  };

  const handleEditInLibrary = (e: React.MouseEvent, food: LibraryFood) => {
    e.stopPropagation();
    setEditingFood(JSON.parse(JSON.stringify(food))); // Deep copy for editing
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFood) {
        onUpdateFoodLibrary(foodLibrary.map(f => f.id === editingFood.id ? editingFood : f));
        setEditingFood(null);
    }
  };

  const handleEditMicronutrient = (key: Micronutrient, value: string) => {
    if (!editingFood) return;
    const numValue = value === '' ? undefined : Number(value);
    const newMicros = { ...editingFood.micronutrients };
    if (numValue === undefined) {
        delete newMicros[key];
    } else {
        newMicros[key] = numValue;
    }
    setEditingFood({ ...editingFood, micronutrients: newMicros });
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
      className={`flex-1 flex flex-col items-center justify-center p-2 text-xs font-medium border-b-2 transition ${
        activeTab === tab
          ? 'border-accent-green text-accent-green'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Adicionar em {mealName}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
            <XIcon />
          </button>
        </div>
        
        <div className="border-b dark:border-gray-700">
          <div className="flex">
            <TabButton tab="library" label="Biblioteca" icon={<BookOpenIcon className="w-5 h-5"/>} />
            <TabButton tab="search" label="IA Busca" icon={<SearchIcon />} />
            <TabButton tab="photo" label="IA Foto" icon={<CameraIcon />} />
            <TabButton tab="barcode" label="Código" icon={<BarcodeIcon />} />
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-grow">
          {activeTab === 'library' && (
            <div className="space-y-4">
               <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <input
                        type="text"
                        value={librarySearch}
                        onChange={(e) => setLibrarySearch(e.target.value)}
                        placeholder="Buscar por nome..."
                        className="w-full p-2 pl-8 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent-green outline-none"
                        />
                        <SearchIcon className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md text-sm bg-white"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
               </div>

               <div className="border dark:border-gray-700 rounded-md overflow-hidden bg-gray-50 dark:bg-gray-900/20">
                    <ul className="divide-y dark:divide-gray-600 max-h-72 overflow-y-auto">
                        {filteredLibrary.map(food => (
                        <li 
                            key={food.id} 
                            className={`p-3 flex items-center cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-colors ${selectedFoodIds.has(food.id) ? 'bg-accent-green/10' : ''}`} 
                            onClick={() => handleToggleSelection(food.id)}
                        >
                            <div className="flex-grow">
                                <div className="flex items-center">
                                    <p className="font-bold text-sm text-light-text dark:text-dark-text">{food.name}</p>
                                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{food.category}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                                    P: {Math.round(food.protein)}g | C: {Math.round(food.carbs)}g | G: {Math.round(food.fat)}g (100g)
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right mr-2">
                                    <p className="font-bold text-accent-green text-sm">{Math.round(food.calories)}</p>
                                    <p className="text-[10px] text-gray-400">kcal</p>
                                </div>
                                <button 
                                    onClick={(e) => handleEditInLibrary(e, food)} 
                                    className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition"
                                    title="Editar Alimento"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => handleDeleteFromLibrary(e, food.id)} 
                                    className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                                    title="Excluir Alimento"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </li>
                        ))}
                        {filteredLibrary.length === 0 && <p className="p-4 text-center text-sm text-gray-500">Nenhum alimento encontrado na biblioteca.</p>}
                    </ul>
               </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="ex: '1 xícara de aveia'"
                  className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none transition"
                />
                <button onClick={handleSearch} className="bg-accent-green text-white px-4 py-2 rounded-md font-semibold hover:bg-green-600 transition" disabled={isLoading}>
                  {isLoading ? '...' : 'Buscar'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'photo' && (
             isCameraOpen ? (
                <CameraCapture onCapture={handlePhotoTaken} onClose={() => setIsCameraOpen(false)} />
            ) : (
                <div className="text-center space-y-4">
                    <p className="text-sm">Use a IA para identificar alimentos a partir de uma foto.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => setIsCameraOpen(true)}
                            className="flex-1 flex items-center justify-center space-x-2 bg-accent-blue text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-600 transition"
                        >
                            <CameraIcon />
                            <span>Tirar Foto</span>
                        </button>
        
                        <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <label 
                            htmlFor="photo-upload" 
                            className="flex-1 flex items-center justify-center space-x-2 cursor-pointer bg-accent-green text-white px-6 py-3 rounded-md font-semibold hover:bg-green-600 transition"
                        >
                            <ImageIcon />
                            <span>Enviar da Galeria</span>
                        </label>
                    </div>
                </div>
            )
          )}
          
          {activeTab === 'barcode' && (
            isScanning ? (
                <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setIsScanning(false)} />
            ) : (
                <div className="text-center">
                    <p className="mb-4 text-sm">Escaneie o código de barras de produtos industrializados brasileiros.</p>
                    <button onClick={() => setIsScanning(true)} className="bg-accent-green text-white px-6 py-3 rounded-md font-semibold hover:bg-green-600 transition inline-flex items-center justify-center">
                        <ScannerIcon className="h-5 w-5" />
                        <span className="ml-2">Abrir Scanner</span>
                    </button>
                </div>
            )
          )}

          {isLoading && <div className="text-center p-8">Carregando...</div>}
          {error && <div className="text-center p-4 text-red-500">{error}</div>}

          {(results.length > 0 && activeTab !== 'library') && (
            <div className="mt-4 space-y-4">
              <h3 className="font-semibold text-sm">Resultados IA:</h3>
              <ul className="divide-y dark:divide-gray-600 max-h-72 overflow-y-auto border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/40">
                {results.map(food => (
                  <li 
                    key={food.id} 
                    className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${selectedFoodIds.has(food.id) ? 'bg-accent-green/10' : ''}`} 
                    onClick={() => handleToggleSelection(food.id)}
                  >
                    <div className="flex-grow">
                      <p className="font-bold text-light-text dark:text-dark-text">{food.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {food.servingSize}
                      </p>
                      <div className="flex items-center space-x-4 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        <span className="font-semibold text-red-500">P: {Math.round(food.protein)}g</span>
                        <span className="font-semibold text-orange-500">C: {Math.round(food.carbs)}g</span>
                        <span className="font-semibold text-yellow-500">F: {Math.round(food.fat)}g</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 ml-4">
                      <div className="text-right">
                          <p className="font-bold text-xl text-accent-green">{Math.round(food.calories)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">kcal</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${selectedFoodIds.has(food.id) ? 'bg-accent-green border-accent-green' : 'border-gray-300 dark:border-gray-500'}`}>
                        {selectedFoodIds.has(food.id) && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectionSummary && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg animate-slide-in-right">
                  <h4 className="font-semibold text-xs text-center mb-2">Resumo da Seleção</h4>
                  <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="flex flex-col items-center">
                          <FireIcon className="w-4 h-4 text-orange-500" />
                          <span className="font-bold text-xs">{Math.round(selectionSummary.calories)}</span>
                          <span className="text-[8px] text-gray-400 uppercase">kcal</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <BoltIcon className="w-4 h-4 text-red-500" />
                          <span className="font-bold text-xs">{Math.round(selectionSummary.protein)}g</span>
                          <span className="text-[8px] text-gray-400 uppercase">Prot</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <LeafIcon className="w-4 h-4 text-green-500" />
                          <span className="font-bold text-xs">{Math.round(selectionSummary.carbs)}g</span>
                          <span className="text-[8px] text-gray-400 uppercase">Carb</span>
                      </div>
                      <div className="flex flex-col items-center">
                          <OilIcon className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold text-xs">{Math.round(selectionSummary.fat)}g</span>
                          <span className="text-[8px] text-gray-400 uppercase">Gord</span>
                      </div>
                  </div>
              </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700">
            <button
                onClick={handleAddSelected}
                disabled={selectedFoodIds.size === 0}
                className="w-full bg-accent-green text-white p-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                Adicionar {selectedFoodIds.size} {selectedFoodIds.size === 1 ? 'Item' : 'Itens'}
            </button>
        </div>
      </div>

      {/* Edit Modal for Library Food */}
      {editingFood && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
              <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                  <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                      <h3 className="text-lg font-bold">Editar Alimento (Base 100g)</h3>
                      <button onClick={() => setEditingFood(null)}><XIcon /></button>
                  </div>
                  <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase">Nome</label>
                          <input 
                            type="text" 
                            value={editingFood.name} 
                            onChange={(e) => setEditingFood({...editingFood, name: e.target.value})}
                            className="w-full mt-1 p-2 border rounded bg-gray-50 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-accent-green"
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase">Calorias (kcal)</label>
                              <input 
                                type="number" 
                                value={editingFood.calories} 
                                onChange={(e) => setEditingFood({...editingFood, calories: Number(e.target.value)})}
                                className="w-full mt-1 p-2 border rounded bg-gray-50 dark:bg-gray-700"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase">Proteínas (g)</label>
                              <input 
                                type="number" 
                                value={editingFood.protein} 
                                onChange={(e) => setEditingFood({...editingFood, protein: Number(e.target.value)})}
                                className="w-full mt-1 p-2 border rounded bg-gray-50 dark:bg-gray-700"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase">Carboidratos (g)</label>
                              <input 
                                type="number" 
                                value={editingFood.carbs} 
                                onChange={(e) => setEditingFood({...editingFood, carbs: Number(e.target.value)})}
                                className="w-full mt-1 p-2 border rounded bg-gray-50 dark:bg-gray-700"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase">Gorduras (g)</label>
                              <input 
                                type="number" 
                                value={editingFood.fat} 
                                onChange={(e) => setEditingFood({...editingFood, fat: Number(e.target.value)})}
                                className="w-full mt-1 p-2 border rounded bg-gray-50 dark:bg-gray-700"
                              />
                          </div>
                      </div>

                      <div className="border-t dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-bold mb-3 text-gray-600 dark:text-gray-400 uppercase tracking-wider">Micronutrientes</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            {([
                                { key: 'Cálcio', unit: 'mg' },
                                { key: 'Ferro', unit: 'mg' },
                                { key: 'Potássio', unit: 'mg' },
                                { key: 'Magnésio', unit: 'mg' },
                                { key: 'Vitamina C', unit: 'mg' },
                                { key: 'Vitamina A', unit: 'mcg' },
                                { key: 'Vitamina D', unit: 'mcg' },
                            ] as {key: Micronutrient, unit: string}[]).map(({key, unit}) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">{key} ({unit})</label>
                                    <input 
                                        type="number" 
                                        value={editingFood.micronutrients?.[key] ?? ''} 
                                        onChange={(e) => handleEditMicronutrient(key, e.target.value)}
                                        className="w-full mt-1 p-1.5 border rounded bg-gray-50 dark:bg-gray-700 text-sm"
                                        placeholder="-"
                                    />
                                </div>
                            ))}
                        </div>
                      </div>

                      <div className="pt-4">
                        <button type="submit" className="w-full bg-accent-green text-white p-3 rounded-lg font-bold hover:bg-green-600 transition shadow-md">
                            Salvar Alterações
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setEditingFood(null)}
                            className="w-full mt-2 text-gray-500 text-sm font-semibold p-2"
                        >
                            Cancelar
                        </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default AddFoodModal;
