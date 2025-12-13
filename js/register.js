function showSuccessModal() {
  // 🔍 解析 retURL
  const urlParams = new URLSearchParams(window.location.search);
  const retURL = urlParams.get("retURL");

  // 🎯 确定跳转目标和按钮文案
  let targetURL = "index.html"; // 默认首页
  let buttonText = "返回首页";

  if (retURL) {
    try {
      // ✅ 安全校验：只允许同源或相对路径（拒绝跨域/协议外跳转）
      const resolved = new URL(retURL, window.location.origin);
      // 允许相对路径（如 /dashboard）和同源绝对路径（如 https://yoursite.com/profile）
      if (resolved.origin === window.location.origin) {
        targetURL = resolved.href;
        buttonText = "返回上一页";
      }
    } catch (e) {
    //  console.warn("retURL 格式无效，将使用默认首页", e);
    }
  }

  // 🧱 创建遮罩层
  const backdrop = document.createElement("div");
  backdrop.id = "successModalBackdrop";
  backdrop.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); z-index: 10000;
    display: flex; justify-content: center; align-items: center;
    margin: 0; padding: 0;
  `;

  // 📦 创建弹窗内容
  const modal = document.createElement("div");
  modal.style.cssText = `
    background: white; border-radius: 8px; padding: 28px;
    text-align: center; box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    max-width: 420px; width: 90%;
  `;
  modal.innerHTML = `
    <h3 style="margin: 0 0 16px 0; color: #000000;">注册成功！</h3>
    <p style="color: #555; margin: 0 0 24px 0;"></p>
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button id="btnCancel" style="
        padding: 10px 24px;
        background: #f1f3f4;
        border: 1px solid #d0d4d8;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      ">取消</button>
      <button id="btnGoBack" style="
        padding: 10px 24px;
        background: #f02b63;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      ">${buttonText}</button> <!-- ✅ 动态按钮文字 -->
    </div>
  `;

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  // 🖱️ 绑定事件
  modal.querySelector("#btnCancel").addEventListener("click", () => {
    document.body.removeChild(backdrop);
  });

  modal.querySelector("#btnGoBack").addEventListener("click", () => {
    window.location.href = targetURL;
  });

  // ⌨️ ESC 关闭支持
  const handleEsc = (e) => {
    if (e.key === "Escape") {
      document.body.removeChild(backdrop);
      document.removeEventListener("keydown", handleEsc);
    }
  };
  document.addEventListener("keydown", handleEsc);
}
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
  if (!email || typeof email !== 'string') {
    return false;
  }
  const target = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(target)) {
    return false;
  }
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

addEventListener("submit",function(event){
    event.preventDefault();

    var usName = document.getElementById("getUserNameIPT").value;
    var email = document.getElementById("getEmailIPT").value;
    var passWd = document.getElementById("getPassWordIPT").value;
    var passWdAg= document.getElementById("getPassWordAgainIPT").value;
    var showInfo = document.getElementById("showInfo");
    /*
    例如判断文本框是否为空，用户名至少6位且首字母为字母等。
    
    */
    //

    registeredUsersList = getRegisteredUsers();

    // alert(typeof(registeredUsersList))

   if(usName.length < 6 || !/^[a-zA-Z]$/.test(usName.charAt(0))){
      showInfo.innerText=("用户名至少6位且首字母为字母");
      document.getElementById("getUserNameIPT").focus();
      return;
    }
    if(passWd != passWdAg){
        document.getElementById("getPassWordAgainIPT").focus();
        showInfo.innerText = "俩次密码不一致";
        return;
    }
    if(passWdAg.length<6){
        document.getElementById("getPassWordIPT").focus();
        showInfo.innerText = "密码过短";
        return;
    }
    if(isUserNameTaken(usName)){
        document.getElementById("getUserNameIPT").focus();
        showInfo.innerText = "用户名已被使用";
        return;
    }
    if(isEmailTaken(email)){
        document.getElementById("getEmailIPT").focus();
        showInfo.innerText = email + "邮箱已被使用";
        return;
    }

    showInfo.innerText = "" ;
    addRegisteredUser(usName,passWd,email);
    showSuccessModal();

})