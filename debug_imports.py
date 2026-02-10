try:
    print("Testing imports...")
    from app.main import app
    print("app.main imported successfully")
    from app.db.database import Base, get_db
    print("app.db.database imported successfully")
except Exception as e:
    import traceback
    traceback.print_exc()
