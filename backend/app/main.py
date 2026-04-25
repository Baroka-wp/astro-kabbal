from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from uuid import uuid4

from .astro_engine import build_natal_payload
from .mapping import PLANET_SYMBOLS, SEPHIROTH_PLANET_MAPPING
from .schemas import NatalAnalyzeRequest, NatalAnalyzeResponse, PlanetScore, SephirahScore
from .scoring import compute_planet_score, level_from_score

app = FastAPI(title="Astro-Kabbale API", version="1.0.0")
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.get("/api/health")
def health():
  return {"status": "ok"}


def _safe_house_number(raw_house):
  if raw_house is None:
    return 0
  if isinstance(raw_house, int):
    return raw_house
  text = str(raw_house).strip().lower()
  if text.isdigit():
    return int(text)
  mapping = {
    "first": 1,
    "second": 2,
    "third": 3,
    "fourth": 4,
    "fifth": 5,
    "sixth": 6,
    "seventh": 7,
    "eighth": 8,
    "ninth": 9,
    "tenth": 10,
    "eleventh": 11,
    "twelfth": 12,
  }
  for word, value in mapping.items():
    if word in text:
      return value
  digits = "".join(ch for ch in text if ch.isdigit())
  return int(digits) if digits else 0


@app.post("/api/natal/analyze", response_model=NatalAnalyzeResponse)
def analyze_natal(request: NatalAnalyzeRequest):
  try:
    payload = build_natal_payload(
      birth_date=request.birth_date,
      birth_time=request.birth_time,
      city=request.city,
      country=request.country,
      latitude=request.latitude,
      longitude=request.longitude,
      timezone=request.timezone,
    )
  except Exception as exc:
    raise HTTPException(status_code=400, detail=f"Echec de calcul natal: {exc}") from exc

  planets_raw = payload.get("planets", [])
  chart_svg = payload.get("chart_svg")
  analysis_mode = payload.get("analysis_mode", "live")
  analysis_id = f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid4().hex[:8]}"

  planets = []
  blocked_score_by_planet = {}
  for planet in planets_raw:
    house_number = _safe_house_number(planet.get("house", 0))
    score, factors = compute_planet_score(
      hard_aspects_count=len(planet.get("hard_aspects", [])),
      dignity_status=str(planet.get("dignity_status", "neutral")),
      house=house_number,
    )

    planet_model = PlanetScore(
      name=planet.get("name", "Inconnue"),
      sign=planet.get("sign"),
      house=house_number,
      dignity_status=planet.get("dignity_status", "neutral"),
      blocked_score=score,
      factors=factors,
      hard_aspects=planet.get("hard_aspects", []),
      hard_aspect_links=planet.get("hard_aspect_links", []),
    )
    planets.append(planet_model)
    blocked_score_by_planet[planet_model.name] = planet_model.blocked_score

  sephiroth_scores = []
  for item in SEPHIROTH_PLANET_MAPPING:
    primary = item["primary_planet"]
    score = blocked_score_by_planet.get(primary, 0)
    planet_data = next((p for p in planets if p.name == primary), None)
    has_hard_aspects = bool(planet_data.hard_aspects) if planet_data else False
    weak_dignity = bool(planet_data.dignity_status in {"fall", "exile"}) if planet_data else False
    factor_text = []
    if primary in blocked_score_by_planet:
      factor_text.append(f"{primary}: {score}")
    if item["secondary_planet"]:
      factor_text.append(f"secondaire: {item['secondary_planet']}")
    sephiroth_scores.append(
      SephirahScore(
        sephirah_id=item["sephirah_id"],
        sephirah_name=item["sephirah_name"],
        primary_planet=primary,
        secondary_planet=item["secondary_planet"],
        planet_symbol=PLANET_SYMBOLS.get(primary),
        score=score,
        level=level_from_score(score),
        has_hard_aspects=has_hard_aspects,
        weak_dignity=weak_dignity,
        factors_summary=factor_text or ["Pas de donnees planete"],
      )
    )

  explanations = [
    "A = aspects difficiles (carre/opposition/quinconce).",
    "B = dignite faible (chute/exil).",
    "C = maison difficile (6/8/12).",
    "Score combine pondere: A 50%, B 30%, C 20%.",
  ]

  return NatalAnalyzeResponse(
    profile={
      "birth_date": request.birth_date,
      "birth_time": request.birth_time,
      "city": request.city,
      "country": request.country,
      "latitude": str(request.latitude) if request.latitude is not None else "",
      "longitude": str(request.longitude) if request.longitude is not None else "",
      "timezone": request.timezone or "",
    },
    planets=planets,
    blocked_score_by_planet=blocked_score_by_planet,
    sephiroth_scores=sephiroth_scores,
    explanations=explanations,
    chart_svg=chart_svg,
    analysis_mode=analysis_mode,
    analysis_id=analysis_id,
  )
