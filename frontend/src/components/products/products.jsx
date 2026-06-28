import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { getAllProducts } from "../../services/products.service";
import { addToCartApi } from "../../services/cart.service";
import { addToCart } from "../../store/cartSlice";
import { Spinner } from "../spinner/spinner.jsx";
import "./products.css";

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts({ limit: 10 });
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to the cart");
      return;
    }

    try {
      const res = await addToCartApi(product.product_id, 1);
      if (res.success) {
        
        toast.success(`${product.name} added to cart!`);
      
        dispatch(addToCart(res.data));
          // window.location.reload();
         
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error(error.response?.data?.message || "Failed to add item to cart");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px", width: "100%", backgroundColor: "#f9fafb" }}>
        <Spinner size={40} color="#3b82f6" />
      </div>
    );
  }

  if (products.length === 0) {
    return <div style={{ textAlign: "center", padding: "4rem" }}>No products available at the moment.</div>;
  }
  const carouselProducts = [...products, ...products];
  return (
    <div className="products-container">
      <div className="products-header">
        <h2 className="products-title">Featured Products</h2>
        <Link to="/products" className="products-more-btn">
          More Products
        </Link>
      </div>

      <div className="products-carousel-wrapper">
        <div className="products-carousel">
          {carouselProducts.map((product, index) => (
            <div className="product-card" key={`${product.id}-${index}`}>
              <div className="product-image-container">
                <img
                  src={`${import.meta.env.VITE_API_URL}/${product.image}`}
                  alt={product.name}
                  className="product-image"
                />
              </div>
              <div className="product-details">
                {product.category_name && (
                  <span className="product-category">{product.category_name}</span>
                )}
                <h3 className="product-name">{product.name}</h3>
                <h3 className="product-name">{product.description?.slice(0, 50)}</h3>
                <p className="product-price">
                  {product.discount_price > 0 ? (
                    <>
                      <span className="line-through">Rs.{product.price}</span>
                      <span>Rs.{product.discount_price}</span>
                    </>
                  ) : (
                    <span>Rs.{product.price}</span>
                  )}
                </p>

                
                <button
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                >
                  <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
