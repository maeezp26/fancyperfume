import { Suspense, lazy } from "react";
import "./App.css";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import Home from "./Components/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Category from "./Components/Category";
import About from "./Components/About";
import Contact from "./Components/Feedback";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Cart from "./Components/Cart";
import Checkout from "./Components/Checkout";
import ProtectedRoute from "./Components/ProtectedRoute";
import MyOrders from "./Components/MyOrders";
import ProductDetails from "./Components/ProductDetails";
import Profile from "./Components/Profile";
import ScrollToTop from "./Components/ScrollToTop";

import { AuthProvider }  from "./contexts/AuthContext";
import { CartProvider }  from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lazy-load admin panel — large bundle, only admins visit
const Admin        = lazy(() => import("./Components/Admin/Admin"));
const HomeAdmin    = lazy(() => import("./Components/Admin/HomeAdmin"));
const ProductAdmin = lazy(() => import("./Components/Admin/ProductAdmin"));
const AboutAdmin   = lazy(() => import("./Components/Admin/AboutAdmin"));
const FeedbackAdmin= lazy(() => import("./Components/Admin/FeedbackAdmin"));
const OrdersAdmin  = lazy(() => import("./Components/Admin/OrdersAdmin"));

const AdminFallback = () => (
  <div style={{ display:"flex", justifyContent:"center", alignItems:"center", minHeight:"60vh", color:"#888" }}>
    Loading Admin Panel…
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <BrowserRouter>
            {/* Scroll to top on every route change */}
            <ScrollToTop />
            <Header />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="dark" />
            <Routes>
              <Route path="/"          element={<Home />} />
              <Route path="/category"  element={<Category />} />
              <Route path="/about"     element={<About />} />
              <Route path="/contact"   element={<Contact />} />
              <Route path="/login"     element={<Login />} />
              <Route path="/register"  element={<Register />} />
              <Route path="/cart"      element={<Cart />} />
              <Route path="/checkout"  element={<Checkout />} />
              <Route path="/myorders"  element={<MyOrders />} />
              <Route path="/profile"   element={<Profile />} />
              <Route path="/product/:id" element={<ProductDetails />} />

              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <Suspense fallback={<AdminFallback />}><Admin /></Suspense>
                </ProtectedRoute>
              }>
                <Route index          element={<Suspense fallback={<AdminFallback />}><HomeAdmin /></Suspense>} />
                <Route path="home"    element={<Suspense fallback={<AdminFallback />}><HomeAdmin /></Suspense>} />
                <Route path="product" element={<Suspense fallback={<AdminFallback />}><ProductAdmin /></Suspense>} />
                <Route path="about"   element={<Suspense fallback={<AdminFallback />}><AboutAdmin /></Suspense>} />
                <Route path="feedback"element={<Suspense fallback={<AdminFallback />}><FeedbackAdmin /></Suspense>} />
                <Route path="orders"  element={<Suspense fallback={<AdminFallback />}><OrdersAdmin /></Suspense>} />
              </Route>
            </Routes>
            <Footer />
          </BrowserRouter>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
