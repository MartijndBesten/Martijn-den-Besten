
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
var camera=new THREE.PerspectiveCamera(40,1,1,1500);
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
    // Tussen koeienschuur en garage/werkplaats: over de volle breedte (Z 5,8-9,0) verbonden.
    // Bij de erfzijde (X 3,9-5,8) een doorloop met dakje, de rest (X 5,8-15,7) is dicht.
    var dicht=doos(9.9,3.0,3.2,M(K.groenhout)); dicht.position.set(10.75,1.5,7.4); gebouwen.add(dicht);
    var dichtDak=doos(10.1,0.14,3.5,M(K.pandonker)); dichtDak.position.set(10.75,3.07,7.4); gebouwen.add(dichtDak);
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
function tuinhuis(ouder,cx,cz){ // dierenschuur: 6,5 x 6,4 m (BAG), nok haaks op de weg, dichte kant naar de weg, open overkapping aan de erfzijde
  var g=new THREE.Group(); g.position.set(cx,0,cz); ouder.add(g);
  var b=gebouw({m:[-1.1,-3.2,3.2,3.2],as:'x',goot:2.2,nok:3.6,wand:K.groenhout,dak:K.pan,ouder:g}), pr=b.userData.prof, L=b.userData.L;
  dakplaat(b,pr[2],pr[3],-0.06,1.02,-L/2-2.4,-L/2-0.3,0.16,0.08,M(K.pan)); dakplaat(b,pr[3],pr[4],-0.06,1.02,-L/2-2.4,-L/2-0.3,0.16,0.08,M(K.pan));
  [-3.05,0,3.05].forEach(function(dz){var st=doos(0.14,2.2,0.14,M(K.groenhout)); st.position.set(-3.2,1.1,dz); g.add(st);});
  var vl=doos(2.1,0.12,6.4,M(0x6b5a4a)); vl.position.set(-2.15,0.06,0); g.add(vl);
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
  plat(4.8,10.2,35.4,-25.4,0xa8a398);                                        // terras natuursteen
  for(var i=0;i<5;i++){var v=doos(0.04,0.04,10.2,M(0x8f8a80)); v.castShadow=false; v.position.set(33.4+i*0.95,0.125,-25.4); T.add(v);}
  var tafel=doos(1.6,0.75,0.9,M(0x6b5642)); tafel.position.set(35.6,0.38,-24.2); T.add(tafel);
  [[34.5,-24.2],[36.7,-24.2]].forEach(function(c){var st=doos(0.55,0.9,0.55,M(0x2f3437)); st.position.set(c[0],0.45,c[1]); T.add(st);});
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
var DIER=[-11.34,-1.74], SLUIS=[-7.34,-1.74];
tuinhuis(koppel,DIER[0],DIER[1]);
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
// Vorm volgens de plattegrond van het voorbeeldtype: 10,0 x 7,5 m, L-vorm, zadeldak, nok 4,60 m (opgave Martijn 13-11).
// Lokale assen: x = lengte 10 m (glazen kopgevel op x = -5), z = diepte 7,5 m.
var vol=new THREE.Group(); vol.visible=false; vol.position.set(26.34,0,-25.56); scene.add(vol);
(function(){
  var STUC=0xf3f0e9, STRIP=0x8a5a48, DAK=0x2e3033, KOZIJN=0x1f2326, NOK=4.6, GOOT=2.7;
  var woon=gebouw({m:[-5,-3.75,0.64,0.61],as:'x',goot:GOOT,nok:NOK,wand:STUC,dak:DAK,plint:0.9,plintKleur:STRIP,ouder:vol});
  gebouw({m:[0.55,-3.75,5,3.75],as:'z',goot:GOOT,nok:NOK,wand:STUC,dak:DAK,plint:0.9,plintKleur:STRIP,ouder:vol});
  // glazen kopgevel met openslaande deuren
  var zc=-1.57, sh=new THREE.Shape(); [[-1.9,0.12],[1.9,0.12],[1.9,2.55],[0,4.15],[-1.9,2.55]].forEach(function(p,i){ if(i) sh.lineTo(p[0],p[1]); else sh.moveTo(p[0],p[1]); });
  var gl=new THREE.ShapeGeometry(sh); gl.rotateY(-Math.PI/2);
  var glas=new THREE.Mesh(gl,M(0x3d5563)); glas.position.set(-5.07,0,zc); vol.add(glas);
  [[-1.9,2.55],[-0.65,3.6],[0.65,3.6],[1.9,2.55]].forEach(function(k){var st=doos(0.1,k[1]-0.1,0.09,M(KOZIJN)); st.castShadow=false; st.position.set(-5.09,0.1+(k[1]-0.1)/2,zc+k[0]); vol.add(st);});
  [0.14,2.3].forEach(function(y){var l=doos(0.1,0.09,3.8,M(KOZIJN)); l.castShadow=false; l.position.set(-5.09,y,zc); vol.add(l);});
  // ramen en deur volgens de plattegrond
  function raam(cx,cz,breed,richting,hoog,cy){gevelvlak(cx,cy||1.75,cz,breed,hoog||1.3,richting,0x3d5563,true,vol,KOZIJN);}
  raam(-0.85,-3.79,0.9,'z'); raam(-1.7,0.65,1.8,'z');
  raam(1.2,-3.79,0.45,'z',0.9,1.9); raam(3.55,-3.79,0.45,'z',0.9,1.9);
  raam(5.04,-0.4,0.55,'x'); raam(5.04,2.1,0.85,'x'); raam(1.2,3.79,0.4,'z',0.6,2.0);
  gevelvlak(0.51,1.1,1.33,0.95,2.15,'x',KOZIJN,false,vol);
  // glazen overkapping in de open hoek (x -5..0,55, z 0,61..3,75), licht aflopend naar buiten
  var gm=new THREE.MeshLambertMaterial({color:lin(0xbfdbe6),transparent:true,opacity:0.38,side:THREE.DoubleSide});
  var gp=new THREE.Mesh(new THREE.BoxGeometry(5.55,0.03,3.2),gm); gp.position.set(-2.225,2.58,2.18); gp.rotation.x=0.064; vol.add(gp);
  var b1=doos(5.6,0.16,0.12,M(KOZIJN)); b1.position.set(-2.225,2.42,3.72); vol.add(b1);
  var b2=doos(0.12,0.16,3.15,M(KOZIJN)); b2.position.set(-4.95,2.52,2.18); vol.add(b2);
  [-4.95,-1.9].forEach(function(px){var st=doos(0.1,2.4,0.1,M(KOZIJN)); st.position.set(px,1.2,3.7); vol.add(st);});
  [-4.0,-3.0,-2.0,-1.0,0.0].forEach(function(px){var r=doos(0.05,0.06,3.15,M(KOZIJN)); r.castShadow=false; r.position.set(px,2.6,2.18); r.rotation.x=0.064; vol.add(r);});
  vol.userData.nok=NOK;
  // Martijn 13-11: circa 100 m² zonder overkapping. Plattegrond van het Chopin-type naar verhouding vergroot
  // (57,6 m² x 1,318² = 100 m²): circa 13,2 x 9,9 m. Hoogtes blijven gelijk (nok 4,60 m).
  vol.scale.set(1.318,1,1.318);
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
  if(!vol.visible) return; zetMuis(e);
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
var toonLabels=true, v3=new THREE.Vector3(), breed=1, hoog=1;
function werkEtiketten(){
  etiketten.forEach(function(e){
    if(e.vol){ if(!vol.visible){e.el.hidden=true;return;} e.p.set(vol.position.x,(vol.userData.nok||4)+0.8,vol.position.z); }
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
  groenH.visible=!nieuw; groenN.visible=nieuw; vol.visible=nieuw; if(!nieuw){var th=etiketten.filter(function(e){return e.el.textContent==='Dierenschuur';})[0]; if(th) th.p.set(20.65,4.3,-21.6);} else werkVol();
   nieuwGroep.visible=nieuw; huidigGroep.visible=!nieuw; document.getElementById('volBediening').hidden=!nieuw; document.getElementById('blokWoning').hidden=!nieuw;
  document.getElementById('bHuidig').setAttribute('aria-pressed',nieuw?'false':'true'); document.getElementById('bNieuw').setAttribute('aria-pressed',nieuw?'true':'false');
}
document.getElementById('bHuidig').addEventListener('click',function(){situatie(false);});
document.getElementById('bNieuw').addEventListener('click',function(){situatie(true);});
document.getElementById('bTerug').addEventListener('click',function(){vol.position.set(26.34,0,-25.56); sR.value=180; werkVol();});
if(window.matchMedia('(max-width:640px)').matches) document.getElementById('opties').open=false;

/* ---------- Lus ---------- */
function maat(){
  breed=toneel.clientWidth||1; hoog=toneel.clientHeight||1;
  renderer.setSize(breed,hoog,false); camera.aspect=breed/hoog; camera.updateProjectionMatrix();
}
window.addEventListener('resize',maat); maat(); naar('vogel',true);
function lus(nu){
  requestAnimationFrame(lus);
  if(vlucht){
    var t=Math.min(1,(nu-vlucht.start)/900), k=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    camera.position.lerpVectors(vlucht.p0,vlucht.p1,k); controls.target.lerpVectors(vlucht.t0,vlucht.t1,k); if(t>=1) vlucht=null;
  }
  controls.update(); renderer.render(scene,camera); werkEtiketten();
}
requestAnimationFrame(lus);
window.__erf={naar:naar,vol:vol,camera:camera,controls:controls};
})();
