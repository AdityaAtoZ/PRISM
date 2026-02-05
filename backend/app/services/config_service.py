from app.db.supabase import supabase

def get_engine():
    try:
        res = supabase.table("system_config").select("value").eq("key", "DETECTION_ENGINE").single().execute()
        return res.data["value"] if res.data else "RULE"
    except Exception:
        # Fallback if DB fails or key missing
        return "RULE"

def set_engine(engine: str):
    if engine not in ["RULE", "ML"]:
        raise ValueError("Invalid engine")
    
    supabase.table("system_config").upsert({
        "key": "DETECTION_ENGINE",
        "value": engine
    }).execute()
    return engine
