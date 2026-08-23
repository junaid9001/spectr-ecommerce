import './App.css';
import Register from './register';
import Login from './login';
import Home from './home';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Store from './store';
import Cart from './cart';
import Checkout from './checkout';
import Profile from './profile';
import Productdetail from './productdetail';
import Orders from './orders';
import Wishlist from './wishlist';
import Admin from './admin';
import Adminproducts from './adminproducts';
import Adminusers from './adminusers';

// Route Guard for Admin views
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.isAdmin) {
    return children;
  }
  return <Navigate to="/login" replace />;
};

import Adminorders from './adminorders';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<Home />} />
          <Route path='/store' element={<Store />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/checkout' element={<Checkout />} />
          <Route path='/product_details/:id' element={<Productdetail />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/wishlist' element={<Wishlist />} />
          
          {/* Protected Admin Routes */}
          <Route path='/admin' element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path='/admin/orders' element={<AdminRoute><Adminorders /></AdminRoute>} />
          <Route path='/admin/products' element={<AdminRoute><Adminproducts /></AdminRoute>} />
          <Route path='/admin/users' element={<AdminRoute><Adminusers /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
