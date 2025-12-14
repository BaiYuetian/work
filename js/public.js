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
}

document.addEventListener("DOMContentLoaded", function () {
  updateLocalTimeCN();         
  setInterval(updateLocalTimeCN, 1000);  
});