import { useState, useEffect, useCallback } from "react";
import { getAllCategories,deleteCategory,updateCategory,createCategory,} from "../../../services/categories.service";
import { Spinner } from "../../../components/spinner/spinner";
import { DeleteModal } from "../../../components/modals/DeleteModal";
import { CategoryFormModal } from "./CategoriesFromModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPencil,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faTags,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import "../products/ProductsPage.css"; // reuse the same design system

export const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const LIMIT = 10;

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCategories({ limit: LIMIT, page, filter: search });
      setCategories(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteCategory(deleteTarget.cat_id ?? deleteTarget.id);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message ?? "Delete failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (form) => {
    if (!updateTarget) return;
    setActionLoading(true);
    try {
      await updateCategory(updateTarget.cat_id ?? updateTarget.id, form);
      setUpdateTarget(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message ?? "Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (form) => {
    setActionLoading(true);
    try {
      await createCategory(form);
      setCreateOpen(false);
      fetchCategories();
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
          <h1>Categories</h1>
          <p className="subtitle">
            {total} categor{total !== 1 ? "ies" : "y"} in catalogue
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>
          <FontAwesomeIcon icon={faPlus} /> Add Category
        </button>
      </header>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            id="category-search"
            type="text"
            placeholder="Search categories…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="products-section">
        {loading ? (
          <div className="products-loading">
            <Spinner size={36} color="#6366f1" />
            <p>Loading categories…</p>
          </div>
        ) : error ? (
          <div className="products-error">
            <p>{error}</p>
            <button className="btn-ghost" onClick={fetchCategories}>Retry</button>
          </div>
        ) : categories.length === 0 ? (
          <div className="products-empty">
            <FontAwesomeIcon icon={faTags} className="empty-icon" />
            <p>No categories found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.cat_id ?? c.id}>
                    <td>
                      <div className="product-name">{c.name}</div>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="action-btn edit"
                          title="Edit category"
                          onClick={() => setUpdateTarget(c)}
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete category"
                          onClick={() => setDeleteTarget(c)}
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

      {/* Create modal */}
      {createOpen && (
        <CategoryFormModal
          mode="create"
          category={null}
          onSave={handleCreate}
          onCancel={() => setCreateOpen(false)}
          loading={actionLoading}
        />
      )}

      {/* Update modal */}
      {updateTarget && (
        <CategoryFormModal
          mode="edit"
          category={updateTarget}
          onSave={handleUpdate}
          onCancel={() => setUpdateTarget(null)}
          loading={actionLoading}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          title="Delete Category?"
          message={
            <>
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? Products
              under this category may be affected.
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