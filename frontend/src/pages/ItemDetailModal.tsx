import React from "react";
import { Item } from "../types";

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
}

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Item Details</h2>
          <button onClick={onClose} className="btn-close">
            &times;
          </button>
        </div>

        <div className="form">
          <div className="detail-row">
            <div className="form-group">
              <label>ID</label>
              <div className="detail-value id-value">{item.id}</div>
            </div>
            <div className="form-group">
              <label>Name</label>
              <div className="detail-value name-value">{item.name}</div>
            </div>
          </div>

          <div className="form-group">
            <label>Price</label>
            <div className="detail-value price-value">
              {formatPrice(item.price)}
            </div>
          </div>

          {item.image_url && (
            <div className="form-group">
              <label>Image</label>
              <div className="detail-image-container">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="detail-image"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Description</label>
            <div className="detail-description">
              {item.description || "No description provided"}
            </div>
          </div>

          <div className="detail-row">
            <div className="form-group">
              <label>Created At</label>
              <div className="detail-value timestamp-value">
                {formatDate(item.created_at)}
              </div>
            </div>
            <div className="form-group">
              <label>Updated At</label>
              <div className="detail-value timestamp-value">
                {formatDate(item.updated_at)}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
