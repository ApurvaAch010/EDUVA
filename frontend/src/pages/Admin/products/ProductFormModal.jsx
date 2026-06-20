import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck, faImage } from "@fortawesome/free-solid-svg-icons";
import { Spinner } from "../../../components/spinner/spinner";

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

const imgSrc = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
};

export const ProductFormModal = ({ mode, product, categories, onSave, onCancel, loading }) => {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    discount_price: product?.discount_price ?? 0,
    stock: product?.stock ?? "",
    category_id: product?.category_id ?? "",
    is_active: product?.is_active ?? true,
  });
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(isEdit ? imgSrc(product?.image) : null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Price must be a positive number");
      return;
    }

    if (form.discount_price !== "") {
      const discountNum = parseFloat(form.discount_price);
      if (isNaN(discountNum) || discountNum < 0) {
        alert("Discount price must be a non-negative number");
        return;
      }
      if (discountNum >= priceNum) {
        alert("Discount price must be less than the regular price");
        return;
      }
    }

    const stockNum = parseInt(form.stock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      alert("Stock must be a non-negative integer");
      return;
    }

    if (!isEdit && !newImage) {
      alert("Please upload a product image");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (newImage) fd.append("productImg", newImage);

    onSave(fd);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card update-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEdit ? "Update Product" : "Add Product"}</h2>
          <button className="modal-close-btn" onClick={onCancel} disabled={loading}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <form className="update-form" onSubmit={handleSubmit}>
          <div className="update-img-section">
            <label className="update-img-label" htmlFor="product-img-input">
              {preview ? (
                <img src={preview} alt="preview" className="update-img-preview" />
              ) : (
                <div className="update-img-placeholder">
                  <FontAwesomeIcon icon={faImage} />
                  <span>Click to add image</span>
                </div>
              )}
            </label>
            <input
              id="product-img-input"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          <div className="form-grid">
            <div className="form-group full">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={255}
                required
              />
            </div>

            <div className="form-group full">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Price (Rs.)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.cat_id || c.id} value={c.cat_id || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Discount Price</label>
              <input
                type="number"
                name="discount_price"
                value={form.discount_price}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                step="1"
                required
              />
            </div>

            <div className="form-group toggle-group">
              <label>Active</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <Spinner size={16} color="#fff" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} /> {isEdit ? "Save Changes" : "Add Product"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};