function showSuccessModal() {
  const urlParams = new URLSearchParams(window.location.search);
  const retURL = urlParams.get("retURL");

  let targetURL = "index.html";
  let buttonText = "返回首页";

  if (retURL) {
    try {
      const resolved = new URL(retURL, window.location.origin);
      if (resolved.origin === window.location.origin) {
        targetURL = resolved.href;
        buttonText = "返回上一页";
      }
    } catch (e) {
    }
  }
  const backdrop = document.createElement("div");
  backdrop.id = "successModalBackdrop";
  backdrop.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); z-index: 10000;
    display: flex; justify-content: center; align-items: center;
    margin: 0; padding: 0;
  `;

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
      ">${buttonText}</button>  
    </div>
  `;

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  modal.querySelector("#btnCancel").addEventListener("click", () => {
    document.body.removeChild(backdrop);
  });

  modal.querySelector("#btnGoBack").addEventListener("click", () => {
    window.location.href = targetURL;
  });

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