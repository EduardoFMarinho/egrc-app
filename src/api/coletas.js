import { useState, useEffect, useCallback } from "react";
import { API_URL } from '../config';

// Hook para buscar os dados de MetricsWithCollector
export function useGetColetas(formData) {
  const [coletas, setColetas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(
        `${API_URL}MetricsWithCollector`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar os dados de métricas com coleta");
      }

      const data = await response.json();
      setColetas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, formData?.refreshCount]);

  return {
    coletas,
    isLoading,
    error,
    refetch: fetchData,
    coletasEmpty: !coletas?.length,
  };
}
