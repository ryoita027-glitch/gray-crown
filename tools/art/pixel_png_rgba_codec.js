'use strict';
/* 8-bit RGBA PNG codec for isolated pixel-art studies. Node built-ins only.
 * Decodes all five PNG row filters; no palette/interlaced/16-bit conversion.
 */
const zlib = require('node:zlib');
const SIGNATURE = Buffer.from([137,80,78,71,13,10,26,10]);
const CRC_TABLE = new Uint32Array(256);
for (let i=0;i<256;i++) {
  let c=i;
  for(let j=0;j<8;j++) c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);
  CRC_TABLE[i]=c>>>0;
}
function crc32(data) {
  let c=0xffffffff;
  for(const byte of data) c=CRC_TABLE[(c^byte)&255]^(c>>>8);
  return (c^0xffffffff)>>>0;
}
function pngChunk(type, data) {
  const name=Buffer.from(type,'ascii');
  const body=Buffer.from(data);
  const out=Buffer.alloc(12+body.length);
  out.writeUInt32BE(body.length,0);
  name.copy(out,4);
  body.copy(out,8);
  out.writeUInt32BE(crc32(out.subarray(4,8+body.length)),8+body.length);
  return out;
}
function decode(input) {
  const bytes=Buffer.from(input);
  if(bytes.length<45 || !bytes.subarray(0,8).equals(SIGNATURE)) throw Error('Invalid PNG signature');
  let width=0,height=0,seenIHDR=false,seenIEND=false;
  const idats=[];
  for(let off=8;off<bytes.length;) {
    if(off+12>bytes.length) throw Error('Truncated PNG chunk');
    const len=bytes.readUInt32BE(off), end=off+12+len;
    if(end>bytes.length) throw Error('Truncated PNG data');
    const name=bytes.toString('ascii',off+4,off+8),data=bytes.subarray(off+8,off+8+len);
    if(crc32(bytes.subarray(off+4,off+8+len))!==bytes.readUInt32BE(off+8+len)) throw Error('PNG CRC mismatch: '+name);
    if(name==='IHDR') {
      if(seenIHDR||len!==13) throw Error('Invalid PNG IHDR');
      seenIHDR=true;width=data.readUInt32BE(0);height=data.readUInt32BE(4);
      if(!width||!height||width*height>10000000||data[8]!==8||data[9]!==6||data[10]!==0||data[11]!==0||data[12]!==0) throw Error('Only noninterlaced 8-bit RGBA PNG is supported');
    } else if(name==='IDAT') idats.push(data);
    else if(name==='IEND'){seenIEND=true;break;}
    else if(name[0]===name[0].toUpperCase()) throw Error('Unsupported critical PNG chunk: '+name);
    off=end;
  }
  if(!seenIHDR||!seenIEND||!idats.length) throw Error('Missing PNG chunks');
  const raw=zlib.inflateSync(Buffer.concat(idats));
  const stride=width*4;
  if(raw.length!==height*(stride+1)) throw Error('Unexpected decompressed PNG length');
  const rgba=new Uint8Array(height*stride);
  for(let y=0;y<height;y++) {
    const row=y*stride, src=y*(stride+1),filter=raw[src];
    if(filter>4) throw Error('Unsupported PNG filter: '+filter);
    for(let x=0;x<stride;x++) {
      const left=x>=4?rgba[row+x-4]:0;
      const up=y>0?rgba[row-stride+x]:0;
      const upperLeft=y>0&&x>=4?rgba[row-stride+x-4]:0;
      let predictor=0;
      if(filter===1) predictor=left;
      else if(filter===2) predictor=up;
      else if(filter===3) predictor=Math.floor((left+up)/2);
      else if(filter===4) {
        const p=left+up-upperLeft;
        const a=Math.abs(p-left),b=Math.abs(p-up),c=Math.abs(p-upperLeft);
        predictor=a<=b&&a<=c?left:b<=c?up:upperLeft;
      }
      rgba[row+x]=(raw[src+1+x]+predictor)&255;
    }
  }
  return {width,height,rgba};
}
function encode(width,height,rgba) {
  if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<1||height<1||width*height>10000000) throw Error('Invalid PNG dimensions');
  if(!rgba||rgba.length!==width*height*4) throw Error('RGBA byte length mismatch');
  const stride=width*4,raw=Buffer.alloc(height*(stride+1));
  for(let y=0;y<height;y++) {
    raw[y*(stride+1)]=0;
    Buffer.from(rgba.subarray(y*stride,(y+1)*stride)).copy(raw,y*(stride+1)+1);
  }
  const ihdr=Buffer.alloc(13);
  ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=6;
  return Buffer.concat([SIGNATURE,pngChunk('IHDR',ihdr),pngChunk('IDAT',zlib.deflateSync(raw,{level:9})),pngChunk('IEND',Buffer.alloc(0))]);
}
module.exports={decode,encode};
