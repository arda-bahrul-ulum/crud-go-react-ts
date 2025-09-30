import React, { useState, useEffect, useRef } from "react";
import { Item, CreateItemRequest, UpdateItemRequest } from "../types";
import {
  createItem,
  updateItem,
  uploadImage,
  updateItemImage,
  deleteUploadedImage,
} from "../api";

interface ItemFormProps {
  item?: Item | null;
  onClose: () => void;
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url || "",
      });
      setPreviewImage(item.image_url || null);
    }
  }, [item]);

  // Cleanup uploaded image when component unmounts (form closed without saving)
  useEffect(() => {
    return () => {
      // Only cleanup if we have an uploaded image and we're not editing an existing item
      if (formData.image_url && !item) {
        deleteUploadedImage(formData.image_url).catch((error) => {
          console.error("Error cleaning up uploaded image:", error);
        });
      }
    };
  }, [formData.image_url, item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size too large. Maximum size is 5MB.");
      return;
    }

    setUploading(true);
    try {
      let response;

      // If editing existing item, use update image endpoint to replace old image
      if (item) {
        response = await updateItemImage(item.id, file);
        setFormData((prev) => ({
          ...prev,
          image_url: response.image_url,
        }));
        setPreviewImage(response.image_url);
      } else {
        // If creating new item, use regular upload endpoint
        response = await uploadImage(file);
        setFormData((prev) => ({
          ...prev,
          image_url: response.image_url,
        }));
        setPreviewImage(response.image_url);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    // If there's an uploaded image, delete it from server
    if (formData.image_url) {
      try {
        await deleteUploadedImage(formData.image_url);
      } catch (error) {
        console.error("Error deleting uploaded image:", error);
        // Continue with removal even if server deletion fails
      }
    }

    setFormData((prev) => ({
      ...prev,
      image_url: "",
    }));
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = async () => {
    // Cleanup uploaded image if form is closed without saving (only for new items)
    if (formData.image_url && !item) {
      try {
        await deleteUploadedImage(formData.image_url);
      } catch (error) {
        console.error("Error cleaning up uploaded image:", error);
      }
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (item) {
        const updateData: UpdateItemRequest = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          image_url: formData.image_url,
        };
        await updateItem(item.id, updateData);
      } else {
        const createData: CreateItemRequest = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          image_url: formData.image_url,
        };
        await createItem(createData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{item ? "Edit Item" : "Add New Item"}</h2>
          <button onClick={handleClose} className="btn-close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image</label>
            <div className="image-upload-container">
              <input
                ref={fileInputRef}
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading || uploading}
                style={{ display: "none" }}
              />
              <div className="image-upload-area">
                {previewImage ? (
                  <div className="image-preview">
                    <img src={previewImage} alt="Preview" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="remove-image-btn"
                      disabled={loading || uploading}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className="upload-placeholder"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="upload-icon">📷</div>
                    <p>Click to upload image</p>
                    <small>JPEG, PNG, GIF, WebP (max 5MB)</small>
                  </div>
                )}
              </div>
              {uploading && (
                <div className="upload-progress">
                  <p>Uploading...</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : item ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
