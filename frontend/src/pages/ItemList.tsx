import React, { useState, useEffect } from "react";
import { Item, SearchItemResponse, PaginatedItemResponse } from "../types";
import { deleteItem, searchItems, getItems } from "../api";
import ItemDetailModal from "./ItemDetailModal";
import Swal from "sweetalert2";

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
  const [paginationData, setPaginationData] =
    useState<PaginatedItemResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchResults, setSearchResults] = useState<SearchItemResponse | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Load all items on component mount and when refreshTrigger changes
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await getItems(currentPage, 6);
        setItems(data.items);
        setPaginationData(data);
      } catch (error) {
        console.error("Error fetching items:", error);
        Swal.fire({
          icon: "error",
          title: "Load Failed",
          text: "Failed to fetch items. Please refresh the page.",
          confirmButtonColor: "#dc3545",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [refreshTrigger, currentPage]);

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
      setCurrentPage(1); // Reset to first page when searching

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
      Swal.fire({
        icon: "error",
        title: "Search Failed",
        text: "Failed to search items. Please try again.",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewDetail = (item: Item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteItem(id);

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Item has been deleted successfully.",
          confirmButtonColor: "#28a745",
          timer: 2000,
          timerProgressBar: true,
        });

        onDelete(); // This will trigger refreshTrigger in parent
      } catch (error) {
        console.error("Error deleting item:", error);
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: "Failed to delete item. Please try again.",
          confirmButtonColor: "#dc3545",
        });
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
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search items by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="clear-search-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
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
              Clear Price Filters
            </button>
            <button
              onClick={() => {
                setSearchQuery("");
                setMinPrice("");
                setMaxPrice("");
              }}
              className="btn btn-sm btn-danger clear-all"
            >
              Clear All
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
                    onClick={() => handleViewDetail(item)}
                    className="btn btn-sm btn-info"
                  >
                    View Detail
                  </button>
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
                {item.image_url && (
                  <div className="item-image-container">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="item-image"
                    />
                  </div>
                )}
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

      {/* Pagination - Only show when not in search mode and has pagination data */}
      {!isSearchMode && paginationData && paginationData.total_pages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {(currentPage - 1) * 6 + 1} to{" "}
            {Math.min(currentPage * 6, paginationData.total)} of{" "}
            {paginationData.total} items
          </div>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn pagination-prev"
            >
              Previous
            </button>

            <div className="pagination-numbers">
              {Array.from(
                { length: paginationData.total_pages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`pagination-number ${
                    currentPage === page ? "active" : ""
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === paginationData.total_pages}
              className="pagination-btn pagination-next"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {showDetailModal && (
        <ItemDetailModal item={selectedItem} onClose={handleCloseDetail} />
      )}
    </div>
  );
};

export default ItemList;
