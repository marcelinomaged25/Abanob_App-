import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Season } from '@/types';
import * as seasonService from '@/services/seasonService';

interface SeasonContextType {
  seasons: Season[];
  selectedSeason: Season | null;
  selectedSeasonId: string;
  setSelectedSeasonId: (id: string) => void;
  loading: boolean;
  refreshSeasons: (preferredSeasonId?: string) => Promise<void>;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export const SeasonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedSeasonId, setSelectedSeasonIdState] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadSeasons = useCallback(async (preferredSeasonId?: string) => {
    setLoading(true);
    try {
      const data = await seasonService.getSeasons();
      setSeasons(data);

      const savedId = localStorage.getItem('selected_season_id');
      if (savedId && !data.some((s) => s.id === savedId)) {
        localStorage.removeItem('selected_season_id');
      }

      const preferred = preferredSeasonId
        ? data.find((s) => s.id === preferredSeasonId)
        : null;
      const active = data.find((s) => s.isActive);
      const saved = savedId ? data.find((s) => s.id === savedId) : null;

      const defaultSeason = preferred || active || saved || data[0] || null;

      if (defaultSeason) {
        setSelectedSeason(defaultSeason);
        setSelectedSeasonIdState(defaultSeason.id);
        localStorage.setItem('selected_season_id', defaultSeason.id);
      } else {
        setSelectedSeason(null);
        setSelectedSeasonIdState('');
        localStorage.removeItem('selected_season_id');
      }
    } catch (error) {
      console.error('Failed to load seasons in context', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeasons();
  }, [loadSeasons]);

  const setSelectedSeasonId = (id: string) => {
    const found = seasons.find((s) => s.id === id);
    if (found) {
      setSelectedSeason(found);
      setSelectedSeasonIdState(id);
      localStorage.setItem('selected_season_id', id);
      return;
    }

    localStorage.removeItem('selected_season_id');
    setSelectedSeason(null);
    setSelectedSeasonIdState('');
  };

  return (
    <SeasonContext.Provider
      value={{
        seasons,
        selectedSeason,
        selectedSeasonId,
        setSelectedSeasonId,
        loading,
        refreshSeasons: loadSeasons,
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeasonContext = () => {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error('useSeasonContext must be used within a SeasonProvider');
  }
  return context;
};
