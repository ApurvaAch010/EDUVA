import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus, faSearch, faChevronLeft, faChevronRight, faComment } from "@fortawesome/free-solid-svg-icons";
import { getAllProducts } from "../../services/products.service";
import { getAllCategories } from "../../services/categories.service";
import { addToCartApi } from "../../services/cart.service";
import { addToCart } from "../../store/cartSlice";
import { Spinner } from "../../components/spinner/spinner.jsx";
import { ProductCommentsModal } from "../../components/comments/ProductCommentsModal.jsx";
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
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showCommentsModal, setShowCommentsModal] = useState(false);
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

            {selectedProduct ? (
                <div className="product-detail-view">
                    <button className="back-btn" onClick={() => setSelectedProduct(null)}>
                        <FontAwesomeIcon icon={faChevronLeft} /> Back to Products
                    </button>
                    <div className="product-detail-content">
                        <div className="product-detail-left">
                            <img
                                src={`${import.meta.env.VITE_API_URL}/${selectedProduct.image}`}
                                alt={selectedProduct.name}
                                className="product-detail-image"
                            />
                        </div>
                        <div className="product-detail-right">
                            {selectedProduct.category_name && (
                                <span className="product-detail-category">{selectedProduct.category_name}</span>
                            )}
                            <h1 className="product-detail-title">{selectedProduct.name}</h1>
                            <p className="product-detail-desc">{selectedProduct.description}</p>
                            
                            <div className="product-detail-meta">
                                <p className="product-detail-price">
                                    {selectedProduct.discount_price > 0 ? (
                                        <>
                                            <span className="line-through">Rs.{selectedProduct.price}</span>
                                            <span className="discounted-price">Rs.{selectedProduct.discount_price}</span>
                                        </>
                                    ) : (
                                        <span>Rs.{selectedProduct.price}</span>
                                    )}
                                </p>
                                <p className="product-detail-stock">
                                    Stock: <span className={`stock-count ${selectedProduct.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : 'Out of Stock'}
                                    </span>
                                </p>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                                <button
                                    className="add-to-cart-btn detail-add-btn"
                                    onClick={() => handleAddToCart(selectedProduct)}
                                    disabled={selectedProduct.stock <= 0}
                                >
                                    <FontAwesomeIcon icon={faCartPlus} /> {selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>

                                <button
                                    className="product-comments-trigger-btn"
                                    onClick={() => setShowCommentsModal(true)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.25rem',
                                        borderRadius: '8px',
                                        backgroundColor: '#eff6ff',
                                        color: '#279b65ff',
                                        border: '1px solid #279b65ff',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <FontAwesomeIcon icon={faComment} /> Comments
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : loading ? (
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
                        <div 
                            className="product-card" 
                            key={product.product_id}
                            onClick={() => setSelectedProduct(product)}
                            style={{ cursor: 'pointer' }}
                        >
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
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(product);
                                    }}
                                >
                                    <FontAwesomeIcon icon={faCartPlus} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedProduct && (
                <ProductCommentsModal
                    productId={selectedProduct.product_id || selectedProduct.id}
                    productName={selectedProduct.name}
                    isOpen={showCommentsModal}
                    onClose={() => setShowCommentsModal(false)}
                />
            )}
        </div>
    );
};