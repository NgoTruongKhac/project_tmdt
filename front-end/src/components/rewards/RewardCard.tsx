import React from "react";
import { Crown, Star, Shield, Gem } from "lucide-react";
import { useReward } from "../../contexts/RewardContext";

export default function RewardCard() {
  const { points, membershipLevel } = useReward();

  const rankConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; nextLevel: string; target: number }> = {
    Bronze: { icon: <Star className="w-12 h-12" />, color: "text-amber-700", bg: "bg-amber-100/50", nextLevel: "Silver", target: 500 },
    Silver: { icon: <Shield className="w-12 h-12" />, color: "text-slate-500", bg: "bg-slate-100", nextLevel: "Gold", target: 2000 },
    Gold: { icon: <Crown className="w-12 h-12" />, color: "text-yellow-600", bg: "bg-yellow-100/50", nextLevel: "Platinum", target: 5000 },
    Platinum: { icon: <Gem className="w-12 h-12" />, color: "text-purple-600", bg: "bg-purple-100/50", nextLevel: "MAX", target: 5000 },
  };

  const currentRank = rankConfig[membershipLevel] || rankConfig["Bronze"];
  
  // Lấy tổng điểm đã kiếm được từ lịch sử (ở context chỉ lưu current points, 
  // nên tạm tính progress dựa trên current points hoặc target cố định. 
  // Để đơn giản ta dùng points hiện tại làm mô phỏng progress).
  // Trong thực tế, membership progress dựa trên tổng earn history.
  // Ở đây dùng `points` cho mục đích visual.
  const progressPercent = membershipLevel === "Platinum" ? 100 : Math.min(100, (points / currentRank.target) * 100);

  return (
    <div className={`rounded-3xl p-6 sm:p-8 shadow-soft border border-neutral-100 ${currentRank.bg} relative overflow-hidden`}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-10">
        {currentRank.icon}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-4 rounded-2xl bg-white shadow-sm ${currentRank.color}`}>
            {currentRank.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
              {membershipLevel} Member
            </h2>
            <p className="text-neutral-600 font-medium">{points.toLocaleString()} điểm hiện có</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 bg-white p-5 rounded-2xl shadow-sm border border-neutral-100/50">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-neutral-700">Tiến trình hạng</span>
            <span className="text-xs font-medium text-neutral-500">
              {membershipLevel === "Platinum" ? "Hạng cao nhất" : `Đích: ${currentRank.target} điểm`}
            </span>
          </div>
          
          <div className="w-full bg-neutral-100 rounded-full h-3 mb-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-primary-400 to-primary-600`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          {membershipLevel !== "Platinum" && (
            <p className="text-sm text-neutral-500">
              Còn <strong className="text-primary-600">{Math.max(0, currentRank.target - points).toLocaleString()} điểm</strong> nữa để lên hạng <strong className="text-neutral-800">{currentRank.nextLevel}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
