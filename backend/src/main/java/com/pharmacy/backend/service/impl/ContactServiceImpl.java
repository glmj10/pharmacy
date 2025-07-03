package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.ContactRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.ContactResponse;
import com.pharmacy.backend.dto.response.PageResponse;
import com.pharmacy.backend.entity.Contact;
import com.pharmacy.backend.mapper.ContactMapper;
import com.pharmacy.backend.repository.ContactRepository;
import com.pharmacy.backend.service.ContactService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {
    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;

    @Override
    public ApiResponse<PageResponse<List<ContactResponse>>> getContactMessages(int pageIndex, int pageSize, Boolean status) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }
        if(pageSize <= 0) {
            pageSize = 10;
        }
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<Contact> contactPage = status != null
                ? contactRepository.findAllByActive(status, pageable)
                : contactRepository.findAll(pageable);

        List<ContactResponse> contactResponses = contactPage.getContent().stream()
                .map(contact -> {
                    ContactResponse response = contactMapper.toContactResponse(contact);
                    response.setActive(contact.getActive());
                    return response;
                }).toList();

        PageResponse<List<ContactResponse>> pageResponse = PageResponse.<List<ContactResponse>>builder()
                .content(contactResponses)
                .currentPage(pageIndex)
                .totalElements(contactPage.getTotalElements())
                .totalPages(contactPage.getTotalPages())
                .hasNext(contactPage.hasNext())
                .hasPrevious(contactPage.hasPrevious())
                .build();

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Lấy thông tin yêu cầu tư vấn thành công",
                pageResponse
        );
    }

    @Transactional
    @Override
    public ApiResponse<ContactResponse> sendContactMessage(ContactRequest request) {
        Contact contact = contactMapper.toContact(request);

        Contact savedContact = contactRepository.save(contact);
        ContactResponse response = contactMapper.toContactResponse(savedContact);

        return ApiResponse.buildResponse(
                HttpStatus.CREATED.value(),
                "Gửi yêu cầu tư vấn thành công",
                response
        );
    }

    @Transactional
    @Override
    public ApiResponse<ContactResponse> changeContactStatus(Long id, Boolean status) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        contact.setActive(status);
        Contact updatedContact = contactRepository.save(contact);
        ContactResponse response = contactMapper.toContactResponse(updatedContact);
        response.setActive(updatedContact.getActive());

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Cập nhật trạng thái yêu cầu tư vấn thành công",
                response
        );
    }
}
