/* بيانات المنتجات — السعر هنا هو السعر النهائي الحقيقي دايمًا */
const MEN_PRODUCTS = [
  {"id":101,"name":"تيشرت رجالي كلاسيك","price":250,"description":"تيشرت قطن 100% بقصة كلاسيكية مريحة، مثالي للاستخدام اليومي مع لمسة أنيقة.","sizes":["S","M","L","XL"],"colors":["أسود","أبيض","كحلي"],"rating":5,"category":"men","isNew":true},
  {"id":102,"name":"بنطلون جينز فاخر","price":400,"description":"بنطلون جينز عالي الجودة بقصة ضيقة عصرية، خامة متينة ومريحة طوال اليوم.","sizes":["M","L","XL"],"colors":["أزرق داكن","أسود"],"rating":4,"category":"men","isNew":false},
  {"id":103,"name":"جاكيت جلد رجالي","price":850,"description":"جاكيت جلد طبيعي بتصميم فاخر، يمنحك إطلالة قوية وأنيقة في كل المناسبات.","sizes":["M","L","XL"],"colors":["أسود","بني"],"rating":5,"category":"men","isNew":true},
  {"id":104,"name":"حذاء رياضي رويال","price":520,"description":"حذاء رياضي بتصميم عصري ونعل مريح يدعم قدمك طوال اليوم.","sizes":["S","M","L","XL"],"colors":["أبيض","أسود","ذهبي"],"rating":4,"category":"men","isNew":false},
  {"id":105,"name":"قميص رسمي أنيق","price":320,"description":"قميص رسمي بقصة سليم فيت، خامة قطنية ناعمة تناسب العمل والمناسبات.","sizes":["M","L","XL"],"colors":["أبيض","أزرق فاتح"],"rating":5,"category":"men","isNew":false},
  {"id":106,"name":"حذاء كلاسيك جلد","price":610,"description":"حذاء جلد طبيعي كلاسيك يناسب الإطلالات الرسمية والمناسبات الخاصة.","sizes":["M","L","XL"],"colors":["بني","أسود"],"rating":5,"category":"men","isNew":true},
  {"id":107,"name":"سويت شيرت هودي","price":380,"description":"هودي دافئ بخامة فليس ناعمة، مثالي للطقس البارد مع ستايل كاجوال مريح.","sizes":["S","M","L","XL"],"colors":["رمادي","أسود","كحلي"],"rating":4,"category":"men","isNew":false},
  {"id":108,"name":"بدلة رسمية رويال","price":1450,"description":"بدلة رسمية فاخرة بقصة إيطالية أنيقة، مثالية للمناسبات والاجتماعات المهمة.","sizes":["M","L","XL"],"colors":["كحلي","أسود"],"rating":5,"category":"men","isNew":true}
];

const WOMEN_PRODUCTS = [
  {"id":201,"name":"فستان سواريه ذهبي","price":780,"description":"فستان سهرة فاخر بتفاصيل ذهبية أنيقة، يمنحك إطلالة ملكية في أي مناسبة.","sizes":["S","M","L"],"colors":["ذهبي","أسود"],"rating":5,"category":"women","isNew":true},
  {"id":202,"name":"تيشرت نسائي بيسك","price":210,"description":"تيشرت قطني ناعم بقصة عصرية، خيار مثالي للإطلالات اليومية الأنيقة.","sizes":["S","M","L","XL"],"colors":["أبيض","وردي","أسود"],"rating":4,"category":"women","isNew":false},
  {"id":203,"name":"تنورة ميدي أنيقة","price":340,"description":"تنورة ميدي بقصة عصرية أنثوية، تناسب الإطلالات النهارية والمسائية.","sizes":["S","M","L"],"colors":["أسود","بيج"],"rating":5,"category":"women","isNew":false},
  {"id":204,"name":"حقيبة يد فاخرة","price":560,"description":"حقيبة يد جلد طبيعي بتصميم عصري، تفاصيل ذهبية تضيف لمسة فخامة لإطلالتك.","sizes":["S","M","L"],"colors":["أسود","بني","بيج"],"rating":5,"category":"women","isNew":true},
  {"id":205,"name":"فستان كاجوال صيفي","price":390,"description":"فستان قطني خفيف بألوان زاهية، مثالي للإطلالات الصيفية المريحة والأنيقة.","sizes":["S","M","L","XL"],"colors":["أزرق","وردي"],"rating":4,"category":"women","isNew":false},
  {"id":206,"name":"جاكيت نسائي شيك","price":470,"description":"جاكيت نسائي بقصة عصرية، يضيف طبقة أناقة لأي إطلالة يومية.","sizes":["S","M","L"],"colors":["بيج","أسود"],"rating":4,"category":"women","isNew":true},
  {"id":207,"name":"حذاء كعب رويال","price":430,"description":"حذاء كعب أنيق بتصميم مريح، يمنح إطلالتك لمسة من الفخامة والثقة.","sizes":["S","M","L"],"colors":["أسود","ذهبي","بيج"],"rating":5,"category":"women","isNew":false},
  {"id":208,"name":"بلوزة حرير أنيقة","price":310,"description":"بلوزة حرير ناعمة بقصة راقية، مثالية للإطلالات الرسمية والكاجوال شيك.","sizes":["S","M","L","XL"],"colors":["أبيض","بيج","أسود"],"rating":5,"category":"women","isNew":true}
];
