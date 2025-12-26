document.addEventListener("DOMContentLoaded", async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const brandName =( urlParams.get('brandName')||
    urlParams.get('BrandName')||
    urlParams.get('brand')||null).toUpperCase();

    const allBrands = await getAllBrands();
    
    if (brandName && !allBrands.includes(brandName)) {
        const notFoundUrl = `404.html?text=${encodeURIComponent(`找不到品牌${brandName}的产品`)}`;
        window.location.replace(notFoundUrl);
        return;
    }
    const randomBrand = (allBrands.length > 0 
        ? (brandName || allBrands[Math.floor(Math.random() * allBrands.length)])
        : "HUAWEI").toUpperCase();

    document.getElementById("videoPlayer").src = `video/${randomBrand}.mp4`;
    document.querySelector("video").load();
});

async function addProducts(brandNameParam) {
    const div = document.getElementById("mainBody");

    const urlParams = new URLSearchParams(window.location.search);
    const brandNameFromQuery = urlParams.get('brandName');

    const finalBrandName = brandNameFromQuery || brandNameParam || null;

    let rowHTML = '<div class="row">';
    const ps = await getRandomProductsBrandAndName(3, finalBrandName);

    if (!ps || ps.length === 0) {
        const notFoundUrl = `404.html?text=${encodeURIComponent(`找不到品牌${finalBrandName || '未知'}的产品`)}`;
        window.location.replace(notFoundUrl);
        return;
    }

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
    const urlParams = new URLSearchParams(window.location.search);
    const brandName = urlParams.get('brandName');
    
    await addProducts(brandName);
} );

document.addEventListener("DOMContentLoaded", () => {
    const sentinel = document.getElementById('sentinel');

    const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log('✅ 页面即将/已经滑到底部（哨兵进入视口）');
            const urlParams = new URLSearchParams(window.location.search);
            const brandName = urlParams.get('brandName');
            
            addProducts(brandName);
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