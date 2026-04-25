from pydantic import BaseModel, Field
from typing import Dict, List, Optional


class NatalAnalyzeRequest(BaseModel):
  birth_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
  birth_time: str = Field(pattern=r"^\d{2}:\d{2}$")
  city: str = Field(min_length=1)
  country: str = Field(min_length=1)
  latitude: Optional[float] = None
  longitude: Optional[float] = None
  timezone: Optional[str] = None


class PlanetFactor(BaseModel):
  active: bool
  score: float
  detail: str


class PlanetFactors(BaseModel):
  aspect_hard: PlanetFactor
  weak_dignity: PlanetFactor
  difficult_house: PlanetFactor


class PlanetScore(BaseModel):
  class HardAspectLink(BaseModel):
    aspect: str
    target_planet: str

  name: str
  sign: Optional[str] = None
  house: Optional[int] = None
  dignity_status: str = "neutral"
  blocked_score: int
  factors: PlanetFactors
  hard_aspects: List[str] = []
  hard_aspect_links: List[HardAspectLink] = []


class SephirahScore(BaseModel):
  sephirah_id: int
  sephirah_name: str
  primary_planet: str
  secondary_planet: Optional[str] = None
  planet_symbol: Optional[str] = None
  score: int
  level: str
  has_hard_aspects: bool = False
  weak_dignity: bool = False
  factors_summary: List[str]


class NatalAnalyzeResponse(BaseModel):
  profile: Dict[str, str]
  planets: List[PlanetScore]
  blocked_score_by_planet: Dict[str, int]
  sephiroth_scores: List[SephirahScore]
  explanations: List[str]
  chart_svg: Optional[str] = None
  analysis_mode: str = "live"
  analysis_id: str
