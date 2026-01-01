document.addEventListener('DOMContentLoaded', async () => {
  const searchForm = document.getElementById('search-form');
  const itemsContainer = document.getElementById('items-container');
  const urlParams = new URLSearchParams(window.location.search);

  // Populate form from URL params
  const query = urlParams.get('query') || '';
  const type = urlParams.get('type') || '';
  const category = urlParams.get('category') || '';
  const location = urlParams.get('location') || '';

  if (document.getElementById('query')) document.getElementById('query').value = query;
  if (document.getElementById('type')) document.getElementById('type').value = type;
  if (document.getElementById('category')) document.getElementById('category').value = category;
  if (document.getElementById('location')) document.getElementById('location').value = location;

  // Load items based on params
  loadItems({ query, type, category, location });

  // Handle form submission (update filters)
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(searchForm);
      const params = new URLSearchParams();
      for (const pair of formData.entries()) {
        if (pair[1]) params.append(pair[0], pair[1]);
      }
      window.location.search = params.toString();
    });
  }
});

async function loadItems(params) {
  const container = document.getElementById('items-container');
  container.innerHTML = '<div class="loader"></div>';

  try {
    const items = await api.searchItems(params);

    container.innerHTML = '';
    if (items.length === 0) {
      container.innerHTML = '<div class="no-results">No items found matching your criteria.</div>';
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'item-card animate-on-scroll';
      card.style.transitionDelay = `${index * 50}ms`;

      const imageUrl = item.imageUrl ? `http://localhost:3000${item.imageUrl}` : '../frontend/images/placeholder.png';
      let imageHTML = '';
      if (item.imageUrl) {
        imageHTML = `<img src="${imageUrl}" alt="${item.title}" class="item-image">`;
      } else {
        imageHTML = `<div class="item-image" style="display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #e2e8f0, #cbd5e1); color: #94a3b8; font-size: 3rem;"><i class="fas fa-camera"></i></div>`;
      }

      card.innerHTML = `
                <a href="item-details.html?id=${item.id}&type=${item.type}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                    <span class="item-badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}">${item.type}</span>
                    <div class="item-image-wrapper">
                        ${imageHTML}
                        <div class="item-overlay"></div>
                    </div>
                    <div class="item-content">
                        <h3 class="item-title">${item.title}</h3>
                        <p class="item-description" style="color: var(--text-muted); font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 10px;">${item.description}</p>
                        <div class="item-meta" style="margin-top: auto;">
                            <span><i class="fas fa-tag"></i> ${item.category}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${item.location}</span>
                            <span><i class="far fa-calendar-alt"></i> ${window.formatDate(item.createdAt)}</span>
                        </div>
                    </div>
                    <div class="btn-floating"><i class="fas fa-arrow-right"></i></div>
                </a>
            `;
      container.appendChild(card);
      // Trigger animation
      setTimeout(() => card.classList.add('visible'), 50 + (index * 50));
    });

  } catch (error) {
    console.error(error);
    container.innerHTML = '<div class="error-message">Failed to load items. Please try again.</div>';
  }
}
