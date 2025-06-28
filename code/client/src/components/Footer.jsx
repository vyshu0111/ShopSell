import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="Footer">
      <div className="footer-header">
        <h4>ShopEZ — One Destination for All Your Needs</h4>
      </div>

      <div className="footer-body">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/category/Fashion">Fashion</Link></li>
          <li><Link to="/category/Electronics">Electronics</Link></li>
          <li><Link to="/category/Groceries">Groceries</Link></li>
        </ul>

        <ul>
          <li><Link to="/cart">Cart</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/orders">Orders</Link></li>
          <li><Link to="/auth">Login / Signup</Link></li>
        </ul>

        <ul>
          <li><Link to="/category/Mobiles">Mobiles</Link></li>
          <li><Link to="/category/Laptops">Laptops</Link></li>
          <li><Link to="/category/Sports-Equipment">Sports</Link></li>
          <li><Link to="/category/Beauty">Beauty</Link></li>
        </ul>

        <ul>
          <li>Help</li>
          <li>Terms & Conditions</li>
          <li>Privacy Policy</li>
          <li>Contact Us</li>
        </ul>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ShopEZ.com — All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
