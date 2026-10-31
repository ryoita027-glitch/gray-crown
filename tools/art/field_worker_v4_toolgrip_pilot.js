/* Gray Crown field-worker V4: source-faithful, four-direction tool-grip pose study.
 * ART HOLD; only study PNGs are written. Run from repository root:
 * node tools/art/field_worker_v4_toolgrip_pilot.js
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const codec=require("./pixel_png_rgba_codec.js");
const srcPath="assets/npc/field_worker_style_study_v2_48x192.png";
const refPath="assets/npc/featured_residents_charm_v5.png";
const outPath="assets/npc/studies/field_worker_v4_toolgrip_HOLD_48x192.png";
const boardPath="docs/art/evidence/field_worker_v2_v4_farmer_mayor_native44_HOLD.png";
const palette={"ink":[60,52,54,255],"vest":[104,117,100,255],"vestDark":[62,80,71,255],"linen":[235,217,183,255],"linenShade":[174,153,129,255],"skin":[213,170,139,255],"skinShadow":[172,121,102,255]};
const ops=[["clear",0,34,40,34,39],["line",0,29,34,36,"vestDark"],["line",0,30,34,37,"vest"],["line",0,31,34,38,"linenShade"],["line",0,32,35,38,"linen"],["line",0,33,36,38,"linenShade"],["line",0,34,37,38,"ink"],["line",0,30,37,38,"linenShade"],["line",0,29,38,39,"skinShadow"],["line",0,28,39,40,"skin"],["line",0,29,39,41,"skin"],["line",0,30,39,40,"skinShadow"],["line",0,31,38,39,"skinShadow"],["dot",0,40,29,"ink"],["dot",0,41,28,"skinShadow"],["dot",0,41,29,"skinShadow"],["dot",0,41,30,"ink"],["line",1,28,29,31,"vestDark"],["line",1,29,30,33,"vest"],["line",1,30,31,34,"linenShade"],["line",1,31,33,34,"linen"],["line",1,28,34,35,"skinShadow"],["line",1,29,34,36,"skin"],["line",1,30,34,36,"skinShadow"],["dot",1,35,29,"ink"],["line",2,28,17,19,"vestDark"],["line",2,29,15,18,"vest"],["line",2,30,14,17,"linenShade"],["line",2,31,14,15,"linen"],["line",2,28,12,13,"skinShadow"],["line",2,29,11,13,"skin"],["line",2,30,11,13,"skinShadow"],["dot",2,12,29,"ink"],["clear",3,34,39,34,39],["line",3,29,33,35,"vestDark"],["line",3,30,34,36,"vest"],["line",3,31,35,38,"linenShade"],["line",3,32,36,39,"linen"],["line",3,33,37,39,"linenShade"],["line",3,28,38,39,"skinShadow"],["line",3,29,38,40,"skin"],["line",3,30,39,40,"skinShadow"],["dot",3,40,29,"ink"]];
const blobSha=b=>crypto.createHash("sha1").update(Buffer.from("blob "+b.length+"\\0".replace("\\0","\0"))).update(b).digest("hex");
const sourceBytes=fs.readFileSync(srcPath),refBytes=fs.readFileSync(refPath);
if(blobSha(sourceBytes)!=="a39fd00215fb227c4031d3fbf53f2ebe182ca2c9"||blobSha(refBytes)!=="b169b58a846e1812dc42f566ca1843a6088e901f")throw Error("Input art SHA changed: review before rebuilding");
const source=codec.decode(sourceBytes),v5=codec.decode(refBytes);
if(source.width!==48||source.height!==192||v5.width!==432||v5.height!==192)throw Error("Unexpected atlas size");
const orig=source.rgba,art=new Uint8Array(orig),at=(d,x,y)=>((d*48+y)*48+x)*4;
for(const op of ops){const [kind,d,a,b,e,key]=op;if(kind==="clear"){for(let y=a;y<=b;y++)for(let x=e;x<=key;x++){const p=at(d,x,y);if(orig[p+3])art.set([0,0,0,0],p)}}else if(kind==="line"){for(let x=b;x<=e;x++)art.set(palette[key],at(d,x,a))}else art.set(palette[e],at(d,a,b))}
for(let d=0;d<4;d++)for(let y=0;y<48;y++)for(let x=0;x<48;x++)if(y<22||y>=42){const p=at(d,x,y);for(let k=0;k<4;k++)if(orig[p+k]!==art[p+k])throw Error("Head or footline changed");}
const board=new Uint8Array(176*176*4);
for(let d=0;d<4;d++)for(let col=0;col<4;col++)for(let y=0;y<44;y++)for(let x=0;x<44;x++){const sx=Math.floor((x+.5)*48/44),sy=Math.floor((y+.5)*48/44),data=col===0?orig:col===1?art:v5.rgba,iw=col<2?48:432,ox=col===2?48:col===3?144:0,si=((d*48+sy)*iw+ox+sx)*4,di=((d*44+y)*176+col*44+x)*4,a=data[si+3]/255;for(let k=0;k<3;k++)board[di+k]=Math.round(data[si+k]*a+94*(1-a));board[di+3]=255}
for(const [p,w,h,data] of [[outPath,48,192,art],[boardPath,176,176,board]]){const png=codec.encode(w,h,data),back=codec.decode(png);if(back.rgba.some((v,i)=>v!==data[i]))throw Error("PNG roundtrip failed");fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,Buffer.from(png));console.log(p,png.length+" bytes");}
