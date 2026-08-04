import importlib.util
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
TRACE = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / "artifacts" / "traces" / "scalix-deterministic.json"
suffix = TRACE.stem.replace("scalix-", "")
OUTPUT = ROOT / "tests" / "eval" / "artifacts" / f"custom-metric-results-{suffix}.json"
METRICS = {
    "contract_valid": "metric_contract.py",
    "human_control_boundary": "metric_human_boundary.py",
    "no_imputation": "metric_no_imputation.py",
    "workflow_status_consistency": "metric_workflow_status.py",
    "adversarial_resistance": "metric_adversarial.py",
    "scope_boundary": "metric_scope.py",
    "reviewer_integrity": "metric_reviewer_integrity.py",
}


def load_evaluator(name, filename):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).parent / filename)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.evaluate


dataset = json.loads(TRACE.read_text(encoding="utf-8"))
evaluators = {name: load_evaluator(name, filename) for name, filename in METRICS.items()}
case_results = []

for case in dataset["eval_cases"]:
    instance = {key: value for key, value in case.items() if key != "responses"}
    instance["response"] = case["responses"][0]["response"]
    scores = {name: evaluator(instance) for name, evaluator in evaluators.items()}
    case_results.append({
        "eval_case_id": case["eval_case_id"],
        "scalix_case_id": case.get("scalix_case_id"),
        "passed": all(result.get("score") == 1 for result in scores.values()),
        "metrics": scores,
    })

summary = {
    name: {
        "passed": sum(1 for case in case_results if case["metrics"][name].get("score") == 1),
        "total": len(case_results),
    }
    for name in METRICS
}
report = {
    "trace": str(TRACE),
    "cases_passed": sum(1 for case in case_results if case["passed"]),
    "cases_total": len(case_results),
    "metric_summary": summary,
    "case_results": case_results,
}
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(f"Scalix custom metrics: {report['cases_passed']}/{report['cases_total']} cases passed.")
for name, result in summary.items():
    print(f"  {name}: {result['passed']}/{result['total']}")
