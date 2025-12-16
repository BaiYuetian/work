document.addEventListener("DOMContentLoaded", function () { 

    
    const urlParams = new URLSearchParams(window.location.search);

    const productName = urlParams.get('productName'); 
    const brand = urlParams.get('brand');
    if (!productName || !brand) {
    //  location.href="404.html?text=找不到产品"+productName;
    // return;
  }
    set_showProductColor(productName);
    set_showProductName(productName,brand);
    set_flexiselDemo1();
    set_showImg(brand, productName);
    

});

function set_showProductName(productName,brand) {
  const e = document.querySelector('#showProductName');
  e.innerText = brand +" "+ productName;
}

async function set_showProductColor(productName) {
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const products = await res.json();

    const product = products.find(p => p.product === productName);
    if (!product || !Array.isArray(product.color) || product.color.length === 0) {
      console.warn(` 未找到产品 "${productName}" 或其 color 数据为空`);
      return;
    }

    const select = document.querySelector('#showProductColor select');
    if (!select) {
      console.warn(' 未找到 #showProductColo select 元素');
      return;
    }
    select.innerHTML = product.color.map(color => 
      `<option value="${color}">${color}</option>`
    ).join('');

    // 默认选中第一个
    if (select.options.length > 0) select.selectedIndex = 0;

  } catch (err) {
    console.error('❌ 加载颜色失败:', err.message);
  }
}


function set_flexiselDemo1() {
    const carousel = document.getElementById("flexiselDemo1");
    if (!carousel) return;

    fetch("products.json")
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(products => {
            // 过滤出有效产品（含 brand、product、path）
            const validProducts = products.filter(p =>
                p && typeof p === "object" &&
                p.brand && p.product && p.path
            );

            // 随机打乱并取前 10 个不重复项（Fisher-Yates 洗牌）
            const shuffled = [...validProducts].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, 10);

            // 清空并生成 10 个 <li>
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

            // 初始化 flexisel（确保 jQuery 和插件已就绪）
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
 * 
 * @param {*} brandName 
 * @param {*} productName 
 * @returns null


async function set_showImg(brandName, productName){
  productList = await getProductInfo(brandName, productName);
  console.log("productList:"+productList);
  if (productList == null) {
    const Aimg = document.getElementById("showImg");
    Aimg.title="数据加载失败";
    console.log("数据加载失败");
    return;
  }
  document.getElementById("showThumbImg").src = productList.path;
  document.getElementById("showThumbImg").title = "";
  document.getElementById("showSourceImg").src = productList.path;
  document.getElementById("showSourceImg").title = "";
  document.getElementById("showSourceImg").alt ="图片加载失败";
  console.log("数据加载成功");
  console.log("缩略图")
  console.log("src:"+document.getElementById("showThumbImg").src);
  console.log("高清图")
  console.log("src:"+document.getElementById("showSourceImg").src);
  
  
}


// getProductInfo 函数保持不变
async function getProductInfo(brand, productName) {
  let response;
  try {
    response = await fetch('products.json'); 
    if (!response.ok) throw new Error("Network response was not ok");
    const products = await response.json();

    return products.find(product => product.brand === brand && product.product === productName);
  } catch (error) {
    console.error('Failed to fetch or process products data:', error);
    return null;
  }
}

 */

/**
 * 加载产品图片并初始化 Etalage 悬停放大功能
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

    // ✅ STEP 1: 彻底重置 #etalage DOM（核心！）
    const etalageEl = document.getElementById('etalage');
    if (!etalageEl) {
      console.error('❌ #etalage 元素不存在');
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

    // ✅ STEP 2: 设置图片 src
    const thumbImg = document.getElementById('showThumbImg');
    const sourceImg = document.getElementById('showSourceImg');
    const linkEl = document.getElementById('showImg');

    thumbImg.src = imgPath;
    sourceImg.src = imgPath;

    // ✅ STEP 3: 等待加载
    await Promise.all([
      new Promise(r => thumbImg.complete ? r() : thumbImg.onload = r),
      new Promise(r => sourceImg.complete ? r() : sourceImg.onload = r)
    ]);

    // ✅ STEP 4: 初始化 Etalage（带最强关闭策略）
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

      // ✅ STEP 5: 防御性清理（万无一失）
      $etalage.find('.etalage_small_thumbs, .etalage_icon, .etalage_hint').remove();
      console.log('✅ Etalage 初始化完成，小缩略图已彻底禁用');
    }

  } catch (err) {
    console.error('❌ set_showImg 异常:', err);
    const link = document.getElementById('showImg');
    if (link) link.title = '加载失败，请刷新重试';
  }
}
async function getProductInfo(brand, productName) {
  let response;
  try {
    response = await fetch('products.json'); 
    if (!response.ok) throw new Error("Network response was not ok");
    const products = await response.json();

    return products.find(product => product.brand === brand && product.product === productName);
  } catch (error) {
    console.error('Failed to fetch or process products data:', error);
    return null;
  }
}

