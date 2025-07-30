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
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại", "User not found"));
        List<Wishlist> wishlist = wishlistRepository.findAllByUser(user);
        List<ProductResponse> productResponses = wishlist.stream().map(
                w -> {
                    Product product = w.getProduct();
                    ProductResponse response = productMapper.toProductResponse(product);
                    Boolean isInWishList = wishlistRepository.existsByProductAndUser(product, user);
                    response.setInWishlist(isInWishList);
                    return response;
                }
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

        if (wishlistRepository.existsByUserAndProduct(user, product)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Sản phẩm đã có trong danh sách yêu thích", "Product already in wishlist");
        }

        wishlist.setProduct(product);
        product.setNumberOfLikes(product.getNumberOfLikes() + 1);
        productRepository.save(product);
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

        if(product.getNumberOfLikes() > 0) {
            product.setNumberOfLikes(product.getNumberOfLikes() - 1);
        }

        productRepository.save(product);
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
            return ApiResponse.buildResponse(
                    HttpStatus.NO_CONTENT.value(),
                    "Danh sách yêu thích trống",
                    null
            );
        }

        productRepository.saveAll(wishlists.stream().map(Wishlist::getProduct
        ).peek(product -> {
            if(product.getNumberOfLikes() > 0) {
                product.setNumberOfLikes(product.getNumberOfLikes() - 1);
            }
        }).toList());

        wishlistRepository.deleteAll(wishlists);

        return ApiResponse.buildResponse(
                HttpStatus.OK.value(),
                "Xóa tất cả sản phẩm khỏi danh sách yêu thích thành công",
                null
        );
    }
}
