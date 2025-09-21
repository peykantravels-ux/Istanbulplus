function updateCartCount() {
    fetch('/api/cart/count/', {
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = data.count || 0;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = '0';
        }
    });
}

// Update cart count when page loads
document.addEventListener('DOMContentLoaded', updateCartCount);

// Function to add product to cart
function addToCart(productId, quantity = 1) {
    fetch('/api/cart/items/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: quantity
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartCount();
            alert('محصول با موفقیت به سبد خرید اضافه شد.');
        } else {
            alert(data.error || 'خطا در افزودن محصول به سبد خرید.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('خطا در افزودن محصول به سبد خرید.');
    });
}

// Helper function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}