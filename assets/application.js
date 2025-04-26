
function getWishlist() {
  const wishlist = localStorage.getItem('wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
}

function setWishlist(list) {
  localStorage.setItem('wishlist', JSON.stringify(list));
}



/* Cart Form Initialization */
function initCartForms() {
  document.querySelectorAll('.add-to-cart-form').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(form);
      const button = form.querySelector('.add-to-cart-button');
      const originalHTML = button.innerHTML;

      button.disabled = true;
      button.textContent = 'Adding...';

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData)
        });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        
      
      
        const cartRes = await fetch('/cart.js');
        const cartData = await cartRes.json();
        document.querySelectorAll('#cart-count').forEach(span => {
          span.textContent = cartData.item_count;
        });
      } catch (err) {
        console.error('Add to cart failed:', err);
        alert(`Could not add item: ${err.message}`);
      } finally {
        button.disabled = false;
        button.innerHTML = originalHTML;
        
      }
    });
  });

  
}

/* Wishlist Button Initialization */
function initWishlistButtons() {
  const current = getWishlist();
  document.querySelectorAll('.wishlist').forEach(btn => {
    const handle = btn.getAttribute('data-product-handle');
    if (current.includes(handle)) {
      btn.classList.add('text-red-400');
    }
    btn.addEventListener('click', e => {
      e.preventDefault();
      let list = getWishlist();
      if (list.includes(handle)) {
        list = list.filter(h => h !== handle);
        btn.classList.remove('text-red-400');
      } else {
        list.push(handle);
        btn.classList.add('text-red-400');
      }
      setWishlist(list);
      const countEl = document.querySelector('#wish_count');
      countEl.textContent = list.length || '';
    });
  });
}

/* Fetch and Show Quick-View */
function initQuickView() {
  document.querySelectorAll('.quick_view').forEach(el => {
    el.addEventListener('click', () => {
      const handle = el.getAttribute('quick-view');
      getProduct(handle);
    });
  });
}

async function getProduct(handle) {
  try {
    const res = await fetch(`/products/${handle}.js`);
    const data = await res.json();
    showProduct(data);
  } catch (err) {
    console.error('Fetch product failed:', err);
  }
}

/* Render Quick-View Modal */
function showProduct(data) {
  const container = document.querySelector('.quick_view_container');
  const mainImage = data.images?.[0] || '';
  const thumbnails = (data.images?.length >= 0)
    ? data.images.slice(0).map((src, i) => `
      <div slide-val=""${i} class="  w-[4em] h-[4em] hover:bg-red-400 border-[1px] border-slate-400 rounded-sm overflow-hidden">
        <img src="${src}" alt="Thumb ${i + 1}" class="quick_view_images w-full h-full object-cover" />
      </div>`).join('')
    : '';

  const paragraphs = data.description.split('\n');

  

  // Build option selectors
  const optionsHtml = data.options.map((opt, idx) => `
    <div class="my-3">
      <label for="option-${idx}" class="block text-sm font-medium text-gray-700">${opt.name}</label>
      <select id="option-${idx}" name="option-${idx}" class="w-full border px-3 py-2 mt-1">
        ${opt.values.map(val => `<option value="${val}">${val}</option>`).join('')}
      </select>
    </div>
  `).join('');

  // Inject markup
  container.innerHTML = `
    <div x-on:click="quick_view = false" class="absolute right-[1em] top-[1em] p-[0.5em] cursor-pointer">
      <p class="text-[1.5em]">X</p>
    </div>
    <div class="w-full px-[5em] mx-auto my-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-[2em]">

        <!-- Media Section -->
        <div class="product--medias">
          <div class="relative ">
            <div class="  w-full h-[35em] overflow-x-hidden">
              <img src="${mainImage}" alt="${data.title}" class=" quick_view_frame w-full h-full object-cover" />
            </div>
            ${thumbnails ? `
              <div class="w-full p-[1em] bottom-[2em] right-0 absolute flex justify-end items-center gap-2">
                ${thumbnails}
              </div>` : ''}
          </div>
        </div>

        <!-- Information Section -->
        <div class="product--information sticky top-5 py-2 pl-[3em]">
          <form method="post" action="/cart/add.js" class="add-to-cart-form" novalidate>
            <input type="hidden" name="id" id="selected-variant-id" value="${data.variants[0].id}">

            <div class="my-3"><span class="text-xs text-gray-500">${data.vendor}</span></div>
            <div class="my-3"><h1 class="text-[24px] roboto text-gray-900">${data.title}</h1></div>
            <div class="my-3" id="price-section">
              ${data.compare_at_price ? `<span class="text-base text-gray-500 line-through" id="compare-price">Rs:${(data.compare_at_price / 100).toFixed(2)}</span>` : ''}
              <span class="text-[24px] text-green-500" id="current-price">Rs: ${(data.price/100).toFixed(2)}</span>
            </div>

            <!-- Variant Options -->
            <div id="variant-options">
              ${optionsHtml}
            </div>

            <!-- Quantity -->
            <div class="my-3">
              <label for="Quantity">Quantity</label>
              <div class="my-2">
                <input type="number" name="quantity" id="Quantity" value="1" min="1" class="w-full border px-3 py-3">
              </div>
            </div>

            <div class="my-[3em]"><p class="text-gray-700">${paragraphs[0]}</p></div>

            <!-- Add to Cart Button -->
            <div class="my-3 flex gap-[2em] items-center">
              <button type="submit" class="add-to-cart-button w-[10em] px-6 py-2 bg-lime-500 border-[1px] border-lime-500 text-white hover:bg-transparent duration-300 hover:text-lime-500 rounded-sm my-2" id="add-to-cart-btn">
                Add to cart
              </button>

              <div class="px-[0.6em] py-2 bg-[#F6F6F6] flex justify-center items-center rounded-sm hover:shadow-lg shadow-slate-400 duration-300">
                <i class="fa-regular fa-gem"></i>
              </div>

              <div class="wishlist px-[0.6em] py-2 bg-[#F6F6F6] flex justify-center items-center rounded-sm hover:shadow-lg shadow-slate-400 duration-300 cursor-pointer" data-product-handle="${data.handle}">
                <i class="fa-regular fa-heart"></i>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  `;


  function slider(){
    const images = document.querySelectorAll(".quick_view_images");
  const frame = document.querySelector(".quick_view_frame");
  
  images.forEach((img)=>{
    img.addEventListener("click",function(){
       
       frame.src = img.src;
      
      
      
    })
  })
  }

  slider();
  
  



 

  // Function to update variant based on selected options
  function updateVariant() {
    const selected = data.options.map((opt, idx) => document.getElementById(`option-${idx}`).value);
    const match = data.variants.find(v =>
      v.options.every((val, i) => val === selected[i])
    ) || data.variants[0];

    // Update hidden input and price display
    document.getElementById('selected-variant-id').value = match.id;
    document.getElementById('current-price').textContent = `$${match.price}`;
    if (match.compare_at_price) {
      document.getElementById('compare-price').textContent = `$${match.compare_at_price}`;
      document.getElementById('compare-price').classList.remove('hidden');
    } else {
      document.getElementById('compare-price').classList.add('hidden');
    }
    // Disable button if unavailable
    document.getElementById('add-to-cart-btn').disabled = !match.available;
  }

  // Attach change listeners to selectors
  data.options.forEach((_, idx) => {
    document.getElementById(`option-${idx}`).addEventListener('change', updateVariant);
  });

  // Initial binding
  initCartForms();
  initWishlistButtons();
}



function cart_drawer(){
  let cart_drawer = document.querySelector(".cart_drawer");
  let cart_drawer_container = document.querySelector(".cart_drawer_container");
  let cart_drawer_close = document.querySelector(".cart_drawer_close");
  let cart_item_container = document.querySelector(".cart_item_container")
  let cart_inside_container = document.querySelector(".cart_inside_items");

  
  
  
  

  if(window.location.href.includes("/cart")){
    cart_drawer_container.classList.add("hidden");

  }else{
    cart_drawer.addEventListener("click",function(){
      cart_drawer_container.classList.remove("hidden");
      cart_drawer_container.classList.add('flex');
      setTimeout(()=>{
        cart_item_container.classList.remove("translate-x-[26em]");
      },[50])
      
    })
  
    cart_drawer_close.addEventListener("click",function(){
      
      cart_item_container.classList.add("translate-x-[26em]");
      setTimeout(()=>{
        cart_drawer_container.classList.add("hidden");
      },[500])
      
    })
  }

 
  
}



/* Entry Point */
function init() {
  initCartForms();
  initWishlistButtons();
  initQuickView();
  cart_drawer();
  
}

document.addEventListener('DOMContentLoaded', init);










// 






