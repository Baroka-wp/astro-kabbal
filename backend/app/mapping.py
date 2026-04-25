SEPHIROTH_PLANET_MAPPING = [
  {"sephirah_id": 1, "sephirah_name": "Keter", "primary_planet": "Neptune", "secondary_planet": "Pluton"},
  {"sephirah_id": 2, "sephirah_name": "Chokmah", "primary_planet": "Uranus", "secondary_planet": "Zodiaque"},
  {"sephirah_id": 3, "sephirah_name": "Binah", "primary_planet": "Saturne", "secondary_planet": None},
  {"sephirah_id": 4, "sephirah_name": "Chesed", "primary_planet": "Jupiter", "secondary_planet": None},
  {"sephirah_id": 5, "sephirah_name": "Geburah", "primary_planet": "Mars", "secondary_planet": None},
  {"sephirah_id": 6, "sephirah_name": "Tiferet", "primary_planet": "Soleil", "secondary_planet": None},
  {"sephirah_id": 7, "sephirah_name": "Netzach", "primary_planet": "Venus", "secondary_planet": None},
  {"sephirah_id": 8, "sephirah_name": "Hod", "primary_planet": "Mercure", "secondary_planet": None},
  {"sephirah_id": 9, "sephirah_name": "Yesod", "primary_planet": "Lune", "secondary_planet": None},
  {"sephirah_id": 10, "sephirah_name": "Malkuth", "primary_planet": "Terre", "secondary_planet": "Elements"},
]

PLANET_SYMBOLS = {
  "Soleil": "☉",
  "Lune": "☽",
  "Mercure": "☿",
  "Venus": "♀",
  "Mars": "♂",
  "Jupiter": "♃",
  "Saturne": "♄",
  "Uranus": "♅",
  "Neptune": "♆",
  "Pluton": "♇",
  "Terre": "⊕",
}


def normalize_planet_name(planet_name: str) -> str:
  aliases = {
    "Sun": "Soleil",
    "Moon": "Lune",
    "Mercury": "Mercure",
    "Venus": "Venus",
    "Mars": "Mars",
    "Jupiter": "Jupiter",
    "Saturn": "Saturne",
    "Uranus": "Uranus",
    "Neptune": "Neptune",
    "Pluto": "Pluton",
    "Earth": "Terre",
  }
  return aliases.get(planet_name, planet_name)
