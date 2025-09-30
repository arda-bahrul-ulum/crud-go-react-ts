import React, { useState, useEffect } from 'react'
import { Item, CreateItemRequest, UpdateItemRequest } from '../types'
import { createItem, updateItem } from '../api'

interface ItemFormProps {
  item?: Item | null
  onClose: () => void
}

const ItemForm: React.FC<ItemFormProps> = ({ item, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
      })
    }
  }, [item])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (item) {
        const updateData: UpdateItemRequest = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
        }
        await updateItem(item.id, updateData)
      } else {
        const createData: CreateItemRequest = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
        }
        await createItem(createData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Failed to save item')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{item ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="btn-close">&times;</button>
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

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose}
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
              {loading ? 'Saving...' : (item ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemForm
