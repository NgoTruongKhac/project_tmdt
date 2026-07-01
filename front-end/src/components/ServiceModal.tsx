import { useState, type ChangeEvent, type FormEvent } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { createServiceProduct } from "@/api/serviceApi";

interface ServiceModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  designerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ServiceModal({
  isOpen,
  mode,
  designerId,
  onClose,
  onSuccess,
}: ServiceModalProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // Quản lý file ảnh chọn từ máy
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  // Xử lý sự kiện chọn file & tạo URL xem trước ảnh
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      const previewsArray = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previewsArray]);
    }
  };

  // Xóa ảnh đã chọn trước khi upload
  const removeImage = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]); // Giải phóng bộ nhớ URL preview
      return prev.filter((_, i) => i !== index);
    });
  };

  // Reset toàn bộ form về ban đầu
  const resetForm = () => {
    setTitle("");
    setPrice("");
    setCategory("");
    setDescription("");
    setSelectedFiles([]);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Submit gửi dữ liệu lên Server thông qua API
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !price || !category || selectedFiles.length === 0) {
      setError(
        "Vui lòng điền đầy đủ các thông tin bắt buộc và chọn ít nhất 1 hình ảnh.",
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("designerId", designerId);

      // Đẩy toàn bộ mảng ảnh đã lựa chọn vào cấu trúc formData
      selectedFiles.forEach((file) => {
        formData.append("files", file); // Trường nhận diện file trùng với req.files của backend
      });

      await createServiceProduct(formData);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Lỗi tạo sản phẩm, vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl relative">
        {/* Nút đóng modal góc trên bên phải */}
        <button
          onClick={handleClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          type="button"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-xl font-bold mb-4">
          {mode === "create" ? "Tạo sản phẩm mới" : "Chỉnh sửa sản phẩm"}
        </h3>

        {error && (
          <div className="alert alert-error mb-4 py-2 text-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên sản phẩm */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Tên sản phẩm/Dịch vụ <span className="text-error">*</span>
              </span>
            </label>
            <input
              type="text"
              placeholder="Nhập tiêu đề sản phẩm..."
              className="input input-bordered w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Giá cả */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Giá sản phẩm (VNĐ) <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="number"
                placeholder="Ví dụ: 500000"
                className="input input-bordered w-full"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
              />
            </div>

            {/* Danh mục (Do trường này required trong Schema của bạn) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Danh mục thiết kế <span className="text-error">*</span>
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Chọn danh mục</option>

                {/* Dịch vụ thiết kế */}
                <option value="poster">Thiết kế Poster</option>
                <option value="banner">Thiết kế Banner</option>
                <option value="social-media">
                  Thiết kế Social Media (Facebook, Instagram...)
                </option>
                <option value="business">
                  Thiết kế Business Card / Hồ sơ doanh nghiệp
                </option>
                <option value="event">Thiết kế Sự kiện & Triển lãm</option>
                <option value="branding">
                  Thiết kế Bộ nhận diện thương hiệu
                </option>
                <option value="combo">Gói thiết kế Combo</option>

                {/* Ngành hàng */}
                <option value="beauty">Làm đẹp & Thẩm mỹ</option>
                <option value="fashion">Thời trang</option>
                <option value="food">Ẩm thực & Nhà hàng</option>
                <option value="real-estate">Bất động sản</option>
                <option value="tech">Công nghệ & Điện tử</option>
                <option value="ecommerce">Thương mại điện tử</option>

                {/* Khác */}
                <option value="other">Danh mục khác</option>
              </select>
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div className="form-control space-y-2">
            <div>
              <label className="label p-0">
                <span className="label-text font-semibold text-base">
                  Mô tả chi tiết
                </span>
              </label>
            </div>

            <textarea
              placeholder={`Ví dụ:
• Thiết kế 3 phương án logo.
• Chỉnh sửa tối đa 5 lần.
• Bàn giao file AI, PDF, PNG chất lượng cao.`}
              className="textarea textarea-bordered w-full min-h-[120px] resize-y leading-6 focus:outline-none focus:border-primary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="text-right text-xs text-base-content/50">
              {description.length} ký tự
            </div>
          </div>

          {/* Chọn hình ảnh sản phẩm */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Hình ảnh sản phẩm (Tối thiểu 1 ảnh gốc){" "}
                <span className="text-error">*</span>
              </span>
            </label>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Nút bấm giả kích hoạt chọn file ẩn */}
              <label className="border-2 border-dashed border-base-300 hover:border-primary cursor-pointer rounded-xl h-24 w-24 flex flex-col items-center justify-center gap-1 transition text-base-content/60">
                <Upload className="h-5 w-5" />
                <span className="text-xs">Tải ảnh</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* Danh sách ảnh xem trước */}
              {imagePreviews.map((previewUrl, index) => (
                <div
                  key={index}
                  className="relative h-24 w-24 rounded-xl overflow-hidden border border-base-300 group"
                >
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-error text-white rounded-full p-1 transition opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Khối nút Hành động đáy modal */}
          <div className="modal-action">
            <button
              type="button"
              onClick={handleClose}
              className="btn"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary min-w-[120px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Tạo sản phẩm"
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </dialog>
  );
}
