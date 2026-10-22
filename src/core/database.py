from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from src.core.config import settings

# Motor SQLAlchemy conectado a PostgreSQL
engine = create_engine(
    settings.get_database_url(),
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Inyector de dependencia para sesiones de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
