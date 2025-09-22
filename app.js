

function createSlider(slider, delay = 5000) {
  const slides = slider.querySelector('.slides');
  const slideItems = slider.querySelectorAll('.slide');
  const slideCount = slideItems.length;

  // Clone first & last slides
  const firstClone = slideItems[0].cloneNode(true);
  const lastClone = slideItems[slideCount - 1].cloneNode(true);
  slides.appendChild(firstClone);
  slides.insertBefore(lastClone, slideItems[0]);

  const allSlides = slider.querySelectorAll('.slide');
  let index = 1;
  let intervalId, timeoutId;
  let isMoving = false;

  // set initial position
  slides.style.transform = `translateX(-${index * 100}%)`;

  const goToSlide = (i, animate = true) => {
    if (isMoving && animate) return; // prevent abuse only if animating
    isMoving = true;

    slides.style.transition = animate ? "transform 0.6s ease" : "none";
    slides.style.transform = `translateX(-${i * 100}%)`;
    index = i;
  };

  const nextSlide = () => goToSlide(index + 1);
  const prevSlide = () => goToSlide(index - 1);

  // FIX: prevent blank area by jumping instantly when on a clone
  slides.addEventListener("transitionend", () => {
    if (allSlides[index].isEqualNode(firstClone)) {
      slides.style.transition = "none";
      index = 1;
      slides.style.transform = `translateX(-${index * 100}%)`;
    }
    if (allSlides[index].isEqualNode(lastClone)) {
      slides.style.transition = "none";
      index = slideCount;
      slides.style.transform = `translateX(-${index * 100}%)`;
    }
    // unlock after all fixes
    setTimeout(() => (isMoving = false), 20); 
  });

  const startAutoSlide = () => {
    intervalId = setInterval(nextSlide, delay);
  };

  const pauseAutoSlide = () => {
    clearInterval(intervalId);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(startAutoSlide, 6000);
  };

  // Controls
  slider.querySelector('.next').addEventListener('click', () => {
    pauseAutoSlide();
    nextSlide();
  });
  slider.querySelector('.prev').addEventListener('click', () => {
    pauseAutoSlide();
    prevSlide();
  });
  slider.addEventListener('click', pauseAutoSlide);
  slider.addEventListener('touchstart', pauseAutoSlide);

  startAutoSlide();
}

// Apply to all sliders
document.querySelectorAll('.slider').forEach((slider, i) => {
  const intervals = [5000, 8000];
  createSlider(slider, intervals[i % intervals.length]);
});







  
// Mobile nav toggle
const mobileNavLinks = document.querySelectorAll(".bottom-nav a");
mobileNavLinks.forEach(link => {
  link.addEventListener("click", e => {
    mobileNavLinks.forEach(l => l.classList.remove("active"));
    e.currentTarget.classList.add("active");
  });
});


// Comments toggle + Share Modal
document.addEventListener("click", e => {
   if (e.target.closest(".comment-btn")) {
    document.getElementById("CommentModal").classList.remove("hidden");
  }
  if (e.target.closest("#commentClose") || e.target.id === "CommentModal") {
    document.getElementById("CommentModal").classList.add("hidden");
  }

  if (e.target.closest(".share-btn")) {
    document.getElementById("shareModal").classList.remove("hidden");
  }
  if (e.target.closest("#shareClose") || e.target.id === "shareModal") {
    document.getElementById("shareModal").classList.add("hidden");
  }

   if (e.target.closest(".upload-btn")) {
    document.getElementById("uploadModal").classList.remove("hidden");
  }
  if (e.target.closest("#uploadClose") || e.target.id === "uploadModal") {
    document.getElementById("uploadModal").classList.add("hidden");
  }
   if (e.target.closest(".cart-btn")) {
    document.getElementById("cartModal").classList.remove("hidden");
  }
  if (e.target.closest("#cartClose") || e.target.id === "cartModal") {
    document.getElementById("cartModal").classList.add("hidden");
  }
});

// JS helper: auto-create seamless clone
document.querySelectorAll('.marquee').forEach(el => {
  const text = el.textContent.trim();
  el.textContent = '';
  const span1 = document.createElement('span');
  const span2 = document.createElement('span');
  span1.textContent = text;
  span2.textContent = text;
  el.appendChild(span1);
  el.appendChild(span2);
});


document.addEventListener('DOMContentLoaded', () => {
  const ellipsisElements = document.querySelectorAll('.ellipsis-text');

  function applyTruncation() {
    ellipsisElements.forEach(el => {
      const fullText = el.getAttribute('data-fulltext') || el.textContent.trim();

      // Store original full text only once
      el.setAttribute('data-fulltext', fullText);

      // Split into words
      const words = fullText.split(/\s+/);

      // If more than 10 words → truncate + add ellipsis
      if (words.length > 10) {
        el.textContent = words.slice(0, 10).join(' ') + '...';
        el.classList.add('truncated');
        el.style.cursor = "pointer";
      } else {
        // If 10 words or fewer → show full text
        el.textContent = fullText;
        el.classList.remove('truncated');
        el.style.cursor = "default";
      }

      // Remove old event listener before adding a new one
      el.removeEventListener('click', handleEllipsisClick);

      // Attach tooltip event only if truncated
      if (words.length > 10) {
        el.addEventListener('click', handleEllipsisClick);
      }
    });
  }

  function handleEllipsisClick(e) {
    const fullText = e.target.getAttribute('data-fulltext');
    if (!fullText) return;

    // Remove any existing tooltip
    const existingTooltip = document.querySelector('.custom-tooltip');
    if (existingTooltip) existingTooltip.remove();

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = fullText;
    document.body.appendChild(tooltip);

    // Position tooltip below clicked element
    const rect = e.target.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom + window.scrollY + 8;

    // Prevent tooltip from going off-screen
    const tooltipWidth = tooltip.offsetWidth;
    const screenWidth = window.innerWidth;
    if (left + tooltipWidth > screenWidth - 10) {
      left = screenWidth - tooltipWidth - 10;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';

    // Show tooltip with animation
    setTimeout(() => tooltip.classList.add('show'), 10);

    // Hide tooltip after 3s
    setTimeout(() => {
      tooltip.classList.remove('show');
      setTimeout(() => tooltip.remove(), 200);
    }, 3000);

    // Close tooltip if clicked outside
    document.addEventListener('click', function removeTooltip(ev) {
      if (!tooltip.contains(ev.target) && ev.target !== e.target) {
        tooltip.remove();
        document.removeEventListener('click', removeTooltip);
      }
    });
  }

  // Apply truncation initially + on window resize
  applyTruncation();
  window.addEventListener('resize', applyTruncation);
});

    // Utilities
    function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
    function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

    // Safe helpers for dataset read with fallbacks
    function getMeta(el, key) { return el && (el.dataset && el.dataset[key]) ? el.dataset[key] : el.getAttribute('data-' + key) || '' }


    // Cart state
    var cart = [];
    function renderCart() { var container = qs('.cart-items'); if (!container) return; container.innerHTML = ''; var total = 0; cart.forEach(function (it, i) { total += Number(it.price || 0); var el = document.createElement('div'); el.className = 'cart-item'; el.innerHTML = '<div><strong>' + it.name + '</strong><div class="muted">$' + it.price + '</div></div><div><button class="btn remove" data-i="' + i + '">Remove</button></div>'; container.appendChild(el); }); qs('#cart-total') && (qs('#cart-total').textContent = '$' + total); qs('#cart-count') && (qs('#cart-count').textContent = cart.length); }

    // Add to cart handler supporting both .product and .post-card
    function handleAddToCart(e) { var b = e.currentTarget; var card = b.closest('.product') || b.closest('.post-card-2'); if (!card) return; var name = getMeta(card, 'name') || card.querySelector('.post-header-info strong')?.textContent || 'Item'; var price = getMeta(card, 'price') || '0'; cart.push({ name: name, price: price }); renderCart(); qs('#cartPanel') && qs('#cartPanel').classList.add('open'); }

    qsa('.add-to-cart').forEach(function (b) { b.addEventListener('click', handleAddToCart); });
    qs('#cart-toggle') && qs('#cart-toggle').addEventListener('click', function () { qs('#cartPanel') && qs('#cartPanel').classList.toggle('open'); });
    qs('#closeCart') && qs('#closeCart').addEventListener('click', function () { qs('#cartPanel') && qs('#cartPanel').classList.remove('open'); });
    qs('.cart-items') && qs('.cart-items').addEventListener('click', function (e) { var r = e.target.closest('.remove'); if (r) { var i = Number(r.getAttribute('data-i')); if (!isNaN(i)) cart.splice(i, 1); renderCart(); } });

    // Quick view (support older .product markup too)
    qsa('.quick-view').forEach(function (btn) { btn.addEventListener('click', function () { var card = btn.closest('.product') || btn.closest('.post-card-2'); if (!card) return; var img = getMeta(card, 'img') || card.querySelector('.product-img img')?.src || ''; var name = getMeta(card, 'name') || card.querySelector('.post-header-info strong')?.textContent || ''; var desc = getMeta(card, 'desc') || card.querySelector('.post-body')?.textContent || ''; var price = getMeta(card, 'price') || ''; qs('#qv-img').src = img; qs('#qv-name').textContent = name; qs('#qv-desc').textContent = desc; qs('#qv-price').textContent = price ? ('$' + price) : ''; qs('#modalBackdrop').classList.add('show'); qs('#quickView').classList.add('show'); }); });
    qsa('.modal-close').forEach(function (b) { b.addEventListener('click', function () { qs('#modalBackdrop').classList.remove('show'); qs('#quickView').classList.remove('show'); qs('#checkoutModal').classList.remove('show'); }); });

    // Open checkout modal from any .checkout-btn
    qsa('.checkout-btn').forEach(function(b){ b.addEventListener('click', function(){ qs('#modalBackdrop').classList.add('show'); qs('#checkoutModal').classList.add('show'); }); });

    // clicking backdrop hides modals
    qs('#modalBackdrop') && qs('#modalBackdrop').addEventListener('click', function(){ qs('#modalBackdrop').classList.remove('show'); qs('#quickView').classList.remove('show'); qs('#checkoutModal').classList.remove('show'); });

    // Bookmark toggle
    qsa('.bookmark-btn, .wishlist').forEach(function (b) { b.addEventListener('click', function () { b.classList.toggle('bookmarked'); var icon = b.querySelector('i'); if (icon) { if (b.classList.contains('bookmarked')) icon.className = 'ri-bookmark-fill'; else icon.className = 'ri-bookmark-line'; } }); });

    // Likes
    qsa('.like-btun').forEach(function (b) { b.addEventListener('click', function () { var cnt = b.querySelector('.count'); var n = Number(cnt.textContent || 0); if (b.classList.toggle('liked')) { n++; b.innerHTML = '<i class="ri-heart-fill"></i> <span class="count">' + n + '</span>'; } else { n = Math.max(0, n - 1); b.innerHTML = '<i class="ri-heart-line"></i> <span class="count">' + n + '</span>'; } }); });

    // Share - construct a product fragment URL
    qsa('.share-btn').forEach(function (b) { b.addEventListener('click', function () { var card = b.closest('.product') || b.closest('.post-card-2'); if (!card) return; var name = getMeta(card, 'name') || card.querySelector('.post-header-info strong')?.textContent || 'product'; var slug = encodeURIComponent(name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')); var url = location.href.split('#')[0] + '#product-' + slug; if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { alert('Link copied to clipboard'); }).catch(function () { prompt('Copy this link', url); }); } else { prompt('Copy this link', url); } }); });

    // Inline comment flow
    var currentCommentTarget = null;
    function openCommentsFor(card) { if (!card) return; currentCommentTarget = card; commentList.innerHTML = ''; var raw = card.getAttribute('data-comments') || ''; var items = raw ? raw.split('\n').filter(Boolean) : []; items.forEach(function (t) { var d = document.createElement('div'); d.className = 'comment-item'; d.textContent = t; commentList.appendChild(d); }); commentPanel.classList.add('open'); commentInput.value = ''; commentInput.focus(); }

    qsa('.comment-btn').forEach(function (b) { b.addEventListener('click', function () { var card = b.closest('.product') || b.closest('.post-card-2'); openCommentsFor(card); }); });

    // close comments
    commentPanel.querySelector('.close-comments').addEventListener('click', function () { commentPanel.classList.remove('open'); currentCommentTarget = null; });

    // submit comment
    commentPanel.querySelector('.comment-form button').addEventListener('click', function () {
        var v = commentInput.value && commentInput.value.trim(); if (!v || !currentCommentTarget) return; // append to product data-comments
        var cs = currentCommentTarget.getAttribute('data-comments') || ''; cs = cs + '\n' + v; currentCommentTarget.setAttribute('data-comments', cs); // update count in UI if present
        var btn = currentCommentTarget.querySelector('.comment-btn .count'); if (btn) { btn.textContent = Number(btn.textContent || 0) + 1; }
        var d = document.createElement('div'); d.className = 'comment-item'; d.textContent = v; commentList.appendChild(d); commentInput.value = ''; commentInput.focus();
    });

    // Filters: simple show/hide by data-category, for both .product and .post-card
    qsa('.filter-btn').forEach(function (b) { b.addEventListener('click', function () { qsa('.filter-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); var f = b.getAttribute('data-filter'); qsa('.product, .post-card-2').forEach(function (p) { if (!f || f === 'all') p.style.display = ''; else p.style.display = (p.getAttribute('data-category') === f) ? '' : 'none'; }); }); });

    // Search (wire to #search or #searchAll if present)
    var searchEl = qs('#search') || qs('#searchAll'); if (searchEl) { searchEl.addEventListener('input', function (e) { var v = (e.target.value || '').toLowerCase(); qsa('.product, .post-card-2').forEach(function (p) { var name = (p.getAttribute('data-name') || p.querySelector('.post-header-info strong')?.textContent || '').toLowerCase(); p.style.display = name.includes(v) ? '' : 'none'; }); }); }

    // Sort - if product-grid exists
    var sortEl = qs('#sort'); if (sortEl) {
        sortEl.addEventListener('change', function (e) {
            var v = e.target.value; var container = qs('.product-grid'); var items = qsa('.product'); if (!container) return; if (v === 'price-asc' || v === 'price-desc') { items.sort(function (a, b) { return (v === 'price-asc' ? 1 : -1) * (Number(a.getAttribute('data-price') || 0) - Number(b.getAttribute('data-price') || 0)); }); }
            if (v === 'name') { items.sort(function (a, b) { return (a.getAttribute('data-name') || '').localeCompare(b.getAttribute('data-name') || ''); }); }
            items.forEach(function (it) { container.appendChild(it); });
        });
    }

    // Ensure filters include added categories (in case UI needs them)
    var filtersContainer = qs('.filters'); if (filtersContainer) { ['instruments', 'posters', 'apparel', 'merch', 'vinyl', 'gear'].forEach(function (cat) { if (!filtersContainer.querySelector('[data-filter="' + cat + '"]')) { var b = document.createElement('button'); b.className = 'filter-btn'; b.setAttribute('data-filter', cat); b.textContent = cat.charAt(0).toUpperCase() + cat.slice(1); filtersContainer.appendChild(b); b.addEventListener('click', function () { qsa('.filter-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); qsa('.product, .post-card-2').forEach(function (p) { p.style.display = (p.getAttribute('data-category') === cat) ? '' : 'none'; }); }); } }); }

    // Inject centered overlay buttons (play + plus) into each .post-media
    qsa('.post-media').forEach(function(pm){
        if(pm.querySelector('.media-overlay')) return;
        var overlay = document.createElement('div'); overlay.className = 'media-overlay';
        var play = document.createElement('button'); play.className = 'media-btn play-btn'; play.setAttribute('title','Play'); play.innerHTML = '<i class="ri-play-line"></i>';
        var plus = document.createElement('button'); plus.className = 'media-btn plus-btn'; plus.setAttribute('title','Add/Connect'); plus.innerHTML = '<i class="ri-add-line"></i>';
        overlay.appendChild(play); overlay.appendChild(plus);
        pm.style.position = pm.style.position || 'relative';
        pm.appendChild(overlay);

        // simple visual toggle for play (no audio)
        play.addEventListener('click', function(e){ e.stopPropagation(); play.classList.toggle('playing'); if(play.classList.contains('playing')) play.innerHTML = '<i class="ri-pause-line"></i>'; else play.innerHTML = '<i class="ri-play-line"></i>'; });

        // plus action tries to click nearest add-to-cart
        plus.addEventListener('click', function(e){ e.stopPropagation(); var card = pm.closest('.post-card-2') || pm.closest('.product'); var addBtn = card && (card.querySelector('.add-to-cart') || card.querySelector('.btn.add-to-cart')); if(addBtn){ addBtn.click(); } else { plus.classList.add('active'); setTimeout(()=>plus.classList.remove('active'),600); } });
    });

    // leave rest of page logic intact
    renderCart();


    document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("button");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      // Prevent multiple loaders on the same button
      if (button.disabled) return;

      // Disable button to avoid double clicks
      button.disabled = true;

      // Replace button content with loader
      button.innerHTML = `<div class="loader"></div>`;
    });
  });
});
