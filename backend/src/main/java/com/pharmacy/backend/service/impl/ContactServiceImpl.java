package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.ContactRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.ContactResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.repository.ContactRepository;
import com.pharmacy.backend.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {
    private final ContactRepository contactRepository;

    @Override
    public ApiResponse<PageResponse<List<ContactResponse>>> getContactMessages(int pageIndex, int pageSize, Boolean status) {
        return null;
    }

    @Override
    public ApiResponse<ContactResponse> sendContactMessage(ContactRequest request) {
        return null;
    }

    @Override
    public ApiResponse<ContactResponse> changeContactStatus(Long id, Boolean status) {
        return null;
    }
}
