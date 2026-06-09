import os
import uuid
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, String, Integer,
    Float, Boolean, DateTime, Text, ForeignKey
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# Database file location
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "redforge.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create engine — this is the connection to our SQLite file
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # needed for SQLite + FastAPI
)

# Base class for all our table definitions
Base = declarative_base()

# Session factory — we use this to create database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# ─── TABLE DEFINITIONS ───────────────────────────────────────────────────────

class Scan(Base):
    """
    One row per scan session.
    Stores the overall scan metadata, scores, and AI analysis.
    """
    __tablename__ = "scans"

    id               = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at       = Column(DateTime, default=datetime.utcnow)
    scenario         = Column(String)           # which system prompt was used
    categories       = Column(String)           # comma-separated list of tested categories
    total_attacks    = Column(Integer)
    successful_attacks = Column(Integer)
    security_score   = Column(Integer)          # 0-100, higher = more secure
    vulnerability_score = Column(Integer)       # 0-100, higher = more vulnerable
    risk_level       = Column(String)           # SECURE/MODERATE/VULNERABLE/CRITICAL

    # AI analysis fields
    executive_summary    = Column(Text)
    vulnerability_analysis = Column(Text)
    attack_patterns      = Column(Text)
    remediation          = Column(Text)
    verdict              = Column(Text)

    # Relationship — one scan has many attack results
    results = relationship("AttackResult", back_populates="scan", cascade="all, delete")


class AttackResult(Base):
    """
    One row per individual attack fired during a scan.
    """
    __tablename__ = "attack_results"

    id               = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id          = Column(String, ForeignKey("scans.id"))
    created_at       = Column(DateTime, default=datetime.utcnow)

    attack_id        = Column(String)           # e.g. "jb_001"
    parent_id        = Column(String)           # set if this is a mutation
    name             = Column(String)
    category         = Column(String)
    severity         = Column(String)
    strategy         = Column(String)           # mutation strategy used
    prompt           = Column(Text)
    response         = Column(Text)
    success          = Column(Boolean)
    confidence       = Column(Integer)
    matched_indicators = Column(String)         # comma-separated
    reasoning        = Column(Text)
    elapsed_seconds  = Column(Float)

    # Relationship back to parent scan
    scan = relationship("Scan", back_populates="results")


# ─── DATABASE HELPERS ────────────────────────────────────────────────────────

def init_db():
    """Creates all tables if they don't exist."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """
    FastAPI dependency — yields a database session.
    Automatically closes the session when the request is done.
    Used like this in FastAPI:
        def my_endpoint(db: Session = Depends(get_db)):
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def save_scan(db, scan_data: dict, results_data: list) -> Scan:
    """
    Saves a complete scan (metadata + all results) to the database.
    Returns the saved Scan object.
    """
    scan = Scan(
        id=str(uuid.uuid4()),
        scenario=scan_data.get("scenario"),
        categories=",".join(scan_data.get("categories", [])),
        total_attacks=scan_data.get("total_attacks", 0),
        successful_attacks=scan_data.get("successful_attacks", 0),
        security_score=scan_data.get("security_score", 0),
        vulnerability_score=scan_data.get("vulnerability_score", 0),
        risk_level=scan_data.get("risk_level", "UNKNOWN"),
        executive_summary=scan_data.get("executive_summary", ""),
        vulnerability_analysis=scan_data.get("vulnerability_analysis", ""),
        attack_patterns=scan_data.get("attack_patterns", ""),
        remediation=scan_data.get("remediation", ""),
        verdict=scan_data.get("verdict", "")
    )
    db.add(scan)

    # Save all attack results linked to this scan
    for r in results_data:
        result = AttackResult(
            scan_id=scan.id,
            attack_id=r.get("attack_id"),
            parent_id=r.get("parent_id"),
            name=r.get("name"),
            category=r.get("category"),
            severity=r.get("severity"),
            strategy=r.get("strategy", "original"),
            prompt=r.get("prompt"),
            response=r.get("response"),
            success=r.get("success", False),
            confidence=r.get("confidence", 0),
            matched_indicators=",".join(r.get("matched_indicators", [])),
            reasoning=r.get("reasoning"),
            elapsed_seconds=r.get("elapsed_seconds", 0)
        )
        db.add(result)

    db.commit()
    db.refresh(scan)
    return scan


def get_scan_history(db, limit: int = 10) -> list:
    """Returns the most recent scans."""
    return db.query(Scan).order_by(Scan.created_at.desc()).limit(limit).all()


def get_scan_by_id(db, scan_id: str) -> Scan:
    """Returns a single scan with all its results."""
    return db.query(Scan).filter(Scan.id == scan_id).first()