if (!window.location.href.includes('/cart')) {
    // Your script code here
    async function getData() {
        let res = await fetch("/cart.js");
        let data = await res.json();
        let item_container = document.querySelector(".item_container");
        
      
         

        if(data.item_count > 0){
          item_container.innerHTML = ''
            data.items.forEach((item) => {
                let inner_html = `
                  <div class="w-full border-b-[1px] border-slate-300 flex cart-item py-[1em]" data-line-key="${item.key}" data-item-id="${item.id}">
                    <div class="w-[30%]">
                      <img src="${item.image}" alt="${item.featured_image.alt}" class="w-[5em] h-[5em] object-cover border-[0.5px] border-slate-400">
                    </div>
                    <div class="w-[70%]  flex flex-col justify-evenly">
                      <h2 class="text-[16px] roboto">${item.product_title}</h2>

                      <p class="underline mb-[0.5em]">Price: ${(item.original_price / 100).toFixed(2)}</p>
                      <div class="flex items-center justify-between">
                        <input type="number"
                               class="w-[6em] cart-item-quantity update 
                               border-[1px] border-lime-500 focus:outline-none p-[0.4em] "
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
        subtotal.textContent = ` Rs ${(data.original_total_price / 100).toFixed(2)}`
              
        }else{
          item_container.innerHTML = `<div class="w-full h-full bg-white absolute top-0 left-0 z-20 flex justify-center items-center flex-col gap-4">
          <h1 class="text-[1.5em] font-bold">Your Cart is Empty</h1>
          <a href="/collections/all" class="py-[0.5em] px-[1em] text-white  bg-lime-500 rounded-sm border-[1px] border-lime-500 hover:bg-transparent hover:text-lime-500 duration-300 cursor-pointer">Continue Shopping</a>
        </div>`
        }
       
        
       
         
        
        }



      document.addEventListener('change', async (e) => {
        if (!e.target.classList.contains('cart-item-quantity')) return;
        const input   = e.target;
        const lineEl  = input.closest('.cart-item');
        const oldKey  = input.dataset.lineKey;
        const itemId  = lineEl.dataset.itemId;              // your <div> has data-item-id
        const newQty  = Math.max(1, parseInt(input.value, 10) || 1);
      
        // normalize value immediately
        input.value = newQty;
      
        try {
          const res = await fetch('/cart/change.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept':       'application/json'
            },
            body: JSON.stringify({ id: oldKey, quantity: newQty })
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const cart = await res.json();
      
          // 1) update subtotal & count
          document.querySelector('.orignal_total_price').textContent =
            `Rs ${(cart.original_total_price/100).toFixed(2)}`;
          document.querySelector('#cart-count').textContent = cart.item_count;
      
          // 2) find this item by its numeric variant id
          const updated = cart.items.find(i => i.id === Number(itemId));
          if (updated) {
            // 3) write the new key back onto your input
            input.dataset.lineKey = updated.key;
      
            // 4) recalc just this line’s total
            const unitCents = parseInt(input.dataset.price, 10);
            const lineTotal = lineEl.querySelector('[data-line-total]');
            lineTotal.textContent = 
              `Rs ${((unitCents * newQty)/100).toFixed(2)}`;
          }
      
        } catch (err) {
          console.error('Cart update failed:', err);
          // fallback to full redraw so keys never get stale
          getData();
          alert('Couldn’t update cart — please try again.');
        }
      });
      
      
      
      let icon = document.querySelector(".cart_drawer_open");
      icon.addEventListener("click" , function(){
        getData();
          
      })

      
      
       
      document.addEventListener('click', async (e) => {
        // 1) Only act on clicks inside a .cart-remove link
        const btn = e.target.closest('a.cart-remove');
        if (!btn) return;
        e.preventDefault();
      
        // 2) Grab the current line-key
        const lineKey = btn.dataset.lineKey;
        if (!lineKey) {
          console.warn('No line-key on remove button!');
          return getData(); // safe fallback
        }
      
        try {
          // 3) Fire the “change to zero” request
          const res = await fetch('/cart/change.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept':       'application/json'
            },
            body: JSON.stringify({ id: lineKey, quantity: 0 })
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
          // 4) Parse response and immediately re-draw cart drawer
          const cart = await res.json();
          getData();
      
          // 5) Update the cart-icon badge (if you have one)
          const badge = document.querySelector('#cart-count');
          if (badge) {
            badge.textContent = cart.item_count > 0 ? cart.item_count : '';
          }
      
        } catch (err) {
          console.error('Cart removal failed:', err);
          // 6) On error, redraw AND alert
          getData();
          alert('Sorry, we couldn’t remove that item. Please try again.');
        }
      });
}




  

// 1) Build one cart‐item’s HTML

  