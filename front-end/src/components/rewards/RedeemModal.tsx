import React, { useState } from "react";
import { useReward } from "../../contexts/RewardContext";
import { rewardApi } from "../../api/rewardApi";
import { useToast } from "../../hooks/useToast";
import { Coins, X, Gift } from "lucide-react";

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RedeemModal({ isOpen, onClose }: RedeemModalProps) {
  const { points, fetchRewards, fetchHistory } = useReward();
  const { showToast } = useToast();
  const [redeemAmount, setRedeemAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRedeemAmount(val);
    
    if (val === "") {
      setError("");
      return;
    }
    
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      setError("Số điểm phải lớn hơn 0");
    } else if (num > points) {
      setError(`Bạn chỉ có tối đa ${points} điểm`);
    } else {
      setError("");
    }
  };

  const handleRedeem = async () => {
    const num = parseInt(redeemAmount, 10);
    if (!num || isNaN(num) || num <= 0 || num > points) {
      setError("Số điểm không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const res = await rewardApi.redeemPoints(num);
      if (res.success) {
        showToast("Đổi điểm thành công!", "success");
        await fetchRewards();
        await fetchHistory(1);
        onClose();
        setRedeemAmount("");
      } else {
        showToast(res.message || "Đổi điểm thất bại", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Đổi điểm thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-neutral-100">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Gift className="text-primary-500 w-6 h-6" />
            Đổi điểm thưởng
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-neutral-50 rounded-2xl p-4 flex items-center justify-between mb-6 border border-neutral-100">
            <span className="text-neutral-600 font-medium">Điểm hiện có</span>
            <span className="font-bold text-lg text-amber-600 flex items-center gap-1">
              <Coins className="w-5 h-5" /> {points.toLocaleString()}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Nhập số điểm muốn đổi
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={redeemAmount}
                  onChange={handleAmountChange}
                  placeholder="Ví dụ: 100"
                  className={`w-full p-4 pr-16 bg-white border ${error ? 'border-red-400 focus:border-red-500 ring-red-100' : 'border-neutral-200 focus:border-primary-500 ring-primary-100'} rounded-xl focus:outline-none focus:ring-4 transition-all font-medium text-lg`}
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-primary-600 hover:text-primary-700"
                  onClick={() => handleAmountChange({ target: { value: String(points) } } as any)}
                >
                  Tất cả
                </button>
              </div>
              {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
            </div>

            <div className="bg-blue-50 text-blue-800 rounded-xl p-4 text-center">
              <span className="block text-sm font-medium mb-1">Giá trị quy đổi</span>
              <span className="text-2xl font-bold">
                {parseInt(redeemAmount) > 0 && !error 
                  ? (parseInt(redeemAmount) * 100).toLocaleString() 
                  : 0}đ
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-100 bg-neutral-50/50">
          <button
            onClick={handleRedeem}
            disabled={loading || !!error || !redeemAmount}
            className="w-full btn bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-4 border-none text-lg font-bold shadow-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <span className="loading loading-spinner"></span> : "Đổi điểm ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}
