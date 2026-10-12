"""Honesty check for the quick-start AI prompts.

Runs every case in tests/fixtures/quickstart_eval.json through the same AI step
the quick-start uses at the end (career_mentor._generate, real prompts, real API
calls) and prints what the user typed next to what the AI wrote, so a person can
check that nothing was added.

    cd backend
    venv/Scripts/python -m scripts.quickstart_eval [--out results.json]

Costs real API calls: 2 per case.
"""
import argparse
import asyncio
import json
from pathlib import Path

from app.api.routes.career_mentor import _generate
from app.services import career_mentor

FIXTURE = Path(__file__).resolve().parent.parent / "tests" / "fixtures" / "quickstart_eval.json"


def _user_input(context: dict) -> str:
    facts = career_mentor.summary_facts(context)
    lines = []
    for key, value in facts.items():
        if isinstance(value, list):
            value = ", ".join(value)
        if value not in ("", None, False, []):
            lines.append(f"  {key}: {value}")
    return "\n".join(lines)


async def _run_case(case: dict) -> dict:
    context = career_mentor.clean_context(case["context"])
    assert career_mentor.is_complete(context), f"{case['name']}: context is not complete"
    result = await _generate(context)
    return {"name": case["name"], "input": career_mentor.summary_facts(context), **result}


async def main(out: str | None) -> None:
    cases = json.loads(FIXTURE.read_text(encoding="utf-8"))
    results = await asyncio.gather(*(_run_case(c) for c in cases))
    for case, result in zip(cases, results):
        print("=" * 78)
        print(f"{result['name']}")
        print("-- user typed:")
        print(_user_input(case["context"]))
        print("-- AI wrote:")
        if "bullets" in result:
            for bullet in result["bullets"]:
                print(f"  * {bullet}")
        else:
            print(f"  project: {result['project_description']}")
        print(f"  summary: {result['summary']}")
    if out:
        Path(out).write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", help="also save the results as JSON")
    asyncio.run(main(parser.parse_args().out))
