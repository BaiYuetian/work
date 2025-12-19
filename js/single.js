document.addEventListener("DOMContentLoaded", async function () { 

 try{
  const urlParams = new URLSearchParams(window.location.search);
  let productName = urlParams.get('productName') ||
                    urlParams.get('Productname') ||
                    urlParams.get('ProductName') ||null;  
  let brand = urlParams.get('brand') ||
              urlParams.get('Brand') ||
              urlParams.get("brandName")||null;
  let size = urlParams.get('size') ||
             urlParams.get('Size') ||null;
  let color = urlParams.get('color') ||
              urlParams.get('Color') ||null;
  let isHave = await getProductInfo(brand, productName);
  if (!isHave) {
      window.location.href = `404.html?text=找不到产品:${encodeURIComponent(productName)}`;
      return;
  }
  brandName = brand;
  productName = productName;``
  try{ 
  await setProduct(brand, productName);
  } catch(err){
    console.error('页面初始化失败 L18:', err.message);
    return;
  }
 try{ 
    set_flexiselDemo1(); // 轮播图
 } catch(err){
    console.error('轮播图初始化失败:', err.message);
  }
  try{
    initLister(brandName, productName); // 监听
  }catch(err){ 
    console.error('事件监听初始化失败:', err.message);
  }
  try{

  await set_showImg(brand, productName);
  }catch(err){  
    console.error('主图初始化失败:', err.message);
  }
  initFromURL(); // 从URL初始化选择
  setURL(); // 同步URL参数

}  catch(err){
    console.error('页面初始化失败:', err.message);
  }
});

async function setProduct(brandName, productName) {
  // 设置产品相关信息

  // 名称
   const productNameInfo = document.querySelector('#productNameInfo');
   productNameInfo.innerText = brandName +" "+ productName;
  //说明
  document.querySelector("#descriptionInfo").innerText = await getProductInfoForKey(brandName, productName,'description');
// 规格
try{ 
  await setColor(brandName, productName);   //颜色
  await setSize(brandName, productName); //容量
  setPriceAndInventory(brandName, productName); // 初始设置价格和库存
} catch(err){
  console.error('页面初始化失败:', err.message);
  return;
}

} 
async function setColor(brandName, productName){
    //颜色
  try{
    colorList = await getProductInfoForKey(brandName, productName,'color');
    inventoryList = await getProductInfoForKey(brandName, productName,'inventoryList');
    colorSelect = document.querySelector('#colorSelect');
    colorSelect.innerHTML = '';
    for (const color of colorList) {
      colorSelect.innerHTML += `<option value="${color}">${color}</option>`;
      }

  }catch(err){
    console.error('设置颜色失败:', err.message);
  }
  
}
async function setSize(brandName, productName){
  //容量
  try{
    const colorKey = colorSelect.value;
    inventoryList = await getProductInfoForKey(brandName, productName,'inventoryList');
    if (inventoryList && typeof inventoryList === 'object' && inventoryList[colorKey] != null) {
      sizeList = Object.keys(inventoryList[colorKey]);
      console.log('sizeList:', sizeList);
    } else {
      sizeList =[];
    }
      sizeSelect = document.querySelector('#sizeSelect');
      sizeSelect.innerHTML = '';
      for (const size of sizeList) {
        sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
      }
  }catch(err){
    console.error('设置容量失败:', err.message);
  }
  
}
function setPriceAndInventory(brandName, productName){
  //价格和库存
    const colorKey = colorSelect.value;
    const sizeKey = sizeSelect.value;
    const priceInfo = document.querySelector('#priceInfo');
    const inventoryInfo = document.querySelector('#inventoryInfo');
    if (inventoryList && typeof inventoryList === 'object' && inventoryList[colorKey] && inventoryList[colorKey][sizeKey]) {
      const inventory = inventoryList[colorKey][sizeKey];
      priceInfo.innerText = `￥ ${inventory.price}`;
      inventoryInfo.innerText = `库存： ${inventory.inventory}`;
      if (inventory.inventory <= 0) {
        document.querySelector('#addToCart').innerText = '缺货，添加到愿望单';
        document.querySelector("#inventoryInfo").style.color = 'red';
      } else {
        document.querySelector('#addToCart').innerText = '添加到购物车';
        document.querySelector("#inventoryInfo").style.color = 'black';

      }
    } else {
      priceInfo.innerText = '￥:??';
    }
    console.log('价格和库存信息已设置');
}
async function colorSelect_Change(brandName, productName){
  /**
   * 颜色选择变化
   * 设置容量下拉框(no connuct)

   */
  await setSize(brandName, productName);
  setPriceAndInventory();
  setURL();
}


function setURL() {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);

  // ✅ 1. 安全提取并保留 ProductName & Brand（兼容大小写）
  const productName = 
    params.get('ProductName') || 
    params.get('Productname') || 
    params.get('productname') || 
    params.get('productName') || '';
  const brand = 
    params.get('Brand') || 
    params.get('brand') || '';

  // ✅ 2. 获取当前选中值（来自下拉框）
  const colorSelect = document.querySelector('#colorSelect');
  const sizeSelect = document.querySelector('#sizeSelect');
  const color = colorSelect?.value?.trim() || null;
  const size = sizeSelect?.value?.trim() || null;

  // ✅ 3. 构建新参数：必须保留的 + 可选更新的
  const newParams = new URLSearchParams();
  if (productName) newParams.set('ProductName', productName);
  if (brand) newParams.set('Brand', brand);
  if (color) newParams.set('color', color);
  if (size) newParams.set('size', size);

  // ✅ 4. 特别保留 retURL（登录跳转关键！不能丢）
  const retURL = params.get('retURL');
  if (retURL) newParams.set('retURL', retURL);

  // ✅ 5. 生成新 URL 并无刷新更新
  const newUrl = `${url.pathname}?${newParams}`;
  history.replaceState(null, '', newUrl);

  console.log("✅ URL 已同步：", newUrl);
}

function sizeSelect_Change(brandName, productName) {
  /***
   * 容量选择变化
   * 设置价格和库存信息
 */
  setPriceAndInventory();
  setURL();
  console.log('容量选择已更改');

}
function addToCart_Click(brandName, productName) {
  // ✅ 1. 安全获取当前选中值
  const colorSelect = document.querySelector('#colorSelect');
  const sizeSelect = document.querySelector('#sizeSelect');
  if (!colorSelect || !sizeSelect) {
    console.warn('❌ 购物车添加失败：缺少颜色或容量下拉框');
    return;
  }

  const color = colorSelect.value?.trim();
  const size = sizeSelect.value?.trim();
  if (!color || !size) {
    alert('⚠️ 请先选择颜色和容量！');
    return;
  }

  // ✅ 2. 构建商品唯一标识（用于查重）
  const key = `${brandName}|${productName}|${color}|${size}`;
  const cartItem = {
    key, // ⚠️ 关键！用于去重
    productName,
    brandName,
    color,
    size,
    quantity: 1
  };

  // ✅ 3. 读取现有购物车（安全解析）
  let cart = [];
  try {
    const saved = localStorage.getItem('cartProduct');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) cart = parsed;
    }
  } catch (e) {
    console.error('⚠️ 本地购物车数据损坏，已重置:', e);
    localStorage.removeItem('cartProduct');
  }

  // ✅ 4. 查找是否已存在（用 key 匹配）
  const existingIndex = cart.findIndex(item => item.key === key);
  if (existingIndex >= 0) {
    // ✅ 已存在 → 数量 +1
    cart[existingIndex].quantity += 1;
    console.log(`✅ 已存在商品，数量更新为: ${cart[existingIndex].quantity}`);
  } else {
    // ✅ 首次添加
    cart.push(cartItem);
    console.log('✅ 新商品已加入购物车');
  }

  // ✅ 5. 保存回 localStorage
  try {
    localStorage.setItem('cartProduct', JSON.stringify(cart));
    console.log('🛒 购物车已更新:', cart);
    // ✅ 可选：刷新购物车徽章（如顶部小红点）
   // updateCartBadge(cart.length);
  } catch (e) {
    console.error('❌ 保存购物车失败:', e);
    alert('购物车保存失败，请稍后重试');
  }
}
function addToWishlist_Click(productName,brandName,color,size){
  /***
   * 添加到愿望单按钮点击
   */
}
function initLister(brandName, productName){
  try{ 
      document.getElementById('colorSelect').addEventListener('change', function() {
      colorSelect_Change(brandName, productName);
    });
    console.log('colorSelect元素更改事件监听初始化完毕');
  } catch(err){
    console.error('colorSelect元素更改事件监听初始化失败:', err.message);
  }
  try{
      document.getElementById('sizeSelect').addEventListener('change', function() {
      sizeSelect_Change(brandName, productName);
    });
    console.log('sizeSelect元素更改事件监听初始化完毕');
  } catch(err){
    console.error('sizeSelect元素更改事件监听初始化失败:', err.message);
  }
  try{
    document.getElementById('addToCart').addEventListener('click', function() {
    /***
     * 添加到购物车按钮点击
     */ 
    color = document.querySelector('#colorSelect').value;
    size = document.querySelector('#sizeSelect').value;
    if (document.querySelector('#addToCart').innerText === '添加到购物车') {
      /**
       * 添加到购物车
       */
      addToCart_Click(brandName,productName);
      return;
    } else if (document.querySelector('#addToCart').innerText === '缺货，添加到愿望单') {
      /**
       * 添加到愿望单
       */
      addToWishlist_Click(productName,brandName,color,size);
      return;
    }else {
      alert("遇到未知错误，添加失败");
      return;
    }
  });
  }catch(err){ 
    console.error('按钮点击事件监听初始化失败:', err.message);
  }
  


}

/**
 * 轮播图
 * @returns null
 */
function set_flexiselDemo1() {
    const carousel = document.getElementById("flexiselDemo1");
    if (!carousel) return;

    fetch("products.json")
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(products => {
            const validProducts = products.filter(p =>
                p && typeof p === "object" &&
                p.brand && p.product && p.path
            );

            const shuffled = [...validProducts].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, 10);

            carousel.innerHTML = "";
            selected.forEach(product => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <img src="${product.path}" alt="${product.brand} ${product.product}" />
                    <div class="grid-flex">
                        <a href="single.html?productName=${encodeURIComponent(product.product)}&brand=${encodeURIComponent(product.brand)}">${product.product}</a>
                        <p>${product.brand}</p>
                    </div>
                `;
                carousel.appendChild(li);
            });

            if (typeof $ !== "undefined" && typeof $.fn.flexisel !== "undefined") {
                setTimeout(() => {
                    $("#flexiselDemo1").flexisel({
                        visibleItems: 5,
                        animationSpeed: 1000,
                        autoPlay: true,
                        autoPlaySpeed: 3000,
                        pauseOnHover: true,
                        enableResponsiveBreakpoints: true,
                        responsiveBreakpoints: {
                            portrait: { changePoint: 480, visibleItems: 1 },
                            landscape: { changePoint: 640, visibleItems: 2 },
                            tablet: { changePoint: 768, visibleItems: 3 }
                        }
                    });
                }, 10);
            }
        })
        .catch(err => {
            console.warn("[set_flexiselDemo1] 加载或处理 products.json 失败：", err.message);
        });
}

/**
 * 加载产品图片并初始化 Etalage 悬停放大
 * @param {*} brandName
 * @param {*} productName
 * @returns {Promise<void>}
 */
async function set_showImg(brandName, productName) {
  try {
    const productList = await getProductInfo(brandName, productName);
    
    if (!productList || !productList.path || typeof productList.path !== 'string') {
      console.warn('⚠️ set_showImg: 无效 productInfo 或缺失 path 字段');
      const thumb = document.getElementById('showThumbImg');
      const source = document.getElementById('showSourceImg');
      const link = document.getElementById('showImg');
      if (thumb) thumb.src = '';
      if (source) source.src = '';
      if (link) link.title = '图片数据不可用';
      return;
    }

    const imgPath = productList.path.trim();

    const etalageEl = document.getElementById('etalage');
    if (!etalageEl) {
      console.error(' #etalage 元素不存在');
      return;
    }
    etalageEl.innerHTML = `
      <li>
        <a href="#" id="showImg" title="${brandName} ${productName}">
          <img class="etalage_thumb_image img-responsive" id="showThumbImg" src="" alt="">
          <img class="etalage_source_image img-responsive" id="showSourceImg" src="" alt="">
        </a>
      </li>
    `;

    const thumbImg = document.getElementById('showThumbImg');
    const sourceImg = document.getElementById('showSourceImg');
    const linkEl = document.getElementById('showImg');

    thumbImg.src = imgPath;
    sourceImg.src = imgPath;

    await Promise.all([
      new Promise(r => thumbImg.complete ? r() : thumbImg.onload = r),
      new Promise(r => sourceImg.complete ? r() : sourceImg.onload = r)
    ]);

    if (typeof $ !== 'undefined' && $.fn.etalage) {
      const $etalage = $('#etalage');
      if ($etalage.data('etalage')) $etalage.etalage('destroy');

      $etalage.etalage({
        zoom_area_width: 400,
        zoom_area_height: 400,
        zoom_area_distance: 10,
        small_thumbs: 0,
        smallthumb_hide_single: true,
        show_begin_end_smallthumb: false,
        smallthumb_select_on_hover: false,
        smallthumb_inactive_opacity: 0,
        show_icon: false,
        show_hint: false,
        show_descriptions: false
      });

      $etalage.find('.etalage_small_thumbs, .etalage_icon, .etalage_hint').remove();
      console.log('✅ Etalage 初始化完成，小缩略图已彻底禁用');
    }

  } catch (err) {
    console.error('set_showImg 异常:', err);
    const link = document.getElementById('showImg');
    if (link) link.title = '加载失败，请刷新重试';
  }
}

function initFromURL() {
  const urlParams = new URLSearchParams(window.location.search);

  // ✅ 安全获取 color & size（兼容大小写）
  const color = urlParams.get('color') || urlParams.get('Color') || urlParams.get('COLOR') || '';
  const size = urlParams.get('size') || urlParams.get('Size') || urlParams.get('SIZE') || '';

  const colorSelect = document.querySelector('#colorSelect');
  const sizeSelect = document.querySelector('#sizeSelect');

  // ✅ 设置 color 下拉框（精确匹配 value）
  if (colorSelect && color) {
    const option = Array.from(colorSelect.options).find(opt => opt.value === color);
    if (option) {
      colorSelect.value = color;
    } else {
      console.warn(`⚠️ URL 中 color="${color}" 在下拉框中不存在，已忽略`);
    }
  }

  // ✅ 设置 size 下拉框
  if (sizeSelect && size) {
    const option = Array.from(sizeSelect.options).find(opt => opt.value === size);
    if (option) {
      sizeSelect.value = size;
    } else {
      console.warn(`⚠️ URL 中 size="${size}" 在下拉框中不存在，已忽略`);
    }
  }
}