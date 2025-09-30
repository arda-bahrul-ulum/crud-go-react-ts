import React from 'react'
import { Item } from '../types'
import { deleteItem } from '../api'

interface ItemListProps {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: () => void
}

const ItemList: React.FC<ItemListProps> = ({ items, onEdit, onDelete }) => {
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id)
        onDelete()
      } catch (error) {
        console.error('Error deleting item:', error)
        alert('Failed to delete item')
      }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  return (
    <div className="item-list">
      <h2>Items</h2>
      {items.length === 0 ? (
        <p className="no-items">No items found. Add some items to get started!</p>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <div key={item.id} className="item-card">
              <div className="item-header">
                <h3>{item.name}</h3>
                <div className="item-actions">
                  <button 
                    onClick={() => onEdit(item)}
                    className="btn btn-sm btn-secondary"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="item-content">
                <p className="item-description">{item.description}</p>
                <p className="item-price">{formatPrice(item.price)}</p>
                <p className="item-date">
                  Created: {formatDate(item.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ItemList
