# GoCart Frontend - Modern E-Commerce Platform

A feature-rich, responsive React-based e-commerce frontend with real-time delivery tracking, built using Vite and modern web technologies.

## 🎨 Features

### User Experience
- **Landing Page**: Engaging introduction to the platform
- **Authentication**: Secure login and registration system
- **Product Discovery**: Browse products with advanced search and filtering
- **Product Details**: Comprehensive product information with images
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices

### Shopping Features
- **Shopping Cart**: Real-time cart management with quantity updates
- **Wishlist**: Save favorite items for future purchase
- **Search Results**: Fast and accurate product search
- **Product Categories**: Organized product browsing

### Order Management
- **Order Placement**: Streamlined checkout process
- **Order History**: View all past and current orders
- **Real-time Tracking**: Live order tracking with map integration
- **Order Details**: Complete order information and status updates

### User Profile
- **Profile Management**: Update personal information and addresses
- **Location Services**: Integrated map for address selection
- **Order History**: Quick access to past purchases
- **Account Settings**: Manage account preferences

### Delivery Partner Portal
- **Separate Login**: Dedicated authentication for delivery partners
- **Dashboard**: Overview of deliveries and earnings
- **Active Orders**: View and manage assigned deliveries
- **Delivery Tracking**: Real-time GPS tracking during delivery
- **Earnings**: Track completed deliveries and payments
- **Profile Management**: Update availability and contact information
- **Completed Orders**: History of all delivered orders

### Real-time Features
- **Live Order Tracking**: Interactive map with SSE-powered real-time updates
- **Status Notifications**: Instant updates on order progress via Server-Sent Events
- **Delivery ETA**: Estimated time of arrival for orders
- **Location Sharing**: Real-time delivery partner location updates

## 🛠️ Tech Stack

- **Framework**: React 19.1.1
- **Build Tool**: Vite (Rolldown) 7.1.14
- **Routing**: React Router DOM 7.9.5
- **HTTP Client**: Axios 1.13.2
- **Maps & Location**:
  - Mapbox GL 3.17.0
  - Leaflet 1.9.4
  - React Leaflet 5.0.0
  - Mapbox Geocoder 5.1.2
- **UI/UX**: 
  - Lucide React (Icons) 0.556.0
  - Custom CSS with modern design
  - Responsive layouts
- **Styling**: Tailwind CSS 4.1.17 with custom configurations
- **Performance**: Vercel Speed Insights 1.3.1
- **State Management**: React Context API

## 📁 Project Structure

```
src/
├── components/              # Main user components
│   ├── AddCart.jsx         # Shopping cart
│   ├── AddProduct.jsx      # Product management
│   ├── CartContext.jsx     # Cart state management
│   ├── Homepage.jsx        # Main landing/products page
│   ├── Login.jsx           # User authentication
│   ├── Register.jsx        # User registration
│   ├── MyOrders.jsx        # Order history
│   ├── Navbar.jsx          # Main navigation
│   ├── ProductCard.jsx     # Product display component
│   ├── ProductDetails.jsx  # Detailed product view
│   ├── SearchResults.jsx   # Search functionality
│   ├── UserContext.jsx     # User state management
│   ├── UserOrderTracking.jsx # Order tracking
│   ├── UserProfile.jsx     # User profile & settings
│   ├── WishlistContext.jsx # Wishlist state
│   └── WishlistPage.jsx    # Wishlist view
├── delivery/               # Delivery partner components
│   ├── DeliveryCompletedOrders.jsx
│   ├── DeliveryDashboard.jsx
│   ├── DeliveryEarnings.jsx
│   ├── DeliveryNavbar.jsx
│   ├── DeliveryOrders.jsx
│   ├── DeliveryProfile.jsx
│   ├── DeliveryTracking.jsx
│   ├── PartnerLogin.jsx
│   └── PartnerRegister.jsx
├── pages/                  # Page-level components
│   ├── AuthContext.jsx     # Authentication state
│   └── LandingPage.jsx     # Welcome page
├── styles/                 # CSS modules and styles
│   └── user/
│       └── searchcard.css
├── App.jsx                 # Main application component
├── App.css                 # Global styles
└── main.jsx               # Application entry point
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- GoCart Backend running (see backend README)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd My_WebECommerce/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_MAPBOX_TOKEN=your_mapbox_access_token
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The application will start on `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

## 🚀 Usage

### For Customers

1. **Browse Products**: Visit the homepage to see all available products
2. **Search**: Use the search bar to find specific items
3. **Add to Cart**: Click on products to view details and add to cart
4. **Wishlist**: Save items for later by adding to wishlist
5. **Checkout**: Review cart and place orders
6. **Track Orders**: Monitor delivery status in real-time with map tracking

### For Delivery Partners

1. **Register**: Sign up as a delivery partner
2. **Login**: Access the delivery dashboard
3. **View Orders**: See assigned deliveries
4. **Start Delivery**: Accept and begin delivery
5. **Track Route**: Follow optimized route to customer
6. **Complete Delivery**: Update status upon delivery
7. **View Earnings**: Check completed deliveries and payments

## 🗺️ Map Integration

The application features comprehensive map integration:
- **User Order Tracking**: Real-time delivery tracking on interactive map
- **Delivery Partner Tracking**: GPS-based route navigation
- **Address Selection**: Interactive map for selecting delivery addresses
- **Location Services**: Geocoding and reverse geocoding

Uses Mapbox GL and Leaflet for robust mapping capabilities.

## 🎨 Design Features

- **Modern UI**: Clean, intuitive interface
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Enhanced user experience with transitions
- **Loading States**: Proper feedback during data fetching
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback for actions

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- Mobile devices (320px - 768px)
- Tablets (768px - 1024px)
- Desktops (1024px+)

## 🔐 Authentication Flow

1. Users/Partners register with email and password
2. JWT tokens stored in localStorage
3. Protected routes require authentication
4. Automatic token refresh on page reload
5. Logout clears tokens and redirects to login

## 🌐 API Integration

The frontend integrates with the GoCart backend API:
- RESTful API calls using Axios
- Interceptors for authentication headers
- Error handling and retry logic
- Request/response transformation

## 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Key Components

### Context Providers
- **AuthContext**: Manages authentication state
- **CartContext**: Shopping cart state management
- **UserContext**: User profile and settings
- **WishlistContext**: Wishlist management

### Protected Routes
Routes that require authentication:
- User Profile
- Cart & Checkout
- Order History
- Order Tracking
- Delivery Dashboard (for partners)

## 📊 Performance Optimization

- Code splitting with React.lazy
- Optimized images and assets
- Memoization of expensive computations
- Efficient re-rendering with React 19
- Vercel Speed Insights integration

## 🔄 State Management

Uses React Context API for global state:
- User authentication state
- Shopping cart items
- Wishlist items
- Selected products

## 🌟 Future Enhancements

- [ ] Payment gateway integration
- [ ] Product reviews and ratings
- [ ] Live chat support
- [ ] Social media sharing
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode theme

## 🐛 Known Issues

Please check the [Issues](../../issues) section for known bugs and feature requests.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ravi Kiran Mothukuri**

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for lightning-fast build tools
- Mapbox for excellent mapping services
- All contributors and testers

---

**Note**: This is a portfolio project showcasing modern React development with real-world e-commerce features and delivery tracking capabilities.