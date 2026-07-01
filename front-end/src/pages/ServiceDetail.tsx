import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../stores/useAuthStore";
import { useReward } from "../contexts/RewardContext";

interface IDesigner {
  _id?: string;
  id?: string;
  fullName: string;
  profilePicture?: string;
  rating?: number;
}

interface IServicePackage {
  _id: string;
  name?: string;
  title?: string;
  price: number;
  discountPrice?: number | null;
  thumbnail?: string;
  images?: string[];
  description?: string;
  category?: string;
  listingType?: "hire" | "package" | "product";
  revisions?: number;
  deliveryTime?: number;
  soldCount?: number;
  designer?: IDesigner;
  designerId?: IDesigner;
}

const API_IMAGE_URL = "http://localhost:3000/api/v1/services/image";

const getServiceTitle = (service: IServicePackage) =>
  service.name || service.title || "Dịch vụ thiết kế";

const getFileName = (path: string) => {
  if (!path) return "";
  return path.split("/").pop() || "";
};

const isCloudinaryImage = (path?: string) =>
  Boolean(path && path.includes("res.cloudinary.com"));

const getServiceImages = (service: IServicePackage) => {
  const images = service.images?.length ? service.images : [];
  const allImages = service.thumbnail
    ? [service.thumbnail, ...images.filter((img) => img !== service.thumbnail)]
    : images;

  return allImages.filter(isCloudinaryImage);
};

const getProtectedServiceImage = (image?: string) => {
  if (!image || !isCloudinaryImage(image)) return "";

  const fileName = getFileName(image);
  return fileName ? `${API_IMAGE_URL}/${fileName}` : "";
};

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isServicePackageDetail = searchParams.get("type") === "servicePackage";
  const navigate = useNavigate();
  const [service, setService] = useState<IServicePackage | null>(null);
  const [relatedServices, setRelatedServices] = useState<IServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [rewardPointsToUse, setRewardPointsToUse] = useState(0);

  const auth = useAuthStore() as any;
  const { points } = useReward();

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        setError("");

        const detailType = searchParams.get("type");
        const query = detailType ? `?type=${encodeURIComponent(detailType)}` : "";
        const response = await axios.get(`http://localhost:3000/api/v1/services/${id}${query}`);
        const payload = response.data;
        const data = payload.data || {};
        const serviceData = payload.service || data.service || data;

        setService(serviceData);
        setRelatedServices(payload.relatedServices || data.relatedServices || []);
        setActiveImg(0);
      } catch (err) {
        console.error("Fetch service detail error:", err);
        setError("Không thể tải dữ liệu sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    if (id) void fetchServiceData();
  }, [id, searchParams]);

  const images = useMemo(() => (service ? getServiceImages(service) : []), [service]);
  const designer = service?.designer || service?.designerId;
  const displayPrice = service ? service.discountPrice || service.price : 0;
  const maxRewardPointsToUse = Math.max(0, Math.min(points, Math.floor((displayPrice - 1) / 100)));
  const rewardDiscount = rewardPointsToUse * 100;
  const payableAmount = Math.max(displayPrice - rewardDiscount, 0);

  useEffect(() => {
    if (rewardPointsToUse > maxRewardPointsToUse) {
      setRewardPointsToUse(maxRewardPointsToUse);
    }
  }, [maxRewardPointsToUse, rewardPointsToUse]);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  };

  const handlePayment = async () => {
    if (!auth.userId && !auth.user) {
      alert("Vui lòng đăng nhập để mua dịch vụ!");
      navigate("/login");
      return;
    }

    try {
      const token = getCookie("access_token");

      if (!token) {
        alert("Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại!");
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/api/v1/payments/create-url",
        { serviceId: id, rewardPointsToUse: isServicePackageDetail ? 0 : rewardPointsToUse },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      }
    } catch (err: any) {
      console.error("Payment API error:", err.response || err);
      alert(err.response?.data?.message || "Lỗi khởi tạo thanh toán");
    }
  };

  if (loading) return <div style={styles.centerMsg}>Đang tải dữ liệu...</div>;
  if (error) return <div style={{ ...styles.centerMsg, color: "red" }}>{error}</div>;
  if (!service) return <div style={styles.centerMsg}>Không tìm thấy dịch vụ.</div>;

  const title = getServiceTitle(service);

  return (
      <div style={styles.container}>
        <div style={styles.mainGrid}>
          <div style={styles.leftCol}>
            <div style={styles.imageSection}>
              <div style={styles.mainImageWrapper}>
                {images.length > 0 ? (
                    <img
                        src={getProtectedServiceImage(images[activeImg])}
                        alt={title}
                        style={styles.mainImage}
                    />
                ) : (
                    <div style={styles.noImage}>Không có ảnh hợp lệ</div>
                )}
              </div>

              {images.length > 0 && (
                  <div style={styles.thumbnailRow}>
                    {images.map((img, idx) => (
                        <button
                            key={`${img}-${idx}`}
                            type="button"
                            onClick={() => setActiveImg(idx)}
                            style={{
                              ...styles.thumbContainer,
                              border: activeImg === idx ? "2px solid #8b5cf6" : "1px solid #eee",
                            }}
                        >
                          <img
                              src={getProtectedServiceImage(img)}
                              style={styles.thumbImg}
                              alt={`${title} ${idx + 1}`}
                          />
                        </button>
                    ))}
                  </div>
              )}
            </div>

            <div style={styles.infoSection}>
              {designer && (
                  <div style={styles.designerRow}>
                    <img
                        src={
                            designer.profilePicture ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(designer.fullName || "Designer")}`
                        }
                        style={styles.miniAvatar}
                        alt={designer.fullName}
                    />
                    <div>
                      <div style={styles.designerNameName}>
                        {designer.fullName} <span style={styles.proBadge}>PRO</span>
                      </div>
                      <div style={styles.ratingText}>
                        ★ {designer.rating ?? 0} - Designer
                      </div>
                    </div>
                  </div>
              )}

              <h1 style={styles.titleText}>{title}</h1>
              <p style={styles.descriptionText}>
                {service.description || "Chưa có mô tả cho dịch vụ này."}
              </p>
            </div>
          </div>

          <div style={styles.rightCol}>
            <div style={styles.pricingCard}>
              <div style={styles.priceSection}>
                <span style={styles.priceValue}>{displayPrice.toLocaleString("vi-VN")} đ</span>
                {service.discountPrice ? (
                    <span style={styles.originalPrice}>{service.price.toLocaleString("vi-VN")} đ</span>
                ) : null}
              </div>

              {!isServicePackageDetail && (
                  <div style={styles.rewardBox}>
                    <div style={styles.rewardHeader}>
                      <span style={styles.rewardTitle}>Dùng điểm thưởng</span>
                      <span style={styles.rewardBalance}>{points.toLocaleString("vi-VN")} điểm</span>
                    </div>
                    <div style={styles.rewardControl}>
                      <input
                          type="number"
                          min={0}
                          max={maxRewardPointsToUse}
                          value={rewardPointsToUse}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value || 0);
                            setRewardPointsToUse(Math.max(0, Math.min(maxRewardPointsToUse, nextValue)));
                          }}
                          style={styles.rewardInput}
                      />
                      <button
                          type="button"
                          onClick={() => setRewardPointsToUse(maxRewardPointsToUse)}
                          style={styles.rewardMaxBtn}
                      >
                        Tối đa
                      </button>
                    </div>
                    <div style={styles.rewardSummary}>
                      <span>Giảm {rewardDiscount.toLocaleString("vi-VN")} đ</span>
                      <strong>Thanh toán {payableAmount.toLocaleString("vi-VN")} đ</strong>
                    </div>
                  </div>
              )}

              <div style={styles.serviceCommitment}>
                <div style={styles.featureItem}>✓ Nhận file sau khi thanh toán</div>
                <div style={styles.featureItem}>✓ Hỗ trợ chỉnh sửa theo gói dịch vụ</div>
                <div style={styles.featureItem}>✓ Tùy chọn định dạng PNG, JPG, SVG</div>
                <div style={styles.featureItem}>✓ Được sử dụng cho mục đích thương mại</div>
              </div>

              <button style={styles.orderBtn} onClick={handlePayment}>
                Mua ngay
              </button>
              <button style={styles.contactBtn}>Liên hệ Designer</button>
            </div>
          </div>
        </div>

        {/*<div style={styles.relatedSection}>*/}
        {/*  <div style={styles.relatedHeader}>*/}
        {/*    <h2 style={styles.relatedTitle}>Dịch vụ tương tự</h2>*/}
        {/*  </div>*/}
        {/*  <div style={styles.relatedGrid}>*/}
        {/*    {relatedServices.map((item) => (*/}
        {/*      isCloudinaryImage(item.images?.[0] || item.thumbnail) && (*/}
        {/*        <div*/}
        {/*          key={item._id}*/}
        {/*          style={styles.relCard}*/}
        {/*          onClick={() =>*/}
        {/*            navigate(`/service/${item._id}?type=${item.listingType ? "servicePackage" : "service"}`)*/}
        {/*          }*/}
        {/*        >*/}
        {/*          <div style={styles.relImgBox}>*/}
        {/*            <img*/}
        {/*              src={getProtectedServiceImage(item.images?.[0] || item.thumbnail)}*/}
        {/*              style={styles.relImg}*/}
        {/*              alt={getServiceTitle(item)}*/}
        {/*            />*/}
        {/*          </div>*/}
        {/*          <div style={styles.relInfo}>*/}
        {/*            <div style={styles.relTitle}>{getServiceTitle(item)}</div>*/}
        {/*            <div style={styles.relPrice}>Từ {item.price.toLocaleString("vi-VN")} đ</div>*/}
        {/*          </div>*/}
        {/*        </div>*/}
        {/*      )*/}
        {/*    ))}*/}
        {/*  </div>*/}
        {/*</div>*/}
        <div style={styles.relatedSection}>
          <div style={styles.relatedHeader}>
            <h2 style={styles.relatedTitle}>Gói dịch vụ tương tự</h2>
          </div>
          <div style={styles.relatedGrid}>
            {relatedServices.map((item) => (
                <div key={item._id} style={styles.relCard} onClick={() => navigate(`/package/${item._id}`)}>
                  <div style={styles.relImgBox}>
                    <img src={getProtectedServiceImage(item.thumbnail || item.images?.[0])} style={styles.relImg}
                         alt="rel"/>
                  </div>
                  <div style={styles.relInfo}>
                    <div style={styles.relTitle}>{getServiceTitle(item)}</div>
                    <div style={styles.relPrice}>{item.price.toLocaleString("vi-VN")} đ</div>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {maxWidth: "1250px", padding: "30px 20px", fontFamily: "'Segoe UI', Roboto, sans-serif", color: "#1a1a1a"},
  centerMsg: {textAlign: "center", padding: "100px", fontSize: "16px"},
  mainGrid: {display: "grid", gridTemplateColumns: "1fr 360px", gap: "50px", alignItems: "flex-start"},
  leftCol: {display: "flex", flexDirection: "column"},
  imageSection: {width: "100%", display: "flex", flexDirection: "column", gap: "12px"},
  mainImageWrapper: {
    width: "100%",
    height: "450px",
    borderRadius: "20px",
    overflow: "hidden",
    backgroundColor: "#f4f4f4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  mainImage: {width: "100%", height: "100%", objectFit: "contain"},
  noImage: {color: "#777", fontSize: "15px", fontWeight: 600},
  thumbnailRow: {display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "5px"},
  thumbContainer: {
    width: "70px",
    height: "50px",
    flexShrink: 0,
    borderRadius: "8px",
    overflow: "hidden", cursor: "pointer", background: "white", padding: 0 },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  infoSection: { marginTop: "30px" },
  designerRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
  miniAvatar: { objectFit: "cover", width: "48px", height: "48px", borderRadius: "50%", border: "1px solid #eee" },
  designerNameName: { fontWeight: "700", fontSize: "17px" },
  proBadge: { backgroundColor: "#0075f2", color: "#fff", fontSize: "10px", padding: "2px 8px", borderRadius: "4px", marginLeft: "6px", verticalAlign: "middle" },
  ratingText: { fontSize: "13px", color: "#666", marginTop: "3px" },
  titleText: { fontSize: "28px", fontWeight: "800", marginBottom: "15px", color: "#000" },
  descriptionText: { fontSize: "15px", lineHeight: "1.7", color: "#444", marginBottom: "25px" },
  rightCol: { position: "sticky", top: "20px" },
  pricingCard: { border: "1px solid #efefef", borderRadius: "24px", padding: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)", backgroundColor: "#fff" },
  priceSection: { display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "25px", borderBottom: "1px solid #f5f5f5", paddingBottom: "20px" },
  priceValue: { fontSize: "30px", fontWeight: "800", color: "#000" },
  originalPrice: { color: "#999", fontSize: "16px", textDecoration: "line-through" },
  rewardBox: { border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px", marginBottom: "20px", backgroundColor: "#fafafa" },
  rewardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "10px" },
  rewardTitle: { fontSize: "14px", fontWeight: "700", color: "#111" },
  rewardBalance: { fontSize: "13px", fontWeight: "600", color: "#b45309" },
  rewardControl: { display: "grid", gridTemplateColumns: "1fr auto", gap: "8px", marginBottom: "10px" },
  rewardInput: { minWidth: 0, border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", fontWeight: "600", outline: "none" },
  rewardMaxBtn: { border: "1px solid #0075f2", borderRadius: "8px", padding: "0 12px", backgroundColor: "#fff", color: "#0075f2", fontSize: "13px", fontWeight: "700", cursor: "pointer" },
  rewardSummary: { display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "13px", color: "#444" },
  serviceCommitment: { marginBottom: "25px" },
  featureItem: { fontSize: "14px", color: "#555", marginBottom: "12px", display: "flex", alignItems: "center" },
  orderBtn: { width: "100%", padding: "16px", backgroundColor: "#0075f2", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "16px", cursor: "pointer", marginBottom: "12px", transition: "0.2s" },
  contactBtn: { width: "100%", padding: "16px", backgroundColor: "#fff", color: "#000", border: "1px solid #ddd", borderRadius: "12px", fontWeight: "600", fontSize: "16px", cursor: "pointer" },
  relatedSection: { marginTop: "30px", paddingTop: "30px", borderTop: "1px solid #eee" },
  relatedHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  relatedTitle: { fontSize: "22px", fontWeight: "800" },
  relatedGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "25px" },
  relCard: { cursor: "pointer", transition: "transform 0.2s" },
  relImgBox: { width: "100%", aspectRatio: "4/3", borderRadius: "16px", overflow: "hidden", marginBottom: "12px" },
  relImg: { width: "100%", height: "100%", objectFit: "cover" },
  relTitle: { fontSize: "15px", fontWeight: "700", marginBottom: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  relPrice: { fontSize: "14px", color: "#666" },
};

export default ServiceDetail;
