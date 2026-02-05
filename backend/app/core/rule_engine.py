def rule_based_detection(tx: dict):
    score = 0
    reasons = []

    if tx.get("account_age_days", 0) < 30:
        score += 20
        reasons.append("New receiver account")

    if tx.get("recent_tx_count", 0) > 5:
        score += 30
        reasons.append("High transaction frequency")

    if tx.get("same_amount_count", 0) > 3:
        score += 25
        reasons.append("Repeated same amount")

    if score >= 60:
        level = "HIGH"
    elif score >= 30:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "risk_score": score,
        "risk_level": level,
        "reasons": reasons
    }
