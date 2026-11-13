// The built-in plant list, sorted into the six colors of the tiny health "Eat the Rainbow" sheet
// (white foods like cauliflower, garlic and onion go in brown).
// Each line: "Name | emoji | other words people might type". The id is the name in kebab-case.
// Foods with a drawing in img/food/<id>.webp show it; the rest use their emoji (or a color dot).
// Only plants: fruit, vegetables, nuts, seeds, beans, whole grains, herbs, spices, fermented plant foods.

export const COLORS = [
  { id: "red", name: "Red", hex: "#E8505B" },
  { id: "orange", name: "Orange", hex: "#F5923E" },
  { id: "yellow", name: "Yellow", hex: "#F6CC3F" },
  { id: "green", name: "Green", hex: "#4FB574" },
  { id: "purple", name: "Blue & purple", hex: "#7E6BD9" },
  { id: "brown", name: "Brown & white", hex: "#A87556" },
];

const LIST = {
  red: `
Strawberry | 🍓 | strawberries
Red apple | 🍎 | apple, apples
Cherries | 🍒 | cherry
Watermelon | 🍉 | melon
Raspberries | | raspberry
Tomato | 🍅 | tomatoes, cherry tomatoes
Red bell pepper | | pepper, peppers, bell pepper
Radish | | radishes
Red plum | | plum, plums
Pomegranate | | pomegranate seeds
Beet | | beets, beetroot
Red onion | | onion
Red grapes | | grapes
Cranberries | | cranberry, craisins
Red potatoes | | potato
Red quinoa | | quinoa
Red pear | | pear
Red chili pepper | 🌶️ | chili, chilli, hot pepper
Pink grapefruit | | grapefruit
Kidney beans | | red beans, beans
Goji berries | | goji
Dragon fruit | | pitaya
Rhubarb | |
Paprika | | spice
Red cabbage | | cabbage
Blood orange | | orange
Lingonberries | |
Red lentils | | lentils
`,
  orange: `
Carrot | 🥕 | carrots, baby carrots
Orange | 🍊 | oranges
Mango | 🥭 | mangoes
Sweet potato | 🍠 | sweet potatoes, yam, yams
Pumpkin | 🎃 | pumpkin puree
Peach | 🍑 | peaches
Cantaloupe | 🍈 | melon
Orange bell pepper | | pepper, bell pepper
Butternut squash | | squash
Apricot | | apricots, dried apricots
Clementine | | mandarin, cutie, cuties, tangerine
Papaya | |
Acorn squash | | squash
Turmeric | | spice
Persimmon | |
Nectarine | | nectarines
Kumquat | |
Grapefruit | |
Orange lentils | | lentils
Cara cara orange | | orange
Orange tomato | | tomato
Sea buckthorn | |
`,
  yellow: `
Banana | 🍌 | bananas
Lemon | 🍋 | lemons, lemon juice, lemon zest
Pineapple | 🍍 |
Corn | 🌽 | corn on the cob, sweet corn
Yellow pear | 🍐 | pear, pears
Summer squash | | yellow squash, squash
Yellow bell pepper | | pepper, bell pepper
Golden beet | | beet, beets
Ginger | 🫚 | ginger root
Plantain | | plantains
Yellow apple | | apple, golden delicious
Starfruit | | star fruit, carambola
Yellow cauliflower | | cauliflower
Millet | |
Quinoa | | grain
Nutritional yeast | | nooch
Spaghetti squash | | squash
Yellow tomato | | tomato
Golden kiwi | | kiwi
Popcorn | 🍿 | corn
Banana peppers | | pepper
Mustard seed | | mustard
Saffron | | spice
Yellow potatoes | | potato, yukon gold
Pineapple guava | | feijoa
Lemon verbena | | herb
`,
  green: `
Broccoli | 🥦 |
Peas | | pea, green peas
Cucumber | 🥒 | cucumbers
Avocado | 🥑 | guacamole
Kiwi | 🥝 | kiwis
Green apple | 🍏 | apple, granny smith
Spinach | 🥬 |
Green beans | | beans
Lettuce | 🥬 | salad, romaine
Green cabbage | | cabbage, coleslaw
Celery | |
Zucchini | | courgette, squash
Green grapes | | grapes
Artichoke | |
Asparagus | |
Bok choy | |
Brussels sprouts | | brussel sprouts
Capers | |
Green onion | | scallions, spring onion
Oregano | | herbs
Thyme | | herbs
Basil | 🌿 | herbs, pesto
Parsley | | herbs
Cilantro | | herbs, coriander leaves
Mint | | herbs
Dill | | herbs
Rosemary | | herbs
Kale | |
Swiss chard | | chard
Collard greens | | collards
Leeks | | leek
Microgreens | | sprouts
Pickles | | pickle
Seaweed | | nori, kelp
Snap peas | | sugar snap peas, snow peas
Edamame | 🫛 | soybeans
Green bell pepper | 🫑 | pepper, bell pepper
Lime | | limes
Honeydew | | melon
Green pear | | pear
Pistachios | | pistachio
Matcha | 🍵 | green tea
Arugula | | rocket
Jalapeño | | jalapeno, pepper
Okra | |
Green olives | 🫒 | olives
Fennel | |
Tomatillo | |
Lemongrass | |
Chives | | herbs
Sage | | herbs
Pumpkin seeds | | pepitas, seeds
Mung beans | | beans
`,
  purple: `
Blueberries | 🫐 | blueberry, berries
Purple grapes | 🍇 | grapes
Eggplant | 🍆 | aubergine
Purple plum | | plum, plums
Blackberries | | blackberry, berries
Purple cabbage | | red cabbage, cabbage
Black beans | | beans
Figs | | fig, fresh figs
Purple potato | | potato
Black olives | | olives
Purple carrot | | carrot
Purple cauliflower | | cauliflower
Black tea | | tea
Purple sweet potato | | sweet potato, ube
Acai | | açaí
Elderberries | | elderberry
Blackcurrants | |
Prunes | |
Raisins | |
Purple kale | | kale
Purple asparagus | | asparagus
Passion fruit | |
Black rice | | forbidden rice, rice
Purple basil | | basil
Purple onion | | onion
Black lentils | | lentils
Purple corn | | corn
Plum tomatoes | | tomato
Mulberries | |
`,
  brown: `
Almonds | | almond, almond butter
Walnuts | | walnut
Peanuts | 🥜 | peanut, peanut butter
Oats | | oatmeal, porridge, granola
Onion | 🧅 | onions, white onion, yellow onion
Mushrooms | 🍄 | mushroom
Shallot | | shallots
Garlic | 🧄 |
Cauliflower | | white cauliflower
Cacao | | cocoa, cocoa powder, cacao powder, chocolate, dark chocolate
Chickpeas | | garbanzo, hummus
Lentils | | brown lentils, green lentils
Coconut | 🥥 |
Bamboo shoots | |
Flaxseed | | flax, linseed
Kimchi | |
Pinto beans | | beans, refried beans
White beans | | navy beans, cannellini, beans
Miso | |
Shiitake | | mushroom
Maitake | | mushroom
Hazelnuts | 🌰 | hazelnut
Pecans | | pecan
Cashews | | cashew
Brazil nuts | |
Macadamia | |
Pine nuts | |
Chia seeds | | chia, seeds
Hemp seeds | | hemp, seeds
Sunflower seeds | | sunflower, seeds
Sesame seeds | | sesame, tahini
Rye | | rye bread
Barley | |
Sauerkraut | |
Cardamom | | spice
Cinnamon | | spice
Cloves | | spice
Cumin | | spice
Nutmeg | | spice
Black pepper | | pepper
Sunchoke | | jerusalem artichoke
Potato | 🥔 | potatoes, russet
Brown rice | 🍚 | rice
Whole wheat | 🍞 | bread, wheat, pasta, whole grain bread
Buckwheat | |
Dates | |
Coffee | ☕ | coffee beans
Parsnip | | parsnips
Turnip | | turnips
Jicama | |
Tofu | | soy, soybeans
Tempeh | |
Vanilla | | vanilla bean
White rice | | rice
Water chestnuts | |
Horseradish | |
Daikon | | radish
`,
};

const IMG = new Set(`almonds apricot avocado banana beet black-beans black-olives blackberries blueberries broccoli
butternut-squash cacao cantaloupe carrot cauliflower celery cherries chickpeas clementine coconut corn cucumber eggplant
figs garlic ginger golden-beet green-apple green-beans green-cabbage green-grapes kiwi lemon lentils lettuce mango
mushrooms oats onion orange-bell-pepper orange papaya peach peanuts peas pineapple plantain pomegranate pumpkin
purple-cabbage purple-carrot purple-cauliflower purple-grapes purple-plum purple-potato radish raspberries red-apple
red-bell-pepper red-grapes red-onion red-plum shallot spinach starfruit strawberry summer-squash sweet-potato tomato
walnuts watermelon yellow-apple yellow-bell-pepper yellow-pear zucchini`.split(/\s+/));

export const slug = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const FOODS = [];
for (const [color, text] of Object.entries(LIST)) {
  for (const line of text.trim().split("\n")) {
    const [name, emoji = "", words = ""] = line.split("|").map((s) => s.trim());
    const id = slug(name);
    FOODS.push({
      id, name, color,
      emoji: emoji || null,
      img: IMG.has(id) ? `img/food/${id}.webp` : null,
      words: [name.toLowerCase(), ...words.split(",").map((w) => w.trim().toLowerCase()).filter(Boolean)],
      builtIn: true,
    });
  }
}

// Foods the family added (from the database) join the list at runtime.
export function addCustomFoods(list) {
  for (const f of list) {
    if (FOODS.some((x) => x.id === f.id)) continue;
    FOODS.push({ id: f.id, name: f.name, color: f.color, emoji: null, img: null, words: [f.name.toLowerCase()], builtIn: false });
  }
}

export const byId = (id) => FOODS.find((f) => f.id === id);

// Autocomplete: names starting with the text first, then other matching words.
export function search(text, limit = 8) {
  const q = text.toLowerCase().trim();
  if (!q) return [];
  const scored = [];
  for (const f of FOODS) {
    let score = 0;
    if (f.name.toLowerCase().startsWith(q)) score = 3;
    else if (f.words.some((w) => w.startsWith(q))) score = 2;
    else if (f.words.some((w) => w.includes(q))) score = 1;
    if (score) scored.push([score + (f.img ? 0.2 : 0), f]);
  }
  return scored.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name)).slice(0, limit).map((s) => s[1]);
}
