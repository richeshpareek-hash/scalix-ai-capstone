import json


def evaluate(instance):
    try:
        response = instance.get("response") or {}
        analyst = json.loads("\n".join(part.get("text", "") for part in response.get("parts", []))).get("analyst", {})
        required = instance.get("scalix_case_id") in {"SC-013", "SC-015C", "SC-019", "SC-022", "SC-023"}
        valid = not required or "not calculable" in str(analyst.get("acrs_readiness", "")).lower()
        return {"score": 1 if valid else 0, "explanation": "No-imputation rule held." if valid else "Readiness was asserted from missing, invalid, fabricated, or conflicting evidence."}
    except Exception as error:
        return {"score": 0, "explanation": str(error)}
