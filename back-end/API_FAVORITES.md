# API Yêu Thích - Favorites

## Mô tả
API cho phép người dùng quản lý danh sách gói dịch vụ yêu thích. Tất cả endpoints đều yêu cầu xác thực JWT.

## Authentication
Tất cả API đều cần header:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Thêm vào yêu thích
**POST** `/api/v1/favorites`

**Body:**
```json
{
  "serviceId": "64f123456789abcdef123456"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "Đã thêm vào danh sách yêu thích",
  "data": {
    "_id": "...",
    "user": "...",
    "service": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Response Error (Đã tồn tại):**
```json
{
  "success": false,
  "message": "Gói dịch vụ đã có trong danh sách yêu thích"
}
```

### 2. Lấy danh sách yêu thích
**GET** `/api/v1/favorites`

**Query Parameters:**
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số item per page (default: 10)

**Example:**
```
GET /api/v1/favorites?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách yêu thích thành công",
  "data": {
    "favorites": [
      {
        "_id": "...",
        "user": "...",
        "service": {
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
          "soldCount": 156,
          "createdAt": "..."
        },
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. Xóa khỏi yêu thích
**DELETE** `/api/v1/favorites/:serviceId`

**Example:**
```
DELETE /api/v1/favorites/64f123456789abcdef123456
```

**Response:**
```json
{
  "success": true,
  "message": "Đã xóa khỏi danh sách yêu thích"
}
```

### 4. Kiểm tra đã yêu thích chưa
**GET** `/api/v1/favorites/check/:serviceId`

**Example:**
```
GET /api/v1/favorites/check/64f123456789abcdef123456
```

**Response:**
```json
{
  "success": true,
  "message": "Kiểm tra trạng thái yêu thích thành công",
  "data": {
    "isFavorite": true
  }
}
```

### 5. Toggle yêu thích (Bonus)
**POST** `/api/v1/favorites/toggle/:serviceId`

**Example:**
```
POST /api/v1/favorites/toggle/64f123456789abcdef123456
```

**Response (Thêm mới):**
```json
{
  "success": true,
  "message": "Đã thêm vào danh sách yêu thích",
  "data": {
    "isFavorite": true,
    "action": "added",
    "favorite": {
      "_id": "...",
      "user": "...",
      "service": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

**Response (Xóa):**
```json
{
  "success": true,
  "message": "Đã xóa khỏi danh sách yêu thích",
  "data": {
    "isFavorite": false,
    "action": "removed"
  }
}
```

### 6. Lấy số lượng yêu thích
**GET** `/api/v1/favorites/count`

**Response:**
```json
{
  "success": true,
  "message": "Lấy số lượng yêu thích thành công",
  "data": {
    "count": 5
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "ID gói dịch vụ không hợp lệ"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Không tìm thấy gói dịch vụ"
}
```

## Database Schema

### Favorite Model
```javascript
{
  user: ObjectId,        // Ref to User
  service: ObjectId,     // Ref to ServicePackage
  createdAt: Date,       // Auto timestamp
  updatedAt: Date        // Auto timestamp
}
```

### Indexes
- `{ user: 1, service: 1 }` - Unique compound index
- `{ user: 1 }` - Query optimization
- `{ service: 1 }` - Query optimization

## Lưu ý
- Tất cả API đều yêu cầu JWT authentication
- Không cho phép lưu trùng (user + service)
- Chỉ lấy các service đang hoạt động (isActive: true)
- Có validate ObjectId cho tất cả tham số
- Response format thống nhất cho tất cả endpoints
- Có phân trang cho danh sách yêu thích