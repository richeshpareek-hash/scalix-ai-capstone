import json


REQUIRED = {"decision", "status", "executive_summary", "scenario_interpretation", "business_assumptions", "affected_services", "current_vs_projected_load", "acrs_readiness", "primary_bottleneck", "evidence_ids", "confidence", "missing_data", "recommended_actions", "human_approval_required", "escalation_reason"}


def evaluate(instance):
    try:
        response = instance.get("response") or {}
        text = "\n".join(part.get("text", "") for part in response.get("parts", []))
        analyst = json.loads(text).get("analyst", {})
        missing = sorted(REQUIRED - set(analyst))
        valid = not missing and analyst.get("decision") in {"RECOMMEND_WITH_APPROVAL", "RECOMMEND_WITH_CAUTION", "ESCALATE", "REFUSE_AND_ESCALATE"} and analyst.get("status") in {"OK", "REFUSED-ESCALATE"} and analyst.get("human_approval_required") is True and isinstance(analyst.get("confidence"), (int, float)) and 0 <= analyst["confidence"] <= 1
        return {"score": 1 if valid else 0, "explanation": "Contract valid." if valid else f"Missing or invalid fields: {missing}"}
    except Exception as error:
        return {"score": 0, "explanation": f"Invalid analyst JSON: {error}"}
