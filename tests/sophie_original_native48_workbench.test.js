// Offline contract for the original-source Sophie art workbench. No game-state changes.
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const vm=require("node:vm");
const html=fs.readFileSync(path.join(__dirname,"..","tools","art","sophie_original_native48_pixel_workbench.html"),"utf8");
const script=(html.match(/<script>([\s\S]*?)<\/script>/)||[])[1];
const extract=(name)=>{
 const re=new RegExp('const '+name+'="data:image/png;base64,([A-Za-z0-9+/=]+)";');
 const match=html.match(re);
 assert.ok(match,name+" embedded source");
 return Buffer.from(match[1],"base64");
};
const blobSha=bytes=>crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+bytes.length+"\0"),bytes])).digest("hex");
const dimensions=bytes=>[bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
test("embedded original Sophie PNG matches exact approved-source Git blob",()=>{
 const png=extract("SOURCE_SOPHIE");
 assert.equal(png.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
 assert.deepEqual(dimensions(png),[288,192]);
 assert.equal(blobSha(png),"47065a719b16b3da0c3f0f2457d69ccfcf8a8a04");
});
test("V5 reference matches exact original atlas and contains all nine columns",()=>{
 const png=extract("SOURCE_V5");
 assert.deepEqual(dimensions(png),[432,192]);
 assert.equal(blobSha(png),"b169b58a846e1812dc42f566ca1843a6088e901f");
});
test("workbench script parses and compares actual 48px source at native 44px",()=>{
 assert.ok(script);
 new vm.Script(script,{filename:"sophie_workbench_inline.js"});
 assert.match(script,/bctx\.drawImage\(source,cf\*48,row\*48,48,48,x,y,44,44\)/);
 assert.match(script,/bctx\.drawImage\(edit,cf\*48,row\*48,48,48,x,y,44,44\)/);
 assert.match(script,/bctx\.drawImage\(npc,3\*48,row\*48,48,48,x,y,44,44\)/);
 assert.match(script,/bctx\.drawImage\(npc,4\*48,row\*48,48,48,x,y,44,44\)/);
 assert.match(script,/bctx\.imageSmoothingEnabled=false/);
 assert.match(script,/n\*8/);
});
test("editing is reversible and exports a separate full 288x192 PNG",()=>{
 assert.match(script,/undoStack\.push/);
 assert.match(script,/redoStack\.push/);
 assert.match(script,/ectx\.putImageData/);
 assert.match(script,/download\(edit,"sophie_original_based_edit_288x192_UNAPPROVED\.png"\)/);
 assert.match(script,/download\(board,"sophie_original_edit_v5_native44_AB\.png"\)/);
 assert.doesNotMatch(html,/<script[^>]+src=/);
 assert.doesNotMatch(html,/<link[^>]+href="https?:/);
});
