import { useState } from "react";
import { changePassword } from "../api/authApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalChangePassword({ isOpen, onClose }: Props) {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu mới không khớp.");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    try {
      setLoading(true);
      await changePassword(form.oldPassword, form.newPassword);
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      onClose();
      alert("Đổi mật khẩu thành công!");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đổi mật khẩu thất bại.");
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
        <h3 className="font-bold text-lg mb-4">Đổi mật khẩu</h3>

        <div className="flex flex-col gap-3">
          <label className="form-control">
            <div className="label">
              <span className="label-text">Mật khẩu cũ</span>
            </div>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Nhập mật khẩu cũ"
              value={form.oldPassword}
              onChange={(e) =>
                setForm({ ...form, oldPassword: e.target.value })
              }
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Mật khẩu mới</span>
            </div>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Nhập mật khẩu mới"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text">Xác nhận mật khẩu mới</span>
            </div>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder="Nhập lại mật khẩu mới"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
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
