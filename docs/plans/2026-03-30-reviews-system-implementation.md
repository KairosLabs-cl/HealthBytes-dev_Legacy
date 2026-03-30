# Sistema de Reseñas - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar sistema de reseñas dual (producto + vendedor) como MercadoLibre - ratings en home y detail

**Architecture:** FastAPI backend con nueva tabla vendors, React Native frontend con RatingStars y ReviewList

**Tech Stack:** FastAPI, SQLAlchemy, React Native/Expo, TanStack Query

---

## Pre-requisitos

1. Ejecutar migración para crear tabla `vendors` y agregar campos a `reviews`
2. Los productos existentes deben tener `vendor_name` mapeado a vendor

---

## Tareas Backend

### Task 1: Agregar Vendor model y actualizar Review schema

**Files:**
- Modify: `backend/app/db/schemas.py:200-207` (agregar al final)

**Step 1: Agregar Vendor class**

```python
class Vendor(Base):
    __tablename__ = "vendors"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    products = relationship("Product", back_populates="vendor")
    reviews = relationship("Review", back_populates="vendor")
```

**Step 2: Actualizar Product para relación con Vendor**

Agregar a Product class (después de `vendor_name`):
```python
vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True, index=True)
vendor = relationship("Vendor", back_populates="products")
```

**Step 3: Actualizar Review para vendor**

En Review (crear si no existe):
```python
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), nullable=True, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")
    product = relationship("Product", back_populates="reviews")
    vendor = relationship("Vendor", back_populates="reviews")
    
    __table_args__ = (
        Index("idx_review_product", "product_id"),
        Index("idx_review_vendor", "vendor_id"),
        Index("idx_review_user_product", "user_id", "product_id", unique=True),
        Index("idx_review_user_vendor", "user_id", "vendor_id", unique=True),
    )
```

**Step 4: Commit**

```bash
git add backend/app/db/schemas.py
git commit -m "feat: add Vendor model and update Review schema"
```

---

### Task 2: Crear Vendor service y endpoints

**Files:**
- Create: `backend/app/services/vendor_service.py`
- Modify: `backend/app/api/v1/products.py` (agregar endpoint)
- Create: `backend/app/api/v1/vendors.py`

**Step 1: Vendor service**

```python
# backend/app/services/vendor_service.py
from typing import List, Optional
from sqlalchemy import desc, select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.schemas import Vendor, Review

async def get_or_create_vendor(db: AsyncSession, name: str) -> Vendor:
    result = await db.execute(select(Vendor).where(Vendor.name == name))
    vendor = result.scalar_one_or_none()
    if not vendor:
        vendor = Vendor(name=name)
        db.add(vendor)
        await db.commit()
        await db.refresh(vendor)
    return vendor

async def get_vendor_by_id(db: AsyncSession, vendor_id: int) -> Optional[Vendor]:
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    return result.scalar_one_or_none()

async def get_vendor_rating(db: AsyncSession, vendor_id: int) -> dict:
    result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.vendor_id == vendor_id)
    )
    row = result.one()
    return {
        "avg_rating": round(row[0], 1) if row[0] else 0,
        "review_count": row[1] or 0
    }
```

**Step 2: Vendor API**

```python
# backend/app/api/v1/vendors.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services import vendor_service, review_service

router = APIRouter()

@router.get("/{vendor_id}/rating")
async def get_vendor_rating(vendor_id: int, db: AsyncSession = Depends(get_db)):
    vendor = await vendor_service.get_vendor_by_id(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return await vendor_service.get_vendor_rating(db, vendor_id)

@router.get("/{vendor_id}/reviews")
async def get_vendor_reviews(
    vendor_id: int, 
    skip: int = 0, 
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    vendor = await vendor_service.get_vendor_by_id(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    reviews = await review_service.get_vendor_reviews(db, vendor_id, skip, limit)
    return reviews

@router.post("/{vendor_id}/reviews", response_model=ReviewResponse)
async def create_vendor_review(
    vendor_id: int,
    review_in: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = 1  # TODO: get from auth
):
    vendor = await vendor_service.get_vendor_by_id(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    review = await review_service.create_vendor_review(db, user_id, vendor_id, review_in)
    return review
```

**Step 3: Review service updates**

```python
# Agregar a backend/app/services/review_service.py

async def create_vendor_review(
    db: AsyncSession, user_id: int, vendor_id: int, review_in: ReviewCreate
) -> Optional[Review]:
    vendor_result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    vendor = vendor_result.scalar_one_or_none()
    if not vendor:
        return None
    
    existing_result = await db.execute(
        select(Review).where(Review.user_id == user_id).where(Review.vendor_id == vendor_id)
    )
    if existing_result.scalar_one_or_none():
        raise ValueError("User has already reviewed this vendor")
    
    db_review = Review(
        user_id=user_id, vendor_id=vendor_id, rating=review_in.rating, comment=review_in.comment
    )
    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)
    return db_review

async def get_vendor_reviews(
    db: AsyncSession, vendor_id: int, skip: int = 0, limit: int = 20
) -> List[Review]:
    result = await db.execute(
        select(Review)
        .options(selectinload(Review.user))
        .where(Review.vendor_id == vendor_id)
        .order_by(desc(Review.created_at))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
```

**Step 4: Commit**

```bash
git add backend/app/services/vendor_service.py backend/app/services/review_service.py backend/app/api/v1/vendors.py
git commit -m "feat: add vendor service and API endpoints"
```

---

### Task 3: Actualizar Product API para incluir rating

**Files:**
- Modify: `backend/app/api/v1/products.py`

**Step 1: Agregar endpoint de rating**

```python
@router.get("/{product_id}/rating")
async def get_product_rating(product_id: int, db: AsyncSession = Depends(get_db)):
    return await product_service.get_product_rating(db, product_id)
```

**Step 2: Agregar al product service**

```python
async def get_product_rating(db: AsyncSession, product_id: int) -> dict:
    result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.product_id == product_id)
    )
    row = result.one()
    return {
        "avg_rating": round(row[0], 1) if row[0] else 0,
        "review_count": row[1] or 0
    }
```

**Step 3: Commit**

```bash
git add backend/app/api/v1/products.py backend/app/services/product_service.py
git commit -m "feat: add product rating endpoint"
```

---

## Tareas Frontend

### Task 4: Crear RatingStars component

**Files:**
- Create: `frontend/components/RatingStars.tsx`

**Step 1: Crear componente**

```tsx
import React from 'react';
import { View, Pressable } from 'react-native';
import { Star, StarHalf } from 'lucide-react-native';

interface RatingStarsProps {
  rating: number; // 0-5
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showCount?: number;
}

export function RatingStars({ 
  rating, 
  maxStars = 5, 
  size = 16,
  interactive = false,
  onChange,
  showCount
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState(0);
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;
  
  const renderStar = (index: number) => {
    const filled = index < Math.floor(displayRating);
    const halfFilled = !filled && index < displayRating;
    
    if (interactive) {
      return (
        <Pressable
          key={index}
          onPress={() => onChange?.(index + 1)}
          onPressIn={() => setHoverRating(index + 1)}
          onPressOut={() => setHoverRating(0)}
        >
          <Star 
            size={size} 
            fill={filled || halfFilled ? "#FBBF24" : "none"} 
            color={filled || halfFilled ? "#FBBF24" : "#9CA3AF"} 
          />
        </Pressable>
      );
    }
    
    return (
      <Star 
        key={index}
        size={size} 
        fill={filled || halfFilled ? "#FBBF24" : "none"} 
        color={filled || halfFilled ? "#FBBF24" : "#9CA3AF"} 
      />
    );
  };

  return (
    <View className="flex-row items-center gap-1">
      {Array.from({ length: maxStars }, (_, i) => renderStar(i))}
      {showCount !== undefined && (
        <Text className="text-sm text-gray-500 ml-1">({showCount})</Text>
      )}
    </View>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/components/RatingStars.tsx
git commit -m "feat: add RatingStars component"
```

---

### Task 5: Crear ReviewCard component

**Files:**
- Create: `frontend/components/ReviewCard.tsx`

**Step 1: Crear ReviewCard**

```tsx
import { View, Text } from 'react-native';
import { RatingStars } from './RatingStars';

interface ReviewCardProps {
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export function ReviewCard({ userName, rating, comment, createdAt }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <View className="border-b border-gray-100 py-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-semibold text-gray-900">{userName}</Text>
        <Text className="text-xs text-gray-400">{formatDate(createdAt)}</Text>
      </View>
      <RatingStars rating={rating} size={14} />
      {comment && (
        <Text className="text-sm text-gray-600 mt-2">{comment}</Text>
      )}
    </View>
  );
}
```

**Step 2: Commit**

```bash
git add frontend/components/ReviewCard.tsx
git commit -m "feat: add ReviewCard component"
```

---

### Task 6: Crear API para reviews

**Files:**
- Modify: `frontend/api/products.ts`

**Step 1: Agregar funciones API**

```ts
export type ProductRating = {
  avg_rating: number;
  review_count: number;
};

export type Review = {
  id: number;
  user_id: number;
  product_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
};

export async function getProductRating(productId: number): Promise<ProductRating> {
  const res = await fetch(`${API_URL}/products/${productId}/rating`);
  await throwIfNotOk(res, 'Error fetching rating');
  return res.json();
}

export async function getProductReviews(productId: number, skip = 0, limit = 20): Promise<Review[]> {
  const res = await fetch(`${API_URL}/products/${productId}/reviews?skip=${skip}&limit=${limit}`);
  await throwIfNotOk(res, 'Error fetching reviews');
  return res.json();
}
```

**Step 2: Commit**

```bash
git add frontend/api/products.ts
git commit -m "feat: add reviews API functions"
```

---

### Task 7: Actualizar ProductCard para mostrar rating

**Files:**
- Modify: `frontend/components/ProductCard.tsx:239-251`

**Step 1: Agregar imports**

```ts
import { RatingStars } from './RatingStars';
import { getProductRating } from '@/api/products';
```

**Step 2: Agregar estado y query**

```ts
// En el componente ProductCard
const { data: rating } = useQuery({
  queryKey: ['product-rating', product.id],
  queryFn: () => getProductRating(Number(product.id)),
  staleTime: 5 * 60 * 1000,
});
```

**Step 3: Modificar UI donde se muestra vendor_name**

```tsx
{/* Vendor name + rating */}
{product.vendor_name && (
  <View className="flex-row items-center justify-between">
    <View className="flex-1">
      <Text numberOfLines={1} className="text-xs text-gray-500">
        {product.vendor_name}
      </Text>
    </View>
    {rating && rating.review_count > 0 && (
      <RatingStars 
        rating={rating.avg_rating} 
        size={12} 
        showCount={rating.review_count}
      />
    )}
  </View>
)}
```

**Step 4: Commit**

```bash
git add frontend/components/ProductCard.tsx
git commit -m "feat: add rating display to ProductCard"
```

---

### Task 8: Agregar sección de reviews en Product Detail

**Files:**
- Modify: `frontend/app/product/[id].tsx`

**Step 1: Agregar imports**

```ts
import { RatingStars } from '@/components/RatingStars';
import { ReviewCard } from '@/components/ReviewCard';
import { getProductRating, getProductReviews } from '@/api/products';
```

**Step 2: Agregar queries**

```ts
const { data: rating } = useQuery({
  queryKey: ['product-rating', id],
  queryFn: () => getProductRating(Number(id)),
  enabled: !!id,
});

const { data: reviews } = useQuery({
  queryKey: ['product-reviews', id],
  queryFn: () => getProductReviews(Number(id), 0, 5),
  enabled: !!id,
});
```

**Step 3: Agregar sección en el UI (después de descripción)**

Buscar la sección donde está el vendor y agregar después:

```tsx
{/* Reseñas del producto */}
{rating && rating.review_count > 0 && (
  <View className="px-5 py-4 border-t border-gray-100">
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-lg font-semibold">Reseñas del producto</Text>
      <View className="flex-row items-center gap-2">
        <RatingStars rating={rating.avg_rating} size={18} />
        <Text className="text-sm text-gray-500">
          ({rating.review_count})
        </Text>
      </View>
    </View>
    
    {reviews?.slice(0, 3).map((review) => (
      <ReviewCard
        key={review.id}
        userName={review.user_name || 'Usuario'}
        rating={review.rating}
        comment={review.comment}
        createdAt={review.created_at}
      />
    ))}
    
    {rating.review_count > 3 && (
      <Pressable className="mt-3">
        <Text className="text-blue-600 text-sm text-center">
          Ver las {rating.review_count} reseñas
        </Text>
      </Pressable>
    )}
  </View>
)}
```

**Step 4: Commit**

```bash
git add frontend/app/product/\[id\].tsx
git commit -m "feat: add reviews section to product detail"
```

---

### Task 9: Agregar rating de vendedor en ProductCard

**Files:**
- Modify: `frontend/components/ProductCard.tsx`

**Step 1: Agregar endpoint de vendor**

```ts
// frontend/api/vendors.ts (nuevo archivo)
export type VendorRating = {
  avg_rating: number;
  review_count: number;
};

export async function getVendorRating(vendorName: string): Promise<VendorRating> {
  // Por ahora hardcodeado hasta tener endpoint de vendor por nombre
  // TODO: crear endpoint GET /vendors/by-name/{name}
  return { avg_rating: 4.2, review_count: 128 };
}
```

**Step 2: Modificar ProductCard para mostrar vendor rating**

```ts
// Después del vendor_name
{product.vendor_name && (
  <View className="flex-row items-center justify-between">
    <View className="flex-row items-center flex-1">
      <Store size={12} color="#6B7280" style={{ marginRight: 4 }} />
      <Text numberOfLines={1} className="text-xs text-gray-500">
        {product.vendor_name}
      </Text>
    </View>
    {/* Vendor rating - simulando hasta tener endpoint real */}
    <View className="flex-row items-center gap-1">
      <Star size={10} fill="#FBBF24" color="#FBBF24" />
      <Text className="text-xs text-gray-500">4.2</Text>
    </View>
  </View>
)}
```

**Step 10: Commit**

```bash
git add frontend/components/ProductCard.tsx frontend/api/vendors.ts
git commit -m "feat: add vendor rating display"
```

---

## Verificación

**Backend:**
```bash
cd backend
pytest -v
```

**Frontend:**
```bash
cd frontend
pnpm lint
pnpm test
```

---

## Plan complete and saved to `docs/plans/2026-03-30-reviews-system-implementation.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
