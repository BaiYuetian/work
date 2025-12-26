
function initShoppingCart() {
  function getCartData() {
    try {
      const saved = localStorage.getItem('cartProduct');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('⚠️ 本地购物车数据损坏，已重置:', e);
      localStorage.removeItem('cartProduct');
      return [];
    }
  }

  function saveCartData(cart) {
    try {
      localStorage.setItem('cartProduct', JSON.stringify(cart));
      return true;
    } catch (e) {
      console.error('❌ 保存购物车失败:', e);
      return false;
    }
  }

  async function getProductImage(brand, product) {
    try {
      const path = await getProductInfoForKey(brand, product, 'path');
      if (typeof path === 'string' && path.trim()) {
        return path.trim();
      }
      console.warn(`⚠️ getProductInfoForKey('${brand}', '${product}', 'path') 返回空值`);
      return 'images/default.jpg';
    } catch (err) {
      console.warn(`⚠️ 加载 ${brand}/${product} 图片失败:`, err.message || err);
      return 'images/default.jpg';
    }
  }

  function buildProductUrl(brand, product, color, size) {
    return (
      'single.html?' +
      'productName=' + encodeURIComponent(product) +
      '&brandName=' + encodeURIComponent(brand) +
      '&color=' + encodeURIComponent(color) +
      '&size=' + encodeURIComponent(size)
    );
  }

  function getCurrentBrand() {
    const params = new URLSearchParams(window.location.search);
    return params.get('brandName') || 
           params.get('brand') || 
           params.get('Brand') ||
           '';
  }

  function getCurrentProduct() {
    const params = new URLSearchParams(window.location.search);
    return params.get('productName') || 
           params.get('product') || 
           params.get('Productname') ||
           params.get('ProductName') ||
           '';
  }

  async function renderCartItems() {
    const $cartLists = $('.shopping_cart');
    $cartLists.empty();
    const cart = getCartData();

    $cartLists.css({
      'max-height': '300px',
      'overflow-y': 'auto'
    });

    if (cart.length === 0) {
      $cartLists.html('<div class="empty-cart text-center py-5"><p>🛒 购物车还是空的，快去挑选心仪商品吧！</p><p><a href="index.html">← 继续购物</a></p></div>');
      await updateCartSummary(); 
      toggleCartSlider(); 
      return;
    }

    try {
      const pricePromises = cart.map(item =>
        getProductPrice(item.brandName, item.productName, item.color, item.size).catch(() => 0)
      );
      const prices = await Promise.all(pricePromises);

      const imagePromises = cart.map(item =>
        getProductImage(item.brandName, item.productName).catch(() => 'images/default.jpg')
      );
      const imgSrcs = await Promise.all(imagePromises);

      const escape = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const itemsHTML = cart.map((item, idx) => {
        const imgSrc = imgSrcs[idx] || 'images/default.jpg';
        const url = buildProductUrl(item.brandName, item.productName, item.color, item.size);

        const price = parseFloat(prices[idx]) || 0;
        const quantity = parseInt(item.quantity) || 0;
        const itemTotal = price * quantity;
        const fullSpec = `${item.productName} - ${item.color} | ${item.size}`;
        return `
          <div class="cart_box" data-key="${escape(item.key)}">
            <div class="message">
              <div class="alert-close delete-item" title="删除"></div>
              <div class="list_img">
                <img src="${escape(imgSrc)}" class="img-responsive" alt="${escape(item.productName)}">
              </div>
            </div>
            <div class="list_desc">
              <h4><a href="${escape(url)}">${escape(item.productName)}</a></h4>
              <a href="${escape(url)}" class="offer" title="${escape(fullSpec)}">${escape(item.color)} | ${escape(item.size)}</a>
              <div class="price" data-price="${price.toFixed(2)}">单价: ${price.toFixed(2)}￥</div>
              <div class="quantity">数量: ${quantity}</div>
              <div class="total">小计: ${itemTotal.toFixed(2)}￥</div>
            </div>
            <div class="clearfix"></div>
          </div>`;
      }).join('');

      $cartLists.html(itemsHTML);
      await updateCartSummary(); 
      
      toggleCartSlider();
    } catch (err) {
      console.error('❌ 渲染购物车失败:', err);
      $cartLists.html('<div class="error-cart">⚠️ 加载购物车时发生错误，请刷新重试</div>');
    }
  }

  function toggleCartSlider() {
    const cart = getCartData();
    const $subIcon = $('ul.sub-icon1');
    
    if (cart.length > 0) {
      $subIcon.show();
    } else {
      $subIcon.hide();
    }
  }

  async function addToCart({ brand, product, color, size }) {
    if (!brand || !product || !color || !size) {
      alert('⚠️ 商品信息不完整：品牌/名称/颜色/规格均需选择！');
      return false;
    }

    try {
      const colorSelect = document.querySelector('#colorSelect');
      const sizeSelect = document.querySelector('#sizeSelect');

      if (!colorSelect || !sizeSelect) {
        console.warn(' #colorSelect 或 #sizeSelect 元素未找到，尝试延迟重试...');
        await new Promise(r => setTimeout(r, 100));
     
        if (!document.querySelector('#colorSelect') || !document.querySelector('#sizeSelect')) {
          alert(' 页面初始化未完成，请稍后重试。');
          return false;
        }
      }

      const actualColor = colorSelect.value?.trim() || color;
      const actualSize = sizeSelect.value?.trim() || size;

      if (!actualColor || !actualSize) {
        console.warn(' 当前下拉框值为空，使用 URL 参数兜底', { color, size });
      }

      const finalColor = actualColor || color;
      const finalSize = actualSize || size;

      const price = await getProductPrice(brand, product, finalColor, finalSize);
      console.log("获取到的价格:", price); // 调试用
      
      if (price === null || price === undefined || isNaN(price) || price <= 0) {
        console.error("无效的价格:", {brand, product, finalColor, finalSize, price});
        alert('⚠️ 无法获取该规格价格，请联系客服或稍后重试。');
        return false;
      }

      const key = [brand, product, finalColor, finalSize].join('|');
      let cart = getCartData();
      const existing = cart.find(item => item.key === key);

      if (existing) {
        existing.quantity = (parseInt(existing.quantity) || 0) + 1;
      } else {
        cart.push({
          key,
          brandName: brand,
          productName: product,
          color: finalColor,
          size: finalSize,
          quantity: 1
        });
      }

      if (saveCartData(cart)) {
        showToast(`${product} 已加入购物车！`, 'success');
        renderCartItems();
        return true;
      } else {
        throw new Error('localStorage 写入失败');
      }
    } catch (err) {
      console.error('❌ 添加购物车失败:', err);
      alert('添加失败，请检查网络或稍后重试。');
      return false;
    }
  }

  function removeFromCart(key) {
    const cart = getCartData();
    const newCart = cart.filter(item => item.key !== key);
    if (saveCartData(newCart)) {
      renderCartItems();
    }
  }

  async function updateCartSummary() {
    const cart = getCartData();
    let totalQuantity = 0;
    let totalPrice = 0;

    if (cart.length > 0) {
      const pricePromises = cart.map(item =>
        getProductPrice(item.brandName, item.productName, item.color, item.size).catch(() => 0)
      );
      const prices = await Promise.all(pricePromises);
      
      cart.forEach((item, index) => {
        const quantity = parseInt(item.quantity) || 0;
        const price = parseFloat(prices[index]) || 0;
        totalQuantity += quantity;
        totalPrice += price * quantity;
      });
    }

    $('.item').text(totalQuantity + ' 项');
    $('.rate').text(totalPrice.toFixed(2) + '￥');
    $('#cartShowNumInfo').text(`购物车中的商品(${totalQuantity})`);
  }

  function bindDeleteEvent() {
    $(document).off('click', '.delete-item');
    
    $(document).on('click', '.delete-item', function () {
      const $box = $(this).closest('.cart_box');
      const key = $box.data('key');
      $box.remove();
      removeFromCart(key);
    });
  }

  function bindAddEvent() {
    $(document).off('click', '.cart-to');
    
    $(document).on('click', '.cart-to', async function (e) {
      e.preventDefault();

      let brand = getCurrentBrand();
      let product = getCurrentProduct();

      if ((!brand || !product) && typeof brandName !== 'undefined' && typeof productName !== 'undefined') {
        brand = brand || brandName;
        product = product || productName;
        console.log("从全局变量获取品牌和产品:", {brand, product});
      }

      if (!brand || !product) {
        alert('⚠️ 当前页面缺少品牌或商品信息，请刷新重试。');
        return;
      }

      const colorSelect = document.querySelector('#colorSelect');
      const sizeSelect = document.querySelector('#sizeSelect');

      if (!colorSelect || !sizeSelect) {
        alert(' 页面未加载完成，请稍后重试。');
        return;
      }

      const color = colorSelect.value?.trim();
      const size = sizeSelect.value?.trim();

      if (!color || !size) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlColor = urlParams.get('color') || urlParams.get('Color') || '';
        const urlSize = urlParams.get('size') || urlParams.get('Size') || '';
        if (urlColor && urlSize) {
          alert(` 检测到您已通过链接选择：${urlColor} / ${urlSize}，将以此为准添加。`);
        } else {
          alert('请选择颜色和规格，并确保商品信息完整！');
          return;
        }
      }

      const $btn = $(this);
      const originalText = $btn.text();
      $btn.text('添加中...').prop('disabled', true);

      try {
        const success = await addToCart({ 
          brand, 
          product, 
          color: color || urlColor, 
          size: size || urlSize 
        });
        if (success) {
     }
      } finally {
        $btn.text(originalText).prop('disabled', false);
      }
    });
  }

  function showToast(msg, type = 'info') {
    const id = 'toast-' + Date.now();
    const $toast = $(`
      <div id="${id}" class="toast toast-${type}" style="
        position: fixed; bottom: 20px; right: 20px; 
        background: ${type === 'success' ? '#4CAF50' : '#f44336'}; 
        color: white; padding: 12px 24px; border-radius: 4px; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 9999;
        transform: translateX(120%); transition: transform 0.3s ease-out;
      ">
        ${msg}
      </div>
    `);

    $('body').append($toast);
    $toast.css('transform', 'translateX(0)');

    setTimeout(() => {
      $toast.css('transform', 'translateX(120%)');
      setTimeout(() => $toast.remove(), 300);
    }, 2000);
  }

  async function init() {
    await new Promise(resolve => {
      const check = () => {
        if ($('.cart').length > 0 && !$('#colorSelect').length && !$('#sizeSelect').length) {
          console.log('当前页面无需 colorSelect/sizeSelect，直接初始化购物车');
          resolve();
          return;
        }
        
        if (document.querySelector('#colorSelect') && document.querySelector('#sizeSelect')) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });

    bindDeleteEvent();
    bindAddEvent();
    await renderCartItems(); 
  }

  let initCalled = false;
  setTimeout(() => {
    if (!initCalled) {
      initCalled = true;
      init();
    }
  }, 100);

  return {
    addToCart,
    getCartData,
    saveCartData,
    renderCartItems,
    removeFromCart,
    updateCartSummary
  };
}

$(function () {
  window.shoppingCart = initShoppingCart();
  
  setTimeout(() => {
    if (window.shoppingCart && typeof window.shoppingCart.getCartData === 'function') {
      const cart = window.shoppingCart.getCartData();
      if (cart && cart.length > 0) {
        $('.cart ul.sub-icon1').css('display', 'block');
      }
    }
  }, 100);
});

