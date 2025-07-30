package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.entity.*;
import com.pharmacy.backend.service.EmailService;
import com.pharmacy.backend.utils.EmailUtils;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private final EmailUtils emailUtils;

    @Override
    public void sendOrderConfirmationEmail(Order order, String userEmail)
            throws MessagingException, UnsupportedEncodingException {
        String subject = "Xác nhận đơn hàng #" + order.getId();
        String html = EmailUtils.buildOrderConfirmationEmail(order.getCustomerName(),
                order.getCustomerPhoneNumber(), order.getCustomerAddress(), order, EmailUtils.buildOrderDetailRow(order.getOrderDetails()));

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(userEmail);
        helper.setSubject(subject);
        helper.setText(html, true);
        helper.setFrom(fromEmail, "Nhà Thuốc Pharmacy");

        mailSender.send(message);
    }

    @Override
    public void sendResetEmail(String email, String token, LocalDateTime expiryAt, Boolean isUser){
        String subject = "Yêu cầu đặt lại mật khẩu";
        String html;
        if(isUser) {
            html = emailUtils.buildUserResetPasswordEmail(token, expiryAt);
        } else {
            html = emailUtils.buildAdminResetPasswordEmail(token, expiryAt);
        }
        send(email, subject, html);
    }

    public void send(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            helper.setFrom(fromEmail, "Nhà Thuốc Pharmacy");

            mailSender.send(message);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
