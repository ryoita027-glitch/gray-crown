#!/usr/bin/env python3
"""Rebuild Margaret V9 study from V8 source; never changes production assets."""
import argparse
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'assets/characters/margaret/studies/margaret_hair_underlock_v8_walk.png'
DST = ROOT / 'assets/characters/margaret/studies/margaret_silver_planes_v9_walk.png'
SIG = b'\x89PNG\r\n\x1a\n'

def read_png(file):
    data = file.read_bytes()
    if data[:8] != SIG:
        raise ValueError('PNG signature mismatch')
    p, idats, size = 8, [], None
    while p < len(data):
        n = struct.unpack_from('>I', data, p)[0]
        typ = data[p+4:p+8]
        body = data[p+8:p+8+n]
        if typ == b'IHDR':
            w,h,depth,color,_,_,_ = struct.unpack('>IIBBBBB', body)
            if (w,h,depth,color) != (288,192,8,6):
                raise ValueError('unexpected atlas dimensions or pixel format')
            size = (w,h)
        elif typ == b'IDAT':
            idats.append(body)
        p += n+12
        if typ == b'IEND':
            break
    if size is None:
        raise ValueError('missing IHDR')
    raw = bytearray(zlib.decompress(b''.join(idats)))
    w,h = size
    if len(raw) != h*(1+4*w) or any(raw[y*(1+4*w)] for y in range(h)):
        raise ValueError('requires unfiltered RGBA PNG source')
    return size, raw

def make_v9(raw):
    out = bytearray(raw)
    count = 0
    stride = 1+288*4
    for direction in range(4):
        for frame in range(6):
            for y in range(7,40):
                for x in range(8,40):
                    p = (direction*48+y)*stride+1+(frame*48+x)*4
                    R,G,B,A = raw[p:p+4]
                    if (A < 100 or R < 115 or G < 110 or B < 135
                            or B-R < 4 or B-G < 3):
                        continue
                    if not (y <= 25 or x < 19 or x > 28):
                        continue
                    out[p] = min(255, R + int((B-R)*.95+.5))
                    out[p+1] = min(255, G + int((B-G)*.95*.65+.5))
                    out[p+2] = max(0, B - int((B-R)*.95*.18+.5))
                    if out[p:p+3] != raw[p:p+3]:
                        count += 1
    return out, count

def chunk(name, body):
    content = name + body
    return struct.pack('>I',len(body)) + content + struct.pack('>I',zlib.crc32(content))

def encode_png(raw):
    ihdr = struct.pack('>IIBBBBB',288,192,8,6,0,0,0)
    return SIG + chunk(b'IHDR',ihdr) + chunk(b'IDAT',zlib.compress(raw,level=0)) + chunk(b'IEND',b'')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true', help='write only the isolated V9 study PNG')
    args = parser.parse_args()
    _, source = read_png(SRC)
    expected, changed = make_v9(source)
    if changed != 4165:
        raise ValueError(f'unexpected changed-pixel count: {changed}')
    if args.write:
        DST.write_bytes(encode_png(expected))
        print(f'wrote {DST.relative_to(ROOT)}; RGB changes={changed}')
    else:
        _, current = read_png(DST)
        if current != expected:
            raise ValueError('V9 study does not match reproducible source transform')
        print(f'V9 study verified; RGB changes={changed}, alpha unchanged')

if __name__ == '__main__':
    main()
