document.addEventListener("DOMContentLoaded", function () { 

    
    const urlParams = new URLSearchParams(window.location.search);

    const productName = urlParams.get('productName'); 
    const brand = urlParams.get('brand');
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


async function set_showImg(brandName, productName){
  productList = getProductInfo(brandName, productName);
  if (productList == null) {
    const Aimg = document.getElementById("showImg");
    Aimg.title="数据加载失败";
    console.log("数据加载失败");
    return;
  }
  img =document.querySelectorAll("#showImg img");
  for (let i = 0; i < img.length; i++) {
    img[i].src = productList.path;
    img[i].title = productList.product;
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

