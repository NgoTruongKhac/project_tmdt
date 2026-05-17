import { useState } from "react";
import { changeEmail } from "@/api/authApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newEmail: string) => void; // callback để mở OTP modal
}

export default function ModalChangeEmail({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!newEmail.trim()) {
      setError("Vui lòng nhập email mới.");
      return;
    }
    try {
      setLoading(true);
      await changeEmail(newEmail.trim());
      onClose();
      onSuccess(newEmail.trim()); // mở OTP modal, truyền email để hiển thị
    } catch (err: any) {
      setError(err?.response?.data?.message || "Có lỗi xảy ra.");
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
        <h3 className="font-bold text-lg mb-4">Đổi Email</h3>

        <div className="flex flex-col gap-3">
          <label className="form-control">
            <div className="label">
              <span className="label-text">Email mới</span>
            </div>
            <input
              type="email"
              className="input input-bordered w-full"
              placeholder="Nhập email mới"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
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
            onClick={handleSubmit}
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
