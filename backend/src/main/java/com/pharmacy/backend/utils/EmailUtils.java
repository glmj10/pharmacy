package com.pharmacy.backend.utils;

import com.pharmacy.backend.entity.Order;
import com.pharmacy.backend.entity.OrderDetail;
import com.pharmacy.backend.entity.Product;
import com.pharmacy.backend.entity.Profile;
import jakarta.transaction.Transactional;

import java.util.List;


public class EmailUtils {
    public static String buildOrderConfirmationEmail(Profile profile, Order order, String orderDetails) {
        return """
            <html>
              <body style="font-family: Arial, sans-serif; color: #333;">
                <h2>✅ Cảm ơn bạn đã đặt hàng tại <strong>Hiệu Thuốc</strong>!</h2>

                <p><strong>Khách hàng:</strong> %s</p>
                <p><strong>SĐT:</strong> %s</p>
                <p><strong>Địa chỉ:</strong> %s</p>
                <p><strong>Mã đơn hàng:</strong> #%d</p>
                <p><strong>Ngày đặt:</strong> %s</p>

                <h3>📦 Danh sách sản phẩm</h3>
                <table border="1" cellpadding="8" cellspacing="0" width="100%%" style="border-collapse: collapse;">
                  <thead style="background-color: #f5f5f5;">
                    <tr>
                      <th>STT</th>
                      <th>Sản phẩm</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    %s
                  </tbody>
                </table>

                <h3 style="text-align: right;">Tổng thanh toán: <span style="color: green;">%,.0f₫</span></h3>

                <p>Chúng tôi sẽ liên hệ để giao hàng sớm nhất. Trân trọng!</p>
                <p><em>Nhà Thuốc Pharmacy</em></p>
              </body>
            </html>
        """.formatted(profile.getFullName(), profile.getPhone(), profile.getAddress(),
                order.getId(), order.getCreatedAt(), orderDetails, (double) order.getTotalPrice());
    }


    public static String buildOrderDetailRow(List<OrderDetail> orderDetails) {
        StringBuilder rows = new StringBuilder();
        int i = 1;
        for( OrderDetail detail : orderDetails) {
            Product p = detail.getProduct();
            long quantity = detail.getQuantity();
            long price = detail.getPriceAtOrder();
            long totalPrice = quantity * price;

            rows.append(String.format("""
            <tr>
              <td style="text-align:center;">%d</td>
              <td>%s</td>
              <td style="text-align:right;">%,.0f₫</td>
              <td style="text-align:center;">%d</td>
              <td style="text-align:right;">%,.0f₫</td>
            </tr>
        """, i++, p.getTitle(), (double) price, quantity, (double) totalPrice));
        }

        return rows.toString();
    }
}
