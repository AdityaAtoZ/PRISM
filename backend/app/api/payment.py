from fastapi import APIRouter
from app.core.risk_evaluator import evaluate_risk
from app.db.supabase import supabase

router = APIRouter()

@router.post("/initiate")
def initiate_payment(transaction: dict):
    # 1. Evaluate risk
    risk = evaluate_risk(transaction)

    # 2. Store transaction
    tx = supabase.table("transactions").insert({
        "sender_id": "demo_user",
        "receiver_id": "receiver_123",
        "amount": transaction.get("amount"),
        "status": "COMPLETED"
    }).execute()

    tx_id = tx.data[0]["id"]

    # 3. Store risk log
    supabase.table("risk_logs").insert({
        "transaction_id": tx_id,
        "engine_used": "RULE",
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "reasons": ", ".join(risk["reasons"])
    }).execute()

    return {
        "status": "stored",
        "risk": risk
    }
