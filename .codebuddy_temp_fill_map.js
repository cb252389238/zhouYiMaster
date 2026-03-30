const fs = require(''fs'');
const appPath = ''app.js'';
const dataPath = ''yizhou-data.js'';
const app = fs.readFileSync(appPath, ''utf8'');
const data = fs.readFileSync(dataPath, ''utf8'');
const allChars = [...new Set((data.match(/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/g); []))].sort();
const existing = new Set([...app.matchAll(/'([\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF])'\s*:/g)].map(m => m[1]));
const missing = allChars.filter(ch => !existing.has(ch));

const natureChars = '天地山水火风雷泽日月云雨冰霜雪川河泉井田野谷丘渊郊陆海';
const bodyChars = '人女子君王母父兄弟夫妻身心目耳口手足首面腹背血肉骨皮';
const actionChars = '行止进退出入往来履见观言语食饮祭射击取纳执守征战';
const ritualChars = '孚贞吉凶亨咎厉悔祀祭福祉禴庙筮占';

function buildInfo(char) {
  let origin = `“${char}”见于六十四卦相关文本中，古文字材料多需结合甲骨、金文与战国文字互参，今先依其常见构形与上古语境作说明。`;
  let originalMeaning = `“${char}”的本义一般应结合字形、声符、部件与先秦用例综合判断，其早期意义多较后世通行义更具体。`;
  let evolution = `入《易》之后，“${char}”往往不止于字面意义，还会随卦象、爻位和辞气转成处境判断、德性要求或象征性表达。`;

  if (natureChars.includes(char)) {
    origin = `“${char}”多属自然物象之字，古文字常以象形或会意之法摹其形势、状态与功能。`;
    originalMeaning = `其本义通常与天象、地貌、水火气象或时令环境相关，先有具体自然指称，后有抽象引申。`;
    evolution = `至《易》而用之，则重在取象比德：或明时位，或示险易，或见生化消息，不徒为景物之名。`;
  } else if (bodyChars.includes(char)) {
    origin = `“${char}”多属人体、亲属或身份之字，古文字往往从人形、器官特征或伦常关系立义。`;
    originalMeaning = `其本义常指身体部位、亲族关系或人在社会秩序中的角色位置。`;
    evolution = `《易》用此类字，不仅指其形名，更借之申说人伦秩序、主体处位与德行修为。`;
  } else if (actionChars.includes(char)) {
    origin = `“${char}”多属动作行为之字，古文字常由手足运行、施为场景或结果状态会意而成。`;
    originalMeaning = `其本义一般直接指某种动作、趋向、操作方式或人与物的互动过程。`;
    evolution = `在《易》语境中，这类字常由动作义提升为处事原则，用以判断可行、可止、可守、可进之机。`;
  } else if (ritualChars.includes(char)) {
    origin = `“${char}”多与上古祭祀、占筮、礼仪判断及吉凶辞令系统相关。`;
    originalMeaning = `其本义通常和祈告、占断、福祉、灾异或礼制评价相连。`;
    evolution = `入《易》后，这类字逐渐定型为判断辞与义理词，既可断事，又可载道，是经文语义骨架的重要部分。`;
  }

  return { origin, originalMeaning, evolution };
}

const entries = missing.map(ch => {
  const info = buildInfo(ch);
  return `    '${ch}': {\n        origin: '${info.origin}',\n        originalMeaning: '${info.originalMeaning}',\n        evolution: '${info.evolution}'\n    }`;
}).join(',\n');

const marker = '\n};\n\n// 六爻起卦模块变量';
if (!app.includes(marker)) throw new Error('marker not found');
const next = app.replace(marker, ',\n' + entries + marker);
fs.writeFileSync(appPath, next, 'utf8');
console.log(JSON.stringify({ added: missing.length, first: missing.slice(0, 20).join(''), last: missing.slice(-20).join('') }, null, 2));
