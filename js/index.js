document.addEventListener("DOMContentLoaded", async function() {
    // 获取所有品牌并选择一个随机品牌用于视频展示
    const allBrands = await getAllBrands();
    const randomBrand = (allBrands.length > 0 
        ? allBrands[Math.floor(Math.random() * allBrands.length)]
        : "HUAWEI").toUpperCase();

    document.getElementById("videoPlayer").src = `video/${randomBrand}.mp4`;
    document.querySelector("video").load();
});

async function addProducts() {
    const div = document.getElementById("mainBody");

    // 获取随机产品（不基于特定品牌）
    const ps = await getRandomProductsBrandAndName(3, null);

    if (!ps || ps.length === 0) {
        const notFoundUrl = `404.html?text=${encodeURIComponent(`无法加载产品`)}`;
        window.location.replace(notFoundUrl);
        return;
    }

    let rowHTML = '<div class="row">';
    
    for (let i = 0; i < Math.min(3, ps.length); i++) {
        const p = ps[i];
        const { brand, product } = p;
        const brandName = brand;
        const productName = product;

        const path = await getProductInfoForKey(brandName, productName, "path");

        rowHTML += `
        <div class="col-md-4 shirt">
            <div class="bottom-grid-top">
            <a href="single.html?productName=${encodeURIComponent(productName)}&brandName=${encodeURIComponent(brandName)}">
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

    rowHTML += '</div>'; 
    div.innerHTML += rowHTML;
}

document.addEventListener("DOMContentLoaded", async() => {
    // 页面加载时添加第一批产品
    await addProducts();
});

document.addEventListener("DOMContentLoaded", () => {
    // 设置无限滚动观察器
    const sentinel = document.getElementById('sentinel');

    const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log('✅ 页面即将/已经滑到底部（哨兵进入视口）');
            // 添加更多随机产品
            addProducts();
        }
        });
    },
    {
        threshold: 0.01,
    }
    );

    observer.observe(sentinel);
    console.log(' 监听已启动');
});