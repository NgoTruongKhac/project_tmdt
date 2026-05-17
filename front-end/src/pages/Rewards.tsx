import { useState, useEffect } from "react";
import RewardCard from "../components/rewards/RewardCard";
import RewardHistory from "../components/rewards/RewardHistory";
import RedeemModal from "../components/rewards/RedeemModal";
import { useReward } from "../contexts/RewardContext";
import { Gift, AlertCircle, ShoppingCart } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import { rewardApi } from "../api/rewardApi";
import { useToast } from "../hooks/useToast";

export default function Rewards() {
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const { fetchRewards, fetchHistory } = useReward();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Hàm helper để mô phỏng việc thanh toán và kiếm điểm
  const handleSimulateEarn = async () => {
    try {
      const randomOrder = `DH${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
      // Random price từ 100.000đ đến 2.000.000đ
      const randomPrice = Math.floor(Math.random() * 1900000) + 100000;
      
      await rewardApi.simulatePayment(randomOrder, randomPrice); // <-- oops, need to add this to rewardApi.ts
      
      // We will add it manually or call the endpoint using apiClient directly for simplicity here
      showToast(`Mô phỏng mua hàng ${randomOrder} (${randomPrice.toLocaleString()}đ) thành công!`, "success");
      await fetchRewards();
      await fetchHistory(1);
    } catch (error) {
      showToast("Lỗi mô phỏng", "error");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fafbfc] py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-2">
              Khách hàng thân thiết
            </h1>
            <p className="text-neutral-500 text-lg">
              Tích điểm đổi ngàn ưu đãi hấp dẫn
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsRedeemOpen(true)}
              className="btn bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 rounded-xl shadow-sm px-6"
            >
              <Gift className="w-5 h-5 mr-2 text-primary-500" />
              Đổi điểm
            </button>
            <button 
              onClick={handleSimulateEarn}
              className="btn bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-sm px-6 border-none"
              title="Click để mô phỏng hoàn thành đơn hàng và nhận điểm"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Test Mua hàng
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột trái: Card & Info */}
          <div className="lg:col-span-1 space-y-6">
            <RewardCard />
            
            {/* Guide Card */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-neutral-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-neutral-800">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                Cách thức hoạt động
              </h3>
              <ul className="space-y-4 text-neutral-600 text-sm">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <p>Mua sắm trên website để được tích điểm tự động.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <p>Mỗi <strong className="text-neutral-800">10.000đ</strong> chi tiêu sẽ nhận được <strong className="text-amber-600">1 điểm</strong>.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <p>Dùng điểm để đổi giảm giá đơn hàng (<strong className="text-neutral-800">1 điểm = 100đ</strong>).</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Cột phải: History */}
          <div className="lg:col-span-2">
            <RewardHistory />
          </div>
        </div>
      </div>

      <RedeemModal 
        isOpen={isRedeemOpen} 
        onClose={() => setIsRedeemOpen(false)} 
      />
    </div>
  );
}
