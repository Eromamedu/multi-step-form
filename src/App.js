//  import './App.css';
// /* App.jsx */
// import React from 'react';
// import './App.css';
import React from "react";
// import Navbar from "./components/header/headers.jsx";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import CommentSection from "./components/Intercomapps/Intercomapp";
// import Home from "./components/Home/Home.jsx";
// import Promo from "./components/Promos.jsx/Promo.jsx";
// import Footer from "./components/Footer/Footer.jsx";
import "./App.css";
// import IntercomApp from "./components/intercomapps/intercomapp";
// import Sellon from "./components/Sellon/Sellon.jsx";
// import Opay from "./components/opay/opay.jsx";
// import Cart from "./components/cart/cart.jsx";
// import Ordered from "./components/Ordered/Ordered.jsx";
  // const [cartCount, setCartCount] = useState(0);
  // function addToCart() {
  //   setCartCount(cartCount + 1);
  // }
  // const [cartItems, setCartItems] = useState([]);
  // const [product, setProduct] = useState([]);
  // const handleAddToCart = (product) => {
    // setCartItems((prevItems) => [...prevItems , product]);
  // };

//   const handleAddToCart = () => {
//     if (setCartItems === 0) {
//       setCartItems(null)
//     } else {
//        setCartItems((prev) => prev + 1);
//     }
// };

export default function App() {
  return (
    <div className="app-container">
      <CommentSection />
    </div>
  );
}


// function App() {
//   return (
//     <div className="jumia-app">
//       <header className="jumia-header">
//         <div className="logo">Jumia Clone</div>
//         <nav className="nav-links">
//           <a href="/">Home</a>
//           <a href="/deals">Deals</a>
//           <a href="/categories">Categories</a>
//           <a href="/cart">Cart</a>
//         </nav>
//       </header>

//       <section className="hero-banner">
//         <div className="hero-text">
//           <h1>Welcome to Jumia</h1>
//           <p>Discover great deals every day</p>
//           <button className="shop-now">Shop Now</button>
//         </div>
//         <div className="hero-image">
//           <img src="https://via.placeholder.com/600x400" alt="Deals" />
//         </div>
//       </section>

//       <main className="products">
//       </main>
//     </div>
//   );
// }

// export default App;
