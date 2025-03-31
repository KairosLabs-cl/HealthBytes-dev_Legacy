import React from 'react';
import { StyleSheet, ScrollView, Pressable, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

type Category = {
  id: string;
  name: string;
};

type CategoryButtonsProps = {
  categories: Category[];
  selectedCategoryId?: string;
  onCategoryPress: (categoryId: string) => void;
};

export function CategoryButtons({
  categories,
  selectedCategoryId = 'all',
  onCategoryPress,
}: CategoryButtonsProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  
  // Añadir información de depuración
  console.log("CategoryButtons - categories:", categories);
  console.log("CategoryButtons - selectedCategoryId:", selectedCategoryId);
  
  // Verificar si hay categorías para mostrar
  if (!categories || categories.length === 0) {
    console.warn("No hay categorías para mostrar");
    return (
      <Text style={{padding: 10, color: 'red'}}>
        Error: No hay categorías disponibles
      </Text>
    );
  }
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        // Asegurarse de que category tenga id y name válidos
        if (!category || !category.id || !category.name) {
          console.warn("Categoría inválida detectada:", category);
          return null;
        }
        
        const isSelected = selectedCategoryId === category.id;
        
        return (
          <Pressable
            key={category.id}
            style={[
              styles.categoryButton,
              isSelected ? styles.selectedButton : styles.unselectedButton,
              { 
                borderColor: isSelected ? primaryColor : '#E0E0E0',
                backgroundColor: isSelected ? primaryColor : backgroundColor === '#fff' ? '#F5F5F5' : '#333'
              }
            ]}
            onPress={() => onCategoryPress(category.id)}
          >
            <Text
              style={[
                styles.categoryText, 
                isSelected && styles.selectedText,
                {color: isSelected ? '#FFFFFF' : textColor}
              ]}
            >
              {category.name || `Category ${category.id}`}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  unselectedButton: {
    borderColor: '#E0E0E0',
  },
  selectedButton: {
    backgroundColor: '#663399', // Usar el primaryColor
    borderColor: '#663399',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});