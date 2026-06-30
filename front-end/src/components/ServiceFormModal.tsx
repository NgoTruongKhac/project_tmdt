import { useEffect, useState } from "react";
import { X, Save, ImagePlus } from "lucide-react";
import type { ServicePackage } from "@/api/serviceApi";
import { createServicePackage, updateServicePackage } from "@/api/serviceApi";

interface ServiceFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  designerId: string;
  service: ServicePackage | null; // truyền vào khi mode === "edit"
  onClose: () => void;
  onSuccess: () => void; // gọi lại để load lại danh sách sau khi lưu thành công
}

interface FormState {
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  listingType: "hire" | "package" | "product";
  deliveryTime: string;
  revisions: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  listingType: "package",
  deliveryTime: "3",
  revisions: "0",
};

export default function ServiceFormModal({
  isOpen,
  mode,
  designerId,
  service,
  onClose,
  onSuccess,
}: ServiceFormModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "edit" && service) {
      setForm({
        name: service.name,
        description: service.description,
        price: String(service.price),
        discountPrice: service.discountPrice
          ? String(service.discountPrice)
          : "",
        category: service.category,
        listingType: service.listingType,
        deliveryTime: String(service.deliveryTime),
        revisions: String(service.revisions),
      });
      setPreviewUrl(service.thumbnail);
    } else {
      setForm(emptyForm);
      setPreviewUrl("");
    }
    setThumbnailFile(null);
    setError("");
  }, [mode, service, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.price || !form.category) {
      setError("Vui lòng điền đầy đủ Tên dịch vụ, Giá và Danh mục");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    if (form.discountPrice)
      formData.append("discountPrice", form.discountPrice);
    formData.append("category", form.category);
    formData.append("listingType", form.listingType);
    formData.append("deliveryTime", form.deliveryTime);
    formData.append("revisions", form.revisions);
    formData.append("designer", designerId);
    if (thumbnailFile) formData.append("images", thumbnailFile);

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createServicePackage(formData);
      } else if (service) {
        await updateServicePackage(service._id, formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Đã có lỗi xảy ra, vui lòng thử lại",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="text-lg font-bold">
          {mode === "create" ? "Tạo dịch vụ mới" : "Chỉnh sửa dịch vụ"}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {error && (
            <div className="alert alert-error py-2 text-sm">
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-lg bg-base-200">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-base-content/40">
                  <ImagePlus className="h-6 w-6" />
                </div>
              )}
            </div>
            <label className="form-control">
              <span className="label-text mb-1">Ảnh đại diện dịch vụ</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input file-input-bordered file-input-sm"
              />
            </label>
          </div>

          {/* Tên dịch vụ */}
          <div className="form-control space-y-2">
            <div>
              <label className="label p-0">
                <span className="label-text font-semibold text-base">
                  Tên dịch vụ <span className="text-error">*</span>
                </span>
              </label>
            </div>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Ví dụ: Thiết kế logo thương hiệu"
              required
            />
          </div>

          {/* Mô tả dịch vụ */}
          <div className="form-control space-y-2">
            <div>
              <label className="label p-0">
                <span className="label-text font-semibold text-base">
                  Mô tả dịch vụ
                </span>
              </label>
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="textarea textarea-bordered w-full min-h-[120px] resize-y leading-6"
              placeholder={`Ví dụ:
• Thiết kế 3 phương án logo.
• Chỉnh sửa miễn phí tối đa 5 lần.
• Bàn giao đầy đủ file AI, PDF, PNG.`}
            />

            <div className="text-right text-xs text-base-content/50">
              {form.description.length} ký tự
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text mb-1">Giá (đ) *</span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="input input-bordered"
                min={0}
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Giá khuyến mãi (đ)</span>
              <input
                type="number"
                name="discountPrice"
                value={form.discountPrice}
                onChange={handleChange}
                className="input input-bordered"
                min={0}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text mb-1 font-medium text-sm">
                Danh mục *
              </span>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="" disabled>
                  -- Chọn danh mục dịch vụ --
                </option>

                {/* Nhóm dịch vụ thiết kế */}
                <option value="poster">Thiết kế Poster</option>
                <option value="banner">Thiết kế Banner</option>
                <option value="social-media">
                  Social Media (Facebook, Instagram...)
                </option>
                <option value="business">
                  Doanh nghiệp (Business Card, Profile...)
                </option>
                <option value="event">Sự kiện & Triển lãm</option>
                <option value="branding">
                  Nhận diện thương hiệu (Branding / Logo)
                </option>
                <option value="combo">Gói thiết kế Combo</option>

                {/* Nhóm ngành hàng cụ thể */}
                <option value="beauty">Làm đẹp & Thẩm mỹ (Beauty)</option>
                <option value="fashion">Thời trang (Fashion)</option>
                <option value="food">Ẩm thực & Nhà hàng (Food)</option>
                <option value="real-estate">Bất động sản (Real Estate)</option>
                <option value="tech">Công nghệ & Điện tử (Tech)</option>
                <option value="ecommerce">
                  Thương mại điện tử (Ecommerce)
                </option>

                {/* Khác */}
                <option value="other">Danh mục khác (Other)</option>
              </select>
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Loại hình</span>
              <select
                name="listingType"
                value={form.listingType}
                onChange={handleChange}
                className="select select-bordered"
              >
                <option value="package">Gói thiết kế</option>
                <option value="hire">Thuê designer</option>
                <option value="product">Sản phẩm thiết kế</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text mb-1">Thời gian giao (ngày)</span>
              <input
                type="number"
                name="deliveryTime"
                value={form.deliveryTime}
                onChange={handleChange}
                className="input input-bordered"
                min={1}
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Số lần chỉnh sửa</span>
              <input
                type="number"
                name="revisions"
                value={form.revisions}
                onChange={handleChange}
                className="input input-bordered"
                min={0}
              />
            </label>
          </div>

          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn">
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {mode === "create" ? "Tạo dịch vụ" : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
