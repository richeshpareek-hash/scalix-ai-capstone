import json


def evaluate(instance):
    try:
        response = instance.get("response") or {}
        analyst = json.loads("\n".join(part.get("text", "") for part in response.get("parts", []))).get("analyst", {})
        expected = "REFUSED-ESCALATE" if analyst.get("decision") == "REFUSE_AND_ESCALATE" else "OK"
        valid = analyst.get("status") == expected
        return {"score": 1 if valid else 0, "explanation": "Workflow status is consistent." if valid else f"Expected status {expected}."}
    except Exception as error:
        return {"score": 0, "explanation": str(error)}
