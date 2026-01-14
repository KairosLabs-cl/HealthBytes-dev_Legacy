"""
Script para insertar productos de prueba en la base de datos
Productos diseñados para personas con enfermedades metabólicas

Uso:
    python seed_products.py
"""
import sys
import asyncio
import selectors
from pathlib import Path

# Fix para Windows - psycopg requiere SelectorEventLoop
if sys.platform == "win32":
    # Usar SelectorEventLoop en lugar de ProactorEventLoop para psycopg
    selector = selectors.SelectSelector()
    loop = asyncio.SelectorEventLoop(selector)
    asyncio.set_event_loop(loop)

from sqlalchemy import select
from app.db.database import AsyncSessionLocal, engine
from app.db.schemas import Product, Base


# Productos para enfermedades metabólicas
PRODUCTS_DATA = [
    # Suplementos y Vitaminas
    {
        "name": "Vitamina D3 2000 UI",
        "description": "Suplemento de vitamina D3 de alta potencia. Esencial para la salud ósea y el sistema inmunológico. Ideal para personas con resistencia a la insulina.",
        "image": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop",
        "price": 22990
    },
    {
        "name": "Omega-3 Premium",
        "description": "Aceite de pescado rico en EPA y DHA. Ayuda a reducir la inflamación y mejorar el perfil lipídico en pacientes con síndrome metabólico.",
        "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop",
        "price": 29990
    },
    {
        "name": "Magnesio Quelado",
        "description": "Magnesio de alta absorción. Fundamental para el metabolismo de la glucosa y la sensibilidad a la insulina.",
        "image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop",
        "price": 16990
    },
    {
        "name": "Cromo Picolinato",
        "description": "Suplemento de cromo que ayuda a mejorar la sensibilidad a la insulina y el control glucémico.",
        "image": "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&h=500&fit=crop",
        "price": 14490
    },
    {
        "name": "Ácido Alfa Lipoico",
        "description": "Antioxidante potente que ayuda a mejorar la sensibilidad a la insulina y reducir el estrés oxidativo en diabetes tipo 2.",
        "image": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop",
        "price": 25990
    },
    # Alimentos sin azúcar y bajos en carbohidratos
    {
        "name": "Harina de Almendra",
        "description": "Harina sin gluten y baja en carbohidratos. Ideal para personas con diabetes y resistencia a la insulina. 500g.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop",
        "price": 11990
    },
    {
        "name": "Eritritol Natural",
        "description": "Endulzante natural sin calorías y sin impacto en la glucosa. Perfecto para diabéticos. 500g.",
        "image": "https://images.unsplash.com/photo-1611859266236-9a0e3c4c4c4c?w=500&h=500&fit=crop",
        "price": 8990
    },
    {
        "name": "Stevia Líquida Premium",
        "description": "Endulzante natural 100% stevia, sin calorías ni carbohidratos. Ideal para control glucémico.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop",
        "price": 10490
    },
    {
        "name": "Pasta de Konjac",
        "description": "Pasta sin carbohidratos y sin calorías. Ideal para dietas bajas en carbohidratos y control de peso.",
        "image": "https://images.unsplash.com/photo-1551462147-8589703c1c44?w=500&h=500&fit=crop",
        "price": 7990
    },
    {
        "name": "Pan Keto Sin Gluten",
        "description": "Pan bajo en carbohidratos, alto en fibra y proteína. Sin azúcar añadido. 400g.",
        "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop",
        "price": 6990
    },
    # Productos ricos en fibra
    {
        "name": "Semillas de Chía Orgánicas",
        "description": "Ricas en fibra soluble, omega-3 y proteína. Ayudan a controlar la glucosa y el apetito. 500g.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop",
        "price": 9990
    },
    {
        "name": "Psyllium Husk",
        "description": "Fibra soluble de alta calidad. Ayuda a regular la glucosa y el colesterol. 500g.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop",
        "price": 11990
    },
    {
        "name": "Linaza Molida",
        "description": "Rica en fibra y ácidos grasos omega-3. Beneficiosa para el control metabólico. 500g.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop",
        "price": 8990
    },
    {
        "name": "Avena Sin Gluten",
        "description": "Avena pura sin gluten, rica en beta-glucanos que ayudan a controlar la glucosa. 1kg.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop",
        "price": 6490
    },
    # Proteínas y snacks saludables
    {
        "name": "Proteína en Polvo Sin Azúcar",
        "description": "Proteína de suero aislada sin azúcar añadido. Ideal para mantener masa muscular en dietas restrictivas. 1kg.",
        "image": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop",
        "price": 32990
    },
    {
        "name": "Barritas Proteicas Keto",
        "description": "Barritas bajas en carbohidratos, altas en proteína y fibra. Sin azúcar. Pack de 12 unidades.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop",
        "price": 16990
    },
    {
        "name": "Nueces Mixtas Sin Sal",
        "description": "Mezcla de nueces, almendras y pistachos. Rico en grasas saludables y proteína. 500g.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop",
        "price": 14990
    },
    {
        "name": "Mantequilla de Maní Natural",
        "description": "Mantequilla de maní 100% natural sin azúcar añadido. Alta en proteína y grasas saludables. 500g.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop",
        "price": 8490
    },
    # Bebidas y tés
    {
        "name": "Té Verde Matcha Orgánico",
        "description": "Té verde rico en antioxidantes. Ayuda a mejorar el metabolismo y la sensibilidad a la insulina. 100g.",
        "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=500&fit=crop",
        "price": 18990
    },
    {
        "name": "Café Verde en Grano",
        "description": "Café verde sin tostar. Contiene ácido clorogénico que ayuda a regular la glucosa. 500g.",
        "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop",
        "price": 20990
    },
    {
        "name": "Té de Canela y Cúrcuma",
        "description": "Mezcla de hierbas que ayuda a mejorar la sensibilidad a la insulina y reducir la inflamación. 50 bolsitas.",
        "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&h=500&fit=crop",
        "price": 11490
    },
    # Aceites y grasas saludables
    {
        "name": "Aceite de Coco Virgen",
        "description": "Aceite de coco extra virgen, rico en triglicéridos de cadena media. Ideal para dietas cetogénicas. 500ml.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop",
        "price": 13490
    },
    {
        "name": "Aceite de Oliva Extra Virgen",
        "description": "Aceite de oliva de primera prensada en frío. Rico en ácidos grasos monoinsaturados. 500ml.",
        "image": "https://images.unsplash.com/photo-1474979266404-7ea0b0c8c8b8?w=500&h=500&fit=crop",
        "price": 16990
    },
    {
        "name": "Mantequilla Clarificada (Ghee)",
        "description": "Ghee puro sin lactosa. Ideal para dietas cetogénicas y personas con sensibilidad a la lactosa. 500g.",
        "image": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=500&fit=crop",
        "price": 15490
    },
    # Productos especializados
    {
        "name": "Monitoreo de Glucosa Avanzado",
        "description": "Sistema de monitoreo continuo de glucosa con aplicación móvil. Incluye sensores para 14 días.",
        "image": "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=500&fit=crop",
        "price": 80990
    },
    {
        "name": "Kit de Pruebas Metabólicas en Casa",
        "description": "Kit completo para medir glucosa, colesterol y triglicéridos en casa. Incluye tiras reactivas.",
        "image": "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=500&fit=crop",
        "price": 41990
    },
]


async def seed_products(clear_existing: bool = False):
    """
    Inserta productos de prueba en la base de datos
    
    Args:
        clear_existing: Si es True, elimina todos los productos existentes antes de insertar
    """
    print("=" * 70)
    print("HealthBytes - Seed de Productos para Enfermedades Metabólicas")
    print("=" * 70)
    
    async with AsyncSessionLocal() as session:
        try:
            # Verificar productos existentes
            result = await session.execute(select(Product))
            existing_products = result.scalars().all()
            existing_count = len(existing_products)
            
            print(f"\nProductos existentes en la base de datos: {existing_count}")
            
            if clear_existing and existing_count > 0:
                print("\n[!] Eliminando productos existentes...")
                for product in existing_products:
                    await session.delete(product)
                await session.commit()
                print("[OK] Productos eliminados")
            
            # Insertar nuevos productos
            print(f"\n[INFO] Insertando {len(PRODUCTS_DATA)} productos...")
            
            inserted_count = 0
            skipped_count = 0
            
            for product_data in PRODUCTS_DATA:
                # Verificar si el producto ya existe (por nombre)
                result = await session.execute(
                    select(Product).where(Product.name == product_data["name"])
                )
                existing = result.scalar_one_or_none()
                
                if existing:
                    print(f"  [SKIP] Saltando: {product_data['name']} (ya existe)")
                    skipped_count += 1
                    continue
                
                product = Product(**product_data)
                session.add(product)
                inserted_count += 1
                print(f"  [OK] {product_data['name']}")
            
            await session.commit()
            
            print("\n" + "=" * 70)
            print(f"[OK] Proceso completado:")
            print(f"   - Productos insertados: {inserted_count}")
            print(f"   - Productos omitidos: {skipped_count}")
            print(f"   - Total en base de datos: {existing_count - (existing_count if clear_existing else 0) + inserted_count}")
            print("=" * 70)
            
        except Exception as e:
            await session.rollback()
            print(f"\n[ERROR] Error al insertar productos: {str(e)}")
            raise


async def main():
    """Función principal"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Insertar productos de prueba para enfermedades metabólicas"
    )
    parser.add_argument(
        "--clear",
        action="store_true",
        help="Eliminar todos los productos existentes antes de insertar"
    )
    
    args = parser.parse_args()
    
    try:
        await seed_products(clear_existing=args.clear)
    except Exception as e:
        print(f"\n[ERROR] Error fatal: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    # En Windows, usar el loop que ya configuramos
    if sys.platform == "win32":
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())
    else:
        asyncio.run(main())
