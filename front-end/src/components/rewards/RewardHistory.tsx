import { useEffect } from "react";
import { useReward } from "../../contexts/RewardContext";
import { ArrowDownRight, ArrowUpRight, Clock } from "lucide-react";
import dayjs from "dayjs";

export default function RewardHistory() {
  const { history, fetchHistory, loading } = useReward();

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  if (loading && history.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-neutral-100 animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-neutral-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-neutral-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-neutral-800">Lịch sử tích điểm</h3>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
          <p>Chưa có giao dịch tích điểm nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
            const isEarn = item.type === "earn";
            return (
              <div 
                key={item._id} 
                className="flex items-center justify-between p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isEarn ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                    {isEarn ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 text-sm sm:text-base">{item.description}</p>
                    <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                    </p>
                  </div>
                </div>
                <div className={`font-bold text-lg ${isEarn ? "text-green-600" : "text-red-600"}`}>
                  {isEarn ? "+" : "-"}{item.points}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
