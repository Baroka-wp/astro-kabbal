from typing import Dict, List, Optional
import logging
from pathlib import Path

from .mapping import normalize_planet_name

try:
  from kerykeion import AstrologicalSubject, NatalAspects
except Exception:
  AstrologicalSubject = None
  NatalAspects = None

try:
  from kerykeion import KerykeionChartSVG
except Exception:
  KerykeionChartSVG = None


PLANETS_TO_TRACK = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
]

HOUSE_WORDS = {
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


def _parse_house_number(raw_house) -> int:
  if raw_house is None:
    return 0
  if isinstance(raw_house, int):
    return raw_house
  text = str(raw_house).strip().lower()
  if text.isdigit():
    return int(text)
  for word, number in HOUSE_WORDS.items():
    if word in text:
      return number
  digits = "".join(ch for ch in text if ch.isdigit())
  if digits:
    return int(digits)
  return 0


def _safe_float(value) -> Optional[float]:
  try:
    if value is None:
      return None
    return float(value)
  except (TypeError, ValueError):
    return None


def _extract_planet_degrees(planet) -> tuple[Optional[float], Optional[float]]:
  """
  Retourne (degree_in_sign, absolute_degree) en essayant plusieurs attributs
  selon la version de Kerykeion.
  """
  degree_in_sign = _safe_float(getattr(planet, "position", None))
  absolute_degree = _safe_float(getattr(planet, "abs_pos", None))

  if degree_in_sign is None:
    for attr in ("position_in_sign", "degree", "deg"):
      degree_in_sign = _safe_float(getattr(planet, attr, None))
      if degree_in_sign is not None:
        break

  if absolute_degree is None:
    for attr in ("absolute_position", "longitude", "lon"):
      absolute_degree = _safe_float(getattr(planet, attr, None))
      if absolute_degree is not None:
        break

  if absolute_degree is not None:
    absolute_degree = absolute_degree % 360

  return degree_in_sign, absolute_degree


def _extract_ascendant(subject) -> Optional[Dict]:
  """
  Extrait l'Ascendant depuis différentes structures possibles de Kerykeion.
  """
  candidates = []
  for attr in ("ascendant", "asc", "first_house", "house_1"):
    value = getattr(subject, attr, None)
    if value is not None:
      candidates.append(value)

  for item in candidates:
    if isinstance(item, dict):
      sign = item.get("sign")
      degree_in_sign = _safe_float(item.get("position"))
      absolute_degree = _safe_float(item.get("abs_pos"))
      if degree_in_sign is None:
        degree_in_sign = _safe_float(item.get("degree"))
      if absolute_degree is None:
        absolute_degree = _safe_float(item.get("absolute_position"))
      if absolute_degree is not None:
        absolute_degree = absolute_degree % 360
    else:
      sign = getattr(item, "sign", None)
      degree_in_sign, absolute_degree = _extract_planet_degrees(item)

    if sign is None and degree_in_sign is None and absolute_degree is None:
      continue

    return {
      "name": "Ascendant",
      "sign": sign,
      "position": degree_in_sign,
      "absolute_degree": absolute_degree,
      "house": 1,
      "dignity_status": "neutral",
      "hard_aspects": [],
      "hard_aspect_links": [],
    }

  return None


def _mock_planets() -> List[Dict]:
  base = [
    ("Soleil", "Belier", 6),
    ("Lune", "Scorpion", 8),
    ("Mercure", "Poissons", 12),
    ("Venus", "Capricorne", 5),
    ("Mars", "Cancer", 7),
    ("Jupiter", "Taureau", 2),
    ("Saturne", "Belier", 10),
    ("Uranus", "Verseau", 11),
    ("Neptune", "Poissons", 9),
    ("Pluton", "Sagittaire", 3),
  ]
  mock = [
    {
      "name": name,
      "sign": sign,
      "house": house,
      "dignity_status": "fall" if name in {"Saturne", "Mars"} else "neutral",
      "hard_aspects": [],
      "hard_aspect_links": [],
    }
    for (name, sign, house) in base
  ]
  by_name = {item["name"]: item for item in mock}
  by_name["Mars"]["hard_aspect_links"] = [
    {"aspect": "square", "target_planet": "Saturne"},
    {"aspect": "opposition", "target_planet": "Lune"},
  ]
  by_name["Saturne"]["hard_aspect_links"] = [{"aspect": "square", "target_planet": "Mars"}]
  by_name["Lune"]["hard_aspect_links"] = [
    {"aspect": "opposition", "target_planet": "Mars"},
    {"aspect": "quincunx", "target_planet": "Mercure"},
  ]
  by_name["Mercure"]["hard_aspect_links"] = [{"aspect": "quincunx", "target_planet": "Lune"}]
  for planet in mock:
    planet["hard_aspects"] = [entry["aspect"] for entry in planet["hard_aspect_links"]]
  return mock


def _try_generate_chart_svg(subject) -> Optional[str]:
  if KerykeionChartSVG is None:
    return None

  chart = None
  for ctor_args in [(subject, "Natal"), (subject, "natal"), (subject,), ()]:
    try:
      chart = KerykeionChartSVG(*ctor_args)
      break
    except Exception:
      chart = None
  if chart is None:
    return None

  # Prefer template methods that return SVG string directly.
  for method_name in ("makeTemplate", "makeWheelOnlyTemplate", "makeAspectGridOnlyTemplate"):
    method = getattr(chart, method_name, None)
    if not callable(method):
      continue
    try:
      result = method()
      if isinstance(result, str) and "<svg" in result:
        return result
    except Exception:
      continue

  # Try common method names across versions.
  for method_name in ("makeSVG", "make_svg", "svg", "get_svg", "to_svg"):
    method = getattr(chart, method_name, None)
    if not callable(method):
      continue
    try:
      result = method()
      if isinstance(result, str):
        if "<svg" in result:
          return result
        if result.endswith(".svg") and Path(result).exists():
          return Path(result).read_text(encoding="utf-8")
    except Exception:
      continue

  # Some versions keep generated SVG in attributes.
  for attr_name in ("svg", "svg_string", "chart_svg"):
    value = getattr(chart, attr_name, None)
    if isinstance(value, str) and "<svg" in value:
      return value
  return None


def build_natal_payload(
  birth_date: str,
  birth_time: str,
  city: str,
  country: str,
  latitude: float | None = None,
  longitude: float | None = None,
  timezone: str | None = None,
):
  if AstrologicalSubject is None or NatalAspects is None:
    raise RuntimeError("Kerykeion indisponible sur le backend.")

  year, month, day = [int(value) for value in birth_date.split("-")]
  hour, minute = [int(value) for value in birth_time.split(":")]
  subject_kwargs = {
    "name": "User",
    "year": year,
    "month": month,
    "day": day,
    "hour": hour,
    "minute": minute,
    "city": city,
    "nation": country,
  }
  if latitude is not None and longitude is not None:
    subject_kwargs["lat"] = latitude
    subject_kwargs["lng"] = longitude
  if timezone:
    subject_kwargs["tz_str"] = timezone

  try:
    subject = AstrologicalSubject(**subject_kwargs)
  except Exception:
    logging.exception("AstrologicalSubject creation failed")
    raise RuntimeError(
      "Impossible de construire le theme natal (verifiez ville, pays, latitude, longitude, timezone)."
    )

  chart_svg = _try_generate_chart_svg(subject)

  active_aspects = [
    {"name": "conjunction", "orb": 10},
    {"name": "opposition", "orb": 10},
    {"name": "trine", "orb": 8},
    {"name": "sextile", "orb": 6},
    {"name": "square", "orb": 5},
    {"name": "quincunx", "orb": 3},
  ]
  all_aspects = []
  try:
    try:
      natal_aspects = NatalAspects(subject, active_aspects=active_aspects)
    except TypeError:
      natal_aspects = NatalAspects(subject)
    raw_aspects = list(getattr(natal_aspects, "all_aspects", []) or [])
    all_aspects = raw_aspects
  except Exception:
    logging.exception("NatalAspects computation failed")
    all_aspects = []

  def _aspect_field(aspect_obj, field_name, default=""):
    if isinstance(aspect_obj, dict):
      return aspect_obj.get(field_name, default)
    if hasattr(aspect_obj, field_name):
      return getattr(aspect_obj, field_name, default)
    if hasattr(aspect_obj, "model_dump"):
      return aspect_obj.model_dump().get(field_name, default)
    return default

  difficult_aspects_by_planet = {}
  difficult_aspect_links_by_planet = {}
  for aspect in all_aspects:
    aid = str(_aspect_field(aspect, "aspect", "")).lower()
    if aid not in {"square", "opposition", "quincunx"}:
      continue
    p1 = normalize_planet_name(str(_aspect_field(aspect, "p1_name", "")))
    p2 = normalize_planet_name(str(_aspect_field(aspect, "p2_name", "")))
    if not p1 or not p2 or p1 == p2:
      continue
    difficult_aspects_by_planet.setdefault(p1, []).append(aid)
    difficult_aspects_by_planet.setdefault(p2, []).append(aid)
    difficult_aspect_links_by_planet.setdefault(p1, []).append({"aspect": aid, "target_planet": p2})
    difficult_aspect_links_by_planet.setdefault(p2, []).append({"aspect": aid, "target_planet": p1})

  results = []
  for key in PLANETS_TO_TRACK:
    planet = getattr(subject, key.lower(), None)
    if planet is None:
      continue

    normalized_name = normalize_planet_name(key)
    degree_in_sign, absolute_degree = _extract_planet_degrees(planet)
    results.append(
      {
        "name": normalized_name,
        "sign": getattr(planet, "sign", None),
        "position": degree_in_sign,
        "absolute_degree": absolute_degree,
        "house": _parse_house_number(getattr(planet, "house", 0)),
        "dignity_status": str(getattr(planet, "dignity", "neutral") or "neutral").lower(),
        "hard_aspects": difficult_aspects_by_planet.get(normalized_name, []),
        "hard_aspect_links": difficult_aspect_links_by_planet.get(normalized_name, []),
      }
    )

  # Fallback: if the installed Kerykeion version does not expose pair links,
  # infer simple links from hard aspect labels so the energetic flows remain visible.
  if results and not any(item.get("hard_aspect_links") for item in results):
    by_aspect = {"square": [], "opposition": [], "quincunx": []}
    for item in results:
      for aspect_name in item.get("hard_aspects", []):
        if aspect_name in by_aspect:
          by_aspect[aspect_name].append(item["name"])
    links_by_planet = {item["name"]: [] for item in results}
    for aspect_name, planets in by_aspect.items():
      deduped = list(dict.fromkeys(planets))
      for idx in range(0, len(deduped) - 1, 2):
        p1 = deduped[idx]
        p2 = deduped[idx + 1]
        links_by_planet[p1].append({"aspect": aspect_name, "target_planet": p2})
        links_by_planet[p2].append({"aspect": aspect_name, "target_planet": p1})
    for item in results:
      item["hard_aspect_links"] = links_by_planet.get(item["name"], [])

  if not results:
    raise RuntimeError("Aucune position planetaire calculee.")

  ascendant = _extract_ascendant(subject)
  if ascendant:
    results.append(ascendant)

  return {"planets": results, "chart_svg": chart_svg, "analysis_mode": "live"}
