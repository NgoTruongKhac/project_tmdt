import { useState, type ChangeEvent } from "react";
import { transferRoleDesigner } from "../api/userApi";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SKILL_SUGGESTIONS = [
  "Figma",
  "Adobe XD",
  "Illustrator",
  "Photoshop",
  "UI/UX",
  "Branding",
  "Motion Design",
  "3D Modeling",
];

export default function ModalUploadDesignerProfile({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    age: "",
    degree: "",
    major: "",
    experienceYears: "",
    portfolioUrl: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]); // Lưu trữ file thật
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) =>
    setSkills(skills.filter((s) => s !== skill));

  // Xử lý khi chọn file ảnh chứng chỉ
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Giới hạn tối đa 5 file ảnh tổng cộng
      if (certificateFiles.length + selectedFiles.length > 5) {
        setError("Bạn chỉ được phép tải lên tối đa 5 ảnh chứng chỉ.");
        return;
      }

      setError("");
      setCertificateFiles([...certificateFiles, ...selectedFiles]);
    }
  };

  // Xóa ảnh khỏi danh sách chuẩn bị upload
  const removeFile = (index: number) => {
    setCertificateFiles(certificateFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.age || !form.degree || !form.major || !form.experienceYears) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      setLoading(true);

      // Khởi tạo FormData để gửi lên Backend
      const formData = new FormData();
      formData.append("age", String(form.age));
      formData.append("degree", form.degree);
      formData.append("major", form.major);
      formData.append("experienceYears", String(form.experienceYears));
      formData.append("portfolioUrl", form.portfolioUrl);

      // Chuyển mảng skills thành chuỗi JSON để phía Backend dễ dàng phân tách
      formData.append("skills", JSON.stringify(skills));

      // Append từng file ảnh chứng chỉ vào FormData (cùng key 'certificateImages')
      certificateFiles.forEach((file) => {
        formData.append("certificateImages", file);
      });

      // Gọi API với đối tượng formData vừa tạo
      await transferRoleDesigner(formData);

      onSuccess?.();
      onClose();
      toast.success("Bạn đã nâng cấp lên Designer thành công!");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Nâng cấp thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 text-primary p-2 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347a3.5 3.5 0 00-1.072 2.342V19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-.333a3.5 3.5 0 00-1.072-2.342l-.347-.347z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">Nâng cấp lên Designer</h3>
            <p className="text-sm text-base-content/60">
              Điền thông tin chuyên môn của bạn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="form-control">
            <div className="label">
              <span className="label-text">
                Tuổi <span className="text-error">*</span>
              </span>
            </div>
            <input
              type="number"
              min={0}
              className="input input-bordered w-full"
              placeholder="VD: 25"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text">
                Số năm kinh nghiệm <span className="text-error">*</span>
              </span>
            </div>
            <input
              type="number"
              min={0}
              className="input input-bordered w-full"
              placeholder="VD: 3"
              value={form.experienceYears}
              onChange={(e) =>
                setForm({ ...form, experienceYears: e.target.value })
              }
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text">
                Bằng cấp <span className="text-error">*</span>
              </span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="VD: Cử nhân"
              value={form.degree}
              onChange={(e) => setForm({ ...form, degree: e.target.value })}
            />
          </label>

          <label className="form-control">
            <div className="label">
              <span className="label-text">
                Chuyên ngành <span className="text-error">*</span>
              </span>
            </div>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="VD: Thiết kế đồ họa"
              value={form.major}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
            />
          </label>
        </div>

        <label className="form-control mt-3">
          <div className="label">
            <span className="label-text">Portfolio URL</span>
          </div>
          <input
            type="url"
            className="input input-bordered w-full"
            placeholder="https://yourportfolio.com"
            value={form.portfolioUrl}
            onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
          />
        </label>

        {/* Thêm phần upload ảnh chứng chỉ */}
        <div className="form-control mt-3">
          <div className="label">
            <span className="label-text font-medium">
              Bằng cấp, chứng chỉ (Tối đa 5 ảnh)
            </span>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            className="file-input file-input-bordered file-input-primary w-full"
            onChange={handleFileChange}
            disabled={certificateFiles.length >= 5}
          />

          {/* Hiển thị Preview danh sách tên file ảnh đã chọn để upload */}
          {certificateFiles.length > 0 && (
            <div className="flex flex-col gap-1 mt-2 bg-base-200 p-2 rounded-lg text-xs">
              {certificateFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-base-100 p-1.5 rounded border border-base-300"
                >
                  <span className="truncate max-w-[85%]">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error p-0 h-auto min-h-0"
                    onClick={() => removeFile(index)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="form-control mt-3">
          <div className="label">
            <span className="label-text">Kỹ năng</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Nhập kỹ năng..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSkill(skillInput)}
            />
            <button
              className="btn btn-outline btn-sm h-12"
              onClick={() => addSkill(skillInput)}
            >
              Thêm
            </button>
          </div>
          {/* Suggestions */}
          <div className="flex flex-wrap gap-1 mt-2">
            {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).map((s) => (
              <button
                key={s}
                className="badge badge-ghost cursor-pointer hover:badge-primary transition-colors"
                onClick={() => addSkill(s)}
              >
                {s}
              </button>
            ))}
          </div>
          {/* Selected skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {skills.map((s) => (
                <div key={s} className="badge badge-primary gap-1">
                  {s}
                  <button
                    onClick={() => removeSkill(s)}
                    className="hover:text-error"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error mt-3 py-2 text-sm">{error}</div>
        )}

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
              "Nâng cấp ngay"
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}
