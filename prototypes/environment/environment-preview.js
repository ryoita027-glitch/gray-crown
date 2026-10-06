(()=>{
const scenes={
 village:"../../assets/environment/prototype/scenes/village_micro_v1.png",
 field:"../../assets/environment/prototype/scenes/grass_field_micro_v1.png",
 houseExterior:"../../assets/environment/prototype/scenes/house_exterior_v1.png",
 houseInterior:"../../assets/environment/prototype/scenes/house_interior_v1.png"
};
const characters={
 karen:"../../assets/characters/karen/karen_idle.png",
 triton:"../../assets/characters/triton/triton_idle.png"
};
const canvas=document.getElementById("preview"),ctx=canvas.getContext("2d");
ctx.imageSmoothingEnabled=false;
const cache={};
async function load(src){if(cache[src])return cache[src];const im=new Image();im.src=src;await im.decode();cache[src]=im;return im}
async function render(){
 const sceneKey=document.getElementById("scene").value;
 const mode=document.getElementById("mode").value;
 const size=Number(document.getElementById("scale").value);
 const bg=await load(scenes[sceneKey]);ctx.clearRect(0,0,512,320);ctx.drawImage(bg,0,0,512,320);
 const y=320-size-28;
 if(mode==="karen"||mode==="pair"){const im=await load(characters.karen);ctx.drawImage(im,0,0,48,48,mode==="pair"?176:234,y,size,size)}
 if(mode==="triton"||mode==="pair"){const im=await load(characters.triton);ctx.drawImage(im,0,0,48,48,mode==="pair"?292:234,y,size,size)}
 document.getElementById("status").textContent=sceneKey+" / "+mode+" / "+size+"px / real runtime PNG";
 window.GCEnvPreview.state={scene:sceneKey,mode,size,ready:true};
}
for(const id of ["scene","mode","scale"])document.getElementById(id).addEventListener("change",()=>render());
window.GCEnvPreview={scenes,characterSources:characters,state:{ready:false},render};
render().catch(e=>{window.GCEnvPreview.error=String(e);document.getElementById("status").textContent=String(e)});
})();