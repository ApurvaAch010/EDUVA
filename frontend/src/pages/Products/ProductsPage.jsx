import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faSearch, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { getAllProducts } from "../../services/products.service";
import { getAllCategories } from "../../services/categories.service";
import { addToCartApi } from "../../services/cart.service";
import { addToCart } from "../../store/cartSlice";
import { Spinner } from "../../components/spinner/spinner.jsx";
import "../../components/products/products.css";
import "./ProductsPage.css";

export const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const limit = 12;
    
    const { isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const fetchCategories = async () => {
        try {
            const res = await getAllCategories({ limit: 100 });
            if (res.success) {
                setCategories(res.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = { limit, page };
            if (search) params.search = search;
            if (categoryId) params.category_id = categoryId;
            
            const res = await getAllProducts(params);
            if (res.success) {
                setProducts(res.data || []);
                setTotalPages(res.totalPages || 1);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [page, search, categoryId, limit]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchProducts]);

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
            }
        } catch (error) {
            console.error("Failed to add to cart:", error);
            toast.error(error.response?.data?.message || "Failed to add item to cart");
        }
    };

    const handleCategoryChange = (e) => {
        setCategoryId(e.target.value);
        setPage(1); 
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handlePrevPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    return (
        <div className="products-page-container">
            <div className="products-page-header">
                <div className="header-left">
                    <select 
                        className="category-dropdown" 
                        value={categoryId} 
                        onChange={handleCategoryChange}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.cat_id} value={cat.cat_id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="header-right">
                    <div className="search-container">
                        <FontAwesomeIcon icon={faSearch} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="search-input"
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="pagination-controls">
                        <button 
                            className="pagination-btn" 
                            onClick={handlePrevPage} 
                            disabled={page === 1 || loading}
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <span className="pagination-info">
                            Page {page} of {totalPages || 1}
                        </span>
                        <button 
                            className="pagination-btn" 
                            onClick={handleNextPage} 
                            disabled={page >= totalPages || loading}
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px", width: "100%" }}>
                    <Spinner size={40} color="#3b82f6" />
                </div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", fontSize: "1.2rem", color: "#6b7280" }}>
                    No products found.
                </div>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <div className="product-card" key={product.product_id}>
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
                                <h3 className="product-name" style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 'normal' }}>
                                    {product.description?.slice(0, 50)}{product.description?.length > 50 ? '...' : ''}
                                </h3>
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
            )}
        </div>
    );
};