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
async function getUserInfo(key) {
  try {
    // 1️⃣ 加载 userDB.json
    const res = await fetch('userDB.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const users = await res.json();
    if (!Array.isArray(users)) {
      throw new Error('userDB.json must be an array');
    }

    // 2️⃣ 获取 localUserName（带容错）
    let localUserName = '';
    try {
      const stored = localStorage.getItem('localUserName');
      localUserName = typeof stored === 'string' ? stored.trim() : '';
    } catch (e) {
      console.warn('Failed to read localStorage.localUserName:', e);
    }

    // 3️⃣ 判断 key 是否“非空”（按你的定义：非 null/undefined/空串/纯空白）
    const isKeyNonEmpty =
      key != null &&
      typeof key === 'string' &&
      key.trim() !== '';

    if (isKeyNonEmpty) {
      // 🔑 key 非空 → 用 localUserName 查用户，再取 key 字段值
      if (!localUserName) return ''; // ✅ localUserName 为空 → 返回空字符串

      const user = users.find(u => u && typeof u === 'object' && u.userName === localUserName);
      if (!user) return null; // ✅ 找不到用户 → null

      // ✅ 安全取字段：支持嵌套？当前需求是扁平字段，直接访问
      // 若 key 是 "address.0.city" 可扩展，但当前按简单字段处理
      return user[key] !== undefined ? user[key] : null;
    } else {
      // 📌 key 为空 → 用 localUserName 查整个用户对象
      if (!localUserName) return null; // ✅ localUserName 无效 → null

      const user = users.find(u => u && typeof u === 'object' && u.userName === localUserName);
      return user || null; // ✅ 找不到 → null
    }

  } catch (err) {
    console.error('getUserInfo error:', err);
    throw err;
  }
}