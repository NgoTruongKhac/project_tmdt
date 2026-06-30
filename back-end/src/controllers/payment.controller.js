import moment from "moment";
import crypto from "crypto";
import { Payment } from "../models/payment.model.js";
import { Service } from "../models/service.model.js";
import ErrorHandler from "../middlewares/errors/ErrorHandler.js";

// Thông tin Merchant MỚI bạn cung cấp (Cập nhật ngày 28/05)
const VNP_TMNCODE = "RDKF68L4";
const VNP_HASHSECRET = "LPY25CJWW3YNRHII4VEKD9MCWT8PGHGO";
const VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_RETURNURL = "http://localhost:5173/payment-success";

/**
 * 1. TẠO URL THANH TOÁN
 */
export const createPaymentUrl = async (req, res, next) => {
    try {
        const { serviceId } = req.body;
        const userId = req.userId;

        const service = await Service.findById(serviceId);
        if (!service) throw new ErrorHandler("Dịch vụ không tồn tại", 404);

        const date = new Date();
        const createDate = moment(date).format("YYYYMMDDHHmmss");

        // Tạo mã đơn hàng duy nhất
        const orderId = moment(date).format("DDHHmmss") + Math.floor(Math.random() * 1000);

        // Lưu thông tin thanh toán tạm thời vào DB
        await Payment.create({
            orderId,
            userId,
            serviceId,
            amount: service.price,
            status: "pending"
        });

        // Lấy IP người dùng (Tối ưu hơn 127.0.0.1)
        let ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        let vnp_Params = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": VNP_TMNCODE,
            "vnp_Locale": "vn",
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": orderId,
            "vnp_OrderInfo": "Thanh toan dich vu " + orderId,
            "vnp_OrderType": "other",
            "vnp_Amount": Math.round(service.price * 100), // VNPAY yêu cầu nhân 100
            "vnp_ReturnUrl": VNP_RETURNURL,
            "vnp_IpAddr": ipAddr,
            "vnp_CreateDate": createDate,
        };

        // 1. Sắp xếp tham số theo Alphabet (Quan trọng nhất để tạo Hash đúng)
        const sortedParams = {};
        Object.keys(vnp_Params).sort().forEach(key => {
            sortedParams[key] = vnp_Params[key];
        });

        // 2. Tạo chuỗi ký (signData) và chuỗi truy vấn (query)
        let signData = "";
        let query = "";
        const keys = Object.keys(sortedParams);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = sortedParams[key];

            // Mã hóa theo chuẩn VNPAY: space thành dấu +
            const encodedKey = encodeURIComponent(key).replace(/%20/g, "+");
            const encodedValue = encodeURIComponent(value).replace(/%20/g, "+");

            signData += encodedKey + "=" + encodedValue;
            query += encodedKey + "=" + encodedValue;

            if (i < keys.length - 1) {
                signData += "&";
                query += "&";
            }
        }

        // 3. Tạo chữ ký HmacSHA512
        const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        const finalUrl = VNP_URL + "?" + query + "&vnp_SecureHash=" + signed;

        // Trả về URL thanh toán cho Frontend
        res.status(200).json({ paymentUrl: finalUrl });
    } catch (error) {
        next(error);
    }
};

/**
 * 2. XỬ LÝ KẾT QUẢ TRẢ VỀ (RETURN URL)
 */
export const vnpayReturn = async (req, res, next) => {
    try {
        let vnp_Params = req.query;
        const secureHash = vnp_Params["vnp_SecureHash"];

        // Loại bỏ tham số hash khỏi danh sách tính toán hash ngược lại
        delete vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHashType"];

        // Sắp xếp tham số nhận về theo Alphabet
        const sortedParams = {};
        Object.keys(vnp_Params).sort().forEach(key => {
            sortedParams[key] = vnp_Params[key];
        });

        // Tạo lại chuỗi signData để đối soát chữ ký
        let signData = "";
        const keys = Object.keys(sortedParams);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = sortedParams[key];
            signData += encodeURIComponent(key).replace(/%20/g, "+") + "=" +
                encodeURIComponent(value).replace(/%20/g, "+");
            if (i < keys.length - 1) signData += "&";
        }

        const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
        const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

        // Kiểm tra tính toàn vẹn của dữ liệu (Chữ ký khớp)
        if (secureHash === signed) {
            const orderId = vnp_Params["vnp_TxnRef"];
            const responseCode = vnp_Params["vnp_ResponseCode"];

            if (responseCode === "00") {
                // Thanh toán thành công
                await Payment.findOneAndUpdate(
                    { orderId },
                    {
                        status: "success",
                        paymentDate: new Date(),
                        vnpayTranNo: vnp_Params["vnp_TransactionNo"]
                    }
                );
                return res.status(200).json({ success: true, message: "Thanh toán thành công" });
            } else {
                // Thanh toán thất bại hoặc người dùng hủy
                await Payment.findOneAndUpdate({ orderId }, { status: "failed" });
                return res.status(200).json({ success: false, message: "Giao dịch không thành công", code: responseCode });
            }
        }

        // Chữ ký không khớp (Dữ liệu bị can thiệp)
        res.status(400).json({ message: "Chữ ký trả về không hợp lệ" });
    } catch (error) {
        next(error);
    }
};