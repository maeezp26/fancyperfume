import "./App.css";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import Home from "./Components/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Category from "./Components/Category";
import About from "./Components/About";
import Contact from "./Components/Feedback";
import AddProduct from "./Components/AddProduct";
import AdminPanel from "./Components/AdminPanel";
import ProductDetails from "./Components/ProductDetails";
import HomeAdmin from "./Components/Admin/HomeAdmin";
import ProductAdmin from "./Components/Admin/ProductAdmin";
import AboutAdmin from "./Components/Admin/AboutAdmin";
import FeedbackAdmin from "./Components/Admin/FeedbackAdmin";
import OrdersAdmin from "./Components/Admin/OrdersAdmin";

import Login from "./Components/Login";
import Register from "./Components/Register";
import Admin from "./Components/Admin/Admin";
import ProtectedRoute from "./Components/ProtectedRoute";
import Cart from "./Components/Cart";
import Checkout from "./Components/Checkout";

import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import MyOrders from "./Components/MyOrders";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Header />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category" element={<Category />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/addproduct" element={<AddProduct />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/myorders" element={<MyOrders />} />
              
              
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                  <Admin />
                </ProtectedRoute>
              }>
                <Route index element={<HomeAdmin />} />
                <Route path="home" element={<HomeAdmin />} />
                <Route path="product" element={<ProductAdmin />} />
                <Route path="about" element={<AboutAdmin />} />
                <Route path="feedback" element={<FeedbackAdmin />} />
                <Route path="orders" element={<OrdersAdmin />} />
              </Route>
              
              <Route path="/product/:id" element={<ProductDetails />} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
