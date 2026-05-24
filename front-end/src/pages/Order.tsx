import { useLocation } from "react-router-dom";

const Order = () => {
    const location = useLocation();
    const product = location.state?.product;

    return (
        <div style={{ padding: "40px" }}>
            <h1>Xác nhận mua hàng</h1>

            {product && (
                <div>
                    <h2>{product.title}</h2>
                    <p>Giá: ${product.price}</p>
                </div>
            )}

            <button
                style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    background: "green",
                    color: "#fff",
                    border: "none",
                }}
            >
                Thanh toán
            </button>
        </div>
    );
};

export default Order;