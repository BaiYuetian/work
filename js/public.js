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

document.addEventListener("DOMContentLoaded", function () {
  updateLocalTimeCN();         
  setInterval(updateLocalTimeCN, 1000);  
});
document.addEventListener("DOMContentLoaded",async function () { 
    await setBestsellers();
}); 


/** 
  设置畅销品列表
*/
async function setBestsellers() {
  console.log("✅ 设置畅销商品列表");

  const bestsellersDiv = document.getElementById('bestsellers');
  if (!bestsellersDiv) return;
  bestsellersDiv.innerHTML = '';

  // 1️⃣ 获取品牌+商品列表（来自缓存或随机）
  let items = JSON.parse(localStorage.getItem('localBestsellers') || '[]');
  if (!Array.isArray(items) || items.length === 0) {
    items = await getRandomProductsBrandAndName(3);
  }

  // 2️⃣ 🔑 关键：批量异步获取每个商品的 path（并行，不阻塞）
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      try {
        // ✅ 安全调用：即使 getProductInfoForKey 报错，也不中断整体
        const path = await getProductInfoForKey(item.brand, item.product, "path");
        return { ...item, path: path };
      } catch (err) {
        console.warn(`⚠️ 获取 ${item.brand} ${item.product} 的 path 失败：`, err.message);
        return { ...item, path: 'images/default.jpg' };
      }
    })
  );

  // 3️⃣ 渲染（此时 every item.path 都已就绪 ✅）
  enrichedItems.forEach(item => {
    bestsellersDiv.innerHTML += `
     <div class="latest-grid">
      <div class="news">
        <a href="single.html?productName=${encodeURIComponent(item.product)}&brand=${encodeURIComponent(item.brand)}">
          <img 
            class="img-responsive" 
            src="${item.path}" 
            alt="${item.brand} ${item.product}"
          >
        </a>
        <div class="news-in">
          <h6>
            <a href="single.html?productName=${encodeURIComponent(item.product)}&brand=${encodeURIComponent(item.brand)}">${item.product}</a>
          </h6>
          <p>${item.brand}</p>
				</div>
				<div class="clearfix">
        </div>
			</div>
    </div>
    `;

    /**
     * <div class="latest-grid">
						<div class="news">
							<a href="single.html">
                <img class="img-responsive" src="images/si1.jpg" title="name" alt="">
              </a>
						</div>
						<div class="news-in">
							<h6><a href="single.html">Product name here</a></h6><!-- 畅销榜商品名 -->
							<p>Description Lorem ipsum </p>
							<ul>
								<li>Price: <span>$110</span> </li><b>|</b>
								<li>Country: <span>US</span></li>
							</ul>
						</div>
					<div class="clearfix"> </div>
				</div>
     */
  });

  console.log(` 畅销榜完成:${enrichedItems.length}`);
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

/**
 * 显示品牌列表
 */
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
    el.href = "user.html";
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
      return user; // ✅ 直接返回用户对象，不是 {user}
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