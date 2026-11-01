'use strict';
// Dependency-free PNG codec for exact RGBA sprite experiments. Node 18+ and isolated JS.
// Inflate supports PNG zlib/DEFLATE blocks; encode uses lossless uncompressed DEFLATE.
const ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function fromBase64(s){
 s=s.replace(/[^A-Za-z0-9+/=]/g,'');const out=[];
 for(let i=0;i<s.length;i+=4){const a=ALPHABET.indexOf(s[i]),b=ALPHABET.indexOf(s[i+1]),c=ALPHABET.indexOf(s[i+2]),d=ALPHABET.indexOf(s[i+3]);
 out.push((a<<2)|(b>>4));if(c>=0)out.push(((b&15)<<4)|(c>>2));if(d>=0)out.push(((c&3)<<6)|d)}
 return Uint8Array.from(out)
}
function toBase64(a){let s='';for(let i=0;i<a.length;i+=3){let x=a[i],y=a[i+1]||0,z=a[i+2]||0;s+=ALPHABET[x>>2]+ALPHABET[((x&3)<<4)|(y>>4)]+(i+1<a.length?ALPHABET[((y&15)<<2)|(z>>6)]:'=')+(i+2<a.length?ALPHABET[z&63]:'=')}return s}
function inflateZlib(z){
 let p=2,bit=0;const out=[];
 function bits(n){let v=0;for(let k=0;k<n;k++){if(p>=z.length-4)throw Error('truncated DEFLATE');v|=((z[p]>>bit)&1)<<k;if(++bit===8){bit=0;p++}}return v}
 function huff(lengths){
  const max=Math.max(...lengths),count=Array(max+1).fill(0),next=Array(max+1).fill(0),maps=Array.from({length:max+1},()=>new Map());
  for(const n of lengths)if(n)count[n]++;
  let code=0;for(let n=1;n<=max;n++){code=(code+(count[n-1]||0))*2;next[n]=code}
  for(let s=0;s<lengths.length;s++){const n=lengths[s];if(n)maps[n].set(next[n]++,s)}
  return ()=>{let c=0;for(let n=1;n<=max;n++){c=(c<<1)|bits(1);if(maps[n].has(c))return maps[n].get(c)}throw Error('invalid Huffman code at '+p)}
 }
 const lenBase=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
 const lenExtra=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
 const distBase=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
 const distExtra=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
 let last=0;
 while(!last){
  last=bits(1);const type=bits(2);
  if(type===0){if(bit){bit=0;p++}const n=z[p]|(z[p+1]<<8),inv=z[p+2]|(z[p+3]<<8);if((n^inv)!==65535)throw Error('stored length');p+=4;for(let i=0;i<n;i++)out.push(z[p++]);continue}
  let lit,dist;
  if(type===1){lit=huff(Array.from({length:288},(_,i)=>i<144?8:i<256?9:i<280?7:8));dist=huff(Array(32).fill(5))}
  else if(type===2){
   const nl=bits(5)+257,nd=bits(5)+1,nc=bits(4)+4,order=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],cl=Array(19).fill(0);
   for(let i=0;i<nc;i++)cl[order[i]]=bits(3);
   const readLen=huff(cl),lens=[];
   while(lens.length<nl+nd){const sym=readLen();if(sym<16)lens.push(sym);else if(sym===16){if(!lens.length)throw Error('repeat before length');const n=bits(2)+3;for(let i=0;i<n;i++)lens.push(lens[lens.length-1])}else{const n=sym===17?bits(3)+3:bits(7)+11;for(let i=0;i<n;i++)lens.push(0)}}
   lit=huff(lens.slice(0,nl));dist=huff(lens.slice(nl,nl+nd));
  }else throw Error('invalid block');
  while(true){const sym=lit();if(sym<256){out.push(sym);continue}if(sym===256)break;
   const j=sym-257;if(j<0||j>=lenBase.length)throw Error('length symbol');
   const length=lenBase[j]+bits(lenExtra[j]),ds=dist();if(ds>=distBase.length)throw Error('distance symbol');
   const distance=distBase[ds]+bits(distExtra[ds]);if(distance>out.length)throw Error('distance exceeds output');
   for(let i=0;i<length;i++)out.push(out[out.length-distance])
  }
 }
 return Uint8Array.from(out)
}
function decodePng(data){
 const bytes=typeof data==='string'?fromBase64(data):data;
 const sig=[137,80,78,71,13,10,26,10];for(let i=0;i<8;i++)if(bytes[i]!==sig[i])throw Error('not PNG');
 const u32=(p)=>((bytes[p]*16777216)+(bytes[p+1]<<16)+(bytes[p+2]<<8)+bytes[p+3])>>>0;
 let p=8,w=0,h=0,depth=0,color=0,idat=[],palette=null,transparency=null;
 while(p<bytes.length){const n=u32(p),tag=String.fromCharCode(...bytes.slice(p+4,p+8)),start=p+8;p=start+n+4;
 if(tag==='IHDR'){w=u32(start);h=u32(start+4);depth=bytes[start+8];color=bytes[start+9];if(bytes[start+12])throw Error('interlaced unsupported')}
 if(tag==='PLTE')palette=bytes.slice(start,start+n);
 if(tag==='tRNS')transparency=bytes.slice(start,start+n);
 if(tag==='IDAT')idat.push(bytes.slice(start,start+n));if(tag==='IEND')break}
 if(depth!==8||![2,3,6].includes(color))throw Error('only RGB/RGBA/indexed 8-bit PNG supported '+depth+'/'+color);
 if(color===3&&(!palette||palette.length%3))throw Error('indexed PNG missing PLTE');
 const bpp=color===6?4:color===2?3:1,stride=w*bpp,z=Uint8Array.from(idat.flatMap(a=>Array.from(a))),raw=inflateZlib(z),rgba=new Uint8Array(w*h*4);
 let src=0;const prev=new Uint8Array(stride),row=new Uint8Array(stride);
 for(let y=0;y<h;y++){const filter=raw[src++];for(let i=0;i<stride;i++){
  const x=raw[src++],a=i>=bpp?row[i-bpp]:0,b=prev[i],c=i>=bpp?prev[i-bpp]:0;
  const pred=a+b-c,pa=Math.abs(pred-a),pb=Math.abs(pred-b),pc=Math.abs(pred-c);
  const predictor=pa<=pb&&pa<=pc?a:pb<=pc?b:c;
  row[i]=(x+(filter===0?0:filter===1?a:filter===2?b:filter===3?((a+b)>>1):filter===4?predictor:(()=>{throw Error('bad PNG filter')})()))&255
 }for(let x=0;x<w;x++){const d=(y*w+x)*4,s=x*bpp;if(color===3){const idx=row[s],q=idx*3;if(q+2>=palette.length)throw Error('bad palette index');rgba[d]=palette[q];rgba[d+1]=palette[q+1];rgba[d+2]=palette[q+2];rgba[d+3]=transparency&&idx<transparency.length?transparency[idx]:255}
  else{rgba[d]=row[s];rgba[d+1]=row[s+1];rgba[d+2]=row[s+2];rgba[d+3]=bpp===4?row[s+3]:255}}prev.set(row)}
 return {width:w,height:h,pixels:rgba}
}
function encodePng({width:w,height:h,pixels:rgba}){
 const raw=new Uint8Array(h*(1+w*4));for(let y=0;y<h;y++)raw.set(rgba.slice(y*w*4,(y+1)*w*4),y*(1+w*4)+1);
 const z=[0x78,0x01];let a=1,b=0;
 for(let i=0;i<raw.length;i+=65535){const n=Math.min(65535,raw.length-i),last=i+n===raw.length;z.push(last?1:0,n&255,n>>8,(~n)&255,((~n)>>8)&255);
 for(let j=i;j<i+n;j++){const v=raw[j];z.push(v);a=(a+v)%65521;b=(b+a)%65521}}
 z.push((b>>>8)&255,b&255,(a>>>8)&255,a&255);
 const crcTable=Array.from({length:256},(_,n)=>{for(let j=0;j<8;j++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});
 const crc=(arr)=>{let c=0xffffffff;for(const v of arr)c=crcTable[(c^v)&255]^(c>>>8);return (c^0xffffffff)>>>0};
 const u32=(n)=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];
 const chunk=(name,body)=>{const d=[...name].map(x=>x.charCodeAt(0)).concat(Array.from(body));return [...u32(body.length),...d,...u32(crc(d))]};
 const ihdr=[...u32(w),...u32(h),8,6,0,0,0];
 return Uint8Array.from([137,80,78,71,13,10,26,10,...chunk('IHDR',ihdr),...chunk('IDAT',z),...chunk('IEND',[])])
}
if(typeof module!=='undefined')module.exports={fromBase64,toBase64,inflateZlib,decodePng,encodePng};
