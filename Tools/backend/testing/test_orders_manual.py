"""
Script de prueba manual para verificar endpoints de órdenes
Ejecutar: python test_orders_manual.py
"""

import json
from datetime import datetime

import requests

BASE_URL = "http://127.0.0.1:3001"

# Token de prueba (reemplazar con token real si es necesario)
# Este es un token de desarrollo - en producción usar token real
TEST_TOKEN = "your-secret"  # Token JWT de desarrollo


def test_list_orders():
    """Probar GET /orders - debe retornar items con precios"""
    print("\n" + "=" * 60)
    print("🧪 TEST 1: GET /orders")
    print("=" * 60)

    headers = {"Authorization": f"Bearer {TEST_TOKEN}", "Content-Type": "application/json"}

    try:
        response = requests.get(f"{BASE_URL}/orders", headers=headers, timeout=5)
        print(f"📡 Status Code: {response.status_code}")

        if response.status_code == 200:
            orders = response.json()
            print(f"✅ Respuesta exitosa")
            print(f"📦 Total órdenes: {len(orders)}")

            if orders:
                # Verificar primera orden
                first_order = orders[0]
                print(f"\n📋 Primera orden:")
                print(f"   - ID: {first_order.get('id')}")
                print(f"   - Status: {first_order.get('status')}")
                print(f"   - Created: {first_order.get('created_at')}")
                print(f"   - Items: {len(first_order.get('items', []))}")

                # Verificar que items tengan precios
                items = first_order.get("items", [])
                if items:
                    print(f"\n   📦 Items:")
                    total = 0
                    for item in items:
                        price = item.get("price", 0)
                        qty = item.get("quantity", 0)
                        subtotal = price * qty
                        total += subtotal
                        print(
                            f"      - Product {item.get('product_id')}: ${price:.2f} x {qty} = ${subtotal:.2f}"
                        )

                    print(f"\n   💰 Total: ${total:.2f}")

                    if total > 0:
                        print(f"   ✅ Precios OK - Items tienen precios correctos")
                    else:
                        print(f"   ❌ ERROR - Items no tienen precios")
                else:
                    print(f"   ⚠️  Orden sin items")
            else:
                print(f"ℹ️  No hay órdenes (esto es OK si el usuario no tiene órdenes)")

        elif response.status_code == 401:
            print(f"⚠️  No autenticado - necesitas un token válido")
            print(f"   Respuesta: {response.text}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Respuesta: {response.text}")

    except requests.exceptions.ConnectionError:
        print(f"❌ ERROR: No se puede conectar al backend")
        print(f"   Verifica que el servidor esté corriendo en http://127.0.0.1:3001")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")


def test_get_order_by_id():
    """Probar GET /orders/{id}"""
    print("\n" + "=" * 60)
    print("🧪 TEST 2: GET /orders/{id}")
    print("=" * 60)

    order_id = 1  # Cambiar por ID real si es necesario
    headers = {"Authorization": f"Bearer {TEST_TOKEN}", "Content-Type": "application/json"}

    try:
        response = requests.get(f"{BASE_URL}/orders/{order_id}", headers=headers, timeout=5)
        print(f"📡 Status Code: {response.status_code}")

        if response.status_code == 200:
            order = response.json()
            print(f"✅ Respuesta exitosa")
            print(f"\n📋 Orden #{order.get('id')}:")
            print(f"   - Status: {order.get('status')}")
            print(f"   - User ID: {order.get('user_id')}")
            print(f"   - Created: {order.get('created_at')}")
            print(f"   - Items: {len(order.get('items', []))}")

            # Verificar items
            items = order.get("items", [])
            if items:
                print(f"\n   📦 Items con precios:")
                total = 0
                for item in items:
                    price = item.get("price", 0)
                    qty = item.get("quantity", 0)
                    subtotal = price * qty
                    total += subtotal
                    print(
                        f"      - Product {item.get('product_id')}: ${price:.2f} x {qty} = ${subtotal:.2f}"
                    )

                print(f"\n   💰 Total: ${total:.2f}")
                print(f"   ✅ Endpoint GET /orders/{{id}} funciona correctamente")
            else:
                print(f"   ⚠️  Orden sin items")

        elif response.status_code == 404:
            print(f"ℹ️  Orden #{order_id} no encontrada (prueba con otro ID)")
        elif response.status_code == 401:
            print(f"⚠️  No autenticado - necesitas un token válido")
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"   Respuesta: {response.text}")

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")


def test_backend_health():
    """Verificar que el backend esté activo"""
    print("\n" + "=" * 60)
    print("🏥 HEALTH CHECK")
    print("=" * 60)

    try:
        # Probar endpoint de docs
        response = requests.get(f"http://127.0.0.1:3001/docs", timeout=5)
        if response.status_code == 200:
            print("✅ Backend activo y respondiendo")
            print(f"📍 URL: http://127.0.0.1:3001")
            print(f"📚 Docs: http://127.0.0.1:3001/docs")
            return True
        else:
            print(f"⚠️  Backend responde pero con error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend no está corriendo o no responde")
        print(f"   Error: {str(e)}")
        return False


def main():
    print("\n" + "🚀 " * 20)
    print("PRUEBAS MANUALES DEL SISTEMA DE ÓRDENES")
    print("🚀 " * 20)

    # Health check primero
    if not test_backend_health():
        print("\n❌ No se puede continuar - backend no está disponible")
        print("   Ejecuta: cd backend && .\\start.ps1")
        return

    # Probar endpoints
    test_list_orders()
    test_get_order_by_id()

    print("\n" + "=" * 60)
    print("✨ PRUEBAS COMPLETADAS")
    print("=" * 60)
    print("\n💡 Para pruebas con token real:")
    print("   1. Obtén un token de Clerk desde el frontend")
    print("   2. Reemplaza TEST_TOKEN en este script")
    print("   3. Vuelve a ejecutar las pruebas")
    print()


if __name__ == "__main__":
    main()
