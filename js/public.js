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

function setBestsellers(){
  /**
   * </div>
						<div class="news">
							<a href="single.html?"><img class="img-responsive" src="images/si.jpg" title="name" alt=""></a>
						</div>
						<div class="news-in">
							<h6><a href="single.html">Product name here</a></h6>
							<p>Description Lorem ipsum </p>
							<ul>
								<li>Price: <span>$110</span> </li><b>|</b>
								<li>Country: <span>US</span></li>
							</ul>
						</div>
						<div class="clearfix">

						</div>
					</div>
   */
  const bestsellersDiv = document.getElementById('bestsellers');
  if (!bestsellersDiv) return;
  bestsellersDiv.innerHTML = '';
  bestsellersDiv.innerHTML += `
    <div class="news">
      <a href="single.html?"><img class="img-responsive" src="images/si.jpg" title="name" alt=""></a>
      <div class="news-in">
        <h6><a href="single.html">Product name here</a></h6>
        <p>Description Lorem ipsum </p>
        <ul>
          <li>Price: <span>10</span> </li><b>|</b>
          <li>Country: <span>US</span></li>
        </ul>
      </div>
      <div class="clearfix">
      </div>
    </div>

}