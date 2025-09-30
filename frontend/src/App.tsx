import React, { useState } from "react";
import ItemList from "./pages/ItemList";
import ItemForm from "./pages/ItemForm";
import { Item } from "./types";

function App() {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    // Trigger refresh after form closes
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDelete = () => {
    // Trigger refresh after delete
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Go React TypeScript Simple Apps</h1>
        <button onClick={handleAdd} className="btn btn-primary">
          Add New Item
        </button>
      </header>

      <main className="app-main">
        <ItemList
          onEdit={handleEdit}
          onDelete={handleDelete}
          refreshTrigger={refreshTrigger}
        />
      </main>

      {showForm && <ItemForm item={editingItem} onClose={handleFormClose} />}
    </div>
  );
}

export default App;
