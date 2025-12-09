const CACHE_NAME="cxp2-cache-v1";
const ASSET_RE=
  /\.(?:js|css|png|jpg|jpeg|webp|svg|woff2?)$/i;
self.addEventListener("install",(e)=>{
  e.waitUntil(caches.open(CACHE_NAME).then((c)=>c.addAll(["/","/index.html","/manifest.json"])));
  self.skipWaiting();
});
self.addEventListener("activate",(e)=>{
  e.waitUntil(caches.keys().then((keys)=>Promise.all(keys.filter((k)=>k!==CACHE_NAME).map((k)=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch",(e)=>{
  const req=e.request;
  const url=new URL(req.url);
  if(req.method!="GET") return;
  if(url.pathname==="/"||url.pathname.endsWith("index.html")){
    e.respondWith(fetch(req).then((res)=>{
      const clone=res.clone();
      caches.open(CACHE_NAME).then((c)=>c.put(req,clone));
      return res;
    }).catch(()=>caches.match(req)));
    return;
  }
  if(ASSET_RE.test(url.pathname)){
    e.respondWith(caches.match(req).then((hit)=>hit||fetch(req).then((res)=>{
      const clone=res.clone();
      caches.open(CACHE_NAME).then((c)=>c.put(req,clone));
      return res;
    })));
    return;
  }
});
