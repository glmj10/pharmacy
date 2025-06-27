package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.entity.Order;
import com.pharmacy.backend.entity.Profile;
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

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendOrderConfirmationEmail(String to, Profile profile, Order order, String orderDetailHtml)
            throws MessagingException, UnsupportedEncodingException {
        String subject = "Xác nhận đơn hàng #" + order.getId();
        String html = EmailUtils.buildOrderConfirmationEmail(profile, order, orderDetailHtml);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(html, true);
        helper.setFrom(fromEmail, "Nhà Thuốc Pharmacy");

        mailSender.send(message);
    }
}
