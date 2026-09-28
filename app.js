const DEFAULT={settings:{heroTitle:"YOUR GAMING<br><span>WORLD STARTS HERE.</span>",heroText:"Games, Gift Cards, Top Up and digital gaming products — everything you need in one place.",promoTitle:"Level Up Your Game",promoText:"Discover new products, special offers and digital gaming essentials.",bg:"assets/yaargamex-bg.svg",sliderImages:["","","",""]},categories:[{id:1,name:"Games",icon:"🎮",desc:"Popular digital games"},{id:2,name:"Gift Cards",icon:"🎁",desc:"Top gaming gift cards"},{id:3,name:"Top Up",icon:"⚡",desc:"Fast game credits"},{id:4,name:"Offers",icon:"🔥",desc:"Special deals"}],products:[{id:1,name:"Gaming Product",price:"9.99",category:"Games",desc:"Digital Delivery",image:""},{id:2,name:"Gift Card",price:"19.99",category:"Gift Cards",desc:"Instant Delivery",image:""},{id:3,name:"Game Top Up",price:"14.99",category:"Top Up",desc:"Fast & Secure",image:""}]};
function data(){let d=localStorage.getItem("yaargamex_data");if(!d){localStorage.setItem("yaargamex_data",JSON.stringify(DEFAULT));return structuredClone(DEFAULT)}return JSON.parse(d)}
function renderStore(){let d=data();document.getElementById("categoryGrid").innerHTML=d.categories.map(c=>`<article class="cat" onclick="openCategory(${c.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openCategory(${c.id})}" tabindex="0" role="button"><div class="cat-icon">${c.icon||"🎮"}</div><h3>${esc(c.name)}</h3><p>${esc(c.desc||"")}</p><span class="category-link">View Category →</span></article>`).join("");let featured=d.products.filter(p=>p.featured);if(!featured.length) featured=d.products;document.getElementById("productGrid").innerHTML=featured.map(p=>`<article class="product" onclick="openProduct(${p.id})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openProduct(${p.id})}" tabindex="0" role="button"><div class="product-img">${p.image?`<img src="${p.image}" alt="${esc(p.name)}" loading="lazy">`:"GAME"}</div><h3>${esc(p.name)}</h3><p>${esc(p.desc||"")}</p><div class="price"><b>$${esc(p.price)}</b><span>View Details →</span></div></article>`).join("");let s=d.settings;document.getElementById("heroTitle").innerHTML=s.heroTitle;document.getElementById("heroText").textContent=s.heroText;document.getElementById("promoTitle").textContent=s.promoTitle;document.getElementById("promoText").textContent=s.promoText;document.getElementById("hero").style.backgroundImage=`url("${s.bg}")`}
function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
document.addEventListener("DOMContentLoaded",()=>{renderStore();renderSlider();const s=document.getElementById("siteSearch");if(s)s.addEventListener("input",()=>searchProducts(s.value));});

let sliderIndex=0,sliderTimer=null,sliderCount=0;
function sliderSlots(d){const arr=(d.settings.sliderImages||[]).slice(0,4);while(arr.length<4)arr.push("");return arr}
function renderSlider(){
 const track=document.getElementById("sliderTrack");if(!track)return;
 const d=data(),slots=sliderSlots(d);
 sliderCount=slots.length;
 track.innerHTML=slots.map((url,i)=>`<div class="slide">${url?`<img src="${url}" alt="Highlight ${i+1}" loading="lazy">`:`<div class="slide-placeholder">🖼</div>`}</div>`).join("");
 document.getElementById("sliderDots").innerHTML=slots.map((_,i)=>`<button class="dot${i===0?" active":""}" type="button" data-i="${i}" aria-label="Go to slide ${i+1}"></button>`).join("");
 sliderIndex=0;setSliderPosition(false);
 document.querySelectorAll("#sliderDots .dot").forEach(dot=>dot.onclick=()=>goToSlide(Number(dot.dataset.i)));
 const prev=document.getElementById("sliderPrev"),next=document.getElementById("sliderNext");
 if(prev)prev.onclick=()=>goToSlide((sliderIndex-1+sliderCount)%sliderCount);
 if(next)next.onclick=()=>goToSlide((sliderIndex+1)%sliderCount);
 initSliderSwipe();
 startSliderAuto();
}
function setSliderPosition(animate=true){
 const track=document.getElementById("sliderTrack");if(!track)return;
 track.style.transition=animate?"transform .5s ease":"none";
 track.style.transform=`translateX(-${sliderIndex*100}%)`;
 document.querySelectorAll("#sliderDots .dot").forEach((dot,i)=>dot.classList.toggle("active",i===sliderIndex));
}
function goToSlide(i){sliderIndex=(i+sliderCount)%sliderCount;setSliderPosition(true);restartSliderAuto()}
function startSliderAuto(){stopSliderAuto();if(sliderCount>1)sliderTimer=setInterval(()=>{sliderIndex=(sliderIndex+1)%sliderCount;setSliderPosition(true)},4000)}
function stopSliderAuto(){if(sliderTimer){clearInterval(sliderTimer);sliderTimer=null}}
function restartSliderAuto(){stopSliderAuto();startSliderAuto()}
function initSliderSwipe(){
 const wrap=document.getElementById("imageSlider");if(!wrap||wrap.dataset.swipeBound)return;
 wrap.dataset.swipeBound="1";
 let startX=0,startY=0,dx=0,dy=0,dragging=false;
 wrap.addEventListener("touchstart",e=>{const t=e.touches[0];startX=t.clientX;startY=t.clientY;dx=0;dy=0;dragging=true;stopSliderAuto()},{passive:true});
 wrap.addEventListener("touchmove",e=>{if(!dragging)return;const t=e.touches[0];dx=t.clientX-startX;dy=t.clientY-startY},{passive:true});
 wrap.addEventListener("touchend",()=>{
  if(!dragging)return;dragging=false;
  if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){if(dx<0)goToSlide(sliderIndex+1);else goToSlide(sliderIndex-1)}else restartSliderAuto();
 });
 wrap.addEventListener("mouseenter",stopSliderAuto);
 wrap.addEventListener("mouseleave",restartSliderAuto);
}
function searchProducts(q){if(q.trim()){let a=analyticsData();a.searches++;saveAnalytics(a)}q=q.trim().toLowerCase();let d=data();let items=d.products.filter(p=>!q||[p.name,p.category,p.desc].join(" ").toLowerCase().includes(q));let grid=document.getElementById("productGrid");grid.innerHTML=items.length?items.map(p=>`<article class="product" onclick="openProduct(${p.id})" tabindex="0" role="button"><div class="product-img">${p.image?`<img src="${p.image}">`:"GAME"}</div><h3>${esc(p.name)}</h3><p>${esc(p.desc||"")}</p><div class="price"><b>$${esc(p.price)}</b><span>View Details →</span></div></article>`).join(""):`<div class="empty" style="grid-column:1/-1"><h2>No products found</h2><p>Try another game, category or gift card name.</p></div>`;document.getElementById("store").scrollIntoView({behavior:"smooth",block:"start"});}


function favoriteIds(){try{return JSON.parse(localStorage.getItem("yaargamex_favorites")||"[]").map(Number)}catch(e){return []}}
function isFavorite(id){return favoriteIds().includes(Number(id))}
function toggleFavorite(id){const n=Number(id),ids=favoriteIds(),i=ids.indexOf(n);if(i>=0)ids.splice(i,1);else ids.push(n);localStorage.setItem("yaargamex_favorites",JSON.stringify(ids));return !isFavorite(n)}
function favoriteButton(id,compact=false){const active=isFavorite(id);return `<button class="favorite-btn${compact?" compact":""}${active?" active":""}" type="button" aria-label="${active?"Remove from favorites":"Add to favorites"}" aria-pressed="${active}" onclick="event.stopPropagation();handleFavoriteClick(${Number(id)},this)">❤<span>${compact?"":" Favorite"}</span></button>`}
function handleFavoriteClick(id,button){const active=toggleFavorite(id);if(button){button.classList.toggle("active",active);button.setAttribute("aria-pressed",String(active));button.setAttribute("aria-label",active?"Remove from favorites":"Add to favorites");const span=button.querySelector("span");if(span)span.textContent=" Favorite";}}
function renderFavoriteCards(targetId){const target=document.getElementById(targetId);if(!target)return;const d=data(),ids=favoriteIds(),items=ids.map(id=>d.products.find(p=>Number(p.id)===id)).filter(Boolean);target.innerHTML=items.length?items.map(p=>`<article class="product favorite-product" onclick="openProduct(${p.id})" tabindex="0" role="button"><div class="product-img">${p.image?`<img src="${p.image}" alt="${esc(p.name)}">`:"GAME"}${favoriteButton(p.id,true)}</div><h3>${esc(p.name)}</h3><p>${esc(p.desc||"")}</p><div class="price"><b>$${esc(p.price)}</b><span>View Details →</span></div></article>`).join(""):`<div class="empty" style="grid-column:1/-1"><div class="big-icon">♡</div><h2>No Favorite Items Yet</h2><p>Open a product and tap the ❤️ button to save it here.</p><a class="btn primary" href="index.html#store">Browse Store</a></div>`}
function openProduct(id){trackProduct(id);location.href="product.html?id="+encodeURIComponent(id)}

function openCategory(id){location.href="category.html?id="+encodeURIComponent(id)}

function updateNavAvatar(){const a=localStorage.getItem("yaargamex_avatar");const n=document.getElementById("navAvatar");if(a&&n)n.innerHTML=`<img src="${a}" alt="Profile" style="width:28px;height:28px;border-radius:50%;object-fit:cover;vertical-align:middle">`}
document.addEventListener("DOMContentLoaded",updateNavAvatar);

function analyticsData(){return JSON.parse(localStorage.getItem("yaargamex_analytics")||JSON.stringify({visits:0,productViews:{},searches:0,lastVisit:0}))}
function saveAnalytics(a){localStorage.setItem("yaargamex_analytics",JSON.stringify(a))}
function trackVisit(){let a=analyticsData();a.visits++;a.lastVisit=Date.now();saveAnalytics(a)}
function trackProduct(id){let a=analyticsData();a.productViews[id]=(a.productViews[id]||0)+1;saveAnalytics(a)}

document.addEventListener("DOMContentLoaded",trackVisit);

const YAAR_LANG={en:{search:"Search games, gift cards...",store:"Store",categories:"Categories",offers:"Offers",admin:"Admin",why:"Why Choose Us?",safe:"100% Safe Transaction",service:"24/7 Customer Service",refund:"Full Refund Guarantee",home:"Home",messages:"Messages",me:"Me"},
fa:{search:"جستجوی بازی و گیفت کارت...",store:"فروشگاه",categories:"دسته‌بندی‌ها",offers:"پیشنهادها",admin:"مدیریت",why:"چرا Yaargamex را انتخاب کنید؟",safe:"تراکنش ۱۰۰٪ امن",service:"پشتیبانی ۲۴/۷",refund:"ضمانت بازگشت کامل وجه",home:"خانه",messages:"پیام‌ها",me:"من"},
ps:{search:"د لوبو او ګیفټ کارت لټون...",store:"پلورنځی",categories:"کټګورۍ",offers:"آفرونه",admin:"مدیریت",why:"ولې Yaargamex غوره کړو؟",safe:"۱۰۰٪ خوندي معامله",service:"۲۴/۷ د مشتریانو خدمت",refund:"د بشپړ پیسو بېرته ستنولو ضمانت",home:"کور",messages:"پیغامونه",me:"زما"}};
function applyLanguage(){const l=localStorage.getItem("yaargamex_lang")||"en",d=YAAR_LANG[l]||YAAR_LANG.en;document.documentElement.lang=l;document.body.dir=l==="en"?"ltr":"rtl";const q=document.getElementById("siteSearch");if(q)q.placeholder=d.search;const s=document.getElementById("languageSelect");if(s)s.value=l;document.querySelectorAll("[data-i18n]").forEach(e=>{if(d[e.dataset.i18n])e.textContent=d[e.dataset.i18n]})}
document.addEventListener("DOMContentLoaded",()=>{applyLanguage();const s=document.getElementById("languageSelect");if(s)s.addEventListener("change",()=>{localStorage.setItem("yaargamex_lang",s.value);location.reload()})});
