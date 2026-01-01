document.addEventListener('DOMContentLoaded', () => {
  const reportForm = document.getElementById('report-form');
  const imageInput = document.getElementById('image');
  const imagePreview = document.getElementById('image-preview');

  if (imageInput) {
    imageInput.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        }
        reader.readAsDataURL(file);
      } else {
        imagePreview.innerHTML = '<span>Image Preview</span>';
      }
    });
  }

  if (reportForm) {
    reportForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic Validation
      const requiredFields = reportForm.querySelectorAll('[required]');
      let isValid = true;
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.style.borderColor = 'var(--danger-color)';
        } else {
          field.style.borderColor = 'var(--border-color)';
        }
      });

      if (!isValid) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      const submitBtn = reportForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

      try {
        const formData = new FormData(reportForm);
        const type = reportForm.dataset.type; // 'lost' or 'found'

        let result;
        if (type === 'lost') {
          result = await api.reportLostItem(formData);
        } else {
          result = await api.reportFoundItem(formData);
        }

        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} item reported successfully!`, 'success');
        reportForm.reset();
        if (imagePreview) imagePreview.innerHTML = '<span>Image Preview</span>';

        // Redirect after short delay
        setTimeout(() => {
          window.location.href = 'browse.html?type=' + type;
        }, 2000);

      } catch (error) {
        console.error(error);
        showToast('Failed to submit report. Please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }
});
