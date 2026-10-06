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

def shade(rgb,delta):
    r,g,b,a=rgb
    return (max(0,min(255,r+delta)),max(0,min(255,g+delta)),max(0,min(255,b+delta)),a)

def grass_specks(d,ox=0,oy=0,w=512,h=320,step=48):
    pts=[]
    for y in range(oy+14,oy+h-8,step):
        for x in range(ox+18,ox+w-8,step):
            jitter=((x//step*7+y//step*11)%13)-6
            xx=max(ox+4,min(ox+w-6,x+jitter))
            yy=max(oy+4,min(oy+h-6,y+(jitter//2)))
            pts.append((xx,yy))
    for x,y in pts:
        d.point((x,y),fill=C["grass_shadow"])
        d.point((x+2,y-2),fill=C["grass_detail"])
        d.point((x+3,y),fill=C["grass_detail"])

def tile_base(name):
    return Image.new("RGBA",(T,T),C[name])

def tilesheet():
    sheet=Image.new("RGBA",(128,128),(0,0,0,0))
    items=[]

    t=tile_base("grass");d=ImageDraw.Draw(t)
    for x,y in [(4,6),(19,5),(10,19),(26,23),(4,27)]:
        d.point((x,y),fill=C["grass_shadow"])
        d.point((x+2,y-2),fill=C["grass_detail"])
        d.point((x+3,y),fill=C["grass_detail"])
    items.append(t)

    t=tile_base("grass_shadow");d=ImageDraw.Draw(t)
    for x,y in [(6,8),(23,6),(14,17),(26,26)]:
        d.line((x,y,x+3,y-3),fill=C["grass_detail"])
        d.point((x+1,y),fill=C["grass"])
    items.append(t)

    t=tile_base("soil");d=ImageDraw.Draw(t)
    for x,y in [(5,8),(17,14),(26,7),(9,25),(22,27)]:
        d.rectangle((x,y,x+2,y+1),fill=shade(C["soil"],-18))
    items.append(t)

    t=tile_base("path");d=ImageDraw.Draw(t)
    for y in (6,19,28):
        d.line((0,y,31,y),fill=shade(C["path"],-12))
        d.point((8,y-2),fill=C["soil"])
        d.point((24,y+2 if y<29 else y),fill=C["soil"])
    items.append(t)

    t=tile_base("stone");d=ImageDraw.Draw(t)
    d.line((0,15,31,15),fill=C["shadow"]);d.line((15,0,15,31),fill=C["shadow"])
    d.line((2,2,13,2),fill=shade(C["stone"],18));d.line((18,18,30,18),fill=shade(C["stone"],18))
    items.append(t)

    t=tile_base("plaster");d=ImageDraw.Draw(t)
    d.rectangle((0,26,31,31),fill=C["wood_dark"]);d.line((2,5,29,5),fill=shade(C["plaster"],12))
    items.append(t)

    t=tile_base("wood_light");d=ImageDraw.Draw(t)
    for x in range(0,32,8):
        d.line((x,0,x,31),fill=C["wood_dark"])
        d.point((x+3,9),fill=C["wood_mid"]);d.point((x+5,25),fill=C["wood_mid"])
    items.append(t)

    t=tile_base("interior_floor");d=ImageDraw.Draw(t)
    for y in range(0,32,8):
        d.line((0,y,31,y),fill=C["wood_mid"])
        d.point((9,y+3),fill=shade(C["interior_floor"],12))
        d.point((24,y+5),fill=shade(C["interior_floor"],-12))
    items.append(t)

    t=tile_base("roof");d=ImageDraw.Draw(t)
    for y in range(4,32,8):
        d.line((0,y,31,y),fill=C["roof_shadow"])
        d.line((4,y-2,28,y-2),fill=shade(C["roof"],12))
    items.append(t)

    t=tile_base("grass");d=ImageDraw.Draw(t)
    d.rectangle((5,0,9,31),fill=C["wood_dark"]);d.rectangle((22,0,26,31),fill=C["wood_dark"])
    d.rectangle((0,10,31,15),fill=C["wood_mid"]);d.line((0,10,31,10),fill=C["wood_light"])
    items.append(t)

    t=tile_base("grass");d=ImageDraw.Draw(t)
    d.line((15,17,15,30),fill=C["grass_shadow"],width=2)
    d.polygon([(4,24),(13,9),(17,24)],fill=C["grass_shadow"])
    d.polygon([(13,25),(23,11),(28,25)],fill=C["grass_detail"])
    items.append(t)

    t=tile_base("grass");d=ImageDraw.Draw(t)
    d.polygon([(5,25),(8,13),(17,7),(27,15),(29,25)],fill=C["stone"])
    d.line((10,14,18,10),fill=shade(C["stone"],20));d.line((7,25,28,25),fill=C["shadow"])
    items.append(t)

    t=tile_base("plaster");d=ImageDraw.Draw(t)
    d.rectangle((6,2,25,31),fill=C["wood_dark"]);d.rectangle((9,5,22,31),fill=C["wood_mid"])
    d.line((10,7,21,7),fill=C["wood_light"]);d.rectangle((18,17,20,19),fill=C["accent"])
    items.append(t)

    t=tile_base("plaster");d=ImageDraw.Draw(t)
    d.rectangle((4,4,27,27),fill=C["wood_dark"]);d.rectangle((7,7,24,24),fill=shade(C["stone"],22))
    d.line((16,7,16,24),fill=C["plaster"]);d.line((7,16,24,16),fill=C["plaster"])
    d.line((8,8,14,8),fill=shade(C["stone"],40))
    items.append(t)

    t=tile_base("wood_mid");d=ImageDraw.Draw(t)
    for x in range(0,32,8):
        d.line((x,0,x,31),fill=C["wood_dark"])
        d.line((x+2,0,x+2,31),fill=shade(C["wood_mid"],10))
    items.append(t)

    t=tile_base("interior_wall");d=ImageDraw.Draw(t)
    d.rectangle((0,26,31,31),fill=C["wood_dark"])
    d.line((2,4,29,4),fill=shade(C["interior_wall"],14))
    items.append(t)

    for i,tile in enumerate(items):
        sheet.alpha_composite(tile,((i%4)*32,(i//4)*32))
    TILES.parent.mkdir(parents=True,exist_ok=True)
    sheet.save(TILES)

def canvas(base="grass"):
    return Image.new("RGBA",(512,320),C[base])

def path_cross(d):
    d.polygon([(0,132),(128,132),(128,124),(224,124),(224,0),(288,0),(288,124),(384,124),(384,132),(512,132),
               (512,196),(384,196),(384,204),(288,204),(288,320),(224,320),(224,204),(128,204),(128,196),(0,196)],fill=C["path"])
    for x,y in [(36,146),(90,179),(178,143),(316,184),(420,151),(470,181),(243,44),(268,82),(239,250),(270,286)]:
        d.rectangle((x,y,x+4,y+2),fill=shade(C["path"],-17))

def village():
    im=canvas();d=ImageDraw.Draw(im);grass_specks(d);path_cross(d)
    d.rectangle((39,73,194,157),fill=shade(C["grass_shadow"],-10))
    d.rectangle((48,63,186,148),fill=C["plaster"]);d.rectangle((48,139,186,148),fill=C["wood_dark"])
    d.polygon([(28,70),(115,20),(206,70),(190,81),(43,81)],fill=C["roof"])
    d.line((39,69,194,69),fill=C["roof_shadow"],width=5);d.line((54,56,176,56),fill=shade(C["roof"],12),width=3)
    d.rectangle((103,105,133,148),fill=C["wood_dark"]);d.rectangle((108,110,128,148),fill=C["wood_mid"])
    d.rectangle((59,91,89,114),fill=C["wood_dark"]);d.rectangle((64,96,84,109),fill=shade(C["stone"],28))
    d.line((74,96,74,109),fill=C["plaster"])
    for x in range(328,472,36):
        d.rectangle((x,68,x+5,136),fill=C["wood_dark"]);d.line((x+1,68,x+4,68),fill=C["wood_light"])
    d.rectangle((326,91,478,98),fill=C["wood_mid"]);d.line((326,91,478,91),fill=C["wood_light"])
    d.ellipse((338,222,369,253),fill=C["wood_dark"]);d.rectangle((340,228,367,247),fill=C["wood_mid"])
    d.line((341,234,366,234),fill=C["wood_dark"],width=2);d.line((341,244,366,244),fill=C["wood_dark"],width=2)
    d.rectangle((391,239,417,265),fill=C["wood_mid"],outline=C["wood_dark"],width=3)
    d.line((393,241,415,263),fill=C["wood_light"]);d.line((415,241,393,263),fill=C["wood_dark"])
    d.polygon([(447,264),(456,233),(464,264)],fill=C["grass_shadow"])
    d.polygon([(454,264),(468,241),(474,264)],fill=C["grass_detail"])
    im.save(SCENES/"village_micro_v1.png")

def field():
    im=canvas();d=ImageDraw.Draw(im);grass_specks(d,step=40)
    d.polygon([(0,178),(74,160),(130,156),(194,168),(255,151),(319,143),(380,162),(439,157),(512,136),
               (512,205),(448,214),(381,210),(316,198),(260,199),(197,214),(133,211),(71,221),(0,228)],fill=C["path"])
    for x,y in [(30,192),(112,182),(187,190),(270,173),(347,187),(431,184),(486,160)]:
        d.rectangle((x,y,x+7,y+2),fill=shade(C["path"],-16))
    for x,y in [(68,64),(433,70),(380,249),(151,258)]:
        d.ellipse((x+3,y+8,x+24,y+22),fill=C["shadow"])
        d.polygon([(x,y+16),(x+6,y+5),(x+15,y),(x+26,y+9),(x+24,y+18)],fill=C["stone"])
        d.line((x+8,y+6,x+15,y+3),fill=shade(C["stone"],22),width=2)
    for x,y in [(32,48),(127,82),(232,53),(331,91),(472,44),(55,270),(273,266),(451,277)]:
        d.line((x,y,x+4,y-9),fill=C["grass_shadow"],width=2)
        d.line((x+5,y,x+8,y-7),fill=C["grass_detail"],width=2)
    im.save(SCENES/"grass_field_micro_v1.png")

def exterior():
    im=canvas();d=ImageDraw.Draw(im);grass_specks(d,step=52)
    d.rectangle((0,230,511,319),fill=C["soil"]);d.rectangle((0,230,511,237),fill=shade(C["soil"],-16))
    d.rectangle((116,108,405,260),fill=shade(C["grass_shadow"],-16))
    d.rectangle((128,101,392,248),fill=C["plaster"]);d.rectangle((120,242,400,254),fill=C["stone"])
    d.line((128,113,392,113),fill=shade(C["plaster"],16),width=3)
    d.polygon([(94,112),(110,96),(110,88),(128,88),(128,78),(153,78),(153,66),(182,66),(182,54),(214,54),
               (214,42),(258,28),(302,42),(302,54),(334,54),(334,66),(363,66),(363,78),(388,78),(388,88),
               (406,88),(406,96),(422,112)],fill=C["roof"])
    for y in (61,78,95):
        d.line((126,y,390,y),fill=C["roof_shadow"],width=3)
    d.line((113,109,403,109),fill=shade(C["roof"],14),width=3)
    d.rectangle((238,177,283,248),fill=C["wood_dark"]);d.rectangle((245,184,276,248),fill=C["wood_mid"])
    d.rectangle((268,213,272,217),fill=C["accent"])
    for x in (158,311):
        d.rectangle((x,149,x+48,187),fill=C["wood_dark"])
        d.rectangle((x+6,155,x+42,181),fill=shade(C["stone"],25))
        d.line((x+24,155,x+24,181),fill=C["plaster"]);d.line((x+6,168,x+42,168),fill=C["plaster"])
        d.line((x+8,157,x+21,157),fill=shade(C["stone"],42))
    d.rectangle((427,208,459,252),fill=C["wood_dark"]);d.rectangle((431,213,455,248),fill=C["wood_mid"])
    d.line((432,223,454,223),fill=C["wood_light"]);d.line((432,239,454,239),fill=C["wood_dark"])
    d.polygon([(55,264),(64,236),(73,264)],fill=C["grass_shadow"])
    d.polygon([(64,264),(78,242),(86,264)],fill=C["grass_detail"])
    im.save(SCENES/"house_exterior_v1.png")

def interior():
    im=Image.new("RGBA",(512,320),C["interior_wall"]);d=ImageDraw.Draw(im)
    d.rectangle((28,40,484,292),fill=C["interior_floor"])
    d.rectangle((28,40,484,54),fill=C["wood_dark"]);d.line((28,55,484,55),fill=C["wood_light"],width=2)
    for x in range(36,484,32):
        d.line((x,56,x,292),fill=C["wood_mid"])
        d.line((x+2,56,x+2,292),fill=shade(C["interior_floor"],10))
    d.rectangle((52,74,174,137),fill=C["wood_dark"]);d.rectangle((59,81,168,130),fill=C["plaster"])
    d.rectangle((59,81,89,130),fill=shade(C["plaster"],18));d.line((92,81,92,130),fill=C["wood_light"])
    d.rectangle((202,91,318,157),fill=C["shadow"]);d.rectangle((207,96,313,151),fill=C["furniture"])
    d.rectangle((214,103,306,144),fill=C["wood_light"]);d.line((214,103,306,103),fill=shade(C["wood_light"],18),width=2)
    d.rectangle((210,174,247,205),fill=C["wood_dark"]);d.rectangle((217,178,240,200),fill=C["wood_mid"])
    d.rectangle((280,174,317,205),fill=C["wood_dark"]);d.rectangle((287,178,310,200),fill=C["wood_mid"])
    d.rectangle((385,67,455,181),fill=C["wood_dark"]);d.rectangle((392,74,448,174),fill=C["furniture"])
    for y in (94,122,150):
        d.rectangle((392,y,448,y+6),fill=C["wood_mid"]);d.line((394,y,446,y),fill=C["wood_light"])
    d.rectangle((54,198,140,282),fill=C["stone"]);d.rectangle((65,208,129,282),fill=shade(C["stone"],-12))
    d.rectangle((76,226,118,281),fill=C["shadow"])
    d.polygon([(87,278),(94,250),(100,260),(106,237),(116,278)],fill=C["accent"])
    d.rectangle((230,267,284,319),fill=C["shadow"]);d.rectangle((238,272,276,319),fill=C["wood_dark"])
    d.rectangle((244,276,270,319),fill=C["wood_mid"])
    d.ellipse((345,242,369,261),fill=C["wood_dark"]);d.rectangle((348,249,366,264),fill=C["wood_mid"])
    d.point((357,246),fill=C["accent"])
    im.save(SCENES/"house_interior_v1.png")

tilesheet()
village()
field()
exterior()
interior()
print("GRAY CROWN ENVIRONMENT PROTOTYPE v1 GENERATED")
