import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * ✅ 本版已包含你提到的全部修改（含最新两点）：
 * - 100% 缩放看不到底部按钮：改用 100dvh/88dvh + 底部按钮区 sticky + safe-area
 * - 锐评版一键切换黑称：支持多个花名/黑称（分隔符 / 空格 逗号 顿号 |），默认第一个；点“黑”按钮全局切换
 *
 * 其它已实现：
 * - 全屏黄白波点铺满 + 主界面手机居中 + 不露白
 * - 版本选择：安利/锐评
 * - 选团体（锐评版可剔除团体/成员）
 * - 总榜混合排序：按住 ↕ 拖动；拖到边缘自动滚动
 * - 点击头像看资料（不是长按）
 * - 列表显示 安利/锐评 一句话（替代 stars/拖拽文案）
 * - 生成报告：前三排金字塔 1/3/4，第4排起固定每排 N 人（默认6）生成长图；卡片等比缩放；卡片下显示安利/锐评（没填不显示）
 * - 默认头像：public/idols/<groupId>/<中文名>.jpg（同源，分享部署后别人也能看到；海报导出稳定）
 */

const VERSION = { ANLI: "anli", RUI: "rui" };

const SEED_GROUPS = [
  {
    "id": "boynextdoor",
    "label": "boynextdoor 马桶",
    "members": [
      "朴成淏",
      "李常赫",
      "明宰铉",
      "韩东旼",
      "金桐儇",
      "金云鹤"
    ]
  },
  {
    "id": "zerobaseone",
    "label": "zero base one 菊/昼",
    "members": [
      "章昊",
      "成韩彬",
      "石马修",
      "沈泉锐",
      "朴乾旭",
      "金泰来",
      "金奎彬",
      "金地雄",
      "韩维辰"
    ]
  },
  {
    "id": "riize",
    "label": "riize 椅/赖子",
    "members": [
      "将太郎",
      "宋银硕",
      "郑成灿",
      "朴元彬",
      "李炤熙",
      "李灿荣"
    ]
  },
  {
    "id": "nct_wish",
    "label": "nct wish 花园/划柜子",
    "members": [
      "吴是温",
      "前田陆",
      "得能勇志",
      "金栽禧",
      "广濑辽",
      "藤永咲哉"
    ]
  },
  {
    "id": "andteam",
    "label": "&team 岸",
    "members": [
      "中贺祐大",
      "村田风雅",
      "王奕翔",
      "边奕州",
      "中耒田悠真",
      "朝仓穣",
      "重田美琉爱",
      "高山浬希",
      "宏田力"
    ]
  },
  {
    "id": "alphadriveone",
    "label": "alpha drive one 驶/攻",
    "members": [
      "李相沅",
      "周安信",
      "贺鑫隆",
      "金虔佑",
      "张家豪",
      "李理悟",
      "郑相炫",
      "金俊抒"
    ]
  },
  {
    "id": "tws",
    "label": "tws 吐",
    "members": [
      "申惟",
      "金道勋",
      "崔英宰",
      "韩振",
      "韩志薰",
      "李灵潣"
    ]
  },
  {
    "id": "cortis",
    "label": "cortis 套孙/衩",
    "members": [
      "赵雨凡",
      "金主训",
      "马丁",
      "严成玹",
      "安乾镐"
    ]
  },
  {
    "id": "kickflip",
    "label": "kickflip 帆",
    "members": [
      "李启训",
      "满行亚丸",
      "李东花",
      "张主汪",
      "崔旻帝",
      "冈本佳树",
      "李东玹"
    ]
  },
  {
    "id": "close_your_eyes",
    "label": "close your eyes 闭",
    "members": [
      "马靖翔",
      "樱田健真",
      "全珉郁",
      "徐竟培",
      "宋承浩",
      "张汝遵",
      "金成旼"
    ]
  }
];

// ✅ 花名/黑称兜底：ZB1 与 &TEAM 暂无花名时，用团花名+数字编号代替
const GROUP_ALIAS_FALLBACK_PREFIX = { zerobaseone: '菊', andteam: '岸' };
const GROUP_MEMBER_ORDER = (() => {
  const map = {};
  for (const g of SEED_GROUPS) {
    const prefix = GROUP_ALIAS_FALLBACK_PREFIX[g.id];
    if (!prefix) continue;
    g.members.forEach((cn, i) => {
      map[memberId(g.id, cn)] = i + 1;
    });
  }
  return map;
})();


const MEMBER_TABLE = [
  {
    "groupId": "boynextdoor",
    "groupLabel": "boynextdoor 马桶",
    "cn": "朴成淏",
    "en": "sungho",
    "black": "门年",
    "birth": "2003.09.04",
    "fancamUrl": "https://www.bilibili.com/video/BV1n14oeXEJh?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "boynextdoor",
    "groupLabel": "boynextdoor 马桶",
    "cn": "李常赫",
    "en": "riwoo",
    "black": "窝",
    "birth": "2003.10.22",
    "fancamUrl": "https://www.bilibili.com/video/BV1eX4y1b79v?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "boynextdoor",
    "groupLabel": "boynextdoor 马桶",
    "cn": "明宰铉",
    "en": "jaehyun",
    "black": "蛐",
    "birth": "2003.12.04",
    "fancamUrl": "https://www.bilibili.com/video/BV1VW4y1R7zu?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "boynextdoor",
    "groupLabel": "boynextdoor 马桶",
    "cn": "韩东旼",
    "en": "teasan",
    "black": "蚊",
    "birth": "2004.08.10",
    "fancamUrl": "https://www.bilibili.com/video/BV18wcSeUEoJ?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "boynextdoor",
    "groupLabel": "boynextdoor 马桶",
    "cn": "金桐儇",
    "en": "leehan",
    "black": "门驴",
    "birth": "2004.10.20",
    "fancamUrl": "https://www.bilibili.com/video/BV11utNeJESX?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "boynextdoor",
    "groupLabel": "boynextdoor 马桶",
    "cn": "金云鹤",
    "en": "woonhak",
    "black": "门猪",
    "birth": "2006.11.29",
    "fancamUrl": "https://www.bilibili.com/video/BV1SV4y1m7Mt?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "zerobaseone",
    "groupLabel": "zero base one 菊/昼",
    "cn": "章昊",
    "en": "ZhangHao",
    "black": "",
    "birth": "2000.07.25",
    "fancamUrl": "https://www.bilibili.com/video/BV1atnde9E9J?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "zerobaseone",
    "groupLabel": "zero base one 菊/昼",
    "cn": "成韩彬",
    "en": "SuangHanBin",
    "black": "",
    "birth": "2001.06.13",
    "fancamUrl": "https://www.bilibili.com/video/BV1ws421A7jJ?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "zerobaseone",
    "groupLabel": "zero base one 菊/昼",
    "cn": "石马修",
    "en": "SeoMatthew",
    "black": "",
    "birth": "2002.05.28",
    "fancamUrl": "https://www.bilibili.com/video/BV1Sm4y1x7GY?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "zerobaseone",
    "groupLabel": "zero base one 菊/昼",
    "cn": "沈泉锐",
    "en": "Ricky",
    "black": "",
    "birth": "2004.05.20",
    "fancamUrl": "https://www.bilibili.com/video/BV1vr421u75Y?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "zerobaseone",
    "groupLabel": "zero base one 菊/昼",
    "cn": "朴乾旭",
    "en": "ParkGunWook",
    "black": "",
    "birth": "2005.01.10",
    "fancamUrl": "https://www.bilibili.com/video/BV1Ab421i7tR?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "zerobaseone",
    "groupLabel": "zero base one 菊/昼",
    "cn": "金泰来",
    "en": "KimTeaRae",
    "black": "",
    "birth": "2002.07.14",
    "fancamUrl": "https://www.bilibili.com/video/BV1LyHQenEPP?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "zerobaseone",
    "groupLabel": "zero base one 菊/昼",
    "cn": "金奎彬",
    "en": "KimGyuVin",
    "black": "",
    "birth": "2004.08.30",
    "fancamUrl": "https://www.bilibili.com/video/BV13E421F7JN?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "zerobaseone",
    "groupLabel": "zero base one 菊/昼",
    "cn": "金地雄",
    "en": "KimJiWoong",
    "black": "",
    "birth": "1998.12.14",
    "fancamUrl": "https://www.bilibili.com/video/BV1pP411r7iY?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "zerobaseone",
    "groupLabel": "zero base one 菊/昼",
    "cn": "韩维辰",
    "en": "HanYuJin",
    "black": "",
    "birth": "2007.03.20",
    "fancamUrl": "https://www.bilibili.com/video/BV1ew4m1S7rv?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "riize",
    "groupLabel": "riize 椅/赖子",
    "cn": "将太郎",
    "en": "SHOTARO",
    "black": "耗子、大郎",
    "birth": "2000.11.25",
    "fancamUrl": "https://www.bilibili.com/video/BV12T421y7EH?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "riize",
    "groupLabel": "riize 椅/赖子",
    "cn": "宋银硕",
    "en": "EUNSEOK",
    "black": "爷爷（椅）",
    "birth": "2001.03.19",
    "fancamUrl": "https://www.bilibili.com/video/BV1494y1M7wy?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "riize",
    "groupLabel": "riize 椅/赖子",
    "cn": "郑成灿",
    "en": "SUNGCHAN",
    "black": "椅牛",
    "birth": "2001.09.13",
    "fancamUrl": "https://www.bilibili.com/video/BV1Wa4y127fA?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "riize",
    "groupLabel": "riize 椅/赖子",
    "cn": "朴元彬",
    "en": "WOONBIN",
    "black": "王兵",
    "birth": "2002.03.02",
    "fancamUrl": "https://www.bilibili.com/video/BV1MF411m7os?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "riize",
    "groupLabel": "riize 椅/赖子",
    "cn": "李炤熙",
    "en": "SOHEE",
    "black": "缺牙",
    "birth": "2003.11.21",
    "fancamUrl": "https://www.bilibili.com/video/BV1iC4y1e7HS?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "riize",
    "groupLabel": "riize 椅/赖子",
    "cn": "李灿荣",
    "en": "ANTON",
    "black": "祝融、椅猪",
    "birth": "2004.03.21",
    "fancamUrl": "https://www.bilibili.com/video/BV1p5jnzHEkq?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "nct_wish",
    "groupLabel": "nct wish 花园/划柜子",
    "cn": "吴是温",
    "en": "sion",
    "black": "大文文、牛少",
    "birth": "2022.05.11",
    "fancamUrl": "https://www.bilibili.com/video/BV1cs5WzsEzx?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "nct_wish",
    "groupLabel": "nct wish 花园/划柜子",
    "cn": "前田陆",
    "en": "riku",
    "black": "大露露、大脚",
    "birth": "2003.06.28",
    "fancamUrl": "https://www.bilibili.com/video/BV1ht5fzuEko?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "nct_wish",
    "groupLabel": "nct wish 花园/划柜子",
    "cn": "得能勇志",
    "en": "yushi",
    "black": "大佛",
    "birth": "2004.04.05",
    "fancamUrl": "https://www.bilibili.com/video/BV16F4m1V723?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "nct_wish",
    "groupLabel": "nct wish 花园/划柜子",
    "cn": "金栽禧",
    "en": "jaehee",
    "black": "答应、唱师",
    "birth": "2005.06.21",
    "fancamUrl": "https://www.bilibili.com/video/BV1xU5bzVE3F?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "nct_wish",
    "groupLabel": "nct wish 花园/划柜子",
    "cn": "广濑辽",
    "en": "ryo",
    "black": "了了",
    "birth": "2007.08.04",
    "fancamUrl": "https://www.bilibili.com/video/BV1bG5xz3Ezd?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "nct_wish",
    "groupLabel": "nct wish 花园/划柜子",
    "cn": "藤永咲哉",
    "en": "sakuya",
    "black": "费曼、馒头",
    "birth": "2007.11.18",
    "fancamUrl": "https://www.bilibili.com/video/BV1RRxteFE8o?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "andteam",
    "groupLabel": "&team 岸",
    "cn": "中贺祐大",
    "en": "K",
    "black": "",
    "birth": "1997.10.21",
    "fancamUrl": "https://www.bilibili.com/video/BV1DzTQzAESc?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "andteam",
    "groupLabel": "&team 岸",
    "cn": "村田风雅",
    "en": "FUMA",
    "black": "",
    "birth": "1998.06.29",
    "fancamUrl": "https://www.bilibili.com/video/BV1ApfDYTEFK?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "andteam",
    "groupLabel": "&team 岸",
    "cn": "王奕翔",
    "en": "NICHOLAS",
    "black": "",
    "birth": "2002.07.09",
    "fancamUrl": "https://www.bilibili.com/video/BV1R9foYuExq?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "andteam",
    "groupLabel": "&team 岸",
    "cn": "边奕州",
    "en": "EJ",
    "black": "",
    "birth": "2002.09.07",
    "fancamUrl": "https://www.bilibili.com/video/BV11c411q7vy?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "andteam",
    "groupLabel": "&team 岸",
    "cn": "中耒田悠真",
    "en": "YUMA",
    "black": "",
    "birth": "2004.02.07",
    "fancamUrl": "https://www.bilibili.com/video/BV18CFFeCEkc?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "andteam",
    "groupLabel": "&team 岸",
    "cn": "朝仓穣",
    "en": "JO",
    "black": "",
    "birth": "2004.07.08",
    "fancamUrl": "https://www.bilibili.com/video/BV1KpfnYRE7e?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "andteam",
    "groupLabel": "&team 岸",
    "cn": "重田美琉爱",
    "en": "HARUA",
    "black": "",
    "birth": "2005.05.01",
    "fancamUrl": "https://www.bilibili.com/video/BV16nTQzLEBJ?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "andteam",
    "groupLabel": "&team 岸",
    "cn": "高山浬希",
    "en": "TAKI",
    "black": "",
    "birth": "2005.05.04",
    "fancamUrl": "https://www.bilibili.com/video/BV1umNye7EZR?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "andteam",
    "groupLabel": "&team 岸",
    "cn": "宏田力",
    "en": "MAKI",
    "black": "",
    "birth": "2006.02.17",
    "fancamUrl": "https://www.bilibili.com/video/BV15zFVe9EQR?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "alphadriveone",
    "groupLabel": "alpha drive one 驶/攻",
    "cn": "李相沅",
    "en": "sangwon",
    "black": "大如",
    "birth": "2003.05.08",
    "fancamUrl": "https://www.bilibili.com/video/BV1KTrpBGEiC?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "alphadriveone",
    "groupLabel": "alpha drive one 驶/攻",
    "cn": "周安信",
    "en": "anxin",
    "black": "小拿",
    "birth": "2006.12.25",
    "fancamUrl": "https://www.bilibili.com/video/BV1cwrUBrEbQ?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "alphadriveone",
    "groupLabel": "alpha drive one 驶/攻",
    "cn": "贺鑫隆",
    "en": "xinlong",
    "black": "爷爷（驶）",
    "birth": "2005.03.11",
    "fancamUrl": "https://www.bilibili.com/video/BV1QirpBHE5P?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "alphadriveone",
    "groupLabel": "alpha drive one 驶/攻",
    "cn": "金虔佑",
    "en": "geonwoo",
    "black": "监狱、80、秃猴",
    "birth": "2003.04.11",
    "fancamUrl": "https://www.bilibili.com/video/BV1qFrkBmEz4?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "alphadriveone",
    "groupLabel": "alpha drive one 驶/攻",
    "cn": "张家豪",
    "en": "arno",
    "black": "梓晨",
    "birth": "2002.07.07",
    "fancamUrl": "https://www.bilibili.com/video/BV1ZPrWBAEFX?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "alphadriveone",
    "groupLabel": "alpha drive one 驶/攻",
    "cn": "李理悟",
    "en": "leo",
    "black": "料",
    "birth": "2002.08.22",
    "fancamUrl": "https://www.bilibili.com/video/BV1rprmBMEoP?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "alphadriveone",
    "groupLabel": "alpha drive one 驶/攻",
    "cn": "郑相炫",
    "en": "sanghyeon",
    "black": "驶猪",
    "birth": "2007.09.19",
    "fancamUrl": "https://www.bilibili.com/video/BV1nutpzXEqk?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "alphadriveone",
    "groupLabel": "alpha drive one 驶/攻",
    "cn": "金俊抒",
    "en": "junseo",
    "black": "闹闹",
    "birth": "2001.11.20",
    "fancamUrl": "https://www.bilibili.com/video/BV19srrBrEaQ?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "tws",
    "groupLabel": "tws 吐",
    "cn": "申惟",
    "en": "SHINYU",
    "black": "雕",
    "birth": "2003.11.07",
    "fancamUrl": "https://www.bilibili.com/video/BV1bJ4m1b7bp?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "tws",
    "groupLabel": "tws 吐",
    "cn": "金道勋",
    "en": "DOHOON",
    "black": "吐牛",
    "birth": "2005.01.30",
    "fancamUrl": "https://www.bilibili.com/video/BV1bULEz4EEP?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "tws",
    "groupLabel": "tws 吐",
    "cn": "崔英宰",
    "en": "YOUNGYAE",
    "black": "吐年",
    "birth": "2005.05.31",
    "fancamUrl": "https://www.bilibili.com/video/BV1KfW7zgEhZ?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "tws",
    "groupLabel": "tws 吐",
    "cn": "韩振",
    "en": "HANJUN",
    "black": "老乡",
    "birth": "2006.01.05",
    "fancamUrl": "https://www.bilibili.com/video/BV1ce411J7KP?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "tws",
    "groupLabel": "tws 吐",
    "cn": "韩志薰",
    "en": "JIHOON",
    "black": "宝强",
    "birth": "2006.03.28",
    "fancamUrl": "https://www.bilibili.com/video/BV1sSL2z8EnK?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "tws",
    "groupLabel": "tws 吐",
    "cn": "李灵潣",
    "en": "KYUNGMIN",
    "black": "娟",
    "birth": "2007.10.02",
    "fancamUrl": "https://www.bilibili.com/video/BV1PMWEzPE3m?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "cortis",
    "groupLabel": "cortis 套孙/衩",
    "cn": "赵雨凡",
    "en": "james",
    "black": "旭东、玉芬、猴哥哥",
    "birth": "2005.10.14",
    "fancamUrl": "https://www.bilibili.com/video/BV1AGe8z4EEC?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "cortis",
    "groupLabel": "cortis 套孙/衩",
    "cn": "金主训",
    "en": "juhoon",
    "black": "衩猪",
    "birth": "2008.01.03",
    "fancamUrl": "https://www.bilibili.com/video/BV15eJCzmE1c?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "cortis",
    "groupLabel": "cortis 套孙/衩",
    "cn": "马丁",
    "en": "martin",
    "black": "马",
    "birth": "2008.03.20",
    "fancamUrl": "https://www.bilibili.com/video/BV1AGe8z4EWn?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "cortis",
    "groupLabel": "cortis 套孙/衩",
    "cn": "严成玹",
    "en": "seonghyeon",
    "black": "溜溜",
    "birth": "2009.01.13",
    "fancamUrl": "https://www.bilibili.com/video/BV19Xe9zLEvh?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "cortis",
    "groupLabel": "cortis 套孙/衩",
    "cn": "安乾镐",
    "en": "keonho",
    "black": "渐渐、贱贱",
    "birth": "2009.02.14",
    "fancamUrl": "https://www.bilibili.com/video/BV1yue8ztEkQ?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "kickflip",
    "groupLabel": "kickflip 帆",
    "cn": "李启训",
    "en": "KYEHOON",
    "black": "七旬、老人",
    "birth": "2004.09.16",
    "fancamUrl": "https://www.bilibili.com/video/BV12pn2z1EDV?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "kickflip",
    "groupLabel": "kickflip 帆",
    "cn": "满行亚丸",
    "en": "AMARU",
    "black": "桃黑黑、黑猪",
    "birth": "2005.10.21",
    "fancamUrl": "https://www.bilibili.com/video/BV1SiAGemEPU?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "kickflip",
    "groupLabel": "kickflip 帆",
    "cn": "李东花",
    "en": "DONGHWA",
    "black": "巫蛙",
    "birth": "2006.03.11",
    "fancamUrl": "https://www.bilibili.com/video/BV1DdTjzeEvZ?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "kickflip",
    "groupLabel": "kickflip 帆",
    "cn": "张主汪",
    "en": "JUWANG",
    "black": "奶螂",
    "birth": "2006.05.02",
    "fancamUrl": "https://www.bilibili.com/video/BV1DTP4eoEVB?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "kickflip",
    "groupLabel": "kickflip 帆",
    "cn": "崔旻帝",
    "en": "MINJE",
    "black": "壮壮",
    "birth": "2006.05.12",
    "fancamUrl": "https://www.bilibili.com/video/BV16eNNeXEk9?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "kickflip",
    "groupLabel": "kickflip 帆",
    "cn": "冈本佳树",
    "en": "KEIJU",
    "black": "矮树",
    "birth": "2006.10.04",
    "fancamUrl": "https://www.bilibili.com/video/BV1K8N8eYEbx?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "kickflip",
    "groupLabel": "kickflip 帆",
    "cn": "李东玹",
    "en": "DONGHYEON",
    "black": "隐驴",
    "birth": "2007.03.13",
    "fancamUrl": "https://www.bilibili.com/video/BV1XNnJzVEXx?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "close_your_eyes",
    "groupLabel": "close your eyes 闭",
    "cn": "马靖翔",
    "en": "JINGXIANG",
    "black": "闭猪",
    "birth": "2004.02.16",
    "fancamUrl": "https://www.bilibili.com/video/BV1kgZmY9EqN?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "close_your_eyes",
    "groupLabel": "close your eyes 闭",
    "cn": "樱田健真",
    "en": "KENSHIN",
    "black": "鬼子",
    "birth": "2007.12.02",
    "fancamUrl": "https://www.bilibili.com/video/BV1B3RiYCE8j?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "close_your_eyes",
    "groupLabel": "close your eyes 闭",
    "cn": "全珉郁",
    "en": "J-MIN",
    "black": "站长",
    "birth": "1999.10.16",
    "fancamUrl": "https://www.bilibili.com/video/BV1BjdcYjEJz?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "close_your_eyes",
    "groupLabel": "close your eyes 闭",
    "cn": "徐竟培",
    "en": "KYOUNGBAE",
    "black": "耗子、坤培",
    "birth": "2008.09.29",
    "fancamUrl": "https://www.bilibili.com/video/BV13tZoYPEVX?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "close_your_eyes",
    "groupLabel": "close your eyes 闭",
    "cn": "宋承浩",
    "en": "SEUNGHO",
    "black": "闭狗",
    "birth": "2007.08.01",
    "fancamUrl": "https://www.bilibili.com/video/BV1ifgnzfEqu?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "close_your_eyes",
    "groupLabel": "close your eyes 闭",
    "cn": "张汝遵",
    "en": "YEOJUN",
    "black": "茹",
    "birth": "2005.09.27",
    "fancamUrl": "https://www.bilibili.com/video/BV1GtZoYPEFM?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  },
  {
    "groupId": "close_your_eyes",
    "groupLabel": "close your eyes 闭",
    "cn": "金成旼",
    "en": "SUNGMIN",
    "black": "闭猴、大敏敏",
    "birth": "2005.12.26",
    "fancamUrl": "https://www.bilibili.com/video/BV13tZoYPEaR?vd_source=1b6e4d3f760c3d369c64cc7f8cb909f4"
  }
];

/* ----------------------- 工具函数 ----------------------- */

function slug(s) {
  return String(s).trim().replace(/\s+/g, "_").replace(/[\/\\?%*:|"<>]/g, "_");
}
function memberId(groupId, cn) {
  return `${groupId}__${slug(cn)}`;
}
function defaultAvatarUrl(groupId, cn) {
  return `/idols/${groupId}/${slug(cn)}.jpg`;
}
function pickAlias(blackRaw, variant = 0) {
  const raw = String(blackRaw || "").trim();
  if (!raw) return "";
  const parts = raw.split(/[\/\s,，、|]+/).filter(Boolean);
  if (parts.length === 0) return "";
  return parts[Math.min(variant, parts.length - 1)];
}
function pickAliasForMember(member, variant = 0) {
  const a = pickAlias(member?.black, variant);
  if (a) return a;
  const prefix = GROUP_ALIAS_FALLBACK_PREFIX[member?.groupId];
  if (!prefix) return '';
  const idx = GROUP_MEMBER_ORDER[member?.id];
  return idx ? `${prefix}${idx}` : '';
}
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return h | 0;
}
function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}
function placeholderAvatar(seed) {
  const hue = (hashCode(seed) % 360 + 360) % 360;
  const hue2 = (hue + 35) % 360;
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${hue}, 85%, 62%)"/>
        <stop offset="1" stop-color="hsl(${hue2}, 85%, 55%)"/>
      </linearGradient>
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
      </filter>
    </defs>
    <rect x="0" y="0" width="180" height="180" rx="34" fill="url(#g)"/>
    <g filter="url(#s)">
      <circle cx="90" cy="76" r="38" fill="rgba(255,255,255,0.86)"/>
      <rect x="38" y="114" width="104" height="48" rx="24" fill="rgba(255,255,255,0.86)"/>
    </g>
    <text x="50%" y="92%" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI" font-size="16" fill="rgba(0,0,0,0.55)">${escapeXml(
      seed.slice(0, 6)
    )}</text>
  </svg>
  `)}`;
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ----------------------- Pointer 拖拽排序 + 自动滚动 ----------------------- */

function usePointerReorder({ ids, setIds, containerRef, rowRefs, enabled, onState }) {
  // 移动端体验目标：
  // - 轻触/滑动：正常上下滚动列表（不触发拖拽）
  // - 长按（约 180ms）后再拖：进入排序拖拽
  // - 拖到容器上下边缘：自动滚动
  const dragRef = useRef({
    active: false,
    pending: false,
    pointerId: null,
    fromId: null,
    overId: null,
    lastClientX: 0,
    lastClientY: 0,
    startX: 0,
    startY: 0,
    raf: 0,
    timer: 0,
  });

  const LONG_PRESS_MS = 180;
  const MOVE_CANCEL_PX = 10;

  function reorder(fromId, overId) {
    if (!fromId || !overId || fromId === overId) return;
    setIds((prev) => {
      const a = [...prev];
      const from = a.indexOf(fromId);
      const to = a.indexOf(overId);
      if (from < 0 || to < 0) return prev;
      a.splice(to, 0, a.splice(from, 1)[0]);
      return a;
    });
  }

  function getOverId(clientY) {
    const entries = Array.from(rowRefs.current.entries());
    for (const [id, el] of entries) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientY >= r.top && clientY <= r.bottom) return id;
    }
    return null;
  }

  function autoScroll(clientY) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const edge = 64;
    const maxSpeed = 18;

    let dy = 0;
    if (clientY < rect.top + edge) {
      const t = (rect.top + edge - clientY) / edge;
      dy = -Math.ceil(maxSpeed * t);
    } else if (clientY > rect.bottom - edge) {
      const t = (clientY - (rect.bottom - edge)) / edge;
      dy = Math.ceil(maxSpeed * t);
    }
    if (dy !== 0) el.scrollTop += dy;
  }

  function tick() {
    const st = dragRef.current;
    if (!st.active) return;

    const x = st.lastClientX;
    const y = st.lastClientY;

    autoScroll(y);

    const over = getOverId(y);
    if (over && over !== st.overId) {
      st.overId = over;
      reorder(st.fromId, over);
    }

    onState && onState({ active: true, fromId: st.fromId, overId: st.overId, clientX: x, clientY: y });

    st.raf = requestAnimationFrame(tick);
  }

  function activateDrag(e, id) {
    const st = dragRef.current;
    if (!enabled || !st.pending) return;

    st.pending = false;
    st.active = true;
    st.fromId = id;
    st.overId = id;

    // 拖拽期间锁住页面原生滚动（否则会跟拖拽打架）
    try {
      document.documentElement.classList.add("dragLock");
      document.body.classList.add("dragLock");
    } catch {}

    onState && onState({ active: true, fromId: id, overId: id, clientX: st.lastClientX, clientY: st.lastClientY });

    // 捕获指针，让拖动更稳定
    e.currentTarget.setPointerCapture?.(e.pointerId);

    if (!st.raf) st.raf = requestAnimationFrame(tick);
  }

  function cancelPending() {
    const st = dragRef.current;
    st.pending = false;
    st.pointerId = null;
    if (st.timer) clearTimeout(st.timer);
    st.timer = 0;
  }

  function onPointerDown(e, id) {
    if (!enabled) return;

    // 不在这里 preventDefault：让用户可以上下滑动滚动列表
    // 只有长按后进入拖拽，才会锁滚动并开始排序
    const st = dragRef.current;
    st.pointerId = e.pointerId;
    st.pending = true;
    st.active = false;
    st.fromId = id;
    st.overId = id;
    st.startX = e.clientX;
    st.startY = e.clientY;
    st.lastClientX = e.clientX;
    st.lastClientY = e.clientY;

    if (st.timer) clearTimeout(st.timer);
    st.timer = setTimeout(() => activateDrag(e, id), LONG_PRESS_MS);
  }

  function onPointerMove(e) {
    const st = dragRef.current;

    // 长按未触发前：如果手指移动太多，视为“滚动”，取消拖拽意图
    if (st.pending && !st.active) {
      const dx = Math.abs(e.clientX - st.startX);
      const dy = Math.abs(e.clientY - st.startY);
      if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) cancelPending();
      return;
    }

    if (!st.active) return;
    st.lastClientX = e.clientX;
    st.lastClientY = e.clientY;
  }

  function end() {
    const st = dragRef.current;

    if (st.timer) clearTimeout(st.timer);
    st.timer = 0;

    st.pending = false;
    st.active = false;
    st.pointerId = null;
    st.fromId = null;
    st.overId = null;

    onState && onState({ active: false, fromId: null, overId: null, clientX: 0, clientY: 0 });

    if (st.raf) cancelAnimationFrame(st.raf);
    st.raf = 0;

    try {
      document.documentElement.classList.remove("dragLock");
      document.body.classList.remove("dragLock");
    } catch {}
  }

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", end, { passive: true });
    window.addEventListener("pointercancel", end, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [enabled]); // eslint-disable-line

  return { onPointerDown };
}


/* ----------------------- App ----------------------- */

export default function App() {
  const [screen, setScreen] = useState("version"); // version | groups | rank
  const [version, setVersion] = useState(VERSION.ANLI);

  // ✅ 锐评版：全局黑称切换档位（默认第一个）
  const [blackVariant, setBlackVariant] = useState(0);

  // ✅ 锐评版：是否用黑称替换中文名
  const [showBlackName, setShowBlackName] = useState(false);

  const [selectedGroupIds, setSelectedGroupIds] = useState(() => new Set(SEED_GROUPS.map((g) => g.id)));

  const [knownByGroup, setKnownByGroup] = useState(() => {
    const init = {};
    for (const g of SEED_GROUPS) init[g.id] = new Set(g.members.map((m) => memberId(g.id, m)));
    return init;
  });

  const [custom, setCustom] = useState(() => {
    const init = {};
    for (const g of SEED_GROUPS) {
      for (const cn of g.members) {
        const id = memberId(g.id, cn);
        const row = MEMBER_TABLE.find((x) => x.groupId === g.id && x.cn === cn);
        init[id] = {
          id,
          groupId: g.id,
          groupLabel: g.label,
          cn,
          kr: "",
          en: row?.en || "",
          black: row?.black || "",
          birth: row?.birth || "",
          praise: "",
          roast: "",
          info: "",
          fancamUrl: row?.fancamUrl || "",
          photoUrl: defaultAvatarUrl(g.id, cn),
          _placeholder: placeholderAvatar(`${g.id}-${cn}`),
        };
      }
    }
    return init;
  });

  const allCandidateIds = useMemo(() => {
    const ids = [];
    for (const g of SEED_GROUPS) {
      if (!selectedGroupIds.has(g.id)) continue;
      const knownSet = knownByGroup[g.id] || new Set();
      for (const cn of g.members) {
        const id = memberId(g.id, cn);
        // ✅ 两个版本都支持「剔除不认识成员」：没勾选的成员不会进入总榜
        if (knownSet.has(id)) ids.push(id);
      }
    }
    return ids;
  }, [selectedGroupIds, knownByGroup]);

  const [rankingIds, setRankingIds] = useState([]);
  const [locked, setLocked] = useState(true);

  // report
  const [reportOpen, setReportOpen] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const [reportBusy, setReportBusy] = useState(false);

  useEffect(() => {
    if (screen !== "rank") return;
    setRankingIds(shuffle(allCandidateIds));
    setLocked(true);
  }, [screen]); // eslint-disable-line

  // 切换版本时：黑称档位回到 0
  useEffect(() => {
    setBlackVariant(0);
    setShowBlackName(false);
  }, [version]);

  async function generateReport() {
    try {
      setReportBusy(true);
      const stats = computeGroupAvgRanks(rankingIds, custom);

      const selectedNames = SEED_GROUPS.filter((g) => selectedGroupIds.has(g.id)).map((g) => g.label);
      const needMore = SEED_GROUPS.filter((g) => !selectedGroupIds.has(g.id)).map((g) => g.label);

      const url = await drawPosterLongGrid({
        version,
        rankingIds,
        custom,
        selectedGroupCount: selectedNames.length,
        needMore,
        stats,
        gridCols: 6,
        showBlackName,
        blackVariant,
      });

      setReportUrl(url);
      setReportOpen(true);
    } finally {
      setReportBusy(false);
    }
  }

  return (
    <div className="root">
      <div className="shell">
        <div className="phoneFrame">
          <div className="phone">
            <TopStatusBar />

            {screen === "version" && (
              <VersionScreen
                version={version}
                onPick={(v) => {
                  setVersion(v);
                  setSelectedGroupIds(new Set(SEED_GROUPS.map((g) => g.id)));
                  setBlackVariant(0);
                }}
                onNext={() => setScreen("groups")}
              />
            )}

            {screen === "groups" && (
              <GroupsAllScreen
                version={version}
                groups={SEED_GROUPS}
                selectedGroupIds={selectedGroupIds}
                setSelectedGroupIds={setSelectedGroupIds}
                knownByGroup={knownByGroup}
                setKnownByGroup={setKnownByGroup}
                custom={custom}
                setCustom={setCustom}
                setCustom={setCustom}
                setCustom={setCustom}
                onBack={() => setScreen("version")}
                onNext={() => setScreen("rank")}
              />
            )}

            {screen === "rank" && (
              <GlobalRankScreen
                version={version}
                memberIds={rankingIds}
                setMemberIds={setRankingIds}
                locked={locked}
                setLocked={setLocked}
                custom={custom}
                setCustom={setCustom}
                setCustom={setCustom}
                onBack={() => setScreen("groups")}
                onGenerateReport={generateReport}
                reportBusy={reportBusy}
                blackVariant={blackVariant}
                setBlackVariant={setBlackVariant}
                showBlackName={showBlackName}
                setShowBlackName={setShowBlackName}
                setShowBlackName={setShowBlackName}
                showBlackName={showBlackName}
                setShowBlackName={setShowBlackName}
                setShowBlackName={setShowBlackName}
                showBlackName={showBlackName}
                setShowBlackName={setShowBlackName}
                setShowBlackName={setShowBlackName}
              />
            )}
          </div>
        </div>
      </div>

      {reportOpen && <ReportModal url={reportUrl} onClose={() => setReportOpen(false)} onRegenerate={generateReport} busy={reportBusy} />}

      <Style />
    </div>
  );
}

/* ----------------------- Screens ----------------------- */

function VersionScreen({ version, onPick, onNext }) {
  return (
    <div className="screen">
      <div className="header">
        <div className="avatarCircle">🎮</div>
        <div className="titleWrap">
          <div className="h1">六代男爱豆颜值总榜</div>
          <div className="sub">选版本 → 选团体 → 总榜拖拽排序 → 导出报告</div>
        </div>
        <div className="starsPill">
          <span className="star">★</span> 6th Gen
        </div>
      </div>

      <div className="card big">
        <div className="cardTitle">选择版本</div>
        <div className="seg">
          <button className={"segBtn " + (version === VERSION.ANLI ? "on" : "")} onClick={() => onPick(VERSION.ANLI)}>
            安利版
            <span className="segHint">中文 / 韩文（可补）/ 英文 + 安利一句话</span>
          </button>
          <button className={"segBtn " + (version === VERSION.RUI ? "on" : "")} onClick={() => onPick(VERSION.RUI)}>
            锐评版
            <span className="segHint">中文 + 黑称（可多条）+ 锐评一句话</span>
          </button>
        </div>
      </div>

      <div className="spacer" />


      <div className="bottomActions">
        <button className="primaryWide" onClick={onNext}>
          下一步：选团体 →
        </button>
      </div>
    </div>
  );
}

function GroupsAllScreen({ version, groups, selectedGroupIds, setSelectedGroupIds, knownByGroup, setKnownByGroup, custom, setCustom, onBack, onNext }) {
  const prompt = version === VERSION.ANLI ? "请选择你想要参与总榜排名的团体（可多选）" : "请剔除你不认识的糊咖团体（取消勾选即可）";
  const selectedCount = Array.from(selectedGroupIds).length;

  function toggleGroup(gid) {
    setSelectedGroupIds((prev) => {
      const n = new Set(prev);
      if (n.has(gid)) n.delete(gid);
      else n.add(gid);
      return n;
    });
  }

  const [openGroupId, setOpenGroupId] = useState(groups[0]?.id || "");
  const openGroup = useMemo(() => groups.find((g) => g.id === openGroupId) || groups[0], [groups, openGroupId]);
  const memberIds = openGroup.members.map((m) => memberId(openGroup.id, m));
  const openKnown = knownByGroup[openGroup.id] || new Set(memberIds);

  function toggleMember(mid) {
    const PH = "我们不太熟，下次再了解吧。";

    // 先切换认识/不认识
    let nextChecked = true;
    setKnownByGroup((prev) => {
      const next = { ...prev };
      const set = new Set(next[openGroup.id] || []);
      if (set.has(mid)) {
        set.delete(mid);
        nextChecked = false;
      } else {
        set.add(mid);
        nextChecked = true;
      }
      next[openGroup.id] = set;
      return next;
    });

    // 安利版：剔除成员时，自动写提示语；重新勾回时如果仍是提示语则清空
    if (version === VERSION.ANLI && typeof setCustom === "function") {
      setCustom((prev) => {
        const cur = prev[mid];
        if (!cur) return prev;
        if (!nextChecked) {
          return { ...prev, [mid]: { ...cur, praise: PH } };
        }
        if ((cur.praise || "").trim() === PH) {
          return { ...prev, [mid]: { ...cur, praise: "" } };
        }
        return prev;
      });
    }
  }

  return (
    <div className="screen">
      <div className="header">
        <button className="iconBtn" onClick={onBack} title="返回">
          ←
        </button>
        <div className="titleWrap">
          <div className="h1">选择团体（总榜）</div>
          <div className="sub">{prompt}</div>
        </div>
        <div className="starsPill">
          <span className="star">★</span> {version === VERSION.ANLI ? "安利" : "锐评"}
        </div>
      </div>

      <div className="card">
        <div className="cardTitle row">
          <span>团体列表（已选 {selectedCount}/{groups.length}）</span>
        </div>

        <div className="groupList">
          {groups.map((g) => {
            const on = selectedGroupIds.has(g.id);
            return (
              <button
                key={g.id}
                className={"groupBtn " + (on ? "on" : "")}
                onClick={() => {
                  toggleGroup(g.id);
                  setOpenGroupId(g.id);
                }}
              >
                <span className="groupDot" />
                <span className="groupText">{g.label}</span>
                <span className={"checkPill " + (on ? "yes" : "no")}>{on ? "✓" : "×"}</span>
              </button>
            );
          })}
        </div>

        <div className="hint">{version === VERSION.ANLI ? "安利版：可勾选团体，也可在下方剔除不认识成员。" : "锐评版：先剔除不认识团体，再在团内剔除不认识成员。"}</div>
      </div>

            <div className="card">
        <div className="cardTitle">剔除不认识成员（当前：{openGroup.label}）</div>
        <div className="memberGrid">
          {memberIds.map((id) => {
            const m = custom[id];
            const checked = openKnown.has(id);
            return (
              <label key={id} className={"memberTile " + (checked ? "checked" : "unchecked")}>
                <input type="checkbox" checked={checked} onChange={() => toggleMember(id)} />
                <AvatarImg src={m.photoUrl} fallback={m._placeholder} alt={m.cn} className="memberImg" />
                <div className="memberName">{m.cn}</div>
              </label>
            );
          })}
        </div>
        <div className="hint">
          {version === VERSION.ANLI
            ? "安利版：不认识的成员可以取消勾选；导出时会剔除，并自动写提示语：我们不太熟，下次再了解吧。"
            : "锐评版：进入总榜后，只会对“选中团体 + 选中成员”进行混合排序。"}
        </div>
      </div>

      <div className="bottomActions">
        <button className="ghostWide" onClick={onBack}>
          ← 返回
        </button>
        <button className="primaryWide" onClick={onNext} disabled={selectedCount < 1}>
          开始总榜排名 →
        </button>
      </div>
    </div>
  );
}

function GlobalRankScreen({
  version,
  memberIds,
  setMemberIds,
  locked,
  setLocked,
  custom,
  setCustom,
  onBack,
  onGenerateReport,
  reportBusy,
  blackVariant, setBlackVariant,
  showBlackName,
  setShowBlackName,
}) {
  const [query, setQuery] = useState("");
  const [huamingDialogOpen, setHuamingDialogOpen] = useState(false);
  const [huamingPending, setHuamingPending] = useState(false);
  const [profileOpenId, setProfileOpenId] = useState(null);
  const [editOpenId, setEditOpenId] = useState(null);
  const [dragState, setDragState] = useState({ active: false, fromId: null, overId: null, clientX: 0, clientY: 0 });

  const listRef = useRef(null);
  const rowRefs = useRef(new Map());

  const ghostW = useMemo(() => {
    if (!dragState.active || !dragState.fromId) return 0;
    const el = rowRefs.current.get(dragState.fromId);
    const w = el?.getBoundingClientRect?.().width || 0;
    return w;
  }, [dragState.active, dragState.fromId]);

  const filteredIds = useMemo(() => {
    const q = query.trim();
    if (!q) return memberIds;
    return memberIds.filter((id) => {
      const m = custom[id];
      const blackShown = pickAliasForMember(m, blackVariant);
      const txt =
        version === VERSION.ANLI
          ? `${m.cn} ${m.kr} ${m.en} ${m.groupLabel} ${m.praise}`
          : `${m.cn} ${blackShown} ${m.groupLabel} ${m.roast}`;
      return txt.includes(q);
    });
  }, [memberIds, query, custom, version, blackVariant]);

  const { onPointerDown } = usePointerReorder({
    ids: memberIds,
    setIds: setMemberIds,
    containerRef: listRef,
    rowRefs,
    onState: setDragState,
    enabled: !locked,
  });

  function shuffleNow() {
    setMemberIds(shuffle(memberIds));
  }

  return (
    <div className={"screen rankScreen" + (!locked ? " sorting" : "")}>
      <div className="header">
        <button className="iconBtn" onClick={onBack} title="返回">
          ←
        </button>

        <div className="titleWrap">
          <div className="h1">颜值总榜排名</div>
          <div className="sub">按住卡片任意位置拖动（可自动滚动） · 点击头像看资料</div>
        </div>

        {version === VERSION.RUI && (
          <div className="headBtns">
            <button
              className={"huamingBtn " + (showBlackName ? "on" : "")}
              onClick={() => {
                const next = !showBlackName;
                if (!next) {
                  setShowBlackName(false);
                  return;
                }
                // 开启：先弹对话框，用户点“知道了”后再开启
                setHuamingPending(true);
                setHuamingDialogOpen(true);
              }}
              title="替换为花名（锐评版）"
            >
              替换为花名
            </button>
          </div>
        )}

        <button className="iconBtn" onClick={shuffleNow} title="洗牌">
          ↻
        </button>
      </div>

      <div className="searchBar">
        <span className="searchIcon">🔎</span>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索名字/团体/文案…" className="searchInput" />
        <button className="circleBtn" onClick={() => setQuery("")} title="清空">
          ×
        </button>
      </div>

      <div className="card miniCard">
        <div className="miniRow">
          <div className="miniTip">
            <span className="kbd">点“开始排序”</span>后，按住<b>整张卡片</b>上下拖动（头像/⋮ 不会触发拖动）
          </div>
          <div className="miniBtns">
            <button className="miniBtn" onClick={shuffleNow}>
              洗牌
            </button>
            <button className="miniBtn" onClick={() => setMemberIds([...memberIds].sort((a, b) => custom[a].cn.localeCompare(custom[b].cn, "zh")))}>
              按名字
            </button>
          </div>
        </div>
      </div>

      <div className={"list " + (locked ? "locked" : "")} ref={listRef}>
        {filteredIds.map((id) => {
          const m = custom[id];
          const blackShown = pickAliasForMember(m, blackVariant);

          const titleLine =
            version === VERSION.ANLI
              ? [m.cn, m.kr ? `(${m.kr})` : "", m.en ? `· ${m.en}` : ""].filter(Boolean).join(" ")
              : (showBlackName ? (blackShown || m.cn) : [m.cn, blackShown ? `· ${blackShown}` : ""].filter(Boolean).join(" "));

          const comment =
            version === VERSION.ANLI
              ? m.praise
                ? `安利：${m.praise}`
                : "安利：（点 ⋮ 填写一句话）"
              : m.roast
              ? `锐评：${m.roast}`
              : "锐评：（点 ⋮ 填写一句话）";

          return (
            <div
              key={id}
              className={"rowCard" + (dragState.active && dragState.fromId === id ? " dragging" : "") + (dragState.active && dragState.overId === id && dragState.fromId !== id ? " over" : "")}
              onPointerDown={(e) => {
                if (locked) return;
                // 只要不是点在按钮/链接上，就允许整卡拖动
                const t = e.target;
                if (t && typeof t.closest === "function") {
                  if (t.closest("button") || t.closest("a") || t.closest("input") || t.closest("textarea")) return;
                }
                onPointerDown(e, id);
              }}
              ref={(el) => {
                if (el) rowRefs.current.set(id, el);
                else rowRefs.current.delete(id);
              }}
            >
              <div className="rankBadge">{memberIds.indexOf(id) + 1}</div>

              <button
                className="faceBoxBtn"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setProfileOpenId(id)}
                title="点击查看资料"
              >
                <AvatarImg src={m.photoUrl} fallback={m._placeholder} alt={m.cn} className="faceImg" />
              </button>

              <div className="rowText">
                <div className="rowName">{titleLine}</div>
                <div className="rowMeta">
                  <span className="tag">{m.groupLabel}</span>
                  <span className="comment">{comment}</span>
                  {locked ? <span className="lockHint">（先点“开始排序”）</span> : null}
                </div>
              </div>

              <button
                className="kebab"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setEditOpenId(id)}
                title="编辑安利/锐评/资料"
              >
                ⋮
              </button>

              <div
                className={"handle " + (locked ? "disabled" : "")}
                title="按住拖动排序"
                onPointerDown={(e) => onPointerDown(e, id)}
                role="button"
                tabIndex={0}
              >
                ↕
              </div>
            </div>
          );
        })}
      </div>

      {huamingDialogOpen && (
        <div className="modalMask" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modalHead">
              <div className="modalTitle">提示</div>
              <button
                className="iconBtn"
                onClick={() => {
                  setHuamingDialogOpen(false);
                  setHuamingPending(false);
                }}
                title="关闭"
              >
                ×
              </button>
            </div>

            <div className="modalBody">
              <div className="overlayText">
                由于作者不太了解zb1和&team的花名/黑称，这里用团花名加数字编号代替，有待后续补充
              </div>

              <button
                className="overlayBtn"
                onClick={() => {
                  setHuamingDialogOpen(false);
                  if (huamingPending) setShowBlackName(true);
                  setHuamingPending(false);
                }}
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}



      {dragState.active && dragState.fromId ? (
        <DragGhost
          member={custom[dragState.fromId]}
          rank={memberIds.indexOf(dragState.fromId) + 1}
          version={version}
          blackVariant={blackVariant}
          showBlackName={showBlackName}
          x={dragState.clientX + 12}
          y={dragState.clientY + 12}
          w={rowRefs.current.get(dragState.fromId)?.getBoundingClientRect?.().width}
        />
      ) : null}

      <div className="bottomActions">
        <button className="ghostWide" onClick={onBack}>
          ← 返回选团体
        </button>
        {locked ? (
          <button className="primaryWide" onClick={() => setLocked(false)}>
            开始排序
          </button>
        ) : (
          <button className="primaryWide" onClick={onGenerateReport} disabled={reportBusy}>
            {reportBusy ? "生成中…" : "完成排序并生成报告"}
          </button>
        )}
      </div>

      {locked && <StartOverlay onStart={() => setLocked(false)} />}

      {profileOpenId && (
        <ProfileModal
          member={custom[profileOpenId]}
          version={version}
          blackVariant={blackVariant}
          showBlackName={showBlackName}
          onClose={() => setProfileOpenId(null)}
          onEdit={() => {
            setProfileOpenId(null);
            setEditOpenId(profileOpenId);
          }}
        />
      )}

      {editOpenId && (
        <EditModal
          member={custom[editOpenId]}
          version={version}
          onClose={() => setEditOpenId(null)}
          onSave={(patch) => {
            setCustom((prev) => ({ ...prev, [editOpenId]: { ...prev[editOpenId], ...patch } }));
            setEditOpenId(null);
          }}
        />
      )}
    </div>
  );
}

/* ----------------------- Modal & Components ----------------------- */

function AvatarImg({ src, fallback, alt, className }) {
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      onError={(e) => {
        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
      }}
    />
  );
}

function DragGhost({ member, rank, version, blackVariant, showBlackName, x, y, w }) {
  if (!member) return null;
  const blackShown = pickAliasForMember(member, blackVariant);
  const titleLine =
    version === VERSION.ANLI
      ? [member.cn, member.kr ? `(${member.kr})` : "", member.en ? `· ${member.en}` : ""].filter(Boolean).join(" ")
      : (showBlackName ? (blackShown || member.cn) : [member.cn, blackShown ? `· ${blackShown}` : ""].filter(Boolean).join(" "));

  const comment =
    version === VERSION.ANLI
      ? member.praise
        ? `安利：${member.praise}`
        : "安利：（点 ⋮ 填写一句话）"
      : member.roast
      ? `锐评：${member.roast}`
      : "锐评：（点 ⋮ 填写一句话）";

  return (
    <div className="dragGhost" style={{ left: x, top: y, width: w ? `${w}px` : undefined }} aria-hidden>
      <div className="rankBadge ghostBadge">{rank}</div>
      <div className="ghostFace" />
      <div className="ghostText">
        <div className="ghostName">{titleLine}</div>
        <div className="ghostMeta">
          <span className="tag">{member.groupLabel}</span>
          <span className="comment">{comment}</span>
        </div>
      </div>
    </div>
  );
}

function StartOverlay({ onStart }) {
  return (
    <div className="overlay">
      <div className="overlayCard">
        <div className="overlayTitle">怎么开始总榜排序？</div>
        <div className="overlayText">
          1）点下面的 <b>开始排序</b>
          <br />
          2）按住<b>整张卡片</b>上下拖动（拖到边缘会自动滚动）
          <br />
          3）点击头像看资料，点 ⋮ 写安利/锐评
        </div>
        <button className="overlayBtn" onClick={onStart}>
          我懂了，开始！
        </button>
      </div>
    </div>
  );
}

function ProfileModal({ member, version, blackVariant, showBlackName, onClose, onEdit }) {
  const blackShown = pickAliasForMember(member, blackVariant);
  const title =
    version === VERSION.ANLI
      ? `${member.cn}${member.kr ? ` · ${member.kr}` : ""}${member.en ? ` · ${member.en}` : ""}`
      : `${showBlackName ? (blackShown || member.cn) : member.cn}`;

  const comment =
    version === VERSION.ANLI
      ? member.praise
        ? `安利：${member.praise}`
        : "安利：（尚未填写）"
      : member.roast
      ? `锐评：${member.roast}`
      : "锐评：（尚未填写）";

  return (
    <div className="modalMask" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="modalTitle">{title}</div>
          <button className="iconBtn" onClick={onClose} title="关闭">
            ✕
          </button>
        </div>

        <div className="modalBody">
          <div className="profileTop">
            <AvatarImg src={member.photoUrl} fallback={member._placeholder} alt={member.cn} className="profileImg" />
            <div className="profileInfo">
              <div className="profileLine">
                <span className="label">团体：</span>
                <span>{member.groupLabel}</span>
              </div>
              <div className="profileLine">
                <span className="label">{version === VERSION.ANLI ? "安利：" : "锐评："}</span>
                <span>{comment}</span>
              </div>
              <div className="profileLine">
                <span className="label">生日：</span>
                <span className={member.birth ? "" : "muted"}>{member.birth || "（暂无）"}</span>
              </div>
              <div className="profileLine">
                <span className="label">直拍：</span>
                {member.fancamUrl ? <span>（已支持下方嵌入播放）</span> : <span className="muted">（可在编辑里填写）</span>}
              </div>

              {member.fancamUrl ? (
                <FancamEmbed
                  url={member.fancamUrl}
                  // ✅ 优先使用 B 站视频原封面（见 FancamEmbed 内部自动抓取）
                  // 如果抓取失败，再退回到你上传的头像/默认头像
                  posterFallback={member._placeholder}
                  title={member.cn}
                />
              ) : null}
              <div className="profileLine">
                <span className="label">备注：</span>
                <span className={member.info ? "" : "muted"}>{member.info || "（可在编辑里填写）"}</span>
              </div>
            </div>
          </div>

          <div className="modalActions">
            <button className="primary" onClick={onEdit}>
              编辑资料
            </button>
            <button className="ghost" onClick={onClose}>
              继续排名
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditModal({ member, version, onClose, onSave }) {
  const [kr, setKr] = useState(member.kr || "");
  const [en, setEn] = useState(member.en || "");
  const [black, setBlack] = useState(member.black || "");
  const [photoUrl, setPhotoUrl] = useState(member.photoUrl || "");
  const [fancamUrl, setFancamUrl] = useState(member.fancamUrl || "");
  const [info, setInfo] = useState(member.info || "");
  const [birth, setBirth] = useState(member.birth || "");
  const [praise, setPraise] = useState(member.praise || "");
  const [roast, setRoast] = useState(member.roast || "");

  return (
    <div className="modalMask" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="modalTitle">编辑：{member.cn}</div>
          <button className="iconBtn" onClick={onClose} title="关闭">
            ✕
          </button>
        </div>

        <div className="modalBody">
          <div className="form">
            {version === VERSION.ANLI ? (
              <>
                <Field label="韩文名（可空）" value={kr} onChange={setKr} placeholder="例：장하오" />
                <Field label="英文名（可改）" value={en} onChange={setEn} placeholder="例：ZHANG HAO" />
              </>
            ) : (
              <Field label="黑称/花名（可多条，分隔符：/ 空格 逗号 顿号 |）" value={black} onChange={setBlack} placeholder="例：槟/模板槟/草槟" />
            )}

            <Field
              label={version === VERSION.ANLI ? "安利一句话（列表/海报显示）" : "锐评一句话（列表/海报显示）"}
              value={version === VERSION.ANLI ? praise : roast}
              onChange={version === VERSION.ANLI ? setPraise : setRoast}
              placeholder={version === VERSION.ANLI ? "例：这张脸就是练习生标准答案" : "例：帅但像公司PPT模板"}
            />

            <div className="twoCols">
              <Field label="安利（可选）" value={praise} onChange={setPraise} placeholder="安利一句话" />
              <Field label="锐评（可选）" value={roast} onChange={setRoast} placeholder="锐评一句话" />
            </div>

            <Field label="生日（可改）" value={birth} onChange={setBirth} placeholder="例：2001-06-13" />
            <Field label="头像路径（推荐不改）" value={photoUrl} onChange={setPhotoUrl} placeholder="例：/idols/zerobaseone/章昊.jpg" />
            <Field label="直拍链接（可空）" value={fancamUrl} onChange={setFancamUrl} placeholder="YouTube/B站/其他链接" />
            <FieldArea label="基本信息/备注（可空）" value={info} onChange={setInfo} placeholder="定位/名场面/吐槽…" />
          </div>

          <div className="modalActions">
            <button
              className="primary"
              onClick={() =>
                onSave({
                  kr: kr.trim(),
                  en: en.trim(),
                  black: black.trim(),
                  praise: praise.trim(),
                  roast: roast.trim(),
                  birth: birth.trim(),
                  photoUrl: photoUrl.trim() || member.photoUrl,
                  fancamUrl: fancamUrl.trim(),
                  info: info.trim(),
                })
              }
            >
              保存
            </button>
            <button className="ghost" onClick={onClose}>
              取消
            </button>
          </div>

          <div className="tinyHint">✅ 为了“别人打开也看到同样头像 + 海报导出稳定”，请用 public/idols/... 的本地静态路径。</div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="field">
      <div className="fieldLabel">{label}</div>
      <input className="fieldInput" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
function FieldArea({ label, value, onChange, placeholder }) {
  return (
    <label className="field">
      <div className="fieldLabel">{label}</div>
      <textarea className="fieldInput area" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function ReportModal({ url, onClose, onRegenerate, busy }) {
  const [saving, setSaving] = useState(false);
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  async function shareToAlbum() {
    if (!canShare) return;
    try {
      setSaving(true);
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], "kpop-6th-report.png", { type: blob.type || "image/png" });
      await navigator.share({ title: "六代金字塔报告", files: [file] });
    } catch (e) {
      // ignore
    } finally {
      setSaving(false);
    }
  }

  function downloadPng() {
    const a = document.createElement("a");
    a.href = url;
    a.download = "kpop-6th-report.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="modalMask" onMouseDown={onClose}>
      <div className="modal posterModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="modalTitle">你的六代金字塔报告（总榜）</div>
          <button className="iconBtn" onClick={onClose} title="关闭">
            ✕
          </button>
        </div>

        <div className="modalBody">
          <div className="posterWrap">
            <img className="posterImg" src={url} alt="report" />
          </div>

          <div className="modalActions">
            <button className="primary" onClick={canShare ? shareToAlbum : downloadPng} disabled={saving}>
              {canShare ? (saving ? "打开分享中…" : "保存到相册/分享") : "保存图片"}
            </button>
            <button className="ghost" onClick={onRegenerate} disabled={busy || saving}>
              {busy ? "生成中…" : "再生成一张"}
            </button>
          </div>
          <div className="tinyHint">
            {canShare
              ? "手机上点「保存到相册/分享」会弹出系统分享面板，可选“存储图像/保存到相册”。如果没出现，点右上角…或长按图片也能保存。"
              : "部分手机浏览器不支持直接写入相册：点“保存图片”会下载到文件/浏览器下载列表，你也可以长按图片选择保存。"}
            {"  "}人数多会生成更长竖图，但会保留所有参与者；第4排开始每排固定人数更美观。
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- 报告生成逻辑 ----------------------- */

function computeGroupAvgRanks(rankingIds, custom) {
  const map = new Map(); // groupId -> ranks
  rankingIds.forEach((id, idx) => {
    const g = custom[id]?.groupId || "unknown";
    if (!map.has(g)) map.set(g, []);
    map.get(g).push(idx + 1);
  });

  const labelById = new Map(SEED_GROUPS.map((g) => [g.id, g.label]));
  const stats = [];
  for (const [groupId, ranks] of map.entries()) {
    const avg = ranks.reduce((a, b) => a + b, 0) / ranks.length;
    stats.push({ groupId, groupLabel: labelById.get(groupId) || groupId, avg, count: ranks.length });
  }
  stats.sort((a, b) => a.avg - b.avg);
  return { best: stats[0] || null, worst: stats[stats.length - 1] || null, all: stats };
}

function buildLevelsHeadPyramidThenGrid(total, gridCols = 6) {
  const head = [1, 3, 4];
  const levels = [];
  let i = 0;

  for (const s of head) {
    if (i >= total) break;
    const take = Math.min(s, total - i);
    levels.push({ count: take, start: i, mode: "pyramid" });
    i += take;
  }
  while (i < total) {
    const take = Math.min(gridCols, total - i);
    levels.push({ count: take, start: i, mode: "grid" });
    i += take;
  }
  return levels;
}

async function drawPosterLongGrid({ version, rankingIds, custom, selectedGroupCount, needMore, stats, gridCols = 6, showBlackName = false, blackVariant = 0 }) {
  const W = 1080;
  const margin = 70;

  // 主卡片宽度 & 内容区宽度（左右各留 56px 内边距，避免出框）
  const mainW = W - margin * 2;
  const contentPadX = 56;
  const contentW = mainW - contentPadX * 2;

  const gapX = 18;

  const cardX = margin;
  const cardY = 110;

  // 头部多放一行“花名感谢语”，给一点呼吸空间
  const headerH = 350;
  const footerH = 90;

  const levels = buildLevelsHeadPyramidThenGrid(rankingIds.length, gridCols);

  const imgs = await Promise.all(
    rankingIds.map(async (id) => {
      const url = custom[id]?.photoUrl || "";
      const fallback = custom[id]?._placeholder || placeholderAvatar(id);
      const img = await loadImageSafe(url);
      return { id, img, fallback };
    })
  );
  const imgById = new Map(imgs.map((x) => [x.id, x]));

  const baseCard = 210;
  const perRow = [];
  let contentH = 0;

  for (let row = 0; row < levels.length; row++) {
    const n = levels[row].count;

    let cardW;
    if (row < 3) cardW = Math.floor(Math.min(240, Math.max(160, (contentW - gapX * (n - 1)) / n)));
    else cardW = Math.floor(Math.min(175, Math.max(135, (contentW - gapX * (n - 1)) / n)));

    const scale = Math.max(0.62, Math.min(1, cardW / baseCard));
    const pad = Math.round(10 * scale);
    const badgeH = Math.round(40 * scale);
    const avatarS = cardW - pad * 2;
    const nameH = Math.round(34 * scale);
    const commentH = Math.round(44 * scale);

    const cardH = pad + badgeH + pad + avatarS + pad + nameH + pad + commentH + pad;
    const gapY = Math.round(24 * scale);

    perRow.push({ cardW, cardH, scale, gapY });
    contentH += cardH + gapY;
  }

  const H = cardY + headerH + contentH + footerH + margin;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // 背景：黄 + 波点
  ctx.fillStyle = "#F7C727";
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.18;
  const dotGap = 56;
  for (let y = 72; y < H; y += dotGap) {
    for (let x = 48; x < W; x += dotGap) {
      ctx.beginPath();
      ctx.fillStyle = "#111";
      ctx.arc(x + (y % (dotGap * 2) === 0 ? 0 : 14), y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // 主卡片（米白）
  const mainH = H - cardY - margin;

  roundRect(ctx, cardX + 10, cardY + 16, mainW, mainH, 42, "rgba(0,0,0,0.18)");
  roundRect(ctx, cardX, cardY, mainW, mainH, 42, "#F8F1E7", true);
  strokeRoundRect(ctx, cardX, cardY, mainW, mainH, 42, 6, "#151515");

  // 标题区
  ctx.fillStyle = "#151515";
  ctx.font = "900 54px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial";
  ctx.fillText("六代年终报告 · 总榜", cardX + 56, cardY + 110);

  ctx.font = "800 28px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial";
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.fillText(`${version === VERSION.ANLI ? "安利版" : "锐评版"} · 参与团体：${selectedGroupCount} 个 · 参与人数：${rankingIds.length} 位`, cardX + 56, cardY + 156);

  ctx.fillStyle = "#151515";
  ctx.font = "900 30px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial";
  const bestLine = stats?.best ? `🏆 平均排名最高：${stats.best.groupLabel}（平均第 ${stats.best.avg.toFixed(1)} 名，${stats.best.count} 人）` : "🏆 平均排名最高：—";
  const worstLine = stats?.worst ? `🫠 平均排名最低：${stats.worst.groupLabel}（平均第 ${stats.worst.avg.toFixed(1)} 名，${stats.worst.count} 人）` : "🫠 平均排名最低：—";
  ctx.fillText(bestLine, cardX + 56, cardY + 205);
  ctx.fillText(worstLine, cardX + 56, cardY + 245);

  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.font = "800 22px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial";
  const need = needMore.length
    ? `还有哪些团体需要继续努力：${needMore.slice(0, 6).join(" / ")}${needMore.length > 6 ? " / …" : ""}`
    : "你已经雨露均沾，堪称六代百科！";
  ctx.fillText(need, cardX + 56, cardY + 286);

  // ✅ 花名模式下，把“记忆花名”感谢语放在顶部，与统计信息放在一起
  if (version === VERSION.RUI && showBlackName) {
    ctx.fillStyle = "rgba(0,0,0,0.72)";
    ctx.font = "900 26px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial";
    ctx.fillText("感谢您对kpop六代男团的密切关注，能读懂并记忆这些花名，您辛苦了", cardX + 56, cardY + 322);
  }

  // 绘制榜单
  let y = cardY + headerH;

  for (let row = 0; row < levels.length; row++) {
    const lv = levels[row];
    const layout = perRow[row];
    const n = lv.count;

    const cardW2 = layout.cardW;
    const scale = layout.scale;

    const pad = Math.round(10 * scale);
    const rCard = Math.round(22 * scale);
    const rAvatar = Math.round(22 * scale);
    const stroke = Math.max(2, Math.round(3 * scale));

    const badgeW = Math.round(54 * scale);
    const badgeH = Math.round(40 * scale);
    const avatarS = cardW2 - pad * 2;

    const fontNamePx = Math.round(24 * scale);
    const fontCommentPx = Math.round(18 * scale);

    const totalRowW = cardW2 * n + gapX * (n - 1);
    const x0 = cardX + contentPadX + Math.floor((contentW - totalRowW) / 2);

    for (let j = 0; j < n; j++) {
      const idx = lv.start + j;
      const id = rankingIds[idx];
      if (!id) continue;

      const m = custom[id];
      const boxX = x0 + j * (cardW2 + gapX);
      const boxY = y;

      roundRect(ctx, boxX, boxY, cardW2, layout.cardH, rCard, "rgba(255,255,255,0.78)", true);
      strokeRoundRect(ctx, boxX, boxY, cardW2, layout.cardH, rCard, stroke, "#151515");

      roundRect(ctx, boxX + pad, boxY + pad, badgeW, badgeH, Math.round(18 * scale), "#A7F3D0", true);
      strokeRoundRect(ctx, boxX + pad, boxY + pad, badgeW, badgeH, Math.round(18 * scale), stroke, "#151515");
      ctx.fillStyle = "#151515";
      ctx.font = `900 ${Math.round(22 * scale)}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial`;
      ctx.fillText(String(idx + 1), boxX + pad + Math.round(18 * scale), boxY + pad + Math.round(28 * scale));

      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.font = `800 ${Math.round(16 * scale)}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial`;
      ctx.fillText(ellipsize(ctx, m.groupLabel || "", cardW2 - pad * 2 - badgeW - pad), boxX + pad + badgeW + pad, boxY + pad + Math.round(26 * scale));

      const avatarX = boxX + pad;
      const avatarY = boxY + pad + badgeH + pad;
      roundRect(ctx, avatarX, avatarY, avatarS, avatarS, rAvatar, "#ffffff", true);
      strokeRoundRect(ctx, avatarX, avatarY, avatarS, avatarS, rAvatar, stroke, "#151515");

      const pack = imgById.get(id);
      if (pack?.img) {
        drawImageCover(ctx, pack.img, avatarX, avatarY, avatarS, avatarS, rAvatar);
      } else {
        const ph = await loadImageSafe(pack?.fallback || placeholderAvatar(id));
        if (ph) drawImageCover(ctx, ph, avatarX, avatarY, avatarS, avatarS, rAvatar);
      }

      ctx.fillStyle = "#151515";
      ctx.font = `900 ${fontNamePx}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial`;
      const blackShown = pickAliasForMember(m, blackVariant);
      const nameShown = version === VERSION.RUI && showBlackName ? (blackShown || m.cn || id) : (m.cn || id);
      // ✅ 名字居中
      const prevAlign = ctx.textAlign;
      ctx.textAlign = "center";
      ctx.fillText(ellipsize(ctx, nameShown, avatarS), avatarX + avatarS / 2, avatarY + avatarS + Math.round(28 * scale));
      ctx.textAlign = prevAlign;

      const txt =
        version === VERSION.ANLI
          ? m.praise
            ? `安利：${m.praise}`
            : ""
          : m.roast
          ? `锐评：${m.roast}`
          : "";

      if (txt) {
        ctx.fillStyle = "rgba(0,0,0,0.72)";
        ctx.font = `800 ${fontCommentPx}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial`;
        drawTwoLineEllipsis(ctx, txt, avatarX, avatarY + avatarS + Math.round(28 * scale) + Math.round(24 * scale), avatarS, Math.round(22 * scale));
      }
    }

    y += layout.cardH + layout.gapY;
  }

  ctx.fillStyle = "rgba(0,0,0,0.62)";
  ctx.font = "800 22px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial";
  ctx.fillStyle = 'rgba(0,0,0,0.62)';
  ctx.font = '800 22px ui-sans-serif, system-ui, -apple-system, Segoe UI, Arial';
  ctx.fillText('— 由 六代颜值总榜小游戏 生成', cardX + 56, cardY + mainH - 40);

  return canvas.toDataURL("image/png", 1.0);
}

/* ----------------------- Canvas helpers ----------------------- */

function roundRect(ctx, x, y, w, h, r, fill, doFill = true) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  if (doFill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
}
function strokeRoundRect(ctx, x, y, w, h, r, lineWidth, strokeStyle) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.stroke();
}
function drawImageCover(ctx, img, x, y, w, h, r) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r, "#fff", false);
  ctx.clip();

  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}
function ellipsize(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + "…").width > maxWidth) t = t.slice(0, -1);
  return t + "…";
}
function drawTwoLineEllipsis(ctx, text, x, y, maxWidth, lineHeight) {
  const s = String(text);
  let line1 = "";
  let line2 = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ctx.measureText(line1 + ch).width <= maxWidth) {
      line1 += ch;
    } else if (ctx.measureText(line2 + ch + "…").width <= maxWidth) {
      line2 += ch;
    } else {
      line2 = line2.trimEnd() + "…";
      break;
    }
  }
  if (line1) ctx.fillText(line1, x, y);
  if (line2) ctx.fillText(line2, x, y + lineHeight);
}
function loadImageSafe(url) {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

/* ----------------------- 直拍嵌入（第一版体验） ----------------------- */

function parseBilibiliId(url) {
  const s = String(url || "");
  // BV in path
  const bv1 = s.match(/BV[0-9A-Za-z]{10}/);
  if (bv1) return { bvid: bv1[0], aid: null };
  // av in path
  const av1 = s.match(/\bav(\d+)\b/i);
  if (av1) return { bvid: null, aid: av1[1] };

  try {
    const u = new URL(s);
    const bvid = u.searchParams.get("bvid");
    const aid = u.searchParams.get("aid");
    if (bvid && /BV[0-9A-Za-z]{10}/.test(bvid)) return { bvid, aid: null };
    if (aid && /^\d+$/.test(aid)) return { bvid: null, aid };
  } catch {}
  return { bvid: null, aid: null };
}

function buildBiliEmbed(url, autoplay) {
  const { bvid, aid } = parseBilibiliId(url);
  if (!bvid && !aid) return null;
  const ap = autoplay ? 1 : 0;
  // player 支持 bvid 或 aid
  return {
    bvid,
    aid,
    src: bvid
      ? `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&danmaku=0&autoplay=${ap}`
      : `https://player.bilibili.com/player.html?aid=${aid}&page=1&high_quality=1&danmaku=0&autoplay=${ap}`,
  };
}

function copyText(text) {
  const t = String(text || "");
  if (!t) return Promise.resolve(false);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(t).then(
      () => true,
      () => false
    );
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = t;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve(Boolean(ok));
  } catch (e) {
    return Promise.resolve(false);
  }
}

function openBiliApp(url) {
  const { bvid } = parseBilibiliId(url);
  if (!bvid) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  // iOS/Android: 尝试唤起 bilibili App；失败则回退网页
  const deepLink = `bilibili://video/${bvid}`;
  const fallback = url;
  const startedAt = Date.now();
  window.location.href = deepLink;
  setTimeout(() => {
    // 如果短时间内没有切走（大概率没装/被拦），回退网页
    if (Date.now() - startedAt < 1200) {
      window.open(fallback, "_blank", "noopener,noreferrer");
    }
  }, 800);
}

// ✅ 直拍封面：优先抓取 B 站视频原封面；失败再用头像兜底
const biliCoverCache = new Map();

function normalizeBiliPic(pic) {
  const s = String(pic || "");
  if (!s) return "";
  if (s.startsWith("//")) return "https:" + s;
  if (s.startsWith("http://")) return "https://" + s.slice(7);
  return s;
}

function jsonpGet(url, timeout = 6500) {
  return new Promise((resolve) => {
    if (typeof document === "undefined") return resolve(null);

    const cb = "__bili_jsonp_" + Math.random().toString(36).slice(2);
    const sep = url.includes("?") ? "&" : "?";
    const src = `${url}${sep}jsonp=jsonp&callback=${cb}`;

    let done = false;
    let script = null;

    function cleanup() {
      if (done) return;
      done = true;
      try {
        delete window[cb];
      } catch {}
      if (script && script.parentNode) script.parentNode.removeChild(script);
    }

    window[cb] = (data) => {
      cleanup();
      resolve(data || null);
    };

    script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = () => {
      cleanup();
      resolve(null);
    };
    document.head.appendChild(script);

    setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeout);
  });
}

async function fetchBiliCover(url) {
  const key = String(url || "");
  if (!key) return null;
  if (biliCoverCache.has(key)) return biliCoverCache.get(key);

  const { bvid, aid } = parseBilibiliId(key);
  if (!bvid && !aid) {
    biliCoverCache.set(key, null);
    return null;
  }

  const base = bvid
    ? `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`
    : `https://api.bilibili.com/x/web-interface/view?aid=${encodeURIComponent(aid)}`;

  // ✅ 优先 JSONP：绕过浏览器 CORS（本地/部署都更稳定）
  let data = await jsonpGet(base);
  let pic = data?.data?.pic;

  // 少数环境 JSONP 可能被 CSP 拦截，再尝试 fetch
  if (!pic) {
    try {
      const res = await fetch(base, { method: "GET", credentials: "omit" });
      const json = await res.json();
      pic = json?.data?.pic;
    } catch {}
  }

  const out = pic ? normalizeBiliPic(pic) : null;
  biliCoverCache.set(key, out);
  return out;
}

function FancamEmbed({ url, posterUrl, posterFallback, title = "fancam" }) {
  const embed = useMemo(() => buildBiliEmbed(url, true), [url]);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // ✅ 封面：优先 B 站视频原封面；如你传了 posterUrl，则视为强制指定封面
  const [coverSrc, setCoverSrc] = useState(() => posterUrl || "");
  const [coverLoading, setCoverLoading] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setLoaded(false);
    setCopied(false);
    let alive = true;
    setCoverLoading(true);

    // 1) 如果显式传了 posterUrl，就直接用它
    if (posterUrl) {
      setCoverSrc(posterUrl);
      setCoverLoading(false);
      return () => {
        alive = false;
      };
    }

    // 2) 否则抓取 B 站视频封面
    setCoverSrc("");
    (async () => {
      const pic = await fetchBiliCover(url);
      if (!alive) return;
      if (pic) setCoverSrc(pic);
      else setCoverSrc(posterFallback || "");
      setCoverLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [url, posterUrl, posterFallback]);

  if (!url) return null;

  const iframeSrc =
    playing && embed
      ? embed.src
      : embed
      ? buildBiliEmbed(url, false).src
      : null;

  return (
    <div className="fancamBox">
      <div className="fancamHead">
        <span className="fancamTitle">B站直拍</span>
        <a className="link" href={url} target="_blank" rel="noreferrer">
          打开B站
        </a>
      </div>

      <div className="fancamFrame">
        {/* 封面：点封面才开始播放；封面永远有兜底 */}
        {!playing && (
          <button
            className="fancamCover"
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="play"
          >
            {coverSrc ? (
              <img
                className="fancamCoverImg"
                src={coverSrc}
                alt={title}
                loading="eager"
                referrerPolicy="no-referrer"
                onError={() => {
                  // ✅ 原封面加载失败 → 退回头像兜底
                  if (coverSrc !== posterFallback && posterFallback) setCoverSrc(posterFallback);
                }}
              />
            ) : (
              <div className="fancamCoverPlaceholder">
                {coverLoading ? "封面加载中…" : "封面加载失败"}
              </div>
            )}
            <div className="fancamPlay">▶</div>
          </button>
        )}

        {iframeSrc ? (
          <iframe
            key={iframeSrc}
            title="bilibili-fancam"
            src={iframeSrc}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="eager"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
          />
        ) : (
          <div className="fancamCoverPlaceholder">直拍链接无效</div>
        )}

        {/* 加载遮罩：播放后在 iframe 还没 ready 时，避免出现黑屏 */}
        {playing && !loaded && (
          <div className="fancamLoading" aria-label="loading">
            <div className="spinner" />
            <div className="loadingText">加载中…</div>
          </div>
        )}
      </div>

      <div className="fancamActions">
        <button className="pillBtn" onClick={() => openBiliApp(url)}>
          打开App
        </button>
        <button
          className="pillBtn"
          onClick={async () => {
            const ok = await copyText(url);
            setCopied(ok);
            if (ok) setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? "已复制" : "复制链接"}
        </button>
      </div>
    </div>
  );
}

/* ----------------------- 顶部状态栏 ----------------------- */

function TopStatusBar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return (
    <div className="status">
      <div className="statusLeft">
        <span className="pill">Service</span>
        <span className="pill">Wi-Fi</span>
      </div>
      <div className="statusMid">
        {hh}:{mm}
      </div>
      <div className="statusRight">
        <span className="pill">▮▮▮</span>
        <span className="pill">🔋</span>
      </div>
    </div>
  );
}

/* ----------------------- 样式 ----------------------- */

function Style() {
  return (
    <style>{`
      :root{
        --yellow:#F7C727;
        --cream:#F4EBDD;
        --cream2:#F8F1E7;
        --ink:#151515;
        --shadow: 0 12px 40px rgba(0,0,0,.16);
        --radius: 22px;
      }
      *{box-sizing:border-box}
      html,body,#root{height:100%; width:100%;}

      .dragLock{ touch-action: none; }
      body{
        margin:0;
        background: var(--yellow);
        overflow:hidden;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "PingFang SC","Noto Sans SC","Hiragino Sans GB", Arial, sans-serif;
        color:var(--ink);
      }

      /* ✅ 用 100dvh 解决 100% 缩放/移动端 vh 不准导致的底部按钮不可见 */
      .root{
        position:relative;
        width:100vw;
        height:100dvh;
        display:flex;
        align-items:center;
        justify-content:center;
        padding: clamp(10px, 2.2vw, 22px);
        background:
          radial-gradient(circle at 12px 12px, rgba(255,255,255,.55) 0 4px, transparent 5px) 0 0/56px 56px,
          radial-gradient(circle at 40px 40px, rgba(0,0,0,.35) 0 3px, transparent 4px) 0 0/56px 56px,
          var(--yellow);
      }

      /* 100% 缩放下更“修长”一点：略收窄、略加高 */
      .shell{width: min(420px, 92vw);}

      .phoneFrame{
        border-radius: 44px;
        border: 5px solid rgba(0,0,0,.9);
        background: rgba(255,255,255,.22);
        box-shadow: 0 22px 80px rgba(0,0,0,.28);
        padding: 10px;
      }
      .phone{
        width:100%;
        height:min(980px, 92dvh);
        border-radius: 36px;
        overflow:hidden;
        background: transparent;
      }

      .status{
        height: 34px;
        padding: 10px 14px 0;
        display:flex;
        align-items:center;
        justify-content:space-between;
        color: rgba(0,0,0,.75);
        font-weight:600;
        letter-spacing:.3px;
        user-select:none;
      }
      .statusLeft,.statusRight{display:flex; gap:8px; align-items:center;}
      .statusMid{font-size:14px;}
      .pill{
        padding: 3px 8px;
        border:2px solid rgba(0,0,0,.9);
        border-radius: 999px;
        background: rgba(255,255,255,.35);
        box-shadow: 0 2px 0 rgba(0,0,0,.08);
        font-size:12px;
      }

      .screen{
        height: calc(100% - 34px);
        padding: 12px;
        display:flex;
        flex-direction:column;
        gap: 12px;
        min-height:0;
        overflow:auto;
        -webkit-overflow-scrolling: touch;
      }

      .header{display:flex; align-items:center; gap: 12px; flex: 0 0 auto;}
      .avatarCircle{
        width:54px;height:54px;border-radius:999px;
        border:3px solid var(--ink);
        background: var(--cream2);
        display:flex;align-items:center;justify-content:center;
        box-shadow: 0 4px 0 rgba(0,0,0,.12);
        font-size:22px; flex:0 0 auto;
      }
      .titleWrap{flex:1; min-width:0;}
      .h1{font-size:20px; font-weight:900; line-height:1.1;}
      .sub{font-size:12px; color: rgba(0,0,0,.65); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
      .starsPill{
        padding: 8px 10px;
        border:3px solid var(--ink);
        background: #7DD3FC;
        border-radius: 999px;
        font-weight:900;
        display:flex;
        align-items:center;
        gap: 6px;
        box-shadow: 0 4px 0 rgba(0,0,0,.12);
        flex:0 0 auto;
      }
      .iconBtn{
        width:40px;height:40px;border-radius:999px;
        border:3px solid var(--ink);
        background: var(--cream2);
        box-shadow: 0 4px 0 rgba(0,0,0,.12);
        font-weight:900; cursor:pointer;
      }

      .headBtns{display:flex; gap:10px; align-items:center;}
      .iconBtn.on{background: #A7F3D0;}

      /* 花名按钮（更显眼，避免两个字挤在圆里） */
      .huamingBtn{
        height:56px;
        padding: 0 22px;
        border-radius: 999px;
        border:3px solid var(--ink);
        background: var(--cream2);
        box-shadow: 0 8px 0 rgba(0,0,0,.12);
        font-weight:950;
        cursor:pointer;
        font-size:19px;
        letter-spacing:.5px;
        flex:0 0 auto;
      }
      .huamingBtn.on{background:#A7F3D0;}

      .card{
        border:3px solid var(--ink);
        background: var(--cream);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        padding: 12px;
        flex: 0 0 auto;
      }
      .card.big{padding:14px;}
      .miniCard{padding:10px 12px;}
      .cardTitle{font-weight: 950; margin-bottom: 10px; display:flex; align-items:center; justify-content:space-between; gap: 8px;}
      .cardTitle.row{align-items:center;}

      .seg{display:flex; gap:10px; flex-wrap:wrap;}
      .segBtn{
        flex:1; min-width: 160px;
        border:3px solid var(--ink);
        border-radius: 18px;
        padding: 12px 12px;
        background: rgba(255,255,255,.55);
        cursor:pointer;
        font-weight:950;
        text-align:left;
        box-shadow: 0 6px 0 rgba(0,0,0,.10);
      }
      .segBtn.on{background: #C7F9CC;}
      .segHint{display:block; margin-top:6px; font-weight:700; color: rgba(0,0,0,.65); font-size:12px;}

      .groupList{display:flex; flex-direction:column; gap:10px; max-height: 260px; overflow:auto; padding-right:2px;}
      .groupBtn{display:flex; align-items:center; gap:10px; padding: 10px 10px; border:2px solid var(--ink); border-radius: 16px; background: rgba(255,255,255,.55); cursor:pointer; box-shadow: 0 4px 0 rgba(0,0,0,.10);}
      .groupBtn.on{background:#FFF;}
      .groupDot{width:12px;height:12px;border-radius:999px; background: var(--yellow); border:2px solid var(--ink); flex:0 0 auto;}
      .groupText{flex:1; text-align:left; font-weight:900; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
      .checkPill{padding: 4px 10px; border:2px solid var(--ink); border-radius:999px; font-weight:950;}
      .checkPill.yes{background:#C7F9CC;}
      .checkPill.no{background: rgba(255,255,255,.65); opacity:.7;}
      .hint{margin-top:10px; color: rgba(0,0,0,.65); font-size:12px; line-height:1.35;}

      .memberGrid{
        display:grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        max-height: 340px;
        overflow:auto;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
        padding-right: 4px;
        padding-bottom: 8px;
      }
      @media (max-width: 380px){ .memberGrid{grid-template-columns: repeat(2, 1fr);} }
      .memberTile{border:2px solid var(--ink); border-radius: 18px; background: rgba(255,255,255,.55); padding: 10px; display:flex; flex-direction:column; align-items:center; gap:8px; box-shadow: 0 4px 0 rgba(0,0,0,.10); position:relative; cursor:pointer; user-select:none;}
      .memberTile input{position:absolute; left:10px; top:10px; width:16px;height:16px; accent-color: #111;}
      .memberTile.unchecked{opacity:.45; filter: grayscale(.25);}
      .memberImg{width:54px;height:54px;border-radius:16px; border:2px solid var(--ink); object-fit:cover; background:#fff;}
      .memberName{font-weight:950; font-size:12px; text-align:center; line-height:1.1;}

      .searchBar{
        border:3px solid var(--ink);
        background: var(--cream2);
        border-radius: 22px;
        padding: 10px 12px;
        display:flex;
        align-items:center;
        gap: 10px;
        box-shadow: var(--shadow);
        flex: 0 0 auto;
      }
      .searchInput{flex:1; border:none; outline:none; background: transparent; font-size:14px; font-weight:800; min-width:0;}
      .circleBtn{
        width:36px;height:36px;border-radius:999px;
        border:3px solid var(--ink);
        background: var(--yellow);
        font-weight:950; cursor:pointer;
        box-shadow: 0 4px 0 rgba(0,0,0,.10);
      }

      .miniRow{display:flex; align-items:center; justify-content:space-between; gap: 10px; flex-wrap:wrap;}
      .miniTip{font-weight:850; color: rgba(0,0,0,.70); font-size:12px;}
      .kbd{display:inline-block; padding: 2px 8px; border:2px solid var(--ink); border-radius: 999px; background: rgba(255,255,255,.65); font-weight:950; margin: 0 4px;}
      .miniBtns{display:flex; gap:8px; flex-wrap:wrap;}
      .miniBtn{padding: 6px 10px; border:2px solid var(--ink); border-radius: 999px; background: rgba(255,255,255,.55); font-weight:900; cursor:pointer;}

      .list{
        flex: 1 1 auto;
        min-height: 0;
        overflow:auto;
        padding-right: 2px;
        display:flex;
        flex-direction:column;
        gap: 10px;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
      }
      .list.locked{filter: grayscale(.1);}

      .rowCard{
        touch-action: pan-y;
        display:flex;
        align-items:center;
        gap: 10px;
        border:3px solid var(--ink);
        background: rgba(255,255,255,.65);
        border-radius: 22px;
        padding: 10px 10px;
        box-shadow: 0 6px 0 rgba(0,0,0,.10);
        user-select:none;
        cursor: grab;
        position: relative;
        transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease, outline 120ms ease;
        will-change: transform;
      }
      .rowCard:active{cursor: grabbing;}
      .list.locked .rowCard{cursor: default;}

      .rowCard.dragging{
        opacity: .18;
        background: rgba(255,255,255,.30);
        transform: none;
        box-shadow: 0 6px 0 rgba(0,0,0,.06);
      }
      .rowCard.over{
        outline: 3px dashed rgba(0,0,0,.55);
        outline-offset: -6px;
      }
      .rowCard.over::before{
        content:"";
        position:absolute;
        left:16px; right:16px; top:-7px;
        height:6px;
        border-radius:999px;
        background: rgba(0,0,0,.55);
      }


      .dragGhost{
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        display:flex;
        align-items:center;
        gap:10px;
        border:3px solid var(--ink);
        background: #fff;
        border-radius: 22px;
        padding: 10px 10px;
        box-shadow: 0 18px 0 rgba(0,0,0,.14);
        transform: translate(-50%, -50%);
        max-width: calc(100vw - 24px);
      }
      .ghostBadge{background: #fff;}
      .ghostFace{
        width:56px;height:56px;border-radius:18px;
        border:3px solid var(--ink);
        background: rgba(0,0,0,.06);
        flex:0 0 auto;
      }
      .ghostText{flex:1; min-width:0;}
      .ghostName{font-weight:950; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
      .ghostMeta{margin-top:4px; font-size:12px; color: rgba(0,0,0,.65); display:flex; align-items:center; gap: 6px; flex-wrap:wrap;}

      @media (prefers-reduced-motion: reduce){
        .rowCard{transition:none;}
      }
      .rankBadge{
        width:36px;height:36px;border-radius:999px;
        border:3px solid var(--ink);
        background: #A7F3D0;
        display:flex;align-items:center;justify-content:center;
        font-weight:950; flex:0 0 auto;
      }

      .faceBoxBtn{
        width:56px;height:56px;border-radius:18px;
        border:3px solid var(--ink);
        background:#fff;
        overflow:hidden;
        padding:0;
        cursor:pointer;
        box-shadow: 0 4px 0 rgba(0,0,0,.08);
        flex:0 0 auto;
      }
      .faceImg{width:100%;height:100%;object-fit:cover; display:block;}

      .rowText{flex:1; min-width:0;}
      .rowName{font-weight:950; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;}
      .rowMeta{margin-top:4px; font-size:12px; color: rgba(0,0,0,.65); display:flex; align-items:center; gap: 6px; flex-wrap:wrap;}
      .tag{padding: 2px 8px; border:2px solid rgba(0,0,0,.65); border-radius:999px; background: rgba(255,255,255,.55); font-weight:900; font-size:11px;}
      .comment{font-weight:900; color: rgba(0,0,0,.70); max-width: 240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
      .lockHint{opacity:.85}

      .kebab{
        width:38px;height:38px;border-radius:999px;
        border:3px solid var(--ink);
        background: var(--cream2);
        font-weight:950; cursor:pointer;
        box-shadow: 0 4px 0 rgba(0,0,0,.10);
        flex:0 0 auto;
      }
      .handle{
        width:42px;height:42px;
        border-radius: 16px;
        border:3px solid var(--ink);
        background: rgba(255,255,255,.70);
        display:flex; align-items:center; justify-content:center;
        font-weight:950;
        box-shadow: 0 4px 0 rgba(0,0,0,.10);
        flex:0 0 auto;
        touch-action:none;
      }
      .handle.disabled{opacity:.45}

      .spacer{flex:1 1 auto; min-height: 0;}

      /* ✅ 底部按钮永远可见（100% 缩放也能看到），并处理 iPhone safe-area */
      .bottomActions{
        display:flex;
        gap: 10px;
        flex: 0 0 auto;

        position: sticky;
        bottom: 0;
        z-index: 5;

        padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
        background: linear-gradient(to top, rgba(248,241,231,0.98), rgba(248,241,231,0.72), rgba(248,241,231,0));
      }

      .primaryWide,.ghostWide{
        flex:1;
        padding: 14px 14px;
        border-radius: 18px;
        border:3px solid var(--ink);
        font-weight:950;
        cursor:pointer;
        box-shadow: 0 8px 0 rgba(0,0,0,.12);
      }
      .primaryWide{background: var(--yellow);}
      .ghostWide{background: rgba(255,255,255,.60);}
      .primaryWide:disabled{opacity:.45; cursor:not-allowed;}

      .overlay{position:fixed; inset:0; background: rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; padding: 18px; z-index: 40;}
      .overlayCard{width:min(520px, 96vw); border:4px solid var(--ink); border-radius: 26px; background: var(--cream2); box-shadow: 0 18px 60px rgba(0,0,0,.22); padding: 14px;}
      .overlayTitle{font-weight: 950; font-size: 16px;}
      .overlayText{margin-top: 10px; color: rgba(0,0,0,.70); font-weight: 800; line-height: 1.5; font-size: 13px;}
      .overlayBtn{margin-top: 12px; width: 100%; padding: 14px 14px; border-radius: 18px; border:3px solid var(--ink); font-weight:950; cursor:pointer; box-shadow: 0 8px 0 rgba(0,0,0,.12); background: var(--yellow);}

      .modalMask{position:fixed; inset:0; background: rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; padding: 18px; z-index: 50;}
      .modal{width:min(520px, 96vw); border:4px solid var(--ink); border-radius: 26px; background: var(--cream2); box-shadow: 0 18px 60px rgba(0,0,0,.22); overflow:hidden;}
      .posterModal{width:min(680px, 96vw);}
      .modalHead{padding: 12px 12px 10px; display:flex; align-items:center; justify-content:space-between; gap: 10px; border-bottom: 3px solid rgba(0,0,0,.12); background: rgba(255,255,255,.55);}
      .modalTitle{font-weight: 950; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
      .modalBody{padding: 12px;}

      .profileTop{display:flex; gap: 12px; align-items:flex-start;}
      .profileImg{width:92px;height:92px;border-radius: 22px; border:3px solid var(--ink); object-fit:cover; background:#fff; flex:0 0 auto;}
      .profileInfo{flex:1; min-width:0;}
      .profileLine{margin-bottom:8px; font-size:13px; line-height:1.4;}
      .label{font-weight:950;}
      .muted{color: rgba(0,0,0,.55);}
      .link{color: #0b5; font-weight:950; text-decoration:none;}
      .link:hover{text-decoration:underline;}

      .modalActions{display:flex; gap: 10px; margin-top: 12px;}
      .primary,.ghost{flex:1; padding: 12px 12px; border-radius: 18px; border:3px solid var(--ink); font-weight:950; cursor:pointer; box-shadow: 0 6px 0 rgba(0,0,0,.10); text-align:center;}
      .primary{background:#C7F9CC;}
      .ghost{background: rgba(255,255,255,.60);}
      .linkBtn{display:flex; align-items:center; justify-content:center; text-decoration:none; color: inherit;}
      .tinyHint{margin-top: 10px; font-size:12px; color: rgba(0,0,0,.65);}


      /* ✅ 移动端优化：排序模式更大、更好拖 */
      @media (max-width: 520px){
        /* 标题别占太多版面 */
        .rankScreen .h1{font-size:18px;}
        .rankScreen .sub{font-size:11px; margin-top:2px;}

        /* 排序模式：让列表尽量占满屏 */
        .rankScreen.sorting .searchBar,
        .rankScreen.sorting .miniCard{display:none;}
        .rankScreen.sorting .header .sub{display:none;}
        .rankScreen.sorting .h1{font-size:16px;}

        /* 卡片更窄更好拖 */
        .rowCard{
        touch-action: pan-y;
          padding: 8px 8px;
          border-radius: 18px;
          gap: 8px;
        }
        .rankBadge{
          width:30px;height:30px;
          border-width:2px;
          font-size:13px;
        }
        .faceBoxBtn{
          width:46px;height:46px;
          border-radius:14px;
        }
        .rowMeta{margin-top:2px; font-size:11px;}
        .comment{max-width: 180px;}
      }

      /* 直拍嵌入（第一版体验） */
      .fancamBox{margin: 10px 0 6px; border:3px solid rgba(0,0,0,.14); border-radius: 18px; background: rgba(255,255,255,.55); overflow:hidden;}
      .fancamHead{display:flex; align-items:center; justify-content:space-between; gap:10px; padding: 10px 12px; border-bottom: 3px solid rgba(0,0,0,.12); background: rgba(255,255,255,.60);}
      .fancamTitle{font-weight: 950;}
      .fancamFrame{position:relative; width:100%; aspect-ratio: 16/9; background:#000;}
      /* 手机端：直拍区域更大（更好拖动/观看） */
      @media (max-width: 520px){
        .fancamFrame{aspect-ratio: 4/3;}
      }

      .fancamFrame iframe{position:absolute; inset:0; width:100%; height:100%; border:0;}
      .fancamCover{position:absolute; inset:0; z-index:2; border:0; padding:0; margin:0; width:100%; height:100%; cursor:pointer; background:#000;}
      .fancamCoverImg{width:100%; height:100%; object-fit:cover; display:block;}
      .fancamPlay{position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:64px; color:#fff; text-shadow: 0 6px 24px rgba(0,0,0,.55); pointer-events:none;}
      .fancamCoverPlaceholder{position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color: rgba(255,255,255,.80); font-weight: 900;}
      .fancamLoading{position:absolute; inset:0; z-index:3; display:flex; flex-direction:column; gap:10px; align-items:center; justify-content:center; background: rgba(0,0,0,.45); color:#fff;}
      .spinner{width:34px; height:34px; border-radius:999px; border:4px solid rgba(255,255,255,.28); border-top-color: rgba(255,255,255,.95); animation: spin 0.9s linear infinite;}
      .loadingText{font-weight: 900; font-size: 12px; opacity:.95;}
      @keyframes spin{to{transform: rotate(360deg);}}
      .fancamActions{display:flex; gap:10px; padding: 10px 12px 12px;}
      .pillBtn{flex:1; padding: 12px 12px; border-radius: 16px; border:3px solid var(--ink); background:#C7F9CC; font-weight:950; cursor:pointer; box-shadow: 0 6px 0 rgba(0,0,0,.10);}
      .pillBtn:active{transform: translateY(1px); box-shadow: 0 5px 0 rgba(0,0,0,.10);}

      .form{display:flex; flex-direction:column; gap: 10px;}
      .twoCols{display:grid; grid-template-columns: 1fr 1fr; gap: 10px;}
      @media (max-width: 440px){ .twoCols{grid-template-columns: 1fr;} }
      .field{display:flex; flex-direction:column; gap: 6px;}
      .fieldLabel{font-weight:950; font-size:12px; color: rgba(0,0,0,.70);}
      .fieldInput{border:3px solid var(--ink); border-radius: 18px; padding: 10px 12px; background: rgba(255,255,255,.75); font-weight:800; outline:none;}
      .fieldInput.area{min-height: 88px; resize: vertical; font-weight:750;}

      .posterWrap{
        border:3px solid rgba(0,0,0,.15);
        border-radius: 18px;
        overflow:auto;
        background: rgba(255,255,255,.35);
        max-height: 70vh;
      }
      .posterImg{width:100%; height:auto; display:block;}
    `}</style>
  );
}
