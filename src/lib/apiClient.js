const API_BASE_URL = import.meta.env.VITE_ASTRO_API_URL || 'http://localhost:8000';

export const analyzeNatalChart = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/api/natal/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || 'Erreur lors de la generation de la carte astrale.');
  }

  return data;
};
