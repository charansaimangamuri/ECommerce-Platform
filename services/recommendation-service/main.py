import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
from pydantic import BaseModel

app = FastAPI(
    title="ShopSphere AI Recommendation Service",
    description="Content-based product recommendation & affinity engine",
    version="1.0.0"
)

# Enable CORS for Next.js storefront (port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:password123@localhost:27017/ecommerce_db?authSource=admin")
client = MongoClient(MONGO_URI)
db = client["ecommerce_db"]
products_col = db["products"]

class RecommendationItem(BaseModel):
    id: str
    title: str
    slug: str
    brand: str
    basePrice: float
    discountPrice: Optional[float] = None
    images: List[str]
    rating: float
    totalReviews: int
    matchScore: int
    matchReason: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "recommendation-service", "runtime": "Python FastAPI"}

@app.get("/api/recommendations/{product_id}", response_model=List[RecommendationItem])
def get_recommendations(product_id: str, limit: int = 4):
    """
    Computes real-time similarity scores between the target product and all published products.
    Weights:
      - Same Category: +50 pts
      - Same Brand: +25 pts
      - Price Proximity (within 30%): +15 pts
      - High Rating (>= 4.5): +10 pts
    """
    try:
        target_obj_id = ObjectId(product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid MongoDB ObjectId format")

    target = products_col.find_one({"_id": target_obj_id, "isPublished": True})
    if not target:
        raise HTTPException(status_code=404, detail="Product not found")

    target_category = str(target.get("category", ""))
    target_brand = (target.get("brand") or "").lower()
    target_price = target.get("discountPrice") or target.get("basePrice") or 0.0

    candidates = list(products_col.find({
        "_id": {"$ne": target_obj_id},
        "isPublished": True
    }))

    scored_list = []
    for cand in candidates:
        score = 0
        reasons = []

        cand_category = str(cand.get("category", ""))
        cand_brand = (cand.get("brand") or "").lower()
        cand_price = cand.get("discountPrice") or cand.get("basePrice") or 0.0

        # 1. Category Match (50 points)
        if cand_category and cand_category == target_category:
            score += 50
            reasons.append("Similar Category")

        # 2. Brand Match (25 points)
        if cand_brand and cand_brand == target_brand:
            score += 25
            reasons.append("Same Brand")

        # 3. Price Proximity (Up to 15 points)
        if target_price > 0 and cand_price > 0:
            price_ratio = min(target_price, cand_price) / max(target_price, cand_price)
            price_score = int(price_ratio * 15)
            score += price_score
            if price_ratio >= 0.70:
                reasons.append("Similar Price Range")

        # 4. Rating Quality Boost (Up to 10 points)
        rating_summary = cand.get("ratingSummary", {})
        cand_rating = rating_summary.get("average", 4.0)
        cand_reviews = rating_summary.get("totalReviews", 0)
        if cand_rating >= 4.5:
            score += 10
            reasons.append("Top Rated")

        match_pct = min(score, 99)
        reason_text = " • ".join(reasons) if reasons else "Trending Match"

        scored_list.append({
            "id": str(cand["_id"]),
            "title": cand.get("title", ""),
            "slug": cand.get("slug", ""),
            "brand": cand.get("brand", ""),
            "basePrice": float(cand.get("basePrice", 0)),
            "discountPrice": float(cand.get("discountPrice", 0)) if cand.get("discountPrice") else None,
            "images": cand.get("images", []),
            "rating": float(cand_rating),
            "totalReviews": int(cand_reviews),
            "matchScore": int(match_pct),
            "matchReason": reason_text
        })

    # Sort candidates by matchScore descending
    scored_list.sort(key=lambda x: x["matchScore"], reverse=True)
    return scored_list[:limit]
