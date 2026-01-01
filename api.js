const API_URL = 'http://localhost:3000/api';

const api = {
  // Lost Items
  async getLostItems() {
    try {
      const response = await fetch(`${API_URL}/lost-items`);
      if (!response.ok) throw new Error('Failed to fetch lost items');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async reportLostItem(formData) {
    try {
      const response = await fetch(`${API_URL}/lost-items`, {
        method: 'POST',
        body: formData // multer expects FormData
      });
      if (!response.ok) throw new Error('Failed to report lost item');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Found Items
  async getFoundItems() {
    try {
      const response = await fetch(`${API_URL}/found-items`);
      if (!response.ok) throw new Error('Failed to fetch found items');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async reportFoundItem(formData) {
    try {
      const response = await fetch(`${API_URL}/found-items`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to report found item');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Get Item Details
  async getItemDetails(id, type) {
    try {
      const endpoint = type === 'lost' ? 'lost-items' : 'found-items';
      const response = await fetch(`${API_URL}/${endpoint}/${id}`);
      if (!response.ok) throw new Error('Item not found');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Search
  async searchItems(searchParams) {
    try {
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await fetch(`${API_URL}/search?${queryString}`);
      if (!response.ok) throw new Error('Search failed');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

window.api = api;
