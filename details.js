document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  const type = urlParams.get('type'); // 'lost' or 'found'

  if (!id || !type) {
    window.location.href = 'browse.html';
    return;
  }

  const container = document.getElementById('details-content');
  const loading = document.getElementById('loading');

  try {
    const item = await api.getItemDetails(id, type);
    renderDetails(item);

    loading.style.display = 'none';
    container.style.display = 'block';

    // Load Matches
    loadMatches(item);

  } catch (error) {
    console.error(error);
    showToast('Failed to load item details', 'error');
    loading.innerHTML = 'Item not found';
  }

  // Delete Handler
  document.getElementById('delete-btn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const endpoint = type === 'lost' ? 'lost-items' : 'found-items';
        await fetch(`http://localhost:3000/api/${endpoint}/${id}`, { method: 'DELETE' });
        showToast('Item deleted successfully', 'success');
        setTimeout(() => {
          window.location.href = 'browse.html';
        }, 1000);
      } catch (error) {
        console.error(error);
        showToast('Failed to delete item', 'error');
      }
    }
  });
});

function renderDetails(item) {
  document.title = `${item.title} - Item Details`;

  const imageUrl = item.imageUrl ? `http://localhost:3000${item.imageUrl}` : '';
  const imageContainer = document.getElementById('item-image');

  if (imageUrl) {
    imageContainer.innerHTML = `<img src="${imageUrl}" alt="${item.title}">`;
  } else {
    imageContainer.innerHTML = `<i class="fas fa-image" style="font-size: 5rem; color: #ccc;"></i>`;
  }

  const badge = document.getElementById('item-badge');
  badge.textContent = item.type;
  badge.className = `item-badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`;

  document.getElementById('item-title').textContent = item.title;
  document.getElementById('item-description').textContent = item.description;
  document.getElementById('item-category').textContent = item.category;
  document.getElementById('item-location').textContent = item.location;
  document.getElementById('item-date').textContent = window.formatDate(item.createdAt); // Or date lost/found if preferred

  document.getElementById('contact-name').textContent = item.contactName || item.contact || 'N/A';
  document.getElementById('contact-email').textContent = item.contactEmail || 'N/A';
  document.getElementById('contact-phone').textContent = item.contactPhone || 'N/A';
}

async function loadMatches(currentItem) {
  const matchesGrid = document.getElementById('matches-grid');

  try {
    // Search for items of the OPPOSITE type
    // e.g., if this is Lost, we look for Found items that match
    const targetType = currentItem.type === 'lost' ? 'found' : 'lost';

    // Simple matching strategies:
    // 1. Same Category
    // 2. Title contains keywords (naïve approach)

    // We'll fetch all items of target type first (optimization: backend should support better filtering)
    // But for MVP, we accept retrieving list and filtering client side or using the search API.

    // Let's use the search API we built:
    // Filter by category first as a hard constraint for 'potential match'
    const matches = await api.searchItems({
      type: targetType,
      category: currentItem.category
    });

    // Further filter by title similarity (simple includes)
    // Split title into words and check if any word matches
    const titleWords = currentItem.title.toLowerCase().split(' ').filter(w => w.length > 3);

    const scoredMatches = matches.map(match => {
      let score = 0;
      // Category match is already guaranteed by API call
      score += 5;

      // Location match
      if (match.location.toLowerCase().includes(currentItem.location.toLowerCase()) ||
        currentItem.location.toLowerCase().includes(match.location.toLowerCase())) {
        score += 10;
      }

      // Title keyword match
      const matchTitle = match.title.toLowerCase();
      const matchDesc = match.description.toLowerCase();

      titleWords.forEach(word => {
        if (matchTitle.includes(word)) score += 5;
        if (matchDesc.includes(word)) score += 2;
      });

      return { item: match, score };
    });

    // Sort by score
    scoredMatches.sort((a, b) => b.score - a.score);

    // Take top 4 matches with score > 5
    const topMatches = scoredMatches.filter(m => m.score > 5).slice(0, 4);

    matchesGrid.innerHTML = '';
    if (topMatches.length === 0) {
      matchesGrid.innerHTML = '<p style="color: #666;">No potential matches found yet. Check back later!</p>';
      return;
    }

    topMatches.forEach(({ item }) => {
      const card = document.createElement('a');
      card.href = `item-details.html?id=${item.id}&type=${item.type}`;
      card.className = 'item-card';
      card.style.textDecoration = 'none';
      card.style.color = 'inherit';

      const imageUrl = item.imageUrl ? `http://localhost:3000${item.imageUrl}` : '../frontend/images/placeholder.png'; // Fix placeholder path
      // Note: path relative to pages/item-details.html -> ../frontend... wait if images is in frontend/images, path from pages/ is ../images/
      // My structure: frontend/pages/item-details.html. Images at frontend/images.
      // Correct relative path: ../images/

      let displayImage = '';
      if (item.imageUrl) {
        displayImage = `<img src="${imageUrl}" alt="${item.title}" class="item-image">`;
      } else {
        displayImage = `<div class="item-image" style="display: flex; align-items: center; justify-content: center; background: #ddd; color: #aaa; font-size: 3rem;"><i class="fas fa-search"></i></div>`;
      }

      card.innerHTML = `
                ${displayImage}
                <div class="item-content">
                    <span class="item-badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}">Potential Match</span>
                    <h3 class="item-title">${item.title}</h3>
                    <div class="item-meta">
                        <span><i class="fas fa-map-marker-alt"></i> ${item.location}</span>
                    </div>
                </div>
            `;
      matchesGrid.appendChild(card);
    });

  } catch (error) {
    console.error(error);
    matchesGrid.innerHTML = '<p>Could not load matches.</p>';
  }
}
