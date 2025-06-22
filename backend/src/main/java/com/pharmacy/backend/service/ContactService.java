package com.pharmacy.backend.service;

import com.pharmacy.backend.dto.request.ContactRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.ContactResponse;
import com.pharmacy.backend.dto.response.PageResponse;

import java.util.List;

public interface ContactService {
    ApiResponse<PageResponse<List<ContactResponse>>> getContactMessages(int pageIndex, int pageSize, Boolean status);
    ApiResponse<ContactResponse> sendContactMessage(ContactRequest request);
    ApiResponse<ContactResponse> changeContactStatus(Long id, Boolean status);
}
