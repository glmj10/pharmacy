package com.pharmacy.backend.service.impl;

import com.pharmacy.backend.dto.request.CartItemRequest;
import com.pharmacy.backend.dto.response.ApiResponse;
import com.pharmacy.backend.dto.response.CartItemResponse;
import com.pharmacy.backend.entity.Cart;
import com.pharmacy.backend.entity.CartItem;
import com.pharmacy.backend.entity.Product;
import com.pharmacy.backend.entity.User;
import com.pharmacy.backend.exception.AppException;
import com.pharmacy.backend.mapper.ProductMapper;
import com.pharmacy.backend.repository.CartItemRepository;
import com.pharmacy.backend.repository.CartRepository;
import com.pharmacy.backend.repository.ProductRepository;
import com.pharmacy.backend.repository.UserRepository;
import com.pharmacy.backend.security.SecurityUtils;
import com.pharmacy.backend.service.CartService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final ProductMapper productMapper;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    @Override
    public void createCart(User user) {
        if(cartRepository.existsByUser(user)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Giỏ hàng đã tồn tại", "Cart already exists for this user");
        }

        Cart cart = new Cart(user);
        cartRepository.save(cart);
    }

    @Override
    public ApiResponse<List<CartItemResponse>> getItemsInCart() {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ", "Invalid user"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại", "Cart not found for this user"));

        List<CartItem> items = cartItemRepository.findByCart(cart, Sort.by(Sort.Direction.DESC, "createdAt"));

        List<CartItemResponse> itemResponses = items.stream()
                .map(item -> CartItemResponse.builder()
                        .id(item.getId())
                        .product(productMapper.toProductResponse(item.getProduct()))
                        .quantity(item.getQuantity())
                        .priceAtAddition(item.getPriceAtAddition())
                        .build())
                .toList();

        return ApiResponse.<List<CartItemResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách sản phẩm trong giỏ hàng thành công")
                .data(itemResponses)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<CartItemResponse> addItemToCart(CartItemRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ", "Invalid user"));
        if(request.getQuantity() <= 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số lượng sản phẩm phải lớn hơn 0", "Invalid product quantity");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại", "Product not found"));

        if (product.getQuantity() < request.getQuantity()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số lượng sản phẩm không đủ", "Insufficient product quantity");
        }

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại", "Cart not found for this user"));

        CartItem existingItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(
                    (existingItem.getQuantity() + request.getQuantity() > product.getQuantity())
                            ? product.getQuantity()
                            : existingItem.getQuantity() + request.getQuantity()
            );
            existingItem.setPriceAtAddition(product.getPriceNew());
            existingItem = cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            newItem.setPriceAtAddition(product.getPriceNew());
            newItem.setCart(cart);
            cart.getCartItems().add(newItem);
            existingItem = cartItemRepository.save(newItem);
        }

        CartItemResponse response = CartItemResponse.builder()
                .id(existingItem.getId())
                .product(productMapper.toProductResponse(product))
                .quantity(existingItem.getQuantity())
                .priceAtAddition(product.getPriceNew())
                .build();

        return ApiResponse.<CartItemResponse>builder()
                .status(HttpStatus.CREATED.value())
                .message("Thêm sản phẩm vào giỏ hàng thành công")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<CartItemResponse> updateItemQuantity(Long itemId, Long quantity) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ", "Invalid user"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại", "Cart not found for this user"));

        CartItem item = cartItemRepository.findByCartAndId(cart, itemId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Sản phẩm trong giỏ hàng không tồn tại", "Cart item not found"));

        if (item.getProduct().getQuantity() < quantity) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số lượng sản phẩm không đủ", "Insufficient product quantity");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);

        CartItemResponse response = CartItemResponse.builder()
                .id(item.getId())
                .product(productMapper.toProductResponse(item.getProduct()))
                .quantity(item.getQuantity())
                .priceAtAddition(item.getPriceAtAddition())
                .build();

        return ApiResponse.<CartItemResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Cập nhật số lượng sản phẩm trong giỏ hàng thành công")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<Void> removeItemFromCart(Long itemId) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ", "Invalid user"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại", "Cart not found for this user"));

        CartItem item = cartItemRepository.findByCartAndId(cart, itemId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Sản phẩm trong giỏ hàng không tồn tại", "Cart item not found"));

        cartItemRepository.delete(item);

        return ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Xóa sản phẩm khỏi giỏ hàng thành công")
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<Void> clearCart() {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ", "Invalid user"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại", "Cart not found for this user"));

        cartItemRepository.deleteAll(cart.getCartItems());
        cart.getCartItems().clear();
        cartRepository.save(cart);

        return ApiResponse.<Void>builder()
                .status(HttpStatus.OK.value())
                .message("Đã xóa tất cả sản phẩm trong giỏ hàng")
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
