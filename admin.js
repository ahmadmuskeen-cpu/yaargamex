const USER="ahmad.muskeen@gmail.com",PASS="Yaar123@";
const ADMIN_SESSION_KEY="yaargamex_admin";
const get=()=>JSON.parse(localStorage.getItem("yaargamex_data")||"{}");
const save=d=>localStorage.setItem("yaargamex_data",JSON.stringify(d));
const hasAdminSession=()=>localStorage.getItem(ADMIN_SESSION_KEY)==="1";
const startAdminSession=()=>localStorage.setItem(ADMIN_SESSION_KEY,"1");
const endAdminSession=()=>localStorage.removeItem(ADMIN_SESSION_KEY);
let editType=null,editId=null;
function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function openPanel(){document.getElementById("login").classList.add("hidden");document.getElementById("panel").classList.remove("hidden");renderAll();loadSocialLinks()}

function renderAnalytics(){
 const el=document.getElementById("analyticsDashboard"); if(!el)return;
 const a=JSON.parse(localStorage.getItem("yaargamex_analytics")||'{"visits":0,"productViews":{},"searches":0}');
 const d=get();
 const totalViews=Object.values(a.productViews||{}).reduce((x,y)=>x+y,0);
 const top=d.products.slice().sort((x,y)=>(a.productViews[y.id]||0)-(a.productViews[x.id]||0)).slice(0,8);
 el.innerHTML=`<div class="analytics-grid">
 <div class="stat"><b>${a.visits||0}</b><span>Site Visits</span></div>
 <div class="stat"><b>${totalViews}</b><span>Product Views</span></div>
 <div class="stat"><b>${a.searches||0}</b><span>Searches</span></div>
 <div class="stat"><b>${d.products.length}</b><span>Total Products</span></div>
 </div>
 <div class="analytics-list"><h3>Most Viewed Products</h3>
 ${top.map(p=>`<div class="analytics-row"><span>${esc(p.name)}</span><strong>${a.productViews[p.id]||0} views</strong></div>`).join("")||"<p>No product views yet.</p>"}
 </div>`;
}

function renderAll(){let d=get();document.getElementById("stats").innerHTML=`<div class="stat"><b>${d.products.length}</b><span>Products</span></div><div class="stat"><b>${d.categories.length}</b><span>Categories</span></div><div class="stat"><b>100%</b><span>Store Control</span></div>`;renderProducts(d);renderCategories(d);renderFeatured(d);renderAnalytics();loadSettings(d)}

function renderFeatured(d){
 const el=document.getElementById("featuredList");
 el.innerHTML=d.products.map(p=>`<label style="display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid #202a3b;color:#cbd3df">
 <input type="checkbox" ${p.featured?"checked":""} onchange="toggleFeatured(${p.id},this.checked)" style="width:18px;height:18px">
 <span style="flex:1"><b>${esc(p.name)}</b><br><small>${esc(p.category)} · $${esc(p.price)}</small></span>
 </label>`).join("")||"<p>No products yet.</p>";
}
function toggleFeatured(id,checked){let d=get(),p=d.products.find(x=>x.id===id);if(p){p.featured=checked;save(d);}}

function productPhotos(p){return Array.isArray(p.images)&&p.images.length?p.images:(p.image?[p.image]:[])}
function renderProducts(d){document.getElementById("productsList").innerHTML=d.products.length?d.products.map(p=>`<div class="row"><div class="thumb">${productPhotos(p)[0]?`<img class="thumb" src="${productPhotos(p)[0]}" alt="">`:"🎮"}</div><div class="row-info"><b>${esc(p.name)}</b><p>${esc(p.category)} · $${esc(p.price)} · ${productPhotos(p).length} photo${productPhotos(p).length===1?"":"s"}${p.video?" + video":""}</p></div><strong>${esc(p.desc||"")}</strong><div class="row-actions"><button class="mini" onclick="editProduct(${p.id})">Edit</button><button class="mini del" onclick="delProduct(${p.id})">Delete</button></div></div>`).join(""):"<p>No products yet.</p>"}
function renderCategories(d){document.getElementById("categoriesList").innerHTML=d.categories.map(c=>`<div class="row"><div class="thumb" style="display:grid;place-items:center;font-size:25px">${esc(c.icon||"🎮")}</div><div class="row-info"><b>${esc(c.name)}</b><p>${esc(c.desc||"")}</p></div><div></div><div class="row-actions"><button class="mini" onclick="editCategory(${c.id})">Edit</button><button class="mini del" onclick="delCategory(${c.id})">Delete</button></div></div>`).join("")}
function loadSettings(d){let s=d.settings;set("setHeroTitle",s.heroTitle);set("setHeroText",s.heroText);set("setPromoTitle",s.promoTitle);set("setPromoText",s.promoText);renderMessagesBg(s);renderSliderFields(d)}
function set(id,v){document.getElementById(id).value=v}
function renderMessagesBg(s){const el=document.getElementById("msgBgPreview");if(!el)return;el.innerHTML=s.messagesBg?`<div class="media-preview"><img src="${s.messagesBg}" alt="Current Messages background"><span>Current background</span></div>`:`<p style="color:#9ba5b8">No background image set. The default look will be used.</p>`}
function sliderSlots(d){const arr=(d.settings.sliderImages||[]).slice(0,4);while(arr.length<4)arr.push("");return arr}
function renderSliderFields(d){
 const el=document.getElementById("sliderFields");if(!el)return;
 const imgs=sliderSlots(d);
 el.innerHTML=imgs.map((url,i)=>`<div class="upload-field"><label>Slide ${i+1}<span>JPG, PNG, WEBP or GIF — up to 5 MB</span><input class="sliderFile" data-i="${i}" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label><div class="media-preview-grid" id="sliderPreview${i}">${url?`<div class="media-preview"><img src="${url}" alt="Slide ${i+1}"><span>Current image</span></div>`:`<p style="color:#9ba5b8">No image set — a placeholder will show.</p>`}</div>${url?`<button class="mini del" type="button" data-remove="${i}">Remove</button>`:""}</div>`).join("");
 el.querySelectorAll(".sliderFile").forEach(input=>input.onchange=()=>{
  const i=input.dataset.i,file=input.files[0];if(!file)return;
  document.getElementById("sliderPreview"+i).innerHTML=`<div class="media-preview"><img src="${URL.createObjectURL(file)}" alt="Selected slide ${Number(i)+1}"><span>${esc(file.name)}</span></div>`;
 });
 el.querySelectorAll("[data-remove]").forEach(btn=>btn.onclick=()=>{
  const i=Number(btn.dataset.remove),d=get(),imgs=sliderSlots(d);imgs[i]="";d.settings.sliderImages=imgs;save(d);renderSliderFields(d);
 });
}
function renderSocialFields(links){
 const el=document.getElementById("socialFields");if(!el)return;
 el.innerHTML=SOCIAL_PLATFORMS.map(p=>`<label>${p.icon} ${esc(p.label)}<input class="socialInput" data-platform="${p.key}" placeholder="${esc(p.placeholder)}" value="${esc(links[p.key]||"")}"></label>`).join("");
}
async function loadSocialLinks(){
 try{const r=await fetch("/api/social-links");const d=await r.json();renderSocialFields(d.links||{})}catch(e){renderSocialFields({})}
}
function modal(title,html){document.getElementById("modalTitle").textContent=title;document.getElementById("editorForm").innerHTML=html;document.getElementById("modal").classList.remove("hidden")}
function close(){document.getElementById("modal").classList.add("hidden")}
async function uploadMedia(file){
 const response=await fetch("/api/media-upload",{method:"POST",headers:{"content-type":file.type,"x-file-name":file.name},body:file});
 const result=await response.json().catch(()=>({error:"Upload failed."}));
 if(!response.ok)throw new Error(result.error||"Upload failed.");
 return result.url;
}
function mediaPreview(files,kind){
 const target=document.getElementById(kind==="image"?"photoPreview":"videoPreview");
 target.innerHTML=[...files].map(file=>kind==="image"?`<div class="media-preview"><img src="${URL.createObjectURL(file)}" alt="Selected photo"><span>${esc(file.name)}</span></div>`:`<div class="media-preview video"><video src="${URL.createObjectURL(file)}" muted></video><span>${esc(file.name)}</span></div>`).join("");
}
function productForm(p={name:"",price:"",category:get().categories[0]?.name||"",desc:"",image:""}){
 const existing=productPhotos(p);
 modal(p.id?"Edit Product":"Add Product",`<div class="editor-grid"><label>Name<input id="fName" value="${esc(p.name)}" required></label><label>Price<input id="fPrice" type="number" step="0.01" value="${esc(p.price)}" required></label><label>Category<select id="fCat">${get().categories.map(c=>`<option ${c.name===p.category?"selected":""}>${esc(c.name)}</option>`).join("")}</select></label><label>Description<textarea id="fDesc">${esc(p.desc)}</textarea></label><div class="upload-field"><label>Product photos <span>2–3 photos, up to 5 MB each</span><input id="fImgs" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple ${p.id?"":"required"}></label><div id="photoPreview" class="media-preview-grid">${existing.map((url,i)=>`<div class="media-preview"><img src="${url}" alt="Current product photo ${i+1}"><span>Current photo ${i+1}</span></div>`).join("")}</div></div><div class="upload-field"><label>Product video <span>Optional, up to 100 MB</span><input id="fVideo" type="file" accept="video/mp4,video/webm,video/quicktime"></label><div id="videoPreview" class="media-preview-grid">${p.video?`<div class="media-preview video"><video src="${p.video}" muted></video><span>Current video</span></div>`:""}</div></div><p id="mediaError" class="form-error" role="alert"></p><label class="check"><input id="fFeatured" type="checkbox" ${p.featured?"checked":""}> Featured product</label><button class="btn primary" id="saveProduct" type="submit">Save Product</button></div>`);
 const photos=document.getElementById("fImgs"),video=document.getElementById("fVideo");
 photos.onchange=()=>mediaPreview(photos.files,"image"); video.onchange=()=>mediaPreview(video.files,"video");
 document.getElementById("editorForm").onsubmit=async e=>{
  e.preventDefault(); const error=document.getElementById("mediaError"),button=document.getElementById("saveProduct"),newPhotos=[...photos.files],videoFile=video.files[0],isNew=!p.id; error.textContent="";
  if(newPhotos.length&& (newPhotos.length<2||newPhotos.length>3)){error.textContent="Please choose two or three photos.";return}
  if(!p.id&&newPhotos.length<2){error.textContent="Please choose at least two photos.";return}
  if(newPhotos.some(file=>file.size>5*1024*1024)){error.textContent="Each photo must be 5 MB or smaller.";return}
  if(videoFile&&videoFile.size>100*1024*1024){error.textContent="The video must be 100 MB or smaller.";return}
  button.disabled=true;button.textContent="Uploading media…";
  try{
   const images=newPhotos.length?await Promise.all(newPhotos.map(uploadMedia)):existing;
   const videoUrl=videoFile?await uploadMedia(videoFile):(p.video||"");
   const d=get(),obj={id:p.id||Date.now(),name:document.getElementById("fName").value,price:document.getElementById("fPrice").value,category:document.getElementById("fCat").value,desc:document.getElementById("fDesc").value,images,image:images[0]||"",video:videoUrl,featured:document.getElementById("fFeatured").checked};
   const i=d.products.findIndex(x=>x.id===obj.id);if(i>=0)d.products[i]=obj;else d.products.push(obj);save(d);close();renderAll();
   if(isNew){postGeneralUpdate({type:"product",category:"product",body:`New product added: ${obj.name} — $${obj.price}`,mediaUrl:obj.image||null,mediaMime:null}).catch(()=>{});}
  }catch(err){error.textContent=err.message||"Media could not be uploaded. Please try again.";button.disabled=false;button.textContent="Save Product"}
 };
}
function categoryForm(c={name:"",icon:"🎮",desc:""}){modal(c.id?"Edit Category":"Add Category",`<div class="editor-grid"><label>Name<input id="cName" value="${esc(c.name)}" required></label><label>Icon / Emoji<input id="cIcon" value="${esc(c.icon)}"></label><label>Description<textarea id="cDesc">${esc(c.desc)}</textarea></label><button class="btn primary" type="submit">Save Category</button></div>`);document.getElementById("editorForm").onsubmit=e=>{e.preventDefault();let d=get(),obj={id:c.id||Date.now(),name:document.getElementById("cName").value,icon:document.getElementById("cIcon").value,desc:document.getElementById("cDesc").value};let i=d.categories.findIndex(x=>x.id===obj.id);if(i>=0)d.categories[i]=obj;else d.categories.push(obj);save(d);close();renderAll()}}
function editProduct(id){productForm(get().products.find(p=>p.id===id))}
function delProduct(id){if(confirm("Delete this product?")){let d=get();d.products=d.products.filter(p=>p.id!==id);save(d);renderAll()}}
function editCategory(id){categoryForm(get().categories.find(c=>c.id===id))}
function delCategory(id){if(confirm("Delete this category?")){let d=get();d.categories=d.categories.filter(c=>c.id!==id);save(d);renderAll()}}
document.addEventListener("DOMContentLoaded",()=>{if(hasAdminSession())openPanel();document.getElementById("loginForm").onsubmit=e=>{e.preventDefault();if(document.getElementById("user").value===USER&&document.getElementById("pass").value===PASS){startAdminSession();openPanel()}else document.getElementById("loginError").textContent="Invalid username or password.";};document.getElementById("logout").onclick=()=>{endAdminSession();location.reload()};document.getElementById("addProduct").onclick=()=>productForm();document.getElementById("addCategory").onclick=()=>categoryForm();document.getElementById("closeModal").onclick=close;document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tabs button").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.querySelectorAll(".tab").forEach(x=>x.classList.add("hidden"));document.getElementById(b.dataset.tab+"Tab").classList.remove("hidden")});document.getElementById("resetAnalytics").onclick=()=>{if(confirm("Reset all analytics?")){localStorage.removeItem("yaargamex_analytics");renderAnalytics();}};document.getElementById("saveSettings").onclick=()=>{let d=get();d.settings.heroTitle=document.getElementById("setHeroTitle").value;d.settings.heroText=document.getElementById("setHeroText").value;d.settings.promoTitle=document.getElementById("setPromoTitle").value;d.settings.promoText=document.getElementById("setPromoText").value;let f=document.getElementById("bgFile").files[0];if(f){let r=new FileReader();r.onload=()=>{d.settings.bg=r.result;save(d);alert("Homepage saved.");};r.readAsDataURL(f)}else{save(d);alert("Homepage saved.")}};
const msgBgFile=document.getElementById("msgBgFile");
msgBgFile.onchange=()=>{const f=msgBgFile.files[0];if(!f)return;document.getElementById("msgBgPreview").innerHTML=`<div class="media-preview"><img src="${URL.createObjectURL(f)}" alt="Selected background"><span>${esc(f.name)}</span></div>`};
document.getElementById("saveMessagesBg").onclick=async()=>{
 const file=msgBgFile.files[0],btn=document.getElementById("saveMessagesBg"),error=document.getElementById("msgBgError");
 error.textContent="";
 if(!file){error.textContent="Choose an image to upload.";return}
 if(file.size>5*1024*1024){error.textContent="Image must be 5 MB or smaller.";return}
 btn.disabled=true;btn.textContent="Uploading…";
 try{
  const url=await uploadMedia(file);
  const d=get();d.settings.messagesBg=url;save(d);
  msgBgFile.value="";
  renderMessagesBg(d.settings);
 }catch(err){error.textContent=err.message||"Upload failed. Please try again."}
 finally{btn.disabled=false;btn.textContent="Save Background"}
};
document.getElementById("removeMessagesBg").onclick=()=>{
 if(!confirm("Remove the custom Messages background?"))return;
 const d=get();delete d.settings.messagesBg;save(d);renderMessagesBg(d.settings);
};
document.getElementById("saveSocial").onclick=async()=>{
 const btn=document.getElementById("saveSocial"),error=document.getElementById("socialError");
 error.textContent="";
 const inputs=[...document.querySelectorAll(".socialInput")];
 const bad=inputs.find(i=>i.value.trim()&&!/^https?:\/\/\S+$/i.test(i.value.trim()));
 if(bad){error.textContent="Links must start with http:// or https://.";return}
 btn.disabled=true;btn.textContent="Saving…";
 try{
  await Promise.all(inputs.map(i=>fetch("/api/social-links",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({platform:i.dataset.platform,url:i.value.trim()})}).then(async r=>{
   if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.error||"Save failed.")}
  })));
  alert("Social links saved.");
 }catch(err){error.textContent=err.message||"Could not save. Please try again."}
 finally{btn.disabled=false;btn.textContent="Save Social Links"}
};
document.getElementById("saveSlider").onclick=async()=>{
 const btn=document.getElementById("saveSlider"),error=document.getElementById("sliderError");
 error.textContent="";
 const inputs=[...document.querySelectorAll(".sliderFile")],files=inputs.map(inp=>inp.files[0]);
 if(files.some(f=>f&&f.size>5*1024*1024)){error.textContent="Each image must be 5 MB or smaller.";return}
 btn.disabled=true;btn.textContent="Uploading…";
 try{
  const d=get(),imgs=sliderSlots(d);
  for(let i=0;i<inputs.length;i++){const f=files[i];if(f)imgs[Number(inputs[i].dataset.i)]=await uploadMedia(f)}
  d.settings.sliderImages=imgs;save(d);renderSliderFields(d);
  alert("Slider images saved.");
 }catch(err){error.textContent=err.message||"Upload failed. Please try again."}
 finally{btn.disabled=false;btn.textContent="Save Slider Images"}
};
});
