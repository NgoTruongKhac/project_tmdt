# API Gói Dịch Vụ - Service Packages

## Cài đặt và chạy

### 1. Seed dữ liệu mẫu
```bash
npm run seed
```

### 2. Chạy server
```bash
npm run dev
```

## API Endpoints

### 1. Lấy tất cả gói dịch vụ
**GET** `/api/v1/services`

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số item per page (default: 8)

**Example:**
```
GET /api/v1/services?page=1&limit=8
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách gói dịch vụ thành công",
  "data": {
    "services": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 20,
      "itemsPerPage": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 2. Lấy gói bán chạy
**GET** `/api/v1/services/best-sellers`

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách gói bán chạy thành công",
  "data": [...]
}
```

### 3. Lấy gói mới nhất
**GET** `/api/v1/services/newest`

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách gói mới nhất thành công",
  "data": [...]
}
```

### 4. Lấy gói nổi bật
**GET** `/api/v1/services/featured`

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách gói nổi bật thành công",
  "data": [...]
}
```

### 5. Lấy chi tiết gói dịch vụ
**GET** `/api/v1/services/:slug`

**Example:**
```
GET /api/v1/services/thiet-ke-poster-su-kien
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy chi tiết gói dịch vụ thành công",
  "data": {
    "_id": "...",
    "name": "Thiết kế Poster Sự Kiện",
    "slug": "thiet-ke-poster-su-kien",
    "description": "...",
    "price": 299000,
    "discountPrice": 199000,
    "category": "poster",
    "thumbnail": "...",
    "isBestSeller": true,
    "isFeatured": true,
    "isActive": true,
    "soldCount": 156,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

## Data Model

### ServicePackage Schema
```javascript
{
  name: String,           // Tên gói dịch vụ
  slug: String,           // URL slug (unique)
  description: String,    // Mô tả chi tiết
  price: Number,          // Giá gốc
  discountPrice: Number,  // Giá khuyến mãi (nullable)
  category: String,       // Danh mục: poster, banner, social-media, business, event, combo, other
  thumbnail: String,      // URL hình ảnh
  isBestSeller: Boolean,  // Gói bán chạy
  isFeatured: Boolean,    // Gói nổi bật
  isActive: Boolean,      // Trạng thái hoạt động
  soldCount: Number,      // Số lượng đã bán
  createdAt: Date,        // Ngày tạo
  updatedAt: Date         // Ngày cập nhật
}
```

## Lưu ý
- Tất cả API chỉ trả về các gói có `isActive: true`
- API có xử lý lỗi tự động thông qua `asyncHandler`
- Dữ liệu được tối ưu với MongoDB indexes
- Response format thống nhất cho tất cả endpoints