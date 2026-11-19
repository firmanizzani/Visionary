"""Record label similarity separately from object localization confidence."""
from alembic import op
import sqlalchemy as sa
revision='002'
down_revision='001'
branch_labels=None
depends_on=None
def upgrade():
    op.add_column('detected_objects',sa.Column('label_similarity',sa.Float(),nullable=True))
    op.add_column('detected_objects',sa.Column('label_margin',sa.Float(),nullable=True))
def downgrade():
    op.drop_column('detected_objects','label_margin')
    op.drop_column('detected_objects','label_similarity')
