// src/App.jsx
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import HomePage from './pages/Home';
import ListingsPage from './pages/products'; // Was ListingsPage
import ListingDetailsPage from './pages/ProductDetails'; // Was ListingDetailsPage
import AddListingPage from './pages/addProducts'; // Was AddListingPage
import LoginPage from './auth/signIn'; // Was pages/auth/LoginPage
import SignupPage from './auth/signUp'; // Was pages/auth/SignupPage
import ProfilePage from './pages/profile';
import MyListingsPage from './pages/MyProducts'; // Was MyListingsPage
import MessagesPage from './pages/Messages';
import FavoritesPage from './pages/Favorites';
import NotFoundPage from './pages/NotFound';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="products" element={<ListingsPage />} /> {/* Alias if needed */}
          <Route path="listings/:id" element={<ListingDetailsPage />} />
          <Route path="products/:id" element={<ListingDetailsPage />} /> {/* Alias if needed */}
          <Route path="favorites" element={<FavoritesPage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signin" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="add-listing" element={<AddListingPage />} />
            <Route path="addProducts" element={<AddListingPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="my-listings" element={<MyListingsPage />} />
            <Route path="my-products" element={<MyListingsPage />} />
            <Route path="messages" element={<MessagesPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
