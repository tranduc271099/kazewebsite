const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Tạo transporter cho Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Email của bạn
        pass: process.env.EMAIL_PASS  // App password của Gmail
      }
    });
  }

  // Template HTML cho email xác nhận đơn hàng
  generateOrderConfirmationHTML(orderData) {
    const {
      customerName,
      customerEmail,
      orderId,
      orderDate,
      shippingAddress,
      paymentMethod,
      products,
      subtotal,
      shippingFee,
      discount,
      totalAmount,
      voucher
    } = orderData;

    // Format tiền Việt
    const formatVND = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    };

    // Format ngày
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    };

    const productsHTML = products.map(product => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center;">
            <div>
              <h4 style="margin: 0; color: #333;">${product.ten_san_pham}</h4>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                Màu: ${product.mau_sac} | Kích thước: ${product.kich_thuoc}
              </p>
            </div>
          </div>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${product.so_luong}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ${formatVND(product.gia)}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
          ${formatVND(product.gia * product.so_luong)}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận đơn hàng #${orderId}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">KazeWebsite</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Cảm ơn bạn đã đặt hàng!</p>
        </div>

        <!-- Main Content -->
        <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none;">
          
          <!-- Greeting -->
          <h2 style="color: #333; margin-bottom: 20px;">Chào ${customerName}!</h2>
          <p style="font-size: 16px; margin-bottom: 25px;">
            Đơn hàng của bạn đã được đặt thành công. Chúng tôi đang xử lý đơn hàng và sẽ giao hàng sớm nhất có thể.
          </p>

          <!-- Order Info -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Thông tin đơn hàng</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div><strong>Mã đơn hàng:</strong> #${orderId}</div>
              <div><strong>Ngày đặt:</strong> ${formatDate(orderDate)}</div>
              <div><strong>Phương thức thanh toán:</strong> ${paymentMethod}</div>
              <div><strong>Trạng thái:</strong> <span style="color: #28a745;">Đang xử lý</span></div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 10px;">Địa chỉ giao hàng</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
              ${shippingAddress}
            </div>
          </div>

          <!-- Products Table -->
          <div style="margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 15px;">Chi tiết sản phẩm</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 15px 10px; text-align: left; border-bottom: 2px solid #ddd;">Sản phẩm</th>
                  <th style="padding: 15px 10px; text-align: center; border-bottom: 2px solid #ddd;">SL</th>
                  <th style="padding: 15px 10px; text-align: right; border-bottom: 2px solid #ddd;">Đơn giá</th>
                  <th style="padding: 15px 10px; text-align: right; border-bottom: 2px solid #ddd;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${productsHTML}
              </tbody>
            </table>
          </div>

          <!-- Order Summary -->
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Tổng cộng</h3>
            <div style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Tạm tính:</span>
                <span>${formatVND(subtotal)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Phí vận chuyển:</span>
                <span>${formatVND(shippingFee)}</span>
              </div>
              ${voucher ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #28a745;">
                <span>Giảm giá (${voucher.code}):</span>
                <span>-${formatVND(discount)}</span>
              </div>
              ` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #e74c3c;">
              <span>Tổng cộng:</span>
              <span>${formatVND(totalAmount)}</span>
            </div>
          </div>

          <!-- Next Steps -->
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db;">
            <h3 style="margin: 0 0 10px 0; color: #2980b9;">Bước tiếp theo</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Chúng tôi sẽ xử lý và đóng gói đơn hàng trong vòng 24h</li>
              <li>Bạn sẽ nhận được thông báo khi đơn hàng được giao cho đơn vị vận chuyển</li>
              <li>Thời gian giao hàng dự kiến: 2-5 ngày làm việc</li>
            </ul>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #2c3e50; color: white; padding: 25px; text-align: center; border-radius: 0 0 10px 10px;">
          <h3 style="margin: 0 0 10px 0;">Cần hỗ trợ?</h3>
          <p style="margin: 0 0 15px 0;">Liên hệ với chúng tôi:</p>
          <div style="margin-bottom: 15px;">
            <span style="margin-right: 15px;">📞 0123-456-789</span>
            <span>📧 support@kazewebsite.com</span>
          </div>
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            © ${new Date().getFullYear()} KazeWebsite. Tất cả quyền được bảo lưu.
          </p>
        </div>

      </body>
      </html>
    `;
  }

  // Gửi email xác nhận đơn hàng
  async sendOrderConfirmation(orderData) {
    console.log('Chuẩn bị gửi email tới:', orderData.customerEmail);
    console.log('Sử dụng thông tin đăng nhập:', {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? '******' : 'Không có' // Che mật khẩu
    });

    try {
      const mailOptions = {
        from: {
          name: 'KazeWebsite',
          address: process.env.EMAIL_USER
        },
        to: orderData.customerEmail,
        subject: `Xác nhận đơn hàng #${orderData.orderId} - KazeWebsite`,
        html: this.generateOrderConfirmationHTML(orderData)
      };

      console.log('Đang gửi email với các tùy chọn:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await this.transporter.sendMail(mailOptions);

      console.log('--- Nodemailer Response ---');
      console.log('Message ID:', result.messageId);
      console.log('Accepted:', result.accepted);
      console.log('Rejected:', result.rejected);
      console.log('Response Code:', result.response);
      console.log('--------------------------');

      console.log('Email xác nhận đơn hàng đã được gửi thành công.');
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('--- LỖI GỬI EMAIL ---');
      console.error('Lỗi chi tiết:', error);
      console.error('--------------------');
      return { success: false, error: error.message };
    }
  }

  // Gửi email cập nhật trạng thái đơn hàng
  async sendOrderStatusUpdate(orderData) {
    try {
      const { customerName, customerEmail, orderId, oldStatus, newStatus } = orderData;

      const statusMessages = {
        'đang xử lý': 'Đơn hàng của bạn đang được xử lý',
        'đã xác nhận': 'Đơn hàng của bạn đã được xác nhận',
        'đang giao hàng': 'Đơn hàng của bạn đang được giao',
        'đã giao hàng': 'Đơn hàng của bạn đã được giao thành công',
        'hoàn thành': 'Đơn hàng của bạn đã hoàn thành',
        'đã hủy': 'Đơn hàng của bạn đã bị hủy'
      };

      const mailOptions = {
        from: {
          name: 'KazeWebsite',
          address: process.env.EMAIL_USER
        },
        to: customerEmail,
        subject: `Cập nhật đơn hàng #${orderId} - ${statusMessages[newStatus]}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Cập nhật trạng thái đơn hàng</h2>
            <p>Chào ${customerName},</p>
            <p>Đơn hàng #${orderId} của bạn đã được cập nhật trạng thái:</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Trạng thái cũ:</strong> ${oldStatus}</p>
              <p><strong>Trạng thái mới:</strong> <span style="color: #28a745;">${newStatus}</span></p>
            </div>
            <p>${statusMessages[newStatus]}</p>
            <p>Cảm ơn bạn đã tin tưởng KazeWebsite!</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email cập nhật trạng thái đã được gửi:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Lỗi khi gửi email cập nhật trạng thái:', error);
      return { success: false, error: error.message };
    }
  }

  // Template HTML cho email thông báo thanh toán thành công
  generatePaymentSuccessHTML(paymentData) {
    const {
      customerName,
      orderId,
      transactionNo,
      paymentAmount,
      paymentDate,
      orderStatus
    } = paymentData;

    // Format tiền Việt
    const formatVND = (amount) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    };

    // Format ngày
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Thanh toán thành công - KazeWebsite</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .success-icon { font-size: 48px; color: #28a745; text-align: center; margin-bottom: 20px; }
          .payment-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .amount { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          .btn { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Thanh toán thành công!</h1>
            <p>Cảm ơn bạn đã thanh toán đơn hàng</p>
          </div>

          <div class="content">
            <div class="success-icon">🎉</div>
            
            <h2>Xin chào ${customerName},</h2>
            
            <p>Chúng tôi đã nhận được thanh toán của bạn cho đơn hàng <strong>#${orderId}</strong>. Giao dịch đã được xử lý thành công!</p>

            <div class="payment-details">
              <h3>Chi tiết thanh toán:</h3>
              <div class="detail-row">
                <span>Mã đơn hàng:</span>
                <span><strong>#${orderId}</strong></span>
              </div>
              <div class="detail-row">
                <span>Mã giao dịch VNPay:</span>
                <span><strong>${transactionNo}</strong></span>
              </div>
              <div class="detail-row">
                <span>Thời gian thanh toán:</span>
                <span>${formatDate(paymentDate)}</span>
              </div>
              <div class="detail-row">
                <span>Phương thức thanh toán:</span>
                <span><strong>VNPay</strong></span>
              </div>
              <div class="detail-row">
                <span>Trạng thái đơn hàng:</span>
                <span><strong style="color: #ffc107;">Chờ xác nhận</strong></span>
              </div>
            </div>

            <div class="amount">
              Số tiền đã thanh toán: ${formatVND(paymentAmount)}
            </div>

            <p><strong>Bước tiếp theo:</strong></p>
            <ul>
              <li>Đơn hàng của bạn đang chờ được xác nhận bởi đội ngũ của chúng tôi</li>
              <li>Chúng tôi sẽ gửi email thông báo khi đơn hàng được xác nhận và chuẩn bị giao</li>
              <li>Bạn có thể theo dõi trạng thái đơn hàng trong tài khoản của mình</li>
            </ul>

            <div style="text-align: center;">
              <a href="http://localhost:3000/bill" class="btn">Xem lịch sử đơn hàng</a>
            </div>
          </div>

          <div class="footer">
            <p>Cảm ơn bạn đã mua sắm tại <strong>KazeWebsite</strong>!</p>
            <p>Nếu có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
            <p><em>Email này được gửi tự động, vui lòng không trả lời.</em></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Gửi email thông báo thanh toán thành công
  async sendPaymentSuccess(paymentData) {
    try {
      const mailOptions = {
        from: {
          name: 'KazeWebsite',
          address: process.env.EMAIL_USER
        },
        to: paymentData.customerEmail,
        subject: `✅ Thanh toán thành công đơn hàng #${paymentData.orderId} - KazeWebsite`,
        html: this.generatePaymentSuccessHTML(paymentData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email thông báo thanh toán thành công đã được gửi:', result.messageId);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Lỗi khi gửi email thông báo thanh toán:', error);
      return { success: false, error: error.message };
    }
  }

  // Template HTML cho email reset password
  generatePasswordResetHTML(resetData) {
    const { userName, resetLink, expiryTime } = resetData;

    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt lại mật khẩu - KazeWebsite</title>
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
          .message { font-size: 16px; color: #666; line-height: 1.6; margin-bottom: 30px; }
          .reset-button { text-align: center; margin: 30px 0; }
          .reset-button a { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: #ffffff; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }
          .reset-button a:hover { transform: translateY(-2px); }
          .expiry-info { 
            background-color: #fff3cd; 
            border: 1px solid #ffeaa7; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0; 
            font-size: 14px; 
            color: #856404; 
          }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .divider { height: 1px; background-color: #e9ecef; margin: 30px 0; }
          .security-note { background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #0c5460; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Đặt lại mật khẩu</h1>
          </div>
          
          <div class="content">
            <div class="greeting">Xin chào ${userName || 'bạn'},</div>
            
            <div class="message">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản KazeWebsite của bạn. 
              Để tạo mật khẩu mới, vui lòng nhấn vào nút bên dưới:
            </div>
            
            <div class="reset-button">
              <a href="${resetLink}" target="_blank">Đặt lại mật khẩu</a>
            </div>
            
            <div class="expiry-info">
              ⏰ <strong>Lưu ý:</strong> Link này sẽ hết hạn sau ${expiryTime} phút. 
              Nếu bạn không thực hiện trong thời gian này, bạn sẽ cần yêu cầu đặt lại mật khẩu mới.
            </div>
            
            <div class="divider"></div>
            
            <div class="security-note">
              🛡️ <strong>Bảo mật tài khoản:</strong><br>
              • Không chia sẻ link này với bất kỳ ai<br>
              • Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này<br>
              • Liên hệ với chúng tôi ngay lập tức nếu bạn nghi ngờ tài khoản bị xâm nhập
            </div>
            
            <div class="message">
              Nếu nút không hoạt động, bạn có thể copy và paste link sau vào trình duyệt:<br>
              <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Email này được gửi từ <strong>KazeWebsite</strong></p>
            <p>© ${new Date().getFullYear()} KazeWebsite. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Gửi email reset password
  async sendPasswordReset(resetData) {
    console.log('Chuẩn bị gửi email reset password tới:', resetData.userEmail);

    try {
      const mailOptions = {
        from: {
          name: 'KazeWebsite',
          address: process.env.EMAIL_USER
        },
        to: resetData.userEmail,
        subject: '🔐 Đặt lại mật khẩu tài khoản KazeWebsite',
        html: this.generatePasswordResetHTML(resetData)
      };

      console.log('Đang gửi email reset password với các tùy chọn:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      const result = await this.transporter.sendMail(mailOptions);

      console.log('--- Nodemailer Response ---');
      console.log('Message ID:', result.messageId);
      console.log('Accepted:', result.accepted);
      console.log('Rejected:', result.rejected);
      console.log('Response Code:', result.response);
      console.log('--------------------------');

      console.log('Email reset password đã được gửi thành công.');
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('--- LỖI GỬI EMAIL RESET PASSWORD ---');
      console.error('Lỗi chi tiết:', error);
      console.error('----------------------------------');
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
