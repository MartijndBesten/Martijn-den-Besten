
(function(){
'use strict';
var toneel=document.getElementById('toneel');
if(!window.THREE||!THREE.OrbitControls){document.getElementById('fout').hidden=false;return;}

/* ---------- Basis ---------- */
// Alle posities komen uit de loodrechte foto (2000 x 1500 px). 16,5 px is ongeveer 1 m.
// Assenstelsel in meters, vastgezet op Rijksdriehoekscoördinaten (RD) via de BAG-contouren.
// +X wijst naar de openbare weg (kompas 206,5°), +Z naar het betonpad (296,5°).
var SX=-0.4462, CX=-0.8949, SZ=-0.8949, CZ=0.4462;
function R(e,n){return [e*SX+n*CX+100, e*SZ+n*CZ+50];}            // RD-lokaal (t.o.v. 134000 / 436400) naar model
function RD(x,z){x-=100; z-=50; return [x*SX+z*SZ, x*CX+z*CZ];}   // model naar RD-lokaal
// Foto-pixels uit de loodrechte dronefoto, opnieuw geijkt op de BAG-contouren (circa 13 à 14 px per meter).
var S=13.4;
function X(px){return 0.07236*px-66.1;} function Z(py){return 0.0775*py-57.8;}

var renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true});}catch(e){document.getElementById('fout').hidden=false;return;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
toneel.insertBefore(renderer.domElement,toneel.firstChild);

var scene=new THREE.Scene();
var luchtKleur=new THREE.Color(0xcfe3ee).convertSRGBToLinear();
scene.background=luchtKleur;
scene.fog=new THREE.Fog(luchtKleur,260,620);
var camera=new THREE.PerspectiveCamera(40,1,0.5,1500);
var controls=new THREE.OrbitControls(camera,renderer.domElement);
controls.enableDamping=true; controls.dampingFactor=.08;
controls.maxPolarAngle=Math.PI/2-0.03; controls.minDistance=12; controls.maxDistance=330;

scene.add(new THREE.HemisphereLight(0xffffff,0x9aa37c,0.95));
var zon=new THREE.DirectionalLight(0xfff6e6,1.25);
zon.position.set(70,95,55); zon.castShadow=true;
zon.shadow.mapSize.set(2048,2048);
var sc=zon.shadow.camera; sc.left=-90; sc.right=90; sc.top=70; sc.bottom=-70; sc.near=10; sc.far=300;
zon.shadow.bias=-0.0006;
scene.add(zon);

var K={ // kleuren
  wei:0x86a95a, akker:0x7a6652, gazon:0x79aa55, water:0x3f5a66, oever:0x5f8444,
  tegel:0xa9a9a2, klinker:0x92756a, grind:0xc9bfae, beton:0xbfbdb4, asfalt:0x6f7376, terras:0x4b4f52,
  baksteen:0x8d5a45, groenhout:0x21382f, pan:0x55585c, pandonker:0x3b3e42, grijsdak:0xb7c0c6,
  romney:0x2f5a44, lichtstraat:0xb9c7a2, wit:0xf1f0ea, glas:0x2a3a44, paneel:0x1b2233,
  stam:0x6b5642, blad:0x6f9a3f, wilg:0x9cb383, esdoorn:0x8aa63c, haag:0x3f6b35
};
var matCache={};
function lin(hex){return new THREE.Color(hex).convertSRGBToLinear();}
function M(kleur,opt){
  var sleutel=kleur+JSON.stringify(opt||{});
  if(!matCache[sleutel]){var o=Object.assign({},opt||{}); o.color=lin(kleur); matCache[sleutel]=new THREE.MeshLambertMaterial(o);}
  return matCache[sleutel];
}
function vlakMat(kleur,laag){ // vlakke grondlagen: polygonOffset voorkomt flikkeren tussen lagen
  return new THREE.MeshLambertMaterial({color:lin(kleur),polygonOffset:true,polygonOffsetFactor:-laag,polygonOffsetUnits:-laag*2});
}

/* ---------- Grondvlakken ---------- */
var grond=new THREE.Group(); scene.add(grond);
function veld(punten,kleur,laag){
  var sh=new THREE.Shape();
  punten.forEach(function(p,i){ if(i) sh.lineTo(X(p[0]),-Z(p[1])); else sh.moveTo(X(p[0]),-Z(p[1])); });
  var g=new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI/2);
  var m=new THREE.Mesh(g,vlakMat(kleur,laag)); m.receiveShadow=true; m.renderOrder=laag; grond.add(m); return m;
}
function strook(punten,breedtePx,kleur,laag){
  var b=breedtePx/S/2, mat=vlakMat(kleur,laag);
  for(var i=0;i<punten.length;i++){
    var ax=X(punten[i][0]), az=Z(punten[i][1]);
    var c=new THREE.Mesh(new THREE.CircleGeometry(b,20),mat); c.rotation.x=-Math.PI/2; c.position.set(ax,0,az); c.receiveShadow=true; c.renderOrder=laag; grond.add(c);
    if(i===punten.length-1) break;
    var bx=X(punten[i+1][0]), bz=Z(punten[i+1][1]), dx=bx-ax, dz=bz-az, len=Math.sqrt(dx*dx+dz*dz);
    var q=new THREE.Mesh(new THREE.PlaneGeometry(len,b*2),mat);
    q.rotation.x=-Math.PI/2; q.rotation.z=-Math.atan2(dz,dx); q.position.set((ax+bx)/2,0,(az+bz)/2);
    q.receiveShadow=true; q.renderOrder=laag; grond.add(q);
  }
}
var basis=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),M(K.wei)); basis.rotation.x=-Math.PI/2; basis.position.y=-0.02; basis.receiveShadow=true; scene.add(basis);
// akker aan de overkant van het betonpad
veldM([[-400,33.4],[72,33.4],[72,400],[-400,400]],K.akker,1);
// lichte perceelstroken voor het polderbeeld
[[-9000,-260,1560,-200],[-9000,-900,1600,-840],[2080,-9000,2400,9000]].forEach(function(r){veld([[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]],0x7fa254,1);});

// sloten: eerst brede oever, dan water
// Sloten in modelmeters, gemeten op de luchtfoto (hartlijn, breedte water)
function PX(x){return (x+66.1)/0.07236;} function PZ(z){return (z+57.8)/0.0775;}
function veldM(pts,k,l){return veld(pts.map(function(q){return [PX(q[0]),PZ(q[1])];}),k,l);}
function strookM(pts,b,k,l){strook(pts.map(function(q){return [PX(q[0]),PZ(q[1])];}),b*S,k,l);}
var sloten=[
  [[[-400,-35.5],[60,-35.5],[65,-36]],6.4],          // tuinzijde
  [[[-52.5,-35.5],[-52.5,26]],5],                    // achterzijde bij de ronde loods
  [[[-52.5,26],[57,26]],3.6],                        // betonpadzijde
  [[[65,-400],[65,-36],[65,15]],8],                  // langs de openbare weg, tot de dam van de oprit
  [[[67.5,34],[67.5,400]],5],                        // voorbij het betonpad
  [[[-400,-58],[60,-58]],3]                          // perceelsloot in het weiland
];
sloten.forEach(function(s){strookM(s[0],s[1]+2.5,K.oever,2);});
sloten.forEach(function(s){strookM(s[0],s[1],K.water,3);});

// het erf
veldM([[-50,-31.6],[60.6,-31.6],[60.6,17],[-50,24]],K.gazon,4);
veldM([[-49.5,-11.7],[-22.7,-11.7],[-22.7,-23.7],[1.2,-23.7],[1.2,-29.5],[19.6,-29.5],[19.6,-19],[15.8,-19],[15.8,8.9],[17.8,8.9],[17.8,23.4],[-49.5,23.4]],K.tegel,5);
veld([[552,600],[665,600],[665,715],[552,715]],K.klinker,6);
veld([[790,700],[957,700],[957,850],[790,850]],K.klinker,6);
veldM([[15.8,13.3],[60.6,13.3],[60.6,16.6],[72.5,16.6],[72.5,29.4],[57,29.4],[57,23.6],[15.8,23.6]],K.grind,6);
veld([[1132,668],[1345,668],[1345,742],[1132,742]],K.terras,6);
veld([[1345,700],[1512,700],[1512,742],[1345,742]],K.klinker,6);
veld([[1500,676],[1582,676],[1582,730],[1500,730]],K.terras,6);
// voortuin: grindpad om een grasperk
veld([[1512,745],[1650,758],[1722,800],[1732,860],[1700,922],[1512,926]],K.grind,6);
(function(){var e=new THREE.Mesh(new THREE.CircleGeometry(1,32),vlakMat(K.gazon,7)); e.rotation.x=-Math.PI/2; e.scale.set(80/S,54/S,1); e.position.set(X(1612),0,Z(838)); e.receiveShadow=true; e.renderOrder=7; grond.add(e);})();
// openbare weg en betonpad
strookM([[75.5,-400],[75.5,400]],6.4,K.asfalt,6);
strookM([[73,31.2],[-57,31.2],[-63,28.6],[-400,27.5]],3.2,K.beton,7);
strookM([[-59,31.2],[-61,35],[-61,400]],2.6,K.beton,7);

/* ---------- Gebouwen ---------- */
var gebouwen=new THREE.Group(); scene.add(gebouwen); window.__gebouwen=gebouwen;
function schaduw(m){m.castShadow=true;m.receiveShadow=true;return m;}
function doos(w,h,d,mat){return schaduw(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat));}
// plaat op een dakvlak tussen twee profielpunten (lokale x/y), over lokale z van z0 tot z1
function dakplaat(groep,p0,p1,t0,t1,z0,z1,dikte,optil,mat){
  var dx=p1[0]-p0[0], dy=p1[1]-p0[1], len=Math.sqrt(dx*dx+dy*dy);
  var nx=-dy/len, ny=dx/len; if(ny<0){nx=-nx;ny=-ny;}
  var tm=(t0+t1)/2, m=doos(len*(t1-t0),dikte,Math.abs(z1-z0),mat);
  m.position.set(p0[0]+dx*tm+nx*optil, p0[1]+dy*tm+ny*optil, (z0+z1)/2);
  m.rotation.z=Math.atan2(dy,dx); groep.add(m); return m;
}
function gebouw(o){
  var r=o.m||[X(o.px[0]),Z(o.px[1]),X(o.px[2]),Z(o.px[3])], x0=r[0], z0=r[1], x1=r[2], z1=r[3];
  var sx=x1-x0, sz=z1-z0, langsX=o.as==='x', w=langsX?sz:sx, L=langsX?sx:sz, h=w/2;
  var g=new THREE.Group(); g.position.set((x0+x1)/2,0,(z0+z1)/2); if(langsX) g.rotation.y=Math.PI/2;
  var prof;
  if(o.vorm==='knik') prof=[[-h,0],[h,0],[h,o.goot],[h-o.knikIn,o.knikH],[0,o.nok],[-h+o.knikIn,o.knikH],[-h,o.goot]];
  else if(o.vorm==='lessenaar') prof=[[-h,0],[h,0],[h,o.goot],[-h,o.nok]];
  else prof=[[-h,0],[h,0],[h,o.goot],[0,o.nok],[-h,o.goot]];
  var sh=new THREE.Shape(); prof.forEach(function(p,i){ if(i) sh.lineTo(p[0],p[1]); else sh.moveTo(p[0],p[1]); });
  var geo=new THREE.ExtrudeGeometry(sh,{depth:L,bevelEnabled:false}); geo.translate(0,0,-L/2);
  g.add(schaduw(new THREE.Mesh(geo,M(o.wand))));
  for(var i=2;i<prof.length-1;i++) dakplaat(g,prof[i],prof[i+1],-0.06,1.02,-L/2-0.3,L/2+0.3,0.16,0.08,M(o.dak));
  if(o.plint){var p=doos(w+0.08,o.plint,L+0.08,M(o.plintKleur||K.baksteen)); p.position.y=o.plint/2; g.add(p);}
  g.userData={prof:prof,w:w,L:L}; (o.ouder||gebouwen).add(g); return g;
}
// venster of deur op een gevel (wereldcoördinaten); richting 'x' = gevel kijkt langs de x-as
function gevelvlak(cx,cy,cz,breed,hoog,richting,kleur,rand,ouder,randKleur){
  var gebouwen=ouder||window.__gebouwen;
  var d=0.08, m=doos(richting==='x'?d:breed,hoog,richting==='x'?breed:d,M(kleur)); m.position.set(cx,cy,cz); m.castShadow=false; gebouwen.add(m);
  if(rand){var r=doos(richting==='x'?d*0.6:breed+0.24,hoog+0.24,richting==='x'?breed+0.24:d*0.6,M(rand===true?(randKleur||K.wit):rand)); r.position.set(cx,cy,cz); r.castShadow=false; gebouwen.add(r);}
}

// Wand met openingen. langs='x': wand loopt van a0 tot a1 langs x op z=vast; langs='z': langs z op x=vast.
// ops: [{c:midden, w:breedte, s:borstwering, h:hoogte, glas:true/false}]
function wand(ouder,a0,a1,vast,langs,ops,dikte,hoogte,mat){
  var glasMat=new THREE.MeshLambertMaterial({color:lin(0x9fc3d1),transparent:true,opacity:0.35});
  function stuk(b0,b1,y0,y1,m){ if(b1-b0<0.01||y1-y0<0.01) return; var l=b1-b0, h=y1-y0, mm=m||mat;
    var d=doos(langs==='x'?l:dikte,h,langs==='x'?dikte:l,mm); if(m===glasMat){d.castShadow=false;}
    if(langs==='x') d.position.set((b0+b1)/2,(y0+y1)/2,vast); else d.position.set(vast,(y0+y1)/2,(b0+b1)/2); ouder.add(d); }
  var a=a0; (ops||[]).slice().sort(function(p,q){return p.c-q.c;}).forEach(function(o){
    var l=o.c-o.w/2, r=o.c+o.w/2; stuk(a,l,0,hoogte); stuk(l,r,0,o.s); stuk(l,r,Math.min(hoogte,o.s+o.h),hoogte);
    if(o.glas){ var g=doos(langs==='x'?o.w:0.03,o.h,langs==='x'?0.03:o.w,glasMat); g.castShadow=false; if(langs==='x') g.position.set(o.c,o.s+o.h/2,vast); else g.position.set(vast,o.s+o.h/2,o.c); ouder.add(g); }
    a=r; });
  stuk(a,a1,0,hoogte);
}
function meubel(ouder,x0,z0,x1,z1,h,kleur,y0){var m=doos(Math.abs(x1-x0),h,Math.abs(z1-z0),M(kleur)); m.position.set((x0+x1)/2,(y0||0)+h/2,(z0+z1)/2); ouder.add(m); return m;}

// Woonhuis: voorhuis (nok evenwijdig aan de weg) met achterhuis
var voorhuis=gebouw({m:[37.0,0.8,42.1,13.3],as:'z',goot:3.6,nok:6.5,wand:K.baksteen,dak:K.pan});
var achterhuis=gebouw({m:[18.2,0.8,37.0,12.9],as:'x',goot:3.0,nok:7.9,wand:K.baksteen,dak:K.pandonker});
(function(){
  var fx=42.13, zc=7.0;
  var kap=gebouw({m:[39.5,5.4,42.6,8.6],as:'x',goot:5.0,nok:6.5,wand:K.baksteen,dak:K.pan});
  [-4.0,-2.1,2.1,4.0].forEach(function(dz){gevelvlak(fx,1.9,zc+dz,1.0,1.7,'x',K.glas,true);});
  gevelvlak(42.63,1.25,zc,1.05,2.3,'x',0x2c3a31,true);
  gevelvlak(42.63,4.6,zc,0.9,1.2,'x',K.glas,true);
  var sch=doos(0.6,1.4,0.6,M(K.baksteen)); sch.position.set(38.6,7.0,2.6); gebouwen.add(sch);
  // dakramen achterhuis
  var pr=achterhuis.userData.prof;
  // dakramen volgens de loodrechte foto: zes op het achterste deel (30a), één op het deel van 30
  [-6.5,-2.9,0.45,5.9].forEach(function(z){ dakplaat(achterhuis,pr[2],pr[3],0.3,0.42,z-0.4,z+0.4,0.06,0.2,M(0x9fb6c4)); });
  [-5.0,-2.6,0.45].forEach(function(z){ dakplaat(achterhuis,pr[3],pr[4],0.58,0.70,z-0.4,z+0.4,0.06,0.2,M(0x9fb6c4)); });
})();
// veranda / serre aan de tuinzijde
(function(){
  var dak=doos(9.8,0.12,2.9,M(K.wit)); dak.position.set(23.5,2.75,-0.65); gebouwen.add(dak);
  var dak2=doos(3.0,0.14,3.8,M(0x41464a)); dak2.position.set(29.9,2.8,-1.1); gebouwen.add(dak2);
  var wand2=doos(3.0,2.75,0.12,M(0x2a2d30)); wand2.position.set(29.9,1.38,-2.95); gebouwen.add(wand2); // dichte zijde richting tuin/mantelzorgwoning
  [[18.7,-2.0],[23.5,-2.0],[28.3,-2.0],[31.3,-2.9]].forEach(function(p){var s=doos(0.14,2.7,0.14,M(0x3a3f3c)); s.position.set(p[0],1.35,p[1]); gebouwen.add(s);});
})();

// Grote schuur: groen hout op bakstenen plint, zonnepanelen op het dakvlak aan de wegzijde
var schuur=gebouw({m:[4.0,-16.4,16.2,5.8],as:'z',vorm:'knik',goot:2.7,knikIn:1.9,knikH:5.7,nok:8.1,wand:K.groenhout,dak:K.pan,plint:1.3});
(function(){
  var c=document.createElement('canvas'); c.width=512; c.height=128; var x=c.getContext('2d');
  x.fillStyle='#161d2e'; x.fillRect(0,0,512,128); x.strokeStyle='#5d6a85'; x.lineWidth=2;
  for(var i=0;i<=20;i++){x.beginPath();x.moveTo(i*25.6,0);x.lineTo(i*25.6,128);x.stroke();}
  for(var j=0;j<=3;j++){x.beginPath();x.moveTo(0,j*42.6);x.lineTo(512,j*42.6);x.stroke();}
  var t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding;
  var mats=[M(K.paneel),M(K.paneel),new THREE.MeshLambertMaterial({map:t}),M(K.paneel),M(K.paneel),M(K.paneel)];
  var pr=schuur.userData.prof, L=schuur.userData.L;
  var p=dakplaat(schuur,pr[3],pr[4],0.12,0.92,-L/2+0.6,L/2-1.2,0.06,0.2,M(K.paneel));
  p.material=mats; p.geometry.groups.forEach(function(gr,i){gr.materialIndex=i;});
  // texture staat op de bovenkant (+y); draai zodat de panelen langs de schuur lopen
  t.center.set(.5,.5); t.rotation=Math.PI/2;
  [-6,-2,2,6].forEach(function(dz){gevelvlak(16.24,2.1,-5.3+dz,1.4,0.9,'x',K.glas,true);});
})();
[[-16.44],[5.84]].forEach(function(g){
  [-1.7,1.7].forEach(function(dx){gevelvlak(10.1+dx,3.4,g[0],0.7,1.0,'z',K.glas,true);});
  [-0.55,0.55].forEach(function(dx){gevelvlak(10.1+dx,6.7,g[0],0.4,0.5,'z',K.glas,true);});
});
// groen beschoten geveltoppen (achterhuis en lange schuur, erfzijde)
function geveltop(xg,zc,half,goot,nok){
  var sh=new THREE.Shape(); sh.moveTo(-half,goot); sh.lineTo(half,goot); sh.lineTo(0,nok-0.05); sh.lineTo(-half,goot);
  var g=new THREE.ShapeGeometry(sh); g.rotateY(-Math.PI/2); var m=new THREE.Mesh(g,M(K.groenhout)); m.position.set(xg-0.05,0,zc); gebouwen.add(m);
}
geveltop(18.2,6.85,6.05,3.0,7.9); geveltop(-8.7,13.9,4.9,2.6,6.4);
// tussenlid tussen schuur, lange schuur en woonhuis
(function(){// Tussen koeienschuur en woonhuis: open straatje (Martijn 13-11), alleen bestrating.
    var str=doos(2.0,0.06,16.3,M(K.tegel)); str.castShadow=false; str.position.set(17.2,0.09,5.15); gebouwen.add(str);
    // Tussen koeienschuur en garage/werkplaats (Z 5,8-9,0):
    // Alleen bij de erfzijde (X 3,9-5,8) een laag dakje over de doorloop; de rest (X 5,8-15,7) is open en bestraat.
    var open=doos(9.9,0.06,3.2,M(K.tegel)); open.castShadow=false; open.position.set(10.75,0.09,7.4); gebouwen.add(open);
    var doorDak=doos(2.1,0.12,3.5,M(K.pandonker)); doorDak.position.set(4.85,2.65,7.4); gebouwen.add(doorDak);
    [[3.95,5.95],[3.95,8.85]].forEach(function(q){var st=doos(0.12,2.6,0.12,M(0x2a2d30)); st.position.set(q[0],1.3,q[1]); gebouwen.add(st);});
    var doorVl=doos(1.9,0.06,3.2,M(K.tegel)); doorVl.castShadow=false; doorVl.position.set(4.85,0.09,7.4); gebouwen.add(doorVl);})();

// Aanbouw met lichtgrijs dak
var aanbouw=gebouw({m:[-10.0,-16.3,4.0,-10.5],as:'x',goot:4.0,nok:4.8,wand:0x22353a,dak:K.grijsdak});
gevelvlak(-3.0,1.65,-10.46,3.4,3.3,'z',K.wit,false);

// Lange schuur: baksteen met pannendak
var langeSchuur=gebouw({m:[-8.7,9.0,15.7,18.8],as:'x',goot:2.6,nok:6.4,wand:K.baksteen,dak:K.pan});
gevelvlak(-8.74,1.5,13.9,4.2,3.0,'x',K.groenhout,false);
[-4,0,4,8,12].forEach(function(px){gevelvlak(px,1.5,8.96,1.0,0.8,'z',K.glas,true);});

// Romneyloods
(function(){
  var x0=-42.8, x1=-17.7, L=x1-x0, r=11.8/2;
  var g=new THREE.Group(); g.position.set((x0+x1)/2,0,4.0); g.rotation.y=Math.PI/2;
  var sh=new THREE.Shape(); sh.moveTo(-r,0); sh.absarc(0,0,r,Math.PI,0,true); sh.lineTo(-r,0);
  var geo=new THREE.ExtrudeGeometry(sh,{depth:L,bevelEnabled:false,curveSegments:28}); geo.translate(0,0,-L/2);
  g.add(schaduw(new THREE.Mesh(geo,M(K.romney))));
  function band(a0,a1,z){
    var b=new THREE.Shape(), r1=r+0.02, r2=r+0.07;
    b.moveTo(Math.cos(a0)*r1,Math.sin(a0)*r1); b.lineTo(Math.cos(a0)*r2,Math.sin(a0)*r2);
    b.absarc(0,0,r2,a0,a1,false); b.lineTo(Math.cos(a1)*r1,Math.sin(a1)*r1); b.absarc(0,0,r1,a1,a0,true);
    var bg=new THREE.ExtrudeGeometry(b,{depth:0.8,bevelEnabled:false,curveSegments:8}); bg.translate(0,0,z);
    g.add(new THREE.Mesh(bg,M(K.lichtstraat)));
  }
  for(var i=0;i<9;i++){var z=-L/2+1.6+i*(L-3.2-0.8)/8; band(0.95,1.4,z); band(Math.PI-1.4,Math.PI-0.95,z);}
  gebouwen.add(g);
  gevelvlak(x1+0.05,1.8,4.0,3.6,3.6,'x',0x1b2a23,false);
})();

// Kleine schuur en tuinhuis
gebouw({m:[-35.1,-11.4,-28.2,-3.7],as:'z',goot:2.5,nok:4.8,wand:K.groenhout,dak:K.pandonker});
gevelvlak(-28.16,1.15,-7.55,2.2,2.3,'x',K.wit,false);
var huidigGroep=new THREE.Group(), nieuwGroep=new THREE.Group(); nieuwGroep.visible=false; scene.add(huidigGroep); scene.add(nieuwGroep);
function tuinhuis(ouder,cx,cz,metBijkeuken){ // dierenschuur: 6,5 x 6,4 m (BAG), open overkapping aan de kant van het oude huis
  var g=new THREE.Group(); g.position.set(cx,0,cz); g.rotation.y=Math.PI/2; ouder.add(g); // open overkapping naar het oude huis (Martijn 13-11)
  var b=gebouw({m:[-1.1,-3.2,3.2,3.2],as:'x',goot:2.2,nok:3.6,wand:K.groenhout,dak:K.pan,ouder:g}), pr=b.userData.prof, L=b.userData.L;
  dakplaat(b,pr[2],pr[3],-0.06,1.02,-L/2-2.4,-L/2-0.3,0.16,0.08,M(K.pan)); dakplaat(b,pr[3],pr[4],-0.06,1.02,-L/2-2.4,-L/2-0.3,0.16,0.08,M(K.pan));
  [-3.05,0,3.05].forEach(function(dz){var st=doos(0.14,2.2,0.14,M(K.groenhout)); st.position.set(-3.2,1.1,dz); g.add(st);});
  var vl=doos(2.1,0.12,6.4,M(0x6b5a4a)); vl.position.set(-2.15,0.06,0); g.add(vl);
  g.userData.buiten=[b];
  if(metBijkeuken){
    // Nieuwe situatie: overkapping = fietsenstalling, dichte deel = bijkeuken (Martijn 13-11).
    // Lokaal: dichte deel x -1,1..3,2; overkapping x -3,2..-1,1; z +3,2 ligt aan de kant van de glazen sluis.
    var bk=new THREE.Group(); bk.visible=false; g.add(bk); g.userData.binnen=bk;
    var sd=doos(0.9,2.05,0.06,M(0x1f2326)); sd.position.set(0.3,1.03,3.24); g.add(sd); g.userData.buiten.push(sd); // buitendeur naar de sluis
    var hout=M(K.groenhout);
    wand(bk,-3.2,3.2,3.2,'z',[],0.15,2.2,hout);                                  // achterwand
    wand(bk,-3.2,3.2,-1.1,'z',[{c:2.0,w:0.9,s:0,h:2.05}],0.15,2.2,hout);         // wand naar de fietsenstalling met deur
    wand(bk,-1.1,3.2,-3.2,'x',[{c:1.2,w:1.0,s:1.0,h:0.8,glas:true}],0.15,2.2,hout);
    wand(bk,-1.1,3.2,3.2,'x',[{c:0.3,w:0.9,s:0,h:2.05}],0.15,2.2,hout);   // deur naar de glazen sluis
    meubel(bk,-1.0,-3.1,3.1,3.1,0.06,0xb9b2a4,0.06);                             // vloer
    meubel(bk,2.45,-2.9,3.1,0.6,0.9,0xe9e6df);                                   // werkblad met spoelbak
    meubel(bk,2.45,0.7,3.1,1.35,1.8,0xf4f4f2);                                   // wasmachine + droger
    meubel(bk,-0.95,-3.05,0.6,-2.5,2.0,0xdad4c8);                                // kast
    // fietsen onder de overkapping
    [-2.7,-1.6].forEach(function(z){var f=new THREE.Group(); f.position.set(-2.2,0,z); f.rotation.y=Math.PI/2;
      [-0.55,0.55].forEach(function(x){var w=new THREE.Mesh(new THREE.TorusGeometry(0.33,0.035,6,18),M(0x22262a)); w.position.set(x,0.35,0); f.add(w);});
      var fr=doos(1.1,0.05,0.05,M(0x8a3b2b)); fr.position.set(0,0.62,0); f.add(fr); var st=doos(0.05,0.35,0.05,M(0x8a3b2b)); st.position.set(-0.2,0.8,0); f.add(st);
      var stuur=doos(0.05,0.05,0.5,M(0x22262a)); stuur.position.set(0.5,0.95,0); f.add(stuur); g.add(f);});
  }
  return g;
}
tuinhuis(huidigGroep,20.65,-21.6);
// Nieuwe situatie: dierenschuur en glazen sluis zitten vast aan de mantelzorgwoning en schuiven/draaien mee.
// Posities ten opzichte van het midden van de woning (bij draaiing 180°).
var koppel=new THREE.Group(); nieuwGroep.add(koppel);
// Privacyhaag (Martijn 13-11): in het verlengde van de kopgevel van de koeienschuur, tussen 30a en de mantelzorgwoning,
// hoog tot halverwege de voortuin, daarna lager door tot de sloot langs de weg.
function haagM(x0,x1,z,h){var m=doos(x1-x0,h,0.8,M(K.haag)); m.position.set((x0+x1)/2,h/2,z); nieuwGroep.add(m);}
haagM(16.4,51,-17.3,1.8); haagM(51,60.2,-17.3,1.0);
// Tuin van de mantelzorgwoning (ontwerpvoorstel): terras voor de glazen kopgevel, stapstenen door het gazon naar een zitplek,
// border met vaste planten langs de haag, siergrassen langs de sloot en twee meerstammige krentenbomen.
(function(){
  var T=new THREE.Group(); nieuwGroep.add(T);
  function plat(w,d,x,z,kleur,y){var m=doos(w,0.06,d,M(kleur)); m.castShadow=false; m.position.set(x,(y||0.09),z); T.add(m); return m;}
  plat(4.8,7.8,35.4,-23.9,0xa8a398);                                        // terras natuursteen
  for(var i=0;i<5;i++){var v=doos(0.04,0.04,7.8,M(0x8f8a80)); v.castShadow=false; v.position.set(33.4+i*0.95,0.125,-23.9); T.add(v);}
  var tafel=doos(1.6,0.75,0.9,M(0x6b5642)); tafel.position.set(35.9,0.38,-23.4); T.add(tafel);
  [[34.8,-23.4],[37.0,-23.4]].forEach(function(c){var st=doos(0.55,0.9,0.55,M(0x2f3437)); st.position.set(c[0],0.45,c[1]); T.add(st);});
  var pot=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.28,0.6,12),M(0x9a8a78)); pot.position.set(37.4,0.3,-21.0); T.add(pot);
  var potp=new THREE.Mesh(new THREE.IcosahedronGeometry(0.45,1),M(0x5f8a4a)); potp.position.set(37.4,0.85,-21.0); T.add(potp);
  // stapstenen in een flauwe boog naar de zitplek
  for(var k=0;k<14;k++){var t=k/13, x=38.3+t*12.4, z=-25.4+Math.sin(t*Math.PI)*1.6;
    var st=new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,0.05,10),M(0xbdb6a6)); st.position.set(x,0.09,z); st.castShadow=false; T.add(st);}
  // zitplek met bank
  var zp=new THREE.Mesh(new THREE.CylinderGeometry(2.0,2.0,0.05,32),M(0xd6ccb8)); zp.position.set(52.6,0.08,-25.6); zp.castShadow=false; T.add(zp);
  var bank=doos(1.7,0.12,0.5,M(0x8a6a4c)); bank.position.set(52.8,0.45,-24.4); T.add(bank);
  var rug=doos(1.7,0.45,0.08,M(0x8a6a4c)); rug.position.set(52.8,0.75,-24.15); T.add(rug);
  [-0.7,0.7].forEach(function(d){var poot=doos(0.08,0.4,0.45,M(0x3a3d3f)); poot.position.set(52.8+d,0.2,-24.4); T.add(poot);});
  // border langs de haag
  plat(24.5,1.6,46.0,-18.6,0x5b4636,0.07);
  var seed=11; function rnd(){seed=(seed*16807)%2147483647; return seed/2147483647;}
  var kleuren=[0x8f7bc0,0xf0efe8,0xd98fae,0x6f9a52,0xb7c95a,0x8f7bc0];
  for(var b=0;b<46;b++){var r=0.25+rnd()*0.3, pl=new THREE.Mesh(new THREE.IcosahedronGeometry(r,0),M(kleuren[b%kleuren.length]));
    pl.position.set(34.2+rnd()*23.6,r*0.8,-19.3+rnd()*1.3); pl.scale.y=0.9+rnd()*0.6; pl.castShadow=true; T.add(pl);}
  // siergrassen langs de waterkant, met een vrije strook voor slootonderhoud bij de woning
  for(var g=0;g<16;g++){var gr=new THREE.Mesh(new THREE.IcosahedronGeometry(0.42,0),M(0xc2b48a)); gr.scale.set(1,1.7,1); gr.position.set(39+g*1.3+rnd()*0.4,0.62,-30.6+rnd()*0.4); T.add(gr);}
  // meerstammige krentenbomen (Amelanchier)
  boom(PX(40.2),PZ(-19.9),4.2,0x9bb55a,false,T); boom(PX(54.6),PZ(-23.4),4.0,0x9bb55a,false,T);
})();
var DIER=[-11.25,-0.3], SLUIS=[-7.25,-0.6]; // sluis vanuit het dichte deel (bijkeuken), niet vanuit de overkapping
var dierNieuw=tuinhuis(koppel,DIER[0],DIER[1],true);
// glazen sluis tussen dierenschuur en mantelzorgwoning
(function(){
  var gl=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.3,1.8),new THREE.MeshLambertMaterial({color:lin(0x9fc3d1),transparent:true,opacity:0.55})); gl.position.set(SLUIS[0],1.15,SLUIS[1]); koppel.add(gl);
  var dk=doos(1.6,0.1,1.7,M(0x1f2326)); dk.position.set(SLUIS[0],2.35,SLUIS[1]); koppel.add(dk);
  [[-0.75,-0.8],[-0.75,0.8],[0.75,-0.8],[0.75,0.8]].forEach(function(h){var st=doos(0.07,2.3,0.07,M(0x1f2326)); st.position.set(SLUIS[0]+h[0],1.15,SLUIS[1]+h[1]); koppel.add(st);});
})();

/* ---------- Inrichting ---------- */
var inrichting=new THREE.Group(); scene.add(inrichting);
function auto(px,py,langsX,kleur,bus){
  var g=new THREE.Group(), l=bus?5.0:4.4, h=bus?1.9:1.1;
  var o=doos(l,h*0.62,1.8,M(kleur)); o.position.y=0.25+h*0.31; g.add(o);
  var b=doos(l*(bus?0.96:0.55),h*0.45,1.65,M(bus?kleur:0x1c2227)); b.position.set(bus?0:-0.2,0.25+h*0.62+h*0.2,0); g.add(b);
  g.position.set(X(px),0,Z(py)); if(!langsX) g.rotation.y=Math.PI/2; inrichting.add(g);
}
auto(1465,937,true,0x1e2226); auto(922,760,true,0x23272b); auto(920,797,true,0xe6e6e2);
auto(470,915,false,0x2b2f33,true); auto(505,915,false,0xe8e8e4,true); auto(543,917,false,0xdcdcd8); auto(718,668,false,0x2f4f86,true);
function trampoline(px,py,ouder){
  var r=new THREE.Mesh(new THREE.CylinderGeometry(1.9,1.9,0.12,24),M(0x2e8f6a)); r.position.set(X(px),0.06,Z(py)); (ouder||inrichting).add(r);
  var m=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,0.14,24),M(0x1a1d1f)); m.position.set(X(px),0.07,Z(py)); (ouder||inrichting).add(m);
}
trampoline(880,427); trampoline(1275,515,huidigGroep);
// opslag: pallets en stenen
(function(){
  var seed=7; function rnd(){seed=(seed*16807)%2147483647; return seed/2147483647;}
  var plekken=[[258,640,300,1000,14],[950,395,1020,470,5],[1025,395,1130,470,6,1],[560,600,640,640,5],[690,880,760,990,4]];
  plekken.forEach(function(p){ for(var i=0;i<p[4];i++){
    var h=0.5+rnd()*1.1, m=doos(1.0+rnd()*0.5,h,0.9+rnd()*0.4,M(rnd()>.5?0x9a8468:0x8f8a82));
    m.position.set(X(p[0]+rnd()*(p[2]-p[0])),h/2,Z(p[1]+rnd()*(p[3]-p[1]))); (p[5]?huidigGroep:inrichting).add(m);
  }});
})();
// dam met duiker bij de inrit en bruggetje in het betonpad
(function(){var d=doos(5.5,0.3,1.2,M(0x8d8a82)); d.position.set(66,0.15,22); d.rotation.y=Math.PI/2; d.scale.set(1.6,1,6); inrichting.add(d);})();

/* ---------- Groen ---------- */
var groen=new THREE.Group(); scene.add(groen);
function boom(px,py,hoogte,kleur,slank,ouder){
  var g=new THREE.Group(), st=hoogte*0.42;
  var s=new THREE.Mesh(new THREE.CylinderGeometry(Math.max(0.06,hoogte*0.012),Math.max(0.09,hoogte*0.02),st,6),M(K.stam)); s.position.y=st/2; s.castShadow=true; g.add(s);
  var r=hoogte*(slank?0.16:0.22), mat=M(kleur);
  [[0,st+r*0.7,0,1],[r*0.5,st+r*1.5,r*0.2,0.8],[-r*0.45,st+r*1.35,-r*0.3,0.75]].forEach(function(k){
    var b=new THREE.Mesh(new THREE.IcosahedronGeometry(r*k[3],1),mat); b.position.set(k[0],k[1],k[2]); b.scale.y=slank?1.5:1.05; b.castShadow=true; g.add(b);
  });
  g.position.set(X(px),0,Z(py)); g.rotation.y=(px*13+py*7)%6; (ouder||groen).add(g);
}
function haag(ax,ay,bx,by,h,ouder){
  var x0=X(ax),z0=Z(ay),x1=X(bx),z1=Z(by),dx=x1-x0,dz=z1-z0,len=Math.sqrt(dx*dx+dz*dz);
  var m=doos(len,h,0.9,M(K.haag)); m.position.set((x0+x1)/2,h/2,(z0+z1)/2); m.rotation.y=-Math.atan2(dz,dx); (ouder||groen).add(m);
}
var groenH=new THREE.Group(), groenN=new THREE.Group(); groenN.visible=false; groen.add(groenH); groen.add(groenN);
// Alleen bomen die op de loodrechte foto en in de video te zien zijn; hoogtes geschat tegen de gebouwen.
var i;
[[1878,905],[1872,840],[1866,770],[1860,700],[1838,365]].forEach(function(p){boom(p[0],p[1],10,K.blad);});   // wegberm
boom(1962,1150,10,K.blad);
[1300,1420,1550,1680,1790].forEach(function(px){boom(px,1050,10,K.esdoorn);});                          // esdoorns langs de oprit
for(i=0;i<11;i++) boom(300+i*80,1076,6,K.wilg,true);                                                   // knotwilgen langs het achtererf
boom(1735,420,7,K.wilg); boom(1740,500,7,K.wilg); boom(1530,362,6,K.wilg);                              // wilgen aan de tuinrand
boom(1235,570,6.5,K.blad);                                                                             // grote boom in de tuin
boom(1320,560,3.5,K.blad);
boom(1560,405,2.4,K.blad,true); boom(1400,400,2.4,K.blad,true,groenH); boom(1600,520,2.4,K.blad,true,groenH); boom(1420,470,2.4,K.blad,true,huidigGroep); boom(1165,384,5,K.blad,false,huidigGroep);   // jonge aanplant op het gazon
(function(){var st=new THREE.Mesh(new THREE.IcosahedronGeometry(1.1,1),M(0xa9b04a)); st.position.set(X(1292),0.9,Z(456)); st.castShadow=true; huidigGroep.add(st);})(); // ronde struik naast de trampoline
[[1040,384,5.5],[748,385,4.5],[690,385,4.5],[535,385,4],[440,385,4]].forEach(function(p){boom(p[0],p[1],p[2],K.blad);}); // oever noordsloot
(function(){var st=new THREE.Mesh(new THREE.IcosahedronGeometry(1.3,1),M(K.haag)); st.position.set(X(891),1.0,Z(382)); st.castShadow=true; groen.add(st);})();
[412,446,480,514].forEach(function(px){boom(px,578,4.2,0x9a6a3a);});                                    // rij bij de kleine schuur
boom(262,965,3.8,0x8c4a3a); boom(315,402,4.5,K.blad);
for(i=0;i<7;i++) boom(-320+i*95,250-i*8,9,K.blad);                                                     // bosrand aan de overkant van het weiland
haag(1500,738,1750,738,1.6); haag(1555,941,1795,941,1.6);
haag(1325,626,1590,626,1.3,groenH); haag(1410,626,1590,626,1.3,groenN); haag(1590,626,1590,738,1.3); // nieuw: oude haag aan de huiskant circa 6 m ingekort

/* ---------- Luchtfoto (PDOK, Beeldmateriaal Nederland, CC BY 4.0) ---------- */
// Beeld beslaat RD-lokaal e 10..190, n -30..150. Hoekpunten worden naar het model omgerekend.
var luchtfoto=(function(){
  var e0=10,e1=190,n0=-30,n1=150, hoeken=[[e0,n1],[e1,n1],[e0,n0],[e1,n0]];
  var geo=new THREE.BufferGeometry(), pos=[], uv=[];
  hoeken.forEach(function(h){var m=R(h[0],h[1]); pos.push(m[0],0.04,m[1]); uv.push((h[0]-e0)/(e1-e0),(h[1]-n0)/(n1-n0));});
  geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geo.setIndex([0,2,1,1,2,3]); geo.computeVertexNormals();
  var img=new Image(), tex=new THREE.Texture(img); tex.encoding=THREE.sRGBEncoding; tex.anisotropy=8;
  img.onload=function(){tex.needsUpdate=true;}; img.src='/hoogeind/luchtfoto.jpg';
  var mesh=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:tex,side:THREE.DoubleSide})); mesh.receiveShadow=true; mesh.visible=false; scene.add(mesh);
  return mesh;
})();

/* ---------- Raster en noordpijl ---------- */
var raster=new THREE.GridHelper(200,20,0x33443a,0x33443a); raster.position.y=0.12; raster.material.transparent=true; raster.material.opacity=0.45; raster.visible=false; scene.add(raster);
(function(){
  var g=new THREE.Group(), mat=M(0x1f2a24);
  var s=doos(6,0.1,0.7,mat); s.castShadow=false; g.add(s);
  var punt=new THREE.Mesh(new THREE.ConeGeometry(1.3,2.6,3),mat); punt.rotation.z=Math.PI/2; punt.rotation.x=Math.PI/2; punt.position.set(-4,0.05,0); punt.scale.y=1; g.add(punt);
  g.position.set(42.4,0.2,45.3); g.rotation.y=0.4625; scene.add(g);
})();

/* ---------- Mantelzorgwoning (nieuwe situatie) ---------- */
// Rechthoekig 13 x 8 m, zadeldak, nok 4,60 m (opgave Martijn 13-11).
// Lokale assen: x = lengte 10 m (glazen kopgevel op x = -5), z = diepte 7,5 m.
var vol=new THREE.Group(); vol.visible=false; vol.position.set(26.25,0,-23.5); scene.add(vol);
(function(){
  // Martijn 13-11: rechthoekig, 13 x 8 m (104 m²), zadeldak met nok 4,60 m, goot 2,70 m (goot is een schatting).
  // Lokale assen: x = lengte 13 m (glazen kopgevel op x = -6,5, bij 180° naar de weg), z = diepte 8 m (z = +4 aan de slootkant).
  var STUC=0xf3f0e9, STRIP=0x8a5a48, DAK=0x2e3033, KOZIJN=0x1f2326, NOK=4.6, GOOT=2.7, HL=6.5, HD=4;
  var n0=vol.children.length;
  var gw=gebouw({m:[-HL,-HD,HL,HD],as:'x',goot:GOOT,nok:NOK,wand:STUC,dak:DAK,ouder:vol});
  function dakH(z){return GOOT+(NOK-GOOT)*(1-Math.abs(z)/HD);}
  // Gevelopeningen volgens de Vilaro-plattegrond (13-11-2026): 12,99 x 8,00 m. d = afstand vanaf de kopgevel aan de wegkant.
  // Kopgevel wegkant: twee vaste glaspuien 1800x2200. Slootkant (z +4): 2x 900x2200, 2x 700x1200, 600x800.
  // Haagkant (z -4): openslaande deuren 1800x2200, 900x2200, 2x 650x1200, 800x800. Kopgevel erfzijde: voordeur 1150x2200 (naar de sluis), raam 600x800.
  // Gedetailleerde kozijnen: zwart aluminium kader, glas iets terug, bovenlicht bij hoge puien, middenstijl bij brede puien,
  // waterslag onder ramen met borstwering, voordeur als dicht paneel met glasstrook en greep.
  var GLAS=new THREE.MeshLambertMaterial({color:lin(0x46606e)}), ALU=M(0xb8bcc0), DEURP=M(0x2b2f33);
  function zet(m,n,sg,u,y,off){ if(n==='z') m.position.set(u,y,sg*(HD+off)); else m.position.set(sg*(HL+off),y,u); m.castShadow=false; vol.add(m); return m; }
  function blok(n,wu,h,d){ return n==='z'?[wu,h,d]:[d,h,wu]; }
  function stuk(n,sg,u,y,wu,h,d,off,mat){ var a=blok(n,wu,h,d); return zet(doos(a[0],a[1],a[2],mat),n,sg,u,y,off); }
  function raamD(n,sg,u,b,h,borst,soort){
    var y0=borst, k=0.07;
    if(soort==='voordeur'){ stuk(n,sg,u,y0+h/2,b,h,0.03,0.015,DEURP); stuk(n,sg,u-b*0.22,y0+h/2,0.16,h-0.4,0.02,0.035,GLAS);
      stuk(n,sg,u+b*0.3,y0+1.05,0.04,0.45,0.05,0.06,ALU); }
    else stuk(n,sg,u,y0+h/2,b,h,0.02,0.012,GLAS);
    stuk(n,sg,u,y0+h-k/2,b+0.02,k,0.08,0.04,M(KOZIJN)); stuk(n,sg,u,y0+k/2,b+0.02,k,0.08,0.04,M(KOZIJN));
    stuk(n,sg,u-b/2,y0+h/2,k,h,0.08,0.04,M(KOZIJN)); stuk(n,sg,u+b/2,y0+h/2,k,h,0.08,0.04,M(KOZIJN));
    if(h>=2.0&&soort!=='voordeur') stuk(n,sg,u,y0+h-0.45,b,0.06,0.07,0.04,M(KOZIJN));          // bovenlicht
    if(b>=1.6) stuk(n,sg,u,y0+(h>=2?(h-0.45)/2:h/2),0.07,(h>=2?h-0.45:h),0.07,0.04,M(KOZIJN)); // middenstijl
    if(soort==='openslaand'){ [-0.12,0.12].forEach(function(dx){stuk(n,sg,u+dx,y0+1.05,0.03,0.22,0.05,0.07,ALU);}); }
    if(soort==='deurraam'){ stuk(n,sg,u+b/2-0.12,y0+1.05,0.03,0.2,0.05,0.07,ALU); }
    if(borst>0.3) stuk(n,sg,u,y0-0.02,b+0.12,0.04,0.16,0.07,ALU);                               // waterslag
  }
  function op(d,zijde,b,h,borst,deur){
    var soort=deur?'voordeur':(b>=1.6&&h>=2?(zijde==='haag'?'openslaand':'pui'):(h>=2?'deurraam':'raam'));
    if(zijde==='weg') raamD('x',-1,d,b,h,borst,soort);
    else if(zijde==='erf') raamD('x',1,d,b,h,borst,soort);
    else raamD('z',zijde==='sloot'?1:-1,-HL+d,b,h,borst,soort);
  }
  op(2.0,'weg',1.8,2.2,0.1); op(-2.0,'weg',1.8,2.2,0.1);
  op(1.75,'sloot',0.9,2.2,0.1); op(4.2,'sloot',0.9,2.2,0.1); op(6.8,'sloot',0.7,1.2,0.9); op(7.8,'sloot',0.7,1.2,0.9); op(10.15,'sloot',0.6,0.8,1.3);
  op(1.0,'haag',1.8,2.2,0.1); op(5.0,'haag',0.9,2.2,0.1); op(6.95,'haag',0.65,1.2,0.9); op(9.65,'haag',0.65,1.2,0.9); op(10.9,'haag',0.8,0.8,1.3);
  op(0.6,'erf',1.15,2.2,0.0,true); op(2.65,'erf',0.6,0.8,1.3);
  // Voorgevel (wegkant) naar het voorbeeld van Martijn (13-11): middenpenant in wit stucwerk die als schoorsteen door het dak loopt,
  // geveltop ook wit gestuct (geen hout), witte boeiboorden en gootlijsten; de glaspuien krijgen een bovenlicht.
  var WIT=M(0xf6f5f1);
  var pen=doos(0.45,5.35,1.0,M(STUC)); pen.position.set(-HL-0.2,5.35/2,0); vol.add(pen);
  var kap=doos(0.6,0.1,1.15,M(0x3a3d40)); kap.position.set(-HL-0.2,5.4,0); vol.add(kap);
  var pl=doos(0.47,0.45,1.02,M(STRIP)); pl.position.set(-HL-0.2,0.225,0); vol.add(pl);
  function boei(x){ [-1,1].forEach(function(k){
    var z0=k*(HD+0.32), y0=GOOT-0.12, z1=0, y1=NOK+0.12, l=Math.hypot(z1-z0,y1-y0);
    var b=doos(0.06,0.22,l,WIT); b.castShadow=false; b.position.set(x,(y0+y1)/2,(z0+z1)/2); b.rotation.x=k*Math.atan2(y1-y0,Math.abs(z1-z0)); vol.add(b); }); }
  boei(-HL-0.34); boei(HL+0.34);
  [-1,1].forEach(function(k){var g=doos(2*HL+0.7,0.2,0.12,WIT); g.castShadow=false; g.position.set(0,GOOT-0.08,k*(HD+0.32)); vol.add(g);});
  // ---------- Detaillering buitenkant ----------
  function tex(w,h,teken,ru,rv){var c=document.createElement('canvas'); c.width=w; c.height=h; teken(c.getContext('2d'),w,h);
    var t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(ru,rv); t.anisotropy=4; return t;}
  // dakpannen: rijen langs de nok, verspringende pannen
  var panTex=tex(128,128,function(x,w,h){x.fillStyle='#2f3236';x.fillRect(0,0,w,h);
    for(var r=0;r<4;r++){var u=r*32; x.fillStyle='#24272a'; x.fillRect(u,0,5,h); x.fillStyle='#3a3e42'; x.fillRect(u+5,0,4,h);
      for(var k=0;k<4;k++){var v=k*32+(r%2?16:0); x.fillStyle='#282b2e'; x.fillRect(u+5,v%h,27,2);}}},1,1);
  var panMat=new THREE.MeshLambertMaterial({map:panTex});
  gw.children.forEach(function(m){ if(m.material===M(DAK)){ var len=m.geometry.parameters.width, br=m.geometry.parameters.depth;
    var t=panTex.clone(); t.needsUpdate=true; t.repeat.set(len/1.32,br/1.2); m.material=new THREE.MeshLambertMaterial({map:t}); }});
  // stucwerk: fijne korrel
  var stucTex=tex(128,128,function(x,w,h){x.fillStyle='#f3f0e9';x.fillRect(0,0,w,h); for(var i=0;i<1400;i++){var g=225+Math.floor(Math.random()*30); x.fillStyle='rgb('+g+','+(g-2)+','+(g-8)+')'; x.fillRect(Math.random()*w,Math.random()*h,1.2,1.2);}},1,1);
  gw.children[0].material=new THREE.MeshLambertMaterial({map:stucTex});
  // steenstrips in halfsteensverband
  function stripTex(lengte){return tex(128,64,function(x,w,h){x.fillStyle='#b9b1a6';x.fillRect(0,0,w,h);
    for(var r=0;r<4;r++){for(var k=-1;k<3;k++){var u=k*64+(r%2?32:0); var tint=['#8a5a48','#7f5242','#94604c','#865746'][(r+k+4)%4]; x.fillStyle=tint; x.fillRect(u+2,r*16+2,60,13);}}},lengte/0.44,PH/0.26);}
  // Plint van steenstrips, 45 cm hoog, onderbroken bij deuren en puien tot de vloer (Martijn 13-11).
  var PH=0.45;
  function plintMat(lang,kort){return [new THREE.MeshLambertMaterial({map:stripTex(kort)}),new THREE.MeshLambertMaterial({map:stripTex(kort)}),M(STRIP),M(STRIP),new THREE.MeshLambertMaterial({map:stripTex(lang)}),new THREE.MeshLambertMaterial({map:stripTex(lang)})];}
  function plintZijde(langs,vast,a0,a1,gaten){ var a=a0; gaten.concat([[a1+1,0]]).sort(function(p,q){return p[0]-q[0];}).forEach(function(g){
      var b=Math.min(g[0]-g[1]/2,a1); if(b-a>0.02){ var l=b-a, m;
        if(langs==='x'){ m=new THREE.Mesh(new THREE.BoxGeometry(l,PH,0.06),plintMat(l,0.06)); m.position.set((a+b)/2,PH/2,vast); }
        else { m=new THREE.Mesh(new THREE.BoxGeometry(0.06,PH,l),[new THREE.MeshLambertMaterial({map:stripTex(l)}),new THREE.MeshLambertMaterial({map:stripTex(l)}),M(STRIP),M(STRIP),M(STRIP),M(STRIP)]); m.position.set(vast,PH/2,(a+b)/2); }
        m.castShadow=true; m.receiveShadow=true; vol.add(m); }
      a=Math.max(a,g[0]+g[1]/2); }); }
  var e=0.03, G=0.14;
  plintZijde('x',HD+e,-HL-0.06,HL+0.06,[[-HL+1.75,0.9+G],[-HL+4.2,0.9+G]]);              // slootkant
  plintZijde('x',-HD-e,-HL-0.06,HL+0.06,[[-HL+1.0,1.8+G],[-HL+5.0,0.9+G]]);              // haagkant
  plintZijde('z',-HL-e,-HD,HD,[[2.0,1.8+G],[-2.0,1.8+G]]);                                // wegkant
  plintZijde('z',HL+e,-HD,HD,[[0.6,1.15+G]]);                                             // erfzijde
  pl.material=[new THREE.MeshLambertMaterial({map:stripTex(1.0)}),new THREE.MeshLambertMaterial({map:stripTex(1.0)}),M(STRIP),M(STRIP),new THREE.MeshLambertMaterial({map:stripTex(0.47)}),new THREE.MeshLambertMaterial({map:stripTex(0.47)})];
  // nokvorsten
  var nk=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,2*HL+0.6,12,1,false,0,Math.PI),M(0x26282b)); nk.rotation.z=Math.PI/2; nk.rotation.x=Math.PI/2; nk.position.set(0,NOK+0.14,0); nk.castShadow=true; vol.add(nk);
  // mastgoten en hemelwaterafvoeren
  [-1,1].forEach(function(k){var gt=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,2*HL+0.66,10,1,false,0,Math.PI),WIT); gt.rotation.z=Math.PI/2; gt.rotation.y=k>0?0:Math.PI; gt.position.set(0,GOOT-0.1,k*(HD+0.42)); vol.add(gt);
    [-1,1].forEach(function(e){var hw=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,GOOT-0.1,8),M(0x8b9095)); hw.position.set(e*(HL-0.15),(GOOT-0.1)/2,k*(HD+0.1)); vol.add(hw);});});
  // buitenlampen bij de voordeur, de openslaande deuren en op de penant
  function lamp(x,y,z,rotY){var l=new THREE.Group(); var hus=doos(0.14,0.24,0.12,M(0x1c1e20)); l.add(hus); var gl=doos(0.1,0.16,0.02,M(0xfff1c9)); gl.position.z=0.065; l.add(gl);
    l.position.set(x,y,z); l.rotation.y=rotY; vol.add(l);}
  lamp(HL+0.07,2.05,0.6+0.9,Math.PI/2); lamp(-HL+1.0+1.25,2.15,-HD-0.07,Math.PI); lamp(-HL-0.44,2.4,0,-Math.PI/2);
  // dorpels onder de deuren
  [[-HL+1.0,1.9],[-HL+5.0,1.0],[-HL+1.75,1.0],[-HL+4.2,1.0]].forEach(function(q,i){var z=i<2?-HD-0.08:HD+0.08; var dp=doos(q[1],0.06,0.16,ALU); dp.position.set(q[0],0.1,z); vol.add(dp);});
  vol.userData.buiten=vol.children.slice(n0);
  // ---------- Indeling volgens de Vilaro-plattegrond ----------
  // Plattegrondmaten: d = afstand vanaf de kopgevel aan de wegkant, t = afstand vanaf de slootgevel. Lokaal: x = -HL + d, z = HD - t.
  var IN=new THREE.Group(); IN.visible=false; vol.add(IN); vol.userData.binnen=IN;
  function X(d){return -HL+d;} function Z(t){return HD-t;}
  var buitenW=M(STUC), binnenW=M(0xf7f5f0), D=0.25, WH=2.7, IH=2.6;
  meubel(IN,-HL,-HD,HL,HD,0.06,0xc8a97e,0.06);                                       // houten vloer
  function o(d,w,s,h,glas){return {c:d,w:w,s:s,h:h,glas:glas!==false};}
  wand(IN,-HD,HD,-HL+D/2,'z',[{c:2.0,w:1.8,s:0.1,h:2.2,glas:true},{c:-2.0,w:1.8,s:0.1,h:2.2,glas:true}],D,WH,buitenW);   // wegkant
  wand(IN,-HD,HD,HL-D/2,'z',[{c:0.6,w:1.15,s:0,h:2.2,glas:false},{c:2.65,w:0.6,s:1.3,h:0.8,glas:true}],D,WH,buitenW);   // erfzijde
  wand(IN,-HL,HL,HD-D/2,'x',[o(X(1.75),0.9,0.1,2.2),o(X(4.2),0.9,0.1,2.2),o(X(6.8),0.7,0.9,1.2),o(X(7.8),0.7,0.9,1.2),o(X(10.15),0.6,1.3,0.8)],D,WH,buitenW); // sloot
  wand(IN,-HL,HL,-HD+D/2,'x',[o(X(1.0),1.8,0.1,2.2),o(X(5.0),0.9,0.1,2.2),o(X(6.95),0.65,0.9,1.2),o(X(9.65),0.65,0.9,1.2),o(X(10.9),0.8,1.3,0.8)],D,WH,buitenW); // haag
  function deur(c){return {c:c,w:0.9,s:0,h:2.1,glas:false};}
  var t=0.1;
  wand(IN,Z(3.65),Z(0),X(5.41),'z',[deur(Z(3.05))],t,IH,binnenW);                    // woonkamer | hal
  wand(IN,X(5.41),X(12.75),Z(2.35),'x',[deur(X(6.45)),deur(X(7.6)),deur(X(9.4))],t,IH,binnenW); // hal | berging, kamer, badkamer
  wand(IN,Z(2.35),Z(0),X(7.16),'z',[],t,IH,binnenW); wand(IN,Z(2.35),Z(0),X(8.91),'z',[],t,IH,binnenW);
  wand(IN,X(5.41),X(11.35),Z(3.65),'x',[deur(X(6.7))],t,IH,binnenW);                 // hal | slaapkamer
  wand(IN,Z(8),Z(3.65),X(6.11),'z',[],t,IH,binnenW);                                 // kastenwand woonkamer | slaapkamer
  wand(IN,Z(8),Z(3.65),X(10.04),'z',[],t,IH,binnenW);                                // slaapkamer | meterkast, toilet
  wand(IN,Z(8),Z(3.65),X(11.35),'z',[{c:Z(4.6),w:0.6,s:0,h:2.1},{c:Z(6.8),w:0.7,s:0,h:2.1}],t,IH,binnenW);
  wand(IN,X(10.04),X(11.35),Z(5.65),'x',[],t,IH,binnenW);
  // meubels (naar de tekening)
  meubel(IN,X(0.65),Z(0.95),X(1.5),Z(2.35),0.8,0x6f7a86);                            // bank
  meubel(IN,X(2.2),Z(0.7),X(2.7),Z(1.2),0.75,0x9a8a78); meubel(IN,X(3.0),Z(0.7),X(3.5),Z(1.2),0.75,0x9a8a78); // fauteuils
  meubel(IN,X(0.8),Z(5.4),X(1.8),Z(6.8),0.75,0x8a6a4c);                              // eettafel
  meubel(IN,X(3.2),Z(5.1),X(4.4),Z(7.4),0.9,0xe9e6df);                               // kookeiland
  meubel(IN,X(5.45),Z(3.8),X(6.06),Z(7.8),2.2,0xefece6);                             // kastenwand
  meubel(IN,X(5.5),Z(0.15),X(6.3),Z(1.9),0.5,0xb8c4cf);                              // slaapbank in de werkkamer (4,4 m²)
  meubel(IN,X(7.2),Z(5.5),X(9.05),Z(7.6),0.55,0xd8dee6);                             // bed
  meubel(IN,X(7.2),Z(3.75),X(9.7),Z(4.4),2.2,0xefece6);                              // kledingkast
  meubel(IN,X(9.3),Z(0.1),X(12.2),Z(0.85),0.55,0xf4f4f2);                            // douche/bad
  meubel(IN,X(12.2),Z(1.3),X(12.7),Z(1.9),0.45,0xf4f4f2); meubel(IN,X(10.3),Z(1.7),X(10.9),Z(2.25),0.85,0xf4f4f2); // toilet, wastafel
  meubel(IN,X(10.4),Z(7.1),X(10.95),Z(7.7),0.45,0xf4f4f2);                           // toilet
  // ---------- Binnendetaillering ----------
  function vlak(x0,z0,x1,z1,kleur,y){var m=doos(Math.abs(x1-x0),0.012,Math.abs(z1-z0),M(kleur)); m.castShadow=false; m.position.set((x0+x1)/2,(y||0.125),(z0+z1)/2); IN.add(m); return m;}
  function cyl(x,z,r,h,kleur,y){var c=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),M(kleur)); c.position.set(x,(y||0.12)+h/2,z); IN.add(c); return c;}
  // tegelvloer in badkamer, toilet, meterkast en berging; deurmat bij de voordeur
  vlak(X(8.91),Z(2.35),X(12.75),Z(0.12),0xb9bcbf); vlak(X(10.04),Z(8),X(11.35),Z(5.65),0xb9bcbf); vlak(X(7.16),Z(2.35),X(8.91),Z(0.12),0xc9c4ba);
  vlak(X(12.0),Z(3.0),X(12.7),Z(4.2),0x55524e);
  // plinten langs de buitenwanden
  [[-HL+0.3,HL-0.3,HD-0.3,'x'],[-HL+0.3,HL-0.3,-HD+0.3,'x']].forEach(function(q){var m=doos(q[1]-q[0],0.07,0.015,M(0xffffff)); m.position.set((q[0]+q[1])/2,0.155,q[2]); IN.add(m);});
  // binnendeuren: deurbladen half open
  function deurblad(x,z,richting,draai){var d=new THREE.Group(); var b=doos(0.82,2.05,0.04,M(0xf2efe8)); b.position.set(0.41,1.15,0); d.add(b);
    var k=doos(0.12,0.03,0.05,M(0x7d8287)); k.position.set(0.72,1.15,0.04); d.add(k); d.position.set(x,0,z); d.rotation.y=richting+draai; IN.add(d);}
  deurblad(X(5.41),Z(3.05)-0.45,Math.PI/2,0.9);  deurblad(X(6.45)-0.45,Z(2.35),0,-0.9); deurblad(X(7.6)-0.45,Z(2.35),0,-0.9);
  deurblad(X(9.4)-0.45,Z(2.35),0,-0.9); deurblad(X(6.7)-0.45,Z(3.65),0,0.9);
  // woonkamer: vloerkleed, salontafel, tv-meubel met tv, boekenkast, staande lamp, planten, eetstoelen, hanglampen
  vlak(X(0.5),Z(0.6),X(3.8),Z(3.2),0xb7a58c,0.13);
  cyl(X(2.45),Z(1.9),0.42,0.42,0x6b5642);
  meubel(IN,X(4.95),Z(0.6),X(5.3),Z(2.6),0.5,0x3b3f43); meubel(IN,X(5.25),Z(0.9),X(5.3),Z(2.3),0.7,0x111315,0.62);
  meubel(IN,X(0.2),Z(2.7),X(0.55),Z(3.6),1.9,0xb08b62);
  cyl(X(0.4),Z(0.45),0.03,1.5,0x2a2c2e); cyl(X(0.4),Z(0.45),0.18,0.25,0xf3e7cf,1.62);
  [[X(4.9),Z(0.35)],[X(0.35),Z(4.3)],[X(4.9),Z(7.7)]].forEach(function(q){cyl(q[0],q[1],0.2,0.35,0x8d7a64); var pl=new THREE.Mesh(new THREE.IcosahedronGeometry(0.33,1),M(0x5f8a4a)); pl.position.set(q[0],0.85,q[1]); IN.add(pl);});
  [[0.6,5.6],[0.6,6.2],[2.0,5.6],[2.0,6.2]].forEach(function(q){meubel(IN,X(q[0])-0.22,Z(q[1])-0.22,X(q[0])+0.22,Z(q[1])+0.22,0.46,0x3a3d40);
    meubel(IN,X(q[0])+(q[0]<1?-0.24:0.2),Z(q[1])-0.22,X(q[0])+(q[0]<1?-0.2:0.24),Z(q[1])+0.22,0.45,0x3a3d40,0.46);});
  [[X(1.3),Z(6.1)],[X(3.8),Z(5.9)],[X(3.8),Z(6.7)]].forEach(function(q){cyl(q[0],q[1],0.01,0.8,0x2a2c2e,1.8); cyl(q[0],q[1],0.16,0.18,0x1f2124,1.62);});
  // keuken: werkblad met spoelbak en kookplaat op het eiland, achterwand met kasten en koelkast
  meubel(IN,X(3.18),Z(5.08),X(4.42),Z(7.42),0.04,0x3d3f42,1.02);
  meubel(IN,X(3.5),Z(6.6),X(4.1),Z(7.1),0.02,0x9aa0a6,1.06); cyl(X(3.8),Z(7.25),0.02,0.3,0x9aa0a6,1.06);
  meubel(IN,X(3.45),Z(5.3),X(4.15),Z(5.95),0.01,0x121314,1.065);
  meubel(IN,X(2.6),Z(7.75),X(4.35),Z(7.98),0.9,0xe9e6df); meubel(IN,X(2.6),Z(7.7),X(4.35),Z(7.98),0.04,0x3d3f42,0.9);
  meubel(IN,X(2.6),Z(7.65),X(4.35),Z(7.98),0.7,0xe9e6df,1.6); meubel(IN,X(2.0),Z(7.3),X(2.6),Z(7.98),2.1,0xdcdad4);
  // hal: garderobe, kapstok, bankje
  meubel(IN,X(11.0),Z(3.45),X(12.5),Z(3.62),0.04,0x8a6a4c,1.75); [11.3,11.7,12.1].forEach(function(d){meubel(IN,X(d)-0.04,Z(3.4),X(d)+0.04,Z(3.48),0.06,0x2a2c2e,1.62);});
  // werkkamer: bureau en stoel
  meubel(IN,X(5.55),Z(1.95),X(6.95),Z(2.25),0.75,0xb08b62); meubel(IN,X(6.05),Z(1.6),X(6.5),Z(1.95),0.5,0x3a3d40);
  // berging: stellingkast
  meubel(IN,X(7.25),Z(0.15),X(8.8),Z(0.55),1.9,0xa8a9aa);
  // slaapkamer: kussens, dekbed, nachtkastjes, lampjes, kleed
  meubel(IN,X(7.25),Z(7.55),X(9.0),Z(7.6),0.9,0x8a6a4c,0.12);
  meubel(IN,X(7.3),Z(5.55),X(8.95),Z(6.9),0.08,0xb9c9d8,0.67);
  [7.75,8.5].forEach(function(d){meubel(IN,X(d)-0.32,Z(7.05),X(d)+0.32,Z(7.45),0.14,0xffffff,0.67);});
  [6.75,9.45].forEach(function(d){meubel(IN,X(d)-0.22,Z(7.2),X(d)+0.22,Z(7.6),0.5,0x8a6a4c); cyl(X(d),Z(7.4),0.08,0.22,0xf3e7cf,0.62);});
  vlak(X(6.9),Z(4.7),X(9.4),Z(5.6),0xc7b8a3,0.13);
  // badkamer: inloopdouche met glaswand, wastafelmeubel met spiegel, handdoekradiator, wandcloset
  meubel(IN,X(9.3),Z(0.15),X(11.0),Z(1.15),0.03,0xe2e2e0,0.12);
  var gw2=doos(0.02,2.0,0.95,new THREE.MeshLambertMaterial({color:lin(0xbfdbe6),transparent:true,opacity:0.35})); gw2.position.set(X(11.0),1.12,Z(0.65)); IN.add(gw2);
  cyl(X(9.5),Z(0.3),0.12,0.02,0x9aa0a6,2.1);
  meubel(IN,X(10.25),Z(1.85),X(11.35),Z(2.3),0.5,0x8a6a4c,0.45); meubel(IN,X(10.35),Z(1.9),X(11.25),Z(2.28),0.04,0xffffff,0.95);
  meubel(IN,X(10.35),Z(2.27),X(11.25),Z(2.3),0.7,0xc9d6dd,1.2);
  meubel(IN,X(12.68),Z(0.25),X(12.72),Z(0.85),1.1,0x2a2c2e,0.5);
  meubel(IN,X(12.15),Z(1.35),X(12.7),Z(1.85),0.4,0xffffff,0.35);
  // toilet en meterkast
  meubel(IN,X(10.1),Z(6.0),X(10.25),Z(6.4),0.3,0xffffff,0.8);
  meubel(IN,X(10.1),Z(4.0),X(10.6),Z(4.6),1.4,0x9aa0a6,0.6);
  vol.userData.route=[];
  // glazen overkapping langs de slootkant (Martijn 13-11), 3 m diep over de volle lengte, licht aflopend naar de sloot
  var gm=new THREE.MeshLambertMaterial({color:lin(0xbfdbe6),transparent:true,opacity:0.38,side:THREE.DoubleSide});
  var gp=new THREE.Mesh(new THREE.BoxGeometry(2*HL,0.03,3.0),gm); gp.position.set(0,2.6,HD+1.5); gp.rotation.x=0.06; vol.add(gp);
  var b1=doos(2*HL,0.16,0.12,M(KOZIJN)); b1.position.set(0,2.45,HD+2.95); vol.add(b1);
  [-HL+0.1,0,HL-0.1].forEach(function(x){var st=doos(0.1,2.45,0.1,M(KOZIJN)); st.position.set(x,1.22,HD+2.95); vol.add(st);});
  [-HL+0.1,HL-0.1].forEach(function(x){var b=doos(0.12,0.16,3.0,M(KOZIJN)); b.position.set(x,2.55,HD+1.5); vol.add(b);});
  [-4.5,-2,0.5,3,5.5].forEach(function(x){var r=doos(0.05,0.06,3.0,M(KOZIJN)); r.castShadow=false; r.position.set(x,2.62,HD+1.5); r.rotation.x=0.06; vol.add(r);});
  vol.userData.nok=NOK;
})();
function nl(n){return String(n).replace('.',',');}
var sR=document.getElementById('sR'), oR=document.getElementById('oR'), volInfo=document.getElementById('volInfo');
function werkVol(){
  vol.rotation.y=+sR.value*Math.PI/180; oR.textContent=sR.value+'°';
  koppel.position.copy(vol.position); koppel.rotation.y=vol.rotation.y-Math.PI;
  var th=etiketten&&etiketten.filter(function(e){return e.el.textContent==='Dierenschuur';})[0];
  if(th&&vol.visible){ koppel.updateMatrixWorld(true); th.p.set(DIER[0],4.3,DIER[1]); koppel.localToWorld(th.p); }
  volInfo.innerHTML='Positie <strong>x '+nl(vol.position.x.toFixed(1))+' · z '+nl(vol.position.z.toFixed(1))+' · '+sR.value+'°</strong>';
}
sR.addEventListener('input',werkVol); werkVol();

var straal=new THREE.Raycaster(), muis=new THREE.Vector2(), vloer=new THREE.Plane(new THREE.Vector3(0,1,0),0), sleept=false, sleepVerschil=new THREE.Vector3(), raak=new THREE.Vector3();
function zetMuis(e){var r=renderer.domElement.getBoundingClientRect(); muis.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); straal.setFromCamera(muis,camera);}
renderer.domElement.addEventListener('pointerdown',function(e){
  return; // verplaatsen uitgezet (Martijn 13-11)
  if(!vol.visible||loop.actief) return; zetMuis(e);
  if(straal.intersectObjects(vol.children.concat(koppel.children),true).length && straal.ray.intersectPlane(vloer,raak)){
    sleept=true; controls.enabled=false; sleepVerschil.copy(vol.position).sub(raak); renderer.domElement.setPointerCapture(e.pointerId); e.stopPropagation();
  }
},true);
renderer.domElement.addEventListener('pointermove',function(e){
  if(!sleept) return; zetMuis(e);
  if(straal.ray.intersectPlane(vloer,raak)){vol.position.x=Math.max(-60,Math.min(60,raak.x+sleepVerschil.x)); vol.position.z=Math.max(-40,Math.min(40,raak.z+sleepVerschil.z)); werkVol();}
});
function stopSleep(){ if(sleept){sleept=false; controls.enabled=true;} }
renderer.domElement.addEventListener('pointerup',stopSleep); renderer.domElement.addEventListener('pointercancel',stopSleep);

/* ---------- Etiketten ---------- */
var etiketten=[
  ['Woonhuis 30',1440,822,8.6],['Woonhuis 30a',1235,822,8.6],['Koeienschuur',1043,650,9.2],['Showroom',868,570,5.2],['Garage',1070,925,7.1],['Werkplaats',890,925,7.1],
  ['Ronde loods',496,796,5.4],['Kleine schuur',499,644,5.4],['Dierenschuur',1189,467,4.3],['Oprit',1620,1005,0.6],
  ['Voortuin',1612,838,0.6],['Tuin',1450,470,0.6],['Achtererf',700,960,0.6],['Openbare weg',1935,700,0.6],['Betonpad',900,1146,0.6],['Noord',1440,1330,1.2]
].map(function(e){var d=document.createElement('div'); d.className='etiket'; d.textContent=e[0]; toneel.appendChild(d); return {el:d,p:new THREE.Vector3(X(e[1]),e[3],Z(e[2]))};});
var volEtiket=(function(){var d=document.createElement('div'); d.className='etiket vol'; d.textContent='Mantelzorgwoning'; d.hidden=true; toneel.appendChild(d); return {el:d,p:new THREE.Vector3(),vol:true};})();
etiketten.push(volEtiket);
var toonLabels=false, v3=new THREE.Vector3(), breed=1, hoog=1;
function werkEtiketten(){
  etiketten.forEach(function(e){
    if(e.vol){ if(!vol.visible||!toonLabels){e.el.hidden=true;return;} e.p.set(vol.position.x,(vol.userData.nok||4)+0.8,vol.position.z); }
    else if(!toonLabels){e.el.hidden=true;return;}
    v3.copy(e.p).project(camera);
    var zicht=v3.z<1&&v3.x>-1.05&&v3.x<1.05&&v3.y>-1.05&&v3.y<1.05; e.el.hidden=!zicht;
    if(zicht) e.el.style.transform='translate(-50%,-100%) translate('+((v3.x+1)/2*breed).toFixed(1)+'px,'+((1-v3.y)/2*hoog).toFixed(1)+'px)';
  });
}

/* ---------- Matenlijst ---------- */
(function(){
  var rijen=[['Woonhuis 30, voorhuis','12,4 × 5,1 m'],['Woonhuis 30 en 30a, achterhuis','18,8 × 12,1 m'],['Koeienschuur','22,2 × 12,2 m'],['Showroom','14,1 × 5,8 m'],['Garage en werkplaats','24,4 × 9,8 m'],['Ronde loods','25,1 × 11,8 m'],['Kleine schuur','7,7 × 6,9 m'],['Dierenschuur','6,5 × 6,6 m'],['Erf binnen de sloten','circa 110 × 55 m']];
  document.getElementById('maten').innerHTML=rijen.map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>';}).join('');
})();

/* ---------- Aanzichten ---------- */
var standen={
  vogel:[[96,74,40],[6,0,-1]], boven:[[2,170,0.5],[2,0,0]], weg:[[68,3.2,17.5],[26,3.2,3]],
  achter:[[-86,40,-52],[-8,0,0]], tuin:[[55,42,-72],[8,0,-6]]
};
var vlucht=null;
function naar(naam,direct){
  var s=standen[naam]; if(!s) return;
  var doelP=new THREE.Vector3().fromArray(s[0]), doelT=new THREE.Vector3().fromArray(s[1]);
  if(breed<hoog){ doelP.sub(doelT).multiplyScalar(1.7).add(doelT); } // staand scherm: verder uitzoomen
  document.querySelectorAll('#aanzichten button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.v===naam?'true':'false');});
  if(direct||window.matchMedia('(prefers-reduced-motion: reduce)').matches){camera.position.copy(doelP); controls.target.copy(doelT); vlucht=null; return;}
  vlucht={p0:camera.position.clone(),t0:controls.target.clone(),p1:doelP,t1:doelT,start:performance.now()};
}
document.getElementById('aanzichten').addEventListener('click',function(e){var b=e.target.closest('button'); if(b) naar(b.dataset.v);});
controls.addEventListener('start',function(){vlucht=null;});

/* ---------- Schakelaars ---------- */
document.getElementById('tLabels').addEventListener('change',function(){toonLabels=this.checked;});
document.getElementById('tBomen').addEventListener('change',function(){groen.visible=this.checked;});
document.getElementById('tRaster').addEventListener('change',function(){raster.visible=this.checked;});
document.getElementById('tLucht').addEventListener('change',function(){luchtfoto.visible=this.checked; grond.visible=!this.checked; inrichting.visible=!this.checked;});
function situatie(nieuw){
  if(!nieuw && loop.actief) stopLopen();
  groenH.visible=!nieuw; groenN.visible=nieuw; vol.visible=nieuw; nieuwGroep.visible=nieuw; huidigGroep.visible=!nieuw;
  if(!nieuw){var th=etiketten.filter(function(e){return e.el.textContent==='Dierenschuur';})[0]; if(th) th.p.set(20.65,4.3,-21.6);} else werkVol();
  document.getElementById('volBediening').hidden=!nieuw; document.getElementById('blokWoning').hidden=!nieuw;
  document.getElementById('bHuidig').setAttribute('aria-pressed',nieuw?'false':'true'); document.getElementById('bNieuw').setAttribute('aria-pressed',nieuw?'true':'false');
}
document.getElementById('bHuidig').addEventListener('click',function(){situatie(false);});
document.getElementById('bNieuw').addEventListener('click',function(){situatie(true);});
document.getElementById('bTerug').addEventListener('click',function(){vol.position.set(26.25,0,-23.5); sR.value=180; werkVol();});
if(window.matchMedia('(max-width:640px)').matches) document.getElementById('opties').open=false;

/* ---------- Indeling en rondlopen ---------- */
function indeling(aan){
  document.getElementById('tIndeling').checked=aan;
  vol.userData.buiten.forEach(function(o){o.visible=!aan;}); vol.userData.binnen.visible=aan;
  dierNieuw.userData.buiten.forEach(function(o){o.visible=!aan;}); dierNieuw.userData.binnen.visible=aan;
}
document.getElementById('tIndeling').addEventListener('change',function(){indeling(this.checked);});
var loop={actief:false,yaw:0,pitch:0,toets:{},route:null,oogHoogte:1.6};
// Route in koppel-coördinaten (X naar de weg, Z naar de haag, ten opzichte van het midden van de woning bij 180°):
// voor de fietsenstalling, onder de overkapping door, de bijkeuken in en vandaar door de glazen sluis, de hal in en naar de woonkamer.
var ROUTE=[[-11.0,6.5],[-11.0,1.9],[-9.25,1.9],[-9.25,0.0],[-8.6,-0.6],[-7.25,-0.6],[-6.0,-0.6],[-3.2,-1.0],[0.6,-1.0],[1.4,-0.9],[3.3,0.0],[4.2,0.0]];
function routePunt(i){var v=new THREE.Vector3(ROUTE[i][0],loop.oogHoogte,ROUTE[i][1]); koppel.updateMatrixWorld(true); return koppel.localToWorld(v);}
function startLopen(metRoute){
  if(!vol.visible) situatie(true);
  indeling(true); loop.actief=true; controls.enabled=false; vlucht=null; camera.fov=Math.min(100,Math.max(70,2*Math.atan(Math.tan(Math.PI/4)/camera.aspect)*180/Math.PI)); camera.updateProjectionMatrix(); document.getElementById('opties').hidden=true;
  document.getElementById('aanzichten').hidden=true; document.body.classList.add('lopen');
  document.getElementById('looppaneel').hidden=!!metRoute; document.getElementById('routebalk').hidden=!metRoute;
  if(window.matchMedia('(max-width:640px)').matches) document.getElementById('opties').open=false;
  var p0=routePunt(0), p1=routePunt(1); camera.position.copy(p0);
  loop.yaw=Math.atan2(-(p1.x-p0.x),-(p1.z-p0.z)); loop.pitch=-0.05;
  loop.route=metRoute?{i:0,t:0}:null;
  document.getElementById('loopUitleg').textContent=metRoute?'De route loopt vanzelf. Sleep om rond te kijken; een pijl neemt het over.':'Sleep om rond te kijken. Lopen met de pijlen of W A S D.';
}
function stopLopen(){
  loop.actief=false; loop.route=null; controls.enabled=true; camera.fov=40; camera.updateProjectionMatrix(); document.getElementById('opties').hidden=false;
  document.getElementById('aanzichten').hidden=false; document.getElementById('looppaneel').hidden=true; document.getElementById('routebalk').hidden=true; document.body.classList.remove('lopen');
  naar('vogel');
}
document.getElementById('bRoute').addEventListener('click',function(){startLopen(true);});
document.getElementById('bLopen').addEventListener('click',function(){startLopen(false);});
document.getElementById('bStop').addEventListener('click',stopLopen);
document.getElementById('bStop2').addEventListener('click',stopLopen);
function zelfOvernemen(){ loop.route=null; document.getElementById('routebalk').hidden=true; document.getElementById('looppaneel').hidden=false;
  document.getElementById('loopUitleg').textContent='Sleep om rond te kijken. Lopen met de pijlen of W A S D.'; }
document.getElementById('bZelf').addEventListener('click',zelfOvernemen);
var kijk=null;
renderer.domElement.addEventListener('pointerdown',function(e){ if(!loop.actief) return; kijk={x:e.clientX,y:e.clientY}; renderer.domElement.setPointerCapture(e.pointerId); e.stopImmediatePropagation(); },true);
renderer.domElement.addEventListener('pointermove',function(e){ if(!loop.actief||!kijk) return;
  loop.yaw-=(e.clientX-kijk.x)*0.005; loop.pitch=Math.max(-1.2,Math.min(1.2,loop.pitch-(e.clientY-kijk.y)*0.005)); kijk={x:e.clientX,y:e.clientY}; });
['pointerup','pointercancel'].forEach(function(n){renderer.domElement.addEventListener(n,function(){kijk=null;});});
var TOETS={ArrowUp:'vooruit',KeyW:'vooruit',ArrowDown:'achteruit',KeyS:'achteruit',ArrowLeft:'links',KeyA:'links',ArrowRight:'rechts',KeyD:'rechts'};
window.addEventListener('keydown',function(e){ if(loop.actief&&TOETS[e.code]){loop.toets[TOETS[e.code]]=true; if(loop.route) zelfOvernemen(); e.preventDefault();} });
window.addEventListener('keyup',function(e){ if(TOETS[e.code]) loop.toets[TOETS[e.code]]=false; });
document.querySelectorAll('.pijlen button').forEach(function(b){
  function aan(e){loop.toets[b.dataset.k]=true; if(loop.route) zelfOvernemen(); e.preventDefault();} function uit(){loop.toets[b.dataset.k]=false;}
  b.addEventListener('pointerdown',aan); ['pointerup','pointerleave','pointercancel'].forEach(function(n){b.addEventListener(n,uit);});
});
function werkLopen(dt){
  if(loop.route){
    var r=loop.route; if(r.i>=ROUTE.length-1){zelfOvernemen();} else {
      var a=routePunt(r.i), b=routePunt(r.i+1), len=a.distanceTo(b)||0.01; r.t+=dt*1.1/len;
      if(r.t>=1){r.i++; r.t=0; a=b; if(r.i<ROUTE.length-1) b=routePunt(r.i+1);}
      camera.position.lerpVectors(a,b,Math.min(1,r.t));
      var doelYaw=Math.atan2(-(b.x-a.x),-(b.z-a.z)), dy=doelYaw-loop.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); loop.yaw+=dy*Math.min(1,dt*3);
    }
  }
  var v=0, tk=loop.toets; if(tk.vooruit) v+=1.4; if(tk.achteruit) v-=1.4; if(tk.links) loop.yaw+=dt*1.6; if(tk.rechts) loop.yaw-=dt*1.6;
  if(v){ camera.position.x-=Math.sin(loop.yaw)*v*dt; camera.position.z-=Math.cos(loop.yaw)*v*dt; camera.position.y=loop.oogHoogte; }
  camera.rotation.set(loop.pitch,loop.yaw,0,'YXZ');
}

/* ---------- Lus ---------- */
function maat(){
  breed=toneel.clientWidth||1; hoog=toneel.clientHeight||1;
  renderer.setSize(breed,hoog,false); camera.aspect=breed/hoog; camera.updateProjectionMatrix();
}
window.addEventListener('resize',maat); maat(); naar('vogel',true);
var vorige=0;
function lus(nu){
  requestAnimationFrame(lus);
  var dt=Math.min(0.1,(nu-(vorige||nu))/1000); vorige=nu;
  if(loop.actief){ werkLopen(dt); renderer.render(scene,camera); werkEtiketten(); return; }
  if(vlucht){
    var t=Math.min(1,(nu-vlucht.start)/900), k=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    camera.position.lerpVectors(vlucht.p0,vlucht.p1,k); controls.target.lerpVectors(vlucht.t0,vlucht.t1,k); if(t>=1) vlucht=null;
  }
  controls.update(); renderer.render(scene,camera); werkEtiketten();
}
requestAnimationFrame(lus);
window.__erf={naar:naar,vol:vol,camera:camera,controls:controls,indeling:indeling,startLopen:startLopen,loop:loop};
})();
