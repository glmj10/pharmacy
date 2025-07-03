# Pharmacy Management System - Frontend

A modern, responsive pharmacy management system built with React and CoreUI. This application provides a comprehensive admin dashboard for managing products, orders, users, and pharmacy operations.

## Features

### 🏥 Pharmacy Management
- **Product Management**: Create, read, update, delete pharmacy products with image upload
- **Order Management**: Track and manage customer orders with status updates
- **User Management**: Manage customer accounts and admin users
- **Category & Brand Management**: Organize products by categories and brands
- **Contact Management**: Handle customer inquiries and support tickets
- **Blog Management**: Manage pharmaceutical content and news

### 🎨 Modern UI/UX
- Responsive design that works on desktop, tablet, and mobile
- Dark/Light theme support
- Vietnamese language support
- Clean, professional pharmacy-focused interface
- Real-time loading states and error handling

### � Technical Features
- React 18 with modern hooks pattern
- Custom hooks for API management (`useProducts`, `useOrders`, etc.)
- Centralized error handling and loading states
- Reusable components (LoadingSpinner, EmptyState)
- Image upload and file management
- Pagination and search functionality
- Form validation and user feedback

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API server running (see backend README)

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd pharmacy/frontend

# Install dependencies
npm install

# Create environment file
cp sample.env .env

# Update .env with your backend API URL
# VITE_API_URL=http://localhost:8080/api/v1

# Start development server
npm start
```

The application will be available at `http://localhost:3000/admin`

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run serve
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (LoadingSpinner, EmptyState, etc.)
│   ├── header/         # Header components
│   └── ...
├── config/             # Configuration files
│   ├── api.js          # Axios configuration
│   └── constants.js    # API endpoints and constants
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
│   ├── useProducts.js  # Product management hook
│   ├── useOrders.js    # Order management hook
│   ├── useApiCall.js   # Generic API call hook
│   └── ...
├── services/           # API service classes
│   ├── product.service.js
│   ├── order.service.js
│   └── ...
├── utils/              # Utility functions
├── views/              # Page components
│   ├── admin/          # Admin dashboard pages
│   │   ├── products/   # Product management pages
│   │   ├── orders/     # Order management pages
│   │   └── ...
│   ├── dashboard/      # Main dashboard
│   ├── pages/          # Public pages (404, 500, etc.)
│   └── profile/        # User profile
├── scss/               # Styling files
├── routes.js           # Route definitions
├── _nav.js            # Navigation configuration
└── App.js             # Main application component
```

## API Integration

The frontend communicates with a Spring Boot backend API. Key features:

- **Authentication**: JWT-based authentication with automatic token refresh
- **Error Handling**: Centralized error handling with user-friendly messages
- **Loading States**: Consistent loading indicators across all operations
- **Optimistic Updates**: Immediate UI updates with server synchronization

### Custom Hooks

#### useProducts
```javascript
const {
  products, loading, error, pagination,
  getProducts, createProduct, updateProduct, deleteProduct, toggleProductStatus
} = useProducts()
```

#### useOrders
```javascript
const {
  orders, loading, error, pagination,
  getOrders, updateOrderStatus, updatePaymentStatus
} = useOrders()
```

## Development Guidelines

### Code Organization
- Use functional components with hooks
- Custom hooks for business logic
- Consistent error handling patterns
- Reusable components for common UI elements

### Naming Conventions
- Components: PascalCase (e.g., `ProductList`)
- Files: PascalCase for components, camelCase for utilities
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE

### Error Handling
- All API calls wrapped in try-catch blocks
- User-friendly error messages
- Loading states for all async operations
- Error boundaries for component error handling

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style and patterns
2. Use the established custom hooks for API operations
3. Add loading states and error handling for new features
4. Update this README when adding new features

## License

This project is licensed under the MIT License.