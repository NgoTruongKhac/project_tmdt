# Test API Favorites

## Chuẩn bị
1. Đảm bảo server đang chạy: `npm run dev`
2. Có JWT token hợp lệ từ API login
3. Có serviceId hợp lệ từ API services

## Test Commands (sử dụng curl)

### 1. Lấy JWT Token (Login trước)
```bash
# Đăng nhập để lấy token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. Lấy danh sách services để có serviceId
```bash
curl -X GET http://localhost:3000/api/v1/services
```

### 3. Thêm vào yêu thích
```bash
curl -X POST http://localhost:3000/api/v1/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "serviceId": "SERVICE_ID_FROM_STEP_2"
  }'
```

### 4. Lấy danh sách yêu thích
```bash
curl -X GET http://localhost:3000/api/v1/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Kiểm tra đã yêu thích chưa
```bash
curl -X GET http://localhost:3000/api/v1/favorites/check/SERVICE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Toggle yêu thích
```bash
curl -X POST http://localhost:3000/api/v1/favorites/toggle/SERVICE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Lấy số lượng yêu thích
```bash
curl -X GET http://localhost:3000/api/v1/favorites/count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Xóa khỏi yêu thích
```bash
curl -X DELETE http://localhost:3000/api/v1/favorites/SERVICE_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Test với Postman

### Setup
1. Tạo Collection mới: "Favorites API"
2. Tạo Environment với variables:
   - `baseUrl`: http://localhost:3000
   - `token`: (sẽ set sau khi login)
   - `serviceId`: (lấy từ services API)

### Pre-request Script (cho tất cả requests)
```javascript
// Set Authorization header
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('token')
});
```

### Test Scripts
```javascript
// Cho response thành công
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response has success field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData.success).to.be.true;
});

pm.test("Response has message field", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('message');
});
```

## Expected Results

### Thêm vào yêu thích (lần đầu)
- Status: 201
- Message: "Đã thêm vào danh sách yêu thích"
- Data: favorite object

### Thêm vào yêu thích (lần 2 - trùng)
- Status: 400
- Message: "Gói dịch vụ đã có trong danh sách yêu thích"

### Lấy danh sách yêu thích
- Status: 200
- Data: array of favorites với service populated
- Pagination info

### Kiểm tra yêu thích
- Status: 200
- Data: { isFavorite: true/false }

### Toggle yêu thích
- Status: 200/201
- Data: { isFavorite: boolean, action: "added"/"removed" }

### Xóa yêu thích
- Status: 200
- Message: "Đã xóa khỏi danh sách yêu thích"

## Troubleshooting

### 401 Unauthorized
- Kiểm tra JWT token có hợp lệ không
- Kiểm tra header Authorization có đúng format không

### 400 Bad Request
- Kiểm tra serviceId có đúng ObjectId format không
- Kiểm tra request body có đúng format không

### 404 Not Found
- Kiểm tra serviceId có tồn tại trong database không
- Kiểm tra service có isActive: true không