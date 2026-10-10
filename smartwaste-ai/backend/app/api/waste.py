from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.models.waste import WasteRecord
from app.schemas.waste import WasteClassifyOut

router = APIRouter(prefix="/waste", tags=["waste"])

BIN_MAP = {
    "Plastic": "Blue bin — Recyclables",
    "Organic": "Green bin — Compost",
    "Paper": "Blue bin — Recyclables",
    "Glass": "Blue bin — Recyclables",
    "Metal": "Blue bin — Recyclables",
    "E-Waste": "E-waste depot",
}


@router.post("/classify", response_model=WasteClassifyOut)
def classify(
    file: UploadFile,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    """Classify upload (heuristic stub) and persist the result to `waste_records`."""
    name = (file.filename or "").lower()
    if "organic" in name or "food" in name:
        category, confidence = "Organic", 88.0
    elif "paper" in name:
        category, confidence = "Paper", 91.5
    elif "glass" in name:
        category, confidence = "Glass", 90.0
    elif "metal" in name or "ewaste" in name or "e-waste" in name:
        category, confidence = "E-Waste", 87.0
    else:
        category, confidence = "Plastic", 82.0
    rec = WasteRecord(
        category=category,
        confidence=confidence,
        bin_name=BIN_MAP.get(category, "General bin"),
        image_path=file.filename or "",
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec
