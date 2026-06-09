import os
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from db.database import init_db, get_db, save_scan, get_scan_history, get_scan_by_id
from attacks.library import ATTACKS, CATEGORIES, get_attacks_by_category, get_attack_count
from attacks.mutator import generate_mutations_for_category
from engine.runner import run_category_scan, SYSTEM_PROMPTS
from engine.scorer import calculate_category_score, calculate_overall_score
from ai.analyzer import analyze_scan_results

# Initialize database on startup
init_db()

# Create FastAPI app
app = FastAPI(
    title="RedForge API",
    description="LLM Security Testing Platform — Prompt Injection Scanner",
    version="0.1.0"
)

# CORS middleware — allows React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative React port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── REQUEST/RESPONSE MODELS ─────────────────────────────────────────────────
# These define what data the frontend sends and what we send back
# Pydantic validates everything automatically

class ScanRequest(BaseModel):
    """What the frontend sends when requesting a scan."""
    categories: List[str]           # which attack categories to test
    scenario: str = "general_assistant"  # which system prompt to use
    custom_system_prompt: Optional[str] = None  # user's own system prompt
    use_mutations: bool = True      # whether to generate mutations
    num_mutations: int = 5          # how many mutations per attack


class ScanResponse(BaseModel):
    """What we send back after a scan."""
    scan_id: str
    status: str
    message: str


# ─── ENDPOINTS ───────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    """
    Simple health check endpoint.
    Frontend calls this on load to verify backend is running.
    """
    return {
        "status": "healthy",
        "version": "0.1.0",
        "attack_count": get_attack_count(),
        "groq_configured": bool(os.environ.get("GROQ_API_KEY"))
    }


@app.get("/api/categories")
def get_categories():
    """
    Returns all attack categories with metadata.
    Frontend uses this to build the category selection UI.
    """
    result = []
    for key, name in CATEGORIES.items():
        attacks = get_attacks_by_category(key)
        result.append({
            "id": key,
            "name": name,
            "attack_count": len(attacks),
            "severities": list(set(a["severity"] for a in attacks))
        })
    return {"categories": result}


@app.get("/api/attacks")
def get_all_attacks(category: Optional[str] = None):
    """
    Returns attacks from the library.
    Optional ?category=jailbreak filter.
    """
    if category:
        attacks = get_attacks_by_category(category)
    else:
        attacks = ATTACKS

    # Don't send success_indicators to frontend (would help defenders game the scorer)
    safe_attacks = []
    for a in attacks:
        safe_attacks.append({
            "id": a["id"],
            "name": a["name"],
            "category": a["category"],
            "severity": a["severity"],
            "description": a["description"]
        })

    return {"attacks": safe_attacks, "total": len(safe_attacks)}


@app.post("/api/scan")
async def run_scan(
    request: ScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Main scan endpoint. Runs a full prompt injection scan.

    This is the most complex endpoint:
    1. Validates request
    2. Runs scan in background (so frontend gets immediate response)
    3. Returns scan_id so frontend can poll for results
    """

    # Validate categories
    valid_categories = list(CATEGORIES.keys())
    for cat in request.categories:
        if cat not in valid_categories:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category: {cat}. Valid: {valid_categories}"
            )

    # Validate scenario
    if request.scenario not in SYSTEM_PROMPTS and not request.custom_system_prompt:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid scenario: {request.scenario}"
        )

    # Check Groq API key
    if not os.environ.get("GROQ_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY not configured"
        )

    # Run the full scan
    try:
        scan_results = {}
        all_results = []
        category_scores = {}

        for category in request.categories:
            # Get attacks for this category
            attacks = get_attacks_by_category(category)

            # Generate mutations if requested
            if request.use_mutations:
                attacks = generate_mutations_for_category(
                    attacks,
                    num_mutations=request.num_mutations
                )

            # Run the attacks
            category_result = run_category_scan(
                attacks=attacks,
                scenario=request.scenario,
                custom_system_prompt=request.custom_system_prompt
            )

            scan_results[category] = category_result
            all_results.extend(category_result["results"])

            # Score this category
            category_scores[category] = calculate_category_score(
                category_result["results"]
            )

        # Calculate overall score
        overall_score = calculate_overall_score(category_scores)

        # AI analysis
        ai_analysis = analyze_scan_results(
            scan_results=scan_results,
            overall_score=overall_score,
            category_scores=category_scores,
            scenario=request.scenario
        )

        # Save to database
        scan_data = {
            "scenario": request.scenario,
            "categories": request.categories,
            "total_attacks": len(all_results),
            "successful_attacks": sum(1 for r in all_results if r.get("success")),
            "security_score": overall_score["score"],
            "vulnerability_score": overall_score["vulnerability_score"],
            "risk_level": overall_score["level"],
            "executive_summary": ai_analysis.get("executive_summary", ""),
            "vulnerability_analysis": ai_analysis.get("vulnerability_analysis", ""),
            "attack_patterns": ai_analysis.get("attack_patterns", ""),
            "remediation": ai_analysis.get("remediation", ""),
            "verdict": ai_analysis.get("verdict", "")
        }

        saved_scan = save_scan(db, scan_data, all_results)

        return {
            "scan_id": saved_scan.id,
            "status": "completed",
            "overall_score": overall_score,
            "category_scores": category_scores,
            "total_attacks": len(all_results),
            "successful_attacks": sum(1 for r in all_results if r.get("success")),
            "results": all_results,
            "ai_analysis": ai_analysis,
            "categories_tested": request.categories
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/scan/{scan_id}")
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    """
    Returns full results of a previous scan by ID.
    Frontend uses this to show historical scan details.
    """
    scan = get_scan_by_id(db, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return {
        "id": scan.id,
        "created_at": scan.created_at.isoformat(),
        "scenario": scan.scenario,
        "categories": scan.categories.split(",") if scan.categories else [],
        "total_attacks": scan.total_attacks,
        "successful_attacks": scan.successful_attacks,
        "security_score": scan.security_score,
        "vulnerability_score": scan.vulnerability_score,
        "risk_level": scan.risk_level,
        "ai_analysis": {
            "executive_summary": scan.executive_summary,
            "vulnerability_analysis": scan.vulnerability_analysis,
            "attack_patterns": scan.attack_patterns,
            "remediation": scan.remediation,
            "verdict": scan.verdict
        },
        "results": [
            {
                "attack_id": r.attack_id,
                "name": r.name,
                "category": r.category,
                "severity": r.severity,
                "strategy": r.strategy,
                "success": r.success,
                "confidence": r.confidence,
                "reasoning": r.reasoning,
                "response": r.response,
                "elapsed_seconds": r.elapsed_seconds
            }
            for r in scan.results
        ]
    }


@app.get("/api/history")
def get_history(limit: int = 10, db: Session = Depends(get_db)):
    """
    Returns list of recent scans.
    Frontend uses this to show scan history sidebar.
    """
    scans = get_scan_history(db, limit)
    return {
        "scans": [
            {
                "id": s.id,
                "created_at": s.created_at.isoformat(),
                "scenario": s.scenario,
                "security_score": s.security_score,
                "risk_level": s.risk_level,
                "total_attacks": s.total_attacks,
                "categories": s.categories.split(",") if s.categories else []
            }
            for s in scans
        ]
    }