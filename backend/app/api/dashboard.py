from fastapi import APIRouter
from app.db.supabase import supabase

router = APIRouter()

@router.get("/transactions")
def get_transactions():
    res = supabase.table("transactions") \
        .select("*") \
        .order("created_at", desc=True) \
        .execute()
    return res.data

@router.get("/risks")
def get_risks():
    res = supabase.table("risk_logs") \
        .select("*") \
        .order("created_at", desc=True) \
        .execute()
    return res.data

from pydantic import BaseModel
class EngineUpdate(BaseModel):
    engine: str

@router.get("/config/engine")
def get_active_engine():
    from app.services.config_service import get_engine
    return {"engine": get_engine()}

@router.post("/config/set-engine")
def set_active_engine(update: EngineUpdate):
    from app.services.config_service import set_engine
    return {"engine": set_engine(update.engine)}
