import moment from "moment";
import crypto from "crypto";
import { Payment } from "../models/payment.model.js";
import { Service } from "../models/service.model.js";
import ErrorHandler from "../middlewares/errors/ErrorHandler.js";
import axios from "axios";
import sharp from "sharp";

// Thông tin Merchant mới bạn cung cấp
const VNP_TMNCODE = "5A8YSOL6";
const VNP_HASHSECRET = "RG5T97BVVE62VOG3XKUJMCPDSOUCZPO8";
const VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_RETURNURL = "http://localhost:5173/payment-success";

export const createPaymentUrl = async (req, res, next) => {
    try {
        const { serviceId } = req.body;
        const userId = req.userId;

        const service = await Service.findById(serviceId);
        if (!service) throw new ErrorHandler("Dịch vụ không tồn tại", 404);

        const date = new Date();
        const createDate = moment(date).format("YYYYMMDDHHmmss");
        const orderId = moment(date).format("HHmmss") + Math.floor(Math.random() * 1000);

        await Payment.create({
            orderId,
            userId,
            serviceId,
            amount: service.price,
            status: "pending"
        });

        let vnp_Params = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": VNP_TMNCODE,
            "vnp_Locale": "vn",
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": orderId,
            "vnp_OrderInfo": "Thanh toan dich vu " + orderId,
            "vnp_OrderType": "other",
            "vnp_Amount": Math.round(service.price * 100),
            "vnp_ReturnUrl": VNP_RETURNURL,
            "vnp_IpAddr": "127.0.0.1",
            "vnp_CreateDate": createDate,
        };

        // 1. Sắp xếp tham số theo alphabet (Giống Collections.sort trong Java của bạn)
        const sortedParams = {};
        Object.keys(vnp_Params).sort().forEach(key => {
            sortedParams[key] = vnp_Params[key];
        });

        // 2. Tạo chuỗi ký (signData) và chuỗi truy vấn (query)
        // PHẢI MÔ PHỎNG GIỐNG JAVA: encodeURIComponent nhưng thay %20 bằng dấu +
        let signData = "";
        let query = "";
        const keys = Object.keys(sortedParams);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = sortedParams[key];

            // Hàm encode chuẩn VNPay: Dấu cách thành dấu +
            const encodedKey = encodeURIComponent(key).replace(/%20/g, "+");
            const encodedValue = encodeURIComponent(value).replace(/%20/g, "+");

            signData += encodedKey + "=" + encodedValue;
            query += encodedKey + "=" + encodedValue;

            if (i < keys.length - 1) {
                signData += "&";
                query += "&";
            }
        }

        // 3. Tạo chữ ký HmacSHA512 (Giống hmacSHA512 trong Config.java)
        const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const finalUrl = VNP_URL + "?" + query + "&vnp_SecureHash=" + signed;

        res.status(200).json({ paymentUrl: finalUrl });
    } catch (error) {
        next(error);
    }
};

export const vnpayReturn = async (req, res, next) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params["vnp_SecureHash"];

        delete vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHashType"];

        // Sắp xếp tham số nhận về
        const sortedParams = {};
        Object.keys(vnp_Params).sort().forEach(key => {
            sortedParams[key] = vnp_Params[key];
        });

        // Tạo lại chuỗi signData từ params nhận về để kiểm tra chữ ký
        let signData = "";
        const keys = Object.keys(sortedParams);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = sortedParams[key];
            // Lưu ý: vnp_Params từ req.query đã được decode, nên phải encode lại giống lúc gửi
            signData += encodeURIComponent(key).replace(/%20/g, "+") + "=" +
                encodeURIComponent(value).replace(/%20/g, "+");
            if (i < keys.length - 1) signData += "&";
        }

        const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        if (secureHash === signed) {
            const orderId = vnp_Params["vnp_TxnRef"];
            if (vnp_Params["vnp_ResponseCode"] === "00") {
                await Payment.findOneAndUpdate(
                    { orderId },
                    { status: "success", paymentDate: new Date(), vnpayTranNo: vnp_Params["vnp_TransactionNo"] }
                );
                return res.status(200).json({ success: true });
            }
            await Payment.findOneAndUpdate({ orderId }, { status: "failed" });
            return res.status(200).json({ success: false });
        }
        res.status(400).json({ message: "Chữ ký trả về không hợp lệ" });
    } catch (error) {
        next(error);
    }
};

export const downloadServiceFile = async (req, res, next) => {
    try {
        const { orderId, format } = req.params;
        const userId = req.userId; // Lấy từ verifyToken

        // 1. Kiểm tra đơn hàng trong DB
        const payment = await Payment.findOne({ orderId, userId, status: "success" });
        if (!payment) {
            return res.status(403).json({ message: "Bạn chưa thanh toán cho dịch vụ này hoặc mã đơn hàng không hợp lệ." });
        }

        // 2. Lấy thông tin dịch vụ để lấy URL ảnh gốc
        const service = await Service.findById(payment.serviceId);
        if (!service || !service.images.length) {
            return res.status(404).json({ message: "Không tìm thấy file thiết kế." });
        }

        const originalUrl = service.images[0]; // Lấy ảnh đầu tiên làm file chính

        // 3. Tải ảnh từ Cloudinary về Buffer
        const response = await axios.get(originalUrl, { responseType: 'arraybuffer' });
        const inputBuffer = Buffer.from(response.data);

        let processedImage = sharp(inputBuffer);

        // 4. Chuyển đổi định dạng theo yêu cầu (KHÔNG composite watermark)
        let contentType = "";
        let extension = "";

        switch (format.toLowerCase()) {
            case "png":
                processedImage = processedImage.png();
                contentType = "image/png";
                extension = "png";
                break;
            case "jpg":
            case "jpeg":
                processedImage = processedImage.jpeg({ quality: 100 });
                contentType = "image/jpeg";
                extension = "jpg";
                break;
            case "webp":
                processedImage = processedImage.webp({ quality: 100 });
                contentType = "image/webp";
                extension = "webp";
                break;
            default:
                return res.status(400).json({ message: "Định dạng không hỗ trợ." });
        }

        const outputBuffer = await processedImage.toBuffer();

        // 5. Trả file về trình duyệt để tải xuống
        const fileName = `Creatify_${orderId}.${extension}`;
        res.set({
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Content-Length": outputBuffer.length,
        });

        res.send(outputBuffer);

    } catch (error) {
        console.error("Lỗi tải file:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi xử lý file." });
    }
};