import { useState, useEffect, useCallback } from "react";
import { getAllProducts, deleteProduct, updateProduct, createProduct } from "../../../services/products.service";
import { getAllCategories } from "../../../services/categories.service";
import { Spinner } from "../../../components/spinner/spinner";
import { DeleteModal } from "../../../components/modals/DeleteModal";
import { Lightbox } from "../../../components/modals/Lightbox";
import { ProductFormModal } from "./ProductFormModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPencil,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faBoxOpen,
  faSort,
  faImage,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import "./ProductsPage.css";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
};

const currency = (n) => `Rs. ${Number(n).toLocaleString("en-IN")}`;

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState("newest");
  const LIMIT = 10;

  const [lightbox, setLightbox] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProducts({ limit: LIMIT, page, search, sort });
      setProducts(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [page, search, sort]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getAllCategories({ limit: 100 });
      setCategories(data.data ?? []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteProduct(deleteTarget.product_id);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message ?? "Delete failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (fd) => {
    if (!updateTarget) return;
    setActionLoading(true);
    try {
      await updateProduct(updateTarget.product_id, fd);
      setUpdateTarget(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message ?? "Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (fd) => {
    setActionLoading(true);
    try {
      await createProduct(fd);
      setCreateOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message ?? "Create failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="products-page">
      <header className="products-header">
        <div>
          <h1>Products</h1>
          <p className="subtitle">
            {total} product{total !== 1 ? "s" : ""} in catalogue
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>
          <FontAwesomeIcon icon={faPlus} /> Add Product
        </button>
      </header>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            id="product-search"
            type="text"
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="sort-box">
          <FontAwesomeIcon icon={faSort} className="sort-icon" />
          <select
            id="product-sort"
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="products-section">
        {loading ? (
          <div className="products-loading">
            <Spinner size={36} color="#6366f1" />
            <p>Loading products…</p>
          </div>
        ) : error ? (
          <div className="products-error">
            <p>{error}</p>
            <button className="btn-ghost" onClick={fetchProducts}>Retry</button>
          </div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <FontAwesomeIcon icon={faBoxOpen} className="empty-icon" />
            <p>No products found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Discount</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.product_id}>
                    <td>
                      {imgSrc(p.image) ? (
                        <img
                          src={imgSrc(p.image)}
                          alt={p.name}
                          className="product-thumb"
                          onClick={() => setLightbox({ src: imgSrc(p.image), alt: p.name })}
                          title="Click to enlarge"
                        />
                      ) : (
                        <div className="product-thumb-placeholder">
                          <FontAwesomeIcon icon={faImage} />
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="product-name">{p.name}</div>
                      {p.description && (
                        <div className="product-desc">{p.description}</div>
                      )}
                    </td>

                    <td className="product-category">{p.category_name ?? "—"}</td>

                    <td className="product-price">{currency(p.price)}</td>

                    <td className="product-discount">
                      {p.discount_price ? (
                        <span className="discount-badge">{currency(p.discount_price)}</span>
                      ) : (
                        <span className="no-discount">—</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`stock-badge ${
                          p.stock === 0 ? "out" : p.stock <= 5 ? "low" : "ok"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>

                    <td>
                      <span className={`status-pill ${p.is_active ? "active" : "inactive"}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="action-btn edit"
                          title="Edit product"
                          onClick={() => setUpdateTarget(p)}
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete product"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className="page-info">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      {/* Create modal */}
      {createOpen && (
        <ProductFormModal
          mode="create"
          product={null}
          categories={categories}
          onSave={handleCreate}
          onCancel={() => setCreateOpen(false)}
          loading={actionLoading}
        />
      )}

      {/* Update modal */}
      {updateTarget && (
        <ProductFormModal
          mode="edit"
          product={updateTarget}
          categories={categories}
          onSave={handleUpdate}
          onCancel={() => setUpdateTarget(null)}
          loading={actionLoading}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          title="Delete Product?"
          message={
            <>
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This action
              cannot be undone.
            </>
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};