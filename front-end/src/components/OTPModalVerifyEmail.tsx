import { useState } from "react";
import { verifyChangeEmail } from "@/api/authApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  newEmail: string;
  onSuccess: () => void; // callback sau khi đổi email xong
}

export default function OTPModalVerifyEmail({
  isOpen,
  onClose,
  newEmail,
  onSuccess,
}: Props) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");
    if (!otp.trim()) {
      setError("Vui lòng nhập OTP.");
      return;
    }
    try {
      setLoading(true);
      await verifyChangeEmail(otp.trim());
      onClose();
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "OTP không hợp lệ.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg mb-2">Xác minh OTP</h3>
        <p className="text-sm text-base-content/70 mb-4">
          Mã OTP đã được gửi đến{" "}
          <span className="font-semibold">{newEmail}</span>. Có hiệu lực trong 2
          phút.
        </p>

        <div className="flex flex-col gap-3">
          <label className="form-control">
            <div className="label">
              <span className="label-text">Mã OTP</span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full tracking-widest text-center text-xl"
              placeholder="______"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
          </label>
          {error && <p className="text-error text-sm">{error}</p>}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Hủy
          </button>
          <button
            className="btn btn-primary"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Xác nhận"
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
