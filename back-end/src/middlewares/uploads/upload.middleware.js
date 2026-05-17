import multer from "multer";
import ErrorHandler from "../errors/ErrorHandler.js";

// Cấu hình lưu trữ trong bộ nhớ
const storage = multer.memoryStorage();

// Lọc file: chỉ chấp nhận file ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ErrorHandler("Chỉ chấp nhận file ảnh!", 400), false);
  }
};

// Khởi tạo multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
});
