#!/usr/bin/env python3
"""Generate unique pixel-art sprites for skeleton and goblin enemy types."""

from PIL import Image, ImageDraw
import os

SCALE = 32          # each logical pixel = SCALE×SCALE actual pixels
GRID  = 64          # logical canvas size
SIZE  = GRID * SCALE  # 2048

OUT_DIR = os.path.join(os.path.dirname(__file__),
                       "../client/public/images/melody-dungeon")

# ── Palette ──────────────────────────────────────────────────────────────────
T  = (  0,   0,   0,   0)   # transparent
BK = ( 26,  16,   8, 255)   # near-black outline
BW = (245, 240, 232, 255)   # bone white
BM = (212, 207, 192, 255)   # bone mid
BS = (160, 152, 128, 255)   # bone shadow
ED = ( 13,   8,   8, 255)   # eye socket dark
RG = (255,  32,  32, 255)   # red glow
MN = (204,  16,  16, 255)   # music note red
MD = (140,   8,   8, 255)   # music note dark

# Goblin palette
GG = ( 61, 153, 112, 255)   # goblin green
GH = ( 82, 190, 128, 255)   # green highlight
GS = ( 30, 132,  73, 255)   # green shadow
GO = ( 20,  90,  50, 255)   # goblin outline (dark green)
TW = (253, 254, 254, 255)   # tooth white
PA = (142,  68, 173, 255)   # purple accent
PD = (108,  52, 131, 255)   # purple dark


def make_canvas():
    return Image.new("RGBA", (SIZE, SIZE), T)


def px(draw, x, y, color):
    """Fill the logical pixel at (x,y) with color."""
    if color[3] == 0:
        return
    x0, y0 = x * SCALE, y * SCALE
    draw.rectangle([x0, y0, x0 + SCALE - 1, y0 + SCALE - 1], fill=color)


def draw_skeleton():
    img = make_canvas()
    d   = ImageDraw.Draw(img)

    def p(x, y, c):
        px(d, x, y, c)

    # ── Skull outline (oval, rows 4-28, centered around x=32) ───────────────
    skull_rows = [
        # (x_start, x_end)  — half-open range
        (26, 38),  # row 4
        (23, 41),  # row 5
        (21, 43),  # row 6
        (19, 45),  # row 7
        (18, 46),  # row 8
        (17, 47),  # row 9
        (17, 47),  # row 10
        (16, 48),  # row 11
        (16, 48),  # row 12
        (16, 48),  # row 13
        (16, 48),  # row 14
        (16, 48),  # row 15
        (17, 47),  # row 16
        (17, 47),  # row 17
        (18, 46),  # row 18
        (18, 46),  # row 19
        (19, 45),  # row 20
        (19, 45),  # row 21
        (20, 44),  # row 22
        (21, 43),  # row 23
        (22, 42),  # row 24
        (23, 41),  # row 25
        (24, 40),  # row 26
        (23, 41),  # row 27 (jaw widens)
        (22, 42),  # row 28
    ]

    for row_i, (x0, x1) in enumerate(skull_rows):
        row = 4 + row_i
        for x in range(x0, x1):
            # outline pixels on edges, fill inside
            if x == x0 or x == x1 - 1:
                p(x, row, BK)
            else:
                p(x, row, BW)

    # Top outline
    for x in range(26, 38):
        p(x, 3, BK)

    # ── Bone shading (right side highlight, left shadow) ────────────────────
    for row in range(5, 24):
        for x in range(18, 22):
            p(x, row, BS)
        for x in range(42, 46):
            p(x, row, BM)

    # ── Eye sockets ─────────────────────────────────────────────────────────
    # Left eye socket: centered around x=23, rows 10-16
    eye_l = [(22,25), (21,26), (21,26), (21,26), (21,26), (22,25), (22,25)]
    # Right eye socket: centered around x=41, rows 10-16
    eye_r = [(39,42), (38,43), (38,43), (38,43), (38,43), (39,42), (39,42)]

    for i, ((lx0,lx1),(rx0,rx1)) in enumerate(zip(eye_l, eye_r)):
        row = 10 + i
        for x in range(lx0, lx1):
            p(x, row, ED)
        for x in range(rx0, rx1):
            p(x, row, ED)
        # red glow center pixel
        if lx0 <= 23 < lx1:
            p(23, row, RG)
        if rx0 <= 40 < rx1:
            p(40, row, RG)

    p(23, 12, RG); p(23, 13, RG)
    p(40, 12, RG); p(40, 13, RG)

    # ── Nasal cavity ────────────────────────────────────────────────────────
    p(31, 18, ED); p(32, 18, ED)
    p(30, 19, ED); p(31, 19, ED); p(32, 19, ED); p(33, 19, ED)
    p(31, 20, ED); p(32, 20, ED)

    # ── Teeth row (row 27-28) ────────────────────────────────────────────────
    teeth_x = [23, 25, 27, 29, 31, 33, 35, 37, 39]
    for tx in teeth_x:
        p(tx,     27, BW)
        p(tx + 1, 27, BW)
        p(tx,     28, BW)
        p(tx + 1, 28, BK)  # bottom tooth shadow
    # outline between teeth
    for tx in [24, 26, 28, 30, 32, 34, 36, 38]:
        p(tx, 27, BK)

    # Jaw outline bottom
    for x in range(22, 42):
        p(x, 29, BK)

    # ── Neck ────────────────────────────────────────────────────────────────
    for row in range(30, 33):
        for x in range(29, 35):
            p(x, row, BW if x in (30,31,32,33) else BK)
        p(29, row, BK); p(34, row, BK)

    # ── Ribcage ─────────────────────────────────────────────────────────────
    # Spine column
    for row in range(33, 54):
        p(31, row, BM); p(32, row, BW)

    # Left ribs (rows 33-52, alternating every 3 rows)
    rib_rows = [33, 36, 39, 42, 45, 48, 51]
    for rr in rib_rows:
        # left rib arc
        p(30, rr,   BW); p(29, rr,   BW); p(28, rr,   BS)
        p(27, rr+1, BW); p(26, rr+1, BW); p(25, rr+1, BS)
        p(26, rr+2, BK); p(27, rr+2, BK)
        # right rib arc (mirror)
        p(33, rr,   BW); p(34, rr,   BW); p(35, rr,   BM)
        p(36, rr+1, BW); p(37, rr+1, BW); p(38, rr+1, BM)
        p(37, rr+2, BK); p(38, rr+2, BK)

    # Ribcage side outlines
    for row in range(33, 54):
        p(24, row, BK); p(39, row, BK)

    # ── Left arm (dangling down-left) ────────────────────────────────────────
    arm_l = [
        (22, 33), (21, 34), (20, 35), (20, 36),
        (19, 37), (19, 38), (18, 39), (18, 40),
        (18, 41), (17, 42), (17, 43), (16, 44),
    ]
    for x, row in arm_l:
        p(x, row, BW); p(x-1, row, BK)

    # Left hand / finger bones
    p(14, 45, BW); p(15, 45, BW); p(16, 45, BW)
    p(13, 46, BK); p(14, 46, BW); p(16, 46, BW); p(17, 46, BK)
    p(13, 47, BK); p(16, 47, BK)

    # ── Right arm (reaching forward, holding note) ───────────────────────────
    arm_r = [
        (41, 33), (42, 34), (43, 35), (44, 36),
        (44, 37), (45, 38), (46, 39), (46, 40),
        (47, 41), (47, 42),
    ]
    for x, row in arm_r:
        p(x, row, BW); p(x+1, row, BK)

    # Right hand
    p(47, 43, BW); p(48, 43, BW)
    p(47, 44, BK); p(48, 44, BK)

    # ── Music note (held in right hand) ─────────────────────────────────────
    # Note head (oval, rows 45-47, x 46-49)
    p(47, 45, MN); p(48, 45, MN)
    p(46, 46, MN); p(47, 46, MN); p(48, 46, MN); p(49, 46, MN)
    p(47, 47, MN); p(48, 47, MN)
    # Note stem (going up)
    p(49, 44, MN); p(49, 43, MN); p(49, 42, MN); p(49, 41, MN)
    # Note flag
    p(50, 42, MD); p(51, 43, MD); p(50, 44, MD)
    # Outline
    p(46, 45, BK); p(49, 45, BK)
    p(45, 46, BK); p(50, 46, BK)
    p(46, 48, BK); p(49, 48, BK)

    return img


def draw_goblin():
    img = make_canvas()
    d   = ImageDraw.Draw(img)

    def p(x, y, c):
        px(d, x, y, c)

    # ── Big round head (rows 4-32, centered x=32) ───────────────────────────
    head_rows = [
        (28, 36),  # 4
        (25, 39),  # 5
        (23, 41),  # 6
        (21, 43),  # 7
        (20, 44),  # 8
        (19, 45),  # 9
        (18, 46),  # 10
        (17, 47),  # 11
        (17, 47),  # 12
        (17, 47),  # 13
        (17, 47),  # 14
        (17, 47),  # 15
        (17, 47),  # 16
        (18, 46),  # 17
        (18, 46),  # 18
        (19, 45),  # 19
        (20, 44),  # 20
        (21, 43),  # 21
        (21, 43),  # 22
        (20, 44),  # 23 (cheeks widen for grin)
        (20, 44),  # 24
        (21, 43),  # 25
        (22, 42),  # 26
        (23, 41),  # 27
        (24, 40),  # 28
        (25, 39),  # 29
        (26, 38),  # 30
        (27, 37),  # 31
        (27, 37),  # 32 (chin)
    ]

    for row_i, (x0, x1) in enumerate(head_rows):
        row = 4 + row_i
        for x in range(x0, x1):
            if x == x0 or x == x1 - 1:
                p(x, row, GO)
            else:
                p(x, row, GG)

    # Top of head outline
    for x in range(28, 36):
        p(x, 3, GO)

    # Highlight (top-right quadrant)
    for row in range(5, 15):
        for x in range(36, 42):
            p(x, row, GH)

    # Shadow (left side)
    for row in range(8, 22):
        for x in range(18, 22):
            p(x, row, GS)

    # ── Large pointed ears ───────────────────────────────────────────────────
    # Left ear (rows 8-18, x 10-18)
    left_ear = [
        (16, 17),  # 8
        (14, 17),  # 9
        (12, 17),  # 10
        (11, 17),  # 11
        (10, 16),  # 12
        (10, 15),  # 13
        (11, 15),  # 14
        (12, 16),  # 15
        (13, 17),  # 16
        (14, 17),  # 17
        (15, 18),  # 18
    ]
    for ei, (x0, x1) in enumerate(left_ear):
        row = 8 + ei
        for x in range(x0, x1):
            p(x, row, GO if (x == x0 or x == x1-1) else GG)
    p(10, 11, GO); p(10, 12, GO)

    # Right ear (mirror)
    right_ear = [
        (47, 48),
        (47, 50),
        (47, 52),
        (47, 53),
        (48, 54),
        (49, 54),
        (49, 53),
        (48, 52),
        (47, 51),
        (47, 50),
        (46, 49),
    ]
    for ei, (x0, x1) in enumerate(right_ear):
        row = 8 + ei
        for x in range(x0, x1):
            p(x, row, GO if (x == x0 or x == x1-1) else GG)

    # ── Red glowing eyes ─────────────────────────────────────────────────────
    # Left eye (rows 12-15, x 21-25)
    for row in range(12, 15):
        p(21, row, GO); p(22, row, RG); p(23, row, RG); p(24, row, GO)
    p(22, 11, GO); p(23, 11, GO); p(22, 15, GO); p(23, 15, GO)

    # Right eye (rows 12-15, x 39-43)
    for row in range(12, 15):
        p(39, row, GO); p(40, row, RG); p(41, row, RG); p(42, row, GO)
    p(40, 11, GO); p(41, 11, GO); p(40, 15, GO); p(41, 15, GO)

    # Angry brow (squinting)
    for x in range(21, 25):
        p(x, 10, GO)
    for x in range(39, 43):
        p(x, 10, GO)
    # Tilted inward
    p(24, 9, GO); p(39, 9, GO)

    # ── Nose ─────────────────────────────────────────────────────────────────
    p(31, 19, GS); p(32, 19, GS)
    p(30, 20, GO); p(33, 20, GO)

    # ── Wide grinning mouth ──────────────────────────────────────────────────
    # Mouth opening rows 22-26, wide
    for x in range(22, 42):
        p(x, 22, GO)  # top lip outline
    for x in range(21, 43):
        p(x, 23, GO)
    # Interior of mouth
    for row in range(24, 27):
        for x in range(22, 42):
            p(x, row, GO if (x == 22 or x == 41) else (GS if row == 26 else GG))
    for x in range(22, 42):
        p(x, 27, GO)  # chin / bottom outline

    # Jagged white teeth (4 pairs)
    teeth_positions = [24, 28, 32, 36]
    for tx in teeth_positions:
        p(tx,   23, TW); p(tx+1, 23, TW)
        p(tx,   24, TW); p(tx+1, 24, TW)
        p(tx,   25, TW); p(tx+1, 25, TW)
        p(tx+2, 23, GO)  # gap between teeth

    # ── Stocky body ──────────────────────────────────────────────────────────
    # Torso (rows 33-50, wide)
    for row in range(33, 51):
        width = 12 if row < 40 else 10
        cx = 32
        x0 = cx - width; x1 = cx + width
        for x in range(x0, x1):
            if x == x0 or x == x1-1:
                p(x, row, GO)
            else:
                p(x, row, GG if x > cx else GS)

    # Purple accent collar / cape
    for x in range(22, 42):
        p(x, 33, PA)
        p(x, 34, PA if x in range(23, 41) else PD)
    p(21, 33, PD); p(42, 33, PD)

    # ── Short stubby arms ────────────────────────────────────────────────────
    # Left arm: slopes 1px outward per 3 rows from attachment at x=19
    for row in range(35, 48):
        offset = (row - 35) // 3
        x = 19 - offset
        p(x, row, GO); p(x+1, row, GG)
    # Left claws
    p(13, 48, GO); p(14, 48, GG)
    p(12, 49, GO); p(14, 49, GO)
    p(13, 49, GG)

    # Right arm: slopes 1px outward per 3 rows from attachment at x=44
    for row in range(35, 48):
        offset = (row - 35) // 3
        x = 44 + offset
        p(x, row, GG); p(x+1, row, GO)
    # Right claws
    p(49, 48, GG); p(50, 48, GO)
    p(49, 49, GG); p(50, 49, GO); p(51, 49, GO)

    # ── Stubby legs ──────────────────────────────────────────────────────────
    for row in range(51, 58):
        # left leg
        p(25, row, GO); p(26, row, GG); p(27, row, GG); p(28, row, GO)
        # right leg
        p(35, row, GO); p(36, row, GG); p(37, row, GG); p(38, row, GO)
    # Feet
    for x in range(23, 30):
        p(x, 58, GO if x in (23,29) else GS)
    for x in range(34, 41):
        p(x, 58, GO if x in (34,40) else GS)

    # ── Floating music note (upper right) ────────────────────────────────────
    # Note head
    p(50, 8,  MN); p(51, 8,  MN)
    p(49, 9,  MN); p(50, 9,  MN); p(51, 9,  MN); p(52, 9,  MN)
    p(50, 10, MN); p(51, 10, MN)
    # Stem
    p(52, 7,  MN); p(52, 6,  MN); p(52, 5,  MN); p(52, 4,  MN)
    # Flag
    p(53, 5,  MD); p(54, 6,  MD); p(53, 7,  MD)
    # Outline
    p(49, 8,  GO); p(52, 8,  GO)
    p(48, 9,  GO); p(53, 9,  GO)
    p(49, 11, GO); p(52, 11, GO)

    return img


def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    skeleton = draw_skeleton()
    path_s = os.path.join(OUT_DIR, "skeleton.png")
    skeleton.save(path_s, "PNG")
    print(f"Saved: {path_s}")

    goblin = draw_goblin()
    path_g = os.path.join(OUT_DIR, "goblin.png")
    goblin.save(path_g, "PNG")
    print(f"Saved: {path_g}")


if __name__ == "__main__":
    main()
