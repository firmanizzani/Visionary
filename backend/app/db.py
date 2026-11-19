from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import config

url = config.database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
engine = create_engine(url, pool_pre_ping=True, pool_size=3, max_overflow=2, connect_args={'check_same_thread': False} if url.startswith('sqlite') else {})
Session = sessionmaker(engine, expire_on_commit=False)
class Base(DeclarativeBase):
    pass

def database():
    with Session() as session:
        yield session
