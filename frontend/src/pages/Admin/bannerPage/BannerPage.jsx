import { useState, useEffect, useCallback } from "react";
import {
  getAllBannersApi,
  deleteBanner,
  updateBanner,
  createBanner,
  toggleBanner,
} from "../../../services/banner.service";
import { Spinner } from "../../../components/spinner/spinner";
import { DeleteModal } from "../../../components/modals/DeleteModal";
import { Lightbox } from "../../../components/modals/Lightbox";
import { BannerFormModal } from "./BannerFormModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPencil,
  faImages,
  faImage,
  faPlus,
  faToggleOn,
  faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import "../products/ProductsPage.css"; // reuse the same design system
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
};

export const BannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [lightbox, setLightbox] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updateTarget, setUpdateTarget] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toggleLoadingId, setToggleLoadingId] = useState(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBannersApi();
    
      setBanners(data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load banners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteBanner(deleteTarget.banner_id);
      setDeleteTarget(null);
        toast.success("Banner deleted successfully.");
      fetchBanners();
    } catch (err) {
      toast.warning(err.response?.data?.message ?? "Delete failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (fd) => {
    if (!updateTarget) return;
    setActionLoading(true);
    try {
      await updateBanner(updateTarget.banner_id, fd);
      setUpdateTarget(null);
      toast.success("Banner updated successfully.");
      fetchBanners();
    } catch (err) {
      toast.warning(err.response?.data?.message ?? "Update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreate = async (fd) => {
    setActionLoading(true);
    try {
      await createBanner(fd);
      setCreateOpen(false);
      toast.success("Banner created successfully.");
      fetchBanners();
    } catch (err) {
      toast.warning(err.response?.data?.message ?? "Create failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (id) => {
    setToggleLoadingId(id);
    try {
      await toggleBanner(id);
      toast.success("Banner status changed successfully.");
      fetchBanners();
    } catch (err) {
      toast.warning(err.response?.data?.message ?? "Failed to change banner status.");
    } finally {
      setToggleLoadingId(null);
    }
  };

  return (
    <div className="products-page">
      <header className="products-header">
        <div>
          <h1>Banners</h1>
          <p className="subtitle">
            {banners.length} banner{banners.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>
          <FontAwesomeIcon icon={faPlus} /> Add Banner
        </button>
      </header>

      {/* Table */}
      <div className="products-section">
        {loading ? (
          <div className="products-loading">
            <Spinner size={36} color="#6366f1" />
            <p>Loading banners…</p>
          </div>
        ) : error ? (
          <div className="products-error">
            <p>{error}</p>
            <button className="btn-ghost" onClick={fetchBanners}>Retry</button>
          </div>
        ) : banners.length === 0 ? (
          <div className="products-empty">
            <FontAwesomeIcon icon={faImages} className="empty-icon" />
            <p>No banners found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b.banner_id}>
                    <td>
                      {imgSrc(b.image_path) ? (
                        <img
                          src={imgSrc(b.image_path)}
                          alt={b.title}
                          className="product-thumb"
                          onClick={() => setLightbox({ src: imgSrc(b.image_path), alt: b.title })}
                          title="Click to enlarge"
                        />
                      ) : (
                        <div className="product-thumb-placeholder">
                          <FontAwesomeIcon icon={faImage} />
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="product-name">{b.title}</div>
                    </td>
                    <td>
                      <div className="product-name">{b.description}</div>
                    </td>

                    <td>
                      <button
                        className="action-btn"
                        style={{ background: "transparent", fontSize: "1.4rem" }}
                        onClick={() => handleToggle(b.banner_id)}
                        disabled={toggleLoadingId === b.banner_id}
                        title={b.is_active ? "Deactivate" : "Activate"}
                      >
                        {toggleLoadingId === b.banner_id ? (
                          <Spinner size={18} color="#6366f1" />
                        ) : (
                          <FontAwesomeIcon
                            icon={b.is_active ? faToggleOn : faToggleOff}
                            color={b.is_active ? "#059669" : "#9ca3af"}
                          />
                        )}
                      </button>
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="action-btn edit"
                          title="Edit banner"
                          onClick={() => setUpdateTarget(b)}
                        >
                          <FontAwesomeIcon icon={faPencil} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete banner"
                          onClick={() => setDeleteTarget(b)}
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

      {/* Lightbox */}
      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      {/* Create modal */}
      {createOpen && (
        <BannerFormModal
          mode="create"
          banner={null}
          onSave={handleCreate}
          onCancel={() => setCreateOpen(false)}
          loading={actionLoading}
        />
      )}

      {/* Update modal */}
      {updateTarget && (
        <BannerFormModal
          mode="edit"
          banner={updateTarget}
          onSave={handleUpdate}
          onCancel={() => setUpdateTarget(null)}
          loading={actionLoading}
        />
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          title="Delete Banner?"
          message={
            <>
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>? This
              action cannot be undone.
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