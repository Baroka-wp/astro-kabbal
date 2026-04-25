from .schemas import PlanetFactor, PlanetFactors

HARD_ASPECTS = {"square", "opposition", "quincunx"}
DIFFICULT_HOUSES = {6, 8, 12}
WEIGHTS = {
  "aspect_hard": 0.50,
  "weak_dignity": 0.30,
  "difficult_house": 0.20,
}


def level_from_score(score: int) -> str:
  if score <= 24:
    return "faible"
  if score <= 54:
    return "modere"
  return "eleve"


def compute_planet_score(hard_aspects_count: int, dignity_status: str, house: int):
  aspect_component = min(1.0, hard_aspects_count / 3)
  dignity_component = 1.0 if dignity_status in {"exile", "fall"} else 0.0
  house_component = 1.0 if house in DIFFICULT_HOUSES else 0.0

  total = (
    WEIGHTS["aspect_hard"] * aspect_component
    + WEIGHTS["weak_dignity"] * dignity_component
    + WEIGHTS["difficult_house"] * house_component
  )
  score = max(0, min(100, int(round(total * 100))))
  factors = PlanetFactors(
    aspect_hard=PlanetFactor(
      active=hard_aspects_count > 0,
      score=round(aspect_component * WEIGHTS["aspect_hard"] * 100, 2),
      detail=f"{hard_aspects_count} aspect(s) difficile(s)",
    ),
    weak_dignity=PlanetFactor(
      active=dignity_component > 0,
      score=round(dignity_component * WEIGHTS["weak_dignity"] * 100, 2),
      detail=f"dignite: {dignity_status}",
    ),
    difficult_house=PlanetFactor(
      active=house_component > 0,
      score=round(house_component * WEIGHTS["difficult_house"] * 100, 2),
      detail=f"maison {house}",
    ),
  )

  return score, factors
