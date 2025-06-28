package com.pharmacy.backend.service;

import com.pharmacy.backend.entity.Order;
import com.pharmacy.backend.entity.Profile;
import jakarta.mail.MessagingException;

import java.io.UnsupportedEncodingException;

public interface EmailService {
    void sendOrderConfirmationEmail(Order order)
            throws MessagingException, UnsupportedEncodingException;
}
