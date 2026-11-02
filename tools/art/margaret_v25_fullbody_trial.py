"""V25 full-body Margaret walk trial; never changes production sprites. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib
ROOT=Path(__file__).resolve().parents[2]
IDLE=ROOT/'assets/character_trials/margaret_idle_adult_mage_v22_structural_trial.png'
LOWER=ROOT/'assets/character_trials/margaret_walk_v24_leg_silhouette_trial.png'
OUT=ROOT/'assets/character_trials/margaret_walk_v25_body_motion_trial.png'
def blob(path):
    b=path.read_bytes()
    return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
assert blob(IDLE)=='d7d0aa4eaa7286b85c3cf0181b36c550962b688d'
assert blob(LOWER)=='a1cc824ae23dd45c0360341b474155c88d518a91'
idle=Image.open(IDLE).convert('RGBA')
lower=Image.open(LOWER).convert('RGBA')
assert idle.size==(192,192) and lower.size==(288,192)
out=Image.new('RGBA',(288,192))
bob=[0,-1,0,0,-1,0]
lean=[-1,-1,0,1,1,0]
arm=[-2,-1,0,2,1,0]
for direction in range(4):
    base=idle.crop((0,direction*48,48,(direction+1)*48))
    for frame_index in range(6):
        cell=lower.crop((frame_index*48,direction*48,(frame_index+1)*48,(direction+1)*48))
        for y in range(39):
            for x in range(48):
                cell.putpixel((x,y),(0,0,0,0))
        for y in range(39):
            for x in range(48):
                rgba=base.getpixel((x,y))
                if rgba[3]==0: continue
                dy=bob[frame_index] if 4<=y<=38 else 0
                dx=0
                if 23<=y<=35: dx=lean[frame_index]
                if 36<=y<=38: dx=0
                if 28<=y<=37 and direction in (0,1,2):
                    if x<=15: dx+=(-1 if arm[frame_index]<0 else 1 if arm[frame_index]>0 else 0)
                    elif x>=35: dx+=(1 if arm[frame_index]<0 else -1 if arm[frame_index]>0 else 0)
                xx=x+dx;yy=y+dy
                if 0<=xx<48 and 0<=yy<39: cell.putpixel((xx,yy),rgba)
        if bob[frame_index]:
            for x in range(48):
                px=base.getpixel((x,38))
                if px[3] and cell.getpixel((x,38))[3]==0: cell.putpixel((x,38),px)
        out.paste(cell,(frame_index*48,direction*48))
        assert cell.getchannel('A').getbbox()[3]==45
colors=sorted(set(out.getdata()))
assert len(colors)<=40
lut={c:i for i,c in enumerate(colors)}
indexed=Image.frombytes('P',out.size,bytes(lut[c] for c in out.getdata()))
indexed.putpalette([v for c in colors for v in c[:3]])
indexed.info['transparency']=bytes(c[3] for c in colors)
OUT.parent.mkdir(parents=True,exist_ok=True)
indexed.save(OUT,optimize=True)
assert blob(OUT)=='5c1ebe5f0f8b496f563c70a375aaa1300932ad52'
print('V25',OUT,blob(OUT),'colors',len(colors))
BOARD=ROOT/'docs/art/evidence/margaret_v24_v25_fullbody_native44_AB.png'
board=Image.new('RGB',(800,490),'#1b2423')
pen=ImageDraw.Draw(board)
font=ImageFont.load_default()
def bitmap_label(xy,label):
    mask=Image.new('1',board.size,0)
    ImageDraw.Draw(mask).text(xy,label,font=font,fill=1)
    board.paste('#f1ede4',(0,0,board.width,board.height),mask)
bitmap_label((18,14),'Margaret V24 (left) vs V25 (right) - native 44px, static source pixels')
for direction in range(4):
    for group,sheet in enumerate((lower,out)):
        for frame in range(6):
            x=22+group*390+frame*60;y=54+direction*104
            pen.rectangle((x,y,x+52,y+57),fill='#697e69')
            pen.line((x,y+55,x+52,y+55),fill='#405946')
            sprite=sheet.crop((frame*48,direction*48,(frame+1)*48,(direction+1)*48)).resize((44,44),Image.Resampling.NEAREST)
            board.paste(sprite,(x+4,y+10),sprite)
    bitmap_label((5,75+direction*104),('D','L','R','U')[direction])
BOARD.parent.mkdir(parents=True,exist_ok=True)
board_colors=sorted(set(board.getdata()))
board_lut={c:i for i,c in enumerate(board_colors)}
board_indexed=Image.frombytes('P',board.size,bytes(board_lut[c] for c in board.getdata()))
board_indexed.putpalette([v for c in board_colors for v in c])
board_indexed.save(BOARD,optimize=True)
print('A/B',BOARD,blob(BOARD))
