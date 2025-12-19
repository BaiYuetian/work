
/**
 * 
 * @param {*} brand 
 * @param {*} productName 
 * @returns 
 */
async function getProductInfoForKey(brand, productName,key) {
 try {
    const product = await getProductInfo(brand, productName);
    if (!(key in product)) {
      throw new Error(`产品没有字段: ${key}`);
    }

    return product[key];  

  } catch (err) {
    console.error("获取产品信息失败:", err.message);
    return null; 
  }
}
/**
 * 
 * @param {*} brand 
 * @param {*} productName 
 * @returns 
 */
async function getProductInfo(brand, productName) {
  let response;
  try {
    response = await fetch('products.json'); 
    if (!response.ok) throw new Error("Network response was not ok");
    const products = await response.json();
    re = products.find(product => product.brand === brand && product.product === productName)
    if (!re) {
      console.warn(`未找到产品: 品牌=${brand}, 产品名=${productName},结果为空。`);
    }
    return re;
  } catch (error) {
    console.error('数据加载失败:', error);
    return null;
  }
}




/**
 * 随机抽取商品，仅返回 { brand, product } 对象数组
 * @param {number} count - 抽取数量（默认 1）
 * @returns {Promise<Array<{brand: string, product: string}>>}
 */
async function getRandomProductsBrandAndName(count = 1) {
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const products = await res.json();
    if (!Array.isArray(products) || products.length === 0) return [];

    // ✅ 过滤：只保留有 brand 和 product 字段的合法商品
    const valid = products.filter(p => 
      p && typeof p === 'object' && 
      typeof p.brand === 'string' && 
      typeof p.product === 'string' &&
      p.brand.trim() && p.product.trim()
    );

    if (valid.length === 0) return [];

    // ✅ Fisher-Yates 洗牌 + 截取
    const shuffled = [...valid];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // ✅ 只取 brand & product，返回纯净对象数组
    return shuffled
      .slice(0, Math.min(count, shuffled.length))
      .map(({ brand, product }) => ({ brand, product }));
  } catch (err) {
    console.warn('⚠️ 获取随机商品失败（仅 brand+product）:', err.message);
    return [];
  }
}