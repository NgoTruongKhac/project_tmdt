import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccess: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/payments/vnpay-return${location.search}`);
                setStatus(response.data.success ? "success" : "failed");
            } catch {
                setStatus("failed");
            }
        };
        verifyPayment();
    }, [location]);

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            {status === "loading" && <h2>Đang xử lý thanh toán...</h2>}
            {status === "success" && (
                <div style={{ color: "green" }}>
                    <h1 style={{ fontSize: "48px" }}>✓</h1>
                    <h2>Thanh toán thành công!</h2>
                    <p>Dịch vụ của bạn sẽ sớm được thực hiện.</p>
                    <button onClick={() => navigate("/")} style={btnStyle}>Về trang chủ</button>
                </div>
            )}
            {status === "failed" && (
                <div style={{ color: "red" }}>
                    <h1 style={{ fontSize: "48px" }}>✕</h1>
                    <h2>Thanh toán thất bại</h2>
                    <p>Có lỗi xảy ra hoặc bạn đã hủy giao dịch.</p>
                    <button onClick={() => navigate("/")} style={btnStyle}>Quay lại</button>
                </div>
            )}
        </div>
    );
};

const btnStyle = { padding: "10px 20px", marginTop: "20px", cursor: "pointer", backgroundColor: "#0075f2", color: "#fff", border: "none", borderRadius: "8px" };

export default PaymentSuccess;