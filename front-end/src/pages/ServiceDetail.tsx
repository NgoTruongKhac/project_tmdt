import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface IDesigner {
    _id: string;
    fullName: string;
    profilePicture: string;
    rating: number;
}

interface IService {
    _id: string;
    title: string;
    price: number;
    images: string[];
    description: string;
    tags: string[];
    designerId: IDesigner;
}

interface IRelatedService {
    _id: string;
    title: string;
    price: number;
    images: string[];
}

const ServiceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [service, setService] = useState<IService | null>(null);
    const [relatedServices, setRelatedServices] = useState<IRelatedService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeImg, setActiveImg] = useState(0);

    const API_IMAGE_URL = "http://localhost:3000/api/v1/services/image";

    useEffect(() => {
        const fetchServiceData = async () => {
            try {
                setLoading(true);
                // Gọi API sang endpoint services
                const response = await axios.get(`http://localhost:3000/api/v1/services/${id}`);

                // Cập nhật dữ liệu từ response
                setService(response.data.service);
                setRelatedServices(response.data.relatedServices || []);
                setActiveImg(0);
            } catch {
                setError("Không thể tải dữ liệu sản phẩm");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchServiceData();
    }, [id]);

    // Hàm bổ trợ để lấy tên file từ đường dẫn lưu trong DB
    const getFileName = (path: string) => path.split('/').pop();

    if (loading) return <div style={styles.centerMsg}>Đang tải dữ liệu...</div>;
    if (error) return <div style={{ ...styles.centerMsg, color: "red" }}>{error}</div>;
    if (!service) return <div style={styles.centerMsg}>Không tìm thấy dịch vụ.</div>;

    return (
        <div style={styles.container}>
            <div style={styles.mainGrid}>
                {/* === CỘT TRÁI: HÌNH ẢNH === */}
                <div style={styles.leftCol}>
                    <div style={styles.imageSection}>
                        <div style={styles.mainImageWrapper}>
                            <img
                                // Ảnh chạy qua bộ lọc watermark của service API
                                src={service.images[activeImg]
                                    ? `${API_IMAGE_URL}/${getFileName(service.images[activeImg])}`
                                    : "https://via.placeholder.com/800"}
                                alt={service.title}
                                style={styles.mainImage}
                            />
                        </div>

                        <div style={styles.thumbnailRow}>
                            {service.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActiveImg(idx)}
                                    style={{
                                        ...styles.thumbContainer,
                                        border: activeImg === idx ? "2px solid #8b5cf6" : "1px solid #eee"
                                    }}
                                >
                                    <img
                                        // Thumbnail cũng chạy qua bộ lọc watermark
                                        src={`${API_IMAGE_URL}/${getFileName(img)}`}
                                        style={styles.thumbImg}
                                        alt="thumbnail"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.infoSection}>
                        <div style={styles.designerRow}>
                            <img src={service.designerId?.profilePicture} style={styles.miniAvatar} alt="avatar" />
                            <div>
                                <div style={styles.designerNameName}>
                                    {service.designerId?.fullName} <span style={styles.proBadge}>PRO</span>
                                </div>
                                <div style={styles.ratingText}>
                                    {/* Số dự án đang set cứng, sẽ xử lý sau */}
                                    ★ {service.designerId?.rating} — Đã hoàn thành 182 dự án
                                </div>
                            </div>
                        </div>

                        <h1 style={styles.titleText}>{service.title}</h1>
                        <p style={styles.descriptionText}>{service.description}</p>

                        <div style={styles.tagContainer}>
                            {service.tags.map(tag => (
                                <span key={tag} style={styles.tagItem}>{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* === CỘT PHẢI: BẢNG GIÁ === */}
                <div style={styles.rightCol}>
                    <div style={styles.pricingCard}>
                        <div style={styles.priceSection}>
                            <span style={styles.priceValue}>{service.price.toLocaleString('vi-VN')} đ</span>
                            <span style={styles.priceUnit}> / mỗi gói</span>
                        </div>

                        <div style={styles.serviceCommitment}>
                            <div style={styles.featureItem}>✓ Logo thiết kế sẵn – mua và sử dụng ngay</div>
                            <div style={styles.featureItem}>✓ Nhận file ngay sau thanh toán</div>
                            <div style={styles.featureItem}>✓ Tùy chọn định dạng file (PNG, JPG, SVG)</div>
                            <div style={styles.featureItem}>✓ Độ phân giải cực cao (4K)</div>
                            <div style={styles.featureItem}>✓ Toàn quyền sử dụng thương mại</div>
                        </div>

                        <button style={styles.orderBtn}>Mua ngay</button>
                        <button style={styles.contactBtn}>Liên hệ Designer</button>

                    </div>
                </div>
            </div>

            {/* === DỊCH VỤ TƯƠNG TỰ === */}
            <div style={styles.relatedSection}>
                <div style={styles.relatedHeader}>
                    <h2 style={styles.relatedTitle}>Dịch vụ tương tự</h2>
                    <span style={styles.exploreLink}>Xem tất cả</span>
                </div>
                <div style={styles.relatedGrid}>
                    {relatedServices.map((item) => (
                        <div key={item._id} style={styles.relCard} onClick={() => navigate(`/service/${item._id}`)}>
                            <div style={styles.relImgBox}>
                                <img
                                    // Ảnh của dịch vụ liên quan cũng được bảo vệ
                                    src={`${API_IMAGE_URL}/${getFileName(item.images[0])}`}
                                    style={styles.relImg}
                                    alt={item.title}
                                />
                            </div>
                            <div style={styles.relInfo}>
                                <div style={styles.relTitle}>{item.title}</div>
                                <div style={styles.relPrice}>Từ {item.price.toLocaleString('vi-VN')} đ</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- CSS STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
    container: { maxWidth: "1250px", margin: "0 auto", padding: "30px 20px", fontFamily: "'Segoe UI', Roboto, sans-serif", color: "#1a1a1a" },
    centerMsg: { textAlign: "center", padding: "100px", fontSize: "16px" },
    mainGrid: { display: "grid", gridTemplateColumns: "1fr 360px", gap: "50px", alignItems: "flex-start" },
    leftCol: { display: "flex", flexDirection: "column" },
    imageSection: { width: "100%", display: "flex", flexDirection: "column", gap: "12px" },
    mainImageWrapper: { width: "100%", height: "450px", borderRadius: "20px", overflow: "hidden", backgroundColor: "#f4f4f4", display: "flex", alignItems: "center", justifyContent: "center" },
    mainImage: { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" },
    thumbnailRow: { display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "5px" },
    thumbContainer: { width: "70px", height: "50px", flexShrink: 0, borderRadius: "8px", overflow: "hidden", cursor: "pointer" },
    thumbImg: { width: "100%", height: "100%", objectFit: "cover" },
    infoSection: { marginTop: "30px" },
    designerRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
    miniAvatar: {  objectFit: "cover", width: "48px", height: "48px", borderRadius: "50%", border: "1px solid #eee" },
    designerNameName: { fontWeight: "700", fontSize: "17px" },
    proBadge: { backgroundColor: "#0075f2", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", marginLeft: "6px", verticalAlign: "middle" },
    ratingText: { fontSize: "13px", color: "#666", marginTop: "3px" },
    titleText: { fontSize: "28px", fontWeight: "800", marginBottom: "15px", color: "#000" },
    descriptionText: { fontSize: "15px", lineHeight: "1.7", color: "#444", marginBottom: "25px" },
    tagContainer: { display: "flex", gap: "8px" },
    tagItem: { fontSize: "12px", padding: "5px 15px", backgroundColor: "#777", borderRadius: "20px", color: "#fff" },
    rightCol: { position: "sticky", top: "20px" },
    pricingCard: { border: "1px solid #efefef", borderRadius: "24px", padding: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)", backgroundColor: "#fff" },
    priceSection: { marginBottom: "25px", borderBottom: "1px solid #f5f5f5", paddingBottom: "20px" },
    priceValue: { fontSize: "30px", fontWeight: "800", color: "#000" },
    priceUnit: { color: "#999", fontSize: "14px" },
    serviceCommitment: { marginBottom: "25px" },
    featureItem: { fontSize: "14px", color: "#555", marginBottom: "12px", display: "flex", alignItems: "center" },
    orderBtn: { width: "100%", padding: "16px", backgroundColor: "#0075f2", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "16px", cursor: "pointer", marginBottom: "12px", transition: "0.2s" },
    contactBtn: { width: "100%", padding: "16px", backgroundColor: "#fff", color: "#000", border: "1px solid #ddd", borderRadius: "12px", fontWeight: "600", fontSize: "16px", cursor: "pointer" },
    trustRow: { display: "flex", justifyContent: "space-between", marginTop: "25px", opacity: 0.5 },
    trustItem: { fontSize: "10px", fontWeight: "700", letterSpacing: "1px" },
    relatedSection: { marginTop: "30px", paddingTop: "30px", borderTop: "1px solid #eee" },
    relatedHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
    relatedTitle: { fontSize: "22px", fontWeight: "800" },
    exploreLink: { fontSize: "14px", color: "#0075f2", fontWeight: "600", cursor: "pointer" },
    relatedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "25px" },
    relCard: { cursor: "pointer", transition: "transform 0.2s" },
    relImgBox: { width: "100%", aspectRatio: "4/3", borderRadius: "16px", overflow: "hidden", marginBottom: "12px" },
    relImg: { width: "100%", height: "100%", objectFit: "cover" },
    relTitle: { fontSize: "15px", fontWeight: "700", marginBottom: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    relPrice: { fontSize: "14px", color: "#666" }
};

export default ServiceDetail;