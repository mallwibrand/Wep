/* بيانات المنتجات — السعر هنا هو السعر النهائي الحقيقي دايمًا */
const MEN_PRODUCTS = [
  {"id":101,"name":"تيشرت رجالي كلاسيك","price":250,"description":"تيشرت قطن 100% بقصة كلاسيكية مريحة، مثالي للاستخدام اليومي مع لمسة أنيقة.","sizes":["S","M","L","XL"],"colors":["أسود","أبيض","كحلي"],"rating":5,"category":"men","isNew":true},
  {"id":102,"name":"بنطلون جينز فاخر","price":400,"description":"بنطلون جينز عالي الجودة بقصة ضيقة عصرية، خامة متينة ومريحة طوال اليوم.","sizes":["M","L","XL"],"colors":["أزرق داكن","أسود"],"rating":4,"category":"men","isNew":false}
];

const WOMEN_PRODUCTS = [
  {"id":201,"name":" سيتوفر قريبا ","price":0,"description":"هذا مثال لعرض الملابس وسيتوفر قريبا .","sizes":["S","M","L"],"colors":["ذهبي","أسود"],"rating":5,"category":"women","isNew":true}
];

/* قائمة موحّدة تجمع كل المنتجات (رجالي + حريمي) — أي قسم في الموقع محتاج
   يعرض منتجات من كل الأقسام (زي "أحدث القطع" في الصفحة الرئيسية) بيقرا من هنا.
   يعني ضيف/عدّل منتج فوق في MEN_PRODUCTS أو WOMEN_PRODUCTS بس، وهو هيظهر
   تلقائيًا في كل مكان من غير ما تلمس أي ملف تاني. */
const ALL_PRODUCTS_MASTER = MEN_PRODUCTS.concat(WOMEN_PRODUCTS);
