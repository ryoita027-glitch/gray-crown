/* Pure JS PNG RGBA codec for isolated, reproducible art studies.
   Supports 8-bit RGBA/RGB/indexed PNG input, 8-bit RGBA output.
   No dependencies, no network, no runtime game integration. */
(function(root){
  "use strict";
  const ABC="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  function fromBase64(s){
    const out=[];let bits=0,count=0;
    for(const c of s){if(c==="=")break;const v=ABC.indexOf(c);if(v<0)continue;
      bits=(bits<<6)|v;count+=6;if(count>=8){count-=8;out.push((bits>>>count)&255);}}
    return Uint8Array.from(out);
  }
  function toBase64(a){
    const out=[];for(let i=0;i<a.length;i+=3){
      const v=(a[i]<<16)|((a[i+1]||0)<<8)|(a[i+2]||0);
      out.push(ABC[(v>>>18)&63],ABC[(v>>>12)&63],
        i+1<a.length?ABC[(v>>>6)&63]:"=",i+2<a.length?ABC[v&63]:"=");
    }return out.join("");
  }
  function inflate(z){
    let p=2,buffer=0,nbits=0;const out=[];
    function read(n){while(nbits<n){if(p>=z.length)throw Error("truncated zlib");
      buffer|=z[p++]<<nbits;nbits+=8;}
      const v=buffer&((1<<n)-1);buffer>>>=n;nbits-=n;return v;}
    function table(lens){
      const counts=Array(16).fill(0),next=Array(16).fill(0);
      const maps=Array.from({length:16},()=>new Map());
      for(const len of lens)if(len)counts[len]++;
      let code=0;for(let i=1;i<=15;i++){code=(code+counts[i-1])*2;next[i]=code;}
      for(let i=0;i<lens.length;i++){const len=lens[i];if(len)maps[len].set(next[len]++,i);}
      return maps;
    }
    function symbol(t){let code=0;for(let i=1;i<=15;i++){
      code=(code<<1)|read(1);if(t[i].has(code))return t[i].get(code);
    }throw Error("invalid Huffman symbol at "+p);}
    const LB=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
    const LE=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
    const DB=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
    const DE=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
    let last;
    do{
      last=read(1);const kind=read(2);
      if(kind===0){read(nbits%8);const len=read(16);read(16);
        for(let i=0;i<len;i++)out.push(read(8));continue;}
      let lit,dist;
      if(kind===1){
        lit=table(Array.from({length:288},(_,i)=>i<=143?8:i<=255?9:i<=279?7:8));
        dist=table(Array(32).fill(5));
      }else if(kind===2){
        const hl=read(5)+257,hd=read(5)+1,hc=read(4)+4;
        const order=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
        const cl=Array(19).fill(0);
        for(let i=0;i<hc;i++)cl[order[i]]=read(3);
        const t=table(cl),lens=[];
        while(lens.length<hl+hd){
          const v=symbol(t);
          if(v<=15)lens.push(v);
          else if(v===16){const n=read(2)+3,prior=lens[lens.length-1];
            if(prior===undefined)throw Error("invalid repeat");
            for(let j=0;j<n;j++)lens.push(prior);}
          else if(v===17){const n=read(3)+3;for(let j=0;j<n;j++)lens.push(0);}
          else{const n=read(7)+11;for(let j=0;j<n;j++)lens.push(0);}
        }
        lit=table(lens.slice(0,hl));dist=table(lens.slice(hl,hl+hd));
      }else throw Error("reserved deflate block");
      while(true){
        const v=symbol(lit);
        if(v<256)out.push(v);
        else if(v===256)break;
        else{
          const i=v-257;if(i<0||i>=LB.length)throw Error("invalid length");
          let length=LB[i]+read(LE[i]),di=symbol(dist);
          if(di>=DB.length)throw Error("invalid distance");
          const offset=DB[di]+read(DE[di]);
          if(offset>out.length)throw Error("distance before output");
          while(length--)out.push(out[out.length-offset]);
        }
      }
    }while(!last);
    return Uint8Array.from(out);
  }
  function u32(b,i){return (b[i]*16777216+(b[i+1]<<16)+(b[i+2]<<8)+b[i+3])>>>0;}
  function decode(input){
    const b=input instanceof Uint8Array?input:Uint8Array.from(input);
    if(b.length<33||b[0]!==137||b[1]!==80||b[2]!==78||b[3]!==71)throw Error("not PNG");
    let i=8,w=0,h=0,depth=0,color=0,palette=null,trans=null;
    const id=[];
    while(i<b.length){
      const len=u32(b,i),kind=String.fromCharCode(...b.slice(i+4,i+8));
      if(i+len+12>b.length)throw Error("truncated PNG chunk");
      if(kind==="IHDR"){w=u32(b,i+8);h=u32(b,i+12);depth=b[i+16];color=b[i+17];}
      else if(kind==="PLTE")palette=b.slice(i+8,i+8+len);
      else if(kind==="tRNS")trans=b.slice(i+8,i+8+len);
      else if(kind==="IDAT")for(let k=i+8;k<i+8+len;k++)id.push(b[k]);
      i+=len+12;if(kind==="IEND")break;
    }
    if(depth!==8||![2,3,6].includes(color)||w*h>1000000)throw Error("unsupported PNG layout");
    const channels=color===6?4:color===2?3:1,stride=w*channels,raw=inflate(id);
    if(raw.length!==(stride+1)*h)throw Error("unexpected decompressed size");
    const pixels=new Uint8Array(w*h*4);
    let previous=new Uint8Array(stride),p=0;
    for(let y=0;y<h;y++){
      const filter=raw[p++],row=new Uint8Array(stride);
      for(let x=0;x<stride;x++){
        const a=x>=channels?row[x-channels]:0,b=previous[x],c=x>=channels?previous[x-channels]:0;
        let v=raw[p++];
        if(filter===1)v+=a;
        else if(filter===2)v+=b;
        else if(filter===3)v+=Math.floor((a+b)/2);
        else if(filter===4){
          const pp=a+b-c,pa=Math.abs(pp-a),pb=Math.abs(pp-b),pc=Math.abs(pp-c);
          v+=pa<=pb&&pa<=pc?a:pb<=pc?b:c;
        }else if(filter!==0)throw Error("unknown PNG filter");
        row[x]=v&255;
      }
      for(let x=0;x<w;x++){
        const j=(y*w+x)*4,k=x*channels;
        if(color===3){
          const idx=row[k];if(!palette||idx*3+2>=palette.length)throw Error("bad palette");
          pixels[j]=palette[idx*3];pixels[j+1]=palette[idx*3+1];pixels[j+2]=palette[idx*3+2];
          pixels[j+3]=trans&&idx<trans.length?trans[idx]:255;
        }else{
          pixels[j]=row[k];pixels[j+1]=row[k+1];pixels[j+2]=row[k+2];
          pixels[j+3]=color===6?row[k+3]:255;
        }
      }
      previous=row;
    }
    return {width:w,height:h,pixels,colorType:color};
  }
  function crc32(b){let c=0xffffffff;for(const v of b){
    c^=v;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);
  }return(c^0xffffffff)>>>0;}
  function encode(width,height,pixels){
    if(width<=0||height<=0||pixels.length!==width*height*4)throw Error("invalid RGBA shape");
    const a=[],put32=n=>a.push((n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255);
    function chunk(type,data){
      put32(data.length);const t=[...type].map(c=>c.charCodeAt(0));
      a.push(...t);for(const v of data)a.push(v);
      put32(crc32(t.concat(Array.from(data))));
    }
    a.push(137,80,78,71,13,10,26,10);
    chunk("IHDR",[(width>>>24)&255,(width>>>16)&255,(width>>>8)&255,width&255,
      (height>>>24)&255,(height>>>16)&255,(height>>>8)&255,height&255,8,6,0,0,0]);
    const raw=[];for(let y=0;y<height;y++){raw.push(0);
      for(let j=y*width*4;j<(y+1)*width*4;j++)raw.push(pixels[j]);}
    const z=[0x78,0x01];
    for(let i=0;i<raw.length;){
      const len=Math.min(65535,raw.length-i),last=i+len===raw.length;
      z.push(last?1:0,len&255,(len>>>8)&255,(~len)&255,((~len)>>>8)&255);
      for(let j=0;j<len;j++)z.push(raw[i+j]);
      i+=len;
    }
    let aa=1,bb=0;for(const v of raw){aa=(aa+v)%65521;bb=(bb+aa)%65521;}
    z.push((bb>>>8)&255,bb&255,(aa>>>8)&255,aa&255);
    chunk("IDAT",z);chunk("IEND",[]);
    return Uint8Array.from(a);
  }
  root.GrayPng={fromBase64,toBase64,decode,encode};
  if(typeof module!=="undefined"&&module.exports)module.exports=root.GrayPng;
})(typeof globalThis!=="undefined"?globalThis:this);
