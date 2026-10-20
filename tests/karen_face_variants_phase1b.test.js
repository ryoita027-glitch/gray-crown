'use strict';
/* Visual approval is out of scope: this tests real checked-in sprites and
 * the exact unchanged body/ground contact pixels for the 48x56 candidates.
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib'),vm=require('node:vm');
const root=path.join(__dirname,'..'),folder='assets/character_parts/karen_face_phase1b/variants/';
const FILES={
 reference:'karen_reference_padded_48x56_4dir.png',
 eyes:'karen_A_eye_clarity_48x56_4dir.png',
 crown:'karen_B_crown_space_48x56_4dir.png',
 balanced:'karen_C_balanced_48x56_4dir.png'
};
function file(p){return fs.readFileSync(path.join(root,p))}
function png(p){
 const b=file(p);
 assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a',p);
 const w=b.readUInt32BE(16),h=b.readUInt32BE(20);
 assert.equal(b[24],8);assert.equal(b[25],6);
 let parts=[],pos=8;
 while(pos<b.length){const n=b.readUInt32BE(pos),name=b.toString('ascii',pos+4,pos+8);
  if(name==='IDAT')parts.push(b.subarray(pos+8,pos+8+n));
  pos+=12+n;if(name==='IEND')break;
 }
 const bytes=zlib.inflateSync(Buffer.concat(parts)),stride=w*4;
 assert.equal(bytes.length,h*(stride+1),p);
 const rgba=Buffer.alloc(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<stride;x++){
  const code=bytes[y*(stride+1)],s=y*(stride+1)+1+x,d=y*stride+x,
   a=x>=4?rgba[d-4]:0,bb=y?rgba[d-stride]:0,c=y&&x>=4?rgba[d-stride-4]:0;
  let v=0;
  if(code===1)v=a;else if(code===2)v=bb;else if(code===3)v=(a+bb)>>1;
  else if(code===4){const p=a+bb-c;const pa=Math.abs(p-a),pb=Math.abs(p-bb),pc=Math.abs(p-c);v=pa<=pb&&pa<=pc?a:pb<=pc?bb:c}
  else assert.equal(code,0,'Unsupported PNG filter');
  rgba[d]=(bytes[s]+v)&255;
 }
 return{w,h,rgba};
}
function pix(im,x,y){const offset=(y*im.w+x)*4;return Array.from(im.rgba.subarray(offset,offset+4))}
const ref=png(folder+FILES.reference),candidates=Object.fromEntries(
 Object.entries(FILES).filter(([key])=>key!=='reference').map(([k,p])=>[k,png(folder+p)]));
test('all 3 physically authored PNG files are 48px wide / 56px high x 4 directions',()=>{
 for(const [name,image] of Object.entries({reference:ref,...candidates})){
  assert.deepEqual([image.w,image.h],[48,224],name);
 }
});
test('padded reference is EXACTLY the unchanged original first pose in every direction',()=>{
 const src=png('assets/character_parts/karen_face_phase1b/karen_pixel_exact_reference_4dir.png');
 assert.deepEqual([src.w,src.h],[48,192]);
 for(let d=0;d<4;d++)for(let y=0;y<48;y++)for(let x=0;x<48;x++)
  assert.deepEqual(pix(ref,x,d*56+8+y),pix(src,x,d*48+y),'reference '+[d,x,y]);
});
test('only face y<=20 and explicitly extended crown are modified; body and feet never shift',()=>{
 for(const [name,im] of Object.entries(candidates)){
  let count=0,adds=0;
  for(let d=0;d<4;d++)for(let y=0;y<56;y++)for(let x=0;x<48;x++){
   const before=pix(ref,x,d*56+y),after=pix(im,x,d*56+y),changed=before.some((v,i)=>v!==after[i]);
   if(!changed)continue;count++;
   if(!before[3]&&after[3]){adds++;assert.ok(y>=6&&y<=7,name+' crown position '+[d,x,y]);}
   else{
    assert.equal(d,0,name+' non-front non-crown changed');
    assert.ok(y>=8&&y<=28,name+' non-face pixel changed '+[d,x,y]);
    assert.equal(before[3],after[3],name+' original alpha must be untouched');
   }
  }
  const expected={eyes:[22,0],crown:[34,28],balanced:[54,28]}[name];
  assert.deepEqual([count,adds],expected,name);
  for(let d=0;d<4;d++)for(let y=29;y<56;y++)for(let x=0;x<48;x++)
   assert.deepEqual(pix(im,x,d*56+y),pix(ref,x,d*56+y),
       name+' lower-body/collision feet must not change '+[d,x,y]);
 }
});
function moduleWithFakeWindow(query){
 const pictures=[];
 class FakeImage{constructor(){this.naturalWidth=48;this.naturalHeight=224;pictures.push(this)}}
 let redraws=0;
 const w={location:{search:query},document:{readyState:'loading',addEventListener(){},body:null},GC:{Render:{World:{draw(){redraws++}}}}};
 const source=file('js/render/karen_face_variants.js').toString('utf8');
 vm.runInNewContext(source,{window:w,Image:FakeImage});
 return{api:w.GC.KarenFaceVariants,pictures,getRedraws:()=>redraws};
}
test('normal game is NOT changed, no preview PNG is loaded',()=>{
 const {api,pictures}=moduleWithFakeWindow('');
 assert.equal(api.active(),false);assert.equal(pictures.length,0);
 assert.equal(api.choose('eyes'),'original');assert.equal(api.idleSprite('karen',0),null);
});
test('all candidates have strict ready/format checks, and return to original on errors',()=>{
 const {api,pictures,getRedraws}=moduleWithFakeWindow('?gcKarenFace=2');
 assert.equal(api.active(),true);assert.equal(pictures.length,3);
 assert.equal(api.state().selected,'original');
 api.choose('eyes');assert.equal(api.idleSprite('karen',0),null);
 pictures[0].onload();
 const info=api.idleSprite('karen',0);
 assert.ok(info);assert.equal(info.image,pictures[0]);assert.equal(info.cellHeight,56);
 assert.equal(info.topPadding,8);
 assert.equal(api.idleSprite('karen',1),null,'do not freeze walking poses');
 assert.equal(api.idleSprite('sophie',0),null,'only Karen changes');
 assert.equal(api.idleSprite('margaret',0),null);
 api.choose('crown');
 pictures[1].naturalHeight=191;pictures[1].onload();
 assert.equal(api.idleSprite('karen',0),null);
 assert.equal(api.state().images.crown.error,true);
 api.choose('balanced');pictures[2].onerror();
 assert.equal(api.idleSprite('karen',0),null);
 api.choose('original');assert.equal(api.idleSprite('karen',0),null);
 assert.throws(()=>api.choose('unknown'),/Unknown Karen face variant/);
 assert.ok(getRedraws()>=5);
});
test('real field renderer uses proportional 48x56 crop with identical 44px feet anchor',()=>{
 const world=file('js/render/world.js').toString('utf8'),
       html=file('index.html').toString('utf8'),
       checker=file('tools/phase1b_karen_face_variants_review.html').toString('utf8');
 assert.match(world,/GC\.KarenFaceVariants\?\.idleSprite\?\.\(heroId,motion\)/);
 assert.match(world,/ctx\.drawImage\(extended\.image,0,row\*56,48,56,dx,dy-8\*scale,size,56\*scale\)/);
 assert.ok(html.indexOf('js/render/karen_face_variants.js')<html.indexOf('js/render/world.js'));
 assert.match(checker,/karen_A_eye_clarity_48x56_4dir\.png/);
 assert.match(checker,/karen_B_crown_space_48x56_4dir\.png/);
 assert.match(checker,/karen_C_balanced_48x56_4dir\.png/);
});


test('44px actual image-only visibility impact stays documented and is NOT an art pass',()=>{
 const names=['eyes','crown','balanced'];
 const directions=['down','left','right','up'];
 const expected={
   eyes:[19,0,0,0],
   crown:[16,4,8,6],
   balanced:[33,4,8,6]
 };
 function at(im,d,x,y){
   const i=((d*56+y)*48+x)*4;
   return im.rgba.subarray(i,i+4);
 }
 for(const name of names){
   const rows=[];
   for(let d=0;d<4;d++){
     let changed=0,bodyChange=0;
     for(let dy=-8;dy<44;dy++){
       const sy=Math.floor((dy+.5)*48/44)+8;
       if(sy<0||sy>=56)continue;
       for(let dx=0;dx<44;dx++){
         const sx=Math.floor((dx+.5)*48/44);
         const before=at(ref,d,sx,sy);
         const after=at(candidates[name],d,sx,sy);
         if(before.some((v,i)=>v!==after[i])){
           changed++;
           if(dy>=26)bodyChange++;
         }
       }
     }
     rows.push(changed);
     assert.equal(bodyChange,0,name+' must not change body or foot shape');
   }
   assert.deepEqual(rows,expected[name],
     'candidate art changed; repeat human-scale comparison and approve a new baseline');
   assert.ok(Math.max(...rows)<34,
     'these low-impact variants must never automatically be called improved art');
 }
});
