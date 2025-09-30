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
      <div className="modal detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Item Details</h2>
          <button onClick={onClose} className="modal-close">
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="detail-section">
            <h3 className="detail-title">Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>ID</label>
                <span className="detail-value">{item.id}</span>
              </div>
              <div className="detail-item">
                <label>Name</label>
                <span className="detail-value">{item.name}</span>
              </div>
              <div className="detail-item">
                <label>Price</label>
                <span className="detail-value price-value">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="detail-title">Description</h3>
            <div className="detail-description">
              {item.description || "No description provided"}
            </div>
          </div>

          <div className="detail-section">
            <h3 className="detail-title">Timestamps</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Created At</label>
                <span className="detail-value">
                  {formatDate(item.created_at)}
                </span>
              </div>
              <div className="detail-item">
                <label>Updated At</label>
                <span className="detail-value">
                  {formatDate(item.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
