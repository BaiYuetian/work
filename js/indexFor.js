
document.addEventListener("DOMContentLoaded", function () { 

    set_ShowRandomProductAtnav();
    set_showBrandAtnav();

});

async function set_ShowRandomProductAtnav(){
     const ul = document.getElementById("showRandomProductAtnav");
  if (!ul) return;

  try {
    const res = await fetch("products.json");
    const products = await res.json();

    const selected = [...products]
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    selected.forEach(item => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `single.html?ProductName=${encodeURIComponent(item.product)}&Brand=${encodeURIComponent(item.brand)}`;
      a.textContent = item.product;
      li.appendChild(a);
      ul.appendChild(li);
    });

  } catch (err) {
    ul.innerHTML = `<li><em>加载失败：${err.message}</em></li>`;
  }
}
// ✅ set_showBrandAtnav.js（或直接写在 <script> 中）
async function set_showBrandAtnav() {
  const ul = document.getElementById("showBrandAtnav");
  if (!ul) return;

  try {
    // 🔁 1. 加载 products.json
    const res = await fetch("products.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const products = await res.json();

    // 🔍 2. 提取唯一品牌名（去重 + 排序，按字母升序更友好）
    const brands = [...new Set(products.map(p => p.brand))]
      .sort((a, b) => a.localeCompare(b, 'zh-CN')); // ✅ 中文/英文都友好排序

    // 🧩 3. 生成 <li><a>品牌</a></li>
    brands.forEach(brand => {
      const li = document.createElement("li");
      const a = document.createElement("a");

      a.textContent = brand;
      a.href = "javascript:void(0);"; 
      a.className = "brand-link";

      li.appendChild(a);
      ul.appendChild(li);
    });

  } catch (err) {
    console.error("❌ 加载品牌失败：", err);
    ul.innerHTML = `<li><em>暂无品牌</em></li>`;
  }
}
