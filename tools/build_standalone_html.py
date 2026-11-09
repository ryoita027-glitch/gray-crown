#!/usr/bin/env python3
"""Build GrayCrown_起動.html: one-file offline edition for players.

Requires only Python 3. No external asset files after build.
  python tools/build_standalone_html.py
The complete game source and data are embedded, in the original order.
"""
from __future__ import annotations
import base64
import json
import mimetypes
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
SCRIPTS = re.compile(r'<script\b[^>]*\bsrc="(js/[^"]+\.js)"[^>]*></script>', re.I)
STYLES = re.compile(r'<link\b[^>]*\bhref="(css/[^"]+\.css)"[^>]*>', re.I)
ASSET = re.compile(r'(?:\.\./)?assets/[\w./+-]+\.(?:png|jpe?g|webp|svg|wav|ogg)', re.I)

SHIM = r"""
<script>
/* Bundled images: src paths refer to the original tree, not to a network. */
window.__GC_INLINE_ASSETS__=__ASSETS__;
const gc_asset_path=value=>String(value).replace(/(?:\.\.\/)?assets\/[\w/.-]+\.(?:png|jpe?g|webp|svg|wav|ogg)/gi,
    match=>window.__GC_INLINE_ASSETS__[match.replace(/^\.\.\//,'')]||match);
(function(){
 const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
 if(descriptor?.set)Object.defineProperty(HTMLImageElement.prototype,'src',{
  configurable:true,get(){return descriptor.get.call(this)},
  set(value){return descriptor.set.call(this,gc_asset_path(value))}
 });
 const oldAttr=HTMLImageElement.prototype.setAttribute;
 HTMLImageElement.prototype.setAttribute=function(name,value){
  return oldAttr.call(this,name,String(name).toLowerCase()==='src'?gc_asset_path(value):value);
 };
 const descriptorStyle=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,'backgroundImage');
 if(descriptorStyle?.set)Object.defineProperty(CSSStyleDeclaration.prototype,'backgroundImage',{
  configurable:true,get:descriptorStyle.get,
  set(value){return descriptorStyle.set.call(this,gc_asset_path(value))}
 });
 function hydrate(){
  for(const el of document.querySelectorAll('img[src*="assets/"],[style*="assets/"]')){
   const key=el.tagName==='IMG'?'src':'style',before=el.getAttribute(key),after=gc_asset_path(before);
   if(before!==after)el.setAttribute(key,after);
  }
 }
 new MutationObserver(hydrate).observe(document.documentElement,
   {subtree:true,childList:true,attributes:true,attributeFilter:['src','style']});
 document.addEventListener('DOMContentLoaded',hydrate);
})();
</script>
"""

def build():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    assets = {}
    for path in sorted((ROOT / "assets").rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT).as_posix()
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        assets[rel] = "data:" + mime + ";base64," + base64.b64encode(path.read_bytes()).decode("ascii")
    if not assets:
        raise RuntimeError("Game art assets are missing")

    def inline_css(match):
        relative = match.group(1)
        filepath = ROOT / relative
        if not filepath.is_file():
            raise FileNotFoundError(filepath)
        css = filepath.read_text(encoding="utf-8")
        css = ASSET.sub(lambda r: assets.get(r.group(0).removeprefix("../"),r.group(0)), css)
        return "<style>\n" + css.replace("</style>", "<\\/style>") + "\n</style>"

    html, styles = STYLES.subn(inline_css, html)
    if styles < 1:
        raise RuntimeError("Game CSS was not embedded")

    html = html.replace("</head>", SHIM.replace("__ASSETS__",json.dumps(assets,ensure_ascii=False)) + "\n</head>", 1)

    def inline_js(match):
        relative = match.group(1)
        script = ROOT / relative
        if not script.is_file():
            raise FileNotFoundError(script)
        text = script.read_text(encoding="utf-8").replace("</script>", "<\\/script>")
        return "<script>\n" + text + "\n</script>"

    html, scripts = SCRIPTS.subn(inline_js, html)
    if scripts < 10 or SCRIPTS.search(html) or STYLES.search(html):
        raise RuntimeError(f"Incomplete standalone bundle (scripts={scripts})")
    DIST.mkdir(parents=True, exist_ok=True)
    dest = DIST / "GrayCrown_起動.html"
    dest.write_text(html, encoding="utf-8")
    print(f"Created {dest} ({len(assets)} assets, {scripts} scripts; {dest.stat().st_size} bytes)")
    return dest

if __name__ == "__main__":
    build()
