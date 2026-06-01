import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Season } from '@/types';
import * as seasonService from '@/services/seasonService';

interface SeasonContextType {
  seasons: Season[];
  selectedSeason: Season | null;
  selectedSeasonId: string;
  setSelectedSeasonId: (id: string) => void;
  loading: boolean;
  refreshSeasons: () => Promise<void>;
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export const SeasonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedSeasonId, setSelectedSeasonIdState] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadSeasons = useCallback(async () => {
    setLoading(true);
    try {
      const data = await seasonService.getSeasons();
      setSeasons(data);
      
      // Determine default selected season
      // 1. Check if there is a saved season ID in localStorage
      // 2. Otherwise use the active season
      // 3. Otherwise use the first season
      const savedId = localStorage.getItem('selected_season_id');
      const active = data.find((s) => s.isActive);
      
      let defaultSeason = active || data[0] || null;
      if (savedId) {
        const found = data.find((s) => s.id === savedId);
        if (found) defaultSeason = found;
      }

      if (defaultSeason) {
        setSelectedSeason(defaultSeason);
        setSelectedSeasonIdState(defaultSeason.id);
        localStorage.setItem('selected_season_id', defaultSeason.id);
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
    }
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
