"""Cut each color sheet in art-raw/ into one transparent image per food (public/img/food/<id>.webp),
in the order the stickers sit on the sheet (rows top to bottom, left to right). NAMES maps that
order to food ids from public/js/foods.js; None skips a duplicate sticker."""
import os
from PIL import Image, ImageFilter
from scipy import ndimage
NAMES = {
 "red": ["strawberry","red-apple","cherries","watermelon","radish","raspberries","tomato","red-bell-pepper",None,"red-plum","pomegranate","beet","red-onion","red-grapes"],
 "orange": ["carrot","orange","mango","sweet-potato",None,"pumpkin","peach","cantaloupe","orange-bell-pepper","butternut-squash",None,"apricot","clementine","papaya"],
 "yellow": ["banana","lemon","pineapple","corn",None,"yellow-pear","summer-squash","yellow-bell-pepper","golden-beet","ginger",None,"plantain","yellow-apple","starfruit"],
 "green": ["broccoli","peas","cucumber","avocado","kiwi",None,"green-apple","spinach","green-beans","lettuce","green-cabbage","celery","zucchini","green-grapes"],
 "purple": ["blueberries","purple-grapes","eggplant","purple-plum","purple-cabbage","blackberries",None,"black-beans","figs","purple-potato",None,"black-olives","purple-carrot","purple-cauliflower"],
 "brown": ["almonds","walnuts","peanuts","oats","onion","mushrooms","shallot","garlic","cauliflower","cacao","chickpeas","lentils","coconut"],
}
OUT = "../public/img/food"; os.makedirs(OUT, exist_ok=True)
import numpy as np
for sheet, names in NAMES.items():
    im = Image.open(f"art-raw/{sheet}.png").convert("RGBA")
    a = np.array(im)[:, :, 3] > 40
    a = ndimage.binary_dilation(a, iterations=6)
    lab, n = ndimage.label(a)
    boxes = [b for b in ndimage.find_objects(lab) if (b[0].stop-b[0].start) * (b[1].stop-b[1].start) > 4000]
    boxes.sort(key=lambda b: b[0].start)
    rows, cur = [], [boxes[0]]
    for b in boxes[1:]:
        if b[0].start - cur[0][0].start > 120: rows.append(cur); cur = [b]
        else: cur.append(b)
    rows.append(cur)
    order = [b for r in rows for b in sorted(r, key=lambda b: b[1].start)]
    print(sheet, len(order), "stickers,", len(names), "names", [len(r) for r in rows])
    for b, name in zip(order, names):
        if not name: continue
        crop = im.crop((b[1].start, b[0].start, b[1].stop, b[0].stop))
        s = max(crop.size); sq = Image.new("RGBA", (s, s)); sq.paste(crop, ((s-crop.width)//2, (s-crop.height)//2))
        sq.resize((256, 256), Image.LANCZOS).save(f"{OUT}/{name}.webp", quality=88)
