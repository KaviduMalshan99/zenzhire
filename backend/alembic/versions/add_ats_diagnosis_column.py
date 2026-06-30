from alembic import op
import sqlalchemy as sa

revision = "ats_diagnosis_001"
down_revision = "cover_letters_001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "ats_results",
        sa.Column("diagnosis", sa.JSON(), nullable=True),
    )


def downgrade():
    op.drop_column("ats_results", "diagnosis")
