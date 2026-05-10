import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// --- Interfaces ---
interface IDesigner {
    _id: string;
    fullName: string;
    profilePicture: string;
    rating: number;
    bio: string;
}

interface IProduct {
    _id: string;
    title: string;
    price: number;
    images: string[];
    description: string;
    tags: string[];
    designerId: IDesigner; // Đã được populate từ backend
}

interface IRelatedProduct {
    _id: string;
    title: string;
    price: number;
    images: string[];
}

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<IProduct | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<IRelatedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeImg, setActiveImg] = useState(0);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                setError("");

                // Đảm bảo URL này khớp với cấu hình Route Backend của bạn
                // Lưu ý: Tôi dùng 5173 cho đúng yêu cầu của bạn
                const response = await axios.get(`http://localhost:3000/api/v1/products/${id}`);

                // Cấu trúc mới từ Backend: { product: {...}, relatedProducts: [...] }
                setProduct(response.data.product);
                setRelatedProducts(response.data.relatedProducts || []);
                setActiveImg(0);
            } catch (err: unknown) {
                console.error("Fetch error:", err);

                if (axios.isAxiosError(err)) {
                    // TypeScript hiểu 'err' lúc này là AxiosError nên truy cập .response an toàn
                    const serverMessage = err.response?.data?.message;
                    setError(serverMessage || "Không thể tải dữ liệu sản phẩm");
                } else if (err instanceof Error) {
                    // Lỗi thường (lỗi code, logic...)
                    setError(err.message);
                } else {
                    // Lỗi không xác định
                    setError("Đã xảy ra lỗi không mong muốn");
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductData();
        }
    }, [id]);

    if (loading) return <div style={styles.loading}>Đang tải dữ liệu...</div>;
    if (error) return <div style={styles.error}>{error}</div>;
    if (!product) return <div style={styles.error}>Sản phẩm không tồn tại.</div>;

    return (
        <div style={styles.container}>
            {/* --- PHẦN CHI TIẾT SẢN PHẨM --- */}
            <div style={styles.mainContent}>
                {/* Cột trái: Hình ảnh */}
                <div style={styles.imageSection}>
                    <img
                        src={product.images[activeImg] || "https://via.placeholder.com/600"}
                        alt={product.title}
                        style={styles.mainImage}
                    />
                    <div style={styles.thumbnailList}>
                        {product.images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                style={{
                                    ...styles.thumbnail,
                                    border: activeImg === index ? "2px solid #000" : "1px solid #ddd",
                                }}
                                onClick={() => setActiveImg(index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Cột phải: Thông tin */}
                <div style={styles.infoSection}>
                    <h1 style={styles.title}>{product.title}</h1>
                    <p style={styles.price}>{product.price.toLocaleString("vi-VN")} đ</p>

                    <div style={styles.tagsContainer}>
                        {product.tags.map((tag) => (
                            <span key={tag} style={styles.tag}>#{tag}</span>
                        ))}
                    </div>

                    <div style={styles.description}>
                        <h3>Mô tả sản phẩm</h3>
                        <p>{product.description}</p>
                    </div>

                    {/* Thông tin Designer */}
                    <div style={styles.designerCard}>
                        <img
                            src={product.designerId?.profilePicture || "https://via.placeholder.com/50"}
                            alt="designer"
                            style={styles.avatar}
                        />
                        <div style={styles.designerInfo}>
                            <h4 style={styles.designerName}>
                                {product.designerId?.fullName || "Chưa có tên"}
                            </h4>
                            <p style={styles.designerBio}>{product.designerId?.bio}</p>
                            <div style={styles.rating}>⭐ {product.designerId?.rating || 5}/5</div>
                        </div>
                    </div>

                    <button style={styles.buyButton}>Mua ngay</button>
                </div>
            </div>

            {/* --- PHẦN SẢN PHẨM TƯƠNG TỰ --- */}
            <div style={styles.relatedSection}>
                <h2 style={styles.sectionTitle}>Sản phẩm tương tự</h2>
                <div style={styles.relatedGrid}>
                    {relatedProducts.length > 0 ? (
                        relatedProducts.map((item) => (
                            <div
                                key={item._id}
                                style={styles.relatedCard}
                                onClick={() => navigate(`/product/${item._id}`)}
                            >
                                <img src={item.images[0]} alt={item.title} style={styles.relatedImg} />
                                <h4 style={styles.relatedTitle}>{item.title}</h4>
                                <p style={styles.relatedPrice}>{item.price.toLocaleString("vi-VN")} đ</p>
                            </div>
                        ))
                    ) : (
                        <p>Không có sản phẩm tương tự.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Styles (Giữ nguyên giao diện của bạn) ---
const styles: { [key: string]: React.CSSProperties } = {
    container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", fontFamily: "Arial, sans-serif" },
    mainContent: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "60px" },
    imageSection: { display: "flex", flexDirection: "column", gap: "15px" },
    mainImage: { width: "100%", borderRadius: "12px", objectFit: "cover", height: "500px" },
    thumbnailList: { display: "flex", gap: "10px", overflowX: "auto" },
    thumbnail: { width: "80px", height: "80px", borderRadius: "8px", cursor: "pointer", objectFit: "cover" },
    infoSection: { display: "flex", flexDirection: "column", gap: "20px" },
    title: { fontSize: "28px", fontWeight: "bold", color: "#333" },
    price: { fontSize: "24px", color: "#e44d26", fontWeight: "bold" },
    tagsContainer: { display: "flex", gap: "10px" },
    tag: { padding: "5px 12px", background: "#f0f0f0", borderRadius: "20px", fontSize: "14px", color: "#666" },
    description: { lineHeight: "1.6", color: "#555" },
    designerCard: { display: "flex", gap: "15px", padding: "20px", background: "#f9f9f9", borderRadius: "12px", alignItems: "center" },
    avatar: { width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" },
    designerInfo: { flex: 1 },
    designerName: { margin: "0 0 5px 0", fontSize: "18px" },
    designerBio: { fontSize: "14px", color: "#777", margin: "0 0 5px 0" },
    rating: { fontSize: "14px", color: "#ffa500" },
    buyButton: { padding: "15px", background: "#000", color: "#fff", border: "none", borderRadius: "8px", fontSize: "18px", cursor: "pointer", fontWeight: "bold" },
    relatedSection: { borderTop: "1px solid #eee", paddingTop: "40px" },
    sectionTitle: { fontSize: "22px", marginBottom: "20px" },
    relatedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" },
    relatedCard: { cursor: "pointer", transition: "transform 0.2s" },
    relatedImg: { width: "100%", height: "200px", borderRadius: "8px", objectFit: "cover" },
    relatedTitle: { fontSize: "16px", margin: "10px 0 5px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
    relatedPrice: { color: "#e44d26", fontWeight: "bold" },
    loading: { textAlign: "center", padding: "100px", fontSize: "20px" },
    error: { textAlign: "center", padding: "100px", color: "red", fontSize: "18px" },
};

export default ProductDetail;