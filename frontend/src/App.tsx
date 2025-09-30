import React, { useState, useEffect } from 'react'
import ItemList from './pages/ItemList'
import ItemForm from './pages/ItemForm'
import { Item } from './types'
import { getItems } from './api'

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    try {
      const data = await getItems()
      setItems(data)
    } catch (error) {
      console.error('Error loading items:', error)
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingItem(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
    loadItems()
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Simple CRUD App</h1>
        <button onClick={handleAdd} className="btn btn-primary">
          Add New Item
        </button>
      </header>

      <main className="app-main">
        <ItemList 
          items={items} 
          onEdit={handleEdit}
          onDelete={loadItems}
        />
      </main>

      {showForm && (
        <ItemForm 
          item={editingItem}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}

export default App
