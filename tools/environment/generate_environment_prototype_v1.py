#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw
import json

ROOT=Path(__file__).resolve().parents[2]
PALETTE=ROOT/"assets/environment/prototype/environment_palette_v1.json"
OUT=ROOT/"assets/environment/prototype"
TILES=OUT/"tiles/environment_tiles_v1.png"
SCENES=OUT/"scenes"
SCENES.mkdir(parents=True,exist_ok=True)
P=json.loads(PALETTE.read_text(encoding="utf-8"))
C={k:tuple(int(v[i:i+2],16) for i in (1,3,5))+(255,) for k,v in P.items()}
T=32

def tile_base(name, details=None):
    im=Image.new("RGBA",(T,T),C[name]); d=ImageDraw.Draw(im)
    if details: details(d)
    return im

def tilesheet():
    sheet=Image.new("RGBA",(T*4,T*4),(0,0,0,0))
    def grass(d):
        for x,y in [(5,7),(20,4),(12,20),(27,24),(4,27)]:
            d.point((x,y),fill=C["grass_detail"]); d.point((x+1,y),fill=C["grass_shadow"])
    def dirt(d):
        for x,y in [(7,8),(18,15),(25,6),(10,25)]: d.rectangle((x,y,x+1,y+1),fill=C["soil"])
    def path(d):
        for y in range(0,T,8): d.line((0,y,T-1,y),fill=C["soil"])
    def stone(d):
        d.line((0,15,31,15),fill=C["shadow"]); d.line((15,0,15,31),fill=C["shadow"])
    def wall(d):
        d.rectangle((0,0,31,31),fill=C["plaster"]); d.rectangle((0,27,31,31),fill=C["wood_dark"])
    def floor(d):
        for x in range(0,T,8): d.line((x,0,x,31),fill=C["wood_dark"])
    def intfloor(d):
        for y in range(0,T,8): d.line((0,y,31,y),fill=C["wood_mid"])
    def roof(d):
        for y in range(4,T,8): d.line((0,y,31,y),fill=C["roof_shadow"])
    def fence(d):
        d.rectangle((5,0,9,31),fill=C["wood_dark"]); d.rectangle((22,0,26,31),fill=C["wood_dark"]); d.rectangle((0,10,31,15),fill=C["wood_mid"])
    def plant(d):
        d.rectangle((14,18,17,31),fill=C["wood_dark"]); d.polygon([(5,20),(15,5),(18,20)],fill=C["grass_shadow"]); d.polygon([(14,20),(23,8),(27,22)],fill=C["grass_detail"])
    def rock(d):
        d.polygon([(5,24),(8,10),(17,5),(26,13),(28,24)],fill=C["stone"]); d.line((10,12,18,8),fill=C["plaster"])
    def door(d):
        d.rectangle((7,3,24,31),fill=C["wood_dark"]); d.rectangle((10,6,21,31),fill=C["wood_mid"]); d.ellipse((18,16,20,18),fill=C["accent"])
    def window(d):
        d.rectangle((4,4,27,27),fill=C["wood_dark"]); d.rectangle((7,7,24,24),fill=(110,151,158,255)); d.line((16,7,16,24),fill=C["plaster"]); d.line((7,16,24,16),fill=C["plaster"])
    items=[tile_base("grass",grass),tile_base("grass_shadow",grass),tile_base("soil",dirt),tile_base("path",path),
           tile_base("stone",stone),tile_base("plaster",wall),tile_base("wood_light",floor),tile_base("interior_floor",intfloor),
           tile_base("roof",roof),tile_base("grass",fence),tile_base("grass",plant),tile_base("grass",rock),
           tile_base("plaster",door),tile_base("plaster",window),tile_base("wood_mid",floor),tile_base("interior_wall",wall)]
    for i,t in enumerate(items): sheet.alpha_composite(t,((i%4)*T,(i//4)*T))
    TILES.parent.mkdir(parents=True,exist_ok=True); sheet.save(TILES)

def canvas(base="grass"): return Image.new("RGBA",(512,320),C[base])

def village():
    im=canvas(); d=ImageDraw.Draw(im)
    d.rectangle((0,0,511,319),fill=C["grass"]); d.rectangle((0,138,511,194),fill=C["path"]); d.rectangle((226,0,286,319),fill=C["path"])
    d.rectangle((44,54,188,147),fill=C["plaster"]); d.polygon([(28,62),(116,14),(204,62)],fill=C["roof"]); d.line((34,62,198,62),fill=C["roof_shadow"],width=5)
    d.rectangle((101,103,132,147),fill=C["wood_dark"]); d.rectangle((60,86,88,109),fill=(110,151,158,255))
    for x in range(326,472,36): d.rectangle((x,68,x+5,134),fill=C["wood_dark"])
    d.rectangle((326,91,477,97),fill=C["wood_mid"]); d.ellipse((340,221,367,252),fill=C["wood_mid"]); d.line((342,231,365,231),fill=C["wood_dark"],width=3)
    d.polygon([(420,258),(429,231),(438,258)],fill=C["grass_shadow"])
    for x,y in [(18,250),(278,54),(476,245),(305,280),(202,248)]: d.line((x,y,x+5,y-6),fill=C["grass_detail"],width=2)
    im.save(SCENES/"village_micro_v1.png")

def field():
    im=canvas(); d=ImageDraw.Draw(im); d.rectangle((0,0,511,319),fill=C["grass"])
    d.polygon([(0,180),(95,155),(188,167),(276,145),(370,164),(512,136),(512,204),(376,213),(260,196),(150,213),(0,224)],fill=C["path"])
    for x,y in [(74,69),(442,73),(387,252),(157,269)]: d.ellipse((x,y,x+20,y+13),fill=C["stone"])
    for x,y in [(30,48),(125,81),(230,52),(330,92),(473,45),(54,270),(270,265),(452,276)]:
        d.line((x,y,x+4,y-8),fill=C["grass_shadow"],width=2); d.line((x+5,y,x+7,y-6),fill=C["grass_detail"],width=2)
    im.save(SCENES/"grass_field_micro_v1.png")

def exterior():
    im=canvas(); d=ImageDraw.Draw(im); d.rectangle((0,0,511,319),fill=C["grass"]); d.rectangle((0,228,511,319),fill=C["soil"])
    d.rectangle((126,98,390,247),fill=C["plaster"]); d.polygon([(96,111),(258,28),(420,111)],fill=C["roof"]); d.line((108,111,408,111),fill=C["roof_shadow"],width=7)
    d.rectangle((239,178,282,247),fill=C["wood_dark"])
    for x in (163,315): d.rectangle((x,151,x+42,184),fill=C["wood_dark"]); d.rectangle((x+5,156,x+37,179),fill=(110,151,158,255))
    d.rectangle((121,244,397,252),fill=C["stone"]); d.rectangle((416,207,443,250),fill=C["wood_mid"]); d.line((418,220,441,220),fill=C["wood_dark"],width=3)
    im.save(SCENES/"house_exterior_v1.png")

def interior():
    im=Image.new("RGBA",(512,320),C["interior_wall"]); d=ImageDraw.Draw(im); d.rectangle((28,40,484,292),fill=C["interior_floor"])
    for x in range(36,484,32): d.line((x,40,x,292),fill=C["wood_mid"])
    d.rectangle((56,76,170,132),fill=C["wood_dark"]); d.rectangle((62,82,164,126),fill=C["plaster"])
    d.rectangle((205,104,315,166),fill=C["furniture"]); d.rectangle((214,114,306,154),fill=C["wood_light"])
    d.rectangle((220,178,250,201),fill=C["wood_mid"]); d.rectangle((276,178,306,201),fill=C["wood_mid"])
    d.rectangle((388,70,450,176),fill=C["wood_dark"])
    for y in (92,120,148): d.rectangle((394,y,444,y+5),fill=C["wood_mid"])
    d.rectangle((62,202,132,277),fill=C["stone"]); d.rectangle((78,226,116,276),fill=C["shadow"]); d.polygon([(89,270),(97,240),(108,270)],fill=C["accent"])
    d.rectangle((230,270,284,319),fill=C["shadow"]); im.save(SCENES/"house_interior_v1.png")

tilesheet(); village(); field(); exterior(); interior()
print("GRAY CROWN ENVIRONMENT PROTOTYPE v1 GENERATED")
