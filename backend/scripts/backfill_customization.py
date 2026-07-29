"""
One-time backfill: ensures every cv_documents.customization is a complete
object (merged with DEFAULT_CUSTOMIZATION), fixing rows saved as {}, null, or
with partial keys before mergeCustomization()/_merge_customization() existed.
Preserves any values the user actually set -- only fills in what's missing.

Usage (run from backend/, with the venv active):
    python scripts/backfill_customization.py            # dry run (default) -- prints what would change, writes nothing
    python scripts/backfill_customization.py --apply     # writes the changes for real
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.cv_document import CVDocument
from app.models.cover_letter import CoverLetter  # noqa: F401 -- registers User's "CoverLetter" relationship target; app/models/__init__.py doesn't import it, so a standalone query on any model reachable from User fails to configure mappers without this
from app.api.routes.cv import DEFAULT_CUSTOMIZATION, _merge_customization


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Write changes for real (default is dry-run)")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        cvs = db.query(CVDocument).all()
        affected = []
        for cv in cvs:
            before = cv.customization if isinstance(cv.customization, dict) else {}
            after = _merge_customization(before, None, template_id=cv.template_id.value)
            if after != (cv.customization or {}):
                missing = sorted(set(DEFAULT_CUSTOMIZATION) - set(before.keys()))
                affected.append((cv, cv.customization, after, missing))

        print(f"Total CVs in database: {len(cvs)}")
        print(f"CVs needing a customization backfill: {len(affected)}")
        print()

        for cv, before, after, missing in affected[:20]:
            print(f"  cv_id={cv.id} user_id={cv.user_id} title={cv.title!r} template={cv.template_id.value}")
            print(f"    before: {before!r}")
            print(f"    missing keys filled: {missing}")
            print(f"    after:  {after!r}")
            print()
        if len(affected) > 20:
            print(f"  ... and {len(affected) - 20} more (showing first 20)\n")

        if not args.apply:
            print("DRY RUN -- no changes written. Re-run with --apply to write these changes for real.")
            return

        for cv, before, after, missing in affected:
            cv.customization = after
        db.commit()
        print(f"Applied. {len(affected)} row(s) updated.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
