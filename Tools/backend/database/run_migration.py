"""Run the fulltext search migration."""
import asyncio
import sys
from pathlib import Path
import psycopg

async def run_migration():
    """Execute the fulltext search migration SQL."""
    migration_file = Path(__file__).parent.parent / "migrations" / "add_fulltext_search.sql"
    
    print(f"📄 Reading migration file: {migration_file}")
    
    if not migration_file.exists():
        print(f"❌ Migration file not found: {migration_file}")
        sys.exit(1)
    
    # Read the SQL file
    sql_content = migration_file.read_text(encoding='utf-8')
    
    # Remove VACUUM command (must run outside transaction)
    sql_content = sql_content.replace('VACUUM ANALYZE products;', '')
    
    print("🔄 Connecting to database...")
    
    # Connect to Supabase PostgreSQL
    conn_string = "postgresql://postgres.bkzkbdgwbwisnzudinmg:sjv6bjZDOg13CVBY@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?options=-c%20search_path%3Dtienda"
    
    async with await psycopg.AsyncConnection.connect(conn_string) as conn:
        print("✅ Connected to database")
        print("🚀 Executing migration...")
        
        async with conn.cursor() as cur:
            try:
                # Execute the entire SQL file as one block
                await cur.execute(sql_content)
                await conn.commit()
                print("✅ Migration executed successfully!")
            except Exception as e:
                print(f"❌ Error executing migration: {e}")
                await conn.rollback()
                sys.exit(1)
        
        print("🔍 Verifying search_vector column...")
        
        # Verify the column exists
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'products' 
                AND column_name = 'search_vector'
            """)
            
            row = await cur.fetchone()
            if row:
                print(f"✅ Column 'search_vector' exists with type: {row[1]}")
            else:
                print("❌ Column 'search_vector' not found after migration!")
                sys.exit(1)
        
        # Verify the index exists
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE indexname = 'idx_product_search'
            """)
            
            row = await cur.fetchone()
            if row:
                print(f"✅ Index 'idx_product_search' exists")
            else:
                print("⚠️  Index 'idx_product_search' not found")
        
        # Verify the trigger exists
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT trigger_name 
                FROM information_schema.triggers 
                WHERE trigger_name = 'tsvector_update'
            """)
            
            row = await cur.fetchone()
            if row:
                print(f"✅ Trigger 'tsvector_update' exists")
            else:
                print("⚠️  Trigger 'tsvector_update' not found")
        
        print("\n🎉 All done! Your database is ready for full-text search.")

if __name__ == "__main__":
    import selectors
    asyncio.run(run_migration(), loop_factory=lambda: asyncio.SelectorEventLoop(selectors.SelectSelector()))
