import React, { useState } from "react";
import { Coins, Gift, X, CheckCircle } from "lucide-react";
import { useReward } from "../../contexts/RewardContext";
import { rewardApi } from "../../api/rewardApi";

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RedeemModal({ isOpen, onClose }: RedeemModalProps) {
  const { points, fetchRewards, fetchHistory, addSessionRedeemedPoints } = useReward();
  const [redeemAmount, setRedeemAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ pointsUsed: number; discountAmount: number } | null>(null);

  if (!isOpen) return null;

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setRedeemAmount(value);
    setSuccess(null);

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

  const handleRedeem = async () => {
    if (error || !redeemAmount) return;
    const amount = Number(redeemAmount);
    if (!Number.isInteger(amount) || amount <= 0 || amount > points) return;

    try {
      setLoading(true);
      const res = await rewardApi.redeemPoints(amount);
      if (res.success) {
        setSuccess({ pointsUsed: res.data.pointsUsed, discountAmount: res.data.discountAmount });
        setRedeemAmount("");
        addSessionRedeemedPoints(res.data.pointsUsed);
        await fetchRewards();
        await fetchHistory();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đổi điểm thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRedeemAmount("");
    setError("");
    setSuccess(null);
    onClose();
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
            onClick={handleClose}
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

          {success ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-center">
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <p className="font-bold text-green-700 text-lg">Đổi điểm thành công!</p>
              <p className="text-green-600 mt-1">
                Đã dùng <strong>{success.pointsUsed.toLocaleString("vi-VN")} điểm</strong> — giảm{" "}
                <strong>{success.discountAmount.toLocaleString("vi-VN")}đ</strong>
              </p>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="border-t border-neutral-100 bg-neutral-50/50 p-6">
          {success ? (
            <button
              onClick={handleClose}
              className="btn w-full rounded-xl border-none bg-neutral-700 py-4 text-lg font-bold text-white shadow-soft transition-all hover:bg-neutral-800"
              type="button"
            >
              Đóng
            </button>
          ) : (
            <button
              onClick={handleRedeem}
              disabled={!!error || !redeemAmount || loading}
              className="btn w-full rounded-xl border-none bg-primary-600 py-4 text-lg font-bold text-white shadow-soft transition-all hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
            >
              {loading ? "Đang xử lý..." : "Đổi điểm"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
