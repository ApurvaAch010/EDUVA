import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faComment,
  faImage,
  faTrash,
  faEdit,
  faPaperPlane,
  faSpinner,
  faUserCircle,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import {
  getProductComments,
  addComment,
  updateComment,
  deleteComment,
} from "../../services/comments.service";
import "./ProductCommentsModal.css";

export const ProductCommentsModal = ({ productId, productName, isOpen, onClose }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [editingComment, setEditingComment] = useState(null);


  const [deletingId, setDeletingId] = useState(null);

  // Lightbox preview for images
  const [lightboxUrl, setLightboxUrl] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await getProductComments(productId);
      if (res.success) {
        setComments(res.result || []);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
      toast.error(error.response?.data?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (isOpen && productId) {
      fetchComments();
      resetForm();
    }
  }, [isOpen, productId, fetchComments]);

  const resetForm = () => {
    setCommentText("");
    setSelectedFiles([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setEditingComment(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (files.length + selectedFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images per comment.");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);

    // reset input value so re-selecting same file works
    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditClick = (comment) => {
    setEditingComment(comment);
    setCommentText(comment.comment || "");
    // Reset file selections for edit (user can upload up to 5 new images)
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to post or edit comments");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Please write a comment");
      return;
    }

    if (selectedFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("comment", commentText.trim());
    selectedFiles.forEach((file) => {
      formData.append("comment_images", file);
    });

    try {
      if (editingComment) {
        const res = await updateComment(editingComment.id, formData);
        if (res.success) {
          toast.success("Comment updated successfully!");
          resetForm();
          fetchComments();
        }
      } else {
        const res = await addComment(productId, formData);
        if (res.success) {
          toast.success("Comment posted successfully!");
          resetForm();
          fetchComments();
        }
      }
    } catch (error) {
      console.error("Failed to save comment:", error);
      toast.error(error.response?.data?.message || "Failed to save comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteComment(deletingId);
      if (res.success) {
        toast.success("Comment deleted");
        setComments((prev) => prev.filter((c) => c.id !== deletingId));
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error(error.response?.data?.message || "Failed to delete comment");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="comments-modal-overlay" onClick={onClose}>
      <div
        className="comments-modal-container"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="comments-modal-header">
          <div className="header-title-group">
            <FontAwesomeIcon icon={faComment} className="header-comment-icon" />
            <h3 className="comments-modal-title">
              Comments for {productName}
              <span className="comments-count-badge">{comments.length}</span>
            </h3>
          </div>
          <button className="comments-modal-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="comments-modal-body">
          {isAuthenticated ? (
            <form className="comment-form-card" onSubmit={handleSubmit}>
              <div className="form-header">
                <span className="form-mode-label">
                  {editingComment ? "Edit Comment" : "Add a Comment"}
                </span>
                {editingComment && (
                  <button
                    type="button"
                    className="cancel-edit-btn"
                    onClick={handleCancelEdit}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <textarea
                className="comment-textarea"
                rows="3"
                placeholder="Share your thoughts about this product..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={1000}
              />

              {/* Uploaded Images Preview */}
              {previewUrls.length > 0 && (
                <div className="image-previews-grid">
                  {previewUrls.map((url, idx) => (
                    <div className="preview-item" key={idx}>
                      <img src={url} alt={`Preview ${idx + 1}`} />
                      <button
                        type="button"
                        className="remove-preview-btn"
                        onClick={() => handleRemoveImage(idx)}
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="comment-form-toolbar">
                <div className="upload-btn-wrapper">
                  <label
                    htmlFor="comment-images-input"
                    className={`upload-image-label ${
                      selectedFiles.length >= 5 ? "disabled" : ""
                    }`}
                  >
                    <FontAwesomeIcon icon={faImage} />
                    <span>
                      {selectedFiles.length > 0
                        ? `${selectedFiles.length}/5 Images`
                        : "Attach Images (Max 5)"}
                    </span>
                  </label>
                  <input
                    id="comment-images-input"
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={selectedFiles.length >= 5}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  className="submit-comment-btn"
                  disabled={submitting || !commentText.trim()}
                >
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span>{editingComment ? "Updating..." : "Posting..."}</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      <span>{editingComment ? "Update" : "Post Comment"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="login-prompt-banner">
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>Please log in to share a comment or upload images.</span>
            </div>
          )}

          <div className="comments-list-section">
            {loading ? (
              <div className="comments-loading-spinner">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" color="#3b82f6" />
                <p>Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="no-comments-view">
                <FontAwesomeIcon icon={faComment} className="empty-icon" />
                <p>No comments yet. Be the first to review this product!</p>
              </div>
            ) : (
              comments.map((item) => {
                const isOwner = user && user.id === item.user_id;
                const avatarSrc = item.profile_pic
                  ? `${import.meta.env.VITE_API_URL}/${item.profile_pic}`
                  : null;

                return (
                  <div key={item.id} className="comment-card">
                    <div className="comment-card-header">
                      <div className="comment-user-info">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={item.username}
                            className="user-avatar"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faUserCircle}
                            className="user-avatar-placeholder"
                          />
                        )}
                        <div>
                          <h4 className="comment-author-name">
                            {item.username || "User"}
                          </h4>
                          {item.created_at && (
                            <span className="comment-date">
                              {new Date(item.created_at).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Edit & Delete actions for owner */}
                      {isOwner && (
                        <div className="comment-actions">
                          <button
                            className="comment-action-btn edit"
                            title="Edit Comment"
                            onClick={() => handleEditClick(item)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="comment-action-btn delete"
                            title="Delete Comment"
                            onClick={() => setDeletingId(item.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="comment-text-content">{item.comment}</p>

                    {/* Comment Images */}
                    {item.c_images && item.c_images.length > 0 && (
                      <div className="comment-images-gallery">
                        {item.c_images.map((imgObj) => {
                          const fullImgUrl = `${import.meta.env.VITE_API_URL}/${
                            imgObj.image_url
                          }`;
                          return (
                            <img
                              key={imgObj.id}
                              src={fullImgUrl}
                              alt="Comment attachment"
                              className="comment-gallery-image"
                              onClick={() => setLightboxUrl(fullImgUrl)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      {deletingId && (
        <div className="delete-confirm-backdrop">
          <div className="delete-confirm-box">
            <h4>Delete Comment?</h4>
            <p>Are you sure you want to remove this comment? This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button
                className="cancel-delete-btn"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {lightboxUrl && (
        <div className="lightbox-backdrop" onClick={() => setLightboxUrl(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="lightbox-close"
              onClick={() => setLightboxUrl(null)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <img src={lightboxUrl} alt="Enlarged comment attachment" />
          </div>
        </div>
      )}
    </div>
  );
};
