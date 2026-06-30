import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coins, Gift, X } from "lucide-react";
import { useReward } from "../../contexts/RewardContext";

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RedeemModal({ isOpen, onClose }: RedeemModalProps) {
  const { points } = useReward();
  const navigate = useNavigate();
  const [redeemAmount, setRedeemAmount] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setRedeemAmount(value);

    if (value === "") {
      setError("");
      return;
    }

    const amount = Number(value);
    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Số điểm phải lớn hơn 0");
    } else if (amount > points) {
      setError(`Bạn chỉ có tối đa ${points} điểm`);
    } else {
      setError("");
    }
  };

  const goToMarketplace = () => {
    if (error) return;
    onClose();
    navigate("/services-marketplace");
  };

  const previewPoints = Number(redeemAmount) > 0 && !error ? Number(redeemAmount) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-100 p-6">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <Gift className="h-6 w-6 text-primary-500" />
            Đổi điểm thưởng
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50 p-4">
            <span className="font-medium text-neutral-600">Điểm hiện có</span>
            <span className="flex items-center gap-1 text-lg font-bold text-amber-600">
              <Coins className="h-5 w-5" /> {points.toLocaleString("vi-VN")}
            </span>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-neutral-700">
              Nhập số điểm muốn dùng
            </label>
            <div className="relative">
              <input
                type="number"
                value={redeemAmount}
                onChange={handleAmountChange}
                placeholder="Ví dụ: 100"
                className={`w-full rounded-xl border bg-white p-4 pr-16 text-lg font-medium outline-none transition-all focus:ring-4 ${
                  error
                    ? "border-red-400 ring-red-100 focus:border-red-500"
                    : "border-neutral-200 ring-primary-100 focus:border-primary-500"
                }`}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-primary-600 hover:text-primary-700"
                onClick={() => handleAmountChange({ target: { value: String(points) } } as any)}
                type="button"
              >
                Tất cả
              </button>
            </div>
            {error && <p className="mt-2 text-sm font-medium text-red-500">{error}</p>}
          </div>

          <div className="rounded-xl bg-blue-50 p-4 text-center text-blue-800">
            <span className="mb-1 block text-sm font-medium">Giá trị giảm dự kiến</span>
            <span className="text-2xl font-bold">
              {(previewPoints * 100).toLocaleString("vi-VN")}đ
            </span>
          </div>
        </div>

        <div className="border-t border-neutral-100 bg-neutral-50/50 p-6">
          <button
            onClick={goToMarketplace}
            disabled={!!error}
            className="btn w-full rounded-xl border-none bg-primary-600 py-4 text-lg font-bold text-white shadow-soft transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            Dùng điểm khi mua hàng
          </button>
        </div>
      </div>
    </div>
  );
}
