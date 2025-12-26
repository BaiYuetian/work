
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
 * 根据品牌、产品名、颜色和尺寸获取商品价格
 * @param {string} brand 品牌
 * @param {string} productName 产品名
 * @param {string} color 颜色
 * @param {string} size 尺寸
 * @returns {Promise<number>} 价格
 */
async function getProductPrice(brand, productName, color, size) {
  try {
    const product = await getProductInfo(brand, productName);
    if (!product) {
      throw new Error(`未找到产品: ${brand} ${productName}`);
    }
    
    if (!product.inventoryList) {
      throw new Error(`产品 ${productName} 缺少库存信息`);
    }
    
    if (!product.inventoryList[color]) {
      throw new Error(`产品 ${productName} 没有颜色 ${color}`);
    }
    
    if (!product.inventoryList[color][size]) {
      throw new Error(`产品 ${productName} 颜色 ${color} 没有尺寸 ${size}`);
    }
    
    const price = product.inventoryList[color][size].price;
    // 确保返回的是数字而不是字符串
    const numericPrice = parseFloat(price);
    console.log("获取商品价格详情:", {brand, productName, color, size, price, numericPrice});
    return numericPrice;
  } catch (err) {
    console.error("获取产品价格失败:", err.message);
    return 0;
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
 * 获取所有品牌列表
 * @returns {Promise<string[]>} 品牌名称数组
 */
async function getAllBrands() {
    try {
        const res = await fetch('products.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const products = await res.json();
        if (!Array.isArray(products) || products.length === 0) return [];

        // 提取唯一品牌名并排序
        const brands = [...new Set(products.map(p => p.brand))]
            .filter(brand => brand && typeof brand === 'string' && brand.trim())
            .sort((a, b) => a.localeCompare(b, 'zh-CN'));
            
        return brands;
    } catch (err) {
        console.warn('⚠️ 获取品牌列表失败:', err.message);
        return [];
    }
}

/**
 * 随机抽取商品，仅返回 { brand, product } 对象数组
 * @param {number} count 数量
 * @returns {Promise<Array<{brand: string, product: string}>>}
 */
async function getRandomProductsBrandAndName(count = 1, brandName = null) {
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const products = await res.json();
    if (!Array.isArray(products) || products.length === 0) return [];

    let valid = products.filter(p => 
      p && typeof p === 'object' && 
      typeof p.brand === 'string' && 
      typeof p.product === 'string' &&
      p.brand.trim() && p.product.trim()
    );

    // 如果提供了品牌名称且不为空，则筛选特定品牌
    if (brandName && typeof brandName === 'string' && brandName.trim()) {
      const trimmedBrandName = brandName.trim();
      const filteredByBrand = valid.filter(p => p.brand === trimmedBrandName);
      // 只有当找到匹配的品牌时才使用筛选结果
      if (filteredByBrand.length > 0) {
        valid = filteredByBrand;
      }
    }

    if (valid.length === 0) return [];

    const shuffled = [...valid];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled
      .slice(0, Math.min(count, shuffled.length))
      .map(({ brand, product }) => ({ brand, product }));
  } catch (err) {
    console.warn('⚠️ 获取随机商品失败（仅 brand+product）:', err.message);
    return [];
  }
}