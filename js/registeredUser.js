  function getRegisteredUsers() {
    const saved = localStorage.getItem("RegisteredUsersList");
    try {
      return Array.isArray(JSON.parse(saved)) ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  function addRegisteredUser(userName, password, email) {
    const users = getRegisteredUsers();
    users.push({ userName, email, password });
    localStorage.setItem("RegisteredUsersList", JSON.stringify(users));
  }

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
