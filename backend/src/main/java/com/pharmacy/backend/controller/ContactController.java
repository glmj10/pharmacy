package com.pharmacy.backend.controller;

import com.pharmacy.backend.dto.request.ContactRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.ContactResponse;

import com.pharmacy.backend.dto.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/contacts")
public class ContactController {

    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> sendContactMessage(@RequestBody ContactRequest request) {
        return null;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping
    public ResponseEntity<PageResponse<List<ContactResponse>>> getContactMessages(@RequestParam(value = "pageIndex", defaultValue = "1") int pageIndex,
                                                                                 @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
                                                                                 @RequestParam(value = "status", required = false) Boolean status){
        return null;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactResponse>> changeContactStatus(@PathVariable Long id, Boolean status) {
        return null;
    }
}
