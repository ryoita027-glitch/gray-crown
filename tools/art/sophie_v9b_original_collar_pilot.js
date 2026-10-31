/* Sophie V9b, original-based front-frame-0 collar/shoulder diagnostic. ART NO-GO.
 * Run from repository root: node tools/art/sophie_v9b_original_collar_pilot.js
 * Never writes official assets. Outputs a full unapproved sheet and 44px board.
 */
"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const PNG=require("./pixel_png_rgba_codec");
const sourcePath="assets/characters/sophie/sophie_walk.png";
const npcPath="assets/npc/featured_residents_charm_v5.png";
const sourceBytes=fs.readFileSync(sourcePath),npcBytes=fs.readFileSync(npcPath);
const blobSHA=b=>crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
if(blobSHA(sourceBytes)!=="47065a719b16b3da0c3f0f2457d69ccfcf8a8a04"||blobSHA(npcBytes)!=="b169b58a846e1812dc42f566ca1843a6088e901f")throw Error("Reference asset SHA drift: abort");
const s=PNG.decode(sourceBytes),n=PNG.decode(npcBytes);
if(s.width!==288||s.height!==192||n.width!==432||n.height!==192)throw Error("Unexpected atlas dimensions");
const edits=[[22,29,"S"],[23,29,"C"],[24,29,"G"],[25,29,"C"],[26,29,"S"],[22,30,"D"],[23,30,"S"],[24,30,"D"],[25,30,"S"],[26,30,"D"],[23,31,"G"],[24,31,"S"],[25,31,"G"],[18,31,"S"],[19,32,"C"],[19,33,"S"],[18,34,"S"],[20,34,"C"],[29,31,"S"],[30,32,"C"],[31,33,"S"],[30,34,"S"],[31,34,"C"]];
const palette={C:[241,229,204,255],S:[208,167,146,255],G:[67,88,58,255],D:[67,45,37,255]};
const candidate=s.rgba.slice();
for(const [x,y,key] of edits){const i=(y*288+x)*4;if(candidate[i+3]!==255)throw Error("Unexpected alpha");candidate.set(palette[key],i)}
let count=0;for(let y=0;y<192;y++)for(let x=0;x<288;x++){const i=(y*288+x)*4;if(s.rgba.slice(i,i+4).some((v,k)=>v!==candidate[i+k])){count++;if(y<29||y>34||x<18||x>31)throw Error("Unexpected edit zone")}if(s.rgba[i+3]!==candidate[i+3])throw Error("Alpha changed")}
const board=new Uint8Array(176*176*4),arrs=[s.rgba,candidate,n.rgba,n.rgba],bg=[94,105,89];
for(let dir=0;dir<4;dir++)for(let col=0;col<4;col++)for(let yy=0;yy<44;yy++)for(let xx=0;xx<44;xx++){let x=Math.floor((xx+.5)*48/44),y=Math.floor((yy+.5)*48/44),sx=col<2?x:(col===2?3*48+x:4*48+x),sy=dir*48+y,sw=col<2?288:432,src=arrs[col],i=(sy*sw+sx)*4,j=((dir*44+yy)*176+col*44+xx)*4,a=src[i+3]/255;for(let k=0;k<3;k++)board[j+k]=Math.round(src[i+k]*a+bg[k]*(1-a));board[j+3]=255}
const output1="assets/characters/sophie/studies/sophie_v9b_front0_collar_NO_GO_walk.png",output2="docs/art/evidence/sophie_v9b_front0_original_v5_native44_NO_GO.png";
for(const p of [output1,output2])fs.mkdirSync(path.dirname(p),{recursive:true});
fs.writeFileSync(output1,PNG.encode(288,192,candidate));fs.writeFileSync(output2,PNG.encode(176,176,board));
console.log("Generated Sophie V9b ART NO-GO, edited pixels:",count,"; source and V5 unchanged");
