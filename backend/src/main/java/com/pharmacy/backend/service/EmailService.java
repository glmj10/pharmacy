package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.request.ConfirmationEmailRequest;
import com.pharmacy.backend.entity.Order;
import jakarta.mail.MessagingException;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;

public interface EmailService {
    void sendOrderConfirmationEmail(Order order, String userEmail)
            throws MessagingException, UnsupportedEncodingException;

    void sendResetEmail(String email, String token, LocalDateTime expiryAt, Boolean isUser)
            throws MessagingException, UnsupportedEncodingException;
}
