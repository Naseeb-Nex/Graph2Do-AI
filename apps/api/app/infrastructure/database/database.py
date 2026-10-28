from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.infrastructure.config.config import settings

# Adjust the postgres url for psycopg2 if it is exactly postgresql://
# (Actually psycopg2 accepts postgresql:// just fine)

engine = create_engine(
    settings.database_url,
    pool_size=5 if not settings.database_url.startswith("sqlite") else 10,
    max_overflow=10 if not settings.database_url.startswith("sqlite") else 20,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {"sslmode": "require", "channel_binding": "require"},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
