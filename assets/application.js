

function getWishlist() {
  let wishlist = localStorage.getItem('wishlist');
  return wishlist ? JSON.parse(wishlist) : [];
}


function setWishlist(list) {
  localStorage.setItem('wishlist', JSON.stringify(list));
}


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.add-to-cart-form').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const addButton = form.querySelector('.add-to-cart-button');
  
        // Store original button HTML
        const originalHTML = addButton.innerHTML; // Use innerHTML instead of textContent
        addButton.disabled = true;
        addButton.innerHTML = 'Adding...'; // Changed to innerHTML to match reset
  
        try {
          const response = await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(formData).toString()
          });
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const data = await response.json();
          const cartUpdate = await fetch('/cart.js');
          const cartData = await cartUpdate.json();
  
          // Fix 1: Use querySelectorAll and handle null case
          const cartCounters = document.querySelectorAll('#cart-count');
         
            cartCounters.forEach(span => {
              span.textContent = cartData.item_count;
            });
          
  
        } catch (error) {
          console.error('Add to cart failed:', error);
          alert(`Could not add item: ${error.message}`);
        } finally {
          addButton.disabled = false;
          addButton.innerHTML = originalHTML; // Reset to stored HTML
        }
      });
    });

    //   WISHLIST
        const currentWishlist = getWishlist();

        document.querySelectorAll('.wishlist').forEach((btn)=>{
           
          const productId = btn.getAttribute('data-product-handle');
         
          if(currentWishlist.includes(productId)){
            btn.classList.add('text-red-400');
          }

          btn.addEventListener('click',function(e){
            e.preventDefault();
            const Id = btn.getAttribute('data-product-handle');
            let wishlist = getWishlist();

            if(wishlist.includes(Id)){
              wishlist = wishlist.filter(id => id !== Id)
              btn.classList.remove('text-red-400');
            }else{
              wishlist.push(Id);
              btn.classList.add('text-red-400');
            }

            setWishlist(wishlist); 
            let p_list = getWishlist();
            let list_count = document.querySelector('#wish_count');
          
            if(p_list.length != 0){
               list_count.textContent = p_list.length;
            }else{
              list_count.textContent = ''
            }



            
          })
        })



       
        
  });


 