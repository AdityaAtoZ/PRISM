from app.db.supabase import supabase

def init_db():
    print("Initializing system_config...")
    # Try to insert. If table doesn't exist, this will fail (user needs to create it in supabase dashboard if so).
    # But if table exists, we upsert.
    try:
        data = {"key": "DETECTION_ENGINE", "value": "RULE"}
        res = supabase.table("system_config").upsert(data).execute()
        print("Success:", res.data)
    except Exception as e:
        print("Error (Table might not exist?):", e)

if __name__ == "__main__":
    init_db()
