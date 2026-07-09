const messages = {
  normal: [
    "🦆 patoto「こんにちは！」",
    "🦆 patoto「今日も元気！」",
    "🦆 patoto「いっぱい遊ぼー！」",
    "🦆 patoto「ガァ！」",
　　"🦆 patoto「patotoどこ…」",
　　"🦆 patoto「え、patotoになるって」",
　　"🦆 patoto「僕はアヒル、鴨じゃない」",
  ],

  ow: [
    "🦆 patoto「OWやろー！」",
  ],

  vrc: [
    "🦆 patoto「VRChat行こー！」",
    "🦆 patoto「改変たのしいね！」",
    "🦆 patoto「今日はどこのワールド行く？」",
　　"🦆 patoto「Unityわからん」",
  ],

  food: [
    "🦆 patoto「パンちょうだい！」",
    "🦆 patoto「おなかすいた…」",
    "🦆 patoto「なに食べるー？」",
　　"🦆 patoto「焼肉行きたい！」",
  ],

  yakitori: [
    "🦆 patoto「焼かないで…🥺」",
    "🔥 patoto「なんか焦げ臭くない？」",
    "🦆 patoto「焼き鳥ではありません！」",
　　"🦆 patoto「おいしく食べてね…？」",

  ],

  rare: [
    "✨🦆 Golden patoto「今日は勝てる気がする！」",
　　"🦆 patoto「みんな大好き！」",
     ],
};

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomMessage() {
  // 2%でレア
  if (Math.random() < 0.001) {
    return pick(messages.rare);
  }

  const categories = ["normal", "ow", "vrc", "food", "yakitori"];
  const category = pick(categories);

  return pick(messages[category]);
}

function getCategoryMessage(category) {
  if (!messages[category]) {
    return "🦆 patoto「そのカテゴリは知らないかも…」";
  }

  return pick(messages[category]);
}

module.exports = {
  getRandomMessage,
  getCategoryMessage,
};