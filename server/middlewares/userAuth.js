import jwt from "jsonwebtoken";

/**
 * Middleware xác thực người dùng dựa trên JWT Token từ Cookie.
 * Kiểm tra quyền truy cập trước khi cho phép vào các route yêu cầu đăng nhập.
 * * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const userAuth = (req, res, next) => {
  // 1. Trích xuất token từ cookies của trình duyệt
  const { token } = req.cookies;

  // 2. Kiểm tra sự tồn tại của token
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized: No token provided. Please login again." 
    });
  }

  try {
    // 3. Giải mã và kiểm tra tính hợp lệ của token bằng Secret Key
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Nếu giải mã thành công và có thông tin ID người dùng
    if (tokenDecode.id) {
      /**
       * Gán userId vào req.body để các controller tiếp theo (như verifyEmail, sendOtp)
       * có thể sử dụng trực tiếp mà không cần client gửi lên, tăng tính bảo mật.
       */
      req.body.userId = tokenDecode.id;
      
      // Cho phép request đi tiếp tới Controller hoặc Middleware tiếp theo
      next();
    } else {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: Invalid token payload. Login Again." 
      });
    }
  } catch (error) {
    // 5. Xử lý trường hợp token sai, hết hạn hoặc bị can thiệp
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized: Invalid or expired token. Please login again." 
    });
  }
};

export default userAuth;