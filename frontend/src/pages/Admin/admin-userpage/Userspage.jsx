import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAllUsersApi, updateUserApi } from "../../../services/users.service";
import { Spinner } from "../../../components/spinner/spinner";
import { Lightbox } from "../../../components/modals/Lightbox";
import { RoleUpdateModal } from "./Roleupdatemodal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGear,
  faSearch,
  faChevronLeft,
  faChevronRight,
  faUsers,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import "../products/ProductsPage.css"; // reuse the same design system

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
};

const ROLE_STYLES = {
  admin: { background: "#fef2f2", color: "#dc2626" },
  mod:   { background: "#eff6ff", color: "#2563eb" },
  user:  { background: "#f3f4f6", color: "#4b5563" },
};

export const UsersPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const isAdmin = currentUser?.role === "admin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const LIMIT = 10;

  const [lightbox, setLightbox] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsersApi({ limit: LIMIT, page, filter: search });
      setUsers(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleRoleUpdate = async ({ role }) => {
    if (!roleTarget) return;
    setActionLoading(true);
    try {
      await updateUserApi(roleTarget.id, { role });
      setRoleTarget(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message ?? "Role update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="products-page">
      <header className="products-header">
        <div>
          <h1>Users</h1>
          <p className="subtitle">
            {total} user{total !== 1 ? "s" : ""} registered
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            id="user-search"
            type="text"
            placeholder="Search by username or email…"
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
            <p>Loading users…</p>
          </div>
        ) : error ? (
          <div className="products-error">
            <p>{error}</p>
            <button className="btn-ghost" onClick={fetchUsers}>Retry</button>
          </div>
        ) : users.length === 0 ? (
          <div className="products-empty">
            <FontAwesomeIcon icon={faUsers} className="empty-icon" />
            <p>No users found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Organization</th>
                  <th>Role</th>
                  <th>Joined</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      {imgSrc(u.profile_pic) ? (
                        <img
                          src={imgSrc(u.profile_pic)}
                          alt={u.username}
                          className="product-thumb"
                          onClick={() => setLightbox({ src: imgSrc(u.profile_pic), alt: u.username })}
                          title="Click to enlarge"
                        />
                      ) : (
                        <div className="product-thumb-placeholder">
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="product-name">{u.username}</div>
                    </td>

                    <td className="product-category">{u.email}</td>

                    <td className="product-category">{u.organization ?? "—"}</td>

                    <td>
                      <span
                        className="status-pill"
                        style={ROLE_STYLES[u.role] ?? ROLE_STYLES.user}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="product-category">
                      {new Date(u.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>

                    <td>
                      <div className="action-btns">
                        <button
                          className="action-btn edit"
                          title="Update role"
                          onClick={() => setRoleTarget(u)}
                        >
                          <FontAwesomeIcon icon={faUserGear} />
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

     
      {lightbox && (
        <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}

      
      {roleTarget && (
        <RoleUpdateModal
          targetUser={roleTarget}
          onSave={handleRoleUpdate}
          onCancel={() => setRoleTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
};