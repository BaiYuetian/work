function updateLocalTimeCN() {

  const now = new Date();
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  const year   = now.getFullYear();
  const month  = String(now.getMonth() + 1).padStart(2, '0');  
  const day    = String(now.getDate()).padStart(2, '0');      
  const hour   = String(now.getHours()).padStart(2, '0');      
  const minute = String(now.getMinutes()).padStart(2, '0');   
  const second = String(now.getSeconds()).padStart(2, '0');    
  const week   = weekdays[now.getDay()];

  const formatted = `${year}年${month}月${day}日 ${hour}:${minute}:${second} ${week}`;
  document.getElementById('showTime').textContent = formatted;
  /**
   * 待
   * yyyy-MM-dd hh:mm:ss week
   * yyyy/MM/dd hh:mm:ss week
   * yyyy.MM.dd hh:mm:ss week
   * yyyy年MM月dd日 hh:mm:ss week
   * 
   * yyyy-MM-dd Ap hh:mm:ss week
   * yyyy/MM/dd Ap hh:mm:ss week
   * yyyy.MM.dd Ap hh:mm:ss week
   * yyyy年MM月dd日 Ap hh:mm:ss week
   * 
   * yyyy-MM-dd APC hh:mm:ss week
   * yyyy/MM/dd APC hh:mm:ss week
   * yyyy.MM.dd APC hh:mm:ss week
   * yyyy年MM月dd日 APC hh:mm:ss week
   * 
   * yyyy-MM-dd hh:mm:ss 
   * yyyy/MM/dd hh:mm:ss
   * yyyy.MM.dd hh:mm:ss 
   * yyyy年MM月dd日 hh:mm:ss
   * 
   * yyyy-MM-dd Ap hh:mm:ss 
   * yyyy/MM/dd Ap hh:mm:ss 
   * yyyy.MM.dd Ap hh:mm:ss 
   * yyyy年MM月dd日 Ap hh:mm:ss
   * 
   * yyyy-MM-dd APC hh:mm:ss
   * yyyy/MM/dd APC hh:mm:ss
   * yyyy.MM.dd APC hh:mm:ss
   * yyyy年MM月dd日 APC hh:mm:ss 
   * 
   * apc hh:mm:ss 
   * ap hh:mm:ss 
   * Apc hh:mm:ss
   * Ap hh:mm:ss
   * APC hh:mm:ss
   * AP hh:mm:ss
   */
}

document.addEventListener("DOMContentLoaded", async function () {
  updateLocalTimeCN();
  setInterval(updateLocalTimeCN, 1000);

  setTimeout(async function () {
    try {
      await setBestsellers();
    } catch (err) {
      console.error('畅销榜初始化失败:', err);
    }
  }, 500);

  set_ShowRandomProductAtnav();
  set_showBrandAtnav();

  const el = document.getElementById("MY");
  if (el) {
    el.innerText = "登录";
    el.style.color = "#f02b63";

    if (/\/account\.html($|\?|#)/.test(window.location.href)) {
      el.removeAttribute("href");
      el.style.cursor = "default";
    } else {
      const url = new URL(window.location.href);
      let ret = url.searchParams.get('retURL') || window.location.href;
      
      try {
        const p = new URL(ret, location.origin);
        if (p.pathname === '/account.html') ret = '/';
      } catch (e) {}

      el.href = `account.html?retURL=${encodeURIComponent(ret)}`;
    }
    if(isUserLoggedIn()){
      el.textContent = '我';
      el.style.color="#ABABAB";
      el.href = "user.html";
    }
  }
});


/** 
  设置畅销品列表
*/
async function setBestsellers() {
  console.log("✅ 开始设置畅销商品列表");

  const bestsellersDiv = document.getElementById('bestsellers');
  if (!bestsellersDiv) {
    console.warn('⚠️ #bestsellers 元素不存在，跳过渲染');
    return;
  }

  let items = JSON.parse(localStorage.getItem('localBestsellers') || '[]');
  console.log("从localStorage获取的商品列表:", items);
  
  if (!Array.isArray(items) || items.length === 0) {
    console.log("localStorage中没有商品列表，正在随机获取...");
    items = await getRandomProductsBrandAndName(4);
    console.log("随机获取到的商品列表:", items);
    
    if (items.length > 0) {
      try {
        localStorage.setItem('localBestsellers', JSON.stringify(items));
        console.log(`💾 已缓存 ${items.length} 个畅销商品`);
      } catch (e) {
        console.warn('⚠️ localStorage 写入失败（隐私模式/已满）');
      }
    }
  }

  console.log("开始获取商品详细信息...");
  const enrichedItemsPromises = items.map(async (item) => {
    try {
      // 再次检查 bestsellersDiv 是否存在，以防在异步过程中被移除
      if (!document.getElementById('bestsellers')) {
        console.warn('⚠️ #bestsellers 元素在获取商品信息时已不存在');
        return null;
      }

      console.log("正在获取商品信息:", item.brand, item.product);
      

      const productInfo = await getProductInfo(item.brand, item.product);
      if (productInfo) {
        return { 
          ...item, 
          path: productInfo.path || 'images/default.jpg'
        };
      } else {
        console.warn(`⚠️ 未找到 ${item.brand} ${item.product} 的信息`);
        return { ...item, path: 'images/default.jpg' };
      }
    } catch (err) {
      console.warn(`⚠️ 获取 ${item.brand} ${item.product} 的信息时发生严重错误：`, err);
      return { ...item, path: 'images/default.jpg' };
    }
  });

  const enrichedItems = (await Promise.all(enrichedItemsPromises)).filter(item => item !== null);

  bestsellersDiv.innerHTML = '';
  console.log("准备渲染的商品:", enrichedItems);
  
  if (enrichedItems.length === 0) {
    bestsellersDiv.innerHTML = '<div class="no-products">暂无畅销商品</div>';
    console.log('🎉 畅销榜渲染完成（无商品）');
    return;
  }
  
  enrichedItems.forEach((item, i) => {
    if (!item || !item.brand || !item.product) {
      console.warn("跳过无效商品项:", item);
      return;
    }
    
    bestsellersDiv.innerHTML += `
      <div class="latest-grid">
        <div class="news">
          <a href="single.html?productName=${encodeURIComponent(item.product)}&brand=${encodeURIComponent(item.brand)}">
            <img class="img-responsive" src="${item.path}" alt="${item.brand} ${item.product}">
          </a>
        </div>
        <div class="news-in">
          <h6><a href="single.html?productName=${encodeURIComponent(item.product)}&brand=${encodeURIComponent(item.brand)}">${item.product}</a></h6>
          <p>${item.brand}</p>
        </div>
        <div class="clearfix"></div>
      </div>
    `;
  });

  console.log(`🎉 畅销榜渲染完成（${enrichedItems.length} 项）`);
}

/**
 * 初始化本地畅销商品列表
 */
function init_localBestsellers() {  
  try{
  index = 0;
  re=[];
  for (let i = 0; i < 100; i++) { 
    tempList = getRandomProductsBrandAndName();
    console.log(tempList);
    if (!tempList || tempList.length === 0) {
      continue;
    }
    baendNum = tempList[0];
    productName = tempList[1];
    if (!baendNum || !productName) {
      console.log("baendNum 或 productName is null");
      continue;
      
    }
    re[index] = { brandName: baendNum, productName: productName}
    if (index >= 7) {
      break;
    }
    index+=1;
  }

  localStorage.setItem("localBestsellers", JSON.stringify({ brand: baendNum, product: productName }));
  return true;
  }catch (error) {
    console.error("初始化本地畅销商品列表时出错：", error);
    return false;
  }
}




document.addEventListener("DOMContentLoaded", function () { 

    set_ShowRandomProductAtnav();
    // set_showBrandAtnav(); // 已在主DOMContentLoaded事件监听器中调用，避免重复执行

});
// 标题 商品
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

/**
 * 显示品牌列表
 */
async function set_showBrandAtnav() {
  const ul = document.getElementById("showBrandAtnav");
  if (!ul) return;

  try {
    ul.innerHTML = "";

    const res = await fetch("products.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const products = await res.json();

    const brands = [...new Set(products.map(p => p.brand))]
      .sort((a, b) => a.localeCompare(b, 'zh-CN')); 

    brands.forEach(brand => {
      const li = document.createElement("li");
      const a = document.createElement("a");

      a.textContent = brand;
      a.href = `store.html?brandName=${brand}`; 
      a.className = "brand-link";

      li.appendChild(a);
      ul.appendChild(li);
    });

  } catch (err) {
    console.error("❌ 加载品牌失败：", err);
    ul.innerHTML = `<li><em>暂无品牌</em></li>`;
  }
}


/**
 * 设置"我"
 */
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("MY");
  if (!el ) return;

  el.innerText = "登录";
  el.style.color = "#f02b63";

  if (/\/account\.html($|\?|#)/.test(window.location.href)) {
    el.removeAttribute("href");
    el.style.cursor = "default";
  } else {
    const url = new URL(window.location.href);
    let ret = url.searchParams.get('retURL') || window.location.href;
    
    try {
      const p = new URL(ret, location.origin);
      if (p.pathname === '/account.html') ret = '/';
    } catch (e) {}

    el.href = `account.html?retURL=${encodeURIComponent(ret)}`;
  }
  if(isUserLoggedIn()){
    el.textContent = '我';
    el.style.color="#ABABAB";
    el.href = "cart.html#username";
  }
});







///////////////////////////////////////////////
// 用户信息操作


/**
 * 获取已注册用户列表
 * @returns {Array} 已注册用户列表
 */
function getRegisteredUsers() {
    const saved = localStorage.getItem("RegisteredUsersList");
    try {
      return Array.isArray(JSON.parse(saved)) ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }
  /**
   * 添加用户至localStorage
   * @param {string} userName 用户名  
   * @param {string} password 密码
   * @param {string} email 邮箱
   */ 
  function addRegisteredUser(userName, password, email) {
    const users = getRegisteredUsers();
    users.push({ userName, email, password });
    localStorage.setItem("RegisteredUsersList", JSON.stringify(users));
  }

  /**
   * 用户名是否被注册
   * @param {string} userName 用户名
   * @returns {boolean} 是否被注册
   */
  function isUserNameTaken(userName) {
    const registeredUsersList=getRegisteredUsers();
    if (!userName || typeof userName !== 'string') {
      return false;
    }
    const target = userName.trim().toLowerCase();
    for (let i = 0; i < registeredUsersList.length; i++) {
      const user = registeredUsersList[i];
      let u = "";
      if (user && typeof user === 'object' && user.userName != null) {
        u = String(user.userName).trim().toLowerCase();
      }
      if (u === target) {
        return true;
      }
    }
    return false;
  }
/**
 * 邮箱是否被注册
 * @param {string} email 邮箱
 * @returns {boolean} 是否被注册
 */
  function isEmailTaken(email) {
    const registeredUsersList=getRegisteredUsers();
    if (!email || typeof email !== 'string') {
      return false;
    }
    const target = email.trim().toLowerCase();
    for (let i = 0; i < registeredUsersList.length; i++) {
      const user = registeredUsersList[i];
      let e = "";
      if (user && typeof user === 'object' && user.email != null) {
        e = String(user.email).trim().toLowerCase();
      }
      if (e === target) {
        return true;
      }
    }
    return false;
  }

  /**
   * 通过邮箱获取用户信息
   * @param {string} email 邮箱
   * @returns {object} 用户信息
   */
function getUserByMail(email) {
  // ✅ 1. 参数校验
  if (!email || typeof email !== 'string') {
    return null;
  }

  const target = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(target)) {
    return null;
  }

  // ✅ 2. 只调用一次，避免重复开销
  const users = getRegisteredUsers();
  if (!Array.isArray(users)) {
    return null; // 防御：确保是数组
  }

  // ✅ 3. 遍历查找（可选：用 find 替代 for 循环，更现代）
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    // ✅ 4. 严格校验 user.email 是非空字符串
    if (
      user &&
      typeof user === 'object' &&
      typeof user.email === 'string' &&
      user.email.trim().toLowerCase() === target
    ) {
      return user; 
    }
  }

  return null;  
}

/**
 * 是否有用户登录 */
function isUserLoggedIn() {
  const loggedInUser = localStorage.getItem("loggedInUser");
  return loggedInUser !== null;
}


document.addEventListener("DOMContentLoaded", function () { 
  document.querySelector("footer").innerHTML= `
		<hr>
			<p style="text-align: center;color: #4cb1ca;">24150211 24150212 24150221</p>
			<br>
			<p style="text-align: center;color: #4cb1ca;">Copyright &copy; 2025.Company name All rights reserved.More Templates <a href="http://www.cssmoban.com/" target="_blank" title="模板之家"  style="text-align: center;color: #f02b63;">模板之家</a> - Collect from <a  style="text-align: center;color: #4cb1ca;" href="http://www.cssmoban.com/" title="网页模板" target="_blank">网页模板</a></p>
			
			<a href="#home" class="scroll to-Top" >  GO TO TOP!</a>
		<div class="clearfix"> </div>`
});