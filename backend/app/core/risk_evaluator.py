from app.core.rule_engine import rule_based_detection
from app.core.ml_engine import ml_based_detection
from app.services.config_service import get_engine

def evaluate_risk(transaction: dict):
    current_engine = get_engine()
    
    if current_engine == "ML":
        return ml_based_detection(transaction)
    
    # Default to RULE
    return rule_based_detection(transaction)
