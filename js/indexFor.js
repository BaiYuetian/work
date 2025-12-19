document.addEventListener("DOMContentLoaded", async function() {
    const res = await fetch("products.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const products = await res.json();

    // 🔍 2. 提取唯一品牌名（去重 + 排序，按字母升序更友好）
    const brands = [...new Set(products.map(p => p.brand))]
      .sort((a, b) => a.localeCompare(b, 'zh-CN')); // ✅ 中文/英文都友好排序
      const randomBrand = (brands.length > 0 
  ? brands[Math.floor(Math.random() * brands.length)] 
  : "HUAWEI").toUpperCase();
    document.getElementById("videoPlayer").src=`video/${randomBrand}.mp4`;
    document.querySelector("video").load();
});
async function addProducts() {
  const div = document.getElementById("mainBody");

  // ✅ 1. 构建一整行：.row 包裹 3 个 .col-md-4
  let rowHTML = '<div class="row">';
  ps = await getRandomProductsBrandAndName(3);  

  for (let i = 0; i < 3; i++) {
    let p = ps[i];

// ✅ 正确（用实际字段名）：
const { brand, product } = p; // ← 就是它！
brandName = brand;
productName = product;
  //  alert(brandName + " " + productName);
    const path =await getProductInfoForKey(brandName, productName,"path");
    rowHTML += `
      <div class="col-md-4 shirt">
        <div class="bottom-grid-top">
          <a href="single.html?productName=${encodeURIComponent(productName)}&brandName=${encodeURIComponent(brandName)}"">
            <img class="img-responsive" src="${path}" alt="${productName}">
            <div class="pre">
              <p>${brandName}</p>
              <span>${productName}</span> 
              <div class="clearfix"></div>
            </div>
          </a>
        </div>
      </div>
    `;
  }

  rowHTML += '</div>'; // ✅ 关闭 .row

  // ✅ 2. 一次性插入（避免多次 innerHTML 覆盖）
  div.innerHTML += rowHTML;
}

document.addEventListener("DOMContentLoaded", async() => {
    await addProducts();
} );

document.addEventListener("DOMContentLoaded", () => {

const sentinel = document.getElementById('sentinel');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log('✅ 页面即将/已经滑到底部（哨兵进入视口）');
        // 👇 执行你的逻辑：加载更多、显示提示、触发统计等
     //   loadMoreItems();
       addProducts();
        // ✅ 可选：停止监听（只触发一次），或继续监听（无限滚动）
        // observer.unobserve(sentinel);
      }
    });
  },
  {
    threshold: 0.01, // 当 1% 进入视口即触发（≈“即将到底”）
    // rootMargin: '0px 0px -50px 0px' // 👈 更精准！让哨兵提前 50px 被认为“将进入”
  }
);

observer.observe(sentinel);
console.log('✅ 监听已启动');
});