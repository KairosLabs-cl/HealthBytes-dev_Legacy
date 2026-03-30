# Sistema de Reseñas - Diseño

> **For Claude:** Use brainstorming skill before implementation.

**Goal:** Implementar sistema de reseñas dual (producto + vendedor) como MercadoLibre

**Architecture:** Sistema dual de reseñas integrado en Producto y Vendedor, con componentes UI en detail y home

**Tech Stack:** FastAPI (backend), React Native/Expo (frontend), Supabase (DB)

---

## 1. Modelo de Datos

### Tabla: `reviews` (existente pero incompleta)

```python
# backend/app/db/schemas.py - agregar campos faltantes
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)  # nullable para reseñas de vendedor
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)    # nullable para reseñas de producto
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relaciones
    user = relationship("User")
    product = relationship("Product")
    vendor = relationship("Vendor")

# Nueva tabla vendors
class Vendor(Base):
    __tablename__ = "vendors"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relaciones
    products = relationship("Product", back_populates="vendor")
    reviews = relationship("Review", back_populates="vendor")
```

### Schema API

```python
# backend/app/schemas/review.py
class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=500)
    
class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: Optional[int]
    vendor_id: Optional[int]
    rating: int
    comment: Optional[str]
    created_at: datetime
    user_name: str  # joins con users
    
    model_config = ConfigDict(from_attributes=True)
```

---

## 2. API Endpoints

### Reseñas de Producto
- `GET /products/{id}/reviews` - lista reseñas (paginado)
- `POST /products/{id}/reviews` - crear reseña (solo compradores)
- `GET /products/{id}` - agregar `avg_rating`, `review_count`

### Reseñas de Vendedor
- `GET /vendors/{id}/reviews` - lista reseñas (paginado)
- `POST /vendors/{id}/reviews` - crear reseña
- `GET /vendors/{id}` - obtener info vendedor (nuevo endpoint)

### Helper
- `GET /products/{id}/rating` - retorna `{avg_rating, review_count}`

---

## 3. Componentes Frontend

### Componentes nuevos
- `RatingStars.tsx` - estrellas (lectura + selección)
- `ReviewCard.tsx` - tarjeta de reseña
- `ProductReviews.tsx` - sección en detail producto
- `VendorRating.tsx` - rating del vendedor

### Modificaciones
- `ProductCard.tsx` - agregar estrellas de producto
- `product/[id].tsx` - agregar sección reseñas
- `api/products.ts` - agregar fetching de reviews

---

## 4. UI/UX

### Detail Producto
```
┌─────────────────────────────┐
│ [Imagen producto]          │
├─────────────────────────────┤
│ ★★★★☆ (4.2) 128 reseñas    │ ← Promedio + count
├─────────────────────────────┤
│ [Descripción]              │
├─────────────────────────────┤
│ Reseñas de compradores     │
│ ┌─────────────────────────┐ │
│ │ Juan ★★★★☆              │ │
│ │ "Excelente producto..." │ │
│ │ hace 2 días              │ │
│ └─────────────────────────┘ │
│ [Ver más reseñas]           │
└─────────────────────────────┘
```

### Home / ProductCard
```
┌─────────────────────────┐
│ [Imagen]                │
├─────────────────────────┤
│ $1,299                  │
│ ★★★★☆ (42)   Vendedor  │ ← rating producto + vendedor
│ [Nombre producto]       │
│ [Nombre vendor]         │
└─────────────────────────┘
```

---

## 5. Validaciones

- Solo usuarios autenticados pueden reseñar
- Solo usuarios que compraron el producto pueden reseñar producto
- Una reseña por usuario por producto/vendedor
- Rating 1-5 obligatorio, comentario opcional
- Vendedor puede tener promedio sin compras

---

## 6. Pendientes (Scope futuro)
- Responder a reseñas (vendedor)
- Subir fotos en reseñas
- Reseñas verificadas ("Compra verificada")
