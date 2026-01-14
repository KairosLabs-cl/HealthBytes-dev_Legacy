-- HealthBytes - Productos de Prueba para Enfermedades Metabólicas
-- Ejecutar este script en el SQL Editor de Supabase
-- Inserta 25 productos diseñados para personas con enfermedades metabólicas

-- Limpiar productos existentes (opcional - descomentar si quieres empezar desde cero)
-- DELETE FROM products;

-- Insertar productos para enfermedades metabólicas
-- Precios en pesos chilenos (CLP)
INSERT INTO products (name, description, image, price) VALUES

-- Suplementos y Vitaminas
('Vitamina D3 2000 UI', 'Suplemento de vitamina D3 de alta potencia. Esencial para la salud ósea y el sistema inmunológico. Ideal para personas con resistencia a la insulina.', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop', 22990),
('Omega-3 Premium', 'Aceite de pescado rico en EPA y DHA. Ayuda a reducir la inflamación y mejorar el perfil lipídico en pacientes con síndrome metabólico.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop', 29990),
('Magnesio Quelado', 'Magnesio de alta absorción. Fundamental para el metabolismo de la glucosa y la sensibilidad a la insulina.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop', 16990),
('Cromo Picolinato', 'Suplemento de cromo que ayuda a mejorar la sensibilidad a la insulina y el control glucémico.', 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&h=500&fit=crop', 14490),
('Ácido Alfa Lipoico', 'Antioxidante potente que ayuda a mejorar la sensibilidad a la insulina y reducir el estrés oxidativo en diabetes tipo 2.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop', 25990),

-- Alimentos sin azúcar y bajos en carbohidratos
('Harina de Almendra', 'Harina sin gluten y baja en carbohidratos. Ideal para personas con diabetes y resistencia a la insulina. 500g.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop', 11990),
('Eritritol Natural', 'Endulzante natural sin calorías y sin impacto en la glucosa. Perfecto para diabéticos. 500g.', 'https://images.unsplash.com/photo-1611859266236-9a0e3c4c4c4c?w=500&h=500&fit=crop', 8990),
('Stevia Líquida Premium', 'Endulzante natural 100% stevia, sin calorías ni carbohidratos. Ideal para control glucémico.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop', 10490),
('Pasta de Konjac', 'Pasta sin carbohidratos y sin calorías. Ideal para dietas bajas en carbohidratos y control de peso.', 'https://images.unsplash.com/photo-1551462147-8589703c1c44?w=500&h=500&fit=crop', 7990),
('Pan Keto Sin Gluten', 'Pan bajo en carbohidratos, alto en fibra y proteína. Sin azúcar añadido. 400g.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop', 6990),

-- Productos ricos en fibra
('Semillas de Chía Orgánicas', 'Ricas en fibra soluble, omega-3 y proteína. Ayudan a controlar la glucosa y el apetito. 500g.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop', 9990),
('Psyllium Husk', 'Fibra soluble de alta calidad. Ayuda a regular la glucosa y el colesterol. 500g.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop', 11990),
('Linaza Molida', 'Rica en fibra y ácidos grasos omega-3. Beneficiosa para el control metabólico. 500g.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop', 8990),
('Avena Sin Gluten', 'Avena pura sin gluten, rica en beta-glucanos que ayudan a controlar la glucosa. 1kg.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop', 6490),

-- Proteínas y snacks saludables
('Proteína en Polvo Sin Azúcar', 'Proteína de suero aislada sin azúcar añadido. Ideal para mantener masa muscular en dietas restrictivas. 1kg.', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop', 32990),
('Barritas Proteicas Keto', 'Barritas bajas en carbohidratos, altas en proteína y fibra. Sin azúcar. Pack de 12 unidades.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop', 16990),
('Nueces Mixtas Sin Sal', 'Mezcla de nueces, almendras y pistachos. Rico en grasas saludables y proteína. 500g.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop', 14990),
('Mantequilla de Maní Natural', 'Mantequilla de maní 100% natural sin azúcar añadido. Alta en proteína y grasas saludables. 500g.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop', 8490),

-- Bebidas y tés
('Té Verde Matcha Orgánico', 'Té verde rico en antioxidantes. Ayuda a mejorar el metabolismo y la sensibilidad a la insulina. 100g.', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=500&fit=crop', 18990),
('Café Verde en Grano', 'Café verde sin tostar. Contiene ácido clorogénico que ayuda a regular la glucosa. 500g.', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop', 20990),
('Té de Canela y Cúrcuma', 'Mezcla de hierbas que ayuda a mejorar la sensibilidad a la insulina y reducir la inflamación. 50 bolsitas.', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=500&fit=crop', 11490),

-- Aceites y grasas saludables
('Aceite de Coco Virgen', 'Aceite de coco extra virgen, rico en triglicéridos de cadena media. Ideal para dietas cetogénicas. 500ml.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop', 13490),
('Aceite de Oliva Extra Virgen', 'Aceite de oliva de primera prensada en frío. Rico en ácidos grasos monoinsaturados. 500ml.', 'https://images.unsplash.com/photo-1474979266404-7ea0b0c8c8b8?w=500&h=500&fit=crop', 16990),
('Mantequilla Clarificada (Ghee)', 'Ghee puro sin lactosa. Ideal para dietas cetogénicas y personas con sensibilidad a la lactosa. 500g.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop', 15490),

-- Productos especializados
('Monitoreo de Glucosa Avanzado', 'Sistema de monitoreo continuo de glucosa con aplicación móvil. Incluye sensores para 14 días.', 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=500&fit=crop', 80990),
('Kit de Pruebas Metabólicas en Casa', 'Kit completo para medir glucosa, colesterol y triglicéridos en casa. Incluye tiras reactivas.', 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=500&fit=crop', 41990);

-- Verificar inserción
-- SELECT COUNT(*) as total_productos FROM products;
-- SELECT * FROM products ORDER BY id;
