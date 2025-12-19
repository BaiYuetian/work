

document.addEventListener("DOMContentLoaded", function(event) {
    // 原有代码：注册链接处理
    const link = document.getElementById('registerLink');
    if (link) {
        const currentUrl = window.location.href;
        const encodedUrl = encodeURIComponent(currentUrl);
        const baseUrl = link.getAttribute('href');
        const separator = baseUrl.includes('?') ? '&' : '?';
        link.href = `${baseUrl}${separator}retURL=${encodedUrl}`;
    }

    // 切换
    document.getElementById("useEmailLogIn").style.display = "none";
    const switchToUserBtn = document.getElementById("loginSwitchE");
    if (switchToUserBtn) {
        switchToUserBtn.addEventListener("click", function () {
            document.getElementById("useEmailLogIn").style.display = "none";
            document.getElementById("useUserNameLogIn").style.display = "block";
            document.querySelector("#useUserNameLogIn input[type='text']")?.focus();
        });
    }
    const switchToEmailBtn = document.getElementById("loginSwitchU");
    if (switchToEmailBtn) {
        switchToEmailBtn.addEventListener("click", function () {
            document.getElementById("useUserNameLogIn").style.display = "none";
            document.getElementById("useEmailLogIn").style.display = "block";
            document.querySelector("#useEmailLogIn input[type='email']")?.focus();
        });
    }


    const emailLoginForm = document.querySelector("#useEmailLogInForm");
    const userNameLoginForm = document.querySelector("#useUserNameLogInForm")
    
    console.log("准备登录")
    showLoginInfo = document.getElementById("showInfo");


    // 邮箱登录
    if (emailLoginForm) {
        emailLoginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            showLoginInfo= document.getElementById("showInfo");
            const email = document.querySelector("#useEmailLogIn input[type='email']").value.trim();
            const password = document.querySelector("#useEmailLogIn input[type='password']").value.trim();

            if (!email) {
                showLoginInfo.style.color = "red";
                showLoginInfo.innerText = "请输入邮箱";

                return false;
            }
            if (!password) {
                showLoginInfo.style.color = "red";
                showLoginInfo.innerText = "请输入密码";
                return false;
            } 

            const result = handleLogin("email", email, password);
            if (result) {
                showLoginInfo.style.color = "green";
                showLoginInfo.innerText = "登录成功，正在跳转...";
                setTimeout(() => {
                    redirectToRetUrlOrRoot();
                }, 1000);
            } 
        });
    }


    // 用户名登录
    if (userNameLoginForm) {
        userNameLoginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            
            const userName = document.querySelector("#useUserNameLogIn input[type='text']").value.trim();
            const password = document.querySelector("#useUserNameLogIn input[type='password']").value.trim();
            // 非空验证
            if (!userName) {
                showLoginInfo.style.color = "red";
                showLoginInfo.innerText = "请输入用户名";
                return false;
            }
            if (!password) {
                showLoginInfo.style.color = "red";
                showLoginInfo.innerText = "请输入密码";
                return false;
            }

            // 执行登录
            const result = handleLogin("username", userName, password);
            if (result) {
                showLoginInfo.style.color = "green";
                showLoginInfo.innerText = "登录成功，正在跳转...";
                setTimeout(() => {
                    redirectToRetUrlOrRoot();
                }, 1000);
            }
        });
    }
});





    /**
     * 处理登录逻辑
     * @param {string} type - 登录类型，可以是 "email" 或 "username"
     * @param {string} account - 用户账号（邮箱或用户名）
     * @param {string} password - 用户密码
     * @returns {boolean} - 登录成功返回 true，否则返回 false
     */
    function handleLogin(type, account, password) {
        console.log("handleLogin called with type:", type, "account:", account, "password:", password);
        // 获取已注册用户列表
        const registeredUsers = getRegisteredUsers();
        // 查找匹配的用户
        let matchedUser = null;
        showInfo = document.getElementById("showInfo");
        for (let user of registeredUsers) {
            if (
                (type === "email" && user.email.trim().toLowerCase() === account.trim().toLowerCase()) ||
                (type === "username" && user.userName.trim().toLowerCase() === account.trim().toLowerCase())
            ) {
                matchedUser = user;
                break;
            }
        }

        // 验证结果
        if (!matchedUser) {
            showInfo.style.color = "red";
            showInfo.innerText = "账号不存在";
            return false;
        }
        if (matchedUser.password !== password) {
            showInfo.style.color = "red";
            showInfo.innerText = "密码错误";
            return false;
        }
        // 登录成功：存储用户信息到localStorage（标记登录状态）
        localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));
        return true;
    }



    /**
 * 跳转到 retURL {account.js}
 * @returns {boolean} - 跳转成功返回 true，否则返回 false （如未指定 retURL，则跳转到根目录）
 */
function redirectToRetUrlOrRoot() {
  const urlParams = new URLSearchParams(window.location.search);
  const retURL = urlParams.get('retURL');

  if (!retURL) {
    window.location.href = '/';
    return false;
  }

  try {
    // 🔐 第一步：解码（处理双重编码，如 %2520 → %20 → 空格）
    const decoded = decodeURIComponent(retURL);

    // 🔐 第二步：解析为 URL 对象（自动补全 origin，支持相对路径）
    const target = new URL(decoded, window.location.origin);

    // 🔐 第三步：安全策略校验
    if (
      target.origin !== window.location.origin ||        // ❌ 跨源拒绝
      target.pathname === window.location.pathname ||     // ❌ 不允许跳回当前页（如 account.html → account.html）
      target.pathname === '/account.html' ||            // ❌ 额外防护：显式禁止跳回登录页
      target.pathname === '/login.html' ||
      target.pathname === '/register.html'
    ) {
      console.warn('[redirectToRetUrlOrRoot] Unsafe or self-referencing retURL ignored:', retURL);
      window.location.href = '/';
      return false;
    }

    // ✅ 全部通过 → 安全跳转
    window.location.href = target.href;
    return true;

  } catch (err) {
    console.warn('[redirectToRetUrlOrRoot] Invalid retURL format:', retURL, err);
    window.location.href = '/';
    return false;
  }
}