import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios"

interface IDesigner {
    _id: string;
    fullName: string;
    profilePicture?: string;
    rating?: number;
    bio?: string;
}

interface IProduct {
    _id: string;
    title: string;
    price: number;
    images: string[];
    description: string;
    tags: string[];
    designerId: IDesigner; // Dữ liệu từ populate
}

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<IProduct | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5174/product/${id}`);
                setProduct(response.data);
            } catch (err) {
                const axiosError = err as AxiosError<{ message: string }>;
                setError(axiosError.response?.data?.message || "Không thể tải dữ liệu sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProductData();
    }, [id]);

    if (loading) return <div style={styles.statusCenter}>Đang tải thiết kế...</div>;
    if (error || !product) return <div style={styles.statusCenter}>{error || "Sản phẩm không tồn tại"}</div>;

    return (
        <div style={styles.container}>
            {/* Breadcrumb */}
            <div style={styles.breadcrumb}>
                Trang chủ {">"} Khám phá {">"} <span style={{ color: "#333" }}>{product.title}</span>
            </div>

            <div style={styles.mainLayout}>
                {/* CỘT TRÁI - GALLERY & INFO */}
                <div style={styles.leftCol}>
                    <div style={styles.galleryContainer}>
                        {/* Phương án 3: Background mờ nghệ thuật */}
                        <div style={{
                            ...styles.blurredBg,
                            backgroundImage: `url(${product.images[0]})`
                        }} />

                        <img
                            src={product.images[0]}
                            alt={product.title}
                            style={styles.mainImage}
                        />
                    </div>

                    {/* Danh sách ảnh phụ */}
                    <div style={styles.thumbnailRow}>
                        {product.images.map((img, index) => (
                            <img key={index} src={img} alt={`Thumb ${index}`} style={styles.thumbnail} />
                        ))}
                    </div>

                    {/* Designer & Mô tả */}
                    <div style={styles.designerSection}>
                        <div style={styles.designerHeader}>
                            <img
                                src={product.designerId?.profilePicture || "https://via.placeholder.com/150"}
                                style={styles.avatar}
                                alt="Avatar"
                            />
                            <div>
                                <div style={styles.designerName}>
                                    {product.designerId?.fullName}
                                    { (product.designerId?.rating || 0) >= 4.5 && <span style={styles.proBadge}>PRO</span> }
                                </div>
                                <div style={styles.ratingText}>
                                    ⭐ {product.designerId?.rating || 0} | 150+ dự án hoàn thành
                                </div>
                            </div>
                            <button style={styles.followBtn}>Theo dõi</button>
                        </div>

                        <h1 style={styles.productTitle}>{product.title}</h1>
                        <p style={styles.description}>{product.description}</p>

                        <div style={styles.tagContainer}>
                            {product.tags.map((tag) => (
                                <span key={tag} style={styles.tag}>#{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI - THANH TOÁN (STICKY) */}
                <div style={styles.rightCol}>
                    <div style={styles.purchaseCard}>
                        <div style={styles.priceContainer}>
                            <span style={styles.priceLabel}>Giá trọn gói:</span>
                            <span style={styles.priceValue}>
                                {product.price?.toLocaleString('vi-VN')} đ
                            </span>
                        </div>

                        <div style={styles.benefitList}>
                            <div style={styles.benefitItem}>✔ File gốc chất lượng cao (.PSD, .AI)</div>
                            <div style={styles.benefitItem}>✔ Quyền sử dụng thương mại vĩnh viễn</div>
                            <div style={styles.benefitItem}>✔ Hỗ trợ chỉnh sửa nhẹ 1 lần</div>
                        </div>

                        <button
                            onClick={() => navigate(`/checkout/${product._id}`)}
                            style={styles.buyBtn}
                        >
                            Mua ngay
                        </button>

                        <button style={styles.contactBtn}>Nhắn tin cho Designer</button>

                        <div style={styles.secureFooter}>
                            <span>🔒 Thanh toán an toàn</span>
                            <span>•</span>
                            <span>Hoàn tiền nếu không hài lòng</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Styles object với định nghĩa kiểu CSSProperties của React
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    statusCenter: { display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", fontSize: "18px", color: "#666" },
    breadcrumb: { fontSize: "13px", color: "#999", marginBottom: "24px" },
    mainLayout: { display: "flex", gap: "50px", alignItems: "flex-start" },

    // Cột trái & Gallery
    leftCol: { flex: 1.4 },
    galleryContainer: {
        position: "relative",
        width: "100%",
        height: "580px",
        borderRadius: "32px",
        overflow: "hidden",
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.05)"
    },
    blurredBg: {
        position: "absolute",
        inset: 0,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(50px) brightness(0.9)",
        opacity: 0.4,
        zIndex: 1,
    },
    mainImage: {
        maxHeight: "92%",
        maxWidth: "92%",
        objectFit: "contain",
        position: "relative",
        zIndex: 2,
        borderRadius: "12px",
    },
    thumbnailRow: { display: "flex", gap: "12px", marginTop: "16px" },
    thumbnail: { width: "64px", height: "64px", borderRadius: "12px", objectFit: "cover", border: "1px solid #eee", cursor: "pointer" },

    // Designer Section
    designerSection: { marginTop: "40px" },
    designerHeader: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" },
    avatar: { width: "56px", height: "56px", borderRadius: "50%", objectFit: "cover" },
    designerName: { fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" },
    proBadge: { backgroundColor: "#000", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" },
    ratingText: { fontSize: "14px", color: "#777", marginTop: "4px" },
    followBtn: { marginLeft: "auto", padding: "8px 20px", borderRadius: "20px", border: "1px solid #ddd", background: "white", fontWeight: "600", cursor: "pointer" },

    productTitle: { fontSize: "32px", fontWeight: "800", color: "#1a1a1a", marginBottom: "16px" },
    description: { lineHeight: "1.8", color: "#444", fontSize: "16px", marginBottom: "24px" },
    tagContainer: { display: "flex", gap: "10px", flexWrap: "wrap" },
    tag: { padding: "6px 16px", backgroundColor: "#f5f5f5", borderRadius: "30px", fontSize: "13px", color: "#666" },

    // Cột phải & Purchase Card
    rightCol: { width: "400px", position: "sticky", top: "40px" },
    purchaseCard: {
        padding: "32px",
        borderRadius: "32px",
        backgroundColor: "#fff",
        border: "1px solid #f0f0f0",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)"
    },
    priceContainer: { marginBottom: "24px" },
    priceLabel: { display: "block", fontSize: "14px", color: "#888", marginBottom: "4px" },
    priceValue: { fontSize: "32px", fontWeight: "800", color: "#000" },

    benefitList: { marginBottom: "32px" },
    benefitItem: { fontSize: "14px", color: "#555", marginBottom: "12px", display: "flex", alignItems: "center" },

    buyBtn: {
        width: "100%",
        padding: "18px",
        borderRadius: "18px",
        border: "none",
        backgroundColor: "#000",
        color: "#fff",
        fontSize: "17px",
        fontWeight: "600",
        cursor: "pointer",
        marginBottom: "12px",
        transition: "transform 0.2s"
    },
    contactBtn: {
        width: "100%",
        padding: "18px",
        borderRadius: "18px",
        border: "1px solid #e0e0e0",
        backgroundColor: "transparent",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer"
    },
    secureFooter: { display: "flex", justifyContent: "center", gap: "10px", marginTop: "24px", fontSize: "12px", color: "#aaa" }
};

export default ProductDetail;