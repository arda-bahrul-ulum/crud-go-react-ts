import React, { useState, useEffect } from "react";
import { Item, SearchItemResponse } from "../types";
import { deleteItem, searchItems, getItems } from "../api";

interface ItemListProps {
  onEdit: (item: Item) => void;
  onDelete: () => void;
  refreshTrigger: number;
}

const ItemList: React.FC<ItemListProps> = ({
  onEdit,
  onDelete,
  refreshTrigger,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItemResponse | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);

  // Load all items on component mount and when refreshTrigger changes
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await getItems();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
        alert("Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [refreshTrigger]);

  // Search function with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // If there's a search query, perform search with filters
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      }
      // If there's no search query but price filters are set, search with empty query
      else if (minPrice.trim() || maxPrice.trim()) {
        performSearch("");
      }
      // If no search query and no price filters, clear search results
      else {
        setSearchResults(null);
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, minPrice, maxPrice]);

  const performSearch = async (query: string) => {
    try {
      setIsSearching(true);

      // Prepare search parameters
      const searchParams: any = { q: query, limit: 20, offset: 0 };

      // Add price filters if provided
      if (minPrice.trim()) {
        searchParams.min_price = parseFloat(minPrice);
      }
      if (maxPrice.trim()) {
        searchParams.max_price = parseFloat(maxPrice);
      }

      const results = await searchItems(searchParams);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching items:", error);
      alert("Failed to search items");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem(id);
        onDelete(); // This will trigger refreshTrigger in parent
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item");
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  // Determine which items to display
  const displayItems = searchResults ? searchResults.items : items;
  const isSearchMode =
    searchQuery.trim() !== "" ||
    minPrice.trim() !== "" ||
    maxPrice.trim() !== "";

  return (
    <div className="item-list">
      <div className="item-list-header">
        <h2>Items</h2>

        {/* Search Input */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search items by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {isSearching && <div className="search-loading">Searching...</div>}
        </div>

        {/* Price Filter */}
        <div className="price-filter-container">
          <div className="price-filter-row">
            <div className="price-input-group">
              <label htmlFor="min-price">Min Price:</label>
              <input
                id="min-price"
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="price-input"
                min="0"
                step="1000"
              />
            </div>
            <div className="price-separator">-</div>
            <div className="price-input-group">
              <label htmlFor="max-price">Max Price:</label>
              <input
                id="max-price"
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="price-input"
                min="0"
                step="1000"
              />
            </div>
            <button
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
              }}
              className="btn btn-sm btn-secondary clear-filters"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {isSearchMode && searchResults && (
          <div className="search-info">
            Found {searchResults.total} result
            {searchResults.total !== 1 ? "s" : ""}
            {searchQuery.trim() && ` for "${searchQuery}"`}
            {(minPrice || maxPrice) && (
              <span className="price-filter-info">
                {" "}
                with price range{" "}
                {minPrice && `≥ ${formatPrice(parseFloat(minPrice))}`}
                {minPrice && maxPrice && " and "}
                {maxPrice && `≤ ${formatPrice(parseFloat(maxPrice))}`}
              </span>
            )}
            {searchResults.has_more && (
              <span className="search-more">
                {" "}
                (showing first {searchResults.items.length})
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading items...</div>
      ) : displayItems.length === 0 ? (
        <p className="no-items">
          {isSearchMode
            ? `No items found${
                searchQuery.trim() ? ` for "${searchQuery}"` : ""
              }${
                minPrice || maxPrice
                  ? ` with price range ${
                      minPrice ? `≥ ${formatPrice(parseFloat(minPrice))}` : ""
                    }${minPrice && maxPrice ? " and " : ""}${
                      maxPrice ? `≤ ${formatPrice(parseFloat(maxPrice))}` : ""
                    }`
                  : ""
              }. Try adjusting your search criteria.`
            : "No items found. Add some items to get started!"}
        </p>
      ) : (
        <div className="items-grid">
          {displayItems.map((item) => (
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
  );
};

export default ItemList;
