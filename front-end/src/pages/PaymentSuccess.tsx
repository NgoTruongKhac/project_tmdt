import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useReward } from "../contexts/RewardContext";

const PaymentSuccess: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchRewards, fetchHistory, resetSessionRedeemedPoints } = useReward();
    const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const params = new URLSearchParams(location.search);
            const txnRef = params.get("vnp_TxnRef");
            setOrderId(txnRef);

            try {
                const response = await axios.get(`http://localhost:3000/api/v1/payments/vnpay-return${location.search}`);
                if (response.data.success) {
                    await fetchRewards();
                    await fetchHistory();
                    resetSessionRedeemedPoints();
                    setStatus("success");
                } else {
                    setStatus("failed");
                }
            } catch {
                setStatus("failed");
            }
        };
        verifyPayment();
    }, [fetchHistory, fetchRewards, location]);

    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    // Hàm xử lý tải file thật
    const handleDownload = async (format: string) => {
        if (!orderId) return;

        try {
            const token = getCookie("access_token");

            // Gọi API bằng responseType 'blob' để nhận dữ liệu binary
            const response = await axios.get(
                `http://localhost:3000/api/v1/payments/download/${orderId}/${format}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            // Tạo link ảo để tải file
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Design_${orderId}.${format.toLowerCase()}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Lỗi khi tải file. Vui lòng thử lại hoặc liên hệ hỗ trợ.");
            console.error(error);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {status === "loading" && (
                    <div style={{ padding: "40px 0" }}>
                        <div style={spinnerStyle}></div>
                        <h2 style={{ ...titleStyle, marginTop: "20px" }}>Đang xử lý thanh toán...</h2>
                    </div>
                )}

                {status === "success" && (
                    <>
                        {/* Tiêu đề trạng thái */}
                        <h1 style={titleStyle}>Thanh toán thành công!</h1>
                        <p style={subtitleStyle}>
                            Bạn có thể tải xuống file thiết kế ngay bây giờ.
                        </p>

                        {/* Khu vực chọn định dạng tải xuống */}
                        <h3 style={sectionTitleStyle}>Chọn định dạng tải xuống</h3>

                        {/* Danh sách các thẻ định dạng */}
                        <div style={gridStyle}>
                            {/* Khối PNG */}
                            <div style={downloadCardStyle}>
                                <div style={formatIconStyle}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0056b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                </div>
                                <div style={formatNameStyle}>PNG</div>
                                <div style={formatDescStyle}>Phù hợp đăng mạng xã hội</div>
                                <button onClick={() => handleDownload("PNG")} style={btnDownloadStyle}>
                                    <span style={{marginRight: "6px"}}>↓</span> Tải xuống
                                </button>
                            </div>

                            {/* Khối JPG */}
                            <div style={downloadCardStyle}>
                                <div style={formatIconStyle}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0056b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                </div>
                                <div style={formatNameStyle}>JPG</div>
                                <div style={formatDescStyle}>File nhẹ, dễ chia sẻ</div>
                                <button onClick={() => handleDownload("JPG")} style={btnDownloadStyle}>
                                    <span style={{ marginRight: "6px" }}>↓</span> Tải xuống
                                </button>
                            </div>

                            {/* Khối WebP */}
                            <div style={downloadCardStyle}>
                                <div style={formatIconStyle}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0056b3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                </div>
                                <div style={formatNameStyle}>WEBP</div>
                                <div style={formatDescStyle}>Định dạng hiện đại, chất lượng cao</div>
                                <button onClick={() => handleDownload("WEBP")} style={btnDownloadStyle}>
                                    <span style={{ marginRight: "6px" }}>↓</span> Tải xuống
                                </button>
                            </div>
                        </div>

                        {/* Nút quay lại trang chủ */}
                        <div style={{ marginTop: "40px" }}>
                            <button onClick={() => navigate("/")} style={btnHomeStyle}>
                                <span style={{ marginRight: "8px" }}>←</span> Quay lại trang chủ
                            </button>
                        </div>
                    </>
                )}

                {status === "failed" && (
                    <div style={{ padding: "20px 0" }}>
                        <h1 style={{ ...titleStyle, color: "#e02424" }}>Thanh toán thất bại</h1>
                        <p style={subtitleStyle}>Có lỗi xảy ra hoặc bạn đã hủy giao dịch giao dịch.</p>
                        <button onClick={() => navigate("/")} style={btnHomeStyle}>
                            <span style={{ marginRight: "8px" }}>←</span> Quay lại trang chủ
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ---  STYLES ---

const containerStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    boxSizing: "border-box"
};

const cardStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    maxWidth: "800px",
    width: "100%",
    textAlign: "center",
    boxSizing: "border-box"
};

const titleStyle: React.CSSProperties = {
    fontSize: "36px",
    fontWeight: "700",
    color: "#0056b3",
    margin: "-20px 0 5px 0",
    letterSpacing: "-0.5px"
};

const subtitleStyle: React.CSSProperties = {
    fontSize: "16px",
    color: "#555555",
    lineHeight: "1.6",
    margin: "0 auto 30px auto",
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: "22px",
    fontWeight: "600",
    color: "#111111",
    margin: "0 auto 16px auto",
};

const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "20px",
    width: "100%"
};

const downloadCardStyle: React.CSSProperties = {
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxSizing: "border-box"
};

const formatIconStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    backgroundColor: "#f0f5ff",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "16px"
};

const formatNameStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: "700",
    color: "#111111",
    marginBottom: "6px"
};

const formatDescStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#666666",
    marginBottom: "20px",
    minHeight: "36px",
    display: "flex",
    alignItems: "center",
    textAlign: "center"
};

const btnDownloadStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    backgroundColor: "#0056b3",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "background-color 0.2s"
};

const btnHomeStyle: React.CSSProperties = {
    padding: "14px 32px",
    backgroundColor: "transparent",
    color: "#0056b3",
    border: "1px solid #0056b3",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s"
};

const spinnerStyle: React.CSSProperties = {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #0056b3",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    margin: "0 auto"
};

export default PaymentSuccess;
