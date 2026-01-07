
import { Food } from '../types';

export interface LibraryFood extends Food {
    category: string;
}

export const defaultBrazilianFoods: LibraryFood[] = [
    // FRUTAS
    { id: 'f1', category: 'Frutas', name: 'Banana Prata', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, servingSize: '100g', micronutrients: { 'Potássio': 358, 'Vitamina C': 8.7 } },
    { id: 'f2', category: 'Frutas', name: 'Maçã Fuji', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, servingSize: '100g', micronutrients: { 'Potássio': 107 } },
    { id: 'f3', category: 'Frutas', name: 'Mamão Papaia', calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3, servingSize: '100g', micronutrients: { 'Vitamina A': 47, 'Vitamina C': 60 } },
    { id: 'f4', category: 'Frutas', name: 'Laranja Pera', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, servingSize: '100g', micronutrients: { 'Vitamina C': 53, 'Cálcio': 40 } },
    { id: 'f5', category: 'Frutas', name: 'Abacaxi', calories: 50, protein: 0.5, carbs: 13.1, fat: 0.1, servingSize: '100g', micronutrients: { 'Vitamina C': 47.8 } },
    { id: 'f6', category: 'Frutas', name: 'Manga Palmer', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, servingSize: '100g', micronutrients: { 'Vitamina A': 54, 'Vitamina C': 36.4 } },
    { id: 'f7', category: 'Frutas', name: 'Goiaba Vermelha', calories: 68, protein: 2.6, carbs: 14.3, fat: 1, servingSize: '100g', micronutrients: { 'Vitamina C': 228, 'Potássio': 417 } },
    { id: 'f8', category: 'Frutas', name: 'Açaí (Polpa Pura)', calories: 60, protein: 0.8, carbs: 6.2, fat: 3.9, servingSize: '100g', micronutrients: { 'Cálcio': 35, 'Ferro': 0.4 } },
    { id: 'f9', category: 'Frutas', name: 'Melancia', calories: 30, protein: 0.6, carbs: 7.5, fat: 0.2, servingSize: '100g', micronutrients: { 'Vitamina C': 8.1, 'Potássio': 112 } },
    { id: 'f10', category: 'Frutas', name: 'Abacate', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, servingSize: '100g', micronutrients: { 'Potássio': 485, 'Magnésio': 29 } },
    
    // VERDURAS
    { id: 'v1', category: 'Verduras', name: 'Alface Crespa', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, servingSize: '100g', micronutrients: { 'Cálcio': 36, 'Ferro': 0.9 } },
    { id: 'v2', category: 'Verduras', name: 'Espinafre', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, servingSize: '100g', micronutrients: { 'Ferro': 2.7, 'Cálcio': 99 } },
    { id: 'v3', category: 'Verduras', name: 'Couve Manteiga', calories: 27, protein: 2.9, carbs: 5.6, fat: 0.4, servingSize: '100g', micronutrients: { 'Cálcio': 150, 'Vitamina C': 120 } },
    { id: 'v4', category: 'Verduras', name: 'Rúcula', calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, servingSize: '100g', micronutrients: { 'Cálcio': 160, 'Ferro': 1.5 } },
    { id: 'v5', category: 'Verduras', name: 'Agrião', calories: 11, protein: 1.3, carbs: 2.1, fat: 0.1, servingSize: '100g', micronutrients: { 'Ferro': 0.2, 'Vitamina C': 43 } },

    // LEGUMES
    { id: 'l1', category: 'Legumes', name: 'Cenoura Cozida', calories: 35, protein: 0.8, carbs: 8.2, fat: 0.2, servingSize: '100g', micronutrients: { 'Vitamina A': 835 } },
    { id: 'l2', category: 'Legumes', name: 'Brócolis Cozido', calories: 34, protein: 2.8, carbs: 6.6, fat: 0.4, servingSize: '100g', micronutrients: { 'Cálcio': 47, 'Vitamina C': 89.2 } },
    { id: 'l3', category: 'Legumes', name: 'Chuchu Cozido', calories: 19, protein: 0.6, carbs: 4.5, fat: 0.1, servingSize: '100g', micronutrients: { 'Potássio': 125 } },
    { id: 'l4', category: 'Legumes', name: 'Abóbora Cabotiá Cozida', calories: 48, protein: 1.4, carbs: 12, fat: 0.1, servingSize: '100g', micronutrients: { 'Vitamina A': 426 } },
    { id: 'l5', category: 'Legumes', name: 'Beterraba Cozida', calories: 43, protein: 1.6, carbs: 9.6, fat: 0.2, servingSize: '100g', micronutrients: { 'Potássio': 325, 'Ferro': 0.8 } },
    { id: 'l6', category: 'Legumes', name: 'Mandioca Cozida', calories: 160, protein: 1.3, carbs: 38, fat: 0.3, servingSize: '100g', micronutrients: { 'Potássio': 271 } },
    { id: 'l7', category: 'Legumes', name: 'Batata Doce Cozida', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, servingSize: '100g', micronutrients: { 'Vitamina A': 709 } },

    // GRÃOS
    { id: 'g1', category: 'Grãos', name: 'Arroz Branco Cozido', calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, servingSize: '100g', micronutrients: { 'Magnésio': 12 } },
    { id: 'g2', category: 'Grãos', name: 'Feijão Carioca Cozido', calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, servingSize: '100g', micronutrients: { 'Ferro': 1.3, 'Potássio': 255 } },
    { id: 'g3', category: 'Grãos', name: 'Cuscuz de Milho', calories: 112, protein: 2.3, carbs: 25.1, fat: 0.2, servingSize: '100g' },
    { id: 'g4', category: 'Grãos', name: 'Aveia em Flocos', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, servingSize: '100g', micronutrients: { 'Magnésio': 177, 'Ferro': 4.7 } },
    { id: 'g5', category: 'Grãos', name: 'Grão de Bico Cozido', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, servingSize: '100g', micronutrients: { 'Ferro': 2.9, 'Magnésio': 48 } },
    { id: 'g6', category: 'Grãos', name: 'Lentilha Cozida', calories: 116, protein: 9, carbs: 20, fat: 0.4, servingSize: '100g', micronutrients: { 'Ferro': 3.3, 'Potássio': 369 } },

    // CARNES
    { id: 'c1', category: 'Carnes', name: 'Alcatra Grelhada', calories: 241, protein: 31.9, carbs: 0, fat: 11.6, servingSize: '100g', micronutrients: { 'Ferro': 2.5, 'Potássio': 350 } },
    { id: 'c2', category: 'Carnes', name: 'Filé de Frango Grelhado', calories: 159, protein: 32, carbs: 0, fat: 2.5, servingSize: '100g', micronutrients: { 'Magnésio': 28 } },
    { id: 'c3', category: 'Carnes', name: 'Tilápia Grelhada', calories: 96, protein: 20.1, carbs: 0, fat: 1.7, servingSize: '100g', micronutrients: { 'Potássio': 302 } },
    { id: 'c4', category: 'Carnes', name: 'Ovo de Galinha Cozido', calories: 155, protein: 13, carbs: 1.1, fat: 11, servingSize: '100g', micronutrients: { 'Cálcio': 50, 'Ferro': 1.2 } },
    { id: 'c5', category: 'Carnes', name: 'Patinho Grelhado', calories: 219, protein: 35.9, carbs: 0, fat: 7.3, servingSize: '100g', micronutrients: { 'Ferro': 3, 'Potássio': 380 } },
    { id: 'c6', category: 'Carnes', name: 'Lombo de Porco Grelhado', calories: 210, protein: 31, carbs: 0, fat: 8.8, servingSize: '100g', micronutrients: { 'Potássio': 420 } },

    // LATICÍNIOS
    { id: 'lat1', category: 'Laticínios', name: 'Leite Integral', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, servingSize: '100ml', micronutrients: { 'Cálcio': 125 } },
    { id: 'lat2', category: 'Laticínios', name: 'Queijo Minas Frescal', calories: 243, protein: 17.4, carbs: 3.2, fat: 17.9, servingSize: '100g', micronutrients: { 'Cálcio': 579 } },
    { id: 'lat3', category: 'Laticínios', name: 'Iogurte Natural', calories: 63, protein: 3.5, carbs: 5, fat: 3.3, servingSize: '100g', micronutrients: { 'Cálcio': 121 } },
    { id: 'lat4', category: 'Laticínios', name: 'Queijo Muçarela', calories: 280, protein: 22, carbs: 3, fat: 20, servingSize: '100g', micronutrients: { 'Cálcio': 730 } },
    { id: 'lat5', category: 'Laticínios', name: 'Requeijão Cremoso', calories: 257, protein: 9, carbs: 3.5, fat: 23, servingSize: '100g', micronutrients: { 'Cálcio': 250 } },

    // INDUSTRIALIZADOS
    { id: 'i1', category: 'Industrializados', name: 'Pão de Forma', calories: 265, protein: 8, carbs: 49, fat: 3.5, servingSize: '100g' },
    { id: 'i2', category: 'Industrializados', name: 'Bolacha Recheada', calories: 480, protein: 5, carbs: 68, fat: 21, servingSize: '100g' },
    { id: 'i3', category: 'Industrializados', name: 'Macarrão Instantâneo', calories: 450, protein: 9, carbs: 60, fat: 19, servingSize: '100g' },
    { id: 'i4', category: 'Industrializados', name: 'Maionese Tradicional', calories: 680, protein: 1, carbs: 1, fat: 75, servingSize: '100g' },
    { id: 'i5', category: 'Industrializados', name: 'Ketchup', calories: 110, protein: 1, carbs: 26, fat: 0.1, servingSize: '100g' },

    // FAST FOOD
    { id: 'ff1', category: 'Fast food', name: 'Hambúrguer Clássico', calories: 250, protein: 13, carbs: 30, fat: 9, servingSize: '100g' },
    { id: 'ff2', category: 'Fast food', name: 'Batata Frita', calories: 312, protein: 3.4, carbs: 41, fat: 15, servingSize: '100g', micronutrients: { 'Potássio': 579 } },
    { id: 'ff3', category: 'Fast food', name: 'Pizza de Mussarela', calories: 280, protein: 12, carbs: 33, fat: 11, servingSize: '100g' },
    { id: 'ff4', category: 'Fast food', name: 'Coxinha de Frango', calories: 283, protein: 8, carbs: 32, fat: 14, servingSize: '100g' },
    { id: 'ff5', category: 'Fast food', name: 'Pão de Queijo', calories: 350, protein: 6, carbs: 38, fat: 19, servingSize: '100g' },
    { id: 'ff6', category: 'Fast food', name: 'Pastel de Carne', calories: 310, protein: 10, carbs: 28, fat: 17, servingSize: '100g' },

    // BEBIDAS
    { id: 'b1', category: 'Bebidas', name: 'Suco de Laranja Natural', calories: 45, protein: 0.7, carbs: 10.4, fat: 0.2, servingSize: '100ml', micronutrients: { 'Vitamina C': 50 } },
    { id: 'b2', category: 'Bebidas', name: 'Refrigerante de Cola', calories: 42, protein: 0, carbs: 10.5, fat: 0, servingSize: '100ml' },
    { id: 'b3', category: 'Bebidas', name: 'Cerveja Pilsen', calories: 43, protein: 0.5, carbs: 3.5, fat: 0, servingSize: '100ml' },
    { id: 'b4', category: 'Bebidas', name: 'Café sem Açúcar', calories: 1, protein: 0.1, carbs: 0, fat: 0, servingSize: '100ml' },
    { id: 'b5', category: 'Bebidas', name: 'Água de Coco Natural', calories: 19, protein: 0.7, carbs: 3.7, fat: 0, servingSize: '100ml', micronutrients: { 'Potássio': 250, 'Magnésio': 25 } },
    { id: 'b6', category: 'Bebidas', name: 'Vinho Tinto Seco', calories: 85, protein: 0.1, carbs: 2.6, fat: 0, servingSize: '100ml' },
];
