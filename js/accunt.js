document.addEventListener("DOMContentLoaded", function(event) {


const link = document.getElementById('registerLink');
    if (link) {
      const currentUrl = window.location.href;
      const encodedUrl = encodeURIComponent(currentUrl);
      const baseUrl = link.getAttribute('href');
      const separator = baseUrl.includes('?') ? '&' : '?';
      link.href = `${baseUrl}${separator}retURL=${encodedUrl}`;
    }


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


});


addEventListener("submit",function(event){
    event.preventDefault();
    const registeredUser = getRegisteredUsers();  
    if(document.querySelector("#useEmailLogIn input[type='email']")){
        //邮箱登录
        var email = document.querySelector("#useEmailLogIn input[type='email']").value;
        var passWd = document.querySelector("#useEmailLogIn input[type='password']").value;
        if(isEmailTaken(email)){
          const user = getUserByMail(email);
          if(user == null){
            this.alert("error")
          }else{
            this.alert("user"+user+"type is"+typeof(user));

          }
         
          }
          this.alert("emd");
        }
    } 
);

function logout(){
    
}