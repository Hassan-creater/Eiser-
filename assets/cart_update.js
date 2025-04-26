if (!window.location.href.includes('/cart')) {
    // Your script code here
    async function getData() {
        let res = await fetch("/cart.js");
        let data = await res.json();
        let item_container = document.querySelector(".item_container");
       


        if(data.item_count > 0){
            data.items.forEach((item) => {
                let inner_html = `
                  <div class="w-full py-[1em] bg-purple-300 flex cart-item" data-line-key="${item.key}" data-item-id="${item.id}">
                    <div class="w-[30%]">
                      <img src="${item.image}" alt="${item.featured_image.alt}" class="w-[5em] h-[5em] object-cover border-[0.5px] border-slate-400">
                    </div>
                    <div class="w-[70%] bg-red-900 flex flex-col justify-evenly">
                      <h2 class="text-[16px] roboto">${item.product_title}</h2>
                      <div class="flex items-center justify-between">
                        <input type="number"
                               class="w-[6em] cart-item-quantity update border-lime-500 focus:outline-none p-[0.4em] bg-green-300"
                               data-line-key="${item.key}"
                               data-price="${item.original_price}" 
                               value="${item.quantity}"
                               min="1" />
                        <a data-line-key="${item.key}" 
                           class="cart-remove text-sm font-medium text-red-500 my-1">
                          <i class="del fa-solid fa-trash"></i>
                        </a>
              
                        <p class="total_price px-2 text-[14px] font-bold" data-line-total>
                          Rs:  ${(item.original_line_price / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                `;
              
                
                          item_container.innerHTML += inner_html;

              });

      



               let subtotal = document.querySelector(".orignal_total_price");
        subtotal.textContent = ` Rs  ${(data.original_total_price / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              
        }
       
        
       
         
        
        }


       
      
      
      
        // Recalculate item total and cart subtotal
        document.addEventListener('change', (e) => {
        if (!e.target.classList.contains('cart-item-quantity')) return;
      
        const input      = e.target;
        const newQty     = Math.max(1, parseInt(input.value, 10) || 1);
        const lineKey    = input.dataset.lineKey;   // Shopify’s line key
        const unitCents  = parseInt(input.dataset.price, 10);
        const lineEl     = input.closest('.cart-item');
        const lineTotal  = lineEl.querySelector('[data-line-total]');
      
        // 1) Update backend cart
        fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id:       lineKey,
            quantity: newQty
          })
        })
        .then(res => res.json())
        .then(cart => {
          // 2) Update this line’s total price
          const newLinePrice = (unitCents * newQty) / 100;
          lineTotal.textContent = 
            `Rs ${newLinePrice.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
      
          // 3) Update subtotal from the JSON response
          document.querySelector('.orignal_total_price').textContent =
            `Rs ${(cart.original_total_price/100).toLocaleString('en-US', {
               minimumFractionDigits: 2,
               maximumFractionDigits: 2
            })}`;
      
      
         document.querySelector('#cart-count').textContent = `${cart.item_count}`
           
        })
        .catch(err => console.error('Cart update failed:', err));
      });
      
      
      let icon = document.querySelector(".cart_drawer_open");
      icon.addEventListener("click" , function(){
        getData();
          
      })

      
      
       
}



document.addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-remove');
    if (!btn) return;
    e.preventDefault();
  
    // 1) Read the line key for this cart item
    const lineKey = btn.dataset.lineKey;
  
    // 2) Send Ajax request to remove (quantity = 0)
    fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ id: lineKey, quantity: 0 })
    })
    .then((res) => {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then((cart) => {
      // 3) Remove the item’s DOM node
      const itemDiv = document.querySelector(`.cart-item[data-line-key="${lineKey}"]`);
      if (itemDiv) itemDiv.remove();
  
      // 4) Update the subtotal text
      const subtotalEl = document.querySelector('.orignal_total_price');
      subtotalEl.textContent = 
        `Rs ${(cart.original_total_price / 100).toLocaleString('en-US', {
           minimumFractionDigits: 2,
           maximumFractionDigits: 2
         })}`;
  
      // 5) Update any cart-count badge
      const countEls = document.querySelectorAll('#cart-count');
      countEls.forEach(el => el.textContent = cart.item_count);
    })
    .catch(console.error);
  });
  

// 1) Build one cart‐item’s HTML

  