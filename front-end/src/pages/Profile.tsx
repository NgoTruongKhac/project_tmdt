import { useEffect, useRef, useState } from "react";
import {
  getCurrentUser,
  updateProfile,
  updateProfilePicture,
} from "../api/userApi";

import ModalChangePassword from "@/components/ModalChangePassword";
import ModalUploadDesignerProfile from "@/components/ModalUploadDesignerProfile";
import ModalChangeEmail from "@/components/ModalChangeEmail";
import OTPModalVerifyEmail from "@/components/OTPModalVerifyEmail";

interface DesignerProfile {
  age: number;
  degree: string;
  major: string;
  experienceYears: number;
  portfolioUrl: string;
  skills: string[];
}

interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  profilePicture: string;
  googleId?: string;

  role: "CUSTOMER" | "DESIGNER" | "ADMIN";

  designerProfile?: DesignerProfile | null;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [fullName, setFullName] = useState("");

  const [editingName, setEditingName] = useState(false);

  const [loadingName, setLoadingName] = useState(false);

  const [loadingPicture, setLoadingPicture] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const [showDesignerModal, setShowDesignerModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Thêm state lưu email đang chờ xác minh
  const [pendingEmail, setPendingEmail] = useState("");

  // Handler khi changeEmail thành công
  const handleChangeEmailSuccess = (newEmail: string) => {
    setPendingEmail(newEmail);
    setShowOtpModal(true);
  };

  // Handler khi verifyChangeEmail thành công — refetch user
  const handleVerifyEmailSuccess = () => {
    fetchUser(); // cập nhật email mới trên UI
  };

  const fetchUser = async () => {
    try {
      const data = await getCurrentUser();

      console.log("USER DATA:", data);

      setUser(data);
      setFullName(data.fullName);
    } catch (err) {
      console.error("Lỗi tải thông tin người dùng:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  const isGoogleAccount = !!user?.googleId;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setLoadingPicture(true);

      const res = await updateProfilePicture(file);

      setUser((prev) =>
        prev ? { ...prev, profilePicture: res.profilePicture } : prev,
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cập nhật ảnh thất bại.");
    } finally {
      setLoadingPicture(false);
    }
  };

  const handleSaveName = async () => {
    if (!fullName.trim()) return;

    try {
      setLoadingName(true);

      const res = await updateProfile(fullName.trim());

      setUser((prev) =>
        prev
          ? {
              ...prev,
              fullName: res.fullName,
            }
          : prev,
      );

      setEditingName(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Cập nhật tên thất bại.");
    } finally {
      setLoadingName(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const avatarFallback = user.fullName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-base-200 flex justify-center p-4 py-10 overflow-y-auto">
      <div className="card bg-base-100 shadow-2xl w-full max-w-2xl">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary via-secondary to-accent rounded-t-2xl" />

        <div className="card-body pt-0 -mt-14">
          {/* Avatar + Role */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="avatar">
                <div className="w-28 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-4 shadow-lg">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="avatar"
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-primary text-primary-content flex items-center justify-center text-4xl font-bold w-full h-full">
                      {avatarFallback}
                    </div>
                  )}
                </div>
              </div>

              {/* Upload overlay */}
              <button
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
                disabled={loadingPicture}
              >
                {loadingPicture ? (
                  <span className="loading loading-spinner loading-sm text-white" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* Role */}
            <div
              className={`badge badge-lg mt-4 px-4 py-3 font-semibold ${
                user.role === "DESIGNER"
                  ? "badge-secondary"
                  : user.role === "ADMIN"
                    ? "badge-error"
                    : "badge-primary badge-outline"
              }`}
            >
              {user.role}
            </div>
          </div>

          {/* Basic Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full name */}
            <div className="md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Họ và tên</span>
              </label>

              {editingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    autoFocus
                  />

                  <button
                    className="btn btn-primary"
                    onClick={handleSaveName}
                    disabled={loadingName}
                  >
                    {loadingName ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      "Lưu"
                    )}
                  </button>

                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setEditingName(false);
                      setFullName(user.fullName);
                    }}
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    value={user.fullName}
                    readOnly
                  />

                  <button
                    className="btn btn-outline"
                    onClick={() => setEditingName(true)}
                  >
                    Chỉnh sửa
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Email</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="email"
                  className="input input-bordered flex-1"
                  value={user.email}
                  readOnly
                />
                <button
                  className={`btn ${
                    isGoogleAccount ? "btn-disabled" : "btn-outline"
                  }`}
                  onClick={() => setShowChangeEmail(true)}
                  disabled={isGoogleAccount}
                  title={
                    isGoogleAccount
                      ? "Tài khoản Google không thể thay đổi email"
                      : ""
                  }
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>

          {/* Designer Section */}
          {user.role === "DESIGNER" && user.designerProfile && (
            <>
              <div className="divider text-lg font-bold mt-8">
                Designer Profile
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Age</span>
                  </label>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={user.designerProfile.age}
                    readOnly
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Experience</span>
                  </label>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={`${user.designerProfile.experienceYears} years`}
                    readOnly
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Degree</span>
                  </label>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={user.designerProfile.degree}
                    readOnly
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Major</span>
                  </label>

                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={user.designerProfile.major}
                    readOnly
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium">
                      Portfolio URL
                    </span>
                  </label>

                  <a
                    href={user.designerProfile.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="link link-primary break-all text-sm"
                  >
                    {user.designerProfile.portfolioUrl}
                  </a>
                </div>

                <div className="md:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium">Skills</span>
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {user.designerProfile.skills.map((skill) => (
                      <div
                        key={skill}
                        className="badge badge-secondary badge-lg"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="divider mt-8" />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="btn btn-outline btn-neutral flex-1"
              onClick={() => setShowChangePassword(true)}
            >
              Đổi mật khẩu
            </button>

            {user.role === "CUSTOMER" && (
              <button
                className="btn btn-primary flex-1"
                onClick={() => setShowDesignerModal(true)}
              >
                Nâng cấp lên Designer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ModalChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      <ModalChangeEmail
        isOpen={showChangeEmail}
        onClose={() => setShowChangeEmail(false)}
        onSuccess={handleChangeEmailSuccess}
      />
      <OTPModalVerifyEmail
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        newEmail={pendingEmail}
        onSuccess={handleVerifyEmailSuccess}
      />

      {user.role === "CUSTOMER" && (
        <ModalUploadDesignerProfile
          isOpen={showDesignerModal}
          onClose={() => setShowDesignerModal(false)}
          onSuccess={fetchUser}
        />
      )}
    </div>
  );
}
