/* Gray Crown: standalone, offline-safe, LIMITED glTF GLB/WebGL2 inspector.
 * No changes to game save, scenario or renderer. Not a production glTF loader.
 * Supports bin GLB POSITION/COLOR_0 with indices, identity+translation nodes.
 */
(function(root){
'use strict';
const VS=`#version 300 es
precision highp float;
in vec3 aPosition;in vec4 aColor;
uniform float uYaw,uPitch,uSize,uAspect;uniform vec3 uOffset;
out vec4 vColor;out vec3 vPos;
void main(){
 vec3 p=aPosition+uOffset;
 float c=cos(uYaw),s=sin(uYaw);
 p=vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z)-vec3(0.,0.,1.73);
 float ce=cos(uPitch),se=sin(uPitch);
 vec3 v=vec3(p.x,ce*p.z+se*p.y,ce*p.y-se*p.z);
 vPos=v;vColor=aColor;
 gl_Position=vec4(v.x*uSize/uAspect,v.y*uSize,v.z/8.0,1.);
}`;
const FS=`#version 300 es
precision highp float;
in vec4 vColor;in vec3 vPos;out vec4 outColor;
void main(){
 vec3 n=normalize(cross(dFdx(vPos),dFdy(vPos)));
 float lit=.56+.44*abs(dot(n,normalize(vec3(-.35,.5,.8))));
 outColor=vec4(vColor.rgb*lit,vColor.a);
}`;
function shader(gl,type,src){
 const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
 if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
 return s
}
function program(gl){
 const p=gl.createProgram();
 gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,VS));
 gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,FS));
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
 return p
}
function parseGlb(buffer){
 const v=new DataView(buffer);
 if(v.getUint32(0,true)!==0x46546c67||v.getUint32(4,true)!==2||v.getUint32(8,true)!==buffer.byteLength)throw Error('Invalid GLB 2.0 header');
 let at=12,manifest=null,bin=null;
 while(at<v.byteLength){
  if(at+8>v.byteLength)throw Error('Truncated GLB chunk');
  const length=v.getUint32(at,true),type=v.getUint32(at+4,true);at+=8;
  if(at+length>v.byteLength)throw Error('Invalid chunk length');
  if(type===0x4e4f534a)manifest=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,at,length)));
  if(type===0x004e4942)bin=new DataView(buffer,at,length);
  at+=length;
 }
 if(!manifest||!bin||!Array.isArray(manifest.meshes))throw Error('GLB missing mesh JSON or BIN');
 if(manifest.extensionsRequired?.length)throw Error('Required glTF extensions not supported by pilot');
 const components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4},size={5121:1,5123:2,5125:4,5126:4};
 function accessor(index){
  const a=manifest.accessors[index];if(!a||a.sparse||a.bufferView===undefined)throw Error('Unsupported accessor');
  const bv=manifest.bufferViews[a.bufferView],n=components[a.type],bytes=size[a.componentType];
  if(!bv||!n||!bytes||(bv.buffer!==undefined&&bv.buffer!==0))throw Error('Unsupported bufferView');
  const stride=bv.byteStride||bytes*n,offset=(bv.byteOffset||0)+(a.byteOffset||0),values=[];
  for(let i=0;i<a.count;i++)for(let k=0;k<n;k++){
   const index=offset+i*stride+k*bytes;
   if(index<0||index+bytes>bin.byteLength)throw Error('Out of range accessor');
   let val;
   switch(a.componentType){
    case 5121:val=bin.getUint8(index);break;
    case 5123:val=bin.getUint16(index,true);break;
    case 5125:val=bin.getUint32(index,true);break;
    case 5126:val=bin.getFloat32(index,true);break;
   }
   values.push(a.normalized&&a.componentType!==5126?
    val/(a.componentType===5121?255:a.componentType===5123?65535:4294967295):val);
  }
  return {values,count:a.count,n}
 }
 const parts=[],roots=manifest.scenes?.[manifest.scene||0]?.nodes||manifest.nodes.map((_,i)=>i);
 function walk(index,parent){
  const node=manifest.nodes[index];if(!node)throw Error('Bad node index');
  if(node.matrix||node.rotation||node.scale)throw Error('Only baked node transforms supported: '+(node.name||index));
  const shift=node.translation||[0,0,0],origin=parent.map((x,i)=>x+shift[i]);
  if(node.mesh!==undefined)for(const prim of manifest.meshes[node.mesh].primitives){
   if(prim.mode!==undefined&&prim.mode!==4)continue;
   if(prim.attributes.POSITION===undefined)continue;
   const p=accessor(prim.attributes.POSITION),c=prim.attributes.COLOR_0!==undefined?accessor(prim.attributes.COLOR_0):null;
   const indices=prim.indices!==undefined?accessor(prim.indices).values:Array.from({length:p.count},(_,i)=>i);
   const verts=[];
   for(let i=0;i<p.count;i++){
    verts.push(...p.values.slice(i*3,i*3+3));
    if(c)verts.push(...c.values.slice(i*c.n,i*c.n+3),c.n===4?c.values[i*c.n+3]:1);
    else verts.push(1,1,1,1);
   }
   parts.push({name:node.name||'Unnamed',vertices:new Float32Array(verts),indices:new Uint32Array(indices),origin});
  }
  (node.children||[]).forEach(k=>walk(k,origin))
 }
 roots.forEach(k=>walk(k,[0,0,0]));
 if(!parts.length)throw Error('No supported triangles');
 return parts
}
function createViewer(canvas){
 const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:true,premultipliedAlpha:false});
 if(!gl)throw Error('WebGL2 unavailable');
 const prog=program(gl),pos=gl.getAttribLocation(prog,'aPosition'),col=gl.getAttribLocation(prog,'aColor');
 const u={yaw:gl.getUniformLocation(prog,'uYaw'),pitch:gl.getUniformLocation(prog,'uPitch'),size:gl.getUniformLocation(prog,'uSize'),aspect:gl.getUniformLocation(prog,'uAspect'),offset:gl.getUniformLocation(prog,'uOffset')};
 let meshes=[],yaw=0,pitch=.16,size=.42,disposed=false;
 function draw(){
  if(disposed)return;
  const w=canvas.clientWidth||canvas.width,h=canvas.clientHeight||canvas.height,dpr=Math.min(2,root.devicePixelRatio||1);
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.useProgram(prog);
  gl.uniform1f(u.yaw,yaw);gl.uniform1f(u.pitch,pitch);gl.uniform1f(u.size,size);gl.uniform1f(u.aspect,canvas.width/canvas.height);
  for(const m of meshes){gl.uniform3fv(u.offset,m.origin);gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0)}
  gl.bindVertexArray(null)
 }
 function loadArrayBuffer(data){
  const parsed=parseGlb(data);
  for(const m of meshes){gl.deleteBuffer(m.vbo);gl.deleteBuffer(m.ebo);gl.deleteVertexArray(m.vao)}
  meshes=[];
  for(const part of parsed){
   const vao=gl.createVertexArray(),vbo=gl.createBuffer(),ebo=gl.createBuffer();
   gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vbo);gl.bufferData(gl.ARRAY_BUFFER,part.vertices,gl.STATIC_DRAW);
   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ebo);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,part.indices,gl.STATIC_DRAW);
   gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,28,0);
   gl.enableVertexAttribArray(col);gl.vertexAttribPointer(col,4,gl.FLOAT,false,28,12);
   meshes.push({vao,vbo,ebo,count:part.indices.length,origin:part.origin,name:part.name})
  }
  gl.bindVertexArray(null);draw();return meshes.map(m=>m.name)
 }
 return {loadArrayBuffer,
  setView(view){if(view.yaw!==undefined)yaw=view.yaw;if(view.pitch!==undefined)pitch=Math.max(-1,Math.min(1,view.pitch));if(view.size!==undefined)size=Math.max(.1,Math.min(2,view.size));draw()},
  getView(){return {yaw,pitch,size}},draw,
  dispose(){disposed=true;for(const m of meshes){gl.deleteBuffer(m.vbo);gl.deleteBuffer(m.ebo);gl.deleteVertexArray(m.vao)}gl.deleteProgram(prog);meshes=[]}
 }
}
root.GrayCrown3D={parseGlb,createViewer};
})(typeof globalThis!=='undefined'?globalThis:this);
