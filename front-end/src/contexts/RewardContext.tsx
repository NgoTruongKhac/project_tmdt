import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { rewardApi } from "../api/rewardApi";
import type { RewardHistoryItem } from "../api/rewardApi";
import { useAuthStore } from "../stores/useAuthStore";

interface RewardContextType {
  points: number;
  membershipLevel: string;
  history: RewardHistoryItem[];
  loading: boolean;
  sessionRedeemedPoints: number;
  fetchRewards: () => Promise<void>;
  fetchHistory: (page?: number) => Promise<void>;
  addSessionRedeemedPoints: (pts: number) => void;
  resetSessionRedeemedPoints: () => void;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

export const RewardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState<number>(0);
  const [membershipLevel, setMembershipLevel] = useState<string>("Bronze");
  const [history, setHistory] = useState<RewardHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionRedeemedPoints, setSessionRedeemedPoints] = useState<number>(0);

  const user = useAuthStore((state) => state.user);

  const fetchRewards = useCallback(async () => {
    if (!user) {
      setPoints(0);
      setMembershipLevel("Bronze");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await rewardApi.getMyRewards();
      if (res.success) {
        setPoints(res.data.points);
        setMembershipLevel(res.data.membershipLevel);
      }
    } catch (error) {
      console.error("Failed to fetch rewards", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchHistory = useCallback(async (page = 1) => {
    if (!user) return;
    try {
      const res = await rewardApi.getRewardHistory(page);
      if (res.success) {
        setHistory(res.data.history);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    }
  }, [user]);

  const addSessionRedeemedPoints = useCallback((pts: number) => {
    setSessionRedeemedPoints((prev) => prev + pts);
  }, []);

  const resetSessionRedeemedPoints = useCallback(() => {
    setSessionRedeemedPoints(0);
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  return (
    <RewardContext.Provider
      value={{
        points,
        membershipLevel,
        history,
        loading,
        sessionRedeemedPoints,
        fetchRewards,
        fetchHistory,
        addSessionRedeemedPoints,
        resetSessionRedeemedPoints,
      }}
    >
      {children}
    </RewardContext.Provider>
  );
};

export const useReward = () => {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error("useReward must be used within a RewardProvider");
  }
  return context;
};
