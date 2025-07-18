import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModalProvider } from './contexts/AuthModalContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Import các trang hiện có
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/Products/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Profile from './pages/Profile/Profile';
import Orders from './pages/Orders/Orders';
import OrderDetail from './pages/Orders/OrderDetail';
import Wishlist from './pages/Wishlist/Wishlist';
import VnpayReturnPage from './pages/Payment/VnpayReturnPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Import các trang Blog mới
import Blog from './pages/Blogs/Blog'; // Trang danh sách blog
import BlogDetail from './pages/Blogs/BlogDetail'; // Trang chi tiết blog

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthModalProvider>
          <CartProvider>
            <Router>
              <div className="App">
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:slug" element={<ProductDetail />} />
                    
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogDetail />} />

                    <Route path="/cart" element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders/:id" element={
                      <ProtectedRoute>
                        <OrderDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/wishlist" element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    } />
                    <Route path="/payment/vnpay-return" element={<VnpayReturnPage />} />

                  </Routes>
                </main>
                <Footer />
              </div>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
              />
            </Router>
          </CartProvider>
        </AuthModalProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;