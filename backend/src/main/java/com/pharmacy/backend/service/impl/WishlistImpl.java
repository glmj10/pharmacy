package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.ProductResponse;
import com.pharmacy.backend.entity.Product;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.entity.Wishlist;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.ProductMapper;
import com.pharmacy.backend.repository.ProductRepository;
import com.pharmacy.backend.repository.UserRepository;
import com.pharmacy.backend.repository.WishlistRepository;
import com.pharmacy.backend.security.SecurityUtils;
import com.pharmacy.backend.service.WishlistService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class WishlistImpl implements WishlistService {
    private final WishlistRepository wishlistRepository;
    private final ProductMapper productMapper;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    @Override
    public ApiResponse<List<ProductResponse>> getMyWishlist() {
        List<Wishlist> wishlist = wishlistRepository.findAllByUser_Id(SecurityUtils.getCurrentUserId());
        List<ProductResponse> productResponses = wishlist.stream().map(
            w -> productMapper.toProductResponse(w.getProduct())
        ).toList();

        return ApiResponse.buildResponse(HttpStatus.OK.value(),
                "Lấy danh sách yêu thích thành công", productResponses);
    }

    @Transactional
    @Override
    public ApiResponse<Void> addProductToWishlist(Long productId) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", "User not found"));
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại", "Product not found"));
        if(product.getActive() == null || !product.getActive()) {
            throw new AppException(HttpStatus.NOT_FOUND, "Sản phẩm không khả dụng", "Product not available");
        }
        wishlist.setProduct(product);

        wishlistRepository.save(wishlist);

        return ApiResponse.buildResponse(HttpStatus.CREATED.value(),
                "Thêm sản phẩm vào danh sách yêu thích thành công", null);
    }

    @Transactional
    @Override
    public ApiResponse<Void> removeProductFromWishlist(Long productId) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", "User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại", "Product not found"));

        Wishlist wishlist = wishlistRepository.findByUserAndProduct(user, product)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Sản phẩm không có trong danh sách yêu thích", "Wishlist not found"));
        wishlistRepository.delete(wishlist);

        return ApiResponse.buildResponse(HttpStatus.OK.value(),
                "Xóa sản phẩm khỏi danh sách yêu thích thành công", null);
    }

    @Transactional
    @Override
    public ApiResponse<Void> clearWishlist() {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", "User not found"));

        List<Wishlist> wishlists = wishlistRepository.findAllByUser(user);

        if (wishlists.isEmpty()) {
            return ApiResponse.<Void>builder()
                    .status(HttpStatus.NO_CONTENT.value())
                    .message("Danh sách yêu thích trống")
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        wishlistRepository.deleteAll(wishlists);

        return ApiResponse.buildResponse(HttpStatus.OK.value(),
                "Xóa tất cả sản phẩm khỏi danh sách yêu thích thành công", null);
    }
}
