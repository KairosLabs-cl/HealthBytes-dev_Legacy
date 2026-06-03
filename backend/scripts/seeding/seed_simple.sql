-- Simple SQL seed - search_vector is populated by trigger
INSERT INTO products (name, description, image, price, stock) VALUES
('Harina de Almendra', 'Harina de almendra sin gluten. Perfecta para repostería y cocina saludable.', 'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=500&auto=format&fit=crop', 12.99, 50),
('Pasta Sin Gluten', 'Pasta de trigo sarraceno sin gluten. Apta para celíacos.', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&auto=format&fit=crop', 49.90, 100),
('Leche de Almendra', 'Bebida vegetal de almendra sin lactosa. 1 litro.', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop', 34.90, 75),
('Pan Sin Gluten', 'Pan artesanal sin gluten, hecho con ingredientes naturales.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop', 59.90, 30),
('Chocolate Negro 85%', 'Chocolate sin lácteos, apto para intolerantes.', 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&auto=format&fit=crop', 39.90, 60),
('Snack de Quinua', 'Barras de quinua sin azúcar. Paquete de 5 unidades.', 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop', 79.90, 45),
('Aceite de Coco Virgen', 'Aceite de coco orgánico prensado en frío. 500ml.', 'https://images.unsplash.com/photo-1588413333412-82148535db53?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 149.90, 40),
('Miel Orgánica', 'Miel pura sin procesar. Ideal para diabéticos (fructosa natural).', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500&auto=format&fit=crop', 89.90, 35)
ON CONFLICT DO NOTHING;
