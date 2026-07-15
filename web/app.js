(function () {
  "use strict";

  // Mard 221 全色色板，来源：Vicold.Pindoudou / data/Mard.txt (Apache-2.0)。
  const rawBeadPalette = [
    ["A1","A1","#FAF5CD"], ["A2","A2","#FCFED6"], ["A3","A3","#FCFF92"], ["A4","A4","#F7EC5C"],
    ["A5","A5","#F0D83A"], ["A6","A6","#FDA951"], ["A7","A7","#FA8C4F"], ["A8","A8","#FBDA4D"],
    ["A9","A9","#F79D5F"], ["A10","A10","#F47E38"], ["A11","A11","#FEDB99"], ["A12","A12","#FDA276"],
    ["A13","A13","#FEC667"], ["A14","A14","#F75842"], ["A15","A15","#FBF65E"], ["A16","A16","#FEFF97"],
    ["A17","A17","#FDE173"], ["A18","A18","#FCBF80"], ["A19","A19","#FD7E77"], ["A20","A20","#F9D666"],
    ["A21","A21","#FAE393"], ["A22","A22","#EDF878"], ["A23","A23","#E4C8BA"], ["A24","A24","#F3F6A9"],
    ["A25","A25","#FDF785"], ["A26","A26","#FFC734"], ["B1","B1","#DFF13B"], ["B2","B2","#64F343"],
    ["B3","B3","#A1F586"], ["B4","B4","#5FDF34"], ["B5","B5","#39E158"], ["B6","B6","#64E0A4"],
    ["B7","B7","#3EAE7C"], ["B8","B8","#1D9B54"], ["B9","B9","#2A5037"], ["B10","B10","#9AD1BA"],
    ["B11","B11","#627032"], ["B12","B12","#1A6E3D"], ["B13","B13","#C8E87D"], ["B14","B14","#ABE84F"],
    ["B15","B15","#305335"], ["B16","B16","#C0ED9C"], ["B17","B17","#9EB33E"], ["B18","B18","#E6ED4F"],
    ["B19","B19","#26B78E"], ["B20","B20","#CBECCF"], ["B21","B21","#18616A"], ["B22","B22","#0A4241"],
    ["B23","B23","#343B1A"], ["B24","B24","#E8FAA6"], ["B25","B25","#4E846D"], ["B26","B26","#907C35"],
    ["B27","B27","#D0E0AF"], ["B28","B28","#9EE5BB"], ["B29","B29","#C6DF5F"], ["B30","B30","#E3FBB1"],
    ["B31","B31","#B4E691"], ["B32","B32","#92AD60"], ["C1","C1","#F0FEE4"], ["C2","C2","#ABF8FE"],
    ["C3","C3","#A2E0F7"], ["C4","C4","#44CDFB"], ["C5","C5","#06AADF"], ["C6","C6","#54A7E9"],
    ["C7","C7","#3977CA"], ["C8","C8","#0F52BD"], ["C9","C9","#3349C3"], ["C10","C10","#3CBCE3"],
    ["C11","C11","#2ADED3"], ["C12","C12","#1E334E"], ["C13","C13","#CDE7FE"], ["C14","C14","#D5FCF7"],
    ["C15","C15","#21C5C4"], ["C16","C16","#1858A2"], ["C17","C17","#02D1F3"], ["C18","C18","#213244"],
    ["C19","C19","#18869D"], ["C20","C20","#1A70A9"], ["C21","C21","#BCDDFC"], ["C22","C22","#6BB1BB"],
    ["C23","C23","#C8E2FD"], ["C24","C24","#7EC5F9"], ["C25","C25","#A9E8E0"], ["C26","C26","#42ADCF"],
    ["C27","C27","#D0DEF9"], ["C28","C28","#BDCEE8"], ["C29","C29","#364A89"], ["D1","D1","#ACB7EF"],
    ["D2","D2","#868DD3"], ["D3","D3","#3554AF"], ["D4","D4","#162D7B"], ["D5","D5","#B34EC6"],
    ["D6","D6","#B37BDC"], ["D7","D7","#8758A9"], ["D8","D8","#E3D2FE"], ["D9","D9","#D5B9F4"],
    ["D10","D10","#301A49"], ["D11","D11","#BEB9E2"], ["D12","D12","#DC99CE"], ["D13","D13","#B5038D"],
    ["D14","D14","#862993"], ["D15","D15","#2F1F8C"], ["D16","D16","#E2E4F0"], ["D17","D17","#C7D3F9"],
    ["D18","D18","#9A64B8"], ["D19","D19","#D8C2D9"], ["D20","D20","#9A35AD"], ["D21","D21","#940595"],
    ["D22","D22","#38389A"], ["D23","D23","#EADBF8"], ["D24","D24","#768AE1"], ["D25","D25","#4950C2"],
    ["D26","D26","#D6C6EB"], ["E1","E1","#F6D4CB"], ["E2","E2","#FCC1DD"], ["E3","E3","#F6BDE8"],
    ["E4","E4","#E8649E"], ["E5","E5","#F0569F"], ["E6","E6","#EB4172"], ["E7","E7","#C53674"],
    ["E8","E8","#FDDBE9"], ["E9","E9","#E376C7"], ["E10","E10","#D13B95"], ["E11","E11","#F7DAD4"],
    ["E12","E12","#F693BF"], ["E13","E13","#B5026A"], ["E14","E14","#FAD4BF"], ["E15","E15","#F5C9CA"],
    ["E16","E16","#FBF4EC"], ["E17","E17","#F7E3EC"], ["E18","E18","#F9C8DB"], ["E19","E19","#F6BBD1"],
    ["E20","E20","#D7C6CE"], ["E21","E21","#C09DA4"], ["E22","E22","#B38C9F"], ["E23","E23","#937D8A"],
    ["E24","E24","#DEBEE5"], ["F1","F1","#FE9381"], ["F2","F2","#F63D4B"], ["F3","F3","#EE4E3E"],
    ["F4","F4","#FB2A40"], ["F5","F5","#E10328"], ["F6","F6","#913635"], ["F7","F7","#911932"],
    ["F8","F8","#BB0126"], ["F9","F9","#E0677A"], ["F10","F10","#874628"], ["F11","F11","#592323"],
    ["F12","F12","#F3536B"], ["F13","F13","#F45C45"], ["F14","F14","#FCADB2"], ["F15","F15","#D50527"],
    ["F16","F16","#F8C0A9"], ["F17","F17","#E89B7D"], ["F18","F18","#D07F4A"], ["F19","F19","#BE454A"],
    ["F20","F20","#C69495"], ["F21","F21","#F2B8C6"], ["F22","F22","#F7C3D0"], ["F23","F23","#ED806C"],
    ["F24","F24","#E09DAF"], ["F25","F25","#E84854"], ["G1","G1","#FFE4D3"], ["G2","G2","#FCC6AC"],
    ["G3","G3","#F1C4A5"], ["G4","G4","#DCB387"], ["G5","G5","#E7B34E"], ["G6","G6","#E3A014"],
    ["G7","G7","#985C3A"], ["G8","G8","#713D2F"], ["G9","G9","#E4B685"], ["G10","G10","#DA8C42"],
    ["G11","G11","#DAC898"], ["G12","G12","#FEC993"], ["G13","G13","#B2714B"], ["G14","G14","#8B684C"],
    ["G15","G15","#F6F8E3"], ["G16","G16","#F2D8C1"], ["G17","G17","#77544E"], ["G18","G18","#FFE3D5"],
    ["G19","G19","#DD7D41"], ["G20","G20","#A5452F"], ["G21","G21","#B38561"], ["H1","H1","#FFFFFF"],
    ["H2","H2","#FBFBFB"], ["H3","H3","#B4B4B4"], ["H4","H4","#878787"], ["H5","H5","#464648"],
    ["H6","H6","#2C2C2C"], ["H7","H7","#010101"], ["H8","H8","#E7D6DC"], ["H9","H9","#EFEDEE"],
    ["H10","H10","#EBEBEB"], ["H11","H11","#CDCDCD"], ["H12","H12","#FDF6EE"], ["H13","H13","#F4EDF1"],
    ["H14","H14","#CED7D4"], ["H15","H15","#9AA6A6"], ["H16","H16","#1B1213"], ["H17","H17","#F0EEEF"],
    ["H18","H18","#FCFFF6"], ["H19","H19","#F2EEE5"], ["H20","H20","#96A09F"], ["H21","H21","#F8FBE6"],
    ["H22","H22","#CACAD2"], ["H23","H23","#9B9C94"], ["M1","M1","#BBC6B6"], ["M2","M2","#909994"],
    ["M3","M3","#697E81"], ["M4","M4","#E0D4BC"], ["M5","M5","#D1CCAF"], ["M6","M6","#B0AA86"],
    ["M7","M7","#B0A796"], ["M8","M8","#AE8082"], ["M9","M9","#A68862"], ["M10","M10","#C4B3BB"],
    ["M11","M11","#9D7693"], ["M12","M12","#644B51"], ["M13","M13","#C79266"], ["M14","M14","#C27563"],
    ["M15","M15","#747D7A"]
  ];

  function getPaletteSortGroup(color) {
    const { r, g, b } = color.rgb;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const brightness = colorBrightness(color.rgb);
    if (delta < 18) return brightness > 238 ? 8 : 7;
    const hue = rgbToHue(r, g, b);
    if (hue < 18 || hue >= 340) return 0;
    if (hue < 45) return 1;
    if (hue < 70) return 2;
    if (hue < 165) return 3;
    if (hue < 195) return 4;
    if (hue < 255) return 5;
    if (hue < 340) return 6;
    return 7;
  }

  function getPaletteFamilyKey(color) {
    const group = getPaletteSortGroup(color);
    return ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "gray", "gray"][group] || "gray";
  }

  function rgbToHue(r, g, b) {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    if (!delta) return 0;
    let hue = 0;
    if (max === rn) hue = ((gn - bn) / delta) % 6;
    else if (max === gn) hue = (bn - rn) / delta + 2;
    else hue = (rn - gn) / delta + 4;
    return (hue * 60 + 360) % 360;
  }

  const beadPalette = rawBeadPalette.map(([code, name, hex]) => {
    const rgb = hexToRgb(hex);
    return { code, name, hex, rgb, lab: rgbToLab(rgb.r, rgb.g, rgb.b) };
  }).sort((a, b) => {
    const group = getPaletteSortGroup(a) - getPaletteSortGroup(b);
    if (group) return group;
    const light = colorBrightness(b.rgb) - colorBrightness(a.rgb);
    if (Math.abs(light) > 0.5) return light;
    return a.code.localeCompare(b.code, undefined, { numeric: true });
  });

  const styleBackgroundMaterialGroups = [
    {
      label: "基础常用",
      items: [
        { value: "felt", label: "毛毡板", texture: "fabric", colors: ["#c4c5bd", "#aeb2aa", "#ece9dd"], grain: 1.05, weave: 0.7 },
        { value: "glass", label: "玻璃板", texture: "glass", colors: ["#f8fbff", "#dcecff", "#b7cff1"], gloss: 1.2, blur: 0.7 },
        { value: "wood", label: "木纹板", texture: "wood", colors: ["#d2aa78", "#8c5d34", "#f0d0a3"], grain: 0.9, lines: 1.2 },
        { value: "kraft", label: "牛皮板", texture: "paper", colors: ["#c79a62", "#a9723f", "#f0d4a7"], grain: 1.2, fibers: 1.2 },
        { value: "marble", label: "大理石板", texture: "stone", colors: ["#f4f5f1", "#cfd3d4", "#9a9fa5"], veins: 1.1 },
        { value: "linen-bg", label: "亚麻布板", texture: "fabric", colors: ["#ded4c2", "#b9a88e", "#fff8e8"], weave: 1.25 },
        { value: "cork", label: "软木板", texture: "cork", colors: ["#c99a63", "#7e512a", "#f0c58b"], grain: 1.4 },
        { value: "grid-paper", label: "方格纸", texture: "print", colors: ["#fbfdff", "#d7e5f7", "#7fa3ca"], grid: 1 },
        { value: "pastel-gradient", label: "柔彩渐变", texture: "cream", colors: ["#ffeaf4", "#e5f1ff", "#eee8ff"], blobs: 1 },
        { value: "dark-studio", label: "深色摄影棚", texture: "dark", colors: ["#3b4150", "#12151c", "#667085"], lines: 0.7 }
      ]
    },
    {
      label: "肌理感纸张",
      items: [
        { value: "paper-ivory", label: "米白纸肌理", texture: "paper", colors: ["#f7efe0", "#fffaf0", "#d6c7aa"], grain: 1.1, fibers: 1.1 },
        { value: "paper-torn-kraft", label: "牛皮纸撕纸", texture: "torn-paper", colors: ["#c99555", "#85562f", "#f5d49c"], grain: 1.4, fibers: 1.3 },
        { value: "paper-sticky-note", label: "暖黄便签", texture: "paper-note", colors: ["#fff2a8", "#f4cf59", "#fff9d7"], grain: 0.8, tape: 1 },
        { value: "paper-magazine", label: "杂志拼贴纸", texture: "magazine", colors: ["#f8f3ea", "#e6ddd0", "#2b3343"], grain: 0.55, layout: 1 },
        { value: "paper-clip-note", label: "回形针笔记", texture: "paper-clip", colors: ["#fbf6e8", "#d8d0c0", "#7f8798"], grain: 0.8, clip: 1 },
        { value: "paper-riso", label: "孔版印刷纸", texture: "riso", colors: ["#fff5df", "#ff715e", "#4ca3ff"], grain: 1.1, print: 1 },
        { value: "paper-receipt", label: "热敏票据纸", texture: "receipt", colors: ["#f4f1e8", "#d7d0c2", "#8c8d91"], grain: 0.7, lines: 0.75 },
        { value: "paper-newsprint", label: "旧报刊纸", texture: "newspaper", colors: ["#ece4d6", "#bcb09d", "#35383d"], grain: 1.2, print: 0.8 }
      ]
    },
    {
      label: "颗粒胶片",
      items: [
        { value: "film-grain", label: "胶片颗粒", texture: "film", colors: ["#eee4d3", "#b5a084", "#2f3038"], grain: 1.7, vignette: 0.42 },
        { value: "film-yellowed", label: "暖黄旧照片", texture: "film", colors: ["#ead4a1", "#c58d4e", "#453021"], grain: 1.4, warmth: 1.3 },
        { value: "film-light-leak", label: "漏光胶片", texture: "film-leak", colors: ["#efe2d8", "#ff7b55", "#ffd782"], grain: 1.25, leak: 1.2 },
        { value: "film-low-contrast", label: "低对比胶片", texture: "film", colors: ["#dad4ca", "#a69e94", "#f4efe8"], grain: 1.1, contrast: 0.5 },
        { value: "film-soft-blur", label: "微模糊柔焦", texture: "soft-photo", colors: ["#e9ddd8", "#d4b8ac", "#eff3f7"], grain: 0.65, blur: 1.1 },
        { value: "film-japanese", label: "日系写真", texture: "film", colors: ["#f7efe6", "#b9d8c8", "#f0c4b1"], grain: 0.75, warmth: 0.6 },
        { value: "film-ccd", label: "CCD冷感", texture: "ccd", colors: ["#cdd8e8", "#7f95b3", "#121827"], grain: 1.35, scan: 1 },
        { value: "film-expired", label: "过期胶片", texture: "film-leak", colors: ["#dac7b0", "#7ab3aa", "#e15f7e"], grain: 1.45, leak: 0.8 }
      ]
    },
    {
      label: "玻璃拟态",
      items: [
        { value: "glass-acrylic", label: "厚亚克力", texture: "glass", colors: ["#f8fbff", "#d3ebff", "#ffffff"], gloss: 1.4, thickness: 1 },
        { value: "glass-frosted", label: "磨砂玻璃", texture: "frosted-glass", colors: ["#eef5fb", "#cfd9e6", "#ffffff"], blur: 1.3, grain: 0.8 },
        { value: "glass-white-gloss", label: "白色高光玻璃", texture: "glass", colors: ["#ffffff", "#e8eff7", "#c9d8ea"], gloss: 1.7 },
        { value: "glass-yellow-spot", label: "渐变黄斑玻璃", texture: "glass-spot", colors: ["#f9fbff", "#ffe8a8", "#bed7ff"], gloss: 1.1, blobs: 0.9 },
        { value: "glass-card", label: "半透明卡片", texture: "glass-card", colors: ["#f7fbff", "#d9e5f4", "#ffffff"], gloss: 1.0, grid: 0.4 },
        { value: "glass-tech", label: "科技蓝玻璃", texture: "glass-tech", colors: ["#dff6ff", "#7bdcff", "#172846"], gloss: 1.2, lines: 1.2 }
      ]
    },
    {
      label: "金属材质",
      items: [
        { value: "metal-silver", label: "银色金属", texture: "metal", colors: ["#f4f5f5", "#9aa1a8", "#ffffff"], metal: 1.2, lines: 1.3 },
        { value: "metal-razer", label: "雷蛇渐变", texture: "metal-rainbow", colors: ["#14f195", "#1b6dff", "#0a0f18"], metal: 1.1, neon: 1 },
        { value: "metal-foil", label: "银箔纸", texture: "foil", colors: ["#f8f8f4", "#bfc5c9", "#6f7780"], metal: 1.4, facets: 1.2 },
        { value: "metal-graphite", label: "高级灰金属", texture: "metal", colors: ["#c9ced3", "#606975", "#f4f4f2"], metal: 0.95, lines: 0.9 },
        { value: "metal-liquid", label: "液态金属", texture: "liquid-metal", colors: ["#f5f7fb", "#99a6b7", "#384456"], metal: 1.35, blobs: 1.1 },
        { value: "metal-brushed", label: "拉丝金属", texture: "brushed-metal", colors: ["#e7e8e8", "#8c9298", "#2b323a"], metal: 1.0, lines: 1.7 }
      ]
    },
    {
      label: "奶油柔雾",
      items: [
        { value: "cream-macaron", label: "马卡龙少女", texture: "cream", colors: ["#ffd9e8", "#d6efff", "#fff2bc"], blobs: 1.2, grain: 0.35 },
        { value: "cream-soft-gradient", label: "柔光渐变", texture: "cream", colors: ["#fff3f5", "#e7f6ff", "#fff8e0"], blobs: 0.8 },
        { value: "cream-rounded-blocks", label: "圆角块面", texture: "cream-blocks", colors: ["#ffdfeb", "#bde9df", "#fff4c8"], blocks: 1 },
        { value: "cream-healing", label: "治愈柔雾", texture: "soft-photo", colors: ["#f7eee8", "#dcebdc", "#f5d7c6"], grain: 0.42, warmth: 0.7 },
        { value: "cream-dawn", label: "晨雾粉橙", texture: "cream", colors: ["#ffe6d5", "#ffd2dd", "#e7f0ff"], blobs: 1.05, vignette: 0.18 },
        { value: "cream-vanilla", label: "香草奶油", texture: "paper", colors: ["#fff3d4", "#f4d88d", "#ffffff"], grain: 0.55, fibers: 0.45 }
      ]
    },
    {
      label: "布料材质",
      items: [
        { value: "fabric-felt", label: "厚毛毡", texture: "fabric", colors: ["#bfc4b7", "#899184", "#e9e4d9"], weave: 0.8, grain: 1.2 },
        { value: "fabric-weave", label: "细布纹", texture: "fabric", colors: ["#ddd5c8", "#a89e91", "#fff8ee"], weave: 1.45 },
        { value: "fabric-embroidery", label: "刺绣布底", texture: "embroidery", colors: ["#f2e7d6", "#c5a88f", "#fffaf0"], weave: 1.2, stitch: 1 },
        { value: "fabric-soft", label: "柔软绒布", texture: "velvet", colors: ["#d8ccd8", "#a488a3", "#f8f1f9"], grain: 0.85, nap: 1.2 },
        { value: "fabric-tweed", label: "粗花呢", texture: "tweed", colors: ["#b8b0a0", "#6f6a5f", "#e1d8c9"], weave: 1.8, grain: 1.1 }
      ]
    },
    {
      label: "塑料质感",
      items: [
        { value: "plastic-jelly", label: "半透果冻", texture: "plastic", colors: ["#d4fff7", "#7de4d8", "#ffffff"], gloss: 1.6, blobs: 0.7 },
        { value: "plastic-bouncy", label: "Q弹软塑", texture: "plastic", colors: ["#ffe1ec", "#ff9fc3", "#ffffff"], gloss: 1.45 },
        { value: "plastic-gloss", label: "亮面反射", texture: "plastic", colors: ["#f4f7ff", "#a7c6ff", "#ffffff"], gloss: 1.8 },
        { value: "plastic-candy3d", label: "可爱3D软糖", texture: "puffy", colors: ["#ffd7f1", "#c4f2ff", "#fff6ba"], gloss: 1.2, blobs: 1.1 },
        { value: "plastic-gummy", label: "透明软糖", texture: "plastic", colors: ["#ffe5ad", "#ffae70", "#fff9e6"], gloss: 1.35, thickness: 0.7 }
      ]
    },
    {
      label: "杂志印刷",
      items: [
        { value: "print-editorial", label: "高级排版", texture: "magazine", colors: ["#faf7f0", "#1c2330", "#d8c7a8"], layout: 1.3, grain: 0.4 },
        { value: "print-whitespace", label: "大留白画册", texture: "print", colors: ["#ffffff", "#ece8df", "#1c2330"], layout: 0.65, grain: 0.25 },
        { value: "print-newspaper", label: "报刊纹理", texture: "newspaper", colors: ["#ece6d9", "#c9bda8", "#22252b"], print: 1.2, grain: 1.25 },
        { value: "print-grain", label: "印刷颗粒", texture: "riso", colors: ["#f7f1e6", "#2f6cb3", "#e7524f"], print: 1, grain: 1.4 },
        { value: "print-english", label: "英文杂志", texture: "magazine", colors: ["#f8f7f2", "#111827", "#b7a07b"], layout: 1.15, english: 1 }
      ]
    },
    {
      label: "3D膨胀",
      items: [
        { value: "puffy-soft", label: "软萌膨胀", texture: "puffy", colors: ["#ffe3ef", "#cbefff", "#ffffff"], blobs: 1.2, gloss: 1 },
        { value: "puffy-clay", label: "黏土风", texture: "clay", colors: ["#ecd6bd", "#c9a182", "#fff3de"], grain: 0.9, blobs: 0.65 },
        { value: "puffy-bubble", label: "泡泡字感", texture: "puffy", colors: ["#d7f8ff", "#81cfff", "#ffffff"], gloss: 1.4, thickness: 1 },
        { value: "puffy-font", label: "膨胀字体风", texture: "puffy", colors: ["#ffcdf2", "#b8a4ff", "#fff7ff"], gloss: 1.1, blocks: 0.7 },
        { value: "puffy-cushion", label: "抱枕软垫", texture: "fabric", colors: ["#f1dfd8", "#d2afa4", "#fff6f2"], weave: 0.75, nap: 0.9 }
      ]
    },
    {
      label: "深色磨砂高级",
      items: [
        { value: "dark-premium", label: "暗黑高级", texture: "dark", colors: ["#20242c", "#090b10", "#687083"], grain: 0.75, vignette: 0.55 },
        { value: "dark-frosted-black", label: "磨砂黑", texture: "dark", colors: ["#2c3037", "#111318", "#4b515c"], grain: 1.1, blur: 0.8 },
        { value: "dark-business", label: "商务深灰", texture: "dark", colors: ["#303743", "#141820", "#9ba3b3"], lines: 0.8 },
        { value: "dark-metal-line", label: "金属线条黑", texture: "dark-lines", colors: ["#141820", "#05070b", "#b3bccb"], lines: 1.4, metal: 0.6 },
        { value: "dark-carbon", label: "碳纤维暗纹", texture: "carbon", colors: ["#20252c", "#07090d", "#3d4652"], weave: 1.7, grain: 0.4 }
      ]
    }
  ];

  const styleBackgroundMaterials = styleBackgroundMaterialGroups.flatMap((group) =>
    group.items.map((item) => Object.assign({ group: group.label }, item))
  );

  const state = {
    mode: "pixel",
    image: null,
    imageName: "",
    pendingSaveMessage: "",
    importSession: null,
    importCalibration: null,
    projectCache: [],
    projectCacheReady: false,
    projectPayloadCache: new Map(),
    lastSyncHealth: null,
    forceProjectStorageFailureForTest: false,
    params: {
      precision: 80,
      gap: 0,
      radius: 8,
      background: "checker",
      showCodes: false
    },
    view: {
      zoom: 1,
      panX: 0,
      panY: 0,
      isPanning: false,
      panStart: null,
      activePointers: new Map(),
      pinchStart: null,
      suppressPaint: false,
      touchGestureSnapshot: null,
      touchUndoDepth: 0
    },
    homeRecordMonthOffset: 0,
    lastRender: null,
    activeSessionStart: Date.now(),
    hasUnsavedChanges: false,
    inventory: {},
    buildProgress: {},
    activeActionProjectId: "",
    activeHistoryProjectId: "",
    beads: {
      restorationFingerprint: "",
      importMode: "fidelity",
      sourceCompareEnabled: false,
      sourceCompareOpacity: 38,
      buildMode: false,
      lockedColorCodes: [],
      lockedColorRoles: {},
      width: 48,
      height: 48,
      lockRatio: true,
      showCodes: true,
      showGrid: true,
      editTool: "brush",
      brushSize: 1,
      eraserSize: 1,
      toolOptionsHiddenFor: "",
      codeFontScale: 125,
      shapeType: "square",
      shapeStyle: "filled",
      shapeWidth: 12,
      shapeHeight: 12,
      shapeSides: 5,
      shapeFont: "system",
      shapeText: "Q像素",
      shapeTemplates: [],
      shapeTemplateSelectedId: "",
      selectMode: "rect",
      selectionOp: "replace",
      selectedCells: [],
      selectionColorsOpen: false,
      lassoPath: [],
      clipboard: null,
      clipboardBounds: null,
      clipboardSelectionSignature: "",
      floatingSelection: null,
      recentCodes: [beadPalette[0].code],
      guideLines: [],
      guideOrientation: "vertical",
      guideStyle: "dashed",
      guideColor: "#ff9d38",
      guideOpacity: 80,
      guideDrag: null,
      guideSelectedId: "",
      outlineMode: "add",
      outlineWidth: 1,
      outlineCode: beadPalette[0].code,
      styleBackgroundImage: null,
      styleBackgroundImageData: "",
      styleBackgroundImageName: "",
      styleStickerLibrary: [],
      styleStickerImages: new Map(),
      styleOverlays: [],
      styleSelectedOverlayId: "",
      styleTextOverlay: null,
      styleDrag: null,
      stylePreviewPointers: new Map(),
      stylePreviewPinch: null,
      stylePreviewZoom: 1,
      exportPreviewZoom: 1,
      exportRegions: [],
      eraseFlashCells: [],
      baseboardMode: "white",
      baseboardColor: "#ffffff",
      colorStripCollapsed: false,
      inspectedCell: null,
      inspectedCode: "",
      isPointerDown: false,
      dragStart: null,
      dragCurrent: null,
      selectedCode: beadPalette[0].code,
      replaceFrom: "",
      replaceTo: beadPalette[0].code,
      pattern: null,
      layers: [],
      activeLayerId: "",
      sourceLabel: "",
      pixelSignature: "",
      lastGridRect: null,
      undoStack: [],
      redoStack: [],
      projectId: null,
      projectTitle: "未命名",
      projectCreatedAt: "",
      exportSettings: {
        showGrid: true,
        showCenterLines: true,
        showCodes: true,
        showUsage: true,
        sortUsage: true,
        showInfo: true,
        showAppInfo: true,
        showAxisNumbers: true,
        showOuterBorder: true,
        paperPreset: "auto",
        paperOrientation: "portrait",
        exportRatio: "auto",
        exportRatioWidth: 4,
        exportRatioHeight: 3,
        exportAutoCellSize: true,
        exportPixelStyle: "current",
        exportCellSize: 22,
        exportScale: 2,
        exportMargin: 42,
        exportBackgroundColor: "#ffffff",
        exportTransparentBackground: false,
        exportMirror: false,
        exportPdf: false,
        albumTileSize: 52,
        albumIncludeOverview: true,
        albumShowPageTitle: true,
        regionEnabled: false,
        regionRows: 2,
        regionCols: 2,
        regionSelectedId: "",
        usageLayout: "wrap",
        usageStyle: "chips",
        usageFontSize: 16,
        watermark: "",
        watermarkEnabled: false,
        watermarkColor: "#222222",
        watermarkFontSize: 20,
        watermarkWeight: 800,
        watermarkOpacity: 30,
        watermarkAngle: 0,
        watermarkRowGap: 6,
        watermarkColGap: 8,
        watermarkOffsetX: 0,
        watermarkOffsetY: 0
      }
    }
  };

  let recalibrationSession = false;
  let previousCalibrationBeforeRecalibration = null;
  let importWizard = null;

  const storageKey = "q-pixel-local-projects-v1";
  const projectPayloadStoragePrefix = "q-pixel-project-payload-v1:";
  const inventoryStorageKey = "q-pixel-inventory-v1";
  const trashStorageKey = "q-pixel-trash-projects-v1";
  const stylePresetStorageKey = "q-pixel-style-presets-v1";
  const styleStickerStorageKey = "q-pixel-style-stickers-v1";
  const exportPresetStorageKey = "q-pixel-export-presets-v1";
  const sharedSettingsStorageKey = "q-pixel-shared-settings-v1";
  const shapeTemplateStorageKey = "q-pixel-shape-templates-v1";
  const watermarkStorageKey = "q-pixel-last-watermark-v1";
  const topbarCollapsedStorageKey = "q-pixel-topbar-collapsed-v1";
  const sidePanelCollapsedStorageKey = "q-pixel-side-panel-collapsed-v1";
  const watermarkSettingKeys = [
    "watermark",
    "watermarkEnabled",
    "watermarkColor",
    "watermarkFontSize",
    "watermarkWeight",
    "watermarkOpacity",
    "watermarkAngle",
    "watermarkRowGap",
    "watermarkColGap",
    "watermarkOffsetX",
    "watermarkOffsetY"
  ];
  const syncApiBase = window.location.protocol === "http:" || window.location.protocol === "https:"
    ? ""
    : "http://127.0.0.1:8766";

  const bounds = {
    precision: { min: 0, max: 500 },
    gap: { min: 0, max: 40 },
    radius: { min: 0, max: 50 },
    beadSize: { min: 16, max: 500 }
  };

  const shapeDefinitions = {
    square: { label: "方形", minWidth: 1, minHeight: 1 },
    circle: { label: "圆形", minWidth: 5, minHeight: 5 },
    triangle: { label: "三角形", minWidth: 5, minHeight: 5 },
    polygon: { label: "多边形", minWidth: 6, minHeight: 6 },
    star: { label: "五角星", minWidth: 9, minHeight: 9 },
    heart: { label: "心形", minWidth: 10, minHeight: 9 },
    diamond: { label: "菱形", minWidth: 5, minHeight: 5 },
    text: { label: "文字", minWidth: 8, minHeight: 8 },
    template: { label: "自定义模板", minWidth: 1, minHeight: 1 }
  };

  const shapeTypes = Object.keys(shapeDefinitions).filter((type) => type !== "template");

  const els = {};

  function bindElements() {
    [
      "homeView", "homeProjectGrid", "homeNewDesignButton", "homeNewTopButton", "homeSyncButton", "homeTrashButton",
      "homeOpenProjectButton", "homeImportImageButton", "homeProjectCount", "homeBeadCount",
      "homeRecordYear", "homeRecordMonth", "homeRecordPrevButton", "homeRecordNextButton", "homeRecordCalendar", "homeDesignDays",
      "homeAvgDayTime", "homeAvgWorkTime", "homeRecordList", "homeSignature",
      "editorTopbar", "editorWorkspace", "controlPanel", "topbarCollapseButton", "topbarExpandButton",
      "sidePanelCollapseButton", "sidePanelExpandButton", "backHomeButton", "saveTopButton", "saveStatus", "aiGenerateTopButton",
      "fileInput", "dropZone", "previewCanvas", "emptyState", "emptyTitle",
      "emptyDescription", "imageStatus", "canvasSize", "renderHint", "message",
      "precisionRange", "precisionNumber", "gapRange", "gapNumber", "radiusRange",
      "radiusNumber", "pixelCodesToggle", "chooseTopButton", "chooseEmptyButton", "replaceButton",
      "exportButton", "pixelExportPreviewButton", "exportTopButton", "modePixelButton", "modeBeadsButton",
      "zoomOutButton", "fitViewButton", "zoomInButton",
      "pixelPanel", "beadPanel", "pixelToBeadsButton", "beadWidthNumber",
      "beadHeightNumber", "beadLockRatio", "generateBeadsButton", "recalibrateImageButton", "usePixelButton",
      "showCodesToggle", "showGridToggle", "codeFontScaleRange", "codeFontScaleNumber",
      "importSummary", "importChoiceSummary",
      "importWizardStep1", "importWizardStep2", "importWizardStep3", "importWizardStep4", "importWizardColorSummary", "importWizardFinalSummary", "importWizardColorLimitInput", "importWizardCalibrationButton", "importWizardSkipCalibrationButton", "importWizardOptimizeButton", "importWizardKeepColorsButton", "importWizardApplyButton", "importWizardRestartButton", "importWizardOriginalCanvas", "importWizardPatternCanvas", "importWizardFinalOriginalCanvas", "importWizardFinalPatternCanvas",
      "qualitySummary", "qualityCheckButton", "exportMaterialsButton", "buildModeToggle", "buildProgress", "clearBuildProgressButton",
      "paletteSelect", "paletteGrid", "cellTargetPaletteGrid", "selectionColorTargetPaletteGrid",
      "replaceFromSelect", "replaceToSelect", "replaceAllButton", "usageSummary",
      "usageList", "exportChartButton", "toolBrushButton", "toolPickerButton",
      "toolEraserButton", "toolBucketButton", "toolSelectButton", "toolRectFillButton",
      "toolRectClearButton", "toolOutlineButton", "toolShapeButton", "toolPaletteButton", "toolClearLayerButton", "toolBaseboardButton",
      "toolGuideButton",
      "undoTopButton", "redoTopButton", "recentColorStack", "brushBadge", "eraserBadge",
      "toolOptionsPanel", "brushSizeRange", "brushSizeLabel", "brushDoneButton", "eraserSizeRange", "eraserSizeLabel", "eraserDoneButton",
      "outlineAddButton", "outlineRemoveButton", "outlineWidthRange", "outlineWidthLabel", "outlineColorSelect", "outlineApplyButton",
      "recolorFromSelect", "recolorToSelect", "recolorApplyButton",
      "guideVerticalButton", "guideHorizontalButton", "guideSolidButton", "guideDashedButton", "guideColorInput", "guideOpacityRange", "guideOpacityLabel", "guideClearButton",
      "selectRectButton", "selectLassoButton", "selectionReplaceButton",
      "selectionAddButton", "selectionSubtractButton", "selectionFillButton", "selectionClearButton",
      "selectionCopyButton", "selectionPasteButton", "selectionMoveButton", "selectionMirrorButton", "selectionRotateButton",
      "selectionColorsButton", "selectionOutlineButton", "selectionColorPanel", "selectionColorList",
      "selectionColorTargetSelect", "selectionSmallColorLimitInput", "selectionColorMergeSmallButton",
      "shapeSquareButton", "shapeCircleButton", "shapeTriangleButton", "shapePolygonButton",
      "shapeStarButton", "shapeHeartButton", "shapeDiamondButton", "shapeTextButton",
      "shapeFilledButton", "shapeOutlineButton",
      "shapeWidthInput", "shapeHeightInput", "shapeSidesInput", "shapeFontSelect", "shapeTextInput", "shapeMinHint", "shapeApplyButton",
      "shapeTemplateSelect", "shapeTemplateNameInput", "shapeTemplateMonoToggle", "shapeTemplateSaveButton", "shapeTemplateDeleteButton",
      "baseboardModeSelect", "baseboardColorInput", "paletteSearchInput", "floatingPaletteGrid",
      "cellInfoPanel", "cellInfoCloseButton", "cellInfoSwatch", "cellInfoCode", "cellInfoName",
      "cellInfoMeta", "cellTargetSelect", "cellMergeToSelectedButton", "cellReplaceToSelectedButton", "cellDeleteColorButton",
      "smallColorLimitInput", "mergeSmallColorsButton", "colorStrip", "colorStripToggle",
      "colorStripContent", "layerPanelToggle", "rightLayerPanel", "layerNewButton", "layerDuplicateButton",
      "layerMergeButton", "layerGroupButton", "layerMirrorButton", "layerImportButton",
      "layerImportInput", "layerList", "exportGridToggle", "exportCenterToggle", "exportCodesToggle",
      "canvasMirrorButton", "expandAmountInput", "expandUpButton", "expandDownButton",
      "expandLeftButton", "expandRightButton", "cropAutoButton", "cropSelectionButton",
      "scaleFactorInput", "scaleUpButton", "scaleDownButton",
      "exportUsageToggle", "exportSortToggle", "exportInfoToggle", "exportMirrorToggle",
      "exportPdfToggle", "exportWatermarkInput", "projectTitleInput",
      "saveProjectButton", "importProjectButton", "exportProjectButton",
      "exportBeadPixelButton", "exportAlbumButton", "projectList", "projectFileInput",
      "exportPreviewModal", "exportPreviewCanvas", "exportPreviewCloseButton",
      "exportPreviewRefreshButton", "exportPreviewPngButton", "exportPreviewAlbumButton",
      "exportPreviewPdfButton", "exportPreviewMirrorButton", "exportPreviewOpenButton", "materialPreviewButton", "charmPreviewButton",
      "exportPreviewZoomOutButton", "exportPreviewZoomFitButton", "exportPreviewZoomInButton",
      "materialPreviewModal", "materialPreviewCloseButton", "materialPreviewCanvas", "materialModeSelect",
      "materialBaseSelect", "materialIntensityRange", "materialIntensityLabel", "materialBackgroundSelect", "materialLightSelect", "materialDecorSelect", "materialExportButton",
      "styleRatioSelect", "styleBackgroundColorInput", "styleBackgroundAlphaRange", "styleBackgroundAlphaLabel", "styleBackgroundImageInput",
      "styleOrientationSelect", "styleCustomWidthInput", "styleCustomHeightInput", "styleBackgroundImageButton", "styleBackgroundImageName",
      "styleBorderSizeRange", "styleBorderSizeLabel", "styleBorderColorInput", "styleShadowColorInput", "styleShadowBlurRange",
      "styleShadowBlurLabel", "styleShadowAlphaRange", "styleShadowAlphaLabel", "styleShadowOffsetXRange", "styleShadowOffsetXLabel",
      "styleShadowOffsetYRange", "styleShadowOffsetYLabel", "styleThicknessRange", "styleThicknessLabel",
      "stylePreviewZoomOutButton", "stylePreviewZoomFitButton", "stylePreviewZoomInButton",
      "styleStickerUploadButton", "styleStickerInput", "styleStickerList", "styleStickerSizeRange", "styleStickerSizeLabel",
      "styleStickerOpacityRange", "styleStickerOpacityLabel", "styleStickerRemoveButton",
      "styleTextInput", "styleTextFontSelect", "styleTextSizeRange", "styleTextSizeLabel", "styleTextWeightRange", "styleTextWeightLabel",
      "styleTextColorInput", "styleTextOpacityRange", "styleTextOpacityLabel", "styleTextStrokeColorInput",
      "styleTextStrokeWidthRange", "styleTextStrokeWidthLabel", "styleTextShadowRange", "styleTextShadowLabel",
      "styleTextApplyButton", "styleTextRemoveButton", "stylePresetNameInput", "stylePresetSaveButton", "stylePresetList",
      "charmPreviewModal", "charmPreviewCloseButton", "charmPreviewCanvas", "charmHolePositionSelect", "charmHoleSizeRange",
      "charmHoleSizeLabel", "charmKeyringSelect", "charmCordSelect", "charmLinkSelect", "charmExportButton",
      "toolRailGrip", "toolRailBGrip", "toolRailCollapseButton", "toolRailBCollapseButton", "colorStripGrip", "projectActionModal", "projectActionCloseButton",
      "projectActionThumb", "projectActionTitle", "projectActionCreated", "projectActionUpdated",
      "projectActionOpenButton", "projectActionHistoryButton", "projectActionTemplateButton", "projectActionRenameButton", "projectActionDuplicateButton", "projectActionDeleteButton",
      "projectHistoryModal", "projectHistoryCloseButton", "projectHistoryTitle", "projectHistoryList",
      "aiGenerateModal", "aiGenerateCloseButton", "aiPromptInput", "aiProviderSelect", "aiStyleSelect", "aiWidthInput", "aiHeightInput", "aiColorLimitInput", "aiProviderBalances", "aiGenerateStatus", "aiJimengPending", "aiJimengPendingName", "aiJimengImportButton", "aiJimengIgnoreButton", "aiPromptCopyButton", "aiJimengWebButton", "aiGenerateButton",
      "layerImportModal", "layerImportCloseButton", "layerImportImageButton", "layerImportProjectFileButton", "layerImportProjectList",
      "importChoiceModal", "importChoiceCancelButton", "importChoiceFileName",
      "importModeFidelityButton", "importModeBalancedButton", "importModeSimpleButton",
      "importCalibrateButton", "importDirectButton", "calibrationModal",
      "calibrationBackButton", "calibrationDoneButton", "calibrationCanvas",
      "calibrationNudgeLeftButton", "calibrationNudgeUpButton",
      "calibrationNudgeDownButton", "calibrationNudgeRightButton",
      "calibrationColumnsInput", "calibrationCellSizeInput", "calibrationAiToggle",
      "colorOptimizeLimitInput", "colorOptimizeButton", "colorOptimizeUndoButton", "restoreOptimizeButton", "restoreLightButton", "restoreBalancedButton", "restoreDetailButton",
      "sourceCompareToggle", "sourceCompareOpacityRange", "sourceCompareOpacityLabel", "lockedColorSummary",
      "trashModal", "trashCloseButton", "trashList",
      "usageLayoutWrapButton", "usageLayoutGridButton", "usageFontSizeRange", "usageFontSizeLabel",
      "usageStyleChipsButton", "usageStyleTableButton", "exportAxisToggle", "exportOuterBorderToggle",
      "paperPresetSelect", "paperOrientationPortraitButton", "paperOrientationLandscapeButton", "exportRatioSelect", "exportRatioWidthInput", "exportRatioHeightInput",
      "exportAutoCellToggle", "exportPixelStyleSelect", "exportCellSizeRange", "exportCellSizeLabel",
      "exportScaleSelect", "exportScaleNumber", "exportMarginRange", "exportMarginLabel", "exportBackgroundColorInput", "exportTransparentToggle",
      "albumTileSizeRange", "albumTileSizeLabel", "albumOverviewToggle", "albumPageTitleToggle",
      "watermarkEnabledToggle", "watermarkColorInput", "watermarkFontSizeRange", "watermarkFontSizeLabel",
      "watermarkWeightRange", "watermarkWeightLabel", "watermarkOpacityRange", "watermarkOpacityLabel",
      "watermarkAngleRange", "watermarkAngleLabel",
      "watermarkRowGapRange", "watermarkRowGapLabel", "watermarkColGapRange", "watermarkColGapLabel",
      "watermarkOffsetXRange", "watermarkOffsetXLabel", "watermarkOffsetYRange", "watermarkOffsetYLabel",
      "exportRegionToggle", "exportRegionRowsInput", "exportRegionColsInput", "exportRegionAutoButton", "exportRegionGuideButton",
      "exportRegionStartRowInput", "exportRegionStartColInput", "exportRegionHeightInput", "exportRegionWidthInput",
      "exportRegionAddButton", "exportRegionSelect", "exportRegionMultiSelect", "exportRegionDeleteButton", "exportRegionExportButton",
      "exportRegionExportSelectedButton", "exportRegionExportAllButton", "exportRegionNudgeInput",
      "exportRegionNudgeUpButton", "exportRegionNudgeDownButton", "exportRegionNudgeLeftButton", "exportRegionNudgeRightButton",
      "exportAppInfoToggle", "exportPresetNameInput", "exportPresetSaveButton", "exportPresetList",
      "guideDoneButton", "guideLineSelect", "guideDeleteButton"
    ].forEach((id) => {
      els[id] = document.getElementById(id);
    });
    els.bgButtons = Array.from(document.querySelectorAll("[data-bg]"));
    els.toolButtons = Array.from(document.querySelectorAll("[data-tool]"));
  }

  function clamp(value, min, max) {
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.min(max, Math.max(min, Math.round(num)));
  }

  function clampParams(params) {
    return {
      precision: clamp(params.precision, bounds.precision.min, bounds.precision.max),
      gap: clamp(params.gap, bounds.gap.min, bounds.gap.max),
      radius: clamp(params.radius, bounds.radius.min, bounds.radius.max),
      background: ["light", "dark", "checker"].includes(params.background) ? params.background : "checker",
      showCodes: Boolean(params.showCodes)
    };
  }

  function clampBeadParams(params) {
    return {
      width: clamp(params.width, bounds.beadSize.min, bounds.beadSize.max),
      height: clamp(params.height, bounds.beadSize.min, bounds.beadSize.max),
      lockRatio: Boolean(params.lockRatio),
      showCodes: params.showCodes !== false,
      showGrid: params.showGrid !== false
    };
  }

  function setMessage(text, isError) {
    if (!els.message) return;
    els.message.textContent = text || "";
    els.message.classList.toggle("error", Boolean(isError));
  }

  function getSavedWatermarkSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(watermarkStorageKey) || "{}");
      if (!parsed || typeof parsed !== "object") return {};
      return watermarkSettingKeys.reduce((settings, key) => {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) settings[key] = parsed[key];
        return settings;
      }, {});
    } catch {
      return {};
    }
  }

  function applySavedWatermarkSettings() {
    const saved = getSavedWatermarkSettings();
    if (!Object.keys(saved).length) return;
    state.beads.exportSettings = Object.assign({}, state.beads.exportSettings, saved);
  }

  function saveWatermarkSettings() {
    const snapshot = watermarkSettingKeys.reduce((settings, key) => {
      settings[key] = state.beads.exportSettings[key];
      return settings;
    }, {});
    try {
      localStorage.setItem(watermarkStorageKey, JSON.stringify(snapshot));
    } catch {
      // Local storage can be unavailable in a private or restricted context.
    }
  }

  function getSavedCollapseState(key) {
    try {
      return localStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  }

  function saveCollapseState(key, collapsed) {
    try {
      localStorage.setItem(key, collapsed ? "1" : "0");
    } catch {
      // Ignore storage errors; the visible state still updates for this session.
    }
  }

  function setTopbarCollapsed(collapsed, options = {}) {
    const shell = document.querySelector(".app-shell");
    if (!shell) return;
    shell.classList.toggle("topbar-collapsed", Boolean(collapsed));
    if (els.topbarExpandButton) els.topbarExpandButton.classList.toggle("hidden-control", !collapsed);
    if (els.topbarCollapseButton) {
      els.topbarCollapseButton.setAttribute("aria-expanded", collapsed ? "false" : "true");
      els.topbarCollapseButton.title = collapsed ? "展开顶部栏" : "收起顶部栏";
    }
    if (!options.skipSave) saveCollapseState(topbarCollapsedStorageKey, collapsed);
    requestAnimationFrame(render);
  }

  function setSidePanelCollapsed(collapsed, options = {}) {
    const shell = document.querySelector(".app-shell");
    if (!shell) return;
    shell.classList.toggle("side-panel-collapsed", Boolean(collapsed));
    if (els.sidePanelExpandButton) els.sidePanelExpandButton.classList.toggle("hidden-control", !collapsed);
    if (els.sidePanelCollapseButton) {
      els.sidePanelCollapseButton.setAttribute("aria-expanded", collapsed ? "false" : "true");
      els.sidePanelCollapseButton.title = collapsed ? "展开右侧栏" : "收起右侧栏";
    }
    if (!options.skipSave) saveCollapseState(sidePanelCollapsedStorageKey, collapsed);
    requestAnimationFrame(render);
  }

  function restoreChromeCollapseState() {
    setTopbarCollapsed(getSavedCollapseState(topbarCollapsedStorageKey), { skipSave: true });
    setSidePanelCollapsed(getSavedCollapseState(sidePanelCollapsedStorageKey), { skipSave: true });
  }

  function setMode(mode) {
    state.mode = mode === "beads" ? "beads" : "pixel";
    if (document.body) document.body.dataset.mode = state.mode;
    if (els.modePixelButton) els.modePixelButton.classList.toggle("active", state.mode === "pixel");
    if (els.modeBeadsButton) els.modeBeadsButton.classList.toggle("active", state.mode === "beads");
    if (els.pixelPanel) els.pixelPanel.classList.toggle("active", state.mode === "pixel");
    if (els.beadPanel) els.beadPanel.classList.toggle("active", state.mode === "beads" || state.mode === "pixel");
    if (els.exportTopButton) {
      els.exportTopButton.textContent = "导出预览";
    }
    syncDropZoneClass();
    render();
  }

  function syncDropZoneClass() {
    if (!els.dropZone) return;
    els.dropZone.classList.remove("light", "dark", "checker", "beads-bg");
    if (state.mode === "beads") {
      els.dropZone.classList.add("beads-bg");
    } else {
      els.dropZone.classList.add(state.params.background);
    }
  }

  function syncPixelControls() {
    const params = clampParams(state.params);
    state.params = params;
    if (!els.precisionRange) return;
    els.precisionRange.value = String(params.precision);
    els.precisionNumber.value = String(params.precision);
    els.gapRange.value = String(params.gap);
    els.gapNumber.value = String(params.gap);
    els.radiusRange.value = String(params.radius);
    els.radiusNumber.value = String(params.radius);
    if (els.pixelCodesToggle) els.pixelCodesToggle.checked = Boolean(state.params.showCodes);
    els.bgButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.bg === params.background);
    });
    if (state.mode === "pixel") syncDropZoneClass();
  }

  function syncBeadControls() {
    const params = clampBeadParams(state.beads);
    state.beads.width = params.width;
    state.beads.height = params.height;
    state.beads.lockRatio = params.lockRatio;
    state.beads.showCodes = params.showCodes;
    state.beads.showGrid = params.showGrid;
    state.beads.codeFontScale = clamp(state.beads.codeFontScale || 125, 80, 180);

    if (!els.beadWidthNumber) return;
    els.beadWidthNumber.value = String(params.width);
    els.beadHeightNumber.value = String(params.height);
    els.beadLockRatio.checked = params.lockRatio;
    els.showCodesToggle.checked = params.showCodes;
    els.showGridToggle.checked = params.showGrid;
    if (els.codeFontScaleRange) els.codeFontScaleRange.value = String(state.beads.codeFontScale);
    if (els.codeFontScaleNumber) els.codeFontScaleNumber.value = String(state.beads.codeFontScale);
    state.beads.sourceCompareOpacity = clamp(state.beads.sourceCompareOpacity || 38, 10, 85);
    if (els.sourceCompareToggle) els.sourceCompareToggle.checked = Boolean(state.beads.sourceCompareEnabled);
    if (els.sourceCompareOpacityRange) els.sourceCompareOpacityRange.value = String(state.beads.sourceCompareOpacity);
    if (els.sourceCompareOpacityLabel) els.sourceCompareOpacityLabel.textContent = `${state.beads.sourceCompareOpacity}%`;
    els.paletteSelect.value = state.beads.selectedCode;
    if (els.projectTitleInput) els.projectTitleInput.value = state.beads.projectTitle || "未命名";
    if (els.exportGridToggle) els.exportGridToggle.checked = state.beads.exportSettings.showGrid;
    if (els.exportCenterToggle) els.exportCenterToggle.checked = state.beads.exportSettings.showCenterLines;
    if (els.exportCodesToggle) els.exportCodesToggle.checked = state.beads.exportSettings.showCodes;
    if (els.exportUsageToggle) els.exportUsageToggle.checked = state.beads.exportSettings.showUsage;
    if (els.exportSortToggle) els.exportSortToggle.checked = state.beads.exportSettings.sortUsage;
    if (els.exportInfoToggle) els.exportInfoToggle.checked = state.beads.exportSettings.showInfo;
    if (els.exportAppInfoToggle) els.exportAppInfoToggle.checked = state.beads.exportSettings.showAppInfo;
    if (els.exportAxisToggle) els.exportAxisToggle.checked = state.beads.exportSettings.showAxisNumbers !== false;
    if (els.exportOuterBorderToggle) els.exportOuterBorderToggle.checked = state.beads.exportSettings.showOuterBorder !== false;
    if (els.exportAutoCellToggle) els.exportAutoCellToggle.checked = state.beads.exportSettings.exportAutoCellSize !== false;
    if (els.exportPixelStyleSelect) els.exportPixelStyleSelect.value = state.beads.exportSettings.exportPixelStyle || "current";
    if (els.exportTransparentToggle) els.exportTransparentToggle.checked = Boolean(state.beads.exportSettings.exportTransparentBackground);
    if (els.albumOverviewToggle) els.albumOverviewToggle.checked = state.beads.exportSettings.albumIncludeOverview !== false;
    if (els.albumPageTitleToggle) els.albumPageTitleToggle.checked = state.beads.exportSettings.albumShowPageTitle !== false;
    if (els.exportMirrorToggle) els.exportMirrorToggle.checked = state.beads.exportSettings.exportMirror;
    if (els.exportPdfToggle) els.exportPdfToggle.checked = state.beads.exportSettings.exportPdf;
    if (els.paperPresetSelect) els.paperPresetSelect.value = state.beads.exportSettings.paperPreset || "auto";
    if (els.exportRatioSelect) els.exportRatioSelect.value = state.beads.exportSettings.exportRatio || "auto";
    if (els.exportRatioWidthInput) els.exportRatioWidthInput.value = String(state.beads.exportSettings.exportRatioWidth || 4);
    if (els.exportRatioHeightInput) els.exportRatioHeightInput.value = String(state.beads.exportSettings.exportRatioHeight || 3);
    if (els.exportScaleSelect) els.exportScaleSelect.value = String(state.beads.exportSettings.exportScale || 2);
    if (els.exportScaleNumber) els.exportScaleNumber.value = String(state.beads.exportSettings.exportScale || 2);
    if (els.exportBackgroundColorInput) els.exportBackgroundColorInput.value = state.beads.exportSettings.exportBackgroundColor || "#ffffff";
    if (els.exportWatermarkInput) els.exportWatermarkInput.value = state.beads.exportSettings.watermark || "";
    if (els.watermarkEnabledToggle) els.watermarkEnabledToggle.checked = Boolean(state.beads.exportSettings.watermarkEnabled);
    if (els.watermarkColorInput) els.watermarkColorInput.value = state.beads.exportSettings.watermarkColor || "#222222";
    if (els.exportRegionToggle) els.exportRegionToggle.checked = Boolean(state.beads.exportSettings.regionEnabled);
    if (els.exportRegionRowsInput) els.exportRegionRowsInput.value = String(state.beads.exportSettings.regionRows || 2);
    if (els.exportRegionColsInput) els.exportRegionColsInput.value = String(state.beads.exportSettings.regionCols || 2);
    syncExportRegionInputs();
    renderExportRegionSelect();
    [
      ["exportCellSize", "exportCellSizeRange", "exportCellSizeLabel", ""],
      ["exportMargin", "exportMarginRange", "exportMarginLabel", ""],
      ["albumTileSize", "albumTileSizeRange", "albumTileSizeLabel", ""],
      ["usageFontSize", "usageFontSizeRange", "usageFontSizeLabel", ""],
      ["watermarkFontSize", "watermarkFontSizeRange", "watermarkFontSizeLabel", ""],
      ["watermarkWeight", "watermarkWeightRange", "watermarkWeightLabel", ""],
      ["watermarkOpacity", "watermarkOpacityRange", "watermarkOpacityLabel", "%"],
      ["watermarkAngle", "watermarkAngleRange", "watermarkAngleLabel", "°"],
      ["watermarkRowGap", "watermarkRowGapRange", "watermarkRowGapLabel", "x"],
      ["watermarkColGap", "watermarkColGapRange", "watermarkColGapLabel", "x"],
      ["watermarkOffsetX", "watermarkOffsetXRange", "watermarkOffsetXLabel", ""],
      ["watermarkOffsetY", "watermarkOffsetYRange", "watermarkOffsetYLabel", ""]
    ].forEach(([key, rangeId, labelId, suffix]) => {
      if (els[rangeId]) els[rangeId].value = String(state.beads.exportSettings[key]);
      if (els[labelId]) els[labelId].textContent = `${state.beads.exportSettings[key]}${suffix}`;
    });
    if (els.usageLayoutWrapButton) els.usageLayoutWrapButton.classList.toggle("active", state.beads.exportSettings.usageLayout !== "grid");
    if (els.usageLayoutGridButton) els.usageLayoutGridButton.classList.toggle("active", state.beads.exportSettings.usageLayout === "grid");
    if (els.usageStyleChipsButton) els.usageStyleChipsButton.classList.toggle("active", state.beads.exportSettings.usageStyle !== "table");
    if (els.usageStyleTableButton) els.usageStyleTableButton.classList.toggle("active", state.beads.exportSettings.usageStyle === "table");
    if (els.paperOrientationPortraitButton) els.paperOrientationPortraitButton.classList.toggle("active", state.beads.exportSettings.paperOrientation !== "landscape");
    if (els.paperOrientationLandscapeButton) els.paperOrientationLandscapeButton.classList.toggle("active", state.beads.exportSettings.paperOrientation === "landscape");
    if (els.exportCellSizeRange) els.exportCellSizeRange.disabled = state.beads.exportSettings.exportAutoCellSize !== false;
    if (els.brushSizeRange) els.brushSizeRange.value = String(state.beads.brushSize);
    if (els.brushSizeLabel) els.brushSizeLabel.textContent = String(state.beads.brushSize);
    if (els.brushBadge) els.brushBadge.textContent = String(state.beads.brushSize);
    if (els.eraserSizeRange) els.eraserSizeRange.value = String(state.beads.eraserSize);
    if (els.eraserSizeLabel) els.eraserSizeLabel.textContent = String(state.beads.eraserSize);
    if (els.eraserBadge) els.eraserBadge.textContent = String(state.beads.eraserSize);
    if (els.baseboardModeSelect) els.baseboardModeSelect.value = state.beads.baseboardMode;
    if (els.baseboardColorInput) els.baseboardColorInput.value = state.beads.baseboardColor;
    if (els.selectRectButton) els.selectRectButton.classList.toggle("active", state.beads.selectMode === "rect");
    if (els.selectLassoButton) els.selectLassoButton.classList.toggle("active", state.beads.selectMode === "lasso");
    if (els.shapeWidthInput) els.shapeWidthInput.value = String(state.beads.shapeWidth);
    if (els.shapeHeightInput) els.shapeHeightInput.value = String(state.beads.shapeHeight);
    if (els.shapeSidesInput) els.shapeSidesInput.value = String(state.beads.shapeSides);
    if (els.shapeFontSelect) els.shapeFontSelect.value = state.beads.shapeFont || "system";
    if (els.shapeTextInput) els.shapeTextInput.value = state.beads.shapeText || "";
    if (els.shapeFilledButton) els.shapeFilledButton.classList.toggle("active", state.beads.shapeStyle !== "outline");
    if (els.shapeOutlineButton) els.shapeOutlineButton.classList.toggle("active", state.beads.shapeStyle === "outline");
    shapeTypes.forEach((type) => {
      const id = `shape${type[0].toUpperCase()}${type.slice(1)}Button`;
      if (els[id]) els[id].classList.toggle("active", state.beads.shapeType === type);
    });
    if (els.shapeMinHint) {
      const def = getShapeDefinition(state.beads.shapeType);
      els.shapeMinHint.textContent = `${def.label} 最小 ${def.minWidth} x ${def.minHeight} 格`;
    }
    renderShapeTemplateSelect();
    if (els.outlineWidthRange) els.outlineWidthRange.value = String(state.beads.outlineWidth);
    if (els.outlineWidthLabel) els.outlineWidthLabel.textContent = String(state.beads.outlineWidth);
    if (els.outlineColorSelect) els.outlineColorSelect.value = state.beads.outlineCode || state.beads.selectedCode;
    if (els.cellTargetSelect) els.cellTargetSelect.value = state.beads.selectedCode;
    if (els.selectionColorTargetSelect) els.selectionColorTargetSelect.value = state.beads.selectedCode;
    updateTargetPaletteActiveState();
    if (els.outlineAddButton) els.outlineAddButton.classList.toggle("active", state.beads.outlineMode !== "remove");
    if (els.outlineRemoveButton) els.outlineRemoveButton.classList.toggle("active", state.beads.outlineMode === "remove");
    if (els.guideVerticalButton) els.guideVerticalButton.classList.toggle("active", state.beads.guideOrientation !== "horizontal");
    if (els.guideHorizontalButton) els.guideHorizontalButton.classList.toggle("active", state.beads.guideOrientation === "horizontal");
    if (els.guideSolidButton) els.guideSolidButton.classList.toggle("active", state.beads.guideStyle !== "dashed");
    if (els.guideDashedButton) els.guideDashedButton.classList.toggle("active", state.beads.guideStyle === "dashed");
    if (els.guideColorInput) els.guideColorInput.value = state.beads.guideColor || "#ff9d38";
    if (els.guideOpacityRange) els.guideOpacityRange.value = String(state.beads.guideOpacity || 80);
    if (els.guideOpacityLabel) els.guideOpacityLabel.textContent = `${state.beads.guideOpacity || 80}%`;
    renderGuideLineSelect();
    ["replace", "add", "subtract"].forEach((op) => {
      const id = op === "replace" ? "selectionReplaceButton" : op === "add" ? "selectionAddButton" : "selectionSubtractButton";
      if (els[id]) els[id].classList.toggle("active", state.beads.selectionOp === op);
    });
    renderRecentColorStack();
    if (els.toolButtons) {
      els.toolButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tool === state.beads.editTool);
      });
    }
    updatePaletteActiveState();
    updateHistoryButtons();
    syncToolOptions();
    renderLayerList();
    renderColorStrip();
    renderSelectionColorPanel();
    renderLockedColorSummary();
    syncImportModeControls();
    renderExportPresetList();
    renderUsage();
    renderProjectList();
  }

  function refreshExportPreviewIfOpen() {
    if (!els.exportPreviewModal || els.exportPreviewModal.classList.contains("hidden")) return;
    drawExportPreview();
  }

  function syncToolOptions() {
    if (!els.toolOptionsPanel) return;
    const active = state.beads.editTool;
    const hasSelection = Boolean(state.beads.selectedCells && state.beads.selectedCells.length);
    const visibleOptions = new Set();
    if (active === "brush" && state.beads.toolOptionsHiddenFor !== "brush") visibleOptions.add("brush");
    if (active === "eraser" && state.beads.toolOptionsHiddenFor !== "eraser") visibleOptions.add("eraser");
    if (active === "select") {
      visibleOptions.add("select");
      if (hasSelection) visibleOptions.add("selection-actions");
      if (hasSelection && state.beads.selectionColorsOpen) visibleOptions.add("selection-colors");
    }
    if (active === "palette") visibleOptions.add("palette");
    if (active === "shape") visibleOptions.add("shape");
    if (active === "outline") visibleOptions.add("outline");
    if (active === "recolor") visibleOptions.add("recolor");
    if (active === "guide" && state.beads.toolOptionsHiddenFor !== "guide") visibleOptions.add("guide");
    const blocks = Array.from(els.toolOptionsPanel.querySelectorAll(".tool-option"));
    blocks.forEach((block) => block.classList.toggle("active", visibleOptions.has(block.dataset.option)));
    els.toolOptionsPanel.classList.toggle("active", visibleOptions.size > 0);
    if (visibleOptions.has("selection-colors")) renderSelectionColorPanel();
  }

  function syncControls() {
    syncPixelControls();
    syncBeadControls();
    if (!els.renderHint) return;
    if (state.mode === "beads") {
      const total = state.beads.pattern ? countPatternCells(state.beads.pattern) : 0;
      els.renderHint.textContent = `${state.beads.width} x ${state.beads.height} 格 · ${total} 颗`;
    } else {
      const pattern = state.beads.pattern;
      els.renderHint.textContent = pattern && state.beads.sourceLabel === "像素画结果"
        ? `${pattern.width} x ${pattern.height} 格 · 像素精度 ${state.params.precision} / 500`
        : `像素精度 ${state.params.precision} / 500`;
    }
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16)
    };
  }

  function hexToRgba(hex, alpha) {
    const rgb = hexToRgb(/^#[0-9a-f]{6}$/i.test(hex || "") ? hex : "#ff9d38");
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0, Math.min(1, Number(alpha) || 1))})`;
  }

  function srgbToLinear(value) {
    const s = value / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  function linearToSrgb(value) {
    const s = value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
    return clamp(s * 255, 0, 255);
  }

  function rgbToLab(r, g, b) {
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    const x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
    const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
    const z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;
    const f = (t) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
    const fx = f(x / 0.95047);
    const fy = f(y);
    const fz = f(z / 1.08883);
    return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
  }

  function labDistance(a, b) {
    return Math.sqrt(
      Math.pow(a.l - b.l, 2) +
      Math.pow(a.a - b.a, 2) +
      Math.pow(a.b - b.b, 2)
    );
  }

  function getPaletteColor(code) {
    return beadPalette.find((color) => color.code === code) || beadPalette[0];
  }

  function nearestBeadColor(r, g, b) {
    const lab = rgbToLab(r, g, b);
    let best = beadPalette[0];
    let bestDistance = Infinity;
    for (const color of beadPalette) {
      const distance = labDistance(lab, color.lab);
      if (distance < bestDistance) {
        best = color;
        bestDistance = distance;
      }
    }
    return best;
  }

  function getCanvasFit(imageWidth, imageHeight, canvasWidth, canvasHeight) {
    const padding = 72;
    const fitWidth = Math.max(1, canvasWidth - padding * 2);
    const fitHeight = Math.max(1, canvasHeight - padding * 2);
    const scale = Math.min(fitWidth / imageWidth, fitHeight / imageHeight) * state.view.zoom;
    const width = Math.max(1, Math.round(imageWidth * scale));
    const height = Math.max(1, Math.round(imageHeight * scale));
    return {
      x: Math.round((canvasWidth - width) / 2 + state.view.panX),
      y: Math.round((canvasHeight - height) / 2 + state.view.panY),
      width,
      height
    };
  }

  function resetView() {
    state.view.zoom = 1;
    state.view.panX = 0;
    state.view.panY = 0;
    state.view.isPanning = false;
    state.view.panStart = null;
    render();
  }

  function zoomView(multiplier) {
    state.view.zoom = Math.max(0.25, Math.min(8, state.view.zoom * multiplier));
    render();
  }

  function getCanvasPoint(event) {
    const rect = els.previewCanvas.getBoundingClientRect();
    const scaleX = els.previewCanvas.width / rect.width;
    const scaleY = els.previewCanvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  }

  function getPointerDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function getPointerMidpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function getAxisStep(count) {
    if (count <= 70) return 1;
    if (count <= 120) return 5;
    if (count <= 220) return 20;
    return 50;
  }

  function drawAxisLabels(ctx, gridRect, cols, rows, cellWidth, cellHeight) {
    if (!cols || !rows || cellWidth <= 1 || cellHeight <= 1) return;
    const stepX = getAxisStep(cols);
    const stepY = getAxisStep(rows);
    const fontSize = Math.max(8, Math.min(12, Math.floor(Math.min(cellWidth, cellHeight) * 0.45)));
    const labelPad = 22;
    const top = Math.max(4, gridRect.y - labelPad);
    const bottom = Math.min(ctx.canvas.height - 10, gridRect.y + gridRect.height + labelPad);
    const left = Math.max(4, gridRect.x - labelPad);
    const right = Math.min(ctx.canvas.width - 26, gridRect.x + gridRect.width + 4);

    ctx.save();
    ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255, .82)";
    ctx.strokeStyle = "rgba(23, 32, 51, .12)";
    ctx.lineWidth = 1;

    for (let col = 0; col < cols; col += stepX) {
      const label = String(col + 1);
      const x = gridRect.x + (col + 0.5) * cellWidth;
      if (x < 0 || x > ctx.canvas.width) continue;
      ctx.fillRect(x - 12, top - 9, 24, 18);
      ctx.strokeRect(x - 12, top - 9, 24, 18);
      ctx.fillStyle = "rgba(23, 32, 51, .72)";
      ctx.fillText(label, x, top);
      ctx.fillStyle = "rgba(255, 255, 255, .82)";
      ctx.fillRect(x - 12, bottom - 9, 24, 18);
      ctx.strokeRect(x - 12, bottom - 9, 24, 18);
      ctx.fillStyle = "rgba(23, 32, 51, .72)";
      ctx.fillText(label, x, bottom);
      ctx.fillStyle = "rgba(255, 255, 255, .82)";
    }

    ctx.textAlign = "right";
    for (let row = 0; row < rows; row += stepY) {
      const label = String(row + 1);
      const y = gridRect.y + (row + 0.5) * cellHeight;
      if (y < 0 || y > ctx.canvas.height) continue;
      ctx.fillRect(left - 3, y - 9, 22, 18);
      ctx.strokeRect(left - 3, y - 9, 22, 18);
      ctx.fillStyle = "rgba(23, 32, 51, .72)";
      ctx.fillText(label, left + 15, y);
      ctx.fillStyle = "rgba(255, 255, 255, .82)";
      ctx.fillRect(right, y - 9, 24, 18);
      ctx.strokeRect(right, y - 9, 24, 18);
      ctx.fillStyle = "rgba(23, 32, 51, .72)";
      ctx.textAlign = "center";
      ctx.fillText(label, right + 12, y);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(255, 255, 255, .82)";
    }

    ctx.restore();
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
    if (safeRadius <= 0) {
      ctx.rect(x, y, width, height);
      return;
    }
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  }

  function clearPreview(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function resizePreviewCanvas() {
    const rect = els.dropZone.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const width = Math.max(400, Math.round(rect.width * dpr));
    const height = Math.max(320, Math.round(rect.height * dpr));
    if (els.previewCanvas.width !== width || els.previewCanvas.height !== height) {
      els.previewCanvas.width = width;
      els.previewCanvas.height = height;
    }
  }

  function getSampleColor(sourceCtx, sx, sy, sw, sh) {
    const cx = clamp(sx + sw / 2, 0, sourceCtx.canvas.width - 1);
    const cy = clamp(sy + sh / 2, 0, sourceCtx.canvas.height - 1);
    return sourceCtx.getImageData(cx, cy, 1, 1).data;
  }

  function renderPixelatedToCanvas(targetCanvas, image, params, options) {
    const outputScale = (options && options.outputScale) || 1;
    const renderParams = clampParams(params);
    const sourceCanvas = document.createElement("canvas");
    const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    sourceCanvas.width = image.naturalWidth || image.width;
    sourceCanvas.height = image.naturalHeight || image.height;
    sourceCtx.clearRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    sourceCtx.drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);

    const targetCtx = targetCanvas.getContext("2d");
    clearPreview(targetCtx, targetCanvas);

    const fit = options && options.fillCanvas
      ? { x: 0, y: 0, width: targetCanvas.width, height: targetCanvas.height }
      : getCanvasFit(sourceCanvas.width, sourceCanvas.height, targetCanvas.width, targetCanvas.height);

    const longerSide = Math.max(sourceCanvas.width, sourceCanvas.height);
    const requestedCells = renderParams.precision <= 0 ? 1 : renderParams.precision;
    const cellSourceSize = longerSide / requestedCells;
    const cols = Math.max(1, Math.ceil(sourceCanvas.width / cellSourceSize));
    const rows = Math.max(1, Math.ceil(sourceCanvas.height / cellSourceSize));
    const cellWidth = fit.width / cols;
    const cellHeight = fit.height / rows;
    const gap = renderParams.gap * outputScale;
    const radius = renderParams.radius * outputScale;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const sx = Math.floor(col * cellSourceSize);
        const sy = Math.floor(row * cellSourceSize);
        const sw = Math.max(1, Math.min(cellSourceSize, sourceCanvas.width - sx));
        const sh = Math.max(1, Math.min(cellSourceSize, sourceCanvas.height - sy));
        const color = getSampleColor(sourceCtx, sx, sy, sw, sh);
        if (color[3] < 12) continue;

        const dx = fit.x + col * cellWidth + gap / 2;
        const dy = fit.y + row * cellHeight + gap / 2;
        const dw = Math.max(0.4, cellWidth - gap);
        const dh = Math.max(0.4, cellHeight - gap);

        targetCtx.beginPath();
        roundedRect(targetCtx, dx, dy, dw, dh, radius);
        targetCtx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3] / 255})`;
        targetCtx.fill();

        if (renderParams.showCodes && !options?.fillCanvas && Math.min(dw, dh) >= 14) {
          const nearest = nearestBeadColor(color[0], color[1], color[2]);
          const fontSize = Math.max(6, Math.min(12, Math.floor(Math.min(dw, dh) * 0.28)));
          targetCtx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
          targetCtx.textAlign = "center";
          targetCtx.textBaseline = "middle";
          targetCtx.fillStyle = colorBrightness(nearest.rgb) > 145 ? "rgba(14, 20, 32, .82)" : "rgba(255, 255, 255, .92)";
          targetCtx.fillText(nearest.code, dx + dw / 2, dy + dh / 2);
        }
      }
    }

    if (!options || !options.fillCanvas) {
      drawAxisLabels(targetCtx, fit, cols, rows, cellWidth, cellHeight);
    }

    return { cols, rows, width: fit.width, height: fit.height, x: fit.x, y: fit.y };
  }

  function getPixelGridSizeForSource(sourceWidth, sourceHeight, params) {
    const renderParams = clampParams(params);
    const longerSide = Math.max(sourceWidth, sourceHeight);
    const requestedCells = renderParams.precision <= 0 ? 1 : renderParams.precision;
    const cellSourceSize = longerSide / requestedCells;
    return {
      cols: Math.max(1, Math.ceil(sourceWidth / cellSourceSize)),
      rows: Math.max(1, Math.ceil(sourceHeight / cellSourceSize))
    };
  }

  function getPixelGridSizeForImage(image, params) {
    return getPixelGridSizeForSource(
      image.naturalWidth || image.width,
      image.naturalHeight || image.height,
      params
    );
  }

  function getPixelPatternSignature() {
    if (!state.image) return "";
    const width = state.image.naturalWidth || state.image.width || 0;
    const height = state.image.naturalHeight || state.image.height || 0;
    return [
      state.imageName || "image",
      width,
      height,
      state.params.precision
    ].join("|");
  }

  function ensurePixelEditablePattern(force) {
    if (!state.image) return null;
    const signature = getPixelPatternSignature();
    const gridSize = getPixelGridSizeForImage(state.image, state.params);
    const width = clamp(gridSize.cols, bounds.beadSize.min, bounds.beadSize.max);
    const height = clamp(gridSize.rows, bounds.beadSize.min, bounds.beadSize.max);
    const existing = state.beads.pattern;
    if (!force && existing && state.beads.sourceLabel === "像素画结果" &&
      state.beads.pixelSignature === signature) {
      syncCompositePattern();
      return existing;
    }

    const sourceCanvas = makePixelExportCanvas({
      precision: state.params.precision,
      gap: 0,
      radius: 0,
      background: state.params.background
    });
    if (!sourceCanvas) return null;
    const pattern = createPatternFromSource(sourceCanvas, width, height, "像素画结果");
    state.beads.width = width;
    state.beads.height = height;
    state.beads.pattern = pattern;
    state.beads.layers = [];
    state.beads.activeLayerId = "";
    state.beads.sourceLabel = "像素画结果";
    state.beads.pixelSignature = signature;
    ensureLayers();
    clearHistory();
    return pattern;
  }

  function renderPixelMode() {
    syncControls();
    resizePreviewCanvas();
    const canvas = els.previewCanvas;
    const ctx = canvas.getContext("2d");
    clearPreview(ctx, canvas);

    if (!state.image) {
      showEmptyState("拖入图片或选择图片", "支持 PNG、JPG、WebP 等常见图片格式");
      els.canvasSize.textContent = "未载入图片";
      return;
    }

    hideEmptyState();
    const pattern = ensurePixelEditablePattern(false);
    if (!pattern) {
      showEmptyState("像素画生成失败", "请换一张图片或降低像素精度");
      els.canvasSize.textContent = "未生成像素网格";
      return;
    }
    syncCompositePattern();
    syncBeadControls();
    ctx.fillStyle = getBaseboardColor() || "#fbfaf7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    state.beads.lastGridRect = drawPatternPreview(ctx, canvas, pattern, {
      showCodes: state.params.showCodes || state.beads.showCodes,
      showGrid: state.beads.showGrid,
      cellGap: state.params.gap,
      cellRadius: state.params.radius
    });
    state.lastRender = state.beads.lastGridRect;
    els.canvasSize.textContent = `${pattern.width} x ${pattern.height} 格`;
  }

  function buildSamplingCanvas(source, maxSide) {
    const sourceWidth = source.naturalWidth || source.width;
    const sourceHeight = source.naturalHeight || source.height;
    const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function rgbDistanceFromData(data, width, aX, aY, bX, bY) {
    const a = (aY * width + aX) * 4;
    const b = (bY * width + bX) * 4;
    return Math.sqrt(
      Math.pow(data[a] - data[b], 2) +
      Math.pow(data[a + 1] - data[b + 1], 2) +
      Math.pow(data[a + 2] - data[b + 2], 2)
    );
  }

  function clusterPositions(positions, tolerance) {
    if (!positions.length) return [];
    const sorted = positions.slice().sort((a, b) => a - b);
    const clusters = [];
    let current = [sorted[0]];
    for (let index = 1; index < sorted.length; index += 1) {
      const value = sorted[index];
      const average = current.reduce((sum, item) => sum + item, 0) / current.length;
      if (Math.abs(value - average) <= tolerance) {
        current.push(value);
      } else {
        clusters.push(Math.round(average));
        current = [value];
      }
    }
    clusters.push(Math.round(current.reduce((sum, item) => sum + item, 0) / current.length));
    return clusters;
  }

  function scoreCellCandidate(gaps, candidate) {
    let score = 0;
    gaps.forEach((gap) => {
      if (gap < candidate * 0.7) return;
      const multiple = Math.max(1, Math.round(gap / candidate));
      const diff = Math.abs(gap - multiple * candidate);
      const tolerance = Math.max(1.5, candidate * 0.18);
      if (diff <= tolerance) score += 1 + Math.min(4, multiple) * 0.2;
    });
    return score;
  }

  function estimateCellSizeInAxis(canvas, data, axis) {
    const length = axis === "x" ? canvas.width : canvas.height;
    const cross = axis === "x" ? canvas.height : canvas.width;
    const lines = [0.18, 0.28, 0.38, 0.5, 0.62, 0.72, 0.82].map((ratio) => clamp(cross * ratio, 1, cross - 2));
    const positions = [];

    lines.forEach((line) => {
      for (let pos = 1; pos < length; pos += 1) {
        const x1 = axis === "x" ? pos - 1 : line;
        const y1 = axis === "x" ? line : pos - 1;
        const x2 = axis === "x" ? pos : line;
        const y2 = axis === "x" ? line : pos;
        if (rgbDistanceFromData(data, canvas.width, x1, y1, x2, y2) > 38) positions.push(pos);
      }
    });

    const clustered = clusterPositions(positions, 2);
    const gaps = [];
    for (let index = 1; index < clustered.length; index += 1) {
      const gap = clustered[index] - clustered[index - 1];
      if (gap >= 3 && gap <= Math.max(80, length / 3)) gaps.push(gap);
    }
    if (gaps.length < 4) return null;

    let best = null;
    for (let candidate = 3; candidate <= Math.min(48, Math.max(3, length / 8)); candidate += 1) {
      const score = scoreCellCandidate(gaps, candidate);
      if (!best || score > best.score) best = { size: candidate, score };
    }
    if (!best || best.score < Math.max(3, gaps.length * 0.2)) return null;
    return best.size;
  }

  function estimatePixelArtGrid(source) {
    const sourceWidth = source.naturalWidth || source.width;
    const sourceHeight = source.naturalHeight || source.height;
    if (!sourceWidth || !sourceHeight) return null;
    const canvas = buildSamplingCanvas(source, 1100);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const scaleX = canvas.width / sourceWidth;
    const scaleY = canvas.height / sourceHeight;
    const cellX = estimateCellSizeInAxis(canvas, data, "x");
    const cellY = estimateCellSizeInAxis(canvas, data, "y");
    const canvasCell = cellX && cellY ? (cellX + cellY) / 2 : (cellX || cellY);
    if (!canvasCell) return null;
    const sourceCell = canvasCell / ((scaleX + scaleY) / 2);
    if (!Number.isFinite(sourceCell) || sourceCell < 2) return null;
    const width = clamp(Math.round(sourceWidth / sourceCell), bounds.beadSize.min, bounds.beadSize.max);
    const height = clamp(Math.round(sourceHeight / sourceCell), bounds.beadSize.min, bounds.beadSize.max);
    return {
      width,
      height,
      cellSize: Number(sourceCell.toFixed(2)),
      confidence: Math.min(1, Math.max(0.2, canvasCell / 18))
    };
  }

  function makeDefaultCalibration(sourceWidth, sourceHeight, gridEstimate) {
    const columns = gridEstimate && gridEstimate.width
      ? clamp(gridEstimate.width, 1, bounds.beadSize.max)
      : clamp(Math.round(Math.max(16, Math.min(80, sourceWidth / 12))), 1, bounds.beadSize.max);
    const cellSize = gridEstimate && gridEstimate.cellSize
      ? Math.max(1, Number(gridEstimate.cellSize))
      : Math.max(1, sourceWidth / columns);
    return {
      enabled: true,
      offsetX: 0,
      offsetY: 0,
      columns,
      cellSize: Number(cellSize.toFixed(2)),
      rows: Math.max(1, Math.min(bounds.beadSize.max, Math.floor(sourceHeight / cellSize)))
    };
  }

  function normalizeCalibration(calibration, sourceWidth, sourceHeight) {
    const fallback = makeDefaultCalibration(sourceWidth, sourceHeight);
    const columns = clamp(calibration && calibration.columns, 1, bounds.beadSize.max);
    const cellSize = Math.max(1, Math.min(200, Number(calibration && calibration.cellSize) || fallback.cellSize));
    const offsetX = Math.max(-sourceWidth, Math.min(sourceWidth, Number(calibration && calibration.offsetX) || 0));
    const offsetY = Math.max(-sourceHeight, Math.min(sourceHeight, Number(calibration && calibration.offsetY) || 0));
    const rows = Math.max(1, Math.min(bounds.beadSize.max, Math.floor((sourceHeight - offsetY) / cellSize)));
    return {
      enabled: true,
      offsetX,
      offsetY,
      columns,
      cellSize: Number(cellSize.toFixed(2)),
      rows
    };
  }

  function sampleAverageColor(data, canvasWidth, canvasHeight, x, y, width, height) {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(canvasWidth, Math.ceil(x + width));
    const y1 = Math.min(canvasHeight, Math.ceil(y + height));
    let linR = 0;
    let linG = 0;
    let linB = 0;
    let weight = 0;

    for (let sy = y0; sy < y1; sy += 1) {
      for (let sx = x0; sx < x1; sx += 1) {
        const index = (sy * canvasWidth + sx) * 4;
        const alpha = data[index + 3] / 255;
        if (alpha < 0.06) continue;
        linR += srgbToLinear(data[index]) * alpha;
        linG += srgbToLinear(data[index + 1]) * alpha;
        linB += srgbToLinear(data[index + 2]) * alpha;
        weight += alpha;
      }
    }

    if (weight <= 0) return null;
    return [
      linearToSrgb(linR / weight),
      linearToSrgb(linG / weight),
      linearToSrgb(linB / weight)
    ];
  }

  function sampleDominantBeadCode(data, canvasWidth, canvasHeight, x, y, width, height) {
    const insetX = Math.max(0, width * 0.18);
    const insetY = Math.max(0, height * 0.18);
    const x0 = Math.max(0, Math.floor(x + insetX));
    const y0 = Math.max(0, Math.floor(y + insetY));
    const x1 = Math.min(canvasWidth, Math.ceil(x + width - insetX));
    const y1 = Math.min(canvasHeight, Math.ceil(y + height - insetY));
    const step = Math.max(1, Math.floor(Math.max(x1 - x0, y1 - y0) / 14));
    const counts = new Map();

    for (let sy = y0; sy < y1; sy += step) {
      for (let sx = x0; sx < x1; sx += step) {
        const index = (sy * canvasWidth + sx) * 4;
        const alpha = data[index + 3] / 255;
        if (alpha < 0.12) continue;
        const code = nearestBeadColor(data[index], data[index + 1], data[index + 2]).code;
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const dx = Math.abs(sx - centerX) / Math.max(1, width / 2);
        const dy = Math.abs(sy - centerY) / Math.max(1, height / 2);
        const centerWeight = 1 + Math.max(0, 1 - Math.max(dx, dy));
        counts.set(code, (counts.get(code) || 0) + alpha * centerWeight);
      }
    }

    let bestCode = null;
    let bestCount = 0;
    counts.forEach((count, code) => {
      if (count > bestCount) {
        bestCode = code;
        bestCount = count;
      }
    });
    return bestCode;
  }

  function getPatternCodeCounts(cells) {
    const counts = new Map();
    cells.forEach((row) => {
      row.forEach((code) => {
        if (code) counts.set(code, (counts.get(code) || 0) + 1);
      });
    });
    return counts;
  }

  function getLikelyBackgroundCode(pattern) {
    if (!pattern || !pattern.cells.length) return null;
    const counts = new Map();
    const add = (code) => {
      if (code) counts.set(code, (counts.get(code) || 0) + 1);
    };
    for (let col = 0; col < pattern.width; col += 1) {
      add(pattern.cells[0][col]);
      add(pattern.cells[pattern.height - 1][col]);
    }
    for (let row = 1; row < pattern.height - 1; row += 1) {
      add(pattern.cells[row][0]);
      add(pattern.cells[row][pattern.width - 1]);
    }
    let bestCode = null;
    let bestCount = 0;
    counts.forEach((count, code) => {
      if (count > bestCount) {
        bestCode = code;
        bestCount = count;
      }
    });
    return bestCode;
  }

  function isVeryLightCode(code) {
    const color = getPaletteColor(code);
    return colorBrightness(color.rgb) >= 222;
  }

  function isDarkOutlineCode(code) {
    const color = getPaletteColor(code);
    return colorBrightness(color.rgb) <= 70;
  }

  function getNeighborCodes(cells, row, col) {
    const codes = [];
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        if (!dr && !dc) continue;
        const line = cells[row + dr];
        if (!line) continue;
        const code = line[col + dc];
        if (code) codes.push(code);
      }
    }
    return codes;
  }

  function getMajorityNeighborCode(codes) {
    const counts = new Map();
    codes.forEach((code) => counts.set(code, (counts.get(code) || 0) + 1));
    let bestCode = null;
    let bestCount = 0;
    counts.forEach((count, code) => {
      if (count > bestCount) {
        bestCode = code;
        bestCount = count;
      }
    });
    return { code: bestCode, count: bestCount };
  }

  function getNearestNeighborColorCode(code, candidates) {
    if (!code || !candidates.length) return null;
    const color = getPaletteColor(code);
    let best = candidates[0];
    let bestDistance = Infinity;
    candidates.forEach((candidate) => {
      const target = getPaletteColor(candidate);
      const distance = labDistance(color.lab, target.lab);
      if (distance < bestDistance) {
        best = candidate;
        bestDistance = distance;
      }
    });
    return best;
  }

  function countDarkNeighbors(cells, row, col) {
    return getNeighborCodes(cells, row, col).filter(isDarkOutlineCode).length;
  }

  function getLineBridgeCode(cells, row, col) {
    const pairs = [
      [[0, -1], [0, 1]],
      [[-1, 0], [1, 0]],
      [[-1, -1], [1, 1]],
      [[-1, 1], [1, -1]]
    ];
    for (const pair of pairs) {
      const first = cells[row + pair[0][0]] && cells[row + pair[0][0]][col + pair[0][1]];
      const second = cells[row + pair[1][0]] && cells[row + pair[1][0]][col + pair[1][1]];
      if (first && second && isDarkOutlineCode(first) && isDarkOutlineCode(second)) {
        return first === second ? first : getNearestNeighborColorCode(first, [second]);
      }
    }
    return null;
  }

  function getPatternFingerprint(pattern) {
    if (!pattern || !pattern.cells) return "";
    return `${pattern.width}x${pattern.height}:${pattern.cells.map((row) => row.join(",")).join(";")}`;
  }

  function restorePixelArtDetails(pattern, mode = "legacy") {
    if (!pattern || !pattern.cells || pattern.width < 3 || pattern.height < 3) return pattern;
    const cells = cloneCells(pattern.cells);
    let changed = false;
    const safeMode = ["legacy", "light", "balanced", "detail"].includes(mode) ? mode : "balanced";
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        const current = cells[row][col];
        const bridgeCode = getLineBridgeCode(cells, row, col);
        if (!bridgeCode || current === bridgeCode) continue;
        // Only repair a background/blank cell or a clearly non-outline cell.
        // Existing dark outlines and light details are intentionally untouched.
        if (current && isDarkOutlineCode(current)) continue;
        if (current && !isVeryLightCode(current) && safeMode !== "detail") continue;
        cells[row][col] = bridgeCode;
        changed = true;
      }
    }
    let next = changed ? Object.assign({}, pattern, { cells }) : pattern;
    if (safeMode === "balanced") {
      next = cleanPixelArtPattern(next, getLockedColorSet());
    }
    return next;
  }

  function cleanPixelArtPattern(pattern, lockedCodes) {
    if (!pattern || !pattern.cells || pattern.width < 3 || pattern.height < 3) return pattern;
    const backgroundCode = getLikelyBackgroundCode(pattern);
    const locked = lockedCodes || new Set();
    let cells = cloneCells(pattern.cells);

    for (let pass = 0; pass < 2; pass += 1) {
      const next = cloneCells(cells);
      const counts = getPatternCodeCounts(cells);
      const rareLimit = Math.max(2, Math.floor(pattern.width * pattern.height * 0.006));

      for (let row = 0; row < pattern.height; row += 1) {
        for (let col = 0; col < pattern.width; col += 1) {
          const code = cells[row][col];
          if (!code) continue;
          if (locked.has(code)) continue;
          const neighbors = getNeighborCodes(cells, row, col);
          const majority = getMajorityNeighborCode(neighbors);
          if (!majority.code || majority.code === code) continue;

          const sameNeighbors = neighbors.filter((item) => item === code).length;
          const backgroundNeighbors = backgroundCode ? neighbors.filter((item) => item === backgroundCode).length : 0;
          const rare = (counts.get(code) || 0) <= rareLimit;
          const dark = isDarkOutlineCode(code);
          const majorityDark = isDarkOutlineCode(majority.code);
          const darkNeighbors = countDarkNeighbors(cells, row, col);

          if (isVeryLightCode(code) && darkNeighbors >= 4) continue;

          if (!dark && darkNeighbors >= 2) {
            const bridgeCode = getLineBridgeCode(cells, row, col);
            if (bridgeCode && !isVeryLightCode(code)) {
              next[row][col] = bridgeCode;
              continue;
            }
          }

          if (backgroundCode && code !== backgroundCode && isVeryLightCode(code) && backgroundNeighbors >= 3) {
            next[row][col] = backgroundCode;
            continue;
          }

          if (dark && sameNeighbors >= 2) continue;
          if (majority.count >= 5 && (!dark || majorityDark || sameNeighbors <= 1)) {
            next[row][col] = majority.code;
            continue;
          }

          if (rare && sameNeighbors <= 1 && majority.count >= 3) {
            next[row][col] = majority.code;
          }
        }
      }
      cells = next;
    }

    const counts = getPatternCodeCounts(cells);
    const next = cloneCells(cells);
    const rareLimit = Math.max(2, Math.floor(pattern.width * pattern.height * 0.004));
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        const code = cells[row][col];
        if (!code || (counts.get(code) || 0) > rareLimit) continue;
        if (locked.has(code)) continue;
        const candidates = getNeighborCodes(cells, row, col).filter((item) => item !== code);
        const replacement = getNearestNeighborColorCode(code, candidates);
        if (replacement) next[row][col] = replacement;
      }
    }

    return Object.assign({}, pattern, { cells: next });
  }

  function createPatternFromSourceWithCalibration(source, calibration, sourceLabel, options = {}) {
    const sourceCanvas = buildSamplingCanvas(source, 1800);
    const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    const data = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
    const sourceWidth = source.naturalWidth || source.width;
    const sourceHeight = source.naturalHeight || source.height;
    const scaleX = sourceCanvas.width / sourceWidth;
    const scaleY = sourceCanvas.height / sourceHeight;
    const grid = normalizeCalibration(calibration, sourceWidth, sourceHeight);
    const cells = [];

    for (let row = 0; row < grid.rows; row += 1) {
      const line = [];
      for (let col = 0; col < grid.columns; col += 1) {
        const sampleX = (grid.offsetX + col * grid.cellSize) * scaleX;
        const sampleY = (grid.offsetY + row * grid.cellSize) * scaleY;
        const sampleWidth = grid.cellSize * scaleX;
        const sampleHeight = grid.cellSize * scaleY;
        const dominantCode = sampleDominantBeadCode(
          data,
          sourceCanvas.width,
          sourceCanvas.height,
          sampleX,
          sampleY,
          sampleWidth,
          sampleHeight
        );
        const sample = dominantCode ? null : sampleAverageColor(
          data,
          sourceCanvas.width,
          sourceCanvas.height,
          sampleX,
          sampleY,
          sampleWidth,
          sampleHeight
        );
        line.push(dominantCode || (sample ? nearestBeadColor(sample[0], sample[1], sample[2]).code : null));
      }
      cells.push(line);
    }

    const pattern = {
      width: grid.columns,
      height: grid.rows,
      cells,
      sourceLabel: sourceLabel || "校准图片",
      createdAt: new Date().toISOString(),
      calibration: grid
    };
    return options.clean === false ? pattern : cleanPixelArtPattern(pattern);
  }

  function createPatternFromSource(source, width, height, sourceLabel, options = {}) {
    const sourceCanvas = buildSamplingCanvas(source, 1400);
    const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    const data = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
    const scaleX = sourceCanvas.width / width;
    const scaleY = sourceCanvas.height / height;
    const cells = [];

    for (let row = 0; row < height; row += 1) {
      const line = [];
      for (let col = 0; col < width; col += 1) {
        const sx0 = Math.floor(col * scaleX);
        const sy0 = Math.floor(row * scaleY);
        const sx1 = Math.min(sourceCanvas.width, Math.ceil((col + 1) * scaleX));
        const sy1 = Math.min(sourceCanvas.height, Math.ceil((row + 1) * scaleY));
        const dominantCode = sampleDominantBeadCode(
          data,
          sourceCanvas.width,
          sourceCanvas.height,
          sx0,
          sy0,
          Math.max(1, sx1 - sx0),
          Math.max(1, sy1 - sy0)
        );
        if (dominantCode) {
          line.push(dominantCode);
          continue;
        }
        let linR = 0;
        let linG = 0;
        let linB = 0;
        let weight = 0;

        for (let sy = sy0; sy < sy1; sy += 1) {
          for (let sx = sx0; sx < sx1; sx += 1) {
            const index = (sy * sourceCanvas.width + sx) * 4;
            const alpha = data[index + 3] / 255;
            if (alpha < 0.06) continue;
            linR += srgbToLinear(data[index]) * alpha;
            linG += srgbToLinear(data[index + 1]) * alpha;
            linB += srgbToLinear(data[index + 2]) * alpha;
            weight += alpha;
          }
        }

        if (weight <= 0) {
          line.push(null);
        } else {
          const color = nearestBeadColor(
            linearToSrgb(linR / weight),
            linearToSrgb(linG / weight),
            linearToSrgb(linB / weight)
          );
          line.push(color.code);
        }
      }
      cells.push(line);
    }

    const pattern = {
      width,
      height,
      cells,
      sourceLabel: sourceLabel || "未命名图片",
      createdAt: new Date().toISOString()
    };
    return options.clean === false ? pattern : cleanPixelArtPattern(pattern);
  }

  function createRestorationPatternFromSource(source, width, height, sourceLabel, calibration) {
    if (calibration) {
      return createPatternFromSourceWithCalibration(source, Object.assign({}, calibration), sourceLabel, { clean: false });
    }
    return createPatternFromSource(source, width, height, sourceLabel, { clean: false });
  }

  function renderBeadMode() {
    syncControls();
    resizePreviewCanvas();
    syncCompositePattern();
    const canvas = els.previewCanvas;
    const ctx = canvas.getContext("2d");
    clearPreview(ctx, canvas);
    ctx.fillStyle = getBaseboardColor() || "#fbfaf7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!state.beads.pattern) {
      showEmptyState("生成拼豆图纸", "可直接导入图片，也可使用像素画结果。");
      els.canvasSize.textContent = state.image ? state.imageName : "未生成图纸";
      state.beads.lastGridRect = null;
      return;
    }

    hideEmptyState();
    const pattern = state.beads.pattern;
    state.beads.lastGridRect = drawPatternPreview(ctx, canvas, pattern, {
      showCodes: state.beads.showCodes,
      showGrid: state.beads.showGrid
    });
    els.canvasSize.textContent = `${pattern.width} x ${pattern.height} 格`;
  }

  function drawPatternPreview(ctx, canvas, pattern, options) {
    const padding = 72;
    const availableWidth = Math.max(1, canvas.width - padding * 2);
    const availableHeight = Math.max(1, canvas.height - padding * 2);
    const cellSize = Math.max(1, Math.min(availableWidth / pattern.width, availableHeight / pattern.height) * state.view.zoom);
    const gridWidth = pattern.width * cellSize;
    const gridHeight = pattern.height * cellSize;
    const x = Math.round((canvas.width - gridWidth) / 2 + state.view.panX);
    const y = Math.round((canvas.height - gridHeight) / 2 + state.view.panY);
    drawSourceComparisonLayer(ctx, pattern, x, y, cellSize);
    drawPatternGrid(ctx, pattern, x, y, cellSize, options);
    drawBuildProgressOverlay(ctx, pattern, x, y, cellSize);
    drawGuideLines(ctx, x, y, cellSize, pattern);
    drawSelectionOverlay(ctx, x, y, cellSize);
    drawFloatingSelectionOverlay(ctx, x, y, cellSize);
    drawAxisLabels(ctx, { x, y, width: gridWidth, height: gridHeight }, pattern.width, pattern.height, cellSize, cellSize);
    return { x, y, cellSize, width: gridWidth, height: gridHeight };
  }

  function drawBuildProgressOverlay(ctx, pattern, x, y, cellSize) {
    if (!state.beads.buildMode || !state.buildProgress || !pattern) return;
    ctx.save();
    ctx.fillStyle = "rgba(32, 166, 122, .28)";
    ctx.strokeStyle = "rgba(20, 126, 91, .78)";
    ctx.lineWidth = Math.max(1, cellSize * .08);
    Object.keys(state.buildProgress).forEach((key) => {
      const [row, col] = key.split(":").map(Number);
      if (!Number.isInteger(row) || !Number.isInteger(col) || !pattern.cells[row] || !pattern.cells[row][col]) return;
      const px = x + col * cellSize;
      const py = y + row * cellSize;
      ctx.fillRect(px, py, cellSize, cellSize);
      ctx.strokeRect(px + cellSize * .18, py + cellSize * .18, cellSize * .64, cellSize * .64);
    });
    ctx.restore();
  }

  function drawSourceComparisonLayer(ctx, pattern, x, y, cellSize) {
    if (!state.beads.sourceCompareEnabled || !state.image || !pattern) return;
    const opacity = clamp(state.beads.sourceCompareOpacity || 38, 10, 85) / 100;
    const image = state.image;
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    let sx = 0;
    let sy = 0;
    let sw = imageWidth;
    let sh = imageHeight;
    const calibration = state.importCalibration && state.importCalibration.enabled ? state.importCalibration : null;
    if (calibration) {
      const grid = normalizeCalibration(calibration, imageWidth, imageHeight);
      sx = Math.max(0, grid.offsetX);
      sy = Math.max(0, grid.offsetY);
      sw = Math.min(imageWidth - sx, pattern.width * grid.cellSize);
      sh = Math.min(imageHeight - sy, pattern.height * grid.cellSize);
    }
    if (sw <= 0 || sh <= 0) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, sx, sy, sw, sh, x, y, pattern.width * cellSize, pattern.height * cellSize);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255, 255, 255, .18)";
    ctx.fillRect(x, y, pattern.width * cellSize, pattern.height * cellSize);
    ctx.restore();
  }

  function drawPatternGrid(ctx, pattern, x, y, cellSize, options) {
    const showCodes = options.showCodes !== false;
    const showGrid = options.showGrid !== false;
    const showCenterLines = options.showCenterLines !== false;
    const codeThreshold = options.export ? 8 : 14;
    const codeFontScale = options.codeFontScale || (options.export ? 100 : state.beads.codeFontScale || 125);
    const pixelStyle = options.pixelStyle || "current";
    const rawGap = Number(options.cellGap || 0);
    const rawRadius = Number(options.cellRadius || 0);
    const forcedSolid = pixelStyle === "solid-square";
    const forcedRound = pixelStyle === "round-bead";
    const forcedSoft = pixelStyle === "soft-rounded";
    const cellGap = forcedSolid ? 0 : forcedRound ? Math.max(1, cellSize * 0.16) : Math.max(0, Math.min(cellSize * 0.82, rawGap * cellSize / 40));
    const cellInset = cellGap / 2;
    const fillSize = Math.max(0.5, cellSize - cellGap);
    const cellRadius = Math.max(0, Math.min(fillSize / 2, rawRadius * fillSize / 50));
    const labels = [];

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.translate(x, y);
    ctx.globalAlpha = state.beads.sourceCompareEnabled && !options.export ? 0.78 : 1;
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        const code = pattern.cells[row][col];
        const px = col * cellSize;
        const py = row * cellSize;
        const drawX = px + cellInset;
        const drawY = py + cellInset;
        if (!code) {
          const baseColor = getBaseboardColor();
          if (baseColor) {
            ctx.fillStyle = baseColor;
            ctx.fillRect(px, py, cellSize, cellSize);
          }
          continue;
        }
        const color = getPaletteColor(code);
        if (code !== "H1") {
          ctx.fillStyle = color.hex;
        }
        if (code === "H1") {
          // H1 is transparent in Mard: leave the cell unpainted while still allowing code/grid display.
        } else if (forcedRound) {
          ctx.beginPath();
          ctx.arc(px + cellSize / 2, py + cellSize / 2, Math.max(0.5, fillSize / 2), 0, Math.PI * 2);
          ctx.fill();
        } else if (cellRadius > 0.2 || cellGap > 0.2 || forcedSoft) {
          ctx.beginPath();
          roundedRect(ctx, drawX, drawY, fillSize, fillSize, forcedSoft ? Math.min(fillSize / 3, cellSize * 0.18) : cellRadius);
          ctx.fill();
        } else {
          ctx.fillRect(px, py, cellSize, cellSize);
        }

        if (showCodes && cellSize >= codeThreshold) labels.push({ code, color, px, py });
      }
    }

    ctx.globalAlpha = 1;
    if (showGrid) {
      ctx.beginPath();
      ctx.strokeStyle = cellSize >= 10 ? "rgba(23, 32, 51, .28)" : "rgba(23, 32, 51, .16)";
      ctx.lineWidth = Math.max(0.5, Math.min(1.25, cellSize / 24));
      for (let col = 0; col <= pattern.width; col += 1) {
        const gx = col * cellSize;
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, pattern.height * cellSize);
      }
      for (let row = 0; row <= pattern.height; row += 1) {
        const gy = row * cellSize;
        ctx.moveTo(0, gy);
        ctx.lineTo(pattern.width * cellSize, gy);
      }
      ctx.stroke();

      if (showCenterLines && cellSize >= 8) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(23, 32, 51, .36)";
        ctx.lineWidth = Math.max(1, Math.min(2, cellSize / 18));
        for (let col = 0; col <= pattern.width; col += 5) {
          const gx = col * cellSize;
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, pattern.height * cellSize);
        }
        for (let row = 0; row <= pattern.height; row += 5) {
          const gy = row * cellSize;
          ctx.moveTo(0, gy);
          ctx.lineTo(pattern.width * cellSize, gy);
        }
        ctx.stroke();
      }
    }
    labels.forEach((label) => drawCellCodeLabel(ctx, label, cellSize, codeFontScale, Boolean(options.export)));
    ctx.restore();
  }

  function drawCellCodeLabel(ctx, label, cellSize, codeFontScale, isExport) {
    const { code, color, px, py } = label;
    const baseRatio = isExport ? 0.52 : 0.42;
    let fontSize = Math.max(isExport ? 9 : 7, Math.min(cellSize * 0.72, cellSize * baseRatio * codeFontScale / 100));
    ctx.font = `950 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, "Arial Rounded MT Bold", sans-serif`;
    const maxTextWidth = cellSize * (isExport ? 0.9 : 0.86);
    const measured = ctx.measureText(code).width;
    if (measured > maxTextWidth) {
      fontSize = Math.max(isExport ? 8 : 6, fontSize * maxTextWidth / measured);
      ctx.font = `950 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, "Arial Rounded MT Bold", sans-serif`;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const isLight = code === "H1" || colorBrightness(color.rgb) > 145;
    const textX = px + cellSize / 2;
    const textY = py + cellSize / 2 + (isExport ? fontSize * 0.02 : 0);
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.lineWidth = Math.max(isExport ? 1.4 : 1, fontSize * (isExport ? 0.16 : 0.12));
    ctx.strokeStyle = isLight ? "rgba(255, 255, 255, .9)" : "rgba(0, 0, 0, .45)";
    ctx.fillStyle = isLight ? "rgba(8, 12, 22, .96)" : "rgba(255, 255, 255, .98)";
    ctx.strokeText(code, textX, textY);
    ctx.fillText(code, textX, textY);
  }

  function drawGuideLines(ctx, x, y, cellSize, pattern) {
    if (!pattern || !state.beads.guideLines || !state.beads.guideLines.length) return;
    ctx.save();
    state.beads.guideLines.forEach((guide) => {
      const orientation = guide.orientation === "horizontal" ? "horizontal" : "vertical";
      const maxIndex = orientation === "horizontal" ? pattern.height : pattern.width;
      const index = clamp(guide.index, 0, maxIndex);
      const alpha = clamp(guide.opacity || state.beads.guideOpacity || 80, 10, 100) / 100;
      const selected = guide.id && guide.id === state.beads.guideSelectedId;
      ctx.strokeStyle = hexToRgba(guide.color || state.beads.guideColor || "#ff9d38", alpha);
      ctx.lineWidth = selected ? Math.max(3, cellSize * 0.11) : Math.max(2, cellSize * 0.06);
      ctx.setLineDash((guide.style || state.beads.guideStyle) === "solid" ? [] : [Math.max(6, cellSize * 0.32), Math.max(5, cellSize * 0.22)]);
      ctx.beginPath();
      if (orientation === "horizontal") {
        const py = y + index * cellSize;
        ctx.moveTo(x, py);
        ctx.lineTo(x + pattern.width * cellSize, py);
      } else {
        const px = x + index * cellSize;
        ctx.moveTo(px, y);
        ctx.lineTo(px, y + pattern.height * cellSize);
      }
      ctx.stroke();
      if (selected) {
        ctx.save();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(255, 255, 255, .82)";
        ctx.lineWidth = Math.max(1, cellSize * 0.035);
        ctx.stroke();
        ctx.restore();
      }
    });
    ctx.restore();
  }

  function drawSelectionOverlay(ctx, x, y, cellSize) {
    drawEraserFlashOverlay(ctx, x, y, cellSize);
    if (state.beads.selectedCells && state.beads.selectedCells.length) {
      ctx.save();
      ctx.fillStyle = "rgba(63, 131, 248, .2)";
      ctx.strokeStyle = "rgba(63, 131, 248, .88)";
      ctx.lineWidth = Math.max(1, cellSize * .06);
      state.beads.selectedCells.forEach((cell) => {
        ctx.fillRect(x + cell.col * cellSize, y + cell.row * cellSize, cellSize, cellSize);
        ctx.strokeRect(x + cell.col * cellSize, y + cell.row * cellSize, cellSize, cellSize);
      });
      ctx.restore();
    }
    if (!state.beads.dragStart || !state.beads.dragCurrent) return;
    if (!["rect-fill", "select", "shape"].includes(state.beads.editTool)) return;
    if (state.beads.editTool === "shape") {
      const anchor = state.beads.dragCurrent;
      const type = state.beads.shapeType || "square";
      const template = type === "template" ? getSelectedShapeTemplate() : null;
      const width = template ? template.width : clamp(state.beads.shapeWidth, 1, state.beads.pattern.width);
      const height = template ? template.height : clamp(state.beads.shapeHeight, 1, state.beads.pattern.height);
      const startCol = Math.round(anchor.col - (width - 1) / 2);
      const startRow = Math.round(anchor.row - (height - 1) / 2);
      const selectedColor = getPaletteColor(state.beads.selectedCode);
      let shapeMask = null;
      if (!template) {
        const textMask = type === "text" ? makeTextShapeMask(width, height, state.beads.shapeText) : null;
        shapeMask = buildShapeMask(type, width, height, textMask);
      }
      ctx.save();
      ctx.globalAlpha = 0.64;
      for (let localRow = 0; localRow < height; localRow += 1) {
        for (let localCol = 0; localCol < width; localCol += 1) {
          const row = startRow + localRow;
          const col = startCol + localCol;
          if (row < 0 || col < 0 || row >= state.beads.pattern.height || col >= state.beads.pattern.width) continue;
          const code = template
            ? template.cells[localRow] && template.cells[localRow][localCol]
            : shapeMask && shapeMask[localRow] && shapeMask[localRow][localCol] && (state.beads.shapeStyle !== "outline" || isShapeBoundary(shapeMask, localRow, localCol))
              ? getCuteShapeCode(type, localCol, localRow, width, height, isShapeBoundary(shapeMask, localRow, localCol))
              : null;
          if (!code) continue;
          const color = template ? getPaletteColor(code) : getPaletteColor(code || selectedColor.code);
          ctx.fillStyle = color.hex;
          ctx.fillRect(x + col * cellSize, y + row * cellSize, cellSize, cellSize);
        }
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(32, 166, 122, .96)";
      ctx.lineWidth = Math.max(2, cellSize * .08);
      ctx.setLineDash([Math.max(4, cellSize * .22), Math.max(3, cellSize * .16)]);
      ctx.strokeRect(x + startCol * cellSize, y + startRow * cellSize, width * cellSize, height * cellSize);
      ctx.restore();
      return;
    }
    if (state.beads.editTool === "select" && state.beads.selectMode === "lasso") {
      if (!state.beads.lassoPath || state.beads.lassoPath.length < 2) return;
      ctx.save();
      ctx.strokeStyle = "rgba(32, 166, 122, .95)";
      ctx.fillStyle = "rgba(32, 166, 122, .14)";
      ctx.lineWidth = Math.max(2, cellSize * .08);
      ctx.beginPath();
      state.beads.lassoPath.forEach((cell, index) => {
        const px = x + (cell.col + 0.5) * cellSize;
        const py = y + (cell.row + 0.5) * cellSize;
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      return;
    }
    const rect = getNormalizedRect(state.beads.dragStart, state.beads.dragCurrent);
    ctx.save();
    ctx.strokeStyle = "rgba(63, 131, 248, .95)";
    ctx.fillStyle = "rgba(63, 131, 248, .16)";
    ctx.lineWidth = Math.max(2, cellSize * .08);
    ctx.fillRect(x + rect.col * cellSize, y + rect.row * cellSize, rect.width * cellSize, rect.height * cellSize);
    ctx.strokeRect(x + rect.col * cellSize, y + rect.row * cellSize, rect.width * cellSize, rect.height * cellSize);
    ctx.restore();
  }

  function drawEraserFlashOverlay(ctx, x, y, cellSize) {
    const flashes = state.beads.eraseFlashCells || [];
    if (!flashes.length) return;
    const now = Date.now();
    const active = flashes.filter((item) => item.until > now);
    if (active.length !== flashes.length) state.beads.eraseFlashCells = active;
    if (!active.length) return;
    ctx.save();
    active.forEach((item) => {
      const t = Math.max(0, Math.min(1, (item.until - now) / 520));
      const px = x + item.col * cellSize;
      const py = y + item.row * cellSize;
      ctx.fillStyle = `rgba(255, 77, 92, ${0.18 + t * 0.22})`;
      ctx.fillRect(px, py, cellSize, cellSize);
      ctx.strokeStyle = `rgba(255, 77, 92, ${0.55 + t * 0.35})`;
      ctx.lineWidth = Math.max(1, cellSize * 0.08);
      ctx.strokeRect(px + 1, py + 1, Math.max(1, cellSize - 2), Math.max(1, cellSize - 2));
    });
    ctx.restore();
  }

  function drawFloatingSelectionOverlay(ctx, x, y, cellSize) {
    const floating = state.beads.floatingSelection;
    if (!floating || !floating.cells || !floating.cells.length) return;
    ctx.save();
    ctx.globalAlpha = floating.dragging ? 0.86 : 0.72;
    floating.cells.forEach((cell) => {
      const row = floating.targetRow + cell.row;
      const col = floating.targetCol + cell.col;
      if (row < 0 || col < 0 || row >= state.beads.pattern.height || col >= state.beads.pattern.width) return;
      const px = x + col * cellSize;
      const py = y + row * cellSize;
      if (cell.code) {
        const color = getPaletteColor(cell.code);
        ctx.fillStyle = color.hex;
        ctx.fillRect(px, py, cellSize, cellSize);
        if (state.beads.showCodes && cellSize >= 14) {
          const fontSize = Math.max(6, Math.min(cellSize * 0.52, Math.floor(cellSize * 0.32 * state.beads.codeFontScale / 100)));
          ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = colorBrightness(color.rgb) > 145 ? "rgba(14, 20, 32, .86)" : "rgba(255, 255, 255, .94)";
          ctx.fillText(cell.code, px + cellSize / 2, py + cellSize / 2);
        }
      } else {
        ctx.fillStyle = "rgba(255, 255, 255, .46)";
        ctx.fillRect(px, py, cellSize, cellSize);
      }
    });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(32, 166, 122, .96)";
    ctx.lineWidth = Math.max(2, cellSize * .08);
    ctx.setLineDash([Math.max(4, cellSize * .22), Math.max(3, cellSize * .16)]);
    ctx.strokeRect(
      x + floating.targetCol * cellSize,
      y + floating.targetRow * cellSize,
      floating.width * cellSize,
      floating.height * cellSize
    );
    ctx.restore();
  }

  function getBaseboardColor() {
    if (state.beads.baseboardMode === "transparent") return "";
    if (state.beads.baseboardMode === "black") return "#11151c";
    if (state.beads.baseboardMode === "custom") return state.beads.baseboardColor || "#ffffff";
    return "#ffffff";
  }

  function colorBrightness(rgb) {
    return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  }

  function calculateUsage(pattern) {
    if (!pattern) return [];
    const counts = new Map();
    for (const row of pattern.cells) {
      for (const code of row) {
        if (!code) continue;
        counts.set(code, (counts.get(code) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([code, count]) => ({ color: getPaletteColor(code), code, count }))
      .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
  }

  function countPatternColors(pattern) {
    return calculateUsage(pattern).length;
  }

  function getImportMode() {
    return ["fidelity", "balanced", "simple"].includes(state.beads.importMode) ? state.beads.importMode : "fidelity";
  }

  function getImportModeLabel(mode) {
    const labels = { fidelity: "高保真", balanced: "均衡", simple: "易制作" };
    return labels[mode || getImportMode()] || labels.fidelity;
  }

  function renderImportSummary() {
    if (!els.importSummary) return;
    const pattern = state.beads.pattern;
    if (!pattern) {
      els.importSummary.textContent = "导入图纸后显示模式、尺寸和色号摘要。";
      return;
    }
    const calibrated = Boolean(state.importCalibration && state.importCalibration.enabled);
    const mode = getImportModeLabel();
    const colors = countPatternColors(pattern);
    els.importSummary.textContent = `本次导入：${mode} · ${pattern.width} x ${pattern.height} 格 · ${colors} 种色号 · ${calibrated ? "已使用像素校准" : "自动网格"} · 原图对比${state.beads.sourceCompareEnabled ? "已开" : "已关"}`;
  }

  function setImportMode(mode) {
    state.beads.importMode = ["fidelity", "balanced", "simple"].includes(mode) ? mode : "fidelity";
    syncImportModeControls();
    if (els.importChoiceSummary) {
      els.importChoiceSummary.textContent = {
        fidelity: "高保真：尽量保留原图色块和高光，适合像素画。",
        balanced: "均衡：修复孤立杂色并保持线条清晰，适合大多数图片。",
        simple: "易制作：减少色号和局部变化，适合快速制作。"
      }[getImportMode()];
    }
    if (importWizard && state.importSession) {
      buildImportWizardPattern();
      renderImportWizardStep();
    }
  }

  function syncImportModeControls() {
    [
      ["importModeFidelityButton", "fidelity"],
      ["importModeBalancedButton", "balanced"],
      ["importModeSimpleButton", "simple"]
    ].forEach(([id, mode]) => {
      if (els[id]) els[id].classList.toggle("active", getImportMode() === mode);
    });
  }

  function getLockedColorSet() {
    return new Set(Array.isArray(state.beads.lockedColorCodes) ? state.beads.lockedColorCodes : []);
  }

  function isLockedColorCode(code) {
    return Boolean(code && getLockedColorSet().has(code));
  }

  function getCellNeighborCodes(cells, row, col) {
    return [
      cells[row - 1] && cells[row - 1][col],
      cells[row + 1] && cells[row + 1][col],
      cells[row] && cells[row][col - 1],
      cells[row] && cells[row][col + 1]
    ].filter(Boolean);
  }

  function analyzeLockedColorRoles(pattern) {
    if (!pattern || !pattern.cells) return { codes: [], roles: {} };
    const usage = calculateUsage(pattern);
    const total = Math.max(1, pattern.width * pattern.height);
    const backgroundCode = getLikelyBackgroundCode(pattern);
    const roles = {};
    const addRole = (code, role) => {
      if (!code) return;
      if (!roles[code]) roles[code] = new Set();
      roles[code].add(role);
    };

    const importance = analyzeColorImportance(pattern);
    importance
      .filter((item) => item.code !== backgroundCode && colorBrightness(item.color.rgb) <= 86)
      .sort((a, b) => b.edgeScore - a.edgeScore || b.count - a.count)
      .slice(0, 4)
      .forEach((item) => addRole(item.code, "轮廓"));

    const lightStats = new Map();
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        const code = pattern.cells[row][col];
        if (!code || code === backgroundCode) continue;
        const color = getPaletteColor(code);
        if (colorBrightness(color.rgb) < 220) continue;
        const neighbors = getNeighborCodes(pattern.cells, row, col);
        const nearDark = neighbors.some(isDarkOutlineCode);
        const enclosed = neighbors.filter((item) => item && item !== backgroundCode).length >= 3;
        if (!nearDark && !enclosed) continue;
        const item = lightStats.get(code) || { code, count: 0, nearDark: 0 };
        item.count += 1;
        if (nearDark) item.nearDark += 1;
        lightStats.set(code, item);
      }
    }
    Array.from(lightStats.values())
      .filter((item) => item.count <= Math.max(14, total * 0.035) || item.nearDark >= 1)
      .sort((a, b) => b.nearDark - a.nearDark || a.count - b.count)
      .slice(0, 3)
      .forEach((item) => addRole(item.code, "高光"));

    const roleMap = {};
    Object.keys(roles).forEach((code) => {
      roleMap[code] = Array.from(roles[code]);
    });
    return { codes: Object.keys(roleMap), roles: roleMap };
  }

  function updateLockedColorsFromPattern(pattern) {
    const analysis = analyzeLockedColorRoles(pattern);
    state.beads.lockedColorCodes = analysis.codes;
    state.beads.lockedColorRoles = analysis.roles;
    renderLockedColorSummary();
    return analysis;
  }

  function renderLockedColorSummary() {
    if (!els.lockedColorSummary) return;
    const codes = Array.isArray(state.beads.lockedColorCodes) ? state.beads.lockedColorCodes : [];
    if (!codes.length) {
      els.lockedColorSummary.textContent = "未识别锁定色";
      return;
    }
    const roles = state.beads.lockedColorRoles || {};
    els.lockedColorSummary.textContent = `已锁定 ${codes.length} 个色号：` + codes
      .map((code) => `${code}${roles[code] && roles[code].length ? `(${roles[code].join("/")})` : ""}`)
      .join("、");
  }

  function protectLockedCells(sourcePattern, targetPattern, lockedCodes) {
    if (!sourcePattern || !targetPattern || !lockedCodes || !lockedCodes.size) return targetPattern;
    const cells = cloneCells(targetPattern.cells);
    const height = Math.min(sourcePattern.height, targetPattern.height);
    const width = Math.min(sourcePattern.width, targetPattern.width);
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        const code = sourcePattern.cells[row][col];
        if (lockedCodes.has(code)) cells[row][col] = code;
      }
    }
    return Object.assign({}, targetPattern, { cells });
  }

  function reducePatternToColorLimit(pattern, limit, lockedCodes) {
    const target = clamp(limit || 28, 2, beadPalette.length);
    const locked = lockedCodes || new Set();
    const currentUsage = calculateUsage(pattern);
    if (currentUsage.length <= target) return pattern;
    const analysis = analyzeColorImportance(pattern).sort((a, b) => b.importance - a.importance);
    const colorStats = new Map(analysis.map((item) => [item.code, item]));
    const kept = [];
    locked.forEach((code) => {
      if (currentUsage.some((item) => item.code === code) && kept.length < target) kept.push(code);
    });
    const darkest = analysis
      .slice()
      .filter((item) => !kept.includes(item.code))
      .sort((a, b) => colorBrightness(a.color.rgb) - colorBrightness(b.color.rgb))
      .slice(0, Math.max(0, Math.min(3, target - kept.length)))
      .map((item) => item.code);
    [...darkest, ...analysis.map((item) => item.code)].forEach((code) => {
      if (kept.length < target && !kept.includes(code)) kept.push(code);
    });
    const keptSet = new Set(kept);
    const replacements = new Map();
    currentUsage.forEach((item) => {
      if (!keptSet.has(item.code) && !locked.has(item.code)) {
        replacements.set(item.code, getNearestKeptCode(item.code, kept, colorStats));
      }
    });
    if (!replacements.size) return pattern;
    const cells = cloneCells(pattern.cells);
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        const code = cells[row][col];
        if (replacements.has(code)) cells[row][col] = replacements.get(code);
      }
    }
    const smoothed = smoothOptimizedCells(cells, locked);
    return Object.assign({}, pattern, { cells: smoothed.cells });
  }

  function applyImportModeToPattern(rawPattern, mode) {
    const safeMode = ["fidelity", "balanced", "simple"].includes(mode) ? mode : getImportMode();
    const analysis = updateLockedColorsFromPattern(rawPattern);
    const locked = new Set(analysis.codes);
    if (safeMode === "fidelity") return rawPattern;
    const cleaned = protectLockedCells(rawPattern, cleanPixelArtPattern(rawPattern, locked), locked);
    if (safeMode === "balanced") return restorePixelArtDetails(cleaned);
    return reducePatternToColorLimit(restorePixelArtDetails(cleaned), 28, locked);
  }

  function analyzeColorImportance(pattern) {
    const usage = calculateUsage(pattern);
    const stats = new Map(usage.map((item) => [item.code, {
      code: item.code,
      color: item.color,
      count: item.count,
      edgeScore: 0,
      darkScore: Math.max(0, 180 - colorBrightness(item.color.rgb)),
      spread: 0,
      rows: new Set(),
      cols: new Set()
    }]));

    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        const code = pattern.cells[row][col];
        if (!code || !stats.has(code)) continue;
        const item = stats.get(code);
        item.rows.add(row);
        item.cols.add(col);
        getCellNeighborCodes(pattern.cells, row, col).forEach((neighbor) => {
          if (neighbor && neighbor !== code) item.edgeScore += 1;
        });
      }
    }

    return Array.from(stats.values()).map((item) => {
      item.spread = item.rows.size + item.cols.size;
      item.importance = item.count * 4 + item.edgeScore * 5 + item.darkScore * 1.6 + item.spread;
      return item;
    });
  }

  function getNearestKeptCode(code, keptCodes, colorStats) {
    const source = getPaletteColor(code);
    const sourceBrightness = colorBrightness(source.rgb);
    let best = keptCodes[0] || code;
    let bestScore = Infinity;
    keptCodes.forEach((targetCode) => {
      if (targetCode === code) return;
      const target = getPaletteColor(targetCode);
      const distance = labDistance(source.lab, target.lab);
      const brightnessPenalty = Math.abs(sourceBrightness - colorBrightness(target.rgb)) * 0.18;
      const targetImportance = colorStats.get(targetCode) ? colorStats.get(targetCode).importance : 0;
      const score = distance + brightnessPenalty - Math.min(18, targetImportance / 120);
      if (score < bestScore) {
        bestScore = score;
        best = targetCode;
      }
    });
    return best;
  }

  function smoothOptimizedCells(cells, lockedCodes) {
    const locked = lockedCodes || new Set();
    const next = cloneCells(cells);
    let changed = 0;
    for (let row = 1; row < cells.length - 1; row += 1) {
      for (let col = 1; col < cells[row].length - 1; col += 1) {
        const code = cells[row][col];
        if (!code) continue;
        if (locked.has(code)) continue;
        const counts = new Map();
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            const neighbor = cells[row + dy][col + dx];
            if (neighbor) counts.set(neighbor, (counts.get(neighbor) || 0) + 1);
          }
        }
        let dominant = "";
        let dominantCount = 0;
        counts.forEach((count, neighbor) => {
          if (count > dominantCount) {
            dominant = neighbor;
            dominantCount = count;
          }
        });
        if (dominant && dominant !== code && dominantCount >= 6 && !locked.has(dominant)) {
          next[row][col] = dominant;
          changed += 1;
        }
      }
    }
    return { cells: next, changed };
  }

  function countPatternCells(pattern) {
    return calculateUsage(pattern).reduce((sum, item) => sum + item.count, 0);
  }

  function loadInventory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(inventoryStorageKey) || "{}");
      state.inventory = parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      state.inventory = {};
    }
  }

  function saveInventory() {
    localStorage.setItem(inventoryStorageKey, JSON.stringify(state.inventory || {}));
  }

  function getInventoryStock(code) {
    return Math.max(0, Math.floor(Number(state.inventory && state.inventory[code] || 0)));
  }

  function analyzePatternQuality(pattern) {
    if (!pattern || !Array.isArray(pattern.cells)) return { colors: 0, total: 0, isolated: 0, rareColors: 0, outline: 0, locked: 0 };
    const usage = calculateUsage(pattern);
    let isolated = 0;
    let outline = 0;
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        const code = pattern.cells[row][col];
        if (!code) continue;
        if (isDarkOutlineCode(code)) outline += 1;
        const neighbors = getNeighborCodes(pattern.cells, row, col).filter(Boolean);
        if (neighbors.filter((neighbor) => neighbor === code).length === 0) isolated += 1;
      }
    }
    return {
      colors: usage.length,
      total: usage.reduce((sum, item) => sum + item.count, 0),
      isolated,
      rareColors: usage.filter((item) => item.count <= 2).length,
      outline,
      locked: getLockedColorSet().size
    };
  }

  function renderQualitySummary() {
    if (!els.qualitySummary) return;
    const result = analyzePatternQuality(state.beads.pattern);
    if (!result.total) {
      els.qualitySummary.textContent = "导入后可检查杂色、轮廓和高光。";
      return result;
    }
    els.qualitySummary.textContent = `图纸检查：${result.colors} 色 / ${result.total} 格 · 孤立格 ${result.isolated} · 低用量色 ${result.rareColors} · 轮廓格 ${result.outline} · 锁定色 ${result.locked}`;
    return result;
  }

  function renderBuildProgress() {
    if (!els.buildProgress) return;
    const total = countPatternCells(state.beads.pattern);
    const done = Object.keys(state.buildProgress || {}).length;
    els.buildProgress.textContent = `制作进度：${Math.min(done, total)} / ${total}（${total ? Math.round(Math.min(done, total) / total * 100) : 0}%）`;
    if (els.buildModeToggle) els.buildModeToggle.checked = Boolean(state.beads.buildMode);
  }

  function toggleBuildCell(cell) {
    if (!cell || !state.beads.pattern || !state.beads.pattern.cells[cell.row][cell.col]) return false;
    const key = `${cell.row}:${cell.col}`;
    if (state.buildProgress[key]) delete state.buildProgress[key];
    else state.buildProgress[key] = true;
    renderBuildProgress();
    markUnsavedChanges();
    return true;
  }

  function clearBuildProgress() {
    state.buildProgress = {};
    renderBuildProgress();
    markUnsavedChanges();
    render();
  }

  function exportMaterialsCsv() {
    const usage = calculateUsage(state.beads.pattern);
    if (!usage.length) {
      setMessage("请先生成图纸，再导出材料清单。", true);
      return;
    }
    const rows = [["色号", "名称", "所需数量", "已有库存", "缺少数量"]];
    usage.forEach((item) => {
      const stock = getInventoryStock(item.code);
      rows.push([item.code, item.color.name, item.count, stock, Math.max(0, item.count - stock)]);
    });
    const csv = "\ufeff" + rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.beads.projectTitle || "Q像素材料清单"}-材料清单.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("材料清单已导出。", false);
  }

  function openAiGenerateModal() {
    if (els.aiGenerateModal) els.aiGenerateModal.classList.remove("hidden");
    refreshAiProviderStatus();
    if (els.aiGenerateStatus) {
      els.aiGenerateStatus.textContent = "当前使用 Hugging Face 免费额度生成，Token 由本机服务安全保存。";
    }
  }

  function closeAiGenerateModal() {
    if (els.aiGenerateModal) els.aiGenerateModal.classList.add("hidden");
  }

  let pendingJimengDownload = null;
  let jimengDownloadPollTimer = 0;

  function clearPendingJimengDownload() {
    pendingJimengDownload = null;
    if (els.aiJimengPending) els.aiJimengPending.classList.add("hidden");
    if (els.aiJimengPendingName) els.aiJimengPendingName.textContent = "";
  }

  async function importPendingJimengDownload() {
    if (!pendingJimengDownload) return;
    const pending = pendingJimengDownload;
    const imported = await applyAiImageDataUrl(pending.imageDataUrl, pending.request);
    if (!imported) {
      if (els.aiGenerateStatus) els.aiGenerateStatus.textContent = "这张下载图片无法读取，请换一张图片。";
      return;
    }
    clearPendingJimengDownload();
    markUnsavedChanges();
    closeAiGenerateModal();
    showEditor();
    setMessage(`已导入即梦图片：${pending.name || "下载图片"}`, false);
  }

  function buildAiGenerationRequest() {
    return {
      prompt: (els.aiPromptInput && els.aiPromptInput.value || "").trim(),
      provider: els.aiProviderSelect ? els.aiProviderSelect.value : "huggingface",
      style: els.aiStyleSelect ? els.aiStyleSelect.value : "pixel",
      width: clamp(els.aiWidthInput && els.aiWidthInput.value || 48, 16, 128),
      height: clamp(els.aiHeightInput && els.aiHeightInput.value || 48, 16, 128),
      colorLimit: clamp(els.aiColorLimitInput && els.aiColorLimitInput.value || 20, 2, 64),
      target: "q-pixel-pattern",
      palette: "MARD-221"
    };
  }

  async function refreshAiProviderStatus() {
    if (!els.aiProviderBalances) return;
    const escapeHtml = (value) => String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[char]));
    try {
      const response = await fetch("/api/ai/status", { cache: "no-store" });
      const result = await response.json();
      const providers = result.providers || {};
      els.aiProviderBalances.innerHTML = Object.entries(providers).map(([key, item]) => {
        const active = els.aiProviderSelect && els.aiProviderSelect.value === key ? " active" : "";
        return `<div class="ai-provider-balance${active}"><strong>${escapeHtml(item.name || key)}</strong><span>${escapeHtml(item.balanceLabel || "额度状态未知")}</span><em class="${item.configured ? "ok" : "warn"}">${escapeHtml(item.configured ? "已配置" : "未配置")}</em></div>`;
      }).join("");
    } catch (error) {
      els.aiProviderBalances.textContent = "额度状态暂时无法读取，请检查本机服务。";
    }
  }

  async function startAiGeneration() {
    const request = buildAiGenerationRequest();
    if (!request.prompt) {
      if (els.aiGenerateStatus) els.aiGenerateStatus.textContent = "请先输入主题描述。";
      return;
    }
    if (els.aiGenerateButton) els.aiGenerateButton.disabled = true;
    if (els.aiGenerateStatus) els.aiGenerateStatus.textContent = "正在生成，请稍候...";
    try {
      const response = await fetch("/api/ai/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `AI 服务 ${response.status}`);
      if (!result || !result.imageDataUrl || !(await applyAiImageDataUrl(result.imageDataUrl, request))) throw new Error("返回内容不是有效图片");
      markUnsavedChanges();
      closeAiGenerateModal();
      showEditor();
      setMessage("GPT 像素图已生成，可继续校准、优化和编辑。", false);
    } catch (error) {
      if (els.aiGenerateStatus) els.aiGenerateStatus.textContent = `生成失败：${error.message || "服务不可用"}`;
    } finally {
      if (els.aiGenerateButton) els.aiGenerateButton.disabled = false;
    }
  }

  async function startJimengWebCollaboration() {
    const request = buildAiGenerationRequest();
    if (!request.prompt) {
      if (els.aiGenerateStatus) els.aiGenerateStatus.textContent = "请先输入主题描述。";
      return;
    }
    const startedAt = Date.now();
    const webPrompt = `${request.prompt}。请生成适合拼豆像素化的图片，主体居中，轮廓清晰，色块均匀，避免文字和水印。`;
    try {
      await navigator.clipboard.writeText(webPrompt);
    } catch {}
    window.open("https://jimeng.jianying.com/", "_blank", "noopener");
    if (els.aiJimengWebButton) els.aiJimengWebButton.disabled = true;
    if (els.aiGenerateStatus) els.aiGenerateStatus.textContent = "已打开即梦，提示词已复制。生成并下载图片后，Q像素会自动导入最新下载图片。";
    const poll = async () => {
      try {
        const response = await fetch(`/api/ai/latest-download?since=${startedAt}`, { cache: "no-store" });
        const result = await response.json();
        if (result && result.imageDataUrl) {
          pendingJimengDownload = { imageDataUrl: result.imageDataUrl, name: result.name, request };
          if (els.aiJimengPendingName) els.aiJimengPendingName.textContent = `检测到新下载图片：${result.name || "未命名图片"}`;
          if (els.aiJimengPending) els.aiJimengPending.classList.remove("hidden");
          if (els.aiGenerateStatus) els.aiGenerateStatus.textContent = "已发现新图片，请确认后再导入。";
          if (els.aiJimengWebButton) els.aiJimengWebButton.disabled = false;
          return;
        }
      } catch {}
      if (els.aiGenerateModal && !els.aiGenerateModal.classList.contains("hidden")) {
        window.setTimeout(poll, 2500);
      } else if (els.aiJimengWebButton) {
        els.aiJimengWebButton.disabled = false;
      }
    };
    window.setTimeout(poll, 2500);
  }

  function applyAiImageDataUrl(dataUrl, request) {
    return new Promise((resolve) => {
      if (!String(dataUrl || "").startsWith("data:image/")) {
        resolve(false);
        return;
      }
      const image = new Image();
      image.onload = () => {
        if (state.image && state.image.src && state.image.src.startsWith("blob:")) URL.revokeObjectURL(state.image.src);
        state.image = image;
        state.imageName = "GPT生成像素图";
        state.importCalibration = null;
        state.beads.width = request.width;
        state.beads.height = request.height;
        state.beads.pattern = null;
        state.beads.layers = [];
        state.beads.activeLayerId = "";
        state.beads.pixelSignature = "";
        state.beads.restorationFingerprint = "";
        state.beads.sourceCompareEnabled = true;
        state.beads.lockedColorCodes = [];
        state.beads.lockedColorRoles = {};
        state.buildProgress = {};
        setMode("beads");
        generateBeadsFromImage(false);
        state.beads.sourceCompareEnabled = true;
        renderImportSummary();
        render();
        resolve(true);
      };
      image.onerror = () => resolve(false);
      image.src = dataUrl;
    });
  }

  function renderUsage() {
    const usage = calculateUsage(state.beads.pattern);
    const total = usage.reduce((sum, item) => sum + item.count, 0);
    if (els.usageSummary) {
      els.usageSummary.textContent = usage.length
        ? `当前 ${usage.length} 种颜色，共 ${total} 颗；详细统计在底部色号栏。`
        : "导出前先预览图纸、色号统计和水印。";
    }
    if (els.usageList) {
      els.usageList.innerHTML = "";
      usage.forEach((item) => {
        const row = document.createElement("div");
        row.className = "usage-item";
        row.innerHTML = `
          <span class="usage-swatch"></span>
          <span class="usage-code"></span>
          <span class="usage-name"></span>
          <span class="usage-count"></span>
          <input class="usage-stock" type="number" min="0" inputmode="numeric" title="已有库存">
        `;
        row.querySelector(".usage-swatch").style.backgroundColor = item.color.hex;
        row.querySelector(".usage-code").textContent = item.code;
        row.querySelector(".usage-name").textContent = item.color.name;
        row.querySelector(".usage-count").textContent = `${item.count} 需`;
        const stockInput = row.querySelector(".usage-stock");
        stockInput.value = String(getInventoryStock(item.code));
        stockInput.addEventListener("change", () => {
          state.inventory[item.code] = Math.max(0, Math.floor(Number(stockInput.value || 0)));
          saveInventory();
          renderUsage();
        });
        els.usageList.appendChild(row);
      });
    }
    populateReplaceControls(usage);
    renderQualitySummary();
    renderBuildProgress();
  }

  function populatePaletteControls() {
    if (!els.paletteSelect || !els.paletteGrid) return;
    els.paletteSelect.innerHTML = "";
    els.paletteGrid.innerHTML = "";
    if (els.outlineColorSelect) els.outlineColorSelect.innerHTML = "";
    if (els.cellTargetSelect) els.cellTargetSelect.innerHTML = "";
    if (els.cellTargetPaletteGrid) els.cellTargetPaletteGrid.innerHTML = "";
    if (els.floatingPaletteGrid) els.floatingPaletteGrid.innerHTML = "";
    if (els.selectionColorTargetPaletteGrid) els.selectionColorTargetPaletteGrid.innerHTML = "";
    beadPalette.forEach((color) => {
      const option = document.createElement("option");
      option.value = color.code;
      option.textContent = `${color.code} ${color.name}`;
      els.paletteSelect.appendChild(option);
      if (els.outlineColorSelect) els.outlineColorSelect.appendChild(option.cloneNode(true));
      if (els.cellTargetSelect) els.cellTargetSelect.appendChild(option.cloneNode(true));
      if (els.selectionColorTargetSelect) els.selectionColorTargetSelect.appendChild(option.cloneNode(true));

      els.paletteGrid.appendChild(makeSwatchButton(color));
      if (els.floatingPaletteGrid) els.floatingPaletteGrid.appendChild(makeSwatchButton(color));
      if (els.cellTargetPaletteGrid) els.cellTargetPaletteGrid.appendChild(makeTargetSwatchButton(color, els.cellTargetSelect));
      if (els.selectionColorTargetPaletteGrid) els.selectionColorTargetPaletteGrid.appendChild(makeTargetSwatchButton(color, els.selectionColorTargetSelect, { selectMainColor: true }));
    });
    els.paletteSelect.value = state.beads.selectedCode;
    if (els.outlineColorSelect) els.outlineColorSelect.value = state.beads.outlineCode || state.beads.selectedCode;
    if (els.cellTargetSelect) els.cellTargetSelect.value = state.beads.selectedCode;
    if (els.selectionColorTargetSelect) els.selectionColorTargetSelect.value = state.beads.selectedCode;
    updateTargetPaletteActiveState();
  }

  function getStyleBackgroundMaterial(type) {
    return styleBackgroundMaterials.find((item) => item.value === type) || null;
  }

  function populateMaterialBackgroundSelect() {
    if (!els.materialBackgroundSelect) return;
    const previous = els.materialBackgroundSelect.value || "felt";
    els.materialBackgroundSelect.innerHTML = "";
    styleBackgroundMaterialGroups.forEach((group) => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = group.label;
      group.items.forEach((material) => {
        const option = document.createElement("option");
        option.value = material.value;
        option.textContent = material.label;
        optgroup.appendChild(option);
      });
      els.materialBackgroundSelect.appendChild(optgroup);
    });
    const customGroup = document.createElement("optgroup");
    customGroup.label = "纯色/自定义";
    [
      ["plain", "纯色"],
      ["custom", "自定义图片"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      customGroup.appendChild(option);
    });
    els.materialBackgroundSelect.appendChild(customGroup);
    const available = new Set([...styleBackgroundMaterials.map((item) => item.value), "plain", "custom"]);
    els.materialBackgroundSelect.value = available.has(previous) ? previous : "felt";
  }

  function selectBeadColor(code, options = {}) {
    if (!code || !beadPalette.some((color) => color.code === code)) return false;
    state.beads.selectedCode = code;
    state.beads.outlineCode = state.beads.outlineCode || code;
    if (options.tool !== false) state.beads.editTool = "brush";
    if (options.showBrushOptions !== true) state.beads.toolOptionsHiddenFor = "brush";
    if (options.remember !== false) rememberRecentCode(code);
    syncBeadControls();
    render();
    return true;
  }

  function rememberRecentCode(code) {
    if (!code) return;
    const list = [code, ...(state.beads.recentCodes || []).filter((item) => item !== code)];
    state.beads.recentCodes = list.slice(0, 6);
  }

  function renderRecentColorStack() {
    if (!els.recentColorStack) return;
    const recent = (state.beads.recentCodes && state.beads.recentCodes.length ? state.beads.recentCodes : [state.beads.selectedCode]).slice(0, 6);
    els.recentColorStack.innerHTML = "";
    recent.forEach((code) => {
      const color = getPaletteColor(code);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "recent-color-chip";
      chip.dataset.code = code;
      chip.title = `选择 ${code} ${color.name}`;
      chip.innerHTML = `<span></span><strong>${code}</strong>`;
      chip.querySelector("span").style.backgroundColor = color.hex;
      chip.classList.toggle("active", code === state.beads.selectedCode);
      chip.addEventListener("click", () => selectBeadColor(code));
      els.recentColorStack.appendChild(chip);
    });
  }

  function makeSwatchButton(color) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch-button";
    button.dataset.code = color.code;
    button.title = `${color.code} ${color.name}`;
    button.style.backgroundColor = color.hex;
    if (colorBrightness(color.rgb) < 130) button.classList.add("dark-label");
    button.addEventListener("click", () => {
      selectBeadColor(color.code);
    });
    return button;
  }

  function makeTargetSwatchButton(color, selectEl, options = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch-button target-swatch-button";
    button.dataset.code = color.code;
    button.title = `${color.code} ${color.name}`;
    button.style.backgroundColor = color.hex;
    if (colorBrightness(color.rgb) < 130) button.classList.add("dark-label");
    button.innerHTML = `<strong>${color.code}</strong>`;
    button.addEventListener("click", () => {
      if (selectEl) selectEl.value = color.code;
      if (options.selectMainColor) selectBeadColor(color.code, { showBrushOptions: false });
      else updateTargetPaletteActiveState();
    });
    return button;
  }

  function updatePaletteActiveState() {
    const buttons = [
      ...(els.paletteGrid ? Array.from(els.paletteGrid.querySelectorAll(".swatch-button")) : []),
      ...(els.floatingPaletteGrid ? Array.from(els.floatingPaletteGrid.querySelectorAll(".swatch-button")) : [])
    ];
    buttons.forEach((button) => {
      button.classList.toggle("active", button.dataset.code === state.beads.selectedCode);
    });
    updateTargetPaletteActiveState();
  }

  function updateTargetPaletteActiveState() {
    [
      [els.cellTargetPaletteGrid, els.cellTargetSelect && els.cellTargetSelect.value],
      [els.selectionColorTargetPaletteGrid, els.selectionColorTargetSelect && els.selectionColorTargetSelect.value]
    ].forEach(([grid, value]) => {
      if (!grid) return;
      Array.from(grid.querySelectorAll(".target-swatch-button")).forEach((button) => {
        button.classList.toggle("active", button.dataset.code === value);
      });
    });
  }

  function renderColorStrip() {
    if (!els.colorStrip || !els.colorStripContent) return;
    els.colorStrip.classList.toggle("collapsed", Boolean(state.beads.colorStripCollapsed));
    const usage = calculateUsage(state.beads.pattern);
    els.colorStripToggle.textContent = state.beads.colorStripCollapsed
      ? `展开${usage.length ? ` · ${usage.length}色` : ""}`
      : `收起${usage.length ? ` · ${usage.length}色` : ""}`;
    els.colorStripContent.innerHTML = "";
    usage.forEach((item) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "strip-chip";
      chip.innerHTML = `<span></span><strong>${item.code}<small>${item.count}</small></strong>`;
      chip.querySelector("span").style.backgroundColor = item.color.hex;
      chip.addEventListener("click", () => {
        selectBeadColor(item.code);
        showCellInfo({ row: 0, col: 0 }, item.code);
      });
      els.colorStripContent.appendChild(chip);
    });
  }

  function populateReplaceControls(usage) {
    if (!els.replaceFromSelect || !els.replaceToSelect) return;
    const previousFrom = state.beads.replaceFrom;
    const previousTo = state.beads.replaceTo;
    els.replaceFromSelect.innerHTML = "";
    if (!usage.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "无已用色号";
      els.replaceFromSelect.appendChild(option);
    } else {
      usage.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.code;
        option.textContent = `${item.code} ${item.color.name}`;
        els.replaceFromSelect.appendChild(option);
      });
    }

    els.replaceToSelect.innerHTML = "";
    beadPalette.forEach((color) => {
      const option = document.createElement("option");
      option.value = color.code;
      option.textContent = `${color.code} ${color.name}`;
      els.replaceToSelect.appendChild(option);
    });

    const usedCodes = new Set(usage.map((item) => item.code));
    state.beads.replaceFrom = usedCodes.has(previousFrom) ? previousFrom : (usage[0] && usage[0].code) || "";
    state.beads.replaceTo = beadPalette.some((color) => color.code === previousTo) ? previousTo : beadPalette[0].code;
    els.replaceFromSelect.value = state.beads.replaceFrom;
    els.replaceToSelect.value = state.beads.replaceTo;
  }

  function showEmptyState(title, description) {
    if (!els.emptyState) return;
    els.emptyTitle.textContent = title;
    els.emptyDescription.textContent = description;
    els.emptyState.classList.remove("hidden");
  }

  function hideEmptyState() {
    if (els.emptyState) els.emptyState.classList.add("hidden");
  }

  function render() {
    if (!els.previewCanvas) return;
    if (state.mode === "beads") {
      renderBeadMode();
    } else {
      renderPixelMode();
    }
  }

  function updateParam(key, value) {
    state.params[key] = value;
    render();
  }

  function updateBeadSize(key, value) {
    const next = clamp(value, bounds.beadSize.min, bounds.beadSize.max);
    state.beads[key] = next;
    if (state.beads.lockRatio) applyAspectLock(key);
    syncBeadControls();
    render();
  }

  function getSourceAspect() {
    if (state.image) {
      return (state.image.naturalWidth || state.image.width) / (state.image.naturalHeight || state.image.height);
    }
    if (state.beads.pattern) return state.beads.pattern.width / state.beads.pattern.height;
    return 1;
  }

  function applyAspectLock(changedKey) {
    const aspect = getSourceAspect();
    if (!Number.isFinite(aspect) || aspect <= 0) return;
    if (changedKey === "width") {
      state.beads.height = clamp(state.beads.width / aspect, bounds.beadSize.min, bounds.beadSize.max);
    } else {
      state.beads.width = clamp(state.beads.height * aspect, bounds.beadSize.min, bounds.beadSize.max);
    }
  }

  function openFileDialog() {
    els.fileInput.click();
  }

  function loadFile(file, options = {}) {
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      setMessage("请选择图片文件。", true);
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      state.importSession = {
        file,
        image: img,
        url,
        name: file.name || "未命名图片",
        mode: options.mode || "main"
      };
      openImportChoiceModal();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setMessage("图片读取失败，请换一张图片。", true);
    };
    img.src = url;
  }

  function closeImportChoiceModal() {
    if (els.importChoiceModal) els.importChoiceModal.classList.add("hidden");
  }

  function closeCalibrationModal() {
    if (els.calibrationModal) els.calibrationModal.classList.add("hidden");
  }

  function buildImportWizardPattern() {
    if (!importWizard || !state.importSession) return null;
    const session = state.importSession;
    const sourceWidth = session.image.naturalWidth || session.image.width;
    const sourceHeight = session.image.naturalHeight || session.image.height;
    const rawPattern = state.importCalibration && state.importCalibration.enabled
      ? createPatternFromSourceWithCalibration(session.image, state.importCalibration, session.name, { clean: false })
      : createPatternFromSource(session.image, state.beads.width || 48, state.beads.height || 48, session.name, { clean: false });
    const pattern = applyImportModeToPattern(rawPattern, getImportMode());
    importWizard.rawPattern = rawPattern;
    importWizard.pattern = pattern;
    importWizard.sourceWidth = sourceWidth;
    importWizard.sourceHeight = sourceHeight;
    return pattern;
  }

  function drawWizardPreviewCanvas(canvas, image, pattern) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fbf7f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (image) {
      const iw = image.naturalWidth || image.width;
      const ih = image.naturalHeight || image.height;
      const scale = Math.min(canvas.width / iw, canvas.height / ih);
      const width = iw * scale;
      const height = ih * scale;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    }
    if (pattern) {
      const cell = Math.max(1, Math.min((canvas.width - 12) / pattern.width, (canvas.height - 12) / pattern.height));
      const x = (canvas.width - pattern.width * cell) / 2;
      const y = (canvas.height - pattern.height * cell) / 2;
      drawPatternGrid(ctx, pattern, x, y, cell, { showCodes: false, showGrid: true, showCenterLines: false, pixelStyle: "solid-square" });
    }
  }

  function renderImportWizardStep() {
    if (!importWizard) return;
    const step = importWizard.step;
    [1, 2, 3, 4].forEach((number) => {
      const panel = els[`importWizardStep${number}`];
      if (panel) panel.classList.toggle("hidden", step !== number);
      const indicator = document.querySelector(`[data-wizard-step="${number}"]`);
      if (indicator) indicator.classList.toggle("active", step === number);
    });
    if (step === 3 && els.importWizardColorSummary) {
      const pattern = importWizard.pattern || buildImportWizardPattern();
      const colors = pattern ? countPatternColors(pattern) : 0;
      els.importWizardColorSummary.textContent = pattern
        ? `当前图纸 ${pattern.width} x ${pattern.height} 格，${colors} 种色号。轮廓和高光会优先保护。`
        : "等待生成临时图纸。";
    }
    const sourceImage = state.importSession && state.importSession.image;
    const currentPattern = importWizard.pattern || (step === 1 ? buildImportWizardPattern() : null);
    drawWizardPreviewCanvas(els.importWizardOriginalCanvas, sourceImage, null);
    drawWizardPreviewCanvas(els.importWizardPatternCanvas, null, currentPattern);
    drawWizardPreviewCanvas(els.importWizardFinalOriginalCanvas, sourceImage, null);
    drawWizardPreviewCanvas(els.importWizardFinalPatternCanvas, null, importWizard.pattern);
    if (step === 4 && els.importWizardFinalSummary) {
      const pattern = importWizard.pattern;
      const raw = importWizard.rawPattern;
      const colors = pattern ? countPatternColors(pattern) : 0;
      const rawColors = raw ? countPatternColors(raw) : colors;
      const changed = pattern && raw ? countPatternDifferences(raw, pattern) : 0;
      els.importWizardFinalSummary.textContent = pattern
        ? `最终图纸 ${pattern.width} x ${pattern.height} 格 · 色号 ${colors} 种（原始 ${rawColors} 种）· 变化 ${changed} 格 · 可返回调整，确认后才应用。`
        : "最终图纸预览和统计将在这里显示。";
    }
  }

  function countPatternDifferences(left, right) {
    if (!left || !right) return 0;
    let changed = 0;
    const height = Math.max(left.height || 0, right.height || 0);
    const width = Math.max(left.width || 0, right.width || 0);
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        if ((left.cells[row] && left.cells[row][col]) !== (right.cells[row] && right.cells[row][col])) changed += 1;
      }
    }
    return changed;
  }

  function startImportWizard() {
    importWizard = {
      step: 1,
      rawPattern: null,
      pattern: null,
      previousLockedColorCodes: Array.isArray(state.beads.lockedColorCodes) ? state.beads.lockedColorCodes.slice() : [],
      previousLockedColorRoles: Object.assign({}, state.beads.lockedColorRoles || {})
    };
    state.importCalibration = null;
    setImportMode(getImportMode());
    renderImportWizardStep();
  }

  function wizardOpenCalibration() {
    if (!state.importSession) return;
    importWizard.step = 2;
    const width = state.importSession.image.naturalWidth || state.importSession.image.width;
    const height = state.importSession.image.naturalHeight || state.importSession.image.height;
    state.importCalibration = makeDefaultCalibration(width, height, estimatePixelArtGrid(state.importSession.image));
    renderImportWizardStep();
    if (els.importChoiceModal) els.importChoiceModal.classList.add("hidden");
    if (els.calibrationModal) els.calibrationModal.classList.remove("hidden");
    syncCalibrationInputs();
    renderCalibrationCanvas();
  }

  function wizardSkipCalibration() {
    state.importCalibration = null;
    buildImportWizardPattern();
    importWizard.step = 3;
    renderImportWizardStep();
  }

  function wizardUseDirect() {
    wizardSkipCalibration();
  }

  function wizardOptimizeColors() {
    const pattern = importWizard && (importWizard.pattern || buildImportWizardPattern());
    if (!pattern) return;
    const analysis = analyzeLockedColorRoles(pattern);
    const locked = new Set(analysis.codes);
    state.beads.lockedColorCodes = analysis.codes;
    state.beads.lockedColorRoles = analysis.roles;
    const limit = clamp(els.importWizardColorLimitInput && els.importWizardColorLimitInput.value, 2, beadPalette.length);
    importWizard.pattern = reducePatternToColorLimit(pattern, limit, locked);
    importWizard.step = 4;
    renderImportWizardStep();
  }

  function wizardKeepColors() {
    if (!importWizard || !importWizard.pattern) buildImportWizardPattern();
    importWizard.step = 4;
    renderImportWizardStep();
  }

  function applyWizardImport() {
    const session = state.importSession;
    const pattern = importWizard && importWizard.pattern;
    if (!session || !pattern) return;
    if (state.image && state.image !== session.image && state.image.src && state.image.src.startsWith("blob:")) URL.revokeObjectURL(state.image.src);
    state.image = session.image;
    state.imageName = session.name;
    state.beads.width = pattern.width;
    state.beads.height = pattern.height;
    state.beads.pattern = pattern;
    state.beads.layers = [];
    state.beads.activeLayerId = "";
    state.beads.sourceLabel = session.name;
    state.beads.pixelSignature = "";
    state.beads.restorationFingerprint = "";
    state.beads.sourceCompareEnabled = true;
    ensureLayers();
    clearHistory();
    if (els.imageStatus) els.imageStatus.textContent = session.name;
    setMode("beads");
    setMessage(`已应用${getImportModeLabel()}导入结果：${pattern.width} x ${pattern.height} 图纸。`, false);
    renderImportSummary();
    markUnsavedChanges();
    state.importSession = null;
    importWizard = null;
    closeImportChoiceModal();
    closeCalibrationModal();
  }

  function cancelImportSession() {
    if (state.importSession && state.importSession.url) URL.revokeObjectURL(state.importSession.url);
    if (recalibrationSession) {
      state.importCalibration = previousCalibrationBeforeRecalibration;
      previousCalibrationBeforeRecalibration = null;
      recalibrationSession = false;
    } else {
      state.importCalibration = null;
    }
    state.importSession = null;
    if (importWizard) {
      state.beads.lockedColorCodes = importWizard.previousLockedColorCodes || [];
      state.beads.lockedColorRoles = importWizard.previousLockedColorRoles || {};
      renderLockedColorSummary();
    }
    importWizard = null;
    closeImportChoiceModal();
    closeCalibrationModal();
  }

  function openImportChoiceModal() {
    if (!state.importSession) return;
    if (!importWizard) startImportWizard();
    if (els.importChoiceFileName) els.importChoiceFileName.textContent = state.importSession.name;
    if (els.importChoiceModal) els.importChoiceModal.classList.remove("hidden");
    renderImportWizardStep();
  }

  function importImageElementAsLayer(image, name) {
    if (!ensurePatternForCanvasEdit()) {
      setMessage("请先生成图纸或可编辑像素画，再导入图层。", true);
      return false;
    }
    const pattern = createPatternFromSource(image, state.beads.pattern.width, state.beads.pattern.height, name || "导入图片图层");
    pushHistory();
    const layer = makeLayer(name || "导入图片", pattern.cells, true, false, "");
    state.beads.layers.push(layer);
    state.beads.activeLayerId = layer.id;
    syncCompositePattern();
    render();
    setMessage("图片已作为新图层导入。", false);
    return true;
  }

  function applyImportedImageDirectly() {
    const session = state.importSession;
    if (!session) return;
    closeImportChoiceModal();
    if (session.mode === "layer") {
      importImageElementAsLayer(session.image, session.name);
      URL.revokeObjectURL(session.url);
      state.importSession = null;
      return;
    }
    if (state.image !== session.image && state.image && state.image.src && state.image.src.startsWith("blob:")) {
      URL.revokeObjectURL(state.image.src);
    }
    state.image = session.image;
    state.imageName = session.name;
    state.importCalibration = null;
    state.beads.pattern = null;
    state.beads.layers = [];
    state.beads.activeLayerId = "";
    state.beads.pixelSignature = "";
    state.beads.restorationFingerprint = "";
    state.beads.sourceCompareEnabled = false;
    state.beads.lockedColorCodes = [];
    state.beads.lockedColorRoles = {};
    state.view.zoom = 1;
    state.view.panX = 0;
    state.view.panY = 0;
    const gridEstimate = estimatePixelArtGrid(session.image);
    if (gridEstimate) {
      state.beads.width = gridEstimate.width;
      state.beads.height = gridEstimate.height;
    }
    if (els.imageStatus) els.imageStatus.textContent = state.imageName;
    setMessage(gridEstimate ? `已按图片自动匹配 ${gridEstimate.width} x ${gridEstimate.height} 像素精度。` : "图片已载入，可调节参数。", false);
    if (state.mode === "beads") {
      generateBeadsFromImage(false);
    } else {
      syncBeadControls();
      render();
    }
    state.beads.sourceCompareEnabled = true;
    renderImportSummary();
    markUnsavedChanges();
    state.importSession = null;
  }

  function openCalibrationModal() {
    const session = state.importSession;
    if (!session) return;
    closeImportChoiceModal();
    const width = session.image.naturalWidth || session.image.width;
    const height = session.image.naturalHeight || session.image.height;
    if (!state.importCalibration || !state.importCalibration.enabled) {
      state.importCalibration = makeDefaultCalibration(width, height, estimatePixelArtGrid(session.image));
    }
    syncCalibrationInputs();
    if (els.calibrationModal) els.calibrationModal.classList.remove("hidden");
    renderCalibrationCanvas();
  }

  function openCalibrationForCurrentImage() {
    if (!state.image) {
      setMessage("当前没有可重新校准的原图。", true);
      return;
    }
    const width = state.image.naturalWidth || state.image.width;
    const height = state.image.naturalHeight || state.image.height;
    previousCalibrationBeforeRecalibration = state.importCalibration && state.importCalibration.enabled
      ? Object.assign({}, state.importCalibration)
      : null;
    recalibrationSession = true;
    state.importSession = {
      image: state.image,
      url: "",
      name: state.imageName || "当前图片",
      mode: "main"
    };
    state.importCalibration = state.importCalibration && state.importCalibration.enabled
      ? Object.assign({}, state.importCalibration)
      : makeDefaultCalibration(width, height, estimatePixelArtGrid(state.image));
    syncCalibrationInputs();
    if (els.calibrationModal) els.calibrationModal.classList.remove("hidden");
    renderCalibrationCanvas();
  }

  function syncCalibrationInputs() {
    const session = state.importSession;
    if (!session || !state.importCalibration) return;
    const width = session.image.naturalWidth || session.image.width;
    const height = session.image.naturalHeight || session.image.height;
    state.importCalibration = normalizeCalibration(state.importCalibration, width, height);
    if (els.calibrationColumnsInput) els.calibrationColumnsInput.value = String(state.importCalibration.columns);
    if (els.calibrationCellSizeInput) els.calibrationCellSizeInput.value = String(state.importCalibration.cellSize);
  }

  function updateCalibrationColumns(value) {
    const session = state.importSession;
    if (!session || !state.importCalibration) return;
    const width = session.image.naturalWidth || session.image.width;
    const height = session.image.naturalHeight || session.image.height;
    const nextColumns = clamp(value, 1, bounds.beadSize.max);
    state.importCalibration.columns = nextColumns;
    state.importCalibration.cellSize = Number(Math.max(1, width / nextColumns).toFixed(2));
    state.importCalibration = normalizeCalibration(state.importCalibration, width, height);
    syncCalibrationInputs();
    renderCalibrationCanvas();
  }

  function updateCalibrationCellSize(value) {
    const session = state.importSession;
    if (!session || !state.importCalibration) return;
    const width = session.image.naturalWidth || session.image.width;
    const height = session.image.naturalHeight || session.image.height;
    state.importCalibration.cellSize = Math.max(1, Math.min(200, Number(value) || state.importCalibration.cellSize));
    state.importCalibration = normalizeCalibration(state.importCalibration, width, height);
    syncCalibrationInputs();
    renderCalibrationCanvas();
  }

  function nudgeCalibration(dx, dy, event) {
    const session = state.importSession;
    if (!session || !state.importCalibration) return;
    const step = event && event.shiftKey ? 5 : 1;
    state.importCalibration.offsetX += dx * step;
    state.importCalibration.offsetY += dy * step;
    const width = session.image.naturalWidth || session.image.width;
    const height = session.image.naturalHeight || session.image.height;
    state.importCalibration = normalizeCalibration(state.importCalibration, width, height);
    renderCalibrationCanvas();
  }

  function getCalibrationFit(canvas, image) {
    const padding = 28;
    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;
    const scale = Math.min((canvas.width - padding * 2) / imageWidth, (canvas.height - padding * 2) / imageHeight);
    const width = imageWidth * scale;
    const height = imageHeight * scale;
    return { x: (canvas.width - width) / 2, y: (canvas.height - height) / 2, width, height, scale };
  }

  function renderCalibrationCanvas() {
    const session = state.importSession;
    if (!session || !els.calibrationCanvas || !state.importCalibration) return;
    const canvas = els.calibrationCanvas;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.max(600, Math.round((rect.width || 900) * dpr));
    canvas.height = Math.max(420, Math.round((rect.height || 640) * dpr));
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fbf4ea";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const fit = getCalibrationFit(canvas, session.image);
    ctx.drawImage(session.image, fit.x, fit.y, fit.width, fit.height);
    const grid = state.importCalibration;
    const cell = grid.cellSize * fit.scale;
    const x0 = fit.x + grid.offsetX * fit.scale;
    const y0 = fit.y + grid.offsetY * fit.scale;
    ctx.save();
    ctx.beginPath();
    ctx.rect(fit.x, fit.y, fit.width, fit.height);
    ctx.clip();
    ctx.strokeStyle = "rgba(23, 32, 51, .36)";
    ctx.lineWidth = Math.max(1, fit.scale * 0.45);
    for (let col = 0; col <= grid.columns; col += 1) {
      const x = x0 + col * cell;
      ctx.beginPath();
      ctx.moveTo(x, fit.y);
      ctx.lineTo(x, fit.y + fit.height);
      ctx.stroke();
    }
    for (let row = 0; row <= grid.rows; row += 1) {
      const y = y0 + row * cell;
      ctx.beginPath();
      ctx.moveTo(fit.x, y);
      ctx.lineTo(fit.x + fit.width, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(230, 68, 68, .78)";
    ctx.lineWidth = Math.max(1.5, fit.scale);
    const centerX = x0 + Math.floor(grid.columns / 2) * cell;
    const centerY = y0 + Math.floor(grid.rows / 2) * cell;
    ctx.beginPath();
    ctx.moveTo(centerX, fit.y);
    ctx.lineTo(centerX, fit.y + fit.height);
    ctx.moveTo(centerX + cell, fit.y);
    ctx.lineTo(centerX + cell, fit.y + fit.height);
    ctx.moveTo(fit.x, centerY);
    ctx.lineTo(fit.x + fit.width, centerY);
    ctx.moveTo(fit.x, centerY + cell);
    ctx.lineTo(fit.x + fit.width, centerY + cell);
    ctx.stroke();
    ctx.restore();
  }

  function completeCalibrationImport() {
    const session = state.importSession;
    if (!session || !state.importCalibration) return;
    const rawPattern = createPatternFromSourceWithCalibration(session.image, state.importCalibration, session.name, { clean: false });
    if (importWizard) {
      importWizard.rawPattern = rawPattern;
      importWizard.pattern = applyImportModeToPattern(rawPattern, getImportMode());
      closeCalibrationModal();
      importWizard.step = 3;
      if (els.importChoiceModal) els.importChoiceModal.classList.remove("hidden");
      renderImportWizardStep();
      return;
    }
    const pattern = session.mode === "layer" ? cleanPixelArtPattern(rawPattern) : applyImportModeToPattern(rawPattern, getImportMode());
    closeCalibrationModal();
    closeImportChoiceModal();
    if (session.mode === "layer") {
      if (!ensurePatternForCanvasEdit()) {
        setMessage("请先生成图纸或可编辑像素画，再导入图层。", true);
        URL.revokeObjectURL(session.url);
        state.importSession = null;
        state.importCalibration = null;
        recalibrationSession = false;
        previousCalibrationBeforeRecalibration = null;
        return;
      }
      const placed = placeSourceCellsIntoCurrentPattern(pattern.cells, pattern.width, pattern.height);
      if (!placed.count) {
        setMessage("校准图片尺寸与当前画布没有重叠区域，无法作为图层导入。", true);
        URL.revokeObjectURL(session.url);
        state.importSession = null;
        state.importCalibration = null;
        recalibrationSession = false;
        previousCalibrationBeforeRecalibration = null;
        return;
      }
      pushHistory();
      const layer = makeLayer(session.name || "校准图片", placed.cells, true, false, "");
      state.beads.layers.push(layer);
      state.beads.activeLayerId = layer.id;
      syncCompositePattern();
      render();
      setMessage("校准图片已作为新图层导入。", false);
      URL.revokeObjectURL(session.url);
      state.importSession = null;
      state.importCalibration = null;
      recalibrationSession = false;
      previousCalibrationBeforeRecalibration = null;
      return;
    }
    if (state.image !== session.image && state.image && state.image.src && state.image.src.startsWith("blob:")) {
      URL.revokeObjectURL(state.image.src);
    }
    state.image = session.image;
    state.imageName = session.name;
    state.importCalibration = Object.assign({}, state.importCalibration);
    state.beads.width = pattern.width;
    state.beads.height = pattern.height;
    state.beads.pattern = pattern;
    state.beads.layers = [];
    state.beads.activeLayerId = "";
    state.beads.sourceLabel = session.name;
    state.beads.pixelSignature = "";
    state.beads.restorationFingerprint = "";
    state.beads.sourceCompareEnabled = true;
    ensureLayers();
    clearHistory();
    if (els.imageStatus) els.imageStatus.textContent = session.name;
    setMode("beads");
    setMessage(`已按校准网格和${getImportModeLabel()}模式生成 ${pattern.width} x ${pattern.height} 图纸。`, false);
    renderImportSummary();
    markUnsavedChanges();
    state.importSession = null;
    recalibrationSession = false;
    previousCalibrationBeforeRecalibration = null;
  }

  function formatStamp(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join("") + "-" + [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join("");
  }

  function makePixelExportCanvas(overrideParams) {
    if (!state.image) return null;
    const imageWidth = state.image.naturalWidth || state.image.width;
    const imageHeight = state.image.naturalHeight || state.image.height;
    const maxSide = 1800;
    const scale = Math.min(1, maxSide / Math.max(imageWidth, imageHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(imageWidth * scale));
    canvas.height = Math.max(1, Math.round(imageHeight * scale));
    const params = overrideParams || state.params;
    renderPixelatedToCanvas(canvas, state.image, params, { fillCanvas: true, outputScale: scale });
    return canvas;
  }

  function generateBeadsFromImage(showSuccess) {
    if (!state.image) {
      setMessage("请先选择图片。", true);
      return null;
    }
    const params = clampBeadParams(state.beads);
    state.beads.width = params.width;
    state.beads.height = params.height;
    if (state.importCalibration && state.importCalibration.enabled) {
      const sourceWidth = state.image.naturalWidth || state.image.width;
      const sourceHeight = state.image.naturalHeight || state.image.height;
      const currentCalibration = normalizeCalibration(state.importCalibration, sourceWidth, sourceHeight);
      if (params.width !== currentCalibration.columns || params.height !== currentCalibration.rows) {
        const cellSize = Math.max(1, Math.min(sourceWidth / params.width, sourceHeight / params.height));
        state.importCalibration = normalizeCalibration({
          enabled: true,
          offsetX: currentCalibration.offsetX,
          offsetY: currentCalibration.offsetY,
          columns: params.width,
          cellSize
        }, sourceWidth, sourceHeight);
      } else {
        state.importCalibration = currentCalibration;
      }
    }
    const rawPattern = state.importCalibration
      ? createPatternFromSourceWithCalibration(state.image, state.importCalibration, state.imageName, { clean: false })
      : createPatternFromSource(state.image, params.width, params.height, state.imageName, { clean: false });
    const pattern = applyImportModeToPattern(rawPattern, getImportMode());
    state.beads.pattern = pattern;
    state.beads.layers = [];
    state.beads.activeLayerId = "";
    ensureLayers();
    state.beads.sourceLabel = state.imageName;
    state.beads.pixelSignature = "";
    state.view.zoom = 1;
    state.view.panX = 0;
    state.view.panY = 0;
    clearHistory();
    state.beads.sourceCompareEnabled = true;
    renderImportSummary();
    markUnsavedChanges();
    if (showSuccess !== false) setMessage(`拼豆图纸已按${getImportModeLabel()}模式生成。`, false);
    render();
    return pattern;
  }

  function generateBeadsFromPixel() {
    if (!state.image) {
      setMessage("请先在像素画模式选择图片。", true);
      return null;
    }
    const pattern = ensurePixelEditablePattern(false);
    if (!pattern) {
      setMessage("像素画结果生成失败。", true);
      return null;
    }
    state.view.zoom = 1;
    state.view.panX = 0;
    state.view.panY = 0;
    setMode("beads");
    setMessage(`已按像素画网格生成 ${pattern.width} x ${pattern.height} 的拼豆图纸。`, false);
    return pattern;
  }

  function setPatternCell(row, col, code, pattern) {
    const target = pattern || state.beads.pattern;
    if (!target || row < 0 || col < 0 || row >= target.height || col >= target.width) return false;
    target.cells[row][col] = code;
    return true;
  }

  function cloneCells(cells) {
    return cells.map((row) => row.slice());
  }

  function pushHistory() {
    if (!state.beads.pattern) return;
    ensureLayers();
    state.beads.undoStack.push(cloneLayerState());
    if (state.beads.undoStack.length > 80) state.beads.undoStack.shift();
    state.beads.redoStack = [];
    updateHistoryButtons();
    markUnsavedChanges();
  }

  function undoEdit() {
    if (!state.beads.pattern || !state.beads.undoStack.length) return;
    state.beads.redoStack.push(cloneLayerState());
    const snapshot = state.beads.undoStack.pop();
    if (!restoreLayerState(snapshot)) state.beads.pattern.cells = snapshot;
    state.beads.restorationFingerprint = "";
    markUnsavedChanges();
    setMessage("已撤销。", false);
    render();
  }

  function redoEdit() {
    if (!state.beads.pattern || !state.beads.redoStack.length) return;
    state.beads.undoStack.push(cloneLayerState());
    const snapshot = state.beads.redoStack.pop();
    if (!restoreLayerState(snapshot)) state.beads.pattern.cells = snapshot;
    state.beads.restorationFingerprint = "";
    markUnsavedChanges();
    setMessage("已重做。", false);
    render();
  }

  function updateHistoryButtons() {
    if (els.undoTopButton) els.undoTopButton.disabled = !state.beads.undoStack.length;
    if (els.redoTopButton) els.redoTopButton.disabled = !state.beads.redoStack.length;
  }

  function clearHistory() {
    state.beads.undoStack = [];
    state.beads.redoStack = [];
    updateHistoryButtons();
  }

  function makeLayer(name, cells, visible, locked, groupName) {
    return {
      id: makeId(),
      name: name || "图层",
      visible: visible !== false,
      locked: Boolean(locked),
      groupName: groupName || "",
      cells: cells ? cloneCells(cells) : makeEmptyCells(state.beads.height, state.beads.width)
    };
  }

  function makeEmptyCells(height, width) {
    return Array.from({ length: height }, () => Array.from({ length: width }, () => null));
  }

  function createBlankPattern(width, height, sourceLabel) {
    const safeWidth = clamp(width || state.beads.width || 48, bounds.beadSize.min, bounds.beadSize.max);
    const safeHeight = clamp(height || state.beads.height || safeWidth, bounds.beadSize.min, bounds.beadSize.max);
    return {
      width: safeWidth,
      height: safeHeight,
      cells: makeEmptyCells(safeHeight, safeWidth),
      sourceLabel: sourceLabel || "空白画布",
      createdAt: new Date().toISOString()
    };
  }

  function ensureBlankPatternForSave() {
    if (state.beads.pattern) return state.beads.pattern;
    const width = state.beads.width || (els.beadWidthNumber && els.beadWidthNumber.value) || 48;
    const height = state.beads.height || (els.beadHeightNumber && els.beadHeightNumber.value) || width;
    state.beads.pattern = createBlankPattern(width, height, "空白画布");
    state.beads.width = state.beads.pattern.width;
    state.beads.height = state.beads.pattern.height;
    state.beads.layers = [];
    state.beads.activeLayerId = "";
    state.beads.sourceLabel = "空白画布";
    ensureLayers();
    syncCompositePattern();
    return state.beads.pattern;
  }

  function ensureLayers() {
    const pattern = state.beads.pattern;
    if (!pattern) return;
    if (!Array.isArray(state.beads.layers) || !state.beads.layers.length) {
      const layer = makeLayer("主图层", pattern.cells, true, false, "");
      state.beads.layers = [layer];
      state.beads.activeLayerId = layer.id;
      return;
    }
    if (!state.beads.layers.some((layer) => layer.id === state.beads.activeLayerId)) {
      state.beads.activeLayerId = state.beads.layers[0].id;
    }
  }

  function getActiveLayer() {
    ensureLayers();
    return state.beads.layers.find((layer) => layer.id === state.beads.activeLayerId) || state.beads.layers[0] || null;
  }

  function getEditableCells() {
    const layer = getActiveLayer();
    if (layer && !layer.locked) return layer.cells;
    return null;
  }

  function syncCompositePattern() {
    const pattern = state.beads.pattern;
    if (!pattern) return;
    ensureLayers();
    const composite = makeEmptyCells(pattern.height, pattern.width);
    state.beads.layers.forEach((layer) => {
      if (!layer.visible) return;
      for (let row = 0; row < pattern.height; row += 1) {
        for (let col = 0; col < pattern.width; col += 1) {
          const code = layer.cells[row] && layer.cells[row][col];
          if (code) composite[row][col] = code;
        }
      }
    });
    pattern.cells = composite;
  }

  function cloneLayerState() {
    return {
      width: state.beads.pattern ? state.beads.pattern.width : state.beads.width,
      height: state.beads.pattern ? state.beads.pattern.height : state.beads.height,
      layers: state.beads.layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        locked: layer.locked,
        groupName: layer.groupName || "",
        cells: cloneCells(layer.cells)
      })),
      activeLayerId: state.beads.activeLayerId
    };
  }

  function restoreLayerState(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.layers)) return false;
    if (state.beads.pattern && snapshot.width && snapshot.height) {
      state.beads.pattern.width = snapshot.width;
      state.beads.pattern.height = snapshot.height;
      state.beads.width = snapshot.width;
      state.beads.height = snapshot.height;
    }
    state.beads.layers = snapshot.layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      visible: layer.visible !== false,
      locked: Boolean(layer.locked),
      groupName: layer.groupName || "",
      cells: cloneCells(layer.cells)
    }));
    state.beads.activeLayerId = snapshot.activeLayerId || (state.beads.layers[0] && state.beads.layers[0].id) || "";
    syncCompositePattern();
    return true;
  }

  function renderLayerList() {
    if (!els.layerList) return;
    els.layerList.innerHTML = "";
    if (!state.beads.pattern) {
      els.layerList.innerHTML = '<div class="panel-caption">尚未生成图纸。</div>';
      return;
    }
    ensureLayers();
    state.beads.layers.slice().reverse().forEach((layer) => {
      const row = document.createElement("div");
      row.className = "layer-row";
      row.classList.toggle("active", layer.id === state.beads.activeLayerId);
      row.innerHTML = `
        <div class="layer-thumb"></div>
        <div class="layer-main">
          <input class="layer-name" value="">
          <div class="layer-meta">${state.beads.pattern.width} x ${state.beads.pattern.height} 格${layer.groupName ? ` · ${layer.groupName}` : ""}</div>
          <div class="layer-actions-inline">
            <button type="button" data-layer-action="duplicate">复制</button>
            <button type="button" data-layer-action="mirror">镜像</button>
          </div>
        </div>
        <div class="layer-controls">
          <button class="layer-mini" type="button" data-layer-action="visible" title="显示隐藏">${layer.visible ? "眼" : "隐"}</button>
          <button class="layer-mini" type="button" data-layer-action="lock" title="锁定">${layer.locked ? "锁" : "开"}</button>
          <button class="layer-mini" type="button" data-layer-action="select" title="选中">选</button>
        </div>
      `;
      const input = row.querySelector(".layer-name");
      input.value = layer.name;
      input.addEventListener("change", () => {
        layer.name = input.value.replace(/·.*$/, "").trim() || "图层";
        renderLayerList();
      });
      row.querySelector('[data-layer-action="visible"]').addEventListener("click", () => {
        layer.visible = !layer.visible;
        syncCompositePattern();
        render();
      });
      row.querySelector('[data-layer-action="lock"]').addEventListener("click", () => {
        layer.locked = !layer.locked;
        renderLayerList();
      });
      row.querySelector('[data-layer-action="select"]').addEventListener("click", () => {
        state.beads.activeLayerId = layer.id;
        renderLayerList();
      });
      row.querySelector('[data-layer-action="duplicate"]').addEventListener("click", () => {
        state.beads.activeLayerId = layer.id;
        pushHistory();
        duplicateActiveLayer();
        setMessage("已复制图层。", false);
      });
      row.querySelector('[data-layer-action="mirror"]').addEventListener("click", () => {
        state.beads.activeLayerId = layer.id;
        pushHistory();
        const changed = mirrorActiveLayer();
        if (!changed) state.beads.undoStack.pop();
        setMessage(changed ? "图层已镜像。" : "图层未变化或已锁定。", !changed);
      });
      els.layerList.appendChild(row);
    });
  }

  function addLayer(name, cells) {
    if (!state.beads.pattern) return null;
    ensureLayers();
    const layer = makeLayer(name || `图层 ${state.beads.layers.length + 1}`, cells, true, false, "");
    state.beads.layers.push(layer);
    state.beads.activeLayerId = layer.id;
    syncCompositePattern();
    render();
    return layer;
  }

  function duplicateActiveLayer() {
    const layer = getActiveLayer();
    if (!layer) return null;
    return addLayer(`${layer.name} 副本`, layer.cells);
  }

  function mergeVisibleLayers() {
    if (!state.beads.pattern) return false;
    syncCompositePattern();
    const layer = makeLayer("合并图层", state.beads.pattern.cells, true, false, "");
    state.beads.layers = [layer];
    state.beads.activeLayerId = layer.id;
    syncCompositePattern();
    render();
    return true;
  }

  function groupLayers() {
    ensureLayers();
    const groupName = `组 ${new Date().getHours()}${String(new Date().getMinutes()).padStart(2, "0")}`;
    state.beads.layers.forEach((layer) => {
      layer.groupName = groupName;
    });
    renderLayerList();
    return groupName;
  }

  function mirrorActiveLayer() {
    const layer = getActiveLayer();
    if (!layer || layer.locked) return 0;
    let changed = 0;
    for (let row = 0; row < layer.cells.length; row += 1) {
      const before = layer.cells[row].join("|");
      layer.cells[row].reverse();
      if (layer.cells[row].join("|") !== before) changed += 1;
    }
    syncCompositePattern();
    render();
    renderSelectionColorPanel();
    return changed;
  }

  function setPatternDimensions(width, height) {
    if (!state.beads.pattern) return;
    state.beads.pattern.width = width;
    state.beads.pattern.height = height;
    state.beads.width = width;
    state.beads.height = height;
  }

  function mirrorFullCanvas() {
    if (!state.beads.pattern) return 0;
    ensureLayers();
    let changed = 0;
    state.beads.layers.forEach((layer) => {
      for (let row = 0; row < layer.cells.length; row += 1) {
        const before = layer.cells[row].join("|");
        layer.cells[row].reverse();
        if (layer.cells[row].join("|") !== before) changed += 1;
      }
    });
    syncCompositePattern();
    render();
    return changed;
  }

  function expandLayerCells(cells, direction, amount) {
    const height = cells.length;
    const width = cells[0] ? cells[0].length : 0;
    if (direction === "up") return [...makeEmptyCells(amount, width), ...cloneCells(cells)];
    if (direction === "down") return [...cloneCells(cells), ...makeEmptyCells(amount, width)];
    return cells.map((row) => {
      const pad = Array.from({ length: amount }, () => null);
      return direction === "left" ? [...pad, ...row] : [...row, ...pad];
    });
  }

  function expandCanvas(direction, amount) {
    if (!state.beads.pattern) return 0;
    const safeAmount = clamp(amount, 1, 200);
    const nextWidth = state.beads.pattern.width + (direction === "left" || direction === "right" ? safeAmount : 0);
    const nextHeight = state.beads.pattern.height + (direction === "up" || direction === "down" ? safeAmount : 0);
    if (nextWidth > bounds.beadSize.max || nextHeight > bounds.beadSize.max) return 0;
    ensureLayers();
    state.beads.layers.forEach((layer) => {
      layer.cells = expandLayerCells(layer.cells, direction, safeAmount);
    });
    setPatternDimensions(nextWidth, nextHeight);
    syncCompositePattern();
    render();
    return safeAmount;
  }

  function getPatternBoundsFromCells(cells) {
    if (!cells || !cells.length) return null;
    let minRow = Infinity;
    let minCol = Infinity;
    let maxRow = -1;
    let maxCol = -1;
    cells.forEach((row, rowIndex) => {
      row.forEach((code, colIndex) => {
        if (!code) return;
        minRow = Math.min(minRow, rowIndex);
        minCol = Math.min(minCol, colIndex);
        maxRow = Math.max(maxRow, rowIndex);
        maxCol = Math.max(maxCol, colIndex);
      });
    });
    if (maxRow < 0) return null;
    return { minRow, minCol, maxRow, maxCol };
  }

  function cropCanvasToBounds(boundsRect) {
    if (!state.beads.pattern || !boundsRect) return 0;
    const minRow = clamp(boundsRect.minRow, 0, state.beads.pattern.height - 1);
    const minCol = clamp(boundsRect.minCol, 0, state.beads.pattern.width - 1);
    const maxRow = clamp(boundsRect.maxRow, minRow, state.beads.pattern.height - 1);
    const maxCol = clamp(boundsRect.maxCol, minCol, state.beads.pattern.width - 1);
    const width = maxCol - minCol + 1;
    const height = maxRow - minRow + 1;
    ensureLayers();
    state.beads.layers.forEach((layer) => {
      layer.cells = layer.cells.slice(minRow, maxRow + 1).map((row) => row.slice(minCol, maxCol + 1));
    });
    setPatternDimensions(width, height);
    state.beads.selectedCells = [];
    syncCompositePattern();
    render();
    return width * height;
  }

  function autoCropCanvas() {
    if (!state.beads.pattern) return 0;
    syncCompositePattern();
    return cropCanvasToBounds(getPatternBoundsFromCells(state.beads.pattern.cells));
  }

  function cropCanvasToSelection() {
    if (!state.beads.selectedCells.length) return 0;
    const boundsRect = {
      minRow: Math.min(...state.beads.selectedCells.map((cell) => cell.row)),
      minCol: Math.min(...state.beads.selectedCells.map((cell) => cell.col)),
      maxRow: Math.max(...state.beads.selectedCells.map((cell) => cell.row)),
      maxCol: Math.max(...state.beads.selectedCells.map((cell) => cell.col))
    };
    return cropCanvasToBounds(boundsRect);
  }

  function normalizeShapeTemplate(item) {
    if (!item || !Array.isArray(item.cells)) return null;
    const height = clamp(item.height || item.cells.length || 1, 1, bounds.beadSize.max);
    const width = clamp(item.width || (item.cells[0] ? item.cells[0].length : 1), 1, bounds.beadSize.max);
    const cells = Array.from({ length: height }, (_, row) => {
      const sourceRow = Array.isArray(item.cells[row]) ? item.cells[row] : [];
      return Array.from({ length: width }, (_, col) => {
        const code = sourceRow[col];
        return code && getPaletteColor(code).code === code ? code : null;
      });
    });
    if (!cells.some((row) => row.some(Boolean))) return null;
    return {
      id: item.id || makeId(),
      name: String(item.name || "我的图形").slice(0, 24),
      width,
      height,
      cells,
      createdAt: item.createdAt || new Date().toISOString()
    };
  }

  function getShapeTemplateLibrary() {
    if (state.beads.shapeTemplates && state.beads.shapeTemplates.length) return state.beads.shapeTemplates;
    try {
      const parsed = JSON.parse(localStorage.getItem(shapeTemplateStorageKey) || "[]");
      state.beads.shapeTemplates = Array.isArray(parsed)
        ? parsed.map(normalizeShapeTemplate).filter(Boolean)
        : [];
    } catch {
      state.beads.shapeTemplates = [];
    }
    return state.beads.shapeTemplates;
  }

  function setShapeTemplateLibrary(items) {
    const safe = (Array.isArray(items) ? items : [])
      .map(normalizeShapeTemplate)
      .filter(Boolean)
      .slice(0, 80);
    state.beads.shapeTemplates = safe;
    try {
      localStorage.setItem(shapeTemplateStorageKey, JSON.stringify(safe));
    } catch {
      const compact = safe.slice(0, 40);
      state.beads.shapeTemplates = compact;
      try {
        localStorage.setItem(shapeTemplateStorageKey, JSON.stringify(compact));
      } catch (_) {
        // Keep the in-memory library available for this session.
      }
      setMessage("图形模板库空间有限，已保留最近 40 个模板。", true);
    }
    renderShapeTemplateSelect();
  }

  function renderShapeTemplateSelect() {
    if (!els.shapeTemplateSelect) return;
    const templates = getShapeTemplateLibrary();
    const previous = state.beads.shapeTemplateSelectedId || els.shapeTemplateSelect.value || "";
    els.shapeTemplateSelect.innerHTML = "";
    if (!templates.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "暂无模板";
      els.shapeTemplateSelect.appendChild(option);
      state.beads.shapeTemplateSelectedId = "";
      return;
    }
    templates.forEach((template) => {
      const option = document.createElement("option");
      option.value = template.id;
      option.textContent = `${template.name} · ${template.width} x ${template.height}`;
      els.shapeTemplateSelect.appendChild(option);
    });
    const selected = templates.find((template) => template.id === previous) || templates[0];
    state.beads.shapeTemplateSelectedId = selected.id;
    els.shapeTemplateSelect.value = selected.id;
  }

  function getSelectedShapeTemplate() {
    const templates = getShapeTemplateLibrary();
    return templates.find((template) => template.id === state.beads.shapeTemplateSelectedId) || null;
  }

  function getBlackTemplateCode() {
    if (beadPalette.some((color) => color.code === "H7")) return "H7";
    return nearestBeadColor(0, 0, 0).code;
  }

  function getSelectionBounds() {
    const selected = state.beads.selectedCells || [];
    if (!selected.length) return null;
    return {
      minRow: Math.min(...selected.map((cell) => cell.row)),
      minCol: Math.min(...selected.map((cell) => cell.col)),
      maxRow: Math.max(...selected.map((cell) => cell.row)),
      maxCol: Math.max(...selected.map((cell) => cell.col))
    };
  }

  function saveSelectionAsShapeTemplate(nameOverride, monoOverride) {
    if (!state.beads.pattern || !state.beads.selectedCells.length) {
      setMessage("请先用选区工具选中要保存的像素图形。", true);
      return null;
    }
    syncCompositePattern();
    const boundsRect = getSelectionBounds();
    if (!boundsRect) return null;
    const selected = new Set(state.beads.selectedCells.map((cell) => `${cell.row},${cell.col}`));
    const width = boundsRect.maxCol - boundsRect.minCol + 1;
    const height = boundsRect.maxRow - boundsRect.minRow + 1;
    const useMono = typeof monoOverride === "boolean"
      ? monoOverride
      : Boolean(els.shapeTemplateMonoToggle && els.shapeTemplateMonoToggle.checked);
    const monoCode = getBlackTemplateCode();
    let filled = 0;
    const cells = Array.from({ length: height }, (_, row) => {
      const sourceRow = boundsRect.minRow + row;
      return Array.from({ length: width }, (_, col) => {
        const sourceCol = boundsRect.minCol + col;
        if (!selected.has(`${sourceRow},${sourceCol}`)) return null;
        const code = state.beads.pattern.cells[sourceRow] && state.beads.pattern.cells[sourceRow][sourceCol];
        if (!code) return null;
        filled += 1;
        return useMono ? monoCode : code;
      });
    });
    if (!filled) {
      setMessage("选区里没有可保存的非空像素。", true);
      return null;
    }
    const rawName = nameOverride != null
      ? String(nameOverride)
      : (els.shapeTemplateNameInput && els.shapeTemplateNameInput.value) || "";
    const template = normalizeShapeTemplate({
      id: makeId(),
      name: rawName.trim() || `图形模板 ${getShapeTemplateLibrary().length + 1}`,
      width,
      height,
      cells,
      createdAt: new Date().toISOString()
    });
    const next = [template, ...getShapeTemplateLibrary().filter((item) => item.id !== template.id)];
    state.beads.shapeTemplateSelectedId = template.id;
    setShapeTemplateLibrary(next);
    state.beads.shapeType = "template";
    state.beads.shapeWidth = template.width;
    state.beads.shapeHeight = template.height;
    state.beads.editTool = "shape";
    syncBeadControls();
    setMessage(`已保存图形模板「${template.name}」，可拖到画布放置。`, false);
    return template;
  }

  function deleteSelectedShapeTemplate() {
    const selected = getSelectedShapeTemplate();
    if (!selected) {
      setMessage("没有可删除的图形模板。", true);
      return 0;
    }
    const next = getShapeTemplateLibrary().filter((template) => template.id !== selected.id);
    state.beads.shapeTemplateSelectedId = next[0] ? next[0].id : "";
    setShapeTemplateLibrary(next);
    setMessage(`已删除图形模板「${selected.name}」。`, false);
    syncBeadControls();
    return 1;
  }

  function resizeLayerCellsNearest(cells, nextWidth, nextHeight) {
    const height = cells.length;
    const width = cells[0] ? cells[0].length : 0;
    return Array.from({ length: nextHeight }, (_, row) => {
      const sourceRow = Math.min(height - 1, Math.floor(row * height / nextHeight));
      return Array.from({ length: nextWidth }, (_, col) => {
        const sourceCol = Math.min(width - 1, Math.floor(col * width / nextWidth));
        return cells[sourceRow][sourceCol];
      });
    });
  }

  function scaleCanvasByFactor(factor) {
    if (!state.beads.pattern) return 0;
    const safeFactor = Math.max(0.25, Math.min(6, Number(factor) || 1));
    const nextWidth = clamp(Math.round(state.beads.pattern.width * safeFactor), bounds.beadSize.min, bounds.beadSize.max);
    const nextHeight = clamp(Math.round(state.beads.pattern.height * safeFactor), bounds.beadSize.min, bounds.beadSize.max);
    if (nextWidth === state.beads.pattern.width && nextHeight === state.beads.pattern.height) return 0;
    ensureLayers();
    state.beads.layers.forEach((layer) => {
      layer.cells = resizeLayerCellsNearest(layer.cells, nextWidth, nextHeight);
    });
    setPatternDimensions(nextWidth, nextHeight);
    state.beads.selectedCells = [];
    syncCompositePattern();
    render();
    return nextWidth * nextHeight;
  }

  function ensurePatternForCanvasEdit() {
    if (state.mode === "pixel" && state.image) ensurePixelEditablePattern(false);
    return state.beads.pattern || null;
  }

  function importLayerImage(file) {
    if (!file || !ensurePatternForCanvasEdit()) {
      setMessage("请先生成图纸或可编辑像素画，再导入图层图片。", true);
      return;
    }
    if (!file.type || !file.type.startsWith("image/")) {
      setMessage("请选择图片文件。", true);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const pattern = createPatternFromSource(img, state.beads.pattern.width, state.beads.pattern.height, file.name || "导入图层");
      URL.revokeObjectURL(url);
      pushHistory();
      addLayer(file.name || "导入图层", pattern.cells);
      setMessage("图片已作为新图层导入。", false);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setMessage("图层图片读取失败。", true);
    };
    img.src = url;
  }

  function importLayerFile(file) {
    if (!file) return;
    const name = (file.name || "").toLowerCase();
    const isProjectSource = name.endsWith(".qpx") || name.endsWith(".json") || file.type === "application/json";
    if (isProjectSource && !(file.type || "").startsWith("image/")) {
      importProjectAsLayer(file);
      return;
    }
    if (!ensurePatternForCanvasEdit()) {
      setMessage("请先生成图纸或可编辑像素画，再导入图片图层。", true);
      return;
    }
    loadFile(file, { mode: "layer" });
  }

  function importProjectAsLayer(file) {
    if (!file || !ensurePatternForCanvasEdit()) {
      setMessage("请先生成图纸或可编辑像素画，再导入 .qpx 图层。", true);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importProjectPayloadAsLayer(JSON.parse(String(reader.result || "")), file.name || "导入源文件");
      } catch {
        setMessage("无法读取这个 .qpx 源文件。", true);
      }
    };
    reader.onerror = () => setMessage("读取 .qpx 图层失败。", true);
    reader.readAsText(file);
  }

  function importProjectPayloadAsLayer(payload, fallbackName) {
    if (!ensurePatternForCanvasEdit()) {
      setMessage("请先生成图纸或可编辑像素画，再导入设计图层。", true);
      return false;
    }
    const source = makeLayerCellsFromProjectPayload(payload);
    if (!source) {
      setMessage("这个设计文件没有可导入的图层内容。", true);
      return false;
    }
    const placed = placeSourceCellsIntoCurrentPattern(source.cells, source.width, source.height);
    if (!placed.count) {
      setMessage("源文件尺寸与当前画布没有重叠区域，无法作为图层导入。", true);
      return false;
    }
    pushHistory();
    const title = source.title || fallbackName || "导入源文件";
    addLayer(`${title} 图层`, placed.cells);
    const sizeNote = source.width === state.beads.pattern.width && source.height === state.beads.pattern.height
      ? ""
      : `，已居中贴入当前 ${state.beads.pattern.width} x ${state.beads.pattern.height} 画布`;
    setMessage(`已将设计作为新图层导入${sizeNote}。`, false);
    return true;
  }

  function normalizeImportedCode(code) {
    if (!code || code === "H1") return null;
    return beadPalette.some((color) => color.code === code) ? code : null;
  }

  function normalizeProjectCells(cells, width, height) {
    if (!Array.isArray(cells) || cells.length !== height) return null;
    if (cells.some((row) => !Array.isArray(row) || row.length !== width)) return null;
    return cells.map((row) => row.map(normalizeImportedCode));
  }

  function makeLayerCellsFromProjectPayload(payload) {
    if (!payload || !payload.pattern || !Array.isArray(payload.pattern.cells)) return null;
    const width = Number(payload.pattern.width);
    const height = Number(payload.pattern.height);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) return null;
    const sourceWidth = Math.round(width);
    const sourceHeight = Math.round(height);
    const baseCells = normalizeProjectCells(payload.pattern.cells, sourceWidth, sourceHeight);
    if (!baseCells) return null;
    const composite = makeEmptyCells(sourceHeight, sourceWidth);
    let usedLayer = false;
    if (Array.isArray(payload.layers) && payload.layers.length) {
      payload.layers.forEach((layer) => {
        if (layer && layer.visible === false) return;
        const layerCells = normalizeProjectCells(layer && layer.cells, sourceWidth, sourceHeight);
        if (!layerCells) return;
        usedLayer = true;
        for (let row = 0; row < sourceHeight; row += 1) {
          for (let col = 0; col < sourceWidth; col += 1) {
            if (layerCells[row][col]) composite[row][col] = layerCells[row][col];
          }
        }
      });
    }
    const cells = usedLayer ? composite : baseCells;
    const filled = cells.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
    return filled
      ? { width: sourceWidth, height: sourceHeight, cells, title: payload.title || payload.sourceLabel || "导入源文件" }
      : null;
  }

  function placeSourceCellsIntoCurrentPattern(sourceCells, sourceWidth, sourceHeight) {
    const targetWidth = state.beads.pattern.width;
    const targetHeight = state.beads.pattern.height;
    const cells = makeEmptyCells(targetHeight, targetWidth);
    const offsetCol = Math.floor((targetWidth - sourceWidth) / 2);
    const offsetRow = Math.floor((targetHeight - sourceHeight) / 2);
    let count = 0;
    for (let row = 0; row < sourceHeight; row += 1) {
      const targetRow = row + offsetRow;
      if (targetRow < 0 || targetRow >= targetHeight) continue;
      for (let col = 0; col < sourceWidth; col += 1) {
        const targetCol = col + offsetCol;
        if (targetCol < 0 || targetCol >= targetWidth) continue;
        const code = sourceCells[row][col];
        if (!code) continue;
        cells[targetRow][targetCol] = code;
        count += 1;
      }
    }
    return { cells, count };
  }

  function getNormalizedRect(a, b) {
    const col = Math.min(a.col, b.col);
    const row = Math.min(a.row, b.row);
    const maxCol = Math.max(a.col, b.col);
    const maxRow = Math.max(a.row, b.row);
    return { col, row, width: maxCol - col + 1, height: maxRow - row + 1 };
  }

  function getCellFromPointer(event) {
    if (!state.beads.pattern || !state.beads.lastGridRect) return null;
    const point = getCanvasPoint(event);
    const x = point.x;
    const y = point.y;
    const grid = state.beads.lastGridRect;
    if (x < grid.x || y < grid.y || x >= grid.x + grid.width || y >= grid.y + grid.height) return null;
    const col = clamp(Math.floor((x - grid.x) / grid.cellSize), 0, state.beads.pattern.width - 1);
    const row = clamp(Math.floor((y - grid.y) / grid.cellSize), 0, state.beads.pattern.height - 1);
    return { row, col };
  }

  function paintCell(cell, code) {
    const cells = getEditableCells();
    if (!cell || !state.beads.pattern || !cells) return false;
    if (cell.row < 0 || cell.col < 0 || cell.row >= state.beads.pattern.height || cell.col >= state.beads.pattern.width) return false;
    if (cells[cell.row][cell.col] === code) return false;
    cells[cell.row][cell.col] = code;
    syncCompositePattern();
    return true;
  }

  function applyRectEdit(start, end, code) {
    if (!state.beads.pattern || !start || !end) return 0;
    const rect = getNormalizedRect(start, end);
    let changed = 0;
    for (let row = rect.row; row < rect.row + rect.height; row += 1) {
      for (let col = rect.col; col < rect.col + rect.width; col += 1) {
        const cells = getEditableCells();
        if (!cells) return changed;
        if (cells[row][col] !== code) {
          cells[row][col] = code;
          changed += 1;
        }
      }
    }
    syncCompositePattern();
    return changed;
  }

  function forEachCellInBrush(center, size, callback) {
    const radius = Math.max(0, Math.floor((size - 1) / 2));
    const extra = size % 2 === 0 ? 1 : 0;
    const startRow = center.row - radius;
    const endRow = center.row + radius + extra;
    const startCol = center.col - radius;
    const endCol = center.col + radius + extra;
    for (let row = startRow; row <= endRow; row += 1) {
      for (let col = startCol; col <= endCol; col += 1) {
        callback({ row, col });
      }
    }
  }

  function paintBrushCell(cell, code, size) {
    let changed = 0;
    const flashed = [];
    forEachCellInBrush(cell, size || 1, (target) => {
      if (paintCell(target, code)) {
        changed += 1;
        if (code === null) flashed.push({ row: target.row, col: target.col });
      }
    });
    if (flashed.length) addEraserFlashCells(flashed);
    return changed;
  }

  function addEraserFlashCells(cells) {
    const until = Date.now() + 520;
    const existing = (state.beads.eraseFlashCells || []).filter((item) => item.until > Date.now());
    const map = new Map(existing.map((item) => [`${item.row},${item.col}`, item]));
    cells.forEach((cell) => {
      map.set(`${cell.row},${cell.col}`, { row: cell.row, col: cell.col, until });
    });
    state.beads.eraseFlashCells = Array.from(map.values()).slice(-500);
    window.setTimeout(() => {
      state.beads.eraseFlashCells = (state.beads.eraseFlashCells || []).filter((item) => item.until > Date.now());
      render();
    }, 540);
  }

  function clearActiveLayerCells() {
    const cells = getEditableCells();
    if (!state.beads.pattern || !cells) return 0;
    let changed = 0;
    for (let row = 0; row < state.beads.pattern.height; row += 1) {
      for (let col = 0; col < state.beads.pattern.width; col += 1) {
        if (cells[row] && cells[row][col]) {
          cells[row][col] = null;
          changed += 1;
        }
      }
    }
    if (changed) syncCompositePattern();
    return changed;
  }

  function isPointInRegularPolygon(x, y, sides) {
    const count = Math.max(3, Math.floor(sides || 5));
    const polygon = [];
    const startAngle = -Math.PI / 2;
    for (let i = 0; i < count; i += 1) {
      const angle = startAngle + i * Math.PI * 2 / count;
      polygon.push({
        x: Math.cos(angle) * 0.5,
        y: Math.sin(angle) * 0.5
      });
    }
    return pointInPolygon({ x, y }, polygon);
  }

  function getShapeDefinition(type) {
    if (type === "template") {
      const template = getSelectedShapeTemplate();
      return {
        label: template ? `模板 ${template.name}` : "自定义模板",
        minWidth: 1,
        minHeight: 1
      };
    }
    const base = shapeDefinitions[type] || shapeDefinitions.square;
    if (type !== "text") return base;
    const textLength = Math.max(1, Array.from((state.beads.shapeText || "Q").trim()).length);
    return Object.assign({}, base, {
      minWidth: Math.max(base.minWidth, Math.min(bounds.beadSize.max, textLength * 5))
    });
  }

  function getShapeSizeError(type, width, height) {
    const def = getShapeDefinition(type);
    if (width < def.minWidth || height < def.minHeight) {
      return `${def.label} 至少需要 ${def.minWidth} x ${def.minHeight} 格。`;
    }
    return "";
  }

  function makeStarPolygon() {
    const points = [];
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? 0.5 : 0.22;
      const angle = -Math.PI / 2 + i * Math.PI / 5;
      points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
    }
    return points;
  }

  function pointInTriangleShape(point, a, b, c) {
    const area = Math.abs((b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y));
    if (area <= 0.00001) return false;
    const alpha = Math.abs((b.y - c.y) * (point.x - c.x) + (c.x - b.x) * (point.y - c.y)) / area;
    const beta = Math.abs((c.y - a.y) * (point.x - c.x) + (a.x - c.x) * (point.y - c.y)) / area;
    const gamma = 1 - alpha - beta;
    return alpha >= -0.01 && beta >= -0.01 && gamma >= -0.01;
  }

  function makeTextShapeMask(width, height, text) {
    const scale = 4;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const safeText = (text || "Q").trim() || "Q";
    let fontSize = Math.max(12, Math.floor(height * scale * 0.82));
    const family = getShapeFontFamily();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    do {
      ctx.font = `900 ${fontSize}px ${family}`;
      if (ctx.measureText(safeText).width <= canvas.width * 0.9 || fontSize <= 8) break;
      fontSize -= 1;
    } while (fontSize > 8);
    ctx.fillStyle = "#fff";
    ctx.fillText(safeText, canvas.width / 2, canvas.height / 2 + fontSize * 0.04);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const mask = new Uint8ClampedArray(width * height * 4);
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        let alphaSum = 0;
        for (let sy = 0; sy < scale; sy += 1) {
          for (let sx = 0; sx < scale; sx += 1) {
            alphaSum += data[(((row * scale + sy) * canvas.width + col * scale + sx) * 4) + 3];
          }
        }
        mask[(row * width + col) * 4 + 3] = alphaSum / (scale * scale) > 84 ? 255 : 0;
      }
    }
    return mask;
  }

  function getShapeFontFamily() {
    const type = state.beads.shapeFont || "system";
    if (type === "rounded") return `"PingFang SC", "Hiragino Sans GB", "Arial Rounded MT Bold", sans-serif`;
    if (type === "serif") return `"Songti SC", "STSong", "SimSun", serif`;
    if (type === "mono") return `"Menlo", "Monaco", "SF Mono", "Courier New", monospace`;
    if (type === "bold") return `"Arial Black", "PingFang SC", "Microsoft YaHei", sans-serif`;
    return `-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`;
  }

  function shapeUsesLockedAspect(type) {
    return !["square", "text"].includes(type);
  }

  function shapeUsesHorizontalSymmetry(type) {
    return ["circle", "triangle", "polygon", "star", "heart", "diamond"].includes(type);
  }

  function getShapeLocalPoint(type, localCol, localRow, width, height) {
    if (!shapeUsesLockedAspect(type)) {
      return {
        nx: (localCol + 0.5) / width - 0.5,
        ny: (localRow + 0.5) / height - 0.5,
        inBounds: true
      };
    }

    const size = Math.max(1, Math.min(width, height));
    const centerX = (width - 1) / 2;
    const centerY = (height - 1) / 2;
    const nx = (localCol - centerX) / size;
    const ny = (localRow - centerY) / size;
    return {
      nx,
      ny,
      inBounds: Math.abs(nx) <= 0.5 && Math.abs(ny) <= 0.5
    };
  }

  function isNearLine(point, a, b, thickness) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    if (!lengthSq) return Math.hypot(point.x - a.x, point.y - a.y) <= thickness;
    const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSq, 0, 1);
    const px = a.x + dx * t;
    const py = a.y + dy * t;
    return Math.hypot(point.x - px, point.y - py) <= thickness;
  }

  function isInCatFace(nx, ny) {
    const point = { x: nx, y: ny };
    const head = (nx * nx) / 0.17 + ((ny - 0.04) * (ny - 0.04)) / 0.13 <= 1;
    const leftEar = pointInTriangleShape(point, { x: -0.38, y: -0.12 }, { x: -0.18, y: -0.46 }, { x: -0.03, y: -0.14 });
    const rightEar = pointInTriangleShape(point, { x: 0.38, y: -0.12 }, { x: 0.18, y: -0.46 }, { x: 0.03, y: -0.14 });
    return head || leftEar || rightEar;
  }

  function isInGirlHead(nx, ny) {
    const face = (nx * nx) / 0.105 + ((ny - 0.05) * (ny - 0.05)) / 0.12 <= 1;
    const hair = (nx * nx) / 0.16 + ((ny + 0.07) * (ny + 0.07)) / 0.12 <= 1 && ny < 0.18;
    const buns = Math.hypot(nx + 0.34, ny + 0.08) <= 0.13 || Math.hypot(nx - 0.34, ny + 0.08) <= 0.13;
    return face || hair || buns;
  }

  function isInCrown(nx, ny) {
    const point = { x: nx, y: ny };
    const base = Math.abs(nx) <= 0.42 && ny >= 0.18 && ny <= 0.38;
    const left = pointInTriangleShape(point, { x: -0.42, y: 0.22 }, { x: -0.28, y: -0.24 }, { x: -0.1, y: 0.22 });
    const center = pointInTriangleShape(point, { x: -0.16, y: 0.22 }, { x: 0, y: -0.42 }, { x: 0.16, y: 0.22 });
    const right = pointInTriangleShape(point, { x: 0.42, y: 0.22 }, { x: 0.28, y: -0.24 }, { x: 0.1, y: 0.22 });
    return base || left || center || right;
  }

  function shapeContainsCell(type, nx, ny, localCol, localRow, width, height, textMask) {
    const point = { x: nx, y: ny };
    if (type === "circle") return (nx * nx) / 0.25 + (ny * ny) / 0.25 <= 1;
    if (type === "triangle") {
      return pointInTriangleShape(point, { x: 0, y: -0.5 }, { x: -0.5, y: 0.5 }, { x: 0.5, y: 0.5 });
    }
    if (type === "polygon") return isPointInRegularPolygon(nx, ny, state.beads.shapeSides);
    if (type === "star") return pointInPolygon(point, makeStarPolygon());
    if (type === "heart") {
      const x = nx * 2.45;
      const y = -ny * 2.65 + 0.28;
      const value = Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3);
      return value <= 0;
    }
    if (type === "bow") {
      const knot = Math.abs(nx) <= 0.095 && Math.abs(ny) <= 0.2;
      const leftWing = pointInTriangleShape(point, { x: -0.5, y: -0.34 }, { x: -0.08, y: 0 }, { x: -0.5, y: 0.34 });
      const rightWing = pointInTriangleShape(point, { x: 0.5, y: -0.34 }, { x: 0.08, y: 0 }, { x: 0.5, y: 0.34 });
      const leftRound = nx < -0.08 && ((nx + 0.33) ** 2) / 0.055 + (ny ** 2) / 0.075 <= 1;
      const rightRound = nx > 0.08 && ((nx - 0.33) ** 2) / 0.055 + (ny ** 2) / 0.075 <= 1;
      return knot || leftWing || rightWing || leftRound || rightRound;
    }
    if (type === "cat" || type === "kitty") return isInCatFace(nx, ny);
    if (type === "girl") return isInGirlHead(nx, ny);
    if (type === "butterfly") {
      const leftTop = ((nx + 0.22) ** 2) / 0.045 + ((ny + 0.12) ** 2) / 0.05 <= 1;
      const rightTop = ((nx - 0.22) ** 2) / 0.045 + ((ny + 0.12) ** 2) / 0.05 <= 1;
      const leftBottom = ((nx + 0.2) ** 2) / 0.035 + ((ny - 0.15) ** 2) / 0.042 <= 1;
      const rightBottom = ((nx - 0.2) ** 2) / 0.035 + ((ny - 0.15) ** 2) / 0.042 <= 1;
      const body = Math.abs(nx) <= 0.045 && Math.abs(ny) <= 0.28;
      return leftTop || rightTop || leftBottom || rightBottom || body;
    }
    if (type === "smile") {
      const r = Math.hypot(nx, ny);
      const border = Math.abs(r - 0.45) <= 0.045;
      const leftEye = Math.hypot(nx + 0.16, ny + 0.13) <= 0.055;
      const rightEye = Math.hypot(nx - 0.16, ny + 0.13) <= 0.055;
      const smileR = Math.hypot(nx, ny - 0.02);
      const smile = ny > 0.08 && Math.abs(smileR - 0.25) <= 0.035 && Math.abs(nx) <= 0.28;
      return border || leftEye || rightEye || smile;
    }
    if (type === "flower") {
      const center = Math.hypot(nx, ny) <= 0.11;
      if (center) return true;
      for (let i = 0; i < 6; i += 1) {
        const angle = i * Math.PI * 2 / 6;
        const px = Math.cos(angle) * 0.26;
        const py = Math.sin(angle) * 0.26;
        if (Math.hypot(nx - px, ny - py) <= 0.15) return true;
      }
      return false;
    }
    if (type === "sparkle") return Math.abs(nx) + Math.abs(ny) <= 0.48 || Math.abs(nx) <= 0.075 || Math.abs(ny) <= 0.075;
    if (type === "crown") return isInCrown(nx, ny);
    if (type === "diamond") return Math.abs(nx) + Math.abs(ny) <= 0.5;
    if (type === "text") {
      const index = (localRow * width + localCol) * 4 + 3;
      return Boolean(textMask && textMask[index] > 24);
    }
    return true;
  }

  function mirrorShapeMaskHorizontally(mask) {
    const height = mask.length;
    const width = height ? mask[0].length : 0;
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < Math.floor(width / 2); col += 1) {
        const mirrorCol = width - 1 - col;
        const value = mask[row][col] || mask[row][mirrorCol];
        mask[row][col] = value;
        mask[row][mirrorCol] = value;
      }
    }
    return mask;
  }

  function buildShapeMask(type, width, height, textMask) {
    const mask = Array.from({ length: height }, () => Array(width).fill(false));
    for (let localRow = 0; localRow < height; localRow += 1) {
      for (let localCol = 0; localCol < width; localCol += 1) {
        const point = getShapeLocalPoint(type, localCol, localRow, width, height);
        if (!point.inBounds) continue;
        mask[localRow][localCol] = shapeContainsCell(type, point.nx, point.ny, localCol, localRow, width, height, textMask);
      }
    }
    return shapeUsesHorizontalSymmetry(type) ? mirrorShapeMaskHorizontally(mask) : mask;
  }

  function isShapeBoundary(mask, row, col) {
    if (!mask[row] || !mask[row][col]) return false;
    for (let dRow = -1; dRow <= 1; dRow += 1) {
      for (let dCol = -1; dCol <= 1; dCol += 1) {
        if (!dRow && !dCol) continue;
        const nextRow = row + dRow;
        const nextCol = col + dCol;
        if (!mask[nextRow] || !mask[nextRow][nextCol]) return true;
      }
    }
    return false;
  }

  function getCuteShapeCode(type, localCol, localRow, width, height, boundary) {
    const point = getShapeLocalPoint(type, localCol, localRow, width, height);
    const nx = point.nx;
    const ny = point.ny;
    const selected = state.beads.selectedCode;
    const outline = "H7";
    const white = "H1";
    const cream = "H21";
    const blush = "F16";
    const pink = "E12";
    const yellow = "A13";
    const hair = "G7";
    if (state.beads.shapeStyle === "outline") return selected;
    if (boundary && ["cat", "kitty", "girl", "butterfly", "crown"].includes(type)) return outline;
    if (type === "cat" || type === "kitty") {
      const leftEye = Math.hypot(nx + 0.14, ny + 0.02) <= 0.035;
      const rightEye = Math.hypot(nx - 0.14, ny + 0.02) <= 0.035;
      const nose = Math.abs(nx) <= 0.035 && ny >= 0.09 && ny <= 0.16;
      const mouth = (isNearLine({ x: nx, y: ny }, { x: -0.08, y: 0.17 }, { x: 0, y: 0.22 }, 0.018) ||
        isNearLine({ x: nx, y: ny }, { x: 0, y: 0.22 }, { x: 0.08, y: 0.17 }, 0.018));
      const whisker = (Math.abs(ny - 0.1) <= 0.018 || Math.abs(ny - 0.17) <= 0.018) && Math.abs(nx) >= 0.24 && Math.abs(nx) <= 0.4;
      const innerEar = (Math.hypot(nx + 0.2, ny + 0.26) <= 0.055) || (Math.hypot(nx - 0.2, ny + 0.26) <= 0.055);
      const cheek = Math.hypot(nx + 0.25, ny + 0.16) <= 0.045 || Math.hypot(nx - 0.25, ny + 0.16) <= 0.045;
      const sparkle = type === "kitty" && (Math.hypot(nx + 0.28, ny - 0.13) <= 0.035 || Math.hypot(nx - 0.28, ny - 0.13) <= 0.035);
      if (leftEye || rightEye || mouth || whisker) return outline;
      if (nose || innerEar || cheek) return blush;
      if (sparkle) return white;
      return type === "kitty" ? cream : selected;
    }
    if (type === "girl") {
      const face = (nx * nx) / 0.095 + ((ny - 0.08) * (ny - 0.08)) / 0.105 <= 1;
      const eye = Math.hypot(nx + 0.1, ny + 0.04) <= 0.028 || Math.hypot(nx - 0.1, ny + 0.04) <= 0.028;
      const cheek = Math.hypot(nx + 0.19, ny + 0.13) <= 0.035 || Math.hypot(nx - 0.19, ny + 0.13) <= 0.035;
      const bang = ny < -0.1 || (Math.abs(nx) > 0.22 && ny < 0.18);
      if (eye) return outline;
      if (cheek) return blush;
      if (face && !bang) return "G1";
      return hair;
    }
    if (type === "butterfly") {
      const body = Math.abs(nx) <= 0.045 && Math.abs(ny) <= 0.28;
      const dot = Math.hypot(Math.abs(nx) - 0.21, ny + 0.12) <= 0.035 || Math.hypot(Math.abs(nx) - 0.2, ny - 0.16) <= 0.03;
      if (body) return outline;
      if (dot) return white;
      return selected;
    }
    if (type === "bow") {
      const knot = Math.abs(nx) <= 0.095 && Math.abs(ny) <= 0.2;
      const shine = (nx < -0.18 || nx > 0.18) && ny < -0.12 && Math.abs(nx) < 0.38;
      if (boundary) return outline;
      if (knot) return pink;
      if (shine) return white;
      return selected;
    }
    if (type === "heart") {
      const shine = nx < -0.12 && ny < -0.12 && Math.hypot(nx + 0.18, ny + 0.18) <= 0.07;
      if (boundary) return outline;
      if (shine) return white;
      return selected;
    }
    if (type === "star" || type === "sparkle" || type === "crown") {
      const shine = nx < -0.08 && ny < -0.08 && Math.abs(nx) + Math.abs(ny) <= 0.34;
      if (boundary && type === "crown") return outline;
      if (shine) return white;
      return type === "crown" ? yellow : selected;
    }
    return selected;
  }

  function drawShapeAtCell(anchor) {
    const pattern = state.beads.pattern;
    const cells = getEditableCells();
    if (!pattern || !cells || !anchor) return 0;
    const type = state.beads.shapeType || "square";
    if (type === "template") {
      const template = getSelectedShapeTemplate();
      if (!template) return 0;
      const startCol = Math.round(anchor.col - (template.width - 1) / 2);
      const startRow = Math.round(anchor.row - (template.height - 1) / 2);
      let changed = 0;
      for (let localRow = 0; localRow < template.height; localRow += 1) {
        for (let localCol = 0; localCol < template.width; localCol += 1) {
          const code = template.cells[localRow] && template.cells[localRow][localCol];
          if (!code) continue;
          const row = startRow + localRow;
          const col = startCol + localCol;
          if (row < 0 || col < 0 || row >= pattern.height || col >= pattern.width) continue;
          if (cells[row][col] !== code) {
            cells[row][col] = code;
            changed += 1;
          }
        }
      }
      syncCompositePattern();
      return changed;
    }
    const width = clamp(state.beads.shapeWidth, 1, pattern.width);
    const height = clamp(state.beads.shapeHeight, 1, pattern.height);
    if (getShapeSizeError(type, width, height)) return 0;
    const startCol = Math.round(anchor.col - (width - 1) / 2);
    const startRow = Math.round(anchor.row - (height - 1) / 2);
    const textMask = type === "text" ? makeTextShapeMask(width, height, state.beads.shapeText) : null;
    const shapeMask = buildShapeMask(type, width, height, textMask);
    const outlineOnly = state.beads.shapeStyle === "outline";
    let changed = 0;

    for (let row = startRow; row < startRow + height; row += 1) {
      for (let col = startCol; col < startCol + width; col += 1) {
        if (row < 0 || col < 0 || row >= pattern.height || col >= pattern.width) continue;
        const localCol = col - startCol;
        const localRow = row - startRow;
        if (!shapeMask[localRow][localCol]) continue;
        const boundary = isShapeBoundary(shapeMask, localRow, localCol);
        if (outlineOnly && !boundary) continue;
        const code = getCuteShapeCode(type, localCol, localRow, width, height, boundary);
        if (cells[row][col] !== code) {
          cells[row][col] = code;
          changed += 1;
        }
      }
    }
    syncCompositePattern();
    return changed;
  }

  function floodFillFromCell(cell, code) {
    const pattern = state.beads.pattern;
    if (!pattern || !cell) return 0;
    const cells = getEditableCells();
    if (!cells) return 0;
    const fromCode = pattern.cells[cell.row][cell.col];
    if (fromCode === code) return 0;
    const queue = [cell];
    const seen = new Set();
    let changed = 0;
    while (queue.length) {
      const current = queue.shift();
      const key = `${current.row},${current.col}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (current.row < 0 || current.col < 0 || current.row >= pattern.height || current.col >= pattern.width) continue;
      if (pattern.cells[current.row][current.col] !== fromCode) continue;
      cells[current.row][current.col] = code;
      changed += 1;
      queue.push(
        { row: current.row - 1, col: current.col },
        { row: current.row + 1, col: current.col },
        { row: current.row, col: current.col - 1 },
        { row: current.row, col: current.col + 1 }
      );
    }
    syncCompositePattern();
    return changed;
  }

  function cellsFromRect(start, end) {
    if (!state.beads.pattern || !start || !end) return [];
    const rect = getNormalizedRect(start, end);
    const cells = [];
    for (let row = rect.row; row < rect.row + rect.height; row += 1) {
      for (let col = rect.col; col < rect.col + rect.width; col += 1) {
        cells.push({ row, col });
      }
    }
    return cells;
  }

  function cellsFromLasso(points) {
    const pattern = state.beads.pattern;
    if (!pattern || !points || points.length < 3) return [];
    const polygon = points.map((point) => ({ x: point.col + 0.5, y: point.row + 0.5 }));
    const cells = [];
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        if (pointInPolygon({ x: col + 0.5, y: row + 0.5 }, polygon)) {
          cells.push({ row, col });
        }
      }
    }
    return cells;
  }

  function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      const intersects = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / ((yj - yi) || 0.00001) + xi);
      if (intersects) inside = !inside;
    }
    return inside;
  }

  function applySelectionCells(cells) {
    const current = new Map((state.beads.selectedCells || []).map((cell) => [`${cell.row},${cell.col}`, cell]));
    if (state.beads.selectionOp === "add") {
      cells.forEach((cell) => current.set(`${cell.row},${cell.col}`, cell));
      state.beads.selectedCells = Array.from(current.values());
      return;
    }
    if (state.beads.selectionOp === "subtract") {
      cells.forEach((cell) => current.delete(`${cell.row},${cell.col}`));
      state.beads.selectedCells = Array.from(current.values());
      return;
    }
    state.beads.selectedCells = cells;
  }

  function applySelectionEdit(code) {
    if (!state.beads.pattern || !state.beads.selectedCells.length) return 0;
    let changed = 0;
    state.beads.selectedCells.forEach((cell) => {
      if (paintCell(cell, code)) changed += 1;
    });
    return changed;
  }

  function getUsageItem(code) {
    return calculateUsage(state.beads.pattern).find((item) => item.code === code) || null;
  }

  function showCellInfo(cell, forcedCode) {
    if (!state.beads.pattern || !cell || !els.cellInfoPanel) return;
    const code = forcedCode || state.beads.pattern.cells[cell.row][cell.col];
    if (!code) {
      setMessage(`第 ${cell.col + 1} 列，第 ${cell.row + 1} 行为空格。`, false);
      return;
    }
    const item = getUsageItem(code);
    const color = getPaletteColor(code);
    state.beads.inspectedCell = forcedCode ? null : cell;
    state.beads.inspectedCode = code;
    els.cellInfoSwatch.style.backgroundColor = color.hex;
    els.cellInfoCode.textContent = code;
    els.cellInfoName.textContent = color.name;
    els.cellInfoMeta.textContent = forcedCode
      ? `当前画布共有 ${item ? item.count : 0} 颗 · 当前图层：${(getActiveLayer() && getActiveLayer().name) || "主图层"}`
      : `位置：${cell.col + 1}, ${cell.row + 1} · 数量：${item ? item.count : 0} · 当前图层：${(getActiveLayer() && getActiveLayer().name) || "主图层"}`;
    if (els.cellTargetSelect) els.cellTargetSelect.value = state.beads.selectedCode;
    els.cellInfoPanel.classList.remove("hidden");
  }

  function hideCellInfo() {
    if (els.cellInfoPanel) els.cellInfoPanel.classList.add("hidden");
    state.beads.inspectedCell = null;
    state.beads.inspectedCode = "";
  }

  function mergeColorToSelected(fromCode, targetCode) {
    const toCode = targetCode || state.beads.selectedCode;
    if (!fromCode || !toCode || fromCode === toCode) return 0;
    pushHistory();
    const changed = replaceColorEverywhere(fromCode, toCode);
    if (!changed) state.beads.undoStack.pop();
    state.beads.selectedCode = toCode;
    syncCompositePattern();
    render();
    return changed;
  }

  function deleteColorEverywhere(code) {
    if (!code || !state.beads.pattern) return 0;
    pushHistory();
    const changed = replaceColorEverywhere(code, null);
    if (!changed) state.beads.undoStack.pop();
    syncCompositePattern();
    render();
    return changed;
  }

  function applyFamilyRecolor(fromFamily, toFamily) {
    if (!state.beads.pattern || fromFamily === toFamily) return 0;
    const usage = calculateUsage(state.beads.pattern)
      .filter((item) => getPaletteFamilyKey(item.color) === fromFamily)
      .sort((a, b) => colorBrightness(a.color.rgb) - colorBrightness(b.color.rgb));
    const targets = beadPalette
      .filter((color) => getPaletteFamilyKey(color) === toFamily)
      .sort((a, b) => colorBrightness(a.rgb) - colorBrightness(b.rgb));
    if (!usage.length || !targets.length) return 0;
    pushHistory();
    let changed = 0;
    usage.forEach((item, index) => {
      const targetIndex = usage.length <= 1 ? Math.floor(targets.length / 2) : Math.round(index * (targets.length - 1) / (usage.length - 1));
      changed += replaceColorEverywhere(item.code, targets[targetIndex].code);
    });
    if (!changed) state.beads.undoStack.pop();
    syncCompositePattern();
    render();
    return changed;
  }

  function applyOutlineEdit(mode, width, code) {
    const cells = getEditableCells();
    const pattern = state.beads.pattern;
    if (!pattern || !cells) return 0;
    const safeWidth = clamp(width, 1, 10);
    const action = mode === "remove" ? "remove" : "add";
    const next = cloneCells(cells);
    let changed = 0;
    const inBounds = (row, col) => row >= 0 && col >= 0 && row < pattern.height && col < pattern.width;
    const hasNeighborWithin = (row, col, predicate) => {
      for (let dy = -safeWidth; dy <= safeWidth; dy += 1) {
        for (let dx = -safeWidth; dx <= safeWidth; dx += 1) {
          if (Math.abs(dx) + Math.abs(dy) > safeWidth || (!dx && !dy)) continue;
          const nr = row + dy;
          const nc = col + dx;
          if (inBounds(nr, nc) && predicate(cells[nr][nc], nr, nc)) return true;
        }
      }
      return false;
    };

    if (action === "add") {
      for (let row = 0; row < pattern.height; row += 1) {
        for (let col = 0; col < pattern.width; col += 1) {
          if (cells[row][col]) continue;
          if (hasNeighborWithin(row, col, (value) => Boolean(value))) {
            next[row][col] = code;
            changed += 1;
          }
        }
      }
    } else {
      for (let row = 0; row < pattern.height; row += 1) {
        for (let col = 0; col < pattern.width; col += 1) {
          if (!cells[row][col]) continue;
          const touchesEmpty = hasNeighborWithin(row, col, (value) => !value);
          const touchesEdge = row < safeWidth || col < safeWidth || row >= pattern.height - safeWidth || col >= pattern.width - safeWidth;
          if (touchesEmpty || touchesEdge) {
            next[row][col] = null;
            changed += 1;
          }
        }
      }
    }
    if (!changed) return 0;
    for (let row = 0; row < pattern.height; row += 1) {
      cells[row] = next[row].slice();
    }
    syncCompositePattern();
    return changed;
  }

  function mergeSmallColors(limit) {
    const safeLimit = clamp(limit, 1, 9999);
    const usage = calculateUsage(state.beads.pattern).filter((item) => item.count < safeLimit && item.code !== state.beads.selectedCode);
    if (!usage.length) return 0;
    pushHistory();
    let changed = 0;
    usage.forEach((item) => {
      changed += replaceColorEverywhere(item.code, state.beads.selectedCode);
    });
    if (!changed) state.beads.undoStack.pop();
    syncCompositePattern();
    render();
    return changed;
  }

  function optimizePatternColors(limit) {
    if (!state.beads.pattern) {
      setMessage("请先生成图纸。", true);
      return 0;
    }
    syncCompositePattern();
    const target = clamp(limit || 20, 2, beadPalette.length);
    const currentUsage = calculateUsage(state.beads.pattern);
    if (currentUsage.length <= target) {
      setMessage("当前色号数已小于目标值。", true);
      return 0;
    }

    const locked = getLockedColorSet();
    const safeTarget = Math.max(target, locked.size + 1);
    const analysis = analyzeColorImportance(state.beads.pattern).sort((a, b) => b.importance - a.importance);
    const colorStats = new Map(analysis.map((item) => [item.code, item]));
    const kept = [];
    locked.forEach((code) => {
      if (currentUsage.some((item) => item.code === code) && kept.length < safeTarget) kept.push(code);
    });
    const darkest = analysis
      .slice()
      .filter((item) => !kept.includes(item.code))
      .sort((a, b) => colorBrightness(a.color.rgb) - colorBrightness(b.color.rgb))
      .slice(0, Math.min(3, Math.max(0, safeTarget - kept.length)))
      .map((item) => item.code);
    [...darkest, ...analysis.map((item) => item.code)].forEach((code) => {
      if (kept.length < safeTarget && !kept.includes(code)) kept.push(code);
    });
    const keptSet = new Set(kept);
    const replacements = new Map();
    currentUsage.forEach((item) => {
      if (!keptSet.has(item.code) && !locked.has(item.code)) replacements.set(item.code, getNearestKeptCode(item.code, kept, colorStats));
    });
    if (!replacements.size) return 0;

    pushHistory();
    const cells = getEditableCells() || state.beads.pattern.cells;
    let changed = 0;
    for (let row = 0; row < state.beads.pattern.height; row += 1) {
      for (let col = 0; col < state.beads.pattern.width; col += 1) {
        const code = cells[row][col];
        if (replacements.has(code) && !locked.has(code)) {
          cells[row][col] = replacements.get(code);
          changed += 1;
        }
      }
    }

    const smoothed = smoothOptimizedCells(cells, locked);
    for (let row = 0; row < cells.length; row += 1) {
      cells[row] = smoothed.cells[row].slice();
    }
    changed += smoothed.changed;
    if (!changed) {
      state.beads.undoStack.pop();
      updateHistoryButtons();
      return 0;
    }
    syncCompositePattern();
    render();
    const after = countPatternColors(state.beads.pattern);
    setMessage(`已将 ${currentUsage.length} 种色号优化为 ${after} 种，已保护轮廓/高光锁定色。`, after > safeTarget);
    return changed;
  }

  function restoreOptimizePattern(mode = "balanced") {
    if (!state.beads.pattern) {
      setMessage("请先生成图纸。", true);
      return 0;
    }
    syncCompositePattern();
    const beforeFingerprint = getPatternFingerprint(state.beads.pattern);
    const safeMode = ["light", "balanced", "detail"].includes(mode) ? mode : "balanced";
    const restorationKey = `${safeMode}:${beforeFingerprint}`;
    if (state.beads.restorationFingerprint === restorationKey) {
      setMessage("还原优化已经完成，无需重复处理。", false);
      return 0;
    }
    if (!state.image) {
      setMessage("当前图纸没有原图，无法进行原图还原。", true);
      return 0;
    }
    const before = cloneCells(state.beads.pattern.cells);
    const restored = safeMode === "light"
      ? restorePixelArtDetails(state.beads.pattern, "light")
      : createRestorationPatternFromSource(
        state.image,
        state.beads.pattern.width,
        state.beads.pattern.height,
        state.imageName,
        state.importCalibration && state.importCalibration.enabled ? state.importCalibration : null
      );
    const locked = getLockedColorSet();
    const restoredWithMode = safeMode === "light" ? restored : restorePixelArtDetails(restored, safeMode);
    const cleaned = protectLockedCells(state.beads.pattern, restoredWithMode, locked);
    let changed = 0;
    for (let row = 0; row < state.beads.pattern.height; row += 1) {
      for (let col = 0; col < state.beads.pattern.width; col += 1) {
        if (before[row][col] !== cleaned.cells[row][col]) changed += 1;
      }
    }
    if (!changed) {
      state.beads.restorationFingerprint = restorationKey;
      setMessage("未发现明确断线，原图细节保持不变。", false);
      return 0;
    }
    pushHistory();
    state.beads.pattern = cleaned;
    state.beads.restorationFingerprint = `${safeMode}:${getPatternFingerprint(cleaned)}`;
    syncCompositePattern();
    render();
    markUnsavedChanges();
    setMessage(`已按${{ light: "轻度", balanced: "均衡", detail: "强细节" }[safeMode]}还原 ${changed} 格，保留锁定色和原图细节。`, false);
    return changed;
  }

  function getSelectionUsage() {
    const pattern = state.beads.pattern;
    const cells = getEditableCells() || (pattern && pattern.cells);
    if (!pattern || !cells || !state.beads.selectedCells.length) return [];
    const counts = new Map();
    state.beads.selectedCells.forEach((cell) => {
      if (cell.row < 0 || cell.col < 0 || cell.row >= pattern.height || cell.col >= pattern.width) return;
      const code = cells[cell.row][cell.col];
      if (!code) return;
      counts.set(code, (counts.get(code) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([code, count]) => ({
      code,
      count,
      color: getPaletteColor(code)
    })).sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
  }

  function replaceColorInSelection(fromCode, targetCode) {
    const pattern = state.beads.pattern;
    const cells = getEditableCells();
    const toCode = targetCode === null ? null : (targetCode || state.beads.selectedCode);
    if (!pattern || !cells || !fromCode || fromCode === toCode || !state.beads.selectedCells.length) return 0;
    pushHistory();
    let changed = 0;
    state.beads.selectedCells.forEach((cell) => {
      if (cell.row < 0 || cell.col < 0 || cell.row >= pattern.height || cell.col >= pattern.width) return;
      if (cells[cell.row][cell.col] !== fromCode) return;
      cells[cell.row][cell.col] = toCode || null;
      changed += 1;
    });
    if (!changed) state.beads.undoStack.pop();
    syncCompositePattern();
    render();
    return changed;
  }

  function deleteColorInSelection(code) {
    const changed = replaceColorInSelection(code, null);
    return changed;
  }

  function mergeSmallColorsInSelection(limit, targetCode) {
    const safeLimit = clamp(limit, 1, 9999);
    const toCode = targetCode || state.beads.selectedCode;
    const small = getSelectionUsage().filter((item) => item.count < safeLimit && item.code !== toCode);
    if (!small.length) return 0;
    let changed = 0;
    small.forEach((item, index) => {
      const delta = replaceColorInSelection(item.code, toCode);
      changed += delta;
      if (!delta && index > 0) updateHistoryButtons();
    });
    return changed;
  }

  function applySelectionOutlineEdit(mode, width, code) {
    const pattern = state.beads.pattern;
    const cells = getEditableCells();
    const selected = state.beads.selectedCells || [];
    if (!pattern || !cells || !selected.length) return 0;
    const selectedKeys = new Set(selected.map((cell) => `${cell.row},${cell.col}`));
    const safeWidth = clamp(width, 1, 10);
    const action = mode === "remove" ? "remove" : "add";
    const next = cloneCells(cells);
    const inBounds = (row, col) => row >= 0 && col >= 0 && row < pattern.height && col < pattern.width;
    let changed = 0;
    if (action === "add") {
      selected.forEach((cell) => {
        for (let dy = -safeWidth; dy <= safeWidth; dy += 1) {
          for (let dx = -safeWidth; dx <= safeWidth; dx += 1) {
            if (Math.abs(dx) + Math.abs(dy) > safeWidth) continue;
            const row = cell.row + dy;
            const col = cell.col + dx;
            if (!inBounds(row, col) || selectedKeys.has(`${row},${col}`)) continue;
            if (next[row][col] === code) continue;
            next[row][col] = code;
            changed += 1;
          }
        }
      });
    } else {
      selected.forEach((cell) => {
        if (!inBounds(cell.row, cell.col) || !cells[cell.row][cell.col]) return;
        let boundary = false;
        for (let dy = -safeWidth; dy <= safeWidth && !boundary; dy += 1) {
          for (let dx = -safeWidth; dx <= safeWidth; dx += 1) {
            if (Math.abs(dx) + Math.abs(dy) > safeWidth || (!dx && !dy)) continue;
            const row = cell.row + dy;
            const col = cell.col + dx;
            if (!inBounds(row, col) || !selectedKeys.has(`${row},${col}`)) {
              boundary = true;
              break;
            }
          }
        }
        if (boundary) {
          next[cell.row][cell.col] = null;
          changed += 1;
        }
      });
    }
    if (!changed) return 0;
    pushHistory();
    for (let row = 0; row < pattern.height; row += 1) cells[row] = next[row].slice();
    syncCompositePattern();
    render();
    return changed;
  }

  function renderSelectionColorPanel() {
    if (!els.selectionColorList) return;
    const usage = getSelectionUsage();
    els.selectionColorList.innerHTML = "";
    if (!usage.length) {
      const empty = document.createElement("span");
      empty.className = "style-empty-chip";
      empty.textContent = "选区内暂无色号";
      els.selectionColorList.appendChild(empty);
      return;
    }
    usage.forEach((item) => {
      const chip = document.createElement("div");
      chip.className = "selection-color-chip";
      chip.innerHTML = `<button class="selection-color-main" type="button"><span></span><strong>${item.code}</strong><small>${item.count}</small></button><button class="mini-button" type="button">替换</button><button class="mini-button" type="button">删除</button>`;
      chip.querySelector("span").style.backgroundColor = item.color.hex;
      const [mainButton, replaceButton, deleteButton] = chip.querySelectorAll("button");
      mainButton.addEventListener("click", () => {
        selectBeadColor(item.code);
        showCellInfo({ row: 0, col: 0 }, item.code);
      });
      replaceButton.addEventListener("click", () => {
        const target = els.selectionColorTargetSelect ? els.selectionColorTargetSelect.value : state.beads.selectedCode;
        const changed = replaceColorInSelection(item.code, target);
        setMessage(changed ? `已在选区内把 ${item.code} 替换为 ${target}。` : "选区内没有可替换的格子。", !changed);
      });
      deleteButton.addEventListener("click", () => {
        const changed = deleteColorInSelection(item.code);
        setMessage(changed ? `已在选区内删除 ${item.code} 的 ${changed} 格。` : "选区内没有可删除的格子。", !changed);
      });
      els.selectionColorList.appendChild(chip);
    });
  }

  function getGuideIndexFromCell(cell, orientation) {
    if (!state.beads.pattern || !cell) return 0;
    const safeOrientation = orientation === "horizontal" ? "horizontal" : "vertical";
    const maxIndex = safeOrientation === "horizontal" ? state.beads.pattern.height : state.beads.pattern.width;
    return clamp(safeOrientation === "horizontal" ? cell.row : cell.col, 0, maxIndex);
  }

  function normalizeGuideLine(guide, fallbackIndex) {
    const orientation = guide && guide.orientation === "horizontal" ? "horizontal" : "vertical";
    const maxIndex = state.beads.pattern
      ? (orientation === "horizontal" ? state.beads.pattern.height : state.beads.pattern.width)
      : bounds.beadSize.max;
    return {
      id: guide && guide.id ? guide.id : `guide-${Date.now()}-${fallbackIndex || 0}-${Math.random().toString(16).slice(2)}`,
      orientation,
      index: clamp(guide && guide.index, 0, maxIndex),
      style: guide && guide.style === "solid" ? "solid" : "dashed",
      color: /^#[0-9a-f]{6}$/i.test((guide && guide.color) || "") ? guide.color : "#ff9d38",
      opacity: clamp(guide && guide.opacity, 10, 100)
    };
  }

  function normalizeGuideLines() {
    state.beads.guideLines = (state.beads.guideLines || []).map((guide, index) => normalizeGuideLine(guide, index));
    if (state.beads.guideSelectedId && !state.beads.guideLines.some((guide) => guide.id === state.beads.guideSelectedId)) {
      state.beads.guideSelectedId = state.beads.guideLines[0] ? state.beads.guideLines[0].id : "";
    }
    return state.beads.guideLines;
  }

  function getGuideLineLabel(guide, index) {
    const order = index + 1;
    if (!guide) return "暂无辅助线";
    return guide.orientation === "horizontal"
      ? `${order}. 横向 第 ${guide.index + 1} 行`
      : `${order}. 纵向 第 ${guide.index + 1} 列`;
  }

  function renderGuideLineSelect() {
    if (!els.guideLineSelect) return;
    const guides = normalizeGuideLines();
    els.guideLineSelect.innerHTML = "";
    if (!guides.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "暂无辅助线";
      els.guideLineSelect.appendChild(option);
      return;
    }
    guides.forEach((guide, index) => {
      const option = document.createElement("option");
      option.value = guide.id;
      option.textContent = getGuideLineLabel(guide, index);
      els.guideLineSelect.appendChild(option);
    });
    if (!state.beads.guideSelectedId || !guides.some((guide) => guide.id === state.beads.guideSelectedId)) {
      state.beads.guideSelectedId = guides[0].id;
    }
    els.guideLineSelect.value = state.beads.guideSelectedId;
  }

  function makeGuideLineFromCell(cell, id) {
    const orientation = state.beads.guideOrientation === "horizontal" ? "horizontal" : "vertical";
    return normalizeGuideLine({
      id: id || `guide-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      orientation,
      index: getGuideIndexFromCell(cell, orientation),
      style: state.beads.guideStyle === "solid" ? "solid" : "dashed",
      color: /^#[0-9a-f]{6}$/i.test(state.beads.guideColor || "") ? state.beads.guideColor : "#ff9d38",
      opacity: clamp(state.beads.guideOpacity || 80, 10, 100)
    });
  }

  function addGuideLineAtCell(cell) {
    if (!state.beads.pattern || !cell) return 0;
    const orientation = state.beads.guideOrientation === "horizontal" ? "horizontal" : "vertical";
    const index = getGuideIndexFromCell(cell, orientation);
    normalizeGuideLines();
    const nextLine = makeGuideLineFromCell(cell);
    const existingIndex = state.beads.guideLines.findIndex((guide) => guide.orientation === orientation && guide.index === index);
    if (existingIndex >= 0) state.beads.guideLines.splice(existingIndex, 1, nextLine);
    else state.beads.guideLines.push(nextLine);
    state.beads.guideSelectedId = nextLine.id;
    render();
    return state.beads.guideLines.length;
  }

  function startGuideLineDrag(cell) {
    if (!state.beads.pattern || !cell) return 0;
    const orientation = state.beads.guideOrientation === "horizontal" ? "horizontal" : "vertical";
    const index = getGuideIndexFromCell(cell, orientation);
    const guides = normalizeGuideLines();
    let nearestIndex = -1;
    let nearestDistance = Infinity;
    guides.forEach((guide, guideIndex) => {
      if (guide.orientation !== orientation) return;
      const distance = Math.abs(guide.index - index);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = guideIndex;
      }
    });
    if (nearestIndex >= 0 && nearestDistance <= 1) {
      const nextLine = makeGuideLineFromCell(cell, guides[nearestIndex].id);
      guides.splice(nearestIndex, 1, nextLine);
      state.beads.guideDrag = { id: nextLine.id };
      state.beads.guideSelectedId = nextLine.id;
    } else {
      const nextLine = makeGuideLineFromCell(cell);
      guides.push(nextLine);
      state.beads.guideDrag = { id: nextLine.id };
      state.beads.guideSelectedId = nextLine.id;
    }
    state.beads.guideLines = guides;
    render();
    return state.beads.guideLines.length;
  }

  function updateGuideLineDrag(cell) {
    if (!state.beads.pattern || !cell || !state.beads.guideDrag) return false;
    const guides = normalizeGuideLines();
    const index = guides.findIndex((guide) => guide.id === state.beads.guideDrag.id);
    if (index < 0) return false;
    guides[index] = makeGuideLineFromCell(cell, guides[index].id);
    state.beads.guideSelectedId = guides[index].id;
    state.beads.guideLines = guides;
    render();
    return true;
  }

  function deleteSelectedGuideLine() {
    const guides = normalizeGuideLines();
    if (!guides.length) return 0;
    const selectedId = state.beads.guideSelectedId || (els.guideLineSelect && els.guideLineSelect.value);
    const before = guides.length;
    state.beads.guideLines = guides.filter((guide) => guide.id !== selectedId);
    if (state.beads.guideDrag && state.beads.guideDrag.id === selectedId) state.beads.guideDrag = null;
    state.beads.guideSelectedId = state.beads.guideLines[0] ? state.beads.guideLines[0].id : "";
    render();
    return before - state.beads.guideLines.length;
  }

  function getSelectionSignature() {
    return (state.beads.selectedCells || [])
      .map((cell) => `${cell.row},${cell.col}`)
      .sort()
      .join("|");
  }

  function copySelection() {
    const pattern = state.beads.pattern;
    const cells = getEditableCells() || (pattern && pattern.cells);
    const selected = state.beads.selectedCells;
    if (!pattern || !cells || !selected.length) return false;
    const minRow = Math.min(...selected.map((cell) => cell.row));
    const minCol = Math.min(...selected.map((cell) => cell.col));
    const maxRow = Math.max(...selected.map((cell) => cell.row));
    const maxCol = Math.max(...selected.map((cell) => cell.col));
    state.beads.clipboard = selected.map((cell) => ({
      row: cell.row - minRow,
      col: cell.col - minCol,
      code: cells[cell.row][cell.col]
    }));
    state.beads.clipboardBounds = {
      row: minRow,
      col: minCol,
      width: maxCol - minCol + 1,
      height: maxRow - minRow + 1
    };
    state.beads.clipboardSelectionSignature = getSelectionSignature();
    return true;
  }

  function clampFloatingTarget(row, col, floating) {
    const pattern = state.beads.pattern;
    if (!pattern || !floating) return { row: 0, col: 0 };
    return {
      row: clamp(row, 0, Math.max(0, pattern.height - floating.height)),
      col: clamp(col, 0, Math.max(0, pattern.width - floating.width))
    };
  }

  function beginFloatingSelectionMove() {
    const pattern = state.beads.pattern;
    const cells = getEditableCells() || (pattern && pattern.cells);
    const selected = state.beads.selectedCells || [];
    if (!pattern || !cells || !selected.length) return false;
    const minRow = Math.min(...selected.map((cell) => cell.row));
    const minCol = Math.min(...selected.map((cell) => cell.col));
    const maxRow = Math.max(...selected.map((cell) => cell.row));
    const maxCol = Math.max(...selected.map((cell) => cell.col));
    const signature = getSelectionSignature();
    const copyMode = Boolean(state.beads.clipboard && state.beads.clipboard.length && state.beads.clipboardSelectionSignature === signature);
    const sourceCells = selected.map((cell) => ({
      row: cell.row,
      col: cell.col,
      relRow: cell.row - minRow,
      relCol: cell.col - minCol,
      code: cells[cell.row][cell.col]
    }));
    const floating = {
      cells: sourceCells.map((cell) => ({ row: cell.relRow, col: cell.relCol, code: cell.code })),
      sourceCells,
      copyMode,
      targetRow: minRow,
      targetCol: minCol,
      width: maxCol - minCol + 1,
      height: maxRow - minRow + 1,
      dragging: false,
      offsetRow: 0,
      offsetCol: 0
    };
    const target = clampFloatingTarget(floating.targetRow, floating.targetCol, floating);
    floating.targetRow = target.row;
    floating.targetCol = target.col;
    state.beads.floatingSelection = floating;
    state.beads.editTool = "select";
    syncToolOptions();
    render();
    return true;
  }

  function isCellInsideFloatingSelection(cell) {
    const floating = state.beads.floatingSelection;
    if (!floating || !cell) return false;
    return cell.row >= floating.targetRow &&
      cell.col >= floating.targetCol &&
      cell.row < floating.targetRow + floating.height &&
      cell.col < floating.targetCol + floating.width;
  }

  function startFloatingSelectionDrag(cell) {
    const floating = state.beads.floatingSelection;
    if (!floating || !cell) return false;
    floating.dragging = true;
    if (isCellInsideFloatingSelection(cell)) {
      floating.offsetRow = cell.row - floating.targetRow;
      floating.offsetCol = cell.col - floating.targetCol;
    } else {
      floating.offsetRow = 0;
      floating.offsetCol = 0;
      const target = clampFloatingTarget(cell.row, cell.col, floating);
      floating.targetRow = target.row;
      floating.targetCol = target.col;
    }
    state.beads.isPointerDown = true;
    state.beads.dragStart = cell;
    state.beads.dragCurrent = cell;
    render();
    return true;
  }

  function updateFloatingSelectionDrag(cell) {
    const floating = state.beads.floatingSelection;
    if (!floating || !cell) return;
    const target = clampFloatingTarget(cell.row - floating.offsetRow, cell.col - floating.offsetCol, floating);
    floating.targetRow = target.row;
    floating.targetCol = target.col;
    render();
  }

  function commitFloatingSelection() {
    const pattern = state.beads.pattern;
    const cells = getEditableCells();
    const floating = state.beads.floatingSelection;
    if (!pattern || !cells || !floating || !floating.cells.length) return 0;
    pushHistory();
    let changed = 0;
    const nextSelection = [];
    if (!floating.copyMode && floating.sourceCells && floating.sourceCells.length) {
      floating.sourceCells.forEach((cell) => {
        if (cell.row < 0 || cell.col < 0 || cell.row >= pattern.height || cell.col >= pattern.width) return;
        if (cells[cell.row][cell.col] !== null) {
          cells[cell.row][cell.col] = null;
          changed += 1;
        }
      });
    }
    floating.cells.forEach((cell) => {
      const row = floating.targetRow + cell.row;
      const col = floating.targetCol + cell.col;
      if (row < 0 || col < 0 || row >= pattern.height || col >= pattern.width) return;
      if (cells[row][col] !== cell.code) {
        cells[row][col] = cell.code;
        changed += 1;
      }
      nextSelection.push({ row, col });
    });
    if (!changed) {
      state.beads.undoStack.pop();
      updateHistoryButtons();
    }
    if (nextSelection.length) state.beads.selectedCells = nextSelection;
    state.beads.clipboardBounds = {
      row: floating.targetRow,
      col: floating.targetCol,
      width: floating.width,
      height: floating.height
    };
    if (!floating.copyMode) {
      state.beads.clipboard = null;
      state.beads.clipboardSelectionSignature = "";
    }
    state.beads.floatingSelection = null;
    syncCompositePattern();
    if (nextSelection.length) beginFloatingSelectionMove();
    return changed;
  }

  function pasteClipboard() {
    const pattern = state.beads.pattern;
    const cells = getEditableCells();
    const clipboard = state.beads.clipboard;
    const selected = state.beads.selectedCells;
    if (!pattern || !cells || !clipboard || !clipboard.length || !selected.length) return 0;
    const minRow = Math.min(...selected.map((cell) => cell.row));
    const minCol = Math.min(...selected.map((cell) => cell.col));
    const width = Math.max(...clipboard.map((cell) => cell.col)) + 1;
    const targetRow = minRow;
    const targetCol = Math.min(pattern.width - 1, minCol + width);
    let changed = 0;
    const nextSelection = [];
    clipboard.forEach((cell) => {
      const row = targetRow + cell.row;
      const col = targetCol + cell.col;
      if (row < 0 || col < 0 || row >= pattern.height || col >= pattern.width) return;
      if (cells[row][col] !== cell.code) {
        cells[row][col] = cell.code;
        changed += 1;
      }
      nextSelection.push({ row, col });
    });
    if (nextSelection.length) state.beads.selectedCells = nextSelection;
    syncCompositePattern();
    if (nextSelection.length) beginFloatingSelectionMove();
    return changed;
  }

  function mirrorSelection() {
    const pattern = state.beads.pattern;
    const cells = getEditableCells();
    const selected = state.beads.selectedCells;
    if (!pattern || !cells || !selected.length) return 0;
    const minCol = Math.min(...selected.map((cell) => cell.col));
    const maxCol = Math.max(...selected.map((cell) => cell.col));
    const codes = new Map();
    selected.forEach((cell) => codes.set(`${cell.row},${cell.col}`, cells[cell.row][cell.col]));
    let changed = 0;
    selected.forEach((cell) => {
      const mirrorCol = maxCol - (cell.col - minCol);
      const code = codes.get(`${cell.row},${mirrorCol}`);
      if (cells[cell.row][cell.col] !== code) {
        cells[cell.row][cell.col] = code;
        changed += 1;
      }
    });
    syncCompositePattern();
    return changed;
  }

  function rotateSelection() {
    const cells = getEditableCells();
    const selected = state.beads.selectedCells;
    if (!state.beads.pattern || !cells || !selected.length) return 0;
    const minRow = Math.min(...selected.map((cell) => cell.row));
    const maxRow = Math.max(...selected.map((cell) => cell.row));
    const minCol = Math.min(...selected.map((cell) => cell.col));
    const maxCol = Math.max(...selected.map((cell) => cell.col));
    const width = maxCol - minCol + 1;
    const height = maxRow - minRow + 1;
    if (width !== height) return 0;
    const selectedKeys = new Set(selected.map((cell) => `${cell.row},${cell.col}`));
    const before = new Map();
    selected.forEach((cell) => before.set(`${cell.row},${cell.col}`, cells[cell.row][cell.col]));
    let changed = 0;
    selected.forEach((cell) => {
      const relRow = cell.row - minRow;
      const relCol = cell.col - minCol;
      const sourceRow = minRow + (height - 1 - relCol);
      const sourceCol = minCol + relRow;
      if (!selectedKeys.has(`${sourceRow},${sourceCol}`)) return;
      const next = before.get(`${sourceRow},${sourceCol}`);
      if (cells[cell.row][cell.col] !== next) {
        cells[cell.row][cell.col] = next;
        changed += 1;
      }
    });
    syncCompositePattern();
    return changed;
  }

  function replacePatternColor(pattern, fromCode, toCode) {
    if (!pattern || !fromCode || fromCode === toCode) return 0;
    let changed = 0;
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        if (pattern.cells[row][col] === fromCode) {
          pattern.cells[row][col] = toCode;
          changed += 1;
        }
      }
    }
    return changed;
  }

  function replaceColorEverywhere(fromCode, toCode) {
    if (!state.beads.pattern || !fromCode || fromCode === toCode) return 0;
    ensureLayers();
    let changed = 0;
    state.beads.layers.forEach((layer) => {
      if (layer.locked) return;
      for (let row = 0; row < layer.cells.length; row += 1) {
        for (let col = 0; col < layer.cells[row].length; col += 1) {
          if (layer.cells[row][col] === fromCode) {
            layer.cells[row][col] = toCode;
            changed += 1;
          }
        }
      }
    });
    if (!state.beads.layers.length) changed = replacePatternColor(state.beads.pattern, fromCode, toCode);
    syncCompositePattern();
    return changed;
  }

  function replaceSingleVisibleCell(cell, targetCode) {
    if (!state.beads.pattern || !cell || !targetCode) return 0;
    ensureLayers();
    for (let index = state.beads.layers.length - 1; index >= 0; index -= 1) {
      const layer = state.beads.layers[index];
      if (!layer.visible || layer.locked) continue;
      if (layer.cells[cell.row] && layer.cells[cell.row][cell.col]) {
        if (layer.cells[cell.row][cell.col] === targetCode) return 0;
        layer.cells[cell.row][cell.col] = targetCode;
        state.beads.activeLayerId = layer.id;
        syncCompositePattern();
        return 1;
      }
    }
    return paintCell(cell, targetCode) ? 1 : 0;
  }

  function handleCanvasPointerDown(event) {
    if (els.previewCanvas && event.pointerId != null && els.previewCanvas.setPointerCapture) {
      try {
        els.previewCanvas.setPointerCapture(event.pointerId);
      } catch (_) {
        // Some embedded webviews reject capture for already-captured pointers.
      }
    }
    if (event.pointerType === "touch") {
      state.view.activePointers.set(event.pointerId, getCanvasPoint(event));
      if (state.view.activePointers.size >= 2) {
        if (state.view.touchGestureSnapshot) {
          restoreLayerState(state.view.touchGestureSnapshot);
          state.beads.undoStack = state.beads.undoStack.slice(0, state.view.touchUndoDepth || 0);
          state.beads.redoStack = [];
          state.view.touchGestureSnapshot = null;
          updateHistoryButtons();
        }
        const points = Array.from(state.view.activePointers.values());
        state.view.pinchStart = {
          distance: getPointerDistance(points[0], points[1]),
          midpoint: getPointerMidpoint(points[0], points[1]),
          zoom: state.view.zoom,
          panX: state.view.panX,
          panY: state.view.panY
        };
        state.view.suppressPaint = true;
        state.beads.isPointerDown = false;
        state.beads.dragStart = null;
        state.beads.dragCurrent = null;
        event.preventDefault();
        return;
      }
    }

    if (state.mode === "pixel" && state.image) ensurePixelEditablePattern(false);
    if (!state.beads.pattern || !state.beads.lastGridRect) return;
    if (event.pointerType === "touch" && state.view.activePointers.size === 1) {
      state.view.touchGestureSnapshot = cloneLayerState();
      state.view.touchUndoDepth = state.beads.undoStack.length;
    }

    if (state.beads.editTool === "pan") {
      event.preventDefault();
      state.view.isPanning = true;
      state.view.panStart = {
        point: getCanvasPoint(event),
        panX: state.view.panX,
        panY: state.view.panY
      };
      return;
    }

    const cell = getCellFromPointer(event);
    if (!cell) return;
    event.preventDefault();

    if (state.beads.buildMode) {
      toggleBuildCell(cell);
      render();
      return;
    }

    if (state.beads.floatingSelection) {
      startFloatingSelectionDrag(cell);
      return;
    }

    state.beads.isPointerDown = true;
    state.beads.dragStart = cell;
    state.beads.dragCurrent = cell;

    if (state.beads.editTool === "picker") {
      const code = state.beads.pattern.cells[cell.row][cell.col];
      if (code) {
        selectBeadColor(code);
        setMessage(`已取色 ${code}，可直接用它绘制。`, false);
      } else {
        setMessage("这个格子为空。", true);
      }
      state.beads.isPointerDown = false;
      state.beads.dragStart = null;
      state.beads.dragCurrent = null;
      render();
      return;
    }

    if (!["brush", "eraser", "bucket", "rect-clear", "rect-fill", "select", "shape", "guide"].includes(state.beads.editTool)) {
      state.beads.isPointerDown = false;
      state.beads.dragStart = null;
      state.beads.dragCurrent = null;
      showCellInfo(cell);
      return;
    }

    if (["brush", "eraser"].includes(state.beads.editTool)) {
      pushHistory();
      const code = state.beads.editTool === "eraser" ? null : state.beads.selectedCode;
      const size = state.beads.editTool === "eraser" ? state.beads.eraserSize : state.beads.brushSize;
      if (paintBrushCell(cell, code, size)) render();
      return;
    }

    if (["bucket", "rect-clear"].includes(state.beads.editTool)) {
      pushHistory();
      const code = state.beads.editTool === "rect-clear" ? null : state.beads.selectedCode;
      const changed = floodFillFromCell(cell, code);
      if (!changed) {
        state.beads.undoStack.pop();
        updateHistoryButtons();
      }
      setMessage(changed ? `已处理连续区域 ${changed} 格。` : "这个连续区域没有变化。", !changed);
      render();
      return;
    }

    if (state.beads.editTool === "shape") {
      if (state.beads.shapeType === "template" && !getSelectedShapeTemplate()) {
        setMessage("请先保存或选择一个自定义图形模板。", true);
        state.beads.isPointerDown = false;
        state.beads.dragStart = null;
        state.beads.dragCurrent = null;
        return;
      }
      const safeWidth = clamp(state.beads.shapeWidth, 1, state.beads.pattern.width);
      const safeHeight = clamp(state.beads.shapeHeight, 1, state.beads.pattern.height);
      const sizeError = getShapeSizeError(state.beads.shapeType, safeWidth, safeHeight);
      if (sizeError) {
        setMessage(sizeError, true);
        state.beads.isPointerDown = false;
        state.beads.dragStart = null;
        state.beads.dragCurrent = null;
        return;
      }
      setMessage("拖动到目标位置，松开后放置图形。", false);
      render();
      return;
    }

    if (state.beads.editTool === "guide") {
      const total = startGuideLineDrag(cell);
      setMessage(`拖动定位辅助线，当前 ${total} 条。`, false);
      return;
    }

    if (state.beads.editTool === "select") {
      if (state.beads.selectionOp === "replace") state.beads.selectedCells = [];
      state.beads.lassoPath = [cell];
      render();
      return;
    }

    render();
  }

  function handleCanvasPointerMove(event) {
    if (event.pointerType === "touch" && state.view.activePointers.has(event.pointerId)) {
      state.view.activePointers.set(event.pointerId, getCanvasPoint(event));
      if (state.view.pinchStart && state.view.activePointers.size >= 2) {
        event.preventDefault();
        const points = Array.from(state.view.activePointers.values());
        const distance = getPointerDistance(points[0], points[1]);
        const midpoint = getPointerMidpoint(points[0], points[1]);
        const ratio = distance / Math.max(1, state.view.pinchStart.distance);
        state.view.zoom = Math.max(0.25, Math.min(8, state.view.pinchStart.zoom * ratio));
        state.view.panX = state.view.pinchStart.panX + midpoint.x - state.view.pinchStart.midpoint.x;
        state.view.panY = state.view.pinchStart.panY + midpoint.y - state.view.pinchStart.midpoint.y;
        render();
        return;
      }
    }

    if (state.view.suppressPaint) return;

    if (state.view.isPanning && state.view.panStart) {
      event.preventDefault();
      const point = getCanvasPoint(event);
      state.view.panX = state.view.panStart.panX + point.x - state.view.panStart.point.x;
      state.view.panY = state.view.panStart.panY + point.y - state.view.panStart.point.y;
      render();
      return;
    }

    if (!state.beads.isPointerDown || !state.beads.pattern) return;
    const cell = getCellFromPointer(event);
    if (!cell) return;
    if (state.beads.floatingSelection && state.beads.floatingSelection.dragging) {
      updateFloatingSelectionDrag(cell);
      return;
    }
    if (["brush", "eraser"].includes(state.beads.editTool)) {
      const code = state.beads.editTool === "eraser" ? null : state.beads.selectedCode;
      const size = state.beads.editTool === "eraser" ? state.beads.eraserSize : state.beads.brushSize;
      if (paintBrushCell(cell, code, size)) render();
      return;
    }
    if (["rect-fill", "rect-clear"].includes(state.beads.editTool)) {
      state.beads.dragCurrent = cell;
      render();
      return;
    }
    if (state.beads.editTool === "shape") {
      state.beads.dragCurrent = cell;
      render();
      return;
    }
    if (state.beads.editTool === "guide") {
      updateGuideLineDrag(cell);
      return;
    }
    if (state.beads.editTool === "select") {
      state.beads.dragCurrent = cell;
      if (state.beads.selectMode === "lasso") state.beads.lassoPath.push(cell);
      render();
    }
  }

  function handleCanvasPointerUp(event) {
    if (event && els.previewCanvas && event.pointerId != null && els.previewCanvas.releasePointerCapture) {
      try {
        els.previewCanvas.releasePointerCapture(event.pointerId);
      } catch (_) {
        // Pointer may have been released by the browser already.
      }
    }
    if (event && event.pointerType === "touch") {
      state.view.activePointers.delete(event.pointerId);
      if (state.view.activePointers.size < 2) {
        state.view.pinchStart = null;
        setTimeout(() => {
          state.view.suppressPaint = false;
        }, 80);
      }
      if (state.view.activePointers.size === 0) {
        state.view.touchGestureSnapshot = null;
        state.view.touchUndoDepth = 0;
      }
    }

    if (state.view.isPanning) {
      state.view.isPanning = false;
      state.view.panStart = null;
      return;
    }

    if (!state.beads.isPointerDown) return;
    const start = state.beads.dragStart;
    const end = state.beads.dragCurrent;
    state.beads.isPointerDown = false;

    if (state.beads.floatingSelection && state.beads.floatingSelection.dragging) {
      state.beads.floatingSelection.dragging = false;
      const wasCopy = Boolean(state.beads.floatingSelection.copyMode);
      const changed = commitFloatingSelection();
      setMessage(changed ? (wasCopy ? `已放置复制内容 ${changed} 格。` : `已移动选区 ${changed} 格。`) : "选区已放在当前位置。", false);
      state.beads.dragStart = null;
      state.beads.dragCurrent = null;
      render();
      return;
    }

    if (state.beads.editTool === "guide" && state.beads.guideDrag) {
      state.beads.guideDrag = null;
      setMessage("辅助线位置已确定。", false);
      state.beads.dragStart = null;
      state.beads.dragCurrent = null;
      render();
      return;
    }

    if (state.beads.editTool === "shape" && end) {
      pushHistory();
      const changed = drawShapeAtCell(end);
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? `已添加 ${changed} 格图形。` : "图形没有落在画布内。", !changed);
      state.beads.dragStart = null;
      state.beads.dragCurrent = null;
      render();
      return;
    }

    if (state.beads.editTool === "rect-fill" && start && end) {
      pushHistory();
      const changed = applyRectEdit(start, end, state.beads.selectedCode);
      setMessage(changed ? `已处理 ${changed} 个格子。` : "选区没有变化。", !changed);
    }

    if (state.beads.editTool === "select" && start && end) {
      const cells = state.beads.selectMode === "lasso"
        ? cellsFromLasso(state.beads.lassoPath)
        : cellsFromRect(start, end);
      applySelectionCells(cells);
      setMessage(state.beads.selectedCells.length ? `已选择 ${state.beads.selectedCells.length} 格。` : "没有选中格子。", !state.beads.selectedCells.length);
    }

    state.beads.dragStart = null;
    state.beads.dragCurrent = null;
    state.beads.lassoPath = [];
    render();
  }

  function handleReplaceAll() {
    if (!state.beads.pattern) {
      setMessage("请先生成图纸。", true);
      return;
    }
    pushHistory();
    const changed = replaceColorEverywhere(state.beads.replaceFrom, state.beads.replaceTo);
    if (!changed) {
      state.beads.undoStack.pop();
      updateHistoryButtons();
      setMessage("没有需要替换的格子。", true);
      return;
    }
    setMessage(`已替换 ${changed} 个格子。`, false);
    render();
  }

  function getUsageForExport(pattern, settings) {
    const usage = calculateUsage(pattern);
    if (!settings || settings.sortUsage !== false) return usage;
    return usage.sort((a, b) => a.code.localeCompare(b.code));
  }

  function getExportRatioNumbers(settings) {
    const ratio = settings && settings.exportRatio ? settings.exportRatio : "auto";
    let width = 0;
    let height = 0;
    if (ratio === "1:1") [width, height] = [1, 1];
    if (ratio === "4:3") [width, height] = [4, 3];
    if (ratio === "16:9") [width, height] = [16, 9];
    if (ratio === "custom") {
      width = clamp(settings.exportRatioWidth || 4, 1, 99);
      height = clamp(settings.exportRatioHeight || 3, 1, 99);
    }
    if (!width || !height) return null;
    if (settings.paperOrientation === "portrait" && width > height) [width, height] = [height, width];
    if (settings.paperOrientation === "landscape" && height > width) [width, height] = [height, width];
    return { width, height, value: width / height };
  }

  function getPaperPresetSize(settings) {
    const preset = settings.paperPreset || "auto";
    const sizes = {
      a4: [2480, 3508],
      a3: [3508, 4961],
      square: [3000, 3000],
      long: [2400, 4200]
    };
    const ratio = getExportRatioNumbers(settings);
    if (!sizes[preset] && !ratio) return null;
    let [width, height] = sizes[preset] || [3200, 3200];
    if (settings.paperOrientation === "landscape" && height > width) [width, height] = [height, width];
    if (settings.paperOrientation !== "landscape" && width > height && preset !== "square") [width, height] = [height, width];
    if (ratio) {
      const longSide = Math.max(width, height);
      if (ratio.width >= ratio.height) {
        width = longSide;
        height = Math.round(longSide * ratio.height / ratio.width);
      } else {
        height = longSide;
        width = Math.round(longSide * ratio.width / ratio.height);
      }
    }
    if (settings._renderScale && settings._renderScale > 1) {
      width = Math.round(width * settings._renderScale);
      height = Math.round(height * settings._renderScale);
    }
    return { width, height };
  }

  function getDefaultExportCellSize(pattern) {
    const maxCells = Math.max(pattern.width, pattern.height);
    if (maxCells <= 64) return 40;
    if (maxCells <= 128) return 34;
    if (maxCells <= 180) return 28;
    return 22;
  }

  function getAxisSize(cellSize, settings) {
    if (settings.showAxisNumbers === false) return 0;
    const scale = settings._renderScale || 1;
    return clamp(Math.round(cellSize * 1.15), Math.round(18 * scale), Math.round(34 * scale));
  }

  function getExportLayout(pattern, settings, usage) {
    const scale = settings._renderScale || 1;
    const margin = clamp(settings.exportMargin || 42 * scale, 12 * scale, 160 * scale);
    const headerHeight = settings.showInfo || settings.showAppInfo ? 78 * scale : 18 * scale;
    let cellSize = settings.exportAutoCellSize === false
      ? clamp(settings.exportCellSize || 22, 8, Math.round(44 * (settings._renderScale || 1)))
      : getDefaultExportCellSize(pattern);
    let axisSize = getAxisSize(cellSize, settings);
    let paper = getPaperPresetSize(settings);
    let gridWidth = pattern.width * cellSize;
    let usageMetrics = settings.showUsage ? measureUsageFooter(usage, gridWidth, settings) : { height: 0 };

    if (paper) {
      const contentWidth = Math.max(120, paper.width - margin * 2);
      const availableWidth = Math.max(80, contentWidth - axisSize * 2);
      const availableHeight = Math.max(
        80,
        paper.height - margin * 2 - headerHeight - axisSize * 2 - (usageMetrics.height ? usageMetrics.height + 18 : 0)
      );
      const fitCell = Math.floor(Math.min(availableWidth / pattern.width, availableHeight / pattern.height));
      cellSize = Math.max(4, Math.min(cellSize, fitCell));
      axisSize = getAxisSize(cellSize, settings);
      gridWidth = pattern.width * cellSize;
      usageMetrics = settings.showUsage ? measureUsageFooter(usage, contentWidth, settings) : { height: 0 };
      const gridHeight = pattern.height * cellSize;
      const gridAreaWidth = Math.max(gridWidth, contentWidth - axisSize * 2);
      const gridAreaHeight = Math.max(
        gridHeight,
        paper.height - margin * 2 - headerHeight - axisSize * 2 - (usageMetrics.height ? usageMetrics.height + 18 : 0)
      );
      return {
        width: paper.width,
        height: paper.height,
        margin,
        headerHeight,
        cellSize,
        axisSize,
        gridWidth,
        gridHeight,
        usageMetrics,
        gridX: Math.round(margin + axisSize + Math.max(0, gridAreaWidth - gridWidth) / 2),
        gridY: Math.round(margin + headerHeight + axisSize + Math.max(0, gridAreaHeight - gridHeight) / 2),
        usageX: margin,
        usageY: Math.max(margin + headerHeight + axisSize + gridHeight + 20, paper.height - margin - usageMetrics.height),
        usageWidth: contentWidth
      };
    }

    const maxSide = 22000;
    const maxCellBySide = Math.max(4, Math.floor((maxSide - margin * 2 - axisSize * 2) / Math.max(pattern.width, pattern.height)));
    cellSize = Math.min(cellSize, maxCellBySide);
    axisSize = getAxisSize(cellSize, settings);
    gridWidth = pattern.width * cellSize;
    const gridHeight = pattern.height * cellSize;
    usageMetrics = settings.showUsage ? measureUsageFooter(usage, gridWidth + axisSize * 2, settings) : { height: 0 };
    return {
      width: Math.ceil(margin * 2 + axisSize * 2 + gridWidth),
      height: Math.ceil(margin * 2 + headerHeight + axisSize * 2 + gridHeight + usageMetrics.height),
      margin,
      headerHeight,
      cellSize,
      axisSize,
      gridWidth,
      gridHeight,
      usageMetrics,
      gridX: margin + axisSize,
      gridY: margin + headerHeight + axisSize,
      usageX: margin,
      usageY: margin + headerHeight + axisSize * 2 + gridHeight + 24,
      usageWidth: gridWidth + axisSize * 2
    };
  }

  function makeBeadExportCanvas(pattern, overrideSettings) {
    if (!pattern) return null;
    const settings = Object.assign({}, state.beads.exportSettings, overrideSettings || {});
    const requestedScale = Math.max(1, Math.min(Number(settings.exportScale) || 1, 8));
    const baseCellSizeForLimit = settings.exportAutoCellSize === false
      ? (settings.exportCellSize || getDefaultExportCellSize(pattern))
      : getDefaultExportCellSize(pattern);
    const maxSafeSide = 22000;
    const baseGridSide = Math.max(pattern.width, pattern.height) * baseCellSizeForLimit + (settings.exportMargin || 42) * 2 + 120;
    const renderScale = Math.max(1, Math.min(requestedScale, maxSafeSide / Math.max(1, baseGridSide)));
    const previousScale = settings._renderScale || 1;
    if (!settings._renderingScaled && renderScale > 1.01) {
      const baseCellSize = settings.exportAutoCellSize === false
        ? (settings.exportCellSize || getDefaultExportCellSize(pattern))
        : getDefaultExportCellSize(pattern);
      return makeBeadExportCanvas(pattern, Object.assign({}, settings, {
        _renderingScaled: true,
        _renderScale: renderScale,
        exportScale: 1,
        exportAutoCellSize: false,
        exportCellSize: Math.round(baseCellSize * renderScale),
        exportMargin: Math.round((settings.exportMargin || 42) * renderScale),
        usageFontSize: Math.round((settings.usageFontSize || 16) * renderScale),
        watermarkFontSize: Math.round((settings.watermarkFontSize || 20) * renderScale),
        watermarkRowGap: settings.watermarkRowGap,
        watermarkColGap: settings.watermarkColGap,
        watermarkOffsetX: Math.round((settings.watermarkOffsetX || 0) * renderScale),
        watermarkOffsetY: Math.round((settings.watermarkOffsetY || 0) * renderScale)
      }));
    }
    const usage = getUsageForExport(pattern, settings);
    const total = usage.reduce((sum, item) => sum + item.count, 0);
    const layout = getExportLayout(pattern, settings, usage);
    const { width, height, margin, headerHeight, cellSize, axisSize, gridWidth, gridHeight } = layout;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    if (!settings.exportTransparentBackground) {
      ctx.fillStyle = settings.exportBackgroundColor || "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    if (settings.showInfo) {
      ctx.fillStyle = "#172033";
      ctx.font = `800 ${28 * previousScale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(settings.pageTitle || state.beads.projectTitle || "Q像素拼豆图纸", margin, margin);
      ctx.font = `600 ${15 * previousScale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillStyle = "#667085";
      const sourceText = settings.pageSubtitle || `${pattern.width} x ${pattern.height} 格 · ${usage.length} 色 · ${total} 颗`;
      ctx.fillText(sourceText, margin, margin + 38);
    }
    if (settings.showAppInfo) {
      ctx.textAlign = "right";
      ctx.fillStyle = "#172033";
      ctx.font = `900 ${18 * previousScale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText("Q像素", width - margin, margin + 2);
      ctx.textAlign = "left";
    }

    const gridX = layout.gridX;
    const gridY = layout.gridY;
    drawPatternGrid(ctx, pattern, gridX, gridY, cellSize, {
      showCodes: settings.showCodes,
      showGrid: settings.showGrid,
      showCenterLines: settings.showCenterLines,
      codeFontScale: Math.max(125, state.beads.codeFontScale || 125),
      pixelStyle: settings.exportPixelStyle || "current",
      cellGap: settings.exportPixelStyle && settings.exportPixelStyle !== "current" ? 0 : isPixelPatternActive(pattern) ? state.params.gap : 0,
      cellRadius: settings.exportPixelStyle && settings.exportPixelStyle !== "current" ? 0 : isPixelPatternActive(pattern) ? state.params.radius : 0,
      export: true
    });

    if (settings.showAxisNumbers !== false) {
      drawExportAxisNumbers(
        ctx,
        gridX,
        gridY,
        pattern.width,
        pattern.height,
        cellSize,
        axisSize,
        settings.axisStartCol || 1,
        settings.axisStartRow || 1
      );
    }

    if (settings.showOuterBorder !== false) {
      ctx.save();
      ctx.strokeStyle = "rgba(23, 32, 51, .55)";
      ctx.lineWidth = Math.max(1.2, Math.min(3, cellSize / 10));
      ctx.strokeRect(gridX, gridY, gridWidth, gridHeight);
      ctx.restore();
    }

    if (settings.showUsage) drawUsageFooter(ctx, usage, layout.usageX, layout.usageY, layout.usageWidth, settings);

    drawWatermark(ctx, width, height, settings);

    return canvas;
  }

  function scaleCanvasForExport(source, requestedScale) {
    const maxSide = 16000;
    const scale = Math.max(1, Math.min(Number(requestedScale) || 1, maxSide / Math.max(source.width, source.height)));
    if (scale <= 1.01) return source;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(source.width * scale);
    canvas.height = Math.round(source.height * scale);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function measureUsageFooter(usage, gridWidth, settings) {
    const scale = settings._renderScale || 1;
    const fontSize = clamp(settings.usageFontSize || 16 * scale, 10 * scale, 28 * scale);
    const isTable = settings.usageStyle === "table";
    const itemWidth = isTable ? Math.max(190, Math.ceil(fontSize * 6.5 + 78)) : Math.max(142, Math.ceil(fontSize * 5.5 + 56));
    const columns = Math.max(1, Math.floor(gridWidth / itemWidth));
    const rows = Math.ceil(usage.length / columns);
    const rowHeight = isTable ? fontSize + 32 : fontSize + 28;
    return { columns, rows, itemWidth, rowHeight, fontSize, isTable, height: usage.length ? 36 + rows * rowHeight : 0 };
  }

  function drawUsageFooter(ctx, usage, x, y, gridWidth, settings) {
    const metrics = measureUsageFooter(usage, gridWidth, settings);
    if (!usage.length) return;
    const scale = settings._renderScale || 1;
    const swatchW = 20 * scale;
    const swatchX = 7 * scale;
    const cardInset = 8 * scale;
    ctx.save();
    ctx.fillStyle = "#172033";
    ctx.font = `900 ${18 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`色号统计 · 共 ${usage.length} 色`, x, y);
    const startY = y + 24 * scale;
    usage.forEach((item, index) => {
      const col = index % metrics.columns;
      const row = Math.floor(index / metrics.columns);
      const px = x + col * metrics.itemWidth;
      const py = startY + row * metrics.rowHeight;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "rgba(23, 32, 51, .18)";
      roundRectFillStroke(ctx, px, py, metrics.itemWidth - cardInset, metrics.rowHeight - 7 * scale, 5 * scale);
      ctx.fillStyle = item.color.hex;
      ctx.fillRect(px + swatchX, py + 7 * scale, swatchW, metrics.rowHeight - 21 * scale);
      ctx.strokeStyle = "rgba(0, 0, 0, .18)";
      ctx.strokeRect(px + swatchX, py + 7 * scale, swatchW, metrics.rowHeight - 21 * scale);
      ctx.fillStyle = "#172033";
      ctx.font = `900 ${metrics.fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.fillText(item.code, px + 33 * scale, py + metrics.rowHeight / 2 - 2 * scale);
      ctx.fillStyle = "#4f83ee";
      ctx.textAlign = "right";
      ctx.fillText(String(item.count), px + metrics.itemWidth - 16 * scale, py + metrics.rowHeight / 2 - 2 * scale);
      if (metrics.isTable) {
        ctx.textAlign = "left";
        ctx.fillStyle = "#667085";
        ctx.font = `700 ${Math.max(9, metrics.fontSize - 4)}px -apple-system, BlinkMacSystemFont, sans-serif`;
        const name = item.color.name.length > 6 ? `${item.color.name.slice(0, 6)}…` : item.color.name;
        ctx.fillText(name, px + 33 * scale, py + metrics.rowHeight / 2 + metrics.fontSize - 4 * scale);
      }
      ctx.textAlign = "left";
    });
    ctx.restore();
  }

  function drawExportAxisNumbers(ctx, x, y, cols, rows, cellSize, axisSize, startCol = 1, startRow = 1) {
    if (!axisSize) return;
    const gridWidth = cols * cellSize;
    const gridHeight = rows * cellSize;
    const scale = Math.max(1, axisSize / 22);
    const fontSize = clamp(Math.floor(axisSize * 0.42), 7 * scale, 12 * scale);
    const step = cellSize >= 12 ? 1 : cellSize >= 7 ? 5 : 10;
    ctx.save();
    ctx.fillStyle = "#d9dde2";
    ctx.fillRect(x, y - axisSize, gridWidth, axisSize);
    ctx.fillRect(x, y + gridHeight, gridWidth, axisSize);
    ctx.fillRect(x - axisSize, y, axisSize, gridHeight);
    ctx.fillRect(x + gridWidth, y, axisSize, gridHeight);
    ctx.fillStyle = "#5b6472";
    ctx.font = `800 ${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let col = 0; col < cols; col += 1) {
      if (col % step !== 0 && col !== cols - 1) continue;
      const label = String(startCol + col);
      const px = x + col * cellSize + cellSize / 2;
      ctx.fillText(label, px, y - axisSize / 2);
      ctx.fillText(label, px, y + gridHeight + axisSize / 2);
    }
    for (let row = 0; row < rows; row += 1) {
      if (row % step !== 0 && row !== rows - 1) continue;
      const label = String(startRow + row);
      const py = y + row * cellSize + cellSize / 2;
      ctx.fillText(label, x - axisSize / 2, py);
      ctx.fillText(label, x + gridWidth + axisSize / 2, py);
    }
    ctx.strokeStyle = "rgba(23, 32, 51, .22)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - axisSize, y - axisSize, gridWidth + axisSize * 2, gridHeight + axisSize * 2);
    ctx.restore();
  }

  function roundRectFillStroke(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    roundedRect(ctx, x, y, width, height, radius);
    ctx.fill();
    ctx.stroke();
  }

  function drawWatermark(ctx, width, height, settings) {
    const text = settings.watermark || "";
    if (!settings.watermarkEnabled || !text.trim()) return;
    const fontSize = clamp(settings.watermarkFontSize || 20, 6, 64);
    const opacity = clamp(settings.watermarkOpacity || 30, 5, 100) / 100;
    const angle = clamp(settings.watermarkAngle || 0, -45, 45) * Math.PI / 180;
    const rowGap = Math.max(fontSize * 1.2, fontSize * clamp(settings.watermarkRowGap || 6, 1, 16));
    const colGap = Math.max(fontSize * 3, fontSize * clamp(settings.watermarkColGap || 8, 1, 16));
    const offsetX = clamp(settings.watermarkOffsetX || 0, -200, 200);
    const offsetY = clamp(settings.watermarkOffsetY || 0, -200, 200);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = settings.watermarkColor || "#222222";
    ctx.font = `${clamp(settings.watermarkWeight || 800, 300, 900)} ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let y = -rowGap + offsetY; y < height + rowGap; y += rowGap) {
      for (let x = -colGap + offsetX; x < width + colGap; x += colGap) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function makeMirroredPattern(pattern) {
    return Object.assign({}, pattern, {
      cells: pattern.cells.map((row) => row.slice().reverse())
    });
  }

  function cropPattern(pattern, startRow, startCol, tileRows, tileCols) {
    const safeStartRow = clamp(startRow, 0, Math.max(0, pattern.height - 1));
    const safeStartCol = clamp(startCol, 0, Math.max(0, pattern.width - 1));
    const height = Math.max(1, Math.min(tileRows, pattern.height - safeStartRow));
    const width = Math.max(1, Math.min(tileCols, pattern.width - safeStartCol));
    const cells = [];
    for (let row = 0; row < height; row += 1) {
      cells.push(pattern.cells[safeStartRow + row].slice(safeStartCol, safeStartCol + width));
    }
    return Object.assign({}, pattern, {
      width,
      height,
      cells,
      sourceLabel: pattern.sourceLabel || state.beads.sourceLabel || "图册分块"
    });
  }

  function makeExportRegionId() {
    return `region-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function clampExportRegion(region, pattern) {
    if (!pattern || !region) return null;
    const startRow = clamp(region.startRow, 0, Math.max(0, pattern.height - 1));
    const startCol = clamp(region.startCol, 0, Math.max(0, pattern.width - 1));
    const height = clamp(region.height, 1, Math.max(1, pattern.height - startRow));
    const width = clamp(region.width, 1, Math.max(1, pattern.width - startCol));
    return {
      id: region.id || makeExportRegionId(),
      name: region.name || `区域 ${startRow + 1}-${startRow + height} / ${startCol + 1}-${startCol + width}`,
      startRow,
      startCol,
      height,
      width
    };
  }

  function normalizeExportRegions(regions, pattern) {
    if (!Array.isArray(regions) || !pattern) return [];
    return regions
      .map((region) => clampExportRegion(region, pattern))
      .filter(Boolean);
  }

  function makeAutoExportRegions(pattern, rows, cols) {
    if (!pattern) return [];
    const safeRows = clamp(rows || 2, 1, 12);
    const safeCols = clamp(cols || 2, 1, 12);
    const regions = [];
    for (let rowIndex = 0; rowIndex < safeRows; rowIndex += 1) {
      const startRow = Math.floor(rowIndex * pattern.height / safeRows);
      const endRow = Math.floor((rowIndex + 1) * pattern.height / safeRows);
      for (let colIndex = 0; colIndex < safeCols; colIndex += 1) {
        const startCol = Math.floor(colIndex * pattern.width / safeCols);
        const endCol = Math.floor((colIndex + 1) * pattern.width / safeCols);
        regions.push({
          id: `auto-${rowIndex + 1}-${colIndex + 1}`,
          name: `区域 ${rowIndex + 1}-${colIndex + 1}`,
          startRow,
          startCol,
          height: Math.max(1, endRow - startRow),
          width: Math.max(1, endCol - startCol)
        });
      }
    }
    return normalizeExportRegions(regions, pattern);
  }

  function makeExportRegionsFromGuides(pattern, guidesOverride) {
    if (!pattern) return [];
    const guides = Array.isArray(guidesOverride) ? guidesOverride : normalizeGuideLines();
    const rowCuts = [0, pattern.height];
    const colCuts = [0, pattern.width];
    guides.forEach((guide) => {
      const normalized = normalizeGuideLine(guide, 0);
      if (normalized.orientation === "horizontal") {
        if (normalized.index > 0 && normalized.index < pattern.height) rowCuts.push(normalized.index);
      } else if (normalized.index > 0 && normalized.index < pattern.width) {
        colCuts.push(normalized.index);
      }
    });
    const uniqueSortedRows = Array.from(new Set(rowCuts)).sort((a, b) => a - b);
    const uniqueSortedCols = Array.from(new Set(colCuts)).sort((a, b) => a - b);
    if (uniqueSortedRows.length <= 2 && uniqueSortedCols.length <= 2) return [];
    const regions = [];
    for (let rowIndex = 0; rowIndex < uniqueSortedRows.length - 1; rowIndex += 1) {
      const startRow = uniqueSortedRows[rowIndex];
      const endRow = uniqueSortedRows[rowIndex + 1];
      if (endRow <= startRow) continue;
      for (let colIndex = 0; colIndex < uniqueSortedCols.length - 1; colIndex += 1) {
        const startCol = uniqueSortedCols[colIndex];
        const endCol = uniqueSortedCols[colIndex + 1];
        if (endCol <= startCol) continue;
        regions.push({
          id: `guide-${rowIndex + 1}-${colIndex + 1}`,
          name: `辅助线区域 ${regions.length + 1}`,
          startRow,
          startCol,
          height: endRow - startRow,
          width: endCol - startCol
        });
      }
    }
    return normalizeExportRegions(regions, pattern);
  }

  function getExportRegions(pattern) {
    if (!pattern || !state.beads.exportSettings.regionEnabled) return [];
    const custom = normalizeExportRegions(state.beads.exportRegions, pattern);
    if (custom.length) return custom;
    return makeAutoExportRegions(pattern, state.beads.exportSettings.regionRows, state.beads.exportSettings.regionCols);
  }

  function getSelectedExportRegion(pattern) {
    const regions = getExportRegions(pattern);
    if (!regions.length) return null;
    const selectedId = state.beads.exportSettings.regionSelectedId;
    return regions.find((region) => region.id === selectedId) || regions[0];
  }

  function makeRegionPattern(pattern, region) {
    const safeRegion = clampExportRegion(region, pattern);
    if (!safeRegion) return null;
    const chunk = cropPattern(pattern, safeRegion.startRow, safeRegion.startCol, safeRegion.height, safeRegion.width);
    chunk.sourceLabel = pattern.sourceLabel || state.beads.sourceLabel || "区域图纸";
    return chunk;
  }

  function getRegionExportSettings(region, index, overrideSettings) {
    const settings = Object.assign({}, state.beads.exportSettings, overrideSettings || {});
    const rowEnd = region.startRow + region.height;
    const colEnd = region.startCol + region.width;
    return Object.assign(settings, {
      regionEnabled: false,
      pageTitle: `${state.beads.projectTitle || "Q像素图纸"} · ${region.name || `区域 ${index + 1}`}`,
      pageSubtitle: `行 ${region.startRow + 1}-${rowEnd} · 列 ${region.startCol + 1}-${colEnd} · ${region.width} x ${region.height} 格`,
      axisStartRow: 1,
      axisStartCol: 1
    });
  }

  function makeRegionCanvas(pattern, region, index = 0, overrideSettings) {
    const chunk = makeRegionPattern(pattern, region);
    if (!chunk) return null;
    return makeBeadExportCanvas(chunk, getRegionExportSettings(clampExportRegion(region, pattern), index, overrideSettings));
  }

  function getBestRegionPreviewColumns(pages, settings) {
    if (!pages.length) return 1;
    const ratio = getExportRatioNumbers(settings || {});
    if (!ratio) return Math.min(2, pages.length);
    const maxColumns = Math.min(8, pages.length);
    const gap = 42;
    const padding = 42;
    const headerHeight = 60;
    const cellWidth = Math.max(...pages.map((canvas) => canvas.width));
    const cellHeight = Math.max(...pages.map((canvas) => canvas.height));
    let best = 1;
    let bestScore = Infinity;
    for (let columns = 1; columns <= maxColumns; columns += 1) {
      const rows = Math.ceil(pages.length / columns);
      const width = padding * 2 + columns * cellWidth + (columns - 1) * gap;
      const height = padding * 2 + headerHeight + rows * cellHeight + Math.max(0, rows - 1) * gap;
      const score = Math.abs(width / height - ratio.value) + columns * 0.015;
      if (score < bestScore) {
        bestScore = score;
        best = columns;
      }
    }
    return best;
  }

  function stitchRegionCanvases(canvases, title, settings) {
    const pages = canvases.filter(Boolean);
    if (!pages.length) return null;
    const maxSide = 22000;
    const columns = getBestRegionPreviewColumns(pages, settings || state.beads.exportSettings);
    const gap = 42;
    const padding = 42;
    const headerHeight = 60;
    const cellWidth = Math.max(...pages.map((canvas) => canvas.width));
    const cellHeight = Math.max(...pages.map((canvas) => canvas.height));
    const rows = Math.ceil(pages.length / columns);
    const rawWidth = padding * 2 + columns * cellWidth + (columns - 1) * gap;
    const rawHeight = padding * 2 + headerHeight + rows * cellHeight + Math.max(0, rows - 1) * gap;
    const fitScale = Math.min(1, maxSide / Math.max(rawWidth, rawHeight));
    const width = Math.max(1, Math.round(rawWidth * fitScale));
    const height = Math.max(1, Math.round(rawHeight * fitScale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#f3f5f8";
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.scale(fitScale, fitScale);
    ctx.fillStyle = "#172033";
    ctx.font = "900 28px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(title || "Q像素分区图纸", padding, padding);
    pages.forEach((page, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = padding + col * (cellWidth + gap) + Math.round((cellWidth - page.width) / 2);
      const y = padding + headerHeight + row * (cellHeight + gap) + Math.round((cellHeight - page.height) / 2);
      ctx.drawImage(page, x, y);
      ctx.fillStyle = "#667085";
      ctx.font = "900 18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`区域 ${index + 1} / ${pages.length}`, x + page.width - 20, y + page.height - 24);
    });
    ctx.restore();
    return canvas;
  }

  function makeRegionPreviewCanvas(pattern, overrideSettings) {
    const regions = getExportRegions(pattern);
    if (!pattern || !regions.length) return null;
    const settings = Object.assign({}, state.beads.exportSettings, overrideSettings || {});
    const pages = regions.map((region, index) => makeRegionCanvas(pattern, region, index, settings));
    return stitchRegionCanvases(pages, `${state.beads.projectTitle || "Q像素图纸"} · 分区预览`, settings);
  }

  function syncExportRegionInputs() {
    if (!state.beads.pattern) return;
    const selected = getSelectedExportRegion(state.beads.pattern);
    if (!selected) {
      if (els.exportRegionStartRowInput) els.exportRegionStartRowInput.value = "1";
      if (els.exportRegionStartColInput) els.exportRegionStartColInput.value = "1";
      if (els.exportRegionHeightInput) els.exportRegionHeightInput.value = String(Math.min(52, state.beads.pattern.height));
      if (els.exportRegionWidthInput) els.exportRegionWidthInput.value = String(Math.min(52, state.beads.pattern.width));
      return;
    }
    if (els.exportRegionStartRowInput) els.exportRegionStartRowInput.value = String(selected.startRow + 1);
    if (els.exportRegionStartColInput) els.exportRegionStartColInput.value = String(selected.startCol + 1);
    if (els.exportRegionHeightInput) els.exportRegionHeightInput.value = String(selected.height);
    if (els.exportRegionWidthInput) els.exportRegionWidthInput.value = String(selected.width);
  }

  function renderExportRegionSelect() {
    if (!els.exportRegionSelect && !els.exportRegionMultiSelect) return;
    const regions = getExportRegions(state.beads.pattern);
    const previousMulti = els.exportRegionMultiSelect
      ? Array.from(els.exportRegionMultiSelect.selectedOptions || []).map((option) => option.value)
      : [];
    if (els.exportRegionSelect) els.exportRegionSelect.innerHTML = "";
    if (els.exportRegionMultiSelect) els.exportRegionMultiSelect.innerHTML = "";
    if (!regions.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "暂无区域";
      if (els.exportRegionSelect) els.exportRegionSelect.appendChild(option.cloneNode(true));
      if (els.exportRegionMultiSelect) els.exportRegionMultiSelect.appendChild(option);
      return;
    }
    regions.forEach((region, index) => {
      const option = document.createElement("option");
      option.value = region.id;
      option.textContent = `${index + 1}. ${region.name} · 行${region.startRow + 1}-${region.startRow + region.height} 列${region.startCol + 1}-${region.startCol + region.width}`;
      if (els.exportRegionSelect) els.exportRegionSelect.appendChild(option.cloneNode(true));
      if (els.exportRegionMultiSelect) {
        const multiOption = option.cloneNode(true);
        multiOption.selected = previousMulti.includes(region.id);
        els.exportRegionMultiSelect.appendChild(multiOption);
      }
    });
    const selected = regions.find((region) => region.id === state.beads.exportSettings.regionSelectedId) || regions[0];
    state.beads.exportSettings.regionSelectedId = selected.id;
    if (els.exportRegionSelect) els.exportRegionSelect.value = selected.id;
    if (els.exportRegionMultiSelect && !previousMulti.length) {
      Array.from(els.exportRegionMultiSelect.options).forEach((option) => {
        option.selected = option.value === selected.id;
      });
    }
  }

  function getRegionIdsFromMultiSelect() {
    if (!els.exportRegionMultiSelect) return [];
    return Array.from(els.exportRegionMultiSelect.selectedOptions || []).map((option) => option.value).filter(Boolean);
  }

  function autoGenerateExportRegions() {
    if (!state.beads.pattern) {
      setMessage("请先生成图纸。", true);
      return;
    }
    const rows = clamp(els.exportRegionRowsInput && els.exportRegionRowsInput.value, 1, 12);
    const cols = clamp(els.exportRegionColsInput && els.exportRegionColsInput.value, 1, 12);
    state.beads.exportSettings.regionRows = rows;
    state.beads.exportSettings.regionCols = cols;
    state.beads.exportSettings.regionEnabled = true;
    state.beads.exportRegions = makeAutoExportRegions(state.beads.pattern, rows, cols).map((region, index) => Object.assign({}, region, {
      id: makeExportRegionId(),
      name: `区域 ${index + 1}`
    }));
    state.beads.exportSettings.regionSelectedId = state.beads.exportRegions[0] ? state.beads.exportRegions[0].id : "";
    syncBeadControls();
    refreshExportPreviewIfOpen();
    setMessage(`已自动划分 ${state.beads.exportRegions.length} 个区域。`, false);
  }

  function generateExportRegionsFromGuides() {
    if (!state.beads.pattern) {
      setMessage("请先生成图纸。", true);
      return 0;
    }
    const regions = makeExportRegionsFromGuides(state.beads.pattern);
    if (!regions.length) {
      setMessage("请先添加至少 1 条位于画布内部的辅助线。", true);
      return 0;
    }
    state.beads.exportSettings.regionEnabled = true;
    state.beads.exportRegions = regions.map((region, index) => Object.assign({}, region, {
      id: makeExportRegionId(),
      name: `辅助线区域 ${index + 1}`
    }));
    state.beads.exportSettings.regionSelectedId = state.beads.exportRegions[0] ? state.beads.exportRegions[0].id : "";
    syncBeadControls();
    refreshExportPreviewIfOpen();
    setMessage(`已按辅助线划分 ${state.beads.exportRegions.length} 个区域。`, false);
    return state.beads.exportRegions.length;
  }

  function addCustomExportRegion() {
    if (!state.beads.pattern) {
      setMessage("请先生成图纸。", true);
      return;
    }
    const startRow = clamp(els.exportRegionStartRowInput && els.exportRegionStartRowInput.value, 1, state.beads.pattern.height) - 1;
    const startCol = clamp(els.exportRegionStartColInput && els.exportRegionStartColInput.value, 1, state.beads.pattern.width) - 1;
    const height = clamp(els.exportRegionHeightInput && els.exportRegionHeightInput.value, 1, state.beads.pattern.height - startRow);
    const width = clamp(els.exportRegionWidthInput && els.exportRegionWidthInput.value, 1, state.beads.pattern.width - startCol);
    const region = clampExportRegion({
      id: makeExportRegionId(),
      name: `区域 ${state.beads.exportRegions.length + 1}`,
      startRow,
      startCol,
      height,
      width
    }, state.beads.pattern);
    state.beads.exportSettings.regionEnabled = true;
    state.beads.exportRegions.push(region);
    state.beads.exportSettings.regionSelectedId = region.id;
    syncBeadControls();
    refreshExportPreviewIfOpen();
    setMessage("已添加局部区域。", false);
  }

  function deleteSelectedExportRegion() {
    const selected = getSelectedExportRegion(state.beads.pattern);
    if (!selected) return setMessage("没有可删除的区域。", true);
    state.beads.exportRegions = normalizeExportRegions(state.beads.exportRegions, state.beads.pattern).filter((region) => region.id !== selected.id);
    state.beads.exportSettings.regionSelectedId = state.beads.exportRegions[0] ? state.beads.exportRegions[0].id : "";
    syncBeadControls();
    refreshExportPreviewIfOpen();
    setMessage("已删除当前区域。", false);
  }

  function nudgeSelectedExportRegion(direction) {
    if (!state.beads.pattern) return setMessage("请先生成图纸。", true);
    const selected = getSelectedExportRegion(state.beads.pattern);
    if (!selected) return setMessage("请先添加或自动划分区域。", true);
    const regions = normalizeExportRegions(state.beads.exportRegions.length ? state.beads.exportRegions : getExportRegions(state.beads.pattern), state.beads.pattern);
    const index = regions.findIndex((region) => region.id === selected.id);
    if (index < 0) return setMessage("没有找到当前区域。", true);
    const amount = clamp(els.exportRegionNudgeInput && els.exportRegionNudgeInput.value, 1, 200);
    const region = Object.assign({}, regions[index]);
    if (direction === "up") region.startRow -= amount;
    if (direction === "down") region.startRow += amount;
    if (direction === "left") region.startCol -= amount;
    if (direction === "right") region.startCol += amount;
    regions[index] = clampExportRegion(region, state.beads.pattern);
    state.beads.exportRegions = regions;
    state.beads.exportSettings.regionEnabled = true;
    state.beads.exportSettings.regionSelectedId = regions[index].id;
    syncBeadControls();
    refreshExportPreviewIfOpen();
    setMessage(`已微调 ${regions[index].name}。`, false);
  }

  function makeRegionsExportCanvasByIds(ids) {
    if (!state.beads.pattern) return null;
    const regions = getExportRegions(state.beads.pattern);
    const selectedIds = new Set(ids && ids.length ? ids : regions.map((region) => region.id));
    const selectedRegions = regions.filter((region) => selectedIds.has(region.id));
    if (!selectedRegions.length) return null;
    if (selectedRegions.length === 1) return makeRegionCanvas(state.beads.pattern, selectedRegions[0], 0);
    const pages = selectedRegions.map((region, index) => makeRegionCanvas(state.beads.pattern, region, index));
    return stitchRegionCanvases(pages, `${state.beads.projectTitle || "Q像素图纸"} · 已选区域`, state.beads.exportSettings);
  }

  function getExportRegionsByIds(ids) {
    if (!state.beads.pattern) return [];
    const regions = getExportRegions(state.beads.pattern);
    const selectedIds = new Set(ids && ids.length ? ids : regions.map((region) => region.id));
    return regions.filter((region) => selectedIds.has(region.id));
  }

  function makeRegionExportCanvasesByIds(ids, includeMirror = false) {
    if (!state.beads.pattern) return [];
    const pages = [];
    getExportRegionsByIds(ids).forEach((region, index) => {
      const canvas = makeRegionCanvas(state.beads.pattern, region, index);
      if (canvas) pages.push({ region, index, canvas, mirror: false });
      if (includeMirror) {
        const chunk = makeRegionPattern(state.beads.pattern, region);
        const mirrored = chunk ? makeBeadExportCanvas(makeMirroredPattern(chunk), getRegionExportSettings(
          clampExportRegion(region, state.beads.pattern),
          index,
          { pageTitle: `${state.beads.projectTitle || "Q像素图纸"} · ${region.name || `区域 ${index + 1}`} · 镜像` }
        )) : null;
        if (mirrored) pages.push({ region, index, canvas: mirrored, mirror: true });
      }
    });
    return pages;
  }

  async function saveRegionCanvasesAsSeparatePngs(items, prefix, messageLabel) {
    const pages = items.filter((item) => item && item.canvas && item.region);
    if (!pages.length) {
      setMessage("请先选择要导出的区域。", true);
      return 0;
    }
    const stamp = formatStamp(new Date());
    const safePrefix = safeFileName(prefix || "Q像素-区域图纸");
    const folderName = `${safePrefix}-${stamp}`;
    const files = [];
    for (let index = 0; index < pages.length; index += 1) {
      const item = pages[index];
      const region = item.region;
      const order = String(item.index + 1).padStart(2, "0");
      const regionName = safeFileName(region.name || `区域${index + 1}`);
      const mirrorText = item.mirror ? "-镜像" : "";
      const fileName = `${folderName}/${order}-${regionName}${mirrorText}-行${region.startRow + 1}-${region.startRow + region.height}-列${region.startCol + 1}-${region.startCol + region.width}.png`;
      const blob = await canvasToPngBlob(item.canvas);
      if (blob) files.push({ name: fileName, bytes: await blobToBytes(blob) });
    }
    if (!files.length) {
      setMessage("区域图纸生成失败，请重试。", true);
      return 0;
    }
    saveBlobFile(
      makeZipBlob(files),
      `${folderName}.zip`,
      "application/zip",
      `${messageLabel || "区域图纸"}已打包：${files.length} 张 PNG。`
    );
    return pages.length;
  }

  function exportSelectedRegionPng() {
    if (!state.beads.pattern) return setMessage("请先生成图纸。", true);
    const region = getSelectedExportRegion(state.beads.pattern);
    if (!region) return setMessage("请先添加或自动划分区域。", true);
    saveRegionCanvasesAsSeparatePngs(
      makeRegionExportCanvasesByIds([region.id], state.beads.exportSettings.exportMirror),
      "Q像素-当前区域图纸",
      "当前区域图纸"
    );
  }

  function exportMultiRegionPng() {
    const ids = getRegionIdsFromMultiSelect();
    const pages = makeRegionExportCanvasesByIds(ids, state.beads.exportSettings.exportMirror);
    saveRegionCanvasesAsSeparatePngs(pages, "Q像素-多选区域图纸", "多选区域图纸");
  }

  function exportAllRegionsPng() {
    const regions = getExportRegions(state.beads.pattern);
    if (!regions.length) return setMessage("请先添加或自动划分区域。", true);
    const pages = makeRegionExportCanvasesByIds(regions.map((region) => region.id), state.beads.exportSettings.exportMirror);
    saveRegionCanvasesAsSeparatePngs(pages, "Q像素-全部区域图纸", "全部区域图纸");
  }

  function makeAlbumCanvases(pattern, overrideSettings) {
    if (!pattern) return [];
    const settings = Object.assign({}, state.beads.exportSettings, overrideSettings || {});
    const tileSize = clamp(settings.albumTileSize || 52, 20, 100);
    const canvases = [];
    if (settings.albumIncludeOverview !== false) {
      canvases.push(makeBeadExportCanvas(pattern, {
        pageTitle: `${state.beads.projectTitle || "Q像素拼豆图纸"} · 总览`,
        pageSubtitle: `${pattern.width} x ${pattern.height} 格 · 总览页 · 分块 ${tileSize} x ${tileSize}`
      }));
    }
    let pageIndex = 1;
    for (let row = 0; row < pattern.height; row += tileSize) {
      for (let col = 0; col < pattern.width; col += tileSize) {
        const chunk = cropPattern(pattern, row, col, tileSize, tileSize);
        const rowEnd = row + chunk.height;
        const colEnd = col + chunk.width;
        const pageTitle = settings.albumShowPageTitle === false
          ? state.beads.projectTitle || "Q像素拼豆图纸"
          : `${state.beads.projectTitle || "Q像素拼豆图纸"} · 分块 ${pageIndex}`;
        const pageSubtitle = settings.albumShowPageTitle === false
          ? `${chunk.width} x ${chunk.height} 格`
          : `列 ${col + 1}-${colEnd} · 行 ${row + 1}-${rowEnd} · ${chunk.width} x ${chunk.height} 格`;
        canvases.push(makeBeadExportCanvas(chunk, {
          paperPreset: settings.paperPreset === "auto" ? "a4" : settings.paperPreset,
          pageTitle,
          pageSubtitle
        }));
        pageIndex += 1;
      }
    }
    return canvases.filter(Boolean);
  }

  function stitchCanvases(canvases) {
    if (!canvases.length) return null;
    const gap = 36;
    const padding = 36;
    const width = Math.max(...canvases.map((canvas) => canvas.width)) + padding * 2;
    const height = canvases.reduce((sum, canvas) => sum + canvas.height, padding * 2 + gap * (canvases.length - 1));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f3f5f8";
    ctx.fillRect(0, 0, width, height);
    let y = padding;
    canvases.forEach((page, index) => {
      const x = Math.round((width - page.width) / 2);
      ctx.drawImage(page, x, y);
      ctx.fillStyle = "#667085";
      ctx.font = "800 18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`第 ${index + 1} / ${canvases.length} 页`, x + page.width - 24, y + page.height - 24);
      y += page.height + gap;
    });
    return canvas;
  }

  function makeAlbumExportCanvas(pattern, overrideSettings) {
    return stitchCanvases(makeAlbumCanvases(pattern, overrideSettings));
  }

  function saveBlobFile(blob, fileName, mime, message) {
    if (!blob) return setMessage("导出失败，请重试。", true);
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.exportFile) {
      const reader = new FileReader();
      reader.onload = () => {
        state.pendingSaveMessage = message || "文件已保存。";
        window.webkit.messageHandlers.exportFile.postMessage({ fileName, dataUrl: reader.result });
        setMessage("请选择保存位置。", false);
      };
      reader.readAsDataURL(blob);
      return;
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 500);
    setMessage(message || "文件已导出。", false);
  }

  function canvasToPngBlob(canvas) {
    return new Promise((resolve) => {
      if (!canvas) return resolve(null);
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  function blobToBytes(blob) {
    if (!blob) return Promise.resolve(new Uint8Array());
    return blob.arrayBuffer().then((buffer) => new Uint8Array(buffer));
  }

  let crcTable = null;
  function getCrcTable() {
    if (crcTable) return crcTable;
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      crcTable[n] = c >>> 0;
    }
    return crcTable;
  }

  function crc32(bytes) {
    const table = getCrcTable();
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i += 1) c = table[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }

  function dosDateTime(date) {
    const d = date || new Date();
    const time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | (Math.floor(d.getSeconds() / 2) & 31);
    const day = Math.max(1, d.getDate());
    const month = d.getMonth() + 1;
    const year = Math.max(1980, d.getFullYear()) - 1980;
    return {
      time,
      date: ((year & 127) << 9) | ((month & 15) << 5) | (day & 31)
    };
  }

  function writeUint16(array, offset, value) {
    array[offset] = value & 0xff;
    array[offset + 1] = (value >>> 8) & 0xff;
  }

  function writeUint32(array, offset, value) {
    array[offset] = value & 0xff;
    array[offset + 1] = (value >>> 8) & 0xff;
    array[offset + 2] = (value >>> 16) & 0xff;
    array[offset + 3] = (value >>> 24) & 0xff;
  }

  function makeZipBlob(files) {
    const encoder = new TextEncoder();
    const now = dosDateTime(new Date());
    const parts = [];
    const central = [];
    let offset = 0;
    files.forEach((file) => {
      const nameBytes = encoder.encode(file.name);
      const data = file.bytes || new Uint8Array();
      const crc = crc32(data);
      const local = new Uint8Array(30 + nameBytes.length);
      writeUint32(local, 0, 0x04034b50);
      writeUint16(local, 4, 20);
      writeUint16(local, 6, 0x0800);
      writeUint16(local, 8, 0);
      writeUint16(local, 10, now.time);
      writeUint16(local, 12, now.date);
      writeUint32(local, 14, crc);
      writeUint32(local, 18, data.length);
      writeUint32(local, 22, data.length);
      writeUint16(local, 26, nameBytes.length);
      local.set(nameBytes, 30);
      parts.push(local, data);

      const record = new Uint8Array(46 + nameBytes.length);
      writeUint32(record, 0, 0x02014b50);
      writeUint16(record, 4, 20);
      writeUint16(record, 6, 20);
      writeUint16(record, 8, 0x0800);
      writeUint16(record, 10, 0);
      writeUint16(record, 12, now.time);
      writeUint16(record, 14, now.date);
      writeUint32(record, 16, crc);
      writeUint32(record, 20, data.length);
      writeUint32(record, 24, data.length);
      writeUint16(record, 28, nameBytes.length);
      writeUint32(record, 42, offset);
      record.set(nameBytes, 46);
      central.push(record);
      offset += local.length + data.length;
    });
    const centralOffset = offset;
    central.forEach((record) => {
      parts.push(record);
      offset += record.length;
    });
    const end = new Uint8Array(22);
    writeUint32(end, 0, 0x06054b50);
    writeUint16(end, 8, files.length);
    writeUint16(end, 10, files.length);
    writeUint32(end, 12, offset - centralOffset);
    writeUint32(end, 16, centralOffset);
    parts.push(end);
    return new Blob(parts, { type: "application/zip" });
  }

  function makePdfFromCanvases(canvases) {
    const pages = canvases.filter(Boolean);
    if (!pages.length) return null;
    const parts = [];
    const offsets = [];
    const push = (value) => {
      offsets.push(parts.reduce((sum, part) => sum + part.length, 0));
      parts.push(value);
    };
    parts.push("%PDF-1.4\n");
    const pageObjectIds = pages.map((_, index) => 3 + index * 3);
    push("1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n");
    push(`2 0 obj<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>endobj\n`);
    pages.forEach((canvas, index) => {
      const pageObjectId = 3 + index * 3;
      const imageObjectId = pageObjectId + 1;
      const contentObjectId = pageObjectId + 2;
      const imageName = `Im${index}`;
      const img = canvas.toDataURL("image/jpeg", 0.92).split(",")[1];
      const imgBytes = atob(img);
      const pageWidth = canvas.width;
      const pageHeight = canvas.height;
      push(`${pageObjectId} 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /${imageName} ${imageObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>endobj\n`);
      push(`${imageObjectId} 0 obj<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgBytes.length} >>stream\n${imgBytes}\nendstream endobj\n`);
      const content = `q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /${imageName} Do Q`;
      push(`${contentObjectId} 0 obj<< /Length ${content.length} >>stream\n${content}\nendstream endobj\n`);
    });
    const xrefStart = parts.reduce((sum, part) => sum + part.length, 0);
    parts.push(`xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`);
    offsets.forEach((offset) => parts.push(`${String(offset).padStart(10, "0")} 00000 n \n`));
    parts.push(`trailer<< /Size ${offsets.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);
    const merged = parts.join("");
    const bytes = new Uint8Array(merged.length);
    for (let i = 0; i < merged.length; i += 1) bytes[i] = merged.charCodeAt(i) & 0xff;
    return new Blob([bytes], { type: "application/pdf" });
  }

  function makeSimplePdfFromCanvas(canvas) {
    return makePdfFromCanvases([canvas]);
  }

  function isPixelPatternActive(pattern) {
    return (pattern && pattern.sourceLabel === "像素画结果") || state.beads.sourceLabel === "像素画结果";
  }

  function getExportKindName() {
    return isPixelPatternActive() ? "像素画图纸" : "拼豆图纸";
  }

  function saveCanvasAsPng(canvas, fileName, chooseMessage, savedMessage) {
    if (!canvas) {
      setMessage("没有可导出的内容。", true);
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        setMessage("导出失败，请重试。", true);
        return;
      }
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.exportPng) {
        const reader = new FileReader();
        reader.onload = () => {
          state.pendingSaveMessage = savedMessage || "PNG 已保存。";
          window.webkit.messageHandlers.exportPng.postMessage({
            fileName,
            dataUrl: reader.result
          });
          setMessage(chooseMessage || "请选择 PNG 保存位置。", false);
        };
        reader.onerror = () => setMessage("导出失败，请重试。", true);
        reader.readAsDataURL(blob);
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 500);
      setMessage(savedMessage || "PNG 已导出。", false);
    }, "image/png");
  }

  function exportPixelPng() {
    const editablePattern = state.beads.pattern && state.beads.sourceLabel === "像素画结果" ? state.beads.pattern : null;
    const canvas = editablePattern
      ? makeBeadPixelCanvas(editablePattern, { cellGap: state.params.gap, cellRadius: state.params.radius })
      : makePixelExportCanvas();
    if (!canvas) {
      setMessage("请先选择图片。", true);
      return;
    }
    saveCanvasAsPng(
      canvas,
      `Q像素-${formatStamp(new Date())}.png`,
      "请选择 PNG 保存位置。",
      "PNG 已保存。"
    );
  }

  function exportBeadPng() {
    const canvas = makeCurrentExportCanvas();
    if (!canvas) {
      setMessage("请先载入图片或生成图纸。", true);
      return;
    }
    const kind = getExportKindName();
    saveCanvasAsPng(
      canvas,
      `Q像素-${kind}-${formatStamp(new Date())}.png`,
      "请选择图纸 PNG 保存位置。",
      `${kind} PNG 已保存。`
    );
    if (state.beads.exportSettings.exportMirror) {
      const mirrored = makeBeadExportCanvas(makeMirroredPattern(state.beads.pattern));
      saveCanvasAsPng(
        mirrored,
        `Q像素-拼豆镜像图-${formatStamp(new Date())}.png`,
        "请选择镜像图保存位置。",
        "拼豆镜像图已保存。"
      );
    }
    if (state.beads.exportSettings.exportPdf) {
      const pdfPages = [canvas];
      if (state.beads.exportSettings.exportMirror) {
        pdfPages.push(makeBeadExportCanvas(makeMirroredPattern(state.beads.pattern), {
          pageTitle: `${state.beads.projectTitle || "Q像素拼豆图纸"} · 镜像`
        }));
      }
      saveBlobFile(
        makePdfFromCanvases(pdfPages),
        `Q像素-${kind}-${formatStamp(new Date())}.pdf`,
        "application/pdf",
        `${kind} PDF 已保存。`
      );
    }
  }

  function exportMirrorPng() {
    if (!state.beads.pattern) {
      setMessage("请先生成拼豆图纸。", true);
      return;
    }
    const mirrored = makeBeadExportCanvas(makeMirroredPattern(state.beads.pattern), { exportMirror: false });
    saveCanvasAsPng(
      mirrored,
      `Q像素-拼豆镜像图-${formatStamp(new Date())}.png`,
      "请选择镜像图保存位置。",
      "拼豆镜像图已保存。"
    );
  }

  function exportAlbumPng() {
    if (!state.beads.pattern) {
      setMessage("请先生成拼豆图纸。", true);
      return;
    }
    const canvas = makeAlbumExportCanvas(state.beads.pattern);
    if (!canvas) {
      setMessage("图册生成失败，请重试。", true);
      return;
    }
    saveCanvasAsPng(
      canvas,
      `Q像素-拼豆图册-${formatStamp(new Date())}.png`,
      "请选择图册 PNG 保存位置。",
      "拼豆图册 PNG 已保存。"
    );
  }

  function exportPreviewPdf() {
    if (!state.beads.pattern) {
      setMessage("请先生成拼豆图纸。", true);
      return;
    }
    let pages = [];
    const regions = getExportRegions(state.beads.pattern);
    if (state.beads.exportSettings.regionEnabled && regions.length) {
      pages = regions.map((region, index) => makeRegionCanvas(state.beads.pattern, region, index));
    } else {
      pages = [makeBeadExportCanvas(state.beads.pattern)];
    }
    if (state.beads.exportSettings.exportMirror && !regions.length) {
      pages.push(makeBeadExportCanvas(makeMirroredPattern(state.beads.pattern), {
        pageTitle: `${state.beads.projectTitle || "Q像素拼豆图纸"} · 镜像`
      }));
    }
    saveBlobFile(
      makePdfFromCanvases(pages),
      `Q像素-拼豆图纸-${formatStamp(new Date())}.pdf`,
      "application/pdf",
      "拼豆图纸 PDF 已保存。"
    );
  }

  function makeCurrentExportCanvas() {
    if (!state.beads.pattern) return null;
    const regions = getExportRegions(state.beads.pattern);
    if (state.beads.exportSettings.regionEnabled && regions.length) {
      return makeRegionPreviewCanvas(state.beads.pattern);
    }
    return makeBeadExportCanvas(state.beads.pattern);
  }

  function drawExportPreview() {
    if (!els.exportPreviewCanvas) return false;
    const source = makeCurrentExportCanvas();
    if (!source) return false;
    const canvas = els.exportPreviewCanvas;
    canvas.width = source.width;
    canvas.height = source.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0);
    applyPreviewZoom(canvas, state.beads.exportPreviewZoom || 1);
    return true;
  }

  function openExportPreview() {
    if (state.mode === "pixel" && state.image) ensurePixelEditablePattern(false);
    if (!state.beads.pattern) {
      setMessage("请先载入图片或生成图纸。", true);
      return;
    }
    if (!drawExportPreview()) {
      setMessage("导出预览生成失败，请重试。", true);
      return;
    }
    els.exportPreviewModal.classList.remove("hidden");
  }

  function closeExportPreview() {
    if (els.exportPreviewModal) els.exportPreviewModal.classList.add("hidden");
  }

  function getMaterialPattern() {
    if (state.mode === "pixel" && state.image) ensurePixelEditablePattern(false);
    return state.beads.pattern;
  }

  function drawMaterialPreview() {
    const pattern = getMaterialPattern();
    if (!pattern || !els.materialPreviewCanvas) return false;
    const mode = els.materialModeSelect ? els.materialModeSelect.value : "normal";
    const base = els.materialBaseSelect ? els.materialBaseSelect.value : "transparent";
    const background = els.materialBackgroundSelect ? els.materialBackgroundSelect.value : "studio";
    const light = els.materialLightSelect ? els.materialLightSelect.value : "soft";
    const decor = els.materialDecorSelect ? els.materialDecorSelect.value : "none";
    const intensity = els.materialIntensityRange ? clamp(els.materialIntensityRange.value, 20, 100) / 100 : 0.7;
    const maxSide = 760;
    const cell = Math.max(4, Math.min(18, Math.floor(maxSide / Math.max(pattern.width, pattern.height))));
    const pad = 34;
    const canvas = els.materialPreviewCanvas;
    canvas.width = pattern.width * cell + pad * 2;
    canvas.height = pattern.height * cell + pad * 2;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaterialSceneBackground(ctx, canvas.width, canvas.height, background);
    drawMaterialBase(ctx, canvas.width, canvas.height, base);

    const art = document.createElement("canvas");
    art.width = pattern.width * cell;
    art.height = pattern.height * cell;
    const artCtx = art.getContext("2d");
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        const code = pattern.cells[row][col];
        if (!code || code === "H1") continue;
        const color = getPaletteColor(code);
        const x = col * cell;
        const y = row * cell;
        artCtx.fillStyle = mode === "black-glitter" && colorBrightness(color.rgb) < 150 ? "#08090b" : color.hex;
        artCtx.fillRect(x, y, cell, cell);
      }
    }

    ctx.save();
    ctx.globalAlpha = mode === "3d" ? 0.34 : 0.22;
    ctx.filter = `blur(${Math.max(3, cell * 0.34)}px)`;
    ctx.drawImage(art, pad + cell * 0.36, pad + cell * 0.48);
    ctx.restore();

    ctx.drawImage(art, pad, pad);

    ctx.save();
    beginMaterialShapePath(ctx, pattern, pad, pad, cell);
    ctx.clip();
    ctx.globalCompositeOperation = "source-over";

    if (mode === "normal") {
      const gloss = ctx.createLinearGradient(pad, pad, pad + art.width, pad + art.height);
      gloss.addColorStop(0, `rgba(255,255,255,${0.18 * intensity})`);
      gloss.addColorStop(0.45, "rgba(255,255,255,0)");
      gloss.addColorStop(1, `rgba(0,0,0,${0.08 * intensity})`);
      ctx.fillStyle = gloss;
      ctx.fillRect(pad, pad, art.width, art.height);
    }

    if (mode === "parchment") {
      ctx.fillStyle = `rgba(255,255,255,${0.28 * intensity})`;
      ctx.fillRect(pad, pad, art.width, art.height);
      ctx.strokeStyle = `rgba(120,98,75,${0.12 * intensity})`;
      ctx.lineWidth = Math.max(1, cell * 0.09);
      for (let y = pad - art.width; y < pad + art.height; y += cell * 1.6) {
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(pad + art.width, y + art.width * 0.18);
        ctx.stroke();
      }
    }

    if (mode === "coarse-towel" || mode === "fine-towel") {
      const step = mode === "coarse-towel" ? cell * 0.82 : cell * 0.48;
      ctx.lineWidth = mode === "coarse-towel" ? Math.max(1.4, cell * 0.18) : Math.max(0.9, cell * 0.1);
      ctx.strokeStyle = `rgba(255,255,255,${0.36 * intensity})`;
      for (let x = pad - art.height; x < pad + art.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, pad);
        ctx.lineTo(x + art.height, pad + art.height);
        ctx.stroke();
      }
      ctx.strokeStyle = `rgba(20,20,20,${0.08 * intensity})`;
      for (let x = pad - art.height + step / 2; x < pad + art.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, pad);
        ctx.lineTo(x + art.height, pad + art.height);
        ctx.stroke();
      }
    }

    if (mode === "wavy") {
      ctx.strokeStyle = `rgba(255,255,255,${0.34 * intensity})`;
      ctx.lineWidth = Math.max(1, cell * 0.12);
      for (let y = pad + cell * 0.5; y < pad + art.height; y += cell * 0.8) {
        ctx.beginPath();
        ctx.moveTo(pad, y);
        for (let x = pad; x <= pad + art.width; x += cell) {
          ctx.quadraticCurveTo(x + cell * 0.5, y - cell * 0.28, x + cell, y);
        }
        ctx.stroke();
      }
    }

    if (mode === "glitter" || mode === "black-glitter") {
      const sparkleCount = Math.max(60, Math.floor(pattern.width * pattern.height / 5));
      for (let i = 0; i < sparkleCount; i += 1) {
        const x = pad + ((i * 37) % Math.max(1, art.width));
        const y = pad + ((i * 53) % Math.max(1, art.height));
        const size = Math.max(1, ((i % 5) + 1) * cell * 0.08);
        ctx.fillStyle = mode === "black-glitter" ? `rgba(235,245,255,${0.6 * intensity})` : `rgba(255,255,255,${0.78 * intensity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        if (i % 4 === 0) {
          ctx.fillRect(x - size * 1.7, y - size * 0.35, size * 3.4, size * 0.7);
          ctx.fillRect(x - size * 0.35, y - size * 1.7, size * 0.7, size * 3.4);
        }
      }
    }

    if (mode === "holes") {
      ctx.globalCompositeOperation = "destination-out";
      for (let row = 0; row < pattern.height; row += 1) {
        for (let col = 0; col < pattern.width; col += 1) {
          if (!pattern.cells[row][col]) continue;
          ctx.beginPath();
          ctx.arc(pad + col * cell + cell / 2, pad + row * cell + cell / 2, Math.max(1, cell * 0.16), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = "source-atop";
    }

    ctx.restore();

    if (mode === "cross-stitch") {
      ctx.save();
      ctx.beginPath();
      ctx.rect(pad, pad, art.width, art.height);
      ctx.clip();
      for (let row = 0; row < pattern.height; row += 1) {
        for (let col = 0; col < pattern.width; col += 1) {
          const code = pattern.cells[row][col];
          if (!code) continue;
          const color = getPaletteColor(code);
          const x = pad + col * cell;
          const y = pad + row * cell;
          ctx.strokeStyle = color.hex;
          ctx.lineWidth = Math.max(1, cell * 0.14);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x + cell * 0.18, y + cell * 0.18);
          ctx.lineTo(x + cell * 0.82, y + cell * 0.82);
          ctx.moveTo(x + cell * 0.82, y + cell * 0.18);
          ctx.lineTo(x + cell * 0.18, y + cell * 0.82);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    if (mode === "3d") {
      ctx.save();
      beginMaterialShapePath(ctx, pattern, pad, pad, cell);
      ctx.clip();
      ctx.globalCompositeOperation = "source-over";
      const shine = ctx.createLinearGradient(pad, pad, pad, pad + art.height);
      shine.addColorStop(0, `rgba(255,255,255,${0.22 * intensity})`);
      shine.addColorStop(0.55, "rgba(255,255,255,0)");
      shine.addColorStop(1, `rgba(0,0,0,${0.18 * intensity})`);
      ctx.fillStyle = shine;
      ctx.fillRect(pad, pad, art.width, art.height);
      ctx.restore();
    }

    drawMaterialLight(ctx, pad, pad, art.width, art.height, light, intensity);
    drawMaterialDecor(ctx, canvas.width, canvas.height, decor, intensity);

    if (mode === "holes") {
      ctx.save();
      ctx.strokeStyle = `rgba(35,35,35,${0.18 * intensity})`;
      ctx.lineWidth = Math.max(0.5, cell * 0.05);
      for (let row = 0; row < pattern.height; row += 1) {
        for (let col = 0; col < pattern.width; col += 1) {
          if (!pattern.cells[row][col]) continue;
          ctx.beginPath();
          ctx.arc(pad + col * cell + cell / 2, pad + row * cell + cell / 2, Math.max(1, cell * 0.16), 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }
    return true;
  }

  function drawMaterialSceneBackground(ctx, width, height, background) {
    if (background === "transparent") return;
    if (background === "dark") {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#222734");
      gradient.addColorStop(1, "#0f1218");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      return;
    }
    if (background === "felt") {
      ctx.fillStyle = "#bfc1bb";
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = "#f7f5ef";
      for (let i = -height; i < width; i += 11) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      return;
    }
    if (background === "paper") {
      ctx.fillStyle = "#f8f2e7";
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < 140; i += 1) {
        ctx.fillStyle = i % 2 ? "#c7b99f" : "#ffffff";
        ctx.fillRect((i * 47) % width, (i * 29) % height, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
      return;
    }
    const gradient = ctx.createRadialGradient(width * 0.42, height * 0.28, 20, width * 0.5, height * 0.5, Math.max(width, height) * 0.78);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#e9edf4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawMaterialLight(ctx, x, y, width, height, light, intensity) {
    if (light === "none") return;
    ctx.save();
    const drawGradient = (gradient, color0, color1, composite = "screen") => {
      ctx.globalCompositeOperation = composite;
      gradient.addColorStop(0, color0);
      gradient.addColorStop(0.56, "rgba(255,255,255,0)");
      gradient.addColorStop(1, color1);
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, width, height);
    };
    if (light === "left") {
      drawGradient(ctx.createLinearGradient(x, y, x + width, y + height), `rgba(255,255,255,${0.32 * intensity})`, `rgba(0,0,0,${0.08 * intensity})`);
    } else if (light === "right") {
      drawGradient(ctx.createLinearGradient(x + width, y, x, y + height), `rgba(255,255,255,${0.32 * intensity})`, `rgba(0,0,0,${0.08 * intensity})`);
    } else if (light === "top") {
      drawGradient(ctx.createLinearGradient(x, y, x, y + height), `rgba(255,255,255,${0.34 * intensity})`, `rgba(0,0,0,${0.08 * intensity})`);
    } else if (light === "bottom") {
      drawGradient(ctx.createLinearGradient(x, y + height, x, y), `rgba(255,255,255,${0.22 * intensity})`, `rgba(0,0,0,${0.04 * intensity})`);
    } else if (light === "front") {
      drawGradient(ctx.createRadialGradient(x + width * 0.5, y + height * 0.42, 1, x + width * 0.5, y + height * 0.42, Math.max(width, height) * 0.68), `rgba(255,255,255,${0.30 * intensity})`, `rgba(0,0,0,${0.05 * intensity})`);
    } else if (light === "backlit") {
      ctx.globalCompositeOperation = "source-atop";
      ctx.shadowColor = `rgba(255,255,255,${0.78 * intensity})`;
      ctx.shadowBlur = Math.max(12, Math.min(width, height) * 0.055);
      ctx.strokeStyle = `rgba(255,255,255,${0.18 * intensity})`;
      ctx.lineWidth = Math.max(2, Math.min(width, height) * 0.012);
      ctx.strokeRect(x, y, width, height);
    } else if (light === "warm" || light === "cool") {
      const color = light === "warm" ? "255,220,156" : "172,218,255";
      drawGradient(ctx.createRadialGradient(x + width * 0.32, y + height * 0.2, 1, x + width * 0.32, y + height * 0.2, Math.max(width, height) * 0.75), `rgba(${color},${0.33 * intensity})`, `rgba(0,0,0,${0.06 * intensity})`);
    } else {
      const gradient = ctx.createRadialGradient(x + width * 0.34, y + height * 0.18, 1, x + width * 0.34, y + height * 0.18, Math.max(width, height) * 0.72);
      drawGradient(gradient, `rgba(255,255,255,${(light === "dramatic" ? 0.45 : 0.28) * intensity})`, `rgba(0,0,0,${(light === "dramatic" ? 0.22 : 0.08) * intensity})`);
    }
    ctx.restore();
  }

  function drawMaterialDecor(ctx, width, height, decor, intensity) {
    if (decor === "none") return;
    ctx.save();
    if (decor === "grain") {
      ctx.globalAlpha = 0.12 * intensity;
      for (let i = 0; i < 700; i += 1) {
        ctx.fillStyle = i % 2 ? "#000" : "#fff";
        ctx.fillRect((i * 41) % width, (i * 67) % height, 1, 1);
      }
    } else if (decor === "sparkle" || decor === "stars") {
      ctx.globalAlpha = 0.5 * intensity;
      for (let i = 0; i < (decor === "stars" ? 28 : 80); i += 1) {
        const x = (i * 73) % width;
        const y = (i * 47) % height;
        const size = decor === "stars" ? 5 + (i % 5) : 1 + (i % 3);
        ctx.fillStyle = "rgba(255,255,255,.9)";
        ctx.fillRect(x - size, y, size * 2, 1);
        ctx.fillRect(x, y - size, 1, size * 2);
      }
    }
    ctx.restore();
  }

  function getStyleStickerLibrary() {
    try {
      const parsed = JSON.parse(localStorage.getItem(styleStickerStorageKey) || "[]");
      return Array.isArray(parsed) ? parsed.filter((item) => item && item.dataUrl) : [];
    } catch {
      return [];
    }
  }

  function setStyleStickerLibrary(items) {
    const safe = items.slice(0, 80).map((item) => ({
      id: item.id || makeId(),
      name: item.name || "装饰素材",
      dataUrl: item.dataUrl
    }));
    try {
      localStorage.setItem(styleStickerStorageKey, JSON.stringify(safe));
    } catch {
      const compact = safe.slice(0, 24);
      state.beads.styleStickerLibrary = compact;
      try {
        localStorage.setItem(styleStickerStorageKey, JSON.stringify(compact));
      } catch (_) {
        // Keep the in-memory sticker library available for this session.
      }
      renderStyleStickerList();
      setMessage("贴纸库空间有限，已保留最近 24 个贴纸。", true);
      return;
    }
    state.beads.styleStickerLibrary = safe;
    renderStyleStickerList();
  }

  async function makeStickerItemFromFile(file) {
    const source = await readFileAsDataUrl(file);
    const image = await loadImageFromDataUrl(source);
    const maxSide = 768;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width || 1, image.naturalHeight || image.height || 1));
    if (scale >= 1 && source.length < 650000) {
      return {
        id: makeId(),
        name: file.name.replace(/\.[^.]+$/, "") || "贴纸",
        dataUrl: source
      };
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round((image.naturalWidth || image.width || 1) * scale));
    canvas.height = Math.max(1, Math.round((image.naturalHeight || image.height || 1) * scale));
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return {
      id: makeId(),
      name: file.name.replace(/\.[^.]+$/, "") || "贴纸",
      dataUrl: canvas.toDataURL("image/png")
    };
  }

  function ensureStyleStickerImage(dataUrl) {
    if (!dataUrl) return null;
    if (state.beads.styleStickerImages.has(dataUrl)) return state.beads.styleStickerImages.get(dataUrl);
    const image = new Image();
    image.onload = drawMaterialPreview;
    image.src = dataUrl;
    state.beads.styleStickerImages.set(dataUrl, image);
    return image;
  }

  function renderStyleStickerList() {
    if (!els.styleStickerList) return;
    const items = state.beads.styleStickerLibrary && state.beads.styleStickerLibrary.length
      ? state.beads.styleStickerLibrary
      : getStyleStickerLibrary();
    state.beads.styleStickerLibrary = items;
    els.styleStickerList.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("span");
      empty.className = "style-empty-chip";
      empty.textContent = "暂无贴纸";
      els.styleStickerList.appendChild(empty);
      return;
    }
    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "style-sticker-item";
      button.title = item.name || "贴纸";
      button.innerHTML = `<img alt=""><span></span>`;
      button.querySelector("img").src = item.dataUrl;
      button.querySelector("span").textContent = item.name || "贴纸";
      button.addEventListener("click", () => addStickerOverlay(item));
      els.styleStickerList.appendChild(button);
    });
  }

  function addStickerOverlay(item) {
    if (!item || !item.dataUrl) return;
    const canvas = els.materialPreviewCanvas;
    const size = els.styleStickerSizeRange ? clamp(els.styleStickerSizeRange.value, 24, 420) : 120;
    const overlay = {
      id: makeId(),
      type: "sticker",
      name: item.name || "贴纸",
      dataUrl: item.dataUrl,
      x: canvas ? Math.round(canvas.width * 0.56) : 420,
      y: canvas ? Math.round(canvas.height * 0.18) : 120,
      width: size,
      height: size,
      opacity: els.styleStickerOpacityRange ? clamp(els.styleStickerOpacityRange.value, 5, 100) / 100 : 1
    };
    state.beads.styleOverlays.push(overlay);
    state.beads.styleSelectedOverlayId = overlay.id;
    drawMaterialPreview();
  }

  function getStyleOverlayById(id) {
    if (!id) return null;
    return state.beads.styleOverlays.find((overlay) => overlay.id === id) || (state.beads.styleTextOverlay && state.beads.styleTextOverlay.id === id ? state.beads.styleTextOverlay : null);
  }

  function updateSelectedStickerFromControls() {
    const overlay = getStyleOverlayById(state.beads.styleSelectedOverlayId);
    if (!overlay || overlay.type !== "sticker") return;
    const size = els.styleStickerSizeRange ? clamp(els.styleStickerSizeRange.value, 24, 420) : overlay.width;
    const opacity = els.styleStickerOpacityRange ? clamp(els.styleStickerOpacityRange.value, 5, 100) / 100 : overlay.opacity;
    overlay.width = size;
    overlay.height = size;
    overlay.opacity = opacity;
    if (els.styleStickerSizeLabel) els.styleStickerSizeLabel.textContent = String(size);
    if (els.styleStickerOpacityLabel) els.styleStickerOpacityLabel.textContent = String(Math.round(opacity * 100));
    drawMaterialPreview();
  }

  function removeSelectedSticker() {
    const id = state.beads.styleSelectedOverlayId;
    if (!id) return;
    state.beads.styleOverlays = state.beads.styleOverlays.filter((overlay) => overlay.id !== id);
    if (state.beads.styleTextOverlay && state.beads.styleTextOverlay.id === id) state.beads.styleTextOverlay = null;
    state.beads.styleSelectedOverlayId = "";
    drawMaterialPreview();
  }

  function applyStyleTextOverlay() {
    const canvas = els.materialPreviewCanvas;
    const overlay = Object.assign({
      id: "style-text-overlay",
      type: "text",
      x: canvas ? Math.round(canvas.width * 0.08) : 80,
      y: canvas ? Math.round(canvas.height * 0.84) : 680
    }, state.beads.styleTextOverlay || {});
    overlay.text = els.styleTextInput ? els.styleTextInput.value || "Q像素" : "Q像素";
    overlay.font = els.styleTextFontSelect ? els.styleTextFontSelect.value || "system-ui" : "system-ui";
    overlay.size = els.styleTextSizeRange ? clamp(els.styleTextSizeRange.value, 12, 220) : 48;
    overlay.weight = els.styleTextWeightRange ? clamp(els.styleTextWeightRange.value, 100, 900) : 800;
    overlay.color = els.styleTextColorInput ? els.styleTextColorInput.value : "#172033";
    overlay.opacity = els.styleTextOpacityRange ? clamp(els.styleTextOpacityRange.value, 5, 100) / 100 : 1;
    overlay.strokeColor = els.styleTextStrokeColorInput ? els.styleTextStrokeColorInput.value : "#ffffff";
    overlay.strokeWidth = els.styleTextStrokeWidthRange ? clamp(els.styleTextStrokeWidthRange.value, 0, 18) : 3;
    overlay.shadowBlur = els.styleTextShadowRange ? clamp(els.styleTextShadowRange.value, 0, 60) : 18;
    state.beads.styleTextOverlay = overlay;
    state.beads.styleSelectedOverlayId = overlay.id;
    updateStyleTextLabels();
    drawMaterialPreview();
  }

  function updateStyleTextLabels() {
    if (els.styleTextSizeLabel) els.styleTextSizeLabel.textContent = String(els.styleTextSizeRange ? els.styleTextSizeRange.value : 48);
    if (els.styleTextWeightLabel) els.styleTextWeightLabel.textContent = String(els.styleTextWeightRange ? els.styleTextWeightRange.value : 800);
    if (els.styleTextOpacityLabel) els.styleTextOpacityLabel.textContent = String(els.styleTextOpacityRange ? els.styleTextOpacityRange.value : 100);
    if (els.styleTextStrokeWidthLabel) els.styleTextStrokeWidthLabel.textContent = String(els.styleTextStrokeWidthRange ? els.styleTextStrokeWidthRange.value : 3);
    if (els.styleTextShadowLabel) els.styleTextShadowLabel.textContent = String(els.styleTextShadowRange ? els.styleTextShadowRange.value : 18);
  }

  function drawStyleUserOverlays(ctx) {
    const overlays = [...state.beads.styleOverlays];
    if (state.beads.styleTextOverlay) overlays.push(state.beads.styleTextOverlay);
    overlays.forEach((overlay) => {
      ctx.save();
      ctx.globalAlpha = overlay.opacity == null ? 1 : overlay.opacity;
      if (overlay.type === "sticker") {
        const image = ensureStyleStickerImage(overlay.dataUrl);
        if (image && image.complete && image.naturalWidth) {
          ctx.drawImage(image, overlay.x, overlay.y, overlay.width, overlay.height);
          overlay._bounds = { x: overlay.x, y: overlay.y, width: overlay.width, height: overlay.height };
        }
      } else if (overlay.type === "text") {
        const font = overlay.font || "system-ui";
        ctx.font = `${overlay.weight || 800} ${overlay.size || 48}px ${font}`;
        ctx.textBaseline = "top";
        ctx.lineJoin = "round";
        const width = Math.max(1, ctx.measureText(overlay.text || "").width);
        const height = (overlay.size || 48) * 1.18;
        ctx.shadowColor = "rgba(0,0,0,.28)";
        ctx.shadowBlur = overlay.shadowBlur || 0;
        ctx.shadowOffsetX = (overlay.shadowBlur || 0) ? 3 : 0;
        ctx.shadowOffsetY = (overlay.shadowBlur || 0) ? 5 : 0;
        if (overlay.strokeWidth) {
          ctx.strokeStyle = overlay.strokeColor || "#ffffff";
          ctx.lineWidth = overlay.strokeWidth;
          ctx.strokeText(overlay.text || "", overlay.x, overlay.y);
        }
        ctx.fillStyle = overlay.color || "#172033";
        ctx.fillText(overlay.text || "", overlay.x, overlay.y);
        overlay._bounds = { x: overlay.x, y: overlay.y, width, height };
      }
      if (overlay.id === state.beads.styleSelectedOverlayId && overlay._bounds) {
        const b = overlay._bounds;
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.setLineDash([8, 5]);
        ctx.strokeStyle = "#4f7df3";
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x - 5, b.y - 5, b.width + 10, b.height + 10);
      }
      ctx.restore();
    });
  }

  function getStyleCanvasPoint(event) {
    const canvas = els.materialPreviewCanvas;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / Math.max(1, rect.width)),
      y: (event.clientY - rect.top) * (canvas.height / Math.max(1, rect.height))
    };
  }

  function findStyleOverlayAt(point) {
    const overlays = [...state.beads.styleOverlays];
    if (state.beads.styleTextOverlay) overlays.push(state.beads.styleTextOverlay);
    for (let i = overlays.length - 1; i >= 0; i -= 1) {
      const b = overlays[i]._bounds;
      if (!b) continue;
      if (point.x >= b.x - 8 && point.x <= b.x + b.width + 8 && point.y >= b.y - 8 && point.y <= b.y + b.height + 8) {
        return overlays[i];
      }
    }
    return null;
  }

  function handleStylePreviewPointerDown(event) {
    if (!els.materialPreviewCanvas) return;
    event.preventDefault();
    const point = getStyleCanvasPoint(event);
    state.beads.stylePreviewPointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    if (state.beads.stylePreviewPointers.size === 2) {
      const points = Array.from(state.beads.stylePreviewPointers.values());
      state.beads.stylePreviewPinch = {
        distance: Math.hypot(points[0].clientX - points[1].clientX, points[0].clientY - points[1].clientY),
        zoom: state.beads.stylePreviewZoom || 1
      };
      state.beads.styleDrag = null;
      return;
    }
    const overlay = findStyleOverlayAt(point);
    if (overlay) {
      state.beads.styleSelectedOverlayId = overlay.id;
      state.beads.styleDrag = {
        id: overlay.id,
        pointerId: event.pointerId,
        startX: point.x,
        startY: point.y,
        overlayX: overlay.x,
        overlayY: overlay.y
      };
      if (overlay.type === "sticker") {
        if (els.styleStickerSizeRange) els.styleStickerSizeRange.value = Math.round(overlay.width || 120);
        if (els.styleStickerOpacityRange) els.styleStickerOpacityRange.value = Math.round((overlay.opacity == null ? 1 : overlay.opacity) * 100);
        updateSelectedStickerFromControls();
      }
      if (overlay.type === "text") syncStyleTextControlsFromOverlay(overlay);
    } else {
      state.beads.styleSelectedOverlayId = "";
      state.beads.styleDrag = null;
      drawMaterialPreview();
    }
  }

  function handleStylePreviewPointerMove(event) {
    if (state.beads.stylePreviewPointers.has(event.pointerId)) {
      state.beads.stylePreviewPointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    }
    if (state.beads.stylePreviewPinch && state.beads.stylePreviewPointers.size >= 2) {
      event.preventDefault();
      const points = Array.from(state.beads.stylePreviewPointers.values());
      const nextDistance = Math.hypot(points[0].clientX - points[1].clientX, points[0].clientY - points[1].clientY);
      if (state.beads.stylePreviewPinch.distance > 0) {
        state.beads.stylePreviewZoom = Math.max(0.2, Math.min(5, state.beads.stylePreviewPinch.zoom * nextDistance / state.beads.stylePreviewPinch.distance));
        applyPreviewZoom(els.materialPreviewCanvas, state.beads.stylePreviewZoom);
      }
      return;
    }
    const drag = state.beads.styleDrag;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.preventDefault();
    const overlay = getStyleOverlayById(drag.id);
    if (!overlay) return;
    const point = getStyleCanvasPoint(event);
    overlay.x = drag.overlayX + point.x - drag.startX;
    overlay.y = drag.overlayY + point.y - drag.startY;
    drawMaterialPreview();
  }

  function handleStylePreviewPointerUp(event) {
    state.beads.stylePreviewPointers.delete(event.pointerId);
    if (state.beads.stylePreviewPointers.size < 2) state.beads.stylePreviewPinch = null;
    if (state.beads.styleDrag && state.beads.styleDrag.pointerId === event.pointerId) {
      state.beads.styleDrag = null;
    }
  }

  function handleStylePreviewWheel(event) {
    if (!els.materialPreviewCanvas) return;
    event.preventDefault();
    state.beads.stylePreviewZoom = Math.max(0.2, Math.min(5, (state.beads.stylePreviewZoom || 1) * (event.deltaY < 0 ? 1.08 : 1 / 1.08)));
    applyPreviewZoom(els.materialPreviewCanvas, state.beads.stylePreviewZoom);
  }

  function syncStyleTextControlsFromOverlay(overlay) {
    if (!overlay) return;
    if (els.styleTextInput) els.styleTextInput.value = overlay.text || "";
    if (els.styleTextFontSelect) els.styleTextFontSelect.value = overlay.font || "system-ui";
    if (els.styleTextSizeRange) els.styleTextSizeRange.value = overlay.size || 48;
    if (els.styleTextWeightRange) els.styleTextWeightRange.value = overlay.weight || 800;
    if (els.styleTextColorInput) els.styleTextColorInput.value = overlay.color || "#172033";
    if (els.styleTextOpacityRange) els.styleTextOpacityRange.value = Math.round((overlay.opacity == null ? 1 : overlay.opacity) * 100);
    if (els.styleTextStrokeColorInput) els.styleTextStrokeColorInput.value = overlay.strokeColor || "#ffffff";
    if (els.styleTextStrokeWidthRange) els.styleTextStrokeWidthRange.value = overlay.strokeWidth || 0;
    if (els.styleTextShadowRange) els.styleTextShadowRange.value = overlay.shadowBlur || 0;
    updateStyleTextLabels();
  }

  function getStylePresets() {
    try {
      const parsed = JSON.parse(localStorage.getItem(stylePresetStorageKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setStylePresets(presets, options = {}) {
    localStorage.setItem(stylePresetStorageKey, JSON.stringify(presets.slice(0, 60)));
    renderStylePresetList();
    if (options.remote !== false) saveSharedSettingsToRemote();
  }

  function getExportPresets() {
    try {
      const parsed = JSON.parse(localStorage.getItem(exportPresetStorageKey) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setExportPresets(presets, options = {}) {
    localStorage.setItem(exportPresetStorageKey, JSON.stringify(presets.slice(0, 80)));
    renderExportPresetList();
    if (options.remote !== false) saveSharedSettingsToRemote();
  }

  function getLocalSharedSettings() {
    return {
      stylePresets: getStylePresets(),
      exportPresets: getExportPresets(),
      updatedAt: new Date().toISOString()
    };
  }

  function settingSortTime(item) {
    return new Date(item && (item.updatedAt || item.savedAt || item.createdAt || 0)).getTime() || 0;
  }

  function mergeSettingList(localItems, remoteItems, limit = 80) {
    const map = new Map();
    [...(remoteItems || []), ...(localItems || [])].filter((item) => item && item.id).forEach((item) => {
      const current = map.get(item.id);
      if (!current || settingSortTime(item) >= settingSortTime(current)) map.set(item.id, item);
    });
    return Array.from(map.values()).sort((a, b) => settingSortTime(b) - settingSortTime(a)).slice(0, limit);
  }

  function normalizeSharedSettings(settings) {
    const data = settings && typeof settings === "object" ? settings : {};
    return {
      stylePresets: Array.isArray(data.stylePresets) ? data.stylePresets.filter((item) => item && item.id).slice(0, 80) : [],
      exportPresets: Array.isArray(data.exportPresets) ? data.exportPresets.filter((item) => item && item.id).slice(0, 80) : [],
      updatedAt: data.updatedAt || ""
    };
  }

  async function fetchRemoteSharedSettings() {
    const response = await fetch(`${syncApiBase}/api/settings`, { cache: "no-store" });
    if (!response.ok) throw new Error(`settings ${response.status}`);
    return normalizeSharedSettings(await response.json());
  }

  function saveSharedSettingsToRemote(settings) {
    if (!window.fetch) return;
    const payload = normalizeSharedSettings(settings || getLocalSharedSettings());
    payload.updatedAt = new Date().toISOString();
    payload.replace = true;
    localStorage.setItem(sharedSettingsStorageKey, JSON.stringify(payload));
    fetch(`${syncApiBase}/api/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => {
      setMessage("预设同步服务暂时不可用，已先保存到当前设备。", true);
    });
  }

  async function syncSharedSettingsFromRemote(options = {}) {
    if (!window.fetch) return;
    try {
      const local = getLocalSharedSettings();
      const remote = await fetchRemoteSharedSettings();
      const merged = {
        stylePresets: mergeSettingList(local.stylePresets, remote.stylePresets, 80),
        exportPresets: mergeSettingList(local.exportPresets, remote.exportPresets, 80),
        updatedAt: new Date().toISOString()
      };
      const before = JSON.stringify(normalizeSharedSettings(local));
      const remoteBefore = JSON.stringify(normalizeSharedSettings(remote));
      localStorage.setItem(stylePresetStorageKey, JSON.stringify(merged.stylePresets));
      localStorage.setItem(exportPresetStorageKey, JSON.stringify(merged.exportPresets));
      localStorage.setItem(sharedSettingsStorageKey, JSON.stringify(merged));
      renderStylePresetList();
      renderExportPresetList();
      if (JSON.stringify(normalizeSharedSettings(merged)) !== remoteBefore) saveSharedSettingsToRemote(merged);
      if (options.manual && before !== JSON.stringify(normalizeSharedSettings(merged))) setMessage("预设设置已同步。", false);
    } catch {
      renderStylePresetList();
      renderExportPresetList();
      if (options.manual) setMessage("预设同步暂时不可用，已保留当前设备设置。", true);
    }
  }

  function collectStyleSettings() {
    return {
      ratio: els.styleRatioSelect && els.styleRatioSelect.value,
      orientation: els.styleOrientationSelect && els.styleOrientationSelect.value,
      customWidth: els.styleCustomWidthInput && els.styleCustomWidthInput.value,
      customHeight: els.styleCustomHeightInput && els.styleCustomHeightInput.value,
      backgroundColor: els.styleBackgroundColorInput && els.styleBackgroundColorInput.value,
      backgroundAlpha: els.styleBackgroundAlphaRange && els.styleBackgroundAlphaRange.value,
      backgroundType: els.materialBackgroundSelect && els.materialBackgroundSelect.value,
      backgroundImageData: state.beads.styleBackgroundImageData || "",
      backgroundImageName: state.beads.styleBackgroundImageName || "",
      materialMode: els.materialModeSelect && els.materialModeSelect.value,
      frameType: els.materialBaseSelect && els.materialBaseSelect.value,
      borderSize: els.styleBorderSizeRange && els.styleBorderSizeRange.value,
      borderColor: els.styleBorderColorInput && els.styleBorderColorInput.value,
      shadowColor: els.styleShadowColorInput && els.styleShadowColorInput.value,
      shadowBlur: els.styleShadowBlurRange && els.styleShadowBlurRange.value,
      shadowAlpha: els.styleShadowAlphaRange && els.styleShadowAlphaRange.value,
      shadowOffsetX: els.styleShadowOffsetXRange && els.styleShadowOffsetXRange.value,
      shadowOffsetY: els.styleShadowOffsetYRange && els.styleShadowOffsetYRange.value,
      thickness: els.styleThicknessRange && els.styleThicknessRange.value,
      intensity: els.materialIntensityRange && els.materialIntensityRange.value,
      light: els.materialLightSelect && els.materialLightSelect.value,
      decor: els.materialDecorSelect && els.materialDecorSelect.value,
      overlays: state.beads.styleOverlays.map((item) => Object.assign({}, item, { _bounds: undefined })),
      textOverlay: state.beads.styleTextOverlay ? Object.assign({}, state.beads.styleTextOverlay, { _bounds: undefined }) : null
    };
  }

  async function applyStyleSettings(settings) {
    if (!settings) return;
    const setValue = (el, value) => {
      if (el && value != null) el.value = value;
    };
    setValue(els.styleRatioSelect, settings.ratio);
    setValue(els.styleOrientationSelect, settings.orientation);
    setValue(els.styleCustomWidthInput, settings.customWidth);
    setValue(els.styleCustomHeightInput, settings.customHeight);
    setValue(els.styleBackgroundColorInput, settings.backgroundColor);
    setValue(els.styleBackgroundAlphaRange, settings.backgroundAlpha);
    setValue(els.materialBackgroundSelect, settings.backgroundType);
    setValue(els.materialModeSelect, settings.materialMode);
    setValue(els.materialBaseSelect, settings.frameType);
    setValue(els.styleBorderSizeRange, settings.borderSize);
    setValue(els.styleBorderColorInput, settings.borderColor);
    setValue(els.styleShadowColorInput, settings.shadowColor);
    setValue(els.styleShadowBlurRange, settings.shadowBlur);
    setValue(els.styleShadowAlphaRange, settings.shadowAlpha);
    setValue(els.styleShadowOffsetXRange, settings.shadowOffsetX);
    setValue(els.styleShadowOffsetYRange, settings.shadowOffsetY);
    setValue(els.styleThicknessRange, settings.thickness);
    setValue(els.materialIntensityRange, settings.intensity);
    setValue(els.materialLightSelect, settings.light);
    setValue(els.materialDecorSelect, settings.decor);
    state.beads.styleOverlays = Array.isArray(settings.overlays) ? settings.overlays.map((item) => Object.assign({}, item)) : [];
    state.beads.styleTextOverlay = settings.textOverlay ? Object.assign({}, settings.textOverlay) : null;
    state.beads.styleSelectedOverlayId = "";
    if (settings.backgroundImageData) {
      await setStyleBackgroundImage(settings.backgroundImageData, settings.backgroundImageName || "自定义背景");
    } else {
      state.beads.styleBackgroundImage = null;
      state.beads.styleBackgroundImageData = "";
      state.beads.styleBackgroundImageName = "";
      if (els.styleBackgroundImageName) els.styleBackgroundImageName.textContent = "未选择";
    }
    updateStyleTextLabels();
    updateSelectedStickerFromControls();
    drawMaterialPreview();
  }

  function saveCurrentStylePreset() {
    const name = els.stylePresetNameInput && els.stylePresetNameInput.value.trim() ? els.stylePresetNameInput.value.trim() : `样式-${formatStamp(new Date())}`;
    const presets = getStylePresets().filter((item) => item.name !== name);
    presets.unshift({
      id: makeId(),
      name,
      savedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: collectStyleSettings()
    });
    setStylePresets(presets);
    setMessage("样式已保存，下次可一键套用。", false);
  }

  function renderStylePresetList() {
    if (!els.stylePresetList) return;
    const presets = getStylePresets();
    els.stylePresetList.innerHTML = "";
    if (!presets.length) {
      const empty = document.createElement("span");
      empty.className = "style-empty-chip";
      empty.textContent = "暂无保存样式";
      els.stylePresetList.appendChild(empty);
      return;
    }
    presets.forEach((preset) => {
      const row = document.createElement("div");
      row.className = "style-preset-item";
      row.innerHTML = `<button type="button"></button><button class="mini-button" type="button">删</button>`;
      row.querySelector("button:first-child").textContent = preset.name || "未命名样式";
      row.querySelector("button:first-child").addEventListener("click", () => applyStyleSettings(preset.settings));
      row.querySelector("button:last-child").addEventListener("click", () => setStylePresets(getStylePresets().filter((item) => item.id !== preset.id)));
      els.stylePresetList.appendChild(row);
    });
  }

  function collectExportPresetSettings() {
    return {
      exportSettings: JSON.parse(JSON.stringify(state.beads.exportSettings || {})),
      exportRegions: JSON.parse(JSON.stringify(state.beads.exportRegions || []))
    };
  }

  function applyExportPresetSettings(settings) {
    if (!settings) return;
    state.beads.exportSettings = Object.assign({}, state.beads.exportSettings, settings.exportSettings || {});
    state.beads.exportRegions = Array.isArray(settings.exportRegions)
      ? settings.exportRegions.map((region) => Object.assign({}, region))
      : [];
    syncBeadControls();
    refreshExportPreviewIfOpen();
    setMessage("导出预设已套用。", false);
  }

  function saveCurrentExportPreset() {
    const name = els.exportPresetNameInput && els.exportPresetNameInput.value.trim()
      ? els.exportPresetNameInput.value.trim()
      : `导出设置-${formatStamp(new Date())}`;
    const now = new Date().toISOString();
    const presets = getExportPresets().filter((item) => item.name !== name);
    presets.unshift({
      id: makeId(),
      name,
      savedAt: now,
      updatedAt: now,
      settings: collectExportPresetSettings()
    });
    setExportPresets(presets);
    setMessage("导出预设已保存，电脑和平板会同步使用。", false);
  }

  function renderExportPresetList() {
    if (!els.exportPresetList) return;
    const presets = getExportPresets();
    els.exportPresetList.innerHTML = "";
    if (!presets.length) {
      const empty = document.createElement("span");
      empty.className = "style-empty-chip";
      empty.textContent = "暂无导出预设";
      els.exportPresetList.appendChild(empty);
      return;
    }
    presets.forEach((preset) => {
      const row = document.createElement("div");
      row.className = "style-preset-item export-preset-item";
      row.innerHTML = `<button type="button"></button><button class="mini-button" type="button">改名</button><button class="mini-button" type="button">删</button>`;
      const [applyButton, renameButton, deleteButton] = row.querySelectorAll("button");
      applyButton.textContent = preset.name || "未命名导出预设";
      applyButton.addEventListener("click", () => applyExportPresetSettings(preset.settings));
      renameButton.addEventListener("click", () => {
        const nextName = window.prompt("重命名导出预设", preset.name || "导出预设");
        if (!nextName || !nextName.trim()) return;
        const presetsNext = getExportPresets().map((item) => item.id === preset.id
          ? Object.assign({}, item, { name: nextName.trim(), updatedAt: new Date().toISOString() })
          : item);
        setExportPresets(presetsNext);
      });
      deleteButton.addEventListener("click", () => setExportPresets(getExportPresets().filter((item) => item.id !== preset.id)));
      els.exportPresetList.appendChild(row);
    });
  }

  async function populateStyleFontSelect() {
    if (!els.styleTextFontSelect) return;
    const fallback = [
      ["system-ui", "系统默认"],
      ["Arial", "Arial"],
      ["Helvetica", "Helvetica"],
      ["PingFang SC", "苹方"],
      ["Hiragino Sans GB", "冬青黑体"],
      ["STHeiti", "华文黑体"],
      ["Songti SC", "宋体"],
      ["Kaiti SC", "楷体"],
      ["serif", "衬线"],
      ["monospace", "等宽"]
    ];
    let fonts = fallback;
    if (window.queryLocalFonts) {
      try {
        const localFonts = await window.queryLocalFonts();
        const seen = new Set();
        fonts = localFonts
          .map((font) => [font.family, font.family])
          .filter(([family]) => {
            if (!family || seen.has(family)) return false;
            seen.add(family);
            return true;
          })
          .slice(0, 180);
        if (!fonts.length) fonts = fallback;
      } catch {
        fonts = fallback;
      }
    }
    els.styleTextFontSelect.innerHTML = "";
    fonts.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      els.styleTextFontSelect.appendChild(option);
    });
  }

  function beginMaterialShapePath(ctx, pattern, x, y, cell) {
    ctx.beginPath();
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        if (!pattern.cells[row][col] || pattern.cells[row][col] === "H1") continue;
        ctx.rect(x + col * cell, y + row * cell, cell, cell);
      }
    }
  }

  function drawMaterialBase(ctx, width, height, base) {
    if (base === "transparent") return;
    if (base === "black") {
      ctx.fillStyle = "#101318";
      ctx.fillRect(0, 0, width, height);
      return;
    }
    if (base === "felt") {
      ctx.fillStyle = "#c9c9c3";
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = "#f6f4ed";
      for (let i = -height; i < width; i += 13) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      return;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  function getMaterialLabel(mode) {
    return {
      normal: "普通烫",
      parchment: "蒸笼布/烘焙纸烫",
      "coarse-towel": "粗纹毛巾烫",
      "fine-towel": "细纹毛巾烫",
      glitter: "银闪格丽特",
      "black-glitter": "黑闪格丽特",
      holes: "保孔烫",
      wavy: "仙度瑞拉波纹",
      "cross-stitch": "十字绣",
      "3d": "拼豆立体"
    }[mode] || "普通烫";
  }

  function drawMaterialPreview() {
    const pattern = getMaterialPattern();
    if (!pattern || !els.materialPreviewCanvas) return false;
    const mode = els.materialModeSelect ? els.materialModeSelect.value : "normal";
    const frameType = els.materialBaseSelect ? els.materialBaseSelect.value : "none";
    const backgroundType = els.materialBackgroundSelect ? els.materialBackgroundSelect.value : "felt";
    const light = els.materialLightSelect ? els.materialLightSelect.value : "soft";
    const decor = els.materialDecorSelect ? els.materialDecorSelect.value : "none";
    const ratio = els.styleRatioSelect ? els.styleRatioSelect.value : "1:1";
    const backgroundColor = els.styleBackgroundColorInput ? els.styleBackgroundColorInput.value : "#f4f0e8";
    const backgroundAlpha = els.styleBackgroundAlphaRange ? clamp(els.styleBackgroundAlphaRange.value, 0, 100) / 100 : 1;
    const borderSize = els.styleBorderSizeRange ? clamp(els.styleBorderSizeRange.value, 0, 90) : 28;
    const borderColor = els.styleBorderColorInput ? els.styleBorderColorInput.value : "#d8c7aa";
    const shadowColor = els.styleShadowColorInput ? els.styleShadowColorInput.value : "#172033";
    const shadowBlur = els.styleShadowBlurRange ? clamp(els.styleShadowBlurRange.value, 0, 90) : 28;
    const shadowAlpha = els.styleShadowAlphaRange ? clamp(els.styleShadowAlphaRange.value, 0, 80) / 100 : 0.28;
    const shadowOffsetX = els.styleShadowOffsetXRange ? clamp(els.styleShadowOffsetXRange.value, -80, 80) : 18;
    const shadowOffsetY = els.styleShadowOffsetYRange ? clamp(els.styleShadowOffsetYRange.value, -80, 80) : 18;
    const thickness = els.styleThicknessRange ? clamp(els.styleThicknessRange.value, 0, 28) : 8;
    const intensity = els.materialIntensityRange ? clamp(els.materialIntensityRange.value, 0, 100) / 100 : 0.7;
    updateStylePreviewLabels({ backgroundAlpha, borderSize, shadowBlur, shadowAlpha, shadowOffsetX, shadowOffsetY, thickness, intensity });

    const canvas = els.materialPreviewCanvas;
    const size = getStyleCanvasSize(ratio);
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStyleBackground(ctx, canvas.width, canvas.height, backgroundType, backgroundColor, backgroundAlpha);
    drawStyleFrame(ctx, canvas.width, canvas.height, frameType, borderSize, borderColor);

    const innerPad = Math.max(38, borderSize + 36);
    const availableWidth = Math.max(80, canvas.width - innerPad * 2);
    const availableHeight = Math.max(80, canvas.height - innerPad * 2);
    const cell = Math.max(2, Math.floor(Math.min(availableWidth / pattern.width, availableHeight / pattern.height)));
    const artWidth = pattern.width * cell;
    const artHeight = pattern.height * cell;
    const artX = Math.round((canvas.width - artWidth) / 2);
    const artY = Math.round((canvas.height - artHeight) / 2);
    const art = makeSolidPixelArt(pattern, cell, mode);

    drawStyleShadow(ctx, art, artX, artY, shadowColor, shadowAlpha, shadowBlur, shadowOffsetX, shadowOffsetY);
    drawStyleThickness(ctx, art, artX, artY, thickness);
    ctx.drawImage(art, artX, artY);

    ctx.save();
    beginMaterialShapePath(ctx, pattern, artX, artY, cell);
    ctx.clip();
    applySurfaceMask(ctx, mode, artX, artY, artWidth, artHeight, cell, pattern, intensity);
    drawMaterialLight(ctx, artX, artY, artWidth, artHeight, light, intensity);
    ctx.restore();
    drawMaterialDecor(ctx, canvas.width, canvas.height, decor, intensity);
    drawStyleUserOverlays(ctx);
    applyPreviewZoom(canvas, state.beads.stylePreviewZoom || 1);
    return true;
  }

  function makeSolidPixelArt(pattern, cell, mode) {
    const art = document.createElement("canvas");
    art.width = pattern.width * cell;
    art.height = pattern.height * cell;
    const ctx = art.getContext("2d");
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        const code = pattern.cells[row][col];
        if (!code || code === "H1") continue;
        const color = getPaletteColor(code);
        ctx.fillStyle = mode === "black-glitter" && colorBrightness(color.rgb) < 150 ? "#07080b" : color.hex;
        ctx.fillRect(col * cell, row * cell, cell, cell);
      }
    }
    return art;
  }

  function updateStylePreviewLabels(values) {
    if (els.styleBackgroundAlphaLabel) els.styleBackgroundAlphaLabel.textContent = Math.round(values.backgroundAlpha * 100);
    if (els.styleBorderSizeLabel) els.styleBorderSizeLabel.textContent = String(values.borderSize);
    if (els.styleShadowBlurLabel) els.styleShadowBlurLabel.textContent = String(values.shadowBlur);
    if (els.styleShadowAlphaLabel) els.styleShadowAlphaLabel.textContent = Math.round(values.shadowAlpha * 100);
    if (els.styleShadowOffsetXLabel) els.styleShadowOffsetXLabel.textContent = String(values.shadowOffsetX);
    if (els.styleShadowOffsetYLabel) els.styleShadowOffsetYLabel.textContent = String(values.shadowOffsetY);
    if (els.styleThicknessLabel) els.styleThicknessLabel.textContent = String(values.thickness);
    if (els.materialIntensityLabel) els.materialIntensityLabel.textContent = Math.round(values.intensity * 100);
  }

  function getStyleCanvasSize(ratio) {
    if (ratio === "custom") {
      return {
        width: clamp(els.styleCustomWidthInput ? els.styleCustomWidthInput.value : 1080, 320, 2400),
        height: clamp(els.styleCustomHeightInput ? els.styleCustomHeightInput.value : 1080, 320, 2400)
      };
    }
    const ratioMap = {
      "1:1": [1, 1],
      "4:3": [4, 3],
      "16:9": [16, 9],
      "3:4": [3, 4],
      "9:16": [9, 16]
    };
    let [rw, rh] = ratioMap[ratio] || [1, 1];
    const orientation = els.styleOrientationSelect ? els.styleOrientationSelect.value : "landscape";
    if (orientation === "portrait" && rw > rh) [rw, rh] = [rh, rw];
    if (orientation === "landscape" && rh > rw) [rw, rh] = [rh, rw];
    const longSide = 1080;
    if (rw >= rh) return { width: longSide, height: Math.round(longSide * rh / rw) };
    return { width: Math.round(longSide * rw / rh), height: longSide };
  }

  function rgbaFromHex(hex, alpha) {
    const rgb = hexToRgb(hex || "#ffffff");
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  function loadImageFromDataUrl(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = dataUrl;
    });
  }

  async function setStyleBackgroundImage(dataUrl, name) {
    if (!dataUrl) return;
    const image = await loadImageFromDataUrl(dataUrl);
    state.beads.styleBackgroundImage = image;
    state.beads.styleBackgroundImageData = dataUrl;
    state.beads.styleBackgroundImageName = name || "自定义背景";
    if (els.styleBackgroundImageName) els.styleBackgroundImageName.textContent = state.beads.styleBackgroundImageName;
    if (els.materialBackgroundSelect) els.materialBackgroundSelect.value = "custom";
    drawMaterialPreview();
  }

  function applyPreviewZoom(canvas, zoom) {
    if (!canvas) return;
    canvas.style.width = `${Math.max(80, Math.round(canvas.width * zoom))}px`;
    canvas.style.height = "auto";
  }

  function updatePreviewZoom(kind, action) {
    const key = kind === "export" ? "exportPreviewZoom" : "stylePreviewZoom";
    const canvas = kind === "export" ? els.exportPreviewCanvas : els.materialPreviewCanvas;
    if (action === "fit" && canvas && canvas.parentElement) {
      const wrap = canvas.parentElement;
      const fit = Math.min(
        (wrap.clientWidth - 36) / Math.max(1, canvas.width),
        (wrap.clientHeight - 74) / Math.max(1, canvas.height)
      );
      state.beads[key] = Math.max(0.2, Math.min(4, fit));
    } else {
      state.beads[key] = Math.max(0.2, Math.min(5, state.beads[key] * (action === "in" ? 1.2 : 1 / 1.2)));
    }
    applyPreviewZoom(canvas, state.beads[key]);
  }

  function drawStyleBackground(ctx, width, height, type, color, alpha) {
    if (alpha > 0) {
      ctx.fillStyle = rgbaFromHex(color, alpha);
      ctx.fillRect(0, 0, width, height);
    }
    if (type === "custom" && state.beads.styleBackgroundImage) {
      drawCoverImage(ctx, state.beads.styleBackgroundImage, 0, 0, width, height);
      return;
    }
    if (type === "plain") return;
    ctx.save();
    const material = getStyleBackgroundMaterial(type);
    if (material) {
      drawTexturedStyleBackground(ctx, width, height, material);
      ctx.restore();
      return;
    }
    if (type === "glass") {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(255,255,255,.66)");
      gradient.addColorStop(0.48, "rgba(198,225,255,.20)");
      gradient.addColorStop(1, "rgba(62,84,120,.16)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      for (let i = -height; i < width; i += 46) {
        ctx.strokeStyle = "rgba(255,255,255,.25)";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(i, height);
        ctx.lineTo(i + height, 0);
        ctx.stroke();
      }
    } else if (type === "wood") {
      ctx.fillStyle = "rgba(151, 106, 62, .45)";
      ctx.fillRect(0, 0, width, height);
      for (let y = 0; y < height; y += 17) {
        ctx.strokeStyle = y % 34 ? "rgba(74,45,24,.22)" : "rgba(255,228,176,.18)";
        ctx.lineWidth = 2 + (y % 5);
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= width; x += 58) ctx.quadraticCurveTo(x + 29, y + Math.sin((x + y) * 0.022) * 8, x + 58, y);
        ctx.stroke();
      }
    } else if (type === "kraft") {
      ctx.fillStyle = "rgba(173, 128, 78, .30)";
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 1200; i += 1) {
        ctx.fillStyle = i % 2 ? "rgba(88,54,27,.08)" : "rgba(255,239,204,.12)";
        ctx.fillRect((i * 47) % width, (i * 79) % height, 1.4, 1.4);
      }
    } else if (type === "marble") {
      ctx.fillStyle = "rgba(245, 246, 242, .72)";
      ctx.fillRect(0, 0, width, height);
      for (let i = -height; i < width; i += 56) {
        ctx.strokeStyle = i % 112 ? "rgba(128,135,145,.16)" : "rgba(210,200,180,.18)";
        ctx.lineWidth = 2 + (i % 5);
        ctx.beginPath();
        ctx.moveTo(i, height);
        for (let y = height; y >= 0; y -= 54) ctx.quadraticCurveTo(i + height - y + 22, y - 18, i + height - y + 48, y - 54);
        ctx.stroke();
      }
    } else if (type === "linen-bg") {
      ctx.fillStyle = "rgba(218, 210, 194, .55)";
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < width; i += 9) {
        ctx.strokeStyle = i % 18 ? "rgba(255,255,255,.14)" : "rgba(96,80,62,.10)";
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 11) {
        ctx.strokeStyle = i % 22 ? "rgba(255,255,255,.12)" : "rgba(96,80,62,.08)";
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
    } else if (type === "cork") {
      ctx.fillStyle = "rgba(177, 130, 78, .45)";
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < 1600; i += 1) {
        ctx.fillStyle = i % 3 ? "rgba(75,45,20,.12)" : "rgba(255,220,160,.12)";
        ctx.beginPath();
        ctx.arc((i * 37) % width, (i * 61) % height, 0.8 + (i % 4), 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === "grid-paper") {
      ctx.fillStyle = "rgba(250, 252, 255, .75)";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(92, 132, 190, .18)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 24) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
    } else if (type === "pastel-gradient" || type === "dark-studio") {
      const gradient = ctx.createRadialGradient(width * 0.35, height * 0.22, 1, width * 0.55, height * 0.55, Math.max(width, height));
      if (type === "dark-studio") {
        gradient.addColorStop(0, "#3b4150");
        gradient.addColorStop(1, "#11151c");
      } else {
        gradient.addColorStop(0, "rgba(255,236,244,.86)");
        gradient.addColorStop(0.55, "rgba(222,239,255,.76)");
        gradient.addColorStop(1, "rgba(238,232,255,.70)");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      for (let i = -height; i < width; i += 12) {
        ctx.strokeStyle = "rgba(255,255,255,.20)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height, height);
        ctx.stroke();
      }
      for (let i = 0; i < 900; i += 1) {
        ctx.fillStyle = i % 2 ? "rgba(255,255,255,.10)" : "rgba(30,30,30,.06)";
        ctx.fillRect((i * 31) % width, (i * 53) % height, 1, 1);
      }
    }
    ctx.restore();
  }

  function makeStyleMaterialContactSheet(values = [], options = {}) {
    const selectedMaterials = (Array.isArray(values) && values.length
      ? values.map((value) => getStyleBackgroundMaterial(value)).filter(Boolean)
      : styleBackgroundMaterials
    );
    const cols = clamp(options.cols || 4, 2, 6);
    const tileWidth = clamp(options.tileWidth || 260, 180, 420);
    const tileHeight = clamp(options.tileHeight || 176, 130, 300);
    const gap = clamp(options.gap || 22, 10, 44);
    const headerHeight = 96;
    const rows = Math.max(1, Math.ceil(selectedMaterials.length / cols));
    const canvas = document.createElement("canvas");
    canvas.width = cols * tileWidth + (cols + 1) * gap;
    canvas.height = headerHeight + rows * tileHeight + (rows + 1) * gap;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#f5f7fb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#172033";
    ctx.font = "900 30px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText(`Q像素样式背景材质确认图 · ${selectedMaterials.length} 款`, gap, 44);
    ctx.fillStyle = "#6b7384";
    ctx.font = "700 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.fillText("每张卡片使用实际样式预览背景渲染逻辑生成，可在样式预览的“背景材质”中直接选择。", gap, 72);

    selectedMaterials.forEach((material, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = gap + col * (tileWidth + gap);
      const y = headerHeight + gap + row * (tileHeight + gap);
      const previewHeight = tileHeight - 52;

      ctx.save();
      ctx.shadowColor = "rgba(22, 32, 51, .12)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      roundedRect(ctx, x, y, tileWidth, tileHeight, 18);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      roundedRect(ctx, x + 10, y + 10, tileWidth - 20, previewHeight, 14);
      ctx.clip();
      ctx.translate(x + 10, y + 10);
      drawStyleBackground(ctx, tileWidth - 20, previewHeight, material.value, "#f4f0e8", 1);
      drawContactSheetSamplePixels(ctx, tileWidth - 20, previewHeight, material);
      ctx.restore();

      ctx.strokeStyle = "rgba(217, 222, 232, .92)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      roundedRect(ctx, x + 10, y + 10, tileWidth - 20, previewHeight, 14);
      ctx.stroke();

      ctx.fillStyle = "#172033";
      ctx.font = "900 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillText(material.label, x + 14, y + tileHeight - 27);
      ctx.fillStyle = "#7b8496";
      ctx.font = "700 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillText(material.group, x + 14, y + tileHeight - 10);
    });

    return canvas;
  }

  function drawContactSheetSamplePixels(ctx, width, height, material) {
    const palette = [
      materialColor(material, 0, "#f3d7c6"),
      materialColor(material, 1, "#8a7462"),
      materialColor(material, 2, "#ffffff"),
      "#5f7f64",
      "#e98f87"
    ];
    const cell = Math.max(8, Math.floor(Math.min(width, height) / 16));
    const shape = [
      "00000111100000",
      "00011111111000",
      "00111111111100",
      "01112222211110",
      "01112222211110",
      "11112333211111",
      "11112333211111",
      "11111111111111",
      "01111144111110",
      "00111111111100",
      "00011111111000",
      "00000111100000"
    ];
    const artWidth = shape[0].length * cell;
    const artHeight = shape.length * cell;
    const startX = Math.round((width - artWidth) / 2);
    const startY = Math.round((height - artHeight) / 2);
    ctx.save();
    ctx.globalAlpha = 0.78;
    for (let row = 0; row < shape.length; row += 1) {
      for (let col = 0; col < shape[row].length; col += 1) {
        const value = Number(shape[row][col]);
        if (!value) continue;
        ctx.fillStyle = palette[value % palette.length];
        ctx.fillRect(startX + col * cell, startY + row * cell, cell, cell);
      }
    }
    ctx.restore();
  }

  function pseudoRandom(index, salt = 1) {
    const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  function materialColor(material, index, fallback = "#ffffff") {
    return material.colors && material.colors[index] ? material.colors[index] : fallback;
  }

  function drawTexturedStyleBackground(ctx, width, height, material) {
    const c0 = materialColor(material, 0, "#f4f0e8");
    const c1 = materialColor(material, 1, c0);
    const c2 = materialColor(material, 2, "#ffffff");
    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, c2);
    base.addColorStop(0.42, c0);
    base.addColorStop(1, c1);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    if (material.blobs) drawSoftMaterialBlobs(ctx, width, height, material, material.blobs);
    drawMaterialTextureDetails(ctx, width, height, material);
    if (material.grain) drawMaterialGrain(ctx, width, height, material, material.grain);
    if (material.fibers) drawPaperFibers(ctx, width, height, material, material.fibers);
    if (material.vignette) drawMaterialVignette(ctx, width, height, material.vignette);
  }

  function drawMaterialGrain(ctx, width, height, material, amount) {
    const count = Math.floor((width * height / 900) * amount);
    ctx.save();
    for (let i = 0; i < count; i += 1) {
      const x = pseudoRandom(i, 2.1) * width;
      const y = pseudoRandom(i, 5.7) * height;
      const size = 0.55 + pseudoRandom(i, 9.2) * (1.7 + amount * 0.8);
      const dark = pseudoRandom(i, 11.1) > 0.52;
      ctx.globalAlpha = (dark ? 0.055 : 0.08) * Math.min(2.2, amount);
      ctx.fillStyle = dark ? materialColor(material, 1, "#000000") : "#ffffff";
      ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
  }

  function drawPaperFibers(ctx, width, height, material, amount) {
    const count = Math.floor(120 * amount);
    ctx.save();
    ctx.lineCap = "round";
    for (let i = 0; i < count; i += 1) {
      const x = pseudoRandom(i, 13.2) * width;
      const y = pseudoRandom(i, 15.9) * height;
      const len = 12 + pseudoRandom(i, 17.3) * 58;
      const angle = (pseudoRandom(i, 19.7) - 0.5) * 0.7;
      ctx.globalAlpha = 0.055 + pseudoRandom(i, 21.1) * 0.07;
      ctx.strokeStyle = pseudoRandom(i, 23.4) > 0.5 ? materialColor(material, 1, "#8a755e") : "#ffffff";
      ctx.lineWidth = 0.7 + pseudoRandom(i, 25.6) * 1.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSoftMaterialBlobs(ctx, width, height, material, amount) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 8; i += 1) {
      const x = pseudoRandom(i, 31.4) * width;
      const y = pseudoRandom(i, 37.2) * height;
      const radius = (0.14 + pseudoRandom(i, 39.7) * 0.26) * Math.max(width, height) * amount;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, rgbaFromHex(i % 2 ? materialColor(material, 0) : materialColor(material, 2), 0.34));
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();
  }

  function drawMaterialVignette(ctx, width, height, amount) {
    const vignette = ctx.createRadialGradient(width * 0.52, height * 0.42, Math.min(width, height) * 0.22, width * 0.5, height * 0.5, Math.max(width, height) * 0.78);
    vignette.addColorStop(0, "rgba(255,255,255,0)");
    vignette.addColorStop(1, `rgba(0,0,0,${0.38 * amount})`);
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  function drawLooseLines(ctx, width, height, material, options = {}) {
    const step = options.step || 18;
    const diagonal = Boolean(options.diagonal);
    ctx.save();
    ctx.lineCap = "round";
    ctx.globalAlpha = options.alpha || 0.16;
    ctx.strokeStyle = options.color || materialColor(material, 1, "#777777");
    ctx.lineWidth = options.width || 1.4;
    for (let i = diagonal ? -height : 0; i < (diagonal ? width : height); i += step) {
      ctx.beginPath();
      if (diagonal) {
        ctx.moveTo(i, height);
        ctx.lineTo(i + height, 0);
      } else {
        ctx.moveTo(0, i);
        ctx.bezierCurveTo(width * 0.32, i + Math.sin(i * 0.03) * 8, width * 0.68, i - Math.cos(i * 0.02) * 10, width, i + Math.sin(i * 0.05) * 7);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWeaveTexture(ctx, width, height, material, amount = 1) {
    ctx.save();
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += Math.max(5, 10 / amount)) {
      ctx.globalAlpha = x % 20 < 10 ? 0.13 : 0.07;
      ctx.strokeStyle = x % 20 < 10 ? "#ffffff" : materialColor(material, 1, "#777777");
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + Math.sin(x * 0.04) * 3, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += Math.max(5, 12 / amount)) {
      ctx.globalAlpha = y % 24 < 12 ? 0.12 : 0.08;
      ctx.strokeStyle = y % 24 < 12 ? "#ffffff" : materialColor(material, 1, "#777777");
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y + Math.cos(y * 0.035) * 3);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTexturedCardMarks(ctx, width, height, material) {
    ctx.save();
    ctx.globalAlpha = 0.26;
    ctx.fillStyle = materialColor(material, 1, "#242936");
    for (let i = 0; i < 9; i += 1) {
      const x = 36 + (i % 3) * width * 0.26;
      const y = 38 + Math.floor(i / 3) * height * 0.18;
      ctx.fillRect(x, y, width * (0.08 + (i % 2) * 0.08), 4);
      ctx.fillRect(x, y + 12, width * 0.12, 2);
    }
    ctx.font = `800 ${Math.max(18, width * 0.03)}px Georgia, serif`;
    ctx.fillText("Q PIXEL  ART  STYLE", width * 0.08, height * 0.86);
    ctx.restore();
  }

  function drawMaterialTextureDetails(ctx, width, height, material) {
    const texture = material.texture || "paper";
    if (["paper", "paper-note", "receipt"].includes(texture)) {
      drawLooseLines(ctx, width, height, material, { step: texture === "receipt" ? 34 : 24, alpha: 0.08, color: materialColor(material, 1) });
      if (material.tape) {
        ctx.save();
        ctx.translate(width * 0.08, height * 0.08);
        ctx.rotate(-0.08);
        ctx.fillStyle = "rgba(255,255,255,.34)";
        ctx.fillRect(0, 0, width * 0.22, 34);
        ctx.strokeStyle = "rgba(120,92,48,.16)";
        ctx.strokeRect(0, 0, width * 0.22, 34);
        ctx.restore();
      }
    } else if (texture === "torn-paper") {
      drawPaperFibers(ctx, width, height, material, 1.8);
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = "#fff2cf";
      ctx.lineWidth = 8;
      ctx.setLineDash([12, 10, 4, 8]);
      ctx.strokeRect(34, 28, width - 68, height - 56);
      ctx.restore();
    } else if (texture === "paper-clip") {
      drawPaperFibers(ctx, width, height, material, 1);
      ctx.save();
      ctx.strokeStyle = "rgba(82,88,98,.45)";
      ctx.lineWidth = Math.max(4, width * 0.006);
      ctx.beginPath();
      ctx.ellipse(width * 0.82, height * 0.16, 26, 56, 0.18, 0, Math.PI * 2);
      ctx.ellipse(width * 0.82, height * 0.16, 14, 38, 0.18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (["magazine", "newspaper", "print"].includes(texture)) {
      drawTexturedCardMarks(ctx, width, height, material);
      if (texture === "newspaper") drawLooseLines(ctx, width, height, material, { step: 13, alpha: 0.11, color: materialColor(material, 2) });
    } else if (texture === "riso") {
      drawTexturedCardMarks(ctx, width, height, material);
      ctx.save();
      ctx.globalAlpha = 0.18;
      for (let y = 0; y < height; y += 8) {
        for (let x = y % 16 ? 0 : 8; x < width; x += 16) {
          ctx.fillStyle = (x + y) % 32 ? materialColor(material, 1) : materialColor(material, 2);
          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    } else if (["film", "film-leak", "soft-photo", "ccd"].includes(texture)) {
      drawLooseLines(ctx, width, height, material, { step: texture === "ccd" ? 5 : 22, alpha: texture === "ccd" ? 0.08 : 0.055, color: texture === "ccd" ? "#ffffff" : materialColor(material, 1) });
      if (texture === "film-leak") {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        const leak = ctx.createRadialGradient(width * 0.08, height * 0.25, 1, width * 0.08, height * 0.25, width * 0.5);
        leak.addColorStop(0, rgbaFromHex(materialColor(material, 1), 0.74));
        leak.addColorStop(0.58, rgbaFromHex(materialColor(material, 2), 0.16));
        leak.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = leak;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    } else if (["glass", "frosted-glass", "glass-spot", "glass-card", "glass-tech"].includes(texture)) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const shine = ctx.createLinearGradient(0, 0, width, height);
      shine.addColorStop(0, "rgba(255,255,255,.78)");
      shine.addColorStop(0.34, "rgba(255,255,255,.16)");
      shine.addColorStop(0.5, "rgba(255,255,255,0)");
      shine.addColorStop(1, "rgba(120,170,255,.18)");
      ctx.fillStyle = shine;
      ctx.fillRect(0, 0, width, height);
      drawLooseLines(ctx, width, height, material, { diagonal: true, step: 58, alpha: 0.22, color: "#ffffff", width: 7 });
      if (texture === "glass-spot") drawSoftMaterialBlobs(ctx, width, height, material, 0.75);
      if (texture === "glass-tech") drawLooseLines(ctx, width, height, material, { step: 36, alpha: 0.12, color: "#7ff2ff", width: 1 });
      ctx.restore();
    } else if (["metal", "metal-rainbow", "foil", "liquid-metal", "brushed-metal"].includes(texture)) {
      drawLooseLines(ctx, width, height, material, { step: texture === "brushed-metal" ? 5 : 12, alpha: 0.16, color: "#ffffff", width: 1 });
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const sheen = ctx.createLinearGradient(0, height * 0.1, width, height * 0.92);
      sheen.addColorStop(0, "rgba(255,255,255,.48)");
      sheen.addColorStop(0.18, "rgba(255,255,255,0)");
      sheen.addColorStop(0.45, "rgba(255,255,255,.32)");
      sheen.addColorStop(0.72, "rgba(255,255,255,0)");
      sheen.addColorStop(1, "rgba(255,255,255,.24)");
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, width, height);
      if (texture === "metal-rainbow") {
        const neon = ctx.createLinearGradient(0, 0, width, 0);
        neon.addColorStop(0, "rgba(0,255,140,.28)");
        neon.addColorStop(0.5, "rgba(0,120,255,.24)");
        neon.addColorStop(1, "rgba(170,40,255,.22)");
        ctx.fillStyle = neon;
        ctx.fillRect(0, 0, width, height);
      }
      if (texture === "foil") {
        for (let i = 0; i < 24; i += 1) {
          ctx.globalAlpha = 0.08 + pseudoRandom(i, 65) * 0.14;
          ctx.fillStyle = i % 2 ? "#ffffff" : materialColor(material, 1);
          ctx.beginPath();
          ctx.moveTo(pseudoRandom(i, 66) * width, pseudoRandom(i, 67) * height);
          ctx.lineTo(pseudoRandom(i, 68) * width, pseudoRandom(i, 69) * height);
          ctx.lineTo(pseudoRandom(i, 70) * width, pseudoRandom(i, 71) * height);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
    } else if (["cream", "cream-blocks"].includes(texture)) {
      if (texture === "cream-blocks") {
        ctx.save();
        ctx.globalAlpha = 0.42;
        for (let i = 0; i < 13; i += 1) {
          ctx.fillStyle = [materialColor(material, 0), materialColor(material, 1), materialColor(material, 2)][i % 3];
          roundedRect(ctx, pseudoRandom(i, 72) * width, pseudoRandom(i, 73) * height, width * (0.12 + pseudoRandom(i, 74) * 0.16), height * (0.08 + pseudoRandom(i, 75) * 0.12), 26);
          ctx.fill();
        }
        ctx.restore();
      }
      drawSoftMaterialBlobs(ctx, width, height, material, material.blobs || 0.85);
    } else if (["fabric", "embroidery", "velvet", "tweed", "carbon"].includes(texture)) {
      drawWeaveTexture(ctx, width, height, material, material.weave || 1);
      if (texture === "embroidery" || texture === "tweed") drawLooseLines(ctx, width, height, material, { diagonal: true, step: 13, alpha: 0.13, color: "#ffffff", width: 1.1 });
      if (texture === "velvet") drawLooseLines(ctx, width, height, material, { diagonal: true, step: 24, alpha: 0.14, color: materialColor(material, 2), width: 4 });
    } else if (["plastic", "puffy", "clay"].includes(texture)) {
      drawSoftMaterialBlobs(ctx, width, height, material, material.blobs || 0.8);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const gloss = ctx.createLinearGradient(0, 0, width, height);
      gloss.addColorStop(0, "rgba(255,255,255,.62)");
      gloss.addColorStop(0.24, "rgba(255,255,255,.06)");
      gloss.addColorStop(0.5, "rgba(255,255,255,.28)");
      gloss.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gloss;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      if (texture === "clay") drawMaterialGrain(ctx, width, height, material, 0.8);
    } else if (["dark", "dark-lines", "carbon"].includes(texture)) {
      drawMaterialVignette(ctx, width, height, material.vignette || 0.46);
      drawLooseLines(ctx, width, height, material, { diagonal: texture !== "dark", step: texture === "dark-lines" ? 28 : 44, alpha: 0.12, color: materialColor(material, 2), width: 1.2 });
      if (texture === "carbon") drawWeaveTexture(ctx, width, height, material, 1.7);
    } else if (texture === "wood") {
      drawLooseLines(ctx, width, height, material, { step: 15, alpha: 0.18, color: materialColor(material, 1), width: 2 });
    } else if (texture === "stone") {
      drawLooseLines(ctx, width, height, material, { diagonal: true, step: 48, alpha: 0.18, color: materialColor(material, 1), width: 2.2 });
    } else if (texture === "cork") {
      drawMaterialGrain(ctx, width, height, material, 1.8);
      drawPaperFibers(ctx, width, height, material, 0.7);
    }
  }

  function drawCoverImage(ctx, image, x, y, width, height) {
    const iw = image.naturalWidth || image.width;
    const ih = image.naturalHeight || image.height;
    if (!iw || !ih) return;
    const scale = Math.max(width / iw, height / ih);
    const sw = width / scale;
    const sh = height / scale;
    ctx.drawImage(image, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, width, height);
  }

  function drawStyleFrame(ctx, width, height, type, size, color) {
    if (type === "none" || size <= 0) return;
    if (isRichStyleFrame(type)) {
      drawRichStyleFrame(ctx, width, height, type, size, color);
      return;
    }
    ctx.save();
    const inset = Math.max(4, size / 2);
    ctx.lineWidth = size;
    ctx.strokeStyle = color;
    if (!["lace", "bow", "wave", "polka", "ticket", "stitch"].includes(type)) {
      ctx.strokeRect(size / 2, size / 2, width - size, height - size);
    }
    if (type === "frame" || type === "screen") {
      ctx.strokeStyle = type === "screen" ? "rgba(20,24,32,.72)" : "rgba(255,255,255,.36)";
      ctx.lineWidth = Math.max(3, size * 0.22);
      ctx.strokeRect(size * 0.72, size * 0.72, width - size * 1.44, height - size * 1.44);
      ctx.strokeStyle = "rgba(0,0,0,.18)";
      ctx.strokeRect(size * 1.08, size * 1.08, width - size * 2.16, height - size * 2.16);
    } else if (type === "wave") {
      drawWavyFrame(ctx, inset, inset, width - inset * 2, height - inset * 2, color, Math.max(8, size * 0.42));
    } else if (type === "polka") {
      drawDottedFrame(ctx, inset, inset, width - inset * 2, height - inset * 2, color, Math.max(5, size * 0.22), Math.max(16, size * 0.65));
    } else if (type === "ticket") {
      drawTicketFrame(ctx, inset, inset, width - inset * 2, height - inset * 2, color, Math.max(8, size * 0.32));
    } else if (type === "stitch") {
      drawStitchFrame(ctx, inset, inset, width - inset * 2, height - inset * 2, color, Math.max(10, size * 0.42));
    } else if (type === "lace") {
      drawLaceFrame(ctx, inset, inset, width - inset * 2, height - inset * 2, color, Math.max(10, size * 0.34));
    } else if (type === "bow") {
      drawWavyFrame(ctx, inset, inset, width - inset * 2, height - inset * 2, color, Math.max(8, size * 0.32));
      drawBow(ctx, width / 2, inset * 0.9, Math.max(26, size * 0.9), color);
      drawBow(ctx, width / 2, height - inset * 0.9, Math.max(26, size * 0.9), color);
    }
    ctx.restore();
  }

  function isRichStyleFrame(type) {
    return [
      "french-frame",
      "wood-frame",
      "metal-frame",
      "classic-frame",
      "roman-frame",
      "oil-frame",
      "vine-frame",
      "oval-frame",
      "rounded-frame",
      "square-frame",
      "ceramic-frame",
      "carved-wood-frame"
    ].includes(type);
  }

  function getRichStyleFramePreset(type, fallbackColor) {
    const presets = {
      "french-frame": {
        shape: "rounded",
        colors: ["#fff0b7", "#c79632", "#6b4d1c"],
        accent: "#7a9a45",
        detail: "french",
        radius: 34
      },
      "wood-frame": {
        shape: "rounded",
        colors: ["#d2a36f", "#8d5c32", "#4f321d"],
        accent: "#f0cf9a",
        detail: "wood",
        radius: 16
      },
      "metal-frame": {
        shape: "rounded",
        colors: ["#f6f8fb", "#aeb7c2", "#4b5563"],
        accent: "#e9eef8",
        detail: "metal",
        radius: 18
      },
      "classic-frame": {
        shape: "rounded",
        colors: ["#dfb55b", "#76501f", "#2d2116"],
        accent: "#b51f2e",
        detail: "classic",
        radius: 18
      },
      "roman-frame": {
        shape: "square",
        colors: ["#efe2c7", "#bfa06f", "#6c5634"],
        accent: "#fbf4e2",
        detail: "roman",
        radius: 0
      },
      "oil-frame": {
        shape: "rounded",
        colors: ["#f6d883", "#ad782b", "#3f2a13"],
        accent: "#6f1f16",
        detail: "oil",
        radius: 10
      },
      "vine-frame": {
        shape: "rounded",
        colors: ["#e3d0a4", "#9a7a45", "#395328"],
        accent: "#587b39",
        detail: "vine",
        radius: 26
      },
      "oval-frame": {
        shape: "oval",
        colors: ["#f3d58c", "#b88436", "#5b3a19"],
        accent: "#fff0bd",
        detail: "classic",
        radius: 0
      },
      "rounded-frame": {
        shape: "rounded",
        colors: [shadeStyleColor(fallbackColor, 36), fallbackColor, shadeStyleColor(fallbackColor, -28)],
        accent: "#ffffff",
        detail: "clean",
        radius: 44
      },
      "square-frame": {
        shape: "square",
        colors: [shadeStyleColor(fallbackColor, 30), fallbackColor, shadeStyleColor(fallbackColor, -34)],
        accent: "#ffffff",
        detail: "clean",
        radius: 0
      },
      "ceramic-frame": {
        shape: "rounded",
        colors: ["#f5eee2", "#d7bfa2", "#8f7356"],
        accent: "#b39c84",
        detail: "ceramic",
        radius: 30
      },
      "carved-wood-frame": {
        shape: "rounded",
        colors: ["#c88c4b", "#70411e", "#2b1a10"],
        accent: "#e6bd78",
        detail: "carved",
        radius: 20
      }
    };
    return presets[type] || {
      shape: "rounded",
      colors: [shadeStyleColor(fallbackColor, 32), fallbackColor, shadeStyleColor(fallbackColor, -24)],
      accent: "#ffffff",
      detail: "clean",
      radius: 18
    };
  }

  function shadeStyleColor(hex, amount) {
    const safe = /^#[0-9a-f]{6}$/i.test(hex || "") ? hex : "#d8c7aa";
    const rgb = hexToRgb(safe);
    const channel = (value) => Math.max(0, Math.min(255, Math.round(value + amount)));
    return `rgb(${channel(rgb.r)}, ${channel(rgb.g)}, ${channel(rgb.b)})`;
  }

  function drawRichStyleFrame(ctx, width, height, type, size, color) {
    const preset = getRichStyleFramePreset(type, color);
    const lineWidth = Math.max(10, size);
    const inset = lineWidth / 2 + 8;
    const x = inset;
    const y = inset;
    const frameWidth = Math.max(24, width - inset * 2);
    const frameHeight = Math.max(24, height - inset * 2);
    const radius = preset.shape === "square" ? 0 : Math.min(Math.min(frameWidth, frameHeight) / 2, Math.max(8, preset.radius || lineWidth));
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, preset.colors[0]);
    gradient.addColorStop(0.28, preset.colors[1]);
    gradient.addColorStop(0.55, preset.colors[0]);
    gradient.addColorStop(0.78, preset.colors[1]);
    gradient.addColorStop(1, preset.colors[2]);

    ctx.save();
    drawRichFrameStroke(ctx, preset.shape, x, y, frameWidth, frameHeight, radius, lineWidth, gradient);
    drawRichFrameStroke(ctx, preset.shape, x - lineWidth * 0.2, y - lineWidth * 0.2, frameWidth + lineWidth * 0.4, frameHeight + lineWidth * 0.4, radius + lineWidth * 0.2, Math.max(2, lineWidth * 0.08), "rgba(255,255,255,.52)");
    drawRichFrameStroke(ctx, preset.shape, x + lineWidth * 0.46, y + lineWidth * 0.46, frameWidth - lineWidth * 0.92, frameHeight - lineWidth * 0.92, Math.max(0, radius - lineWidth * 0.46), Math.max(2, lineWidth * 0.1), "rgba(0,0,0,.22)");
    drawRichFrameStroke(ctx, preset.shape, x + lineWidth * 0.18, y + lineWidth * 0.18, frameWidth - lineWidth * 0.36, frameHeight - lineWidth * 0.36, Math.max(0, radius - lineWidth * 0.18), Math.max(2, lineWidth * 0.08), rgbaFromHex("#ffffff", 0.24));

    if (preset.detail === "wood" || preset.detail === "carved") drawWoodFrameDetails(ctx, x, y, frameWidth, frameHeight, lineWidth, preset);
    if (preset.detail === "metal") drawMetalFrameDetails(ctx, x, y, frameWidth, frameHeight, lineWidth, preset);
    if (preset.detail === "roman") drawRomanFrameDetails(ctx, x, y, frameWidth, frameHeight, lineWidth, preset);
    if (preset.detail === "vine") drawVineFrameDetails(ctx, x, y, frameWidth, frameHeight, lineWidth, preset);
    if (preset.detail === "ceramic") drawCeramicFrameDetails(ctx, x, y, frameWidth, frameHeight, lineWidth, preset);
    if (["french", "classic", "oil"].includes(preset.detail)) drawOrnateFrameDetails(ctx, x, y, frameWidth, frameHeight, lineWidth, preset);
    if (preset.detail === "clean") drawCleanFrameDetails(ctx, x, y, frameWidth, frameHeight, lineWidth, preset);
    ctx.restore();
  }

  function richFramePath(ctx, shape, x, y, width, height, radius) {
    ctx.beginPath();
    if (shape === "oval") {
      ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    } else {
      roundedRect(ctx, x, y, width, height, shape === "square" ? 0 : radius);
    }
  }

  function drawRichFrameStroke(ctx, shape, x, y, width, height, radius, lineWidth, strokeStyle) {
    if (width <= 0 || height <= 0 || lineWidth <= 0) return;
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.lineJoin = "round";
    richFramePath(ctx, shape, x, y, width, height, radius);
    ctx.stroke();
    ctx.restore();
  }

  function drawOrnateFrameDetails(ctx, x, y, width, height, size, preset) {
    const corner = Math.max(18, size * 0.78);
    const color = preset.accent;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(2, size * 0.07);
    drawCornerScroll(ctx, x + corner * 0.28, y + corner * 0.28, corner, 1, 1);
    drawCornerScroll(ctx, x + width - corner * 0.28, y + corner * 0.28, corner, -1, 1);
    drawCornerScroll(ctx, x + corner * 0.28, y + height - corner * 0.28, corner, 1, -1);
    drawCornerScroll(ctx, x + width - corner * 0.28, y + height - corner * 0.28, corner, -1, -1);
    drawFrameMedallion(ctx, x + width / 2, y, corner * 0.32, color);
    drawFrameMedallion(ctx, x + width / 2, y + height, corner * 0.32, color);
    if (preset.detail === "oil") {
      ctx.strokeStyle = preset.accent;
      ctx.lineWidth = Math.max(2, size * 0.12);
      ctx.strokeRect(x + size * 0.62, y + size * 0.62, width - size * 1.24, height - size * 1.24);
    }
    ctx.restore();
  }

  function drawCornerScroll(ctx, x, y, size, sx, sy) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    ctx.beginPath();
    ctx.moveTo(0, size * 0.1);
    ctx.bezierCurveTo(size * 0.35, size * 0.08, size * 0.44, size * 0.38, size * 0.18, size * 0.46);
    ctx.bezierCurveTo(size * 0.02, size * 0.52, -size * 0.14, size * 0.38, 0, size * 0.22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.15, 0);
    ctx.lineTo(size * 0.72, 0);
    ctx.moveTo(0, size * 0.15);
    ctx.lineTo(0, size * 0.72);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * 0.58, size * 0.58, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawFrameMedallion(ctx, x, y, radius, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255,255,255,.46)";
    ctx.lineWidth = Math.max(1, radius * 0.16);
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(i * Math.PI / 2) * radius * 0.6, y + Math.sin(i * Math.PI / 2) * radius * 0.6, radius * 0.42, radius * 0.16, i * Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWoodFrameDetails(ctx, x, y, width, height, size, preset) {
    ctx.save();
    ctx.strokeStyle = preset.accent;
    ctx.lineWidth = Math.max(1, size * 0.055);
    ctx.globalAlpha = 0.42;
    for (let i = 0; i < 18; i += 1) {
      const topY = y - size * 0.35 + (i / 17) * size * 0.7;
      const bottomY = y + height - size * 0.35 + (i / 17) * size * 0.7;
      ctx.beginPath();
      ctx.moveTo(x + size * 0.2, topY + Math.sin(i) * 2);
      ctx.bezierCurveTo(x + width * 0.28, topY + Math.cos(i) * 5, x + width * 0.66, topY - Math.sin(i) * 4, x + width - size * 0.2, topY + Math.cos(i) * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + size * 0.2, bottomY + Math.cos(i) * 2);
      ctx.bezierCurveTo(x + width * 0.34, bottomY - Math.sin(i) * 5, x + width * 0.7, bottomY + Math.cos(i) * 4, x + width - size * 0.2, bottomY - Math.sin(i) * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 14; i += 1) {
      const leftX = x - size * 0.35 + (i / 13) * size * 0.7;
      const rightX = x + width - size * 0.35 + (i / 13) * size * 0.7;
      ctx.beginPath();
      ctx.moveTo(leftX, y + size * 0.25);
      ctx.bezierCurveTo(leftX + Math.sin(i) * 5, y + height * 0.28, leftX - Math.cos(i) * 4, y + height * 0.68, leftX, y + height - size * 0.25);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightX, y + size * 0.25);
      ctx.bezierCurveTo(rightX - Math.cos(i) * 5, y + height * 0.3, rightX + Math.sin(i) * 4, y + height * 0.72, rightX, y + height - size * 0.25);
      ctx.stroke();
    }
    if (preset.detail === "carved") {
      ctx.globalAlpha = 0.62;
      ctx.setLineDash([size * 0.2, size * 0.18]);
      drawRichFrameStroke(ctx, "rounded", x + size * 0.05, y + size * 0.05, width - size * 0.1, height - size * 0.1, Math.max(8, size * 0.4), Math.max(2, size * 0.08), preset.accent);
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  function drawMetalFrameDetails(ctx, x, y, width, height, size, preset) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = -height; i < width; i += Math.max(18, size * 0.72)) {
      const shine = ctx.createLinearGradient(i, y, i + height, y + height);
      shine.addColorStop(0, "rgba(255,255,255,0)");
      shine.addColorStop(0.5, "rgba(255,255,255,.5)");
      shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = shine;
      ctx.lineWidth = Math.max(4, size * 0.13);
      ctx.beginPath();
      ctx.moveTo(i, y - size);
      ctx.lineTo(i + height, y + height + size);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = "rgba(35,45,60,.38)";
    ctx.lineWidth = Math.max(1, size * 0.04);
    drawRichFrameStroke(ctx, "rounded", x + size * 0.28, y + size * 0.28, width - size * 0.56, height - size * 0.56, Math.max(8, size * 0.48), ctx.lineWidth, ctx.strokeStyle);
    ctx.restore();
  }

  function drawRomanFrameDetails(ctx, x, y, width, height, size, preset) {
    ctx.save();
    ctx.strokeStyle = preset.accent;
    ctx.fillStyle = rgbaFromHex("#ffffff", 0.2);
    ctx.lineWidth = Math.max(2, size * 0.08);
    const step = Math.max(36, size * 1.2);
    for (let px = x + step; px < x + width - step * 0.5; px += step) {
      ctx.beginPath();
      ctx.moveTo(px, y - size * 0.42);
      ctx.lineTo(px, y + size * 0.42);
      ctx.moveTo(px, y + height - size * 0.42);
      ctx.lineTo(px, y + height + size * 0.42);
      ctx.stroke();
    }
    for (let py = y + step; py < y + height - step * 0.5; py += step) {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.42, py);
      ctx.lineTo(x + size * 0.42, py);
      ctx.moveTo(x + width - size * 0.42, py);
      ctx.lineTo(x + width + size * 0.42, py);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawVineFrameDetails(ctx, x, y, width, height, size, preset) {
    ctx.save();
    ctx.strokeStyle = preset.accent;
    ctx.fillStyle = preset.accent;
    ctx.lineWidth = Math.max(2, size * 0.07);
    const step = Math.max(34, size * 0.95);
    for (let px = x + step * 0.4; px < x + width; px += step) {
      drawLeafPair(ctx, px, y - size * 0.12, size * 0.2, 0);
      drawLeafPair(ctx, px + step * 0.35, y + height + size * 0.12, size * 0.2, Math.PI);
    }
    for (let py = y + step * 0.4; py < y + height; py += step) {
      drawLeafPair(ctx, x - size * 0.12, py, size * 0.2, Math.PI * 1.5);
      drawLeafPair(ctx, x + width + size * 0.12, py + step * 0.35, size * 0.2, Math.PI / 2);
    }
    ctx.restore();
  }

  function drawLeafPair(ctx, x, y, radius, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.ellipse(-radius * 0.55, 0, radius * 0.52, radius * 0.22, -0.55, 0, Math.PI * 2);
    ctx.ellipse(radius * 0.55, 0, radius * 0.52, radius * 0.22, 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCeramicFrameDetails(ctx, x, y, width, height, size, preset) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < 70; i += 1) {
      const side = i % 4;
      const along = pseudoRandom(i, 83) * (side < 2 ? width : height);
      const across = (pseudoRandom(i, 89) - 0.5) * size * 0.7;
      const px = side === 0 ? x + along : side === 1 ? x + along : side === 2 ? x + across : x + width + across;
      const py = side === 0 ? y + across : side === 1 ? y + height + across : side === 2 ? y + along : y + along;
      ctx.fillStyle = i % 3 ? preset.accent : "rgba(255,255,255,.7)";
      ctx.beginPath();
      ctx.arc(px, py, 1.2 + pseudoRandom(i, 91) * Math.max(1.4, size * 0.045), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCleanFrameDetails(ctx, x, y, width, height, size, preset) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.5)";
    ctx.lineWidth = Math.max(2, size * 0.07);
    ctx.strokeRect(x + size * 0.18, y + size * 0.18, width - size * 0.36, height - size * 0.36);
    ctx.strokeStyle = "rgba(0,0,0,.15)";
    ctx.strokeRect(x - size * 0.18, y - size * 0.18, width + size * 0.36, height + size * 0.36);
    ctx.restore();
  }

  function drawWavyFrame(ctx, x, y, width, height, color, amp) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(3, amp * 0.34);
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let px = x; px <= x + width; px += amp) {
      const py = y + Math.sin((px - x) / amp * Math.PI) * amp * 0.22;
      if (px === x) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    for (let py = y; py <= y + height; py += amp) ctx.lineTo(x + width + Math.sin((py - y) / amp * Math.PI) * amp * 0.22, py);
    for (let px = x + width; px >= x; px -= amp) ctx.lineTo(px, y + height + Math.sin((px - x) / amp * Math.PI) * amp * 0.22);
    for (let py = y + height; py >= y; py -= amp) ctx.lineTo(x + Math.sin((py - y) / amp * Math.PI) * amp * 0.22, py);
    ctx.closePath();
    ctx.stroke();
  }

  function drawDottedFrame(ctx, x, y, width, height, color, radius, gap) {
    ctx.fillStyle = color;
    const points = [];
    for (let px = x; px <= x + width; px += gap) points.push([px, y], [px, y + height]);
    for (let py = y; py <= y + height; py += gap) points.push([x, py], [x + width, py]);
    points.forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.34)";
      ctx.beginPath();
      ctx.arc(px - radius * 0.28, py - radius * 0.28, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = color;
    });
  }

  function drawTicketFrame(ctx, x, y, width, height, color, radius) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.globalCompositeOperation = "destination-out";
    for (let px = x; px <= x + width; px += radius * 2) {
      ctx.beginPath(); ctx.arc(px, y, radius, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(px, y + height, radius, 0, Math.PI * 2); ctx.fill();
    }
    for (let py = y; py <= y + height; py += radius * 2) {
      ctx.beginPath(); ctx.arc(x, py, radius, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(x + width, py, radius, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function drawStitchFrame(ctx, x, y, width, height, color, step) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, step * 0.16);
    ctx.setLineDash([step * 0.55, step * 0.38]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
  }

  function drawLaceFrame(ctx, x, y, width, height, color, radius) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, radius * 0.18);
    for (let px = x; px <= x + width; px += radius * 1.8) {
      ctx.beginPath(); ctx.arc(px, y, radius, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.arc(px, y + height, radius, 0, Math.PI); ctx.stroke();
    }
    for (let py = y; py <= y + height; py += radius * 1.8) {
      ctx.beginPath(); ctx.arc(x, py, radius, -Math.PI / 2, Math.PI / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + width, py, radius, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
    }
  }

  function drawBow(ctx, x, y, size, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255,255,255,.38)";
    ctx.lineWidth = Math.max(2, size * 0.05);
    ctx.beginPath();
    ctx.ellipse(x - size * 0.38, y, size * 0.38, size * 0.22, -0.18, 0, Math.PI * 2);
    ctx.ellipse(x + size * 0.38, y, size * 0.38, size * 0.22, 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.55)";
    ctx.fillRect(x - size * 0.1, y - size * 0.15, size * 0.2, size * 0.3);
    ctx.restore();
  }

  function drawStyleShadow(ctx, art, x, y, color, alpha, blur, offsetX, offsetY) {
    if (alpha <= 0 && blur <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = rgbaFromHex(color, alpha);
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = offsetX;
    ctx.shadowOffsetY = offsetY;
    ctx.drawImage(art, x, y);
    ctx.restore();
  }

  function drawStyleThickness(ctx, art, x, y, thickness) {
    if (thickness <= 0) return;
    ctx.save();
    for (let i = thickness; i >= 1; i -= 1) {
      ctx.globalAlpha = 0.035 + i / Math.max(1, thickness) * 0.08;
      ctx.filter = "brightness(0.68)";
      ctx.drawImage(art, x + i * 0.48, y + i);
    }
    ctx.restore();
  }

  function applySurfaceMask(ctx, mode, x, y, width, height, cell, pattern, intensity) {
    const alpha = intensity;
    const drawLines = (stroke, lineWidth, step, diagonal) => {
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      for (let i = diagonal ? x - height : y; i < (diagonal ? x + width : y + height); i += step) {
        ctx.beginPath();
        if (diagonal) {
          ctx.moveTo(i, y);
          ctx.lineTo(i + height, y + height);
        } else {
          ctx.moveTo(x, i);
          ctx.lineTo(x + width, i);
        }
        ctx.stroke();
      }
      ctx.restore();
    };
    const drawGloss = (amount) => {
      const g = ctx.createLinearGradient(x, y, x + width, y + height);
      g.addColorStop(0, `rgba(255,255,255,${amount * alpha})`);
      g.addColorStop(0.5, "rgba(255,255,255,0)");
      g.addColorStop(1, `rgba(0,0,0,${amount * 0.42 * alpha})`);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, width, height);
    };
    if (mode === "normal") drawGloss(0.2);
    if (mode === "matte") {
      ctx.fillStyle = `rgba(255,255,255,${0.12 * alpha})`;
      ctx.fillRect(x, y, width, height);
    }
    if (mode === "parchment") drawLines(`rgba(255,255,255,${0.32 * alpha})`, Math.max(1, cell * 0.08), cell * 1.4, true);
    if (mode === "coarse-towel") drawLines(`rgba(255,255,255,${0.38 * alpha})`, Math.max(1.4, cell * 0.18), cell * 0.82, true);
    if (mode === "fine-towel") drawLines(`rgba(255,255,255,${0.30 * alpha})`, Math.max(0.8, cell * 0.09), cell * 0.42, true);
    if (["felt-mask", "linen", "canvas"].includes(mode)) {
      drawLines(`rgba(255,255,255,${0.20 * alpha})`, 1.2, mode === "felt-mask" ? 9 : 14, true);
      drawLines(`rgba(0,0,0,${0.08 * alpha})`, 1, mode === "canvas" ? 18 : 11, false);
    }
    if (mode === "diagonal") drawLines(`rgba(255,255,255,${0.34 * alpha})`, Math.max(1, cell * 0.12), cell * 0.7, true);
    if (mode === "grid") {
      drawLines(`rgba(255,255,255,${0.22 * alpha})`, 1, cell * 1.2, false);
      ctx.save();
      ctx.strokeStyle = `rgba(0,0,0,${0.08 * alpha})`;
      ctx.lineWidth = 1;
      for (let xx = x; xx <= x + width; xx += cell * 1.2) {
        ctx.beginPath();
        ctx.moveTo(xx, y);
        ctx.lineTo(xx, y + height);
        ctx.stroke();
      }
      ctx.restore();
    }
    if (mode === "wave" || mode === "ripple") {
      ctx.strokeStyle = `rgba(255,255,255,${0.34 * alpha})`;
      ctx.lineWidth = Math.max(1, cell * 0.1);
      for (let yy = y; yy < y + height; yy += cell * (mode === "wave" ? 0.9 : 0.55)) {
        ctx.beginPath();
        ctx.moveTo(x, yy);
        for (let xx = x; xx <= x + width; xx += cell) ctx.quadraticCurveTo(xx + cell * 0.5, yy - cell * 0.26, xx + cell, yy);
        ctx.stroke();
      }
    }
    if (["dots", "grain", "glitter", "black-glitter", "rainbow-glitter"].includes(mode)) {
      const count = Math.max(90, Math.floor(width * height / (mode.includes("glitter") ? 900 : 1500)));
      for (let i = 0; i < count; i += 1) {
        const px = x + ((i * 37) % Math.max(1, width));
        const py = y + ((i * 53) % Math.max(1, height));
        const size = mode.includes("glitter") ? 1.5 + (i % 5) : 0.8 + (i % 2);
        ctx.fillStyle = mode === "rainbow-glitter"
          ? `hsla(${(i * 47) % 360}, 90%, 75%, ${0.62 * alpha})`
          : mode === "black-glitter"
            ? `rgba(230,238,255,${0.66 * alpha})`
            : `rgba(255,255,255,${0.70 * alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (["pearl", "holographic", "plastic", "ceramic", "bead-3d"].includes(mode)) drawGloss(mode === "holographic" ? 0.42 : 0.28);
    if (mode === "holographic") {
      const g = ctx.createLinearGradient(x, y, x + width, y);
      ["rgba(255,0,120,.16)", "rgba(0,180,255,.16)", "rgba(255,230,0,.14)", "rgba(180,80,255,.15)"].forEach((color, index) => g.addColorStop(index / 3, color));
      ctx.fillStyle = g;
      ctx.fillRect(x, y, width, height);
    }
    if (mode === "cross-stitch") {
      for (let row = 0; row < pattern.height; row += 1) {
        for (let col = 0; col < pattern.width; col += 1) {
          if (!pattern.cells[row][col] || pattern.cells[row][col] === "H1") continue;
          const px = x + col * cell;
          const py = y + row * cell;
          ctx.strokeStyle = `rgba(255,255,255,${0.34 * alpha})`;
          ctx.lineWidth = Math.max(1, cell * 0.12);
          ctx.beginPath();
          ctx.moveTo(px + cell * 0.18, py + cell * 0.18);
          ctx.lineTo(px + cell * 0.82, py + cell * 0.82);
          ctx.moveTo(px + cell * 0.82, py + cell * 0.18);
          ctx.lineTo(px + cell * 0.18, py + cell * 0.82);
          ctx.stroke();
        }
      }
    }
    if (mode === "holes") {
      ctx.globalCompositeOperation = "destination-out";
      for (let row = 0; row < pattern.height; row += 1) {
        for (let col = 0; col < pattern.width; col += 1) {
          if (!pattern.cells[row][col] || pattern.cells[row][col] === "H1") continue;
          ctx.beginPath();
          ctx.arc(x + col * cell + cell / 2, y + row * cell + cell / 2, Math.max(1, cell * 0.16), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalCompositeOperation = "source-over";
    }
  }

  function openMaterialPreview() {
    if (!getMaterialPattern()) {
      setMessage("请先载入图片或生成图纸。", true);
      return;
    }
    state.beads.styleStickerLibrary = getStyleStickerLibrary();
    renderStyleStickerList();
    renderStylePresetList();
    populateStyleFontSelect();
    if (!drawMaterialPreview()) {
      setMessage("样式预览生成失败，请重试。", true);
      return;
    }
    els.materialPreviewModal.classList.remove("hidden");
  }

  function closeMaterialPreview() {
    if (els.materialPreviewModal) els.materialPreviewModal.classList.add("hidden");
  }

  function openCharmPreview() {
    if (!getMaterialPattern()) {
      setMessage("请先载入图片或生成图纸。", true);
      return;
    }
    if (!drawCharmPreview()) {
      setMessage("挂件预览生成失败，请重试。", true);
      return;
    }
    els.charmPreviewModal.classList.remove("hidden");
  }

  function closeCharmPreview() {
    if (els.charmPreviewModal) els.charmPreviewModal.classList.add("hidden");
  }

  function drawCharmPreview() {
    const pattern = getMaterialPattern();
    if (!pattern || !els.charmPreviewCanvas) return false;
    const holePosition = els.charmHolePositionSelect ? els.charmHolePositionSelect.value : "top-center";
    const holeSize = els.charmHoleSizeRange ? clamp(els.charmHoleSizeRange.value, 1, 8) : 3;
    const keyring = els.charmKeyringSelect ? els.charmKeyringSelect.value : "silver-ring";
    const cord = els.charmCordSelect ? els.charmCordSelect.value : "none";
    const link = els.charmLinkSelect ? els.charmLinkSelect.value : "single";
    if (els.charmHoleSizeLabel) els.charmHoleSizeLabel.textContent = String(holeSize);
    const canvas = els.charmPreviewCanvas;
    canvas.width = 900;
    canvas.height = 640;
    const ctx = canvas.getContext("2d");
    drawMaterialSceneBackground(ctx, canvas.width, canvas.height, "studio");
    const cell = Math.max(4, Math.min(14, Math.floor(420 / Math.max(pattern.width, pattern.height))));
    const art = makeSolidPatternCanvas(pattern, cell);
    const x = Math.round((canvas.width - art.width) / 2);
    const y = Math.round((canvas.height - art.height) / 2 + 45);
    ctx.save();
    ctx.globalAlpha = 0.26;
    ctx.filter = "blur(14px)";
    ctx.drawImage(art, x + 16, y + 22);
    ctx.restore();
    ctx.save();
    ctx.shadowColor = "rgba(20,24,32,.28)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 12;
    ctx.drawImage(art, x, y);
    ctx.restore();
    drawCharmGloss(ctx, x, y, art.width, art.height);
    const holes = getCharmHolePoints(holePosition, link, x, y, art.width, art.height);
    holes.forEach((point) => drawCharmHole(ctx, point.x, point.y, holeSize * cell * 0.18));
    if (keyring !== "none") drawKeyring(ctx, holes, keyring, cell);
    if (cord !== "none") drawCord(ctx, holes, cord, cell);
    ctx.fillStyle = "#172033";
    ctx.font = "900 22px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Q像素挂件预览", 28, 38);
    ctx.font = "700 14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = "#667085";
    ctx.fillText(`${getCharmLabel(keyring)} · ${getCharmLabel(cord)} · ${getCharmLabel(holePosition)}`, 28, 64);
    return true;
  }

  function makeSolidPatternCanvas(pattern, cell) {
    const canvas = document.createElement("canvas");
    canvas.width = pattern.width * cell;
    canvas.height = pattern.height * cell;
    const ctx = canvas.getContext("2d");
    for (let row = 0; row < pattern.height; row += 1) {
      for (let col = 0; col < pattern.width; col += 1) {
        const code = pattern.cells[row][col];
        if (!code || code === "H1") continue;
        ctx.fillStyle = getPaletteColor(code).hex;
        ctx.fillRect(col * cell, row * cell, cell, cell);
      }
    }
    return canvas;
  }

  function getCharmHolePoints(position, link, x, y, width, height) {
    if (position === "dual-top" || link === "double") return [{ x: x + width * 0.38, y: y + Math.max(12, height * 0.05) }, { x: x + width * 0.62, y: y + Math.max(12, height * 0.05) }];
    if (position === "top-left" || link === "side") return [{ x: x + width * 0.24, y: y + Math.max(12, height * 0.08) }];
    if (position === "top-right") return [{ x: x + width * 0.76, y: y + Math.max(12, height * 0.08) }];
    return [{ x: x + width * 0.5, y: y + Math.max(12, height * 0.04) }];
  }

  function drawCharmHole(ctx, x, y, radius) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "rgba(255,255,255,.9)";
    ctx.lineWidth = Math.max(2, radius * 0.35);
    ctx.beginPath();
    ctx.arc(x, y, radius + ctx.lineWidth * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(0,0,0,.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawKeyring(ctx, holes, type, cell) {
    const color = type === "gold-ring" ? "#d7a83a" : "#c8d0d8";
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(4, cell * 0.35);
    ctx.lineCap = "round";
    holes.forEach((hole) => {
      if (type === "ball-chain") {
        for (let i = 0; i < 14; i += 1) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(hole.x + Math.sin(i * 0.8) * cell * 1.4, hole.y - cell * (2 + i * 0.58), Math.max(2, cell * 0.22), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (type === "lobster") {
        ctx.beginPath();
        ctx.moveTo(hole.x, hole.y);
        ctx.quadraticCurveTo(hole.x + cell * 1.3, hole.y - cell * 2.2, hole.x, hole.y - cell * 3.6);
        ctx.quadraticCurveTo(hole.x - cell * 1.6, hole.y - cell * 2.2, hole.x, hole.y);
        ctx.stroke();
        ctx.strokeRect(hole.x - cell * 0.45, hole.y - cell * 4.5, cell * 0.9, cell * 0.9);
      } else {
        ctx.beginPath();
        ctx.arc(hole.x, hole.y - cell * 2.1, cell * 1.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  function drawCord(ctx, holes, type, cell) {
    const colors = type === "rainbow" ? ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7"] : [type === "pink" ? "#f3a8c8" : "#20242c"];
    ctx.save();
    ctx.lineWidth = Math.max(4, cell * 0.28);
    holes.forEach((hole) => {
      colors.forEach((color, index) => {
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(hole.x + (index - colors.length / 2) * 2, hole.y - cell * 0.5);
        ctx.bezierCurveTo(hole.x - cell * 1.4, hole.y - cell * 5, hole.x + cell * 2.5, hole.y - cell * 7, hole.x + cell * 0.2, hole.y - cell * 9);
        ctx.stroke();
      });
    });
    ctx.restore();
  }

  function drawCharmGloss(ctx, x, y, width, height) {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, "rgba(255,255,255,.42)");
    gradient.addColorStop(0.35, "rgba(255,255,255,.08)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  function getCharmLabel(value) {
    return {
      "silver-ring": "银色圆环",
      "gold-ring": "金色圆环",
      "ball-chain": "珠链",
      lobster: "龙虾扣",
      none: "无",
      black: "黑色手绳",
      pink: "粉色手绳",
      rainbow: "彩虹手绳",
      "top-center": "顶部居中",
      "top-left": "左上角",
      "top-right": "右上角",
      "dual-top": "顶部双孔"
    }[value] || value;
  }

  function makeBeadPixelCanvas(pattern, options) {
    if (!pattern) return null;
    const cellSize = Math.max(4, Math.min(18, Math.floor(1800 / Math.max(pattern.width, pattern.height))));
    const canvas = document.createElement("canvas");
    canvas.width = pattern.width * cellSize;
    canvas.height = pattern.height * cellSize;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPatternGrid(ctx, pattern, 0, 0, cellSize, {
      showCodes: false,
      showGrid: false,
      showCenterLines: false,
      cellGap: options && options.cellGap,
      cellRadius: options && options.cellRadius
    });
    return canvas;
  }

  function exportBeadPixelPng() {
    const canvas = makeBeadPixelCanvas(state.beads.pattern);
    if (!canvas) {
      setMessage("请先生成拼豆图纸。", true);
      return;
    }
    saveCanvasAsPng(
      canvas,
      `Q像素-拼豆像素画-${formatStamp(new Date())}.png`,
      "请选择像素画 PNG 保存位置。",
      "拼豆像素画 PNG 已保存。"
    );
  }

  function makeProjectPayload() {
    if (!state.beads.pattern) return null;
    syncCompositePattern();
    return {
      version: 1,
      app: "Q像素",
      type: "bead-pattern",
      id: state.beads.projectId || makeId(),
      title: state.beads.projectTitle || "未命名",
      createdAt: state.beads.projectCreatedAt || new Date().toISOString(),
      sourceLabel: state.beads.sourceLabel || state.beads.pattern.sourceLabel || "",
      savedAt: new Date().toISOString(),
      palette: "Mard-221",
      pattern: {
        width: state.beads.pattern.width,
        height: state.beads.pattern.height,
        cells: state.beads.pattern.cells
      },
      layers: state.beads.layers.map((layer) => ({
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
        locked: layer.locked,
        groupName: layer.groupName || "",
        cells: layer.cells
      })),
      activeLayerId: state.beads.activeLayerId,
      buildProgress: Object.assign({}, state.buildProgress || {}),
      exportSettings: Object.assign({}, state.beads.exportSettings),
      exportRegions: normalizeExportRegions(state.beads.exportRegions, state.beads.pattern),
      editorSettings: {
        eraserSize: state.beads.eraserSize,
        codeFontScale: state.beads.codeFontScale,
        selectMode: state.beads.selectMode,
        selectionOp: state.beads.selectionOp,
        baseboardMode: state.beads.baseboardMode,
        baseboardColor: state.beads.baseboardColor,
        guideLines: normalizeGuideLines(),
        guideOrientation: state.beads.guideOrientation,
        guideStyle: state.beads.guideStyle,
        guideColor: state.beads.guideColor,
        guideOpacity: state.beads.guideOpacity,
        importMode: getImportMode(),
        sourceCompareEnabled: Boolean(state.beads.sourceCompareEnabled),
        sourceCompareOpacity: state.beads.sourceCompareOpacity,
        lockedColorCodes: Array.isArray(state.beads.lockedColorCodes) ? state.beads.lockedColorCodes.slice() : [],
        lockedColorRoles: Object.assign({}, state.beads.lockedColorRoles || {})
      }
    };
  }

  function applyProjectPayload(payload, keepId) {
    if (!payload || !payload.pattern || !Array.isArray(payload.pattern.cells)) {
      setMessage("源文件格式不正确。", true);
      return false;
    }
    const width = clamp(payload.pattern.width, bounds.beadSize.min, bounds.beadSize.max);
    const height = clamp(payload.pattern.height, bounds.beadSize.min, bounds.beadSize.max);
    if (payload.pattern.cells.length !== height || payload.pattern.cells.some((row) => !Array.isArray(row) || row.length !== width)) {
      setMessage("源文件里的图纸尺寸不匹配。", true);
      return false;
    }
    state.beads.pattern = {
      width,
      height,
      cells: payload.pattern.cells.map((row) => row.map((code) => code && getPaletteColor(code).code === code ? code : null)),
      sourceLabel: payload.sourceLabel || "本地源文件",
      createdAt: payload.savedAt || new Date().toISOString()
    };
    state.beads.width = width;
    state.beads.height = height;
    if (Array.isArray(payload.layers) && payload.layers.length) {
      state.beads.layers = payload.layers.map((layer) => ({
        id: layer.id || makeId(),
        name: layer.name || "图层",
        visible: layer.visible !== false,
        locked: Boolean(layer.locked),
        groupName: layer.groupName || "",
        cells: Array.isArray(layer.cells) ? layer.cells.map((row) => row.map((code) => code && getPaletteColor(code).code === code ? code : null)) : makeEmptyCells(height, width)
      }));
      state.beads.activeLayerId = payload.activeLayerId || state.beads.layers[0].id;
    } else {
      state.beads.layers = [];
      state.beads.activeLayerId = "";
      ensureLayers();
    }
    state.beads.projectId = keepId === false ? null : (payload.id || makeId());
    state.beads.projectTitle = payload.title || "未命名";
    state.beads.projectCreatedAt = payload.createdAt || payload.savedAt || new Date().toISOString();
    if (els.imageStatus) els.imageStatus.textContent = state.beads.projectTitle;
    state.beads.sourceLabel = payload.sourceLabel || "本地源文件";
    state.beads.exportSettings = Object.assign({}, state.beads.exportSettings, payload.exportSettings || {});
    state.beads.exportRegions = normalizeExportRegions(payload.exportRegions || [], state.beads.pattern);
    state.beads.eraserSize = clamp(payload.editorSettings && payload.editorSettings.eraserSize, 1, 10);
    state.beads.codeFontScale = payload.editorSettings && Number.isFinite(Number(payload.editorSettings.codeFontScale))
      ? clamp(payload.editorSettings.codeFontScale, 80, 180)
      : 125;
    state.beads.selectMode = payload.editorSettings && payload.editorSettings.selectMode === "lasso" ? "lasso" : "rect";
    state.beads.selectionOp = ["replace", "add", "subtract"].includes(payload.editorSettings && payload.editorSettings.selectionOp) ? payload.editorSettings.selectionOp : "replace";
    state.beads.baseboardMode = ["transparent", "white", "black", "custom"].includes(payload.editorSettings && payload.editorSettings.baseboardMode)
      ? payload.editorSettings.baseboardMode
      : state.beads.baseboardMode;
    state.beads.baseboardColor = payload.editorSettings && /^#[0-9a-f]{6}$/i.test(payload.editorSettings.baseboardColor || "")
      ? payload.editorSettings.baseboardColor
      : state.beads.baseboardColor;
    state.beads.importMode = ["fidelity", "balanced", "simple"].includes(payload.editorSettings && payload.editorSettings.importMode)
      ? payload.editorSettings.importMode
      : "fidelity";
    state.beads.sourceCompareEnabled = Boolean(payload.editorSettings && payload.editorSettings.sourceCompareEnabled);
    state.beads.sourceCompareOpacity = payload.editorSettings && payload.editorSettings.sourceCompareOpacity != null
      ? clamp(payload.editorSettings.sourceCompareOpacity, 10, 85)
      : 38;
    state.buildProgress = payload.buildProgress && typeof payload.buildProgress === "object" ? Object.assign({}, payload.buildProgress) : {};
    state.beads.buildMode = false;
    state.beads.lockedColorCodes = Array.isArray(payload.editorSettings && payload.editorSettings.lockedColorCodes)
      ? payload.editorSettings.lockedColorCodes.filter((code) => code && getPaletteColor(code).code === code)
      : [];
    state.beads.lockedColorRoles = payload.editorSettings && payload.editorSettings.lockedColorRoles && typeof payload.editorSettings.lockedColorRoles === "object"
      ? Object.assign({}, payload.editorSettings.lockedColorRoles)
      : {};
    state.beads.guideLines = Array.isArray(payload.editorSettings && payload.editorSettings.guideLines)
      ? payload.editorSettings.guideLines.map((guide, index) => normalizeGuideLine(guide, index))
      : [];
    state.beads.guideOrientation = payload.editorSettings && payload.editorSettings.guideOrientation === "horizontal" ? "horizontal" : "vertical";
    state.beads.guideStyle = payload.editorSettings && payload.editorSettings.guideStyle === "solid" ? "solid" : "dashed";
    state.beads.guideColor = payload.editorSettings && /^#[0-9a-f]{6}$/i.test(payload.editorSettings.guideColor || "") ? payload.editorSettings.guideColor : "#ff9d38";
    state.beads.guideOpacity = payload.editorSettings && Number.isFinite(Number(payload.editorSettings.guideOpacity))
      ? clamp(payload.editorSettings.guideOpacity, 10, 100)
      : 80;
    state.beads.selectedCells = [];
    syncCompositePattern();
    state.view.zoom = 1;
    state.view.panX = 0;
    state.view.panY = 0;
    clearHistory();
    state.activeSessionStart = Date.now();
    setMode("beads");
    setMessage("源文件已打开。", false);
    return true;
  }

  function makeId() {
    return `qpx-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function meaningfulPayload(payload) {
    if (!payload || typeof payload !== "object") return null;
    const copy = JSON.parse(JSON.stringify(payload));
    delete copy.savedAt;
    delete copy.createdAt;
    delete copy.title;
    delete copy.id;
    return copy;
  }

  function payloadFingerprint(payload) {
    const text = stableStringify(meaningfulPayload(payload));
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `fp-${(hash >>> 0).toString(16).padStart(8, "0")}-${text.length}`;
  }

  function normalizeProjectHistory(history) {
    return Array.isArray(history)
      ? history
        .filter((item) => item && item.payload && item.fingerprint)
        .map((item) => ({
          id: item.id || makeId(),
          title: item.title || "未命名",
          savedAt: item.savedAt || new Date().toISOString(),
          fingerprint: item.fingerprint,
          payload: item.payload
        }))
        .slice(0, 12)
      : [];
  }

  function makeProjectVersion(project) {
    if (!project || !project.payload) return null;
    return {
      id: makeId(),
      title: project.title || (project.payload && project.payload.title) || "未命名",
      savedAt: project.savedAt || (project.payload && project.payload.savedAt) || new Date().toISOString(),
      fingerprint: payloadFingerprint(project.payload),
      payload: JSON.parse(JSON.stringify(project.payload))
    };
  }

  function withProjectHistory(nextProject, existingProject) {
    const next = normalizeProject(nextProject);
    const existing = existingProject ? normalizeProject(existingProject) : null;
    const history = normalizeProjectHistory((existing && existing.history) || next.history);
    const nextFingerprint = payloadFingerprint(next.payload);
    next.syncFingerprint = next.syncFingerprint || (existing && existing.syncFingerprint) || (existing && existing.payload ? payloadFingerprint(existing.payload) : nextFingerprint);
    if (existing && existing.payload) {
      const previousFingerprint = payloadFingerprint(existing.payload);
      const alreadyLatest = history[0] && history[0].fingerprint === previousFingerprint;
      if (previousFingerprint !== nextFingerprint && !alreadyLatest) {
        const version = makeProjectVersion(existing);
        if (version) history.unshift(version);
      }
    }
    next.history = history.slice(0, 12);
    return next;
  }

  function restoreProjectHistoryVersionForTest(project, versionId, now) {
    const current = normalizeProject(project);
    const version = normalizeProjectHistory(current.history).find((item) => item.id === versionId);
    if (!current.payload || !version || !version.payload) return null;
    const savedAt = now || new Date().toISOString();
    const payload = JSON.parse(JSON.stringify(version.payload));
    payload.id = current.id;
    payload.title = current.title || payload.title || "未命名";
    payload.createdAt = current.createdAt || payload.createdAt || savedAt;
    payload.savedAt = savedAt;
    return withProjectHistory({
      id: current.id,
      title: payload.title,
      createdAt: current.createdAt || payload.createdAt,
      savedAt,
      updatedAt: savedAt,
      width: payload.pattern && payload.pattern.width,
      height: payload.pattern && payload.pattern.height,
      thumbnail: current.thumbnail || "",
      editSeconds: current.editSeconds,
      openCount: current.openCount,
      designDates: current.designDates,
      payload
    }, current);
  }

  function hasMeaningfulPayloadConflict(existing, incoming) {
    if (!existing || !incoming || !existing.payload || !incoming.payload) return false;
    const existingFingerprint = payloadFingerprint(existing.payload);
    const incomingFingerprint = payloadFingerprint(incoming.payload);
    if (existingFingerprint === incomingFingerprint) return false;
    const base = existing.syncFingerprint || incoming.syncFingerprint || "";
    if (!base) return false;
    return existingFingerprint !== base && incomingFingerprint !== base;
  }

  function makeConflictCopy(project) {
    const now = new Date().toISOString();
    const copy = normalizeProject(JSON.parse(JSON.stringify(project)));
    const originalId = copy.id;
    copy.id = makeId();
    copy.title = `${copy.title || "未命名"} 冲突副本`;
    copy.createdAt = now;
    copy.savedAt = now;
    copy.updatedAt = now;
    copy.openCount = 0;
    copy.conflictOf = originalId;
    copy.syncFingerprint = copy.payload ? payloadFingerprint(copy.payload) : copy.syncFingerprint;
    if (copy.payload) {
      copy.payload.id = copy.id;
      copy.payload.title = copy.title;
      copy.payload.createdAt = now;
      copy.payload.savedAt = now;
    }
    return copy;
  }

  function mergeProjectRecords(current, incoming, conflictCopies) {
    if (!current) return incoming;
    const currentWithPayload = current.payload ? current : Object.assign({}, current, { payload: incoming.payload || current.payload });
    const incomingWithPayload = incoming.payload ? incoming : Object.assign({}, incoming, { payload: current.payload || incoming.payload });
    if (hasMeaningfulPayloadConflict(currentWithPayload, incomingWithPayload)) {
      const currentTime = projectSortTime(currentWithPayload);
      const incomingTime = projectSortTime(incomingWithPayload);
      const winner = incomingTime >= currentTime ? incomingWithPayload : currentWithPayload;
      const loser = incomingTime >= currentTime ? currentWithPayload : incomingWithPayload;
      conflictCopies.push(makeConflictCopy(loser));
      return winner;
    }
    const newer = projectSortTime(incoming) >= projectSortTime(current) ? incoming : current;
    const older = newer === incoming ? current : incoming;
    return Object.assign({}, newer, {
      payload: newer.payload || older.payload || null,
      history: normalizeProjectHistory([...(newer.history || []), ...(older.history || [])]),
      syncFingerprint: newer.syncFingerprint || older.syncFingerprint || (newer.payload ? payloadFingerprint(newer.payload) : "")
    });
  }

  function getProjects() {
    if (state.projectCacheReady) return state.projectCache.map(normalizeProject);
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const projects = Array.isArray(parsed) ? parsed.map(normalizeProject) : [];
      state.projectCache = projects;
      state.projectCacheReady = true;
      if (projects.some((project) => project.payload)) storeProjectsLocally(projects);
      return projects;
    } catch {
      state.projectCacheReady = true;
      return state.projectCache.map(normalizeProject);
    }
  }

  function storeProjectsLocally(projects) {
    const normalized = projects.map(normalizeProject).slice(0, 120);
    normalized.forEach((project) => {
      if (project.payload) state.projectPayloadCache.set(project.id, project.payload);
    });
    state.projectCache = normalized;
    state.projectCacheReady = true;
    try {
      if (state.forceProjectStorageFailureForTest) throw new Error("forced project storage failure");
      normalized.forEach((project) => {
        if (project.payload) {
          localStorage.setItem(`${projectPayloadStoragePrefix}${project.id}`, JSON.stringify(project.payload));
        }
      });
      const activeIds = new Set(normalized.map((project) => project.id));
      for (let index = localStorage.length - 1; index >= 0; index -= 1) {
        const key = localStorage.key(index);
        if (key && key.startsWith(projectPayloadStoragePrefix) && !activeIds.has(key.slice(projectPayloadStoragePrefix.length))) {
          localStorage.removeItem(key);
        }
      }
      localStorage.setItem(storageKey, JSON.stringify(normalized.map((project) => {
        const index = Object.assign({}, project);
        delete index.payload;
        return index;
      })));
      return { ok: true, localStorage: true, count: normalized.length };
    } catch (error) {
      console.warn("Q像素本机缓存写入失败，已改用当前页面缓存。", error);
      return { ok: true, memoryOnly: true, count: normalized.length };
    }
  }

  function getTrashProjects() {
    try {
      const parsed = JSON.parse(localStorage.getItem(trashStorageKey) || "[]");
      return Array.isArray(parsed) ? parsed.map((item) => Object.assign(normalizeProject(item), { deletedAt: item.deletedAt || new Date().toISOString() })) : [];
    } catch {
      return [];
    }
  }

  function setTrashProjects(projects) {
    const now = Date.now();
    const keep = projects
      .map((item) => Object.assign(normalizeProject(item), { deletedAt: item.deletedAt || new Date().toISOString() }))
      .filter((item) => now - (new Date(item.deletedAt).getTime() || now) <= 30 * 24 * 60 * 60 * 1000)
      .slice(0, 120);
    localStorage.setItem(trashStorageKey, JSON.stringify(keep));
  }

  function setProjects(projects, options = {}) {
    const normalized = projects.map(normalizeProject).slice(0, 120);
    const localResult = storeProjectsLocally(normalized);
    if (options.remote === false) return Promise.resolve({ ok: true, localOnly: true, count: normalized.length });
    return saveProjectsToRemote(normalized).then((result) => result || Object.assign({ ok: false }, localResult));
  }

  function isInternalTestProject(project) {
    const payload = project && project.payload;
    return project && project.title === "测试源文件" && payload && payload.sourceLabel === "测试图";
  }

  function normalizeProject(project) {
    project = project && typeof project === "object" ? project : {};
    const payload = project && project.payload ? project.payload : null;
    const now = new Date().toISOString();
    const createdAt = project.createdAt || (payload && payload.createdAt) || project.savedAt || now;
    const savedAt = project.savedAt || (payload && payload.savedAt) || now;
    const id = project.id || (payload && payload.id) || makeId();
    if (payload) state.projectPayloadCache.set(id, payload);
    return Object.assign({}, project, {
      id,
      title: project.title || (payload && payload.title) || "未命名",
      createdAt,
      savedAt,
      updatedAt: project.updatedAt || savedAt,
      width: project.width || (payload && payload.pattern && payload.pattern.width) || 0,
      height: project.height || (payload && payload.pattern && payload.pattern.height) || 0,
      thumbnail: project.thumbnail || "",
      editSeconds: Math.max(0, Number(project.editSeconds || 0)),
      openCount: Math.max(0, Number(project.openCount || 0)),
      designDates: project.designDates && typeof project.designDates === "object" ? project.designDates : {},
      syncFingerprint: project.syncFingerprint || (payload ? payloadFingerprint(payload) : ""),
      history: normalizeProjectHistory(project.history),
      payload
    });
  }

  function projectSortTime(project) {
    return new Date(project.updatedAt || project.savedAt || project.createdAt || 0).getTime() || 0;
  }

  function mergeProjects(localProjects, remoteProjects) {
    const map = new Map();
    const conflictCopies = [];
    [...remoteProjects, ...localProjects].map(normalizeProject).filter((project) => !isInternalTestProject(project)).forEach((project) => {
      const existing = map.get(project.id);
      map.set(project.id, mergeProjectRecords(existing, project, conflictCopies));
    });
    return Array.from(map.values()).concat(conflictCopies).sort((a, b) => projectSortTime(b) - projectSortTime(a)).slice(0, 120);
  }

  function normalizedProjectsForSyncCompare(projects) {
    return (projects || [])
      .map(normalizeProject)
      .filter((project) => project && !isInternalTestProject(project))
      .sort((a, b) => String(a.id || "").localeCompare(String(b.id || "")));
  }

  function projectsDifferForSync(left, right) {
    return JSON.stringify(normalizedProjectsForSyncCompare(left)) !== JSON.stringify(normalizedProjectsForSyncCompare(right));
  }

  async function fetchRemoteProjects() {
    try {
      const response = await fetch(`${syncApiBase}/api/projects/index`, { cache: "no-store" });
      if (!response.ok) throw new Error(`sync-index ${response.status}`);
      const projects = await response.json();
      return Array.isArray(projects) ? projects.map(normalizeProject).filter((project) => !isInternalTestProject(project)) : [];
    } catch {
      const response = await fetch(`${syncApiBase}/api/projects`, { cache: "no-store" });
      if (!response.ok) throw new Error(`sync ${response.status}`);
      const projects = await response.json();
      return Array.isArray(projects) ? projects.map(normalizeProject).filter((project) => !isInternalTestProject(project)) : [];
    }
  }

  async function fetchRemoteProjectPayload(id) {
    if (!id || !window.fetch) return null;
    if (state.projectPayloadCache.has(id)) return state.projectPayloadCache.get(id);
    const local = getProjects().find((item) => item.id === id);
    if (local && local.payload) {
      state.projectPayloadCache.set(id, local.payload);
      return local.payload;
    }
    try {
      const cached = JSON.parse(localStorage.getItem(`${projectPayloadStoragePrefix}${id}`) || "null");
      if (cached && typeof cached === "object") {
        state.projectPayloadCache.set(id, cached);
        return cached;
      }
    } catch (_) {
      // Ignore one damaged payload and try the remote copy.
    }
    const response = await fetch(`${syncApiBase}/api/projects/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`project ${response.status}`);
    const project = normalizeProject(await response.json());
    if (project.payload) {
      state.projectPayloadCache.set(id, project.payload);
      const projects = getProjects().map((item) => item.id === id ? Object.assign({}, item, project) : item);
      storeProjectsLocally(projects);
      return project.payload;
    }
    return null;
  }

  function normalizeSyncHealth(health) {
    health = health && typeof health === "object" ? health : {};
    return {
      ok: health.ok !== false,
      projectsOk: health.projectsOk !== false,
      settingsOk: health.settingsOk !== false,
      projectCount: Math.max(0, Number(health.projectCount || 0)),
      projectsFileExists: Boolean(health.projectsFileExists),
      projectsFileSize: Math.max(0, Number(health.projectsFileSize || 0)),
      backupCount: Math.max(0, Number(health.backupCount || 0)),
      updatedAt: health.updatedAt || new Date().toISOString()
    };
  }

  function formatSyncHealthMessage(health) {
    const status = normalizeSyncHealth(health);
    if (!status.ok || !status.projectsOk) return "同步服务可访问，但作品文件读取异常。";
    return `同步服务正常，当前有 ${status.projectCount} 个作品，备份 ${status.backupCount} 份。`;
  }

  async function fetchSyncHealth() {
    if (!window.fetch) return null;
    const response = await fetch(`${syncApiBase}/api/health`, { cache: "no-store" });
    if (!response.ok) throw new Error(`health ${response.status}`);
    const health = normalizeSyncHealth(await response.json());
    state.lastSyncHealth = health;
    return health;
  }

  function saveProjectToRemote(project) {
    if (!window.fetch || !project || !project.id) return Promise.resolve(null);
    return fetch(`${syncApiBase}/api/projects/${encodeURIComponent(project.id)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizeProject(project))
    }).then((response) => {
      if (!response.ok) throw new Error(`project-save ${response.status}`);
      return response.json().catch(() => ({ ok: true }));
    }).catch(() => {
      setMessage("电脑同步服务暂时不可用，已先保存到当前设备。", true);
      return null;
    });
  }

  function saveProjectsToRemote(projects) {
    if (!window.fetch) return Promise.resolve(null);
    return fetch(`${syncApiBase}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projects.map(normalizeProject).filter((project) => !isInternalTestProject(project)).slice(0, 120))
    }).then((response) => {
      if (!response.ok) throw new Error(`sync ${response.status}`);
      return response.json().catch(() => ({ ok: true }));
    }).catch(() => {
      setMessage("电脑同步服务暂时不可用，已先保存到当前设备。", true);
      return null;
    });
  }

  async function syncProjectsFromRemote(options = {}) {
    if (!window.fetch) return;
    const manual = Boolean(options.manual);
    const localProjects = getProjects();
    if (manual) setMessage("正在同步电脑创作空间...", false);
    try {
      const health = manual ? await fetchSyncHealth().catch(() => null) : null;
      const remoteProjects = await fetchRemoteProjects();
      const merged = mergeProjects(localProjects, remoteProjects);
      const localResult = storeProjectsLocally(merged);
      if (merged.length && projectsDifferForSync(merged, remoteProjects) && merged.every((project) => project.payload)) saveProjectsToRemote(merged);
      renderHomeProjects();
      renderProjectList();
      const healthText = health ? `${formatSyncHealthMessage(health)} ` : "";
      setMessage(localResult.memoryOnly
        ? `${healthText}创作空间已同步：当前链接可见 ${merged.length} 个文件。本机缓存空间不足，已使用当前页面缓存。`
        : `${healthText}创作空间已同步：当前链接可见 ${merged.length} 个文件。`, false);
      return merged;
    } catch {
      renderHomeProjects();
      if (manual) setMessage("电脑同步服务暂时不可用，已保留当前设备里的文件。", true);
      return localProjects;
    }
  }

  function dateKey(date) {
    const d = date ? new Date(date) : new Date();
    if (Number.isNaN(d.getTime())) return dateKey(new Date());
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function consumeSessionSeconds() {
    const now = Date.now();
    const seconds = Math.max(0, Math.round((now - (state.activeSessionStart || now)) / 1000));
    state.activeSessionStart = now;
    return seconds;
  }

  function showHome() {
    const shell = document.querySelector(".app-shell");
    if (shell) shell.classList.add("is-home");
    renderHomeProjects();
    setMessage("", false);
  }

  function updateDirtyStatus() {
    const dirty = Boolean(state.hasUnsavedChanges);
    if (els.saveStatus) {
      els.saveStatus.textContent = dirty ? "未保存" : "已保存";
      els.saveStatus.classList.toggle("dirty", dirty);
    }
    if (els.saveTopButton) els.saveTopButton.title = dirty ? "保存未保存修改" : "当前没有未保存修改";
  }

  function markUnsavedChanges() {
    state.hasUnsavedChanges = true;
    updateDirtyStatus();
  }

  function markSaved() {
    state.hasUnsavedChanges = false;
    updateDirtyStatus();
  }

  function confirmLeaveWithUnsavedChanges() {
    if (!state.hasUnsavedChanges) return true;
    const shouldSave = window.confirm("当前设计有未保存修改。点击“确定”先保存，点击“取消”继续选择。");
    if (shouldSave) {
      saveCurrentProject();
      return !state.hasUnsavedChanges;
    }
    return window.confirm("确定放弃未保存修改并继续吗？");
  }

  function showHomeWithGuard() {
    if (confirmLeaveWithUnsavedChanges()) showHome();
  }

  function showEditor() {
    const shell = document.querySelector(".app-shell");
    if (shell) shell.classList.remove("is-home");
    requestAnimationFrame(() => {
      resetView();
      render();
    });
  }

  function makeUntitledName() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    return `未命名-${month}${day}-${hour}${minute}`;
  }

  function createNewDesign() {
    if (state.image && state.image.src && state.image.src.startsWith("blob:")) {
      URL.revokeObjectURL(state.image.src);
    }
    state.image = null;
    state.imageName = "";
    state.lastRender = null;
    state.beads.pattern = createBlankPattern(state.beads.width, state.beads.height, "空白画布");
    state.beads.layers = [];
    state.beads.activeLayerId = "";
    state.beads.projectId = null;
    state.beads.projectTitle = makeUntitledName();
    state.beads.projectCreatedAt = new Date().toISOString();
    state.beads.sourceLabel = "空白画布";
    state.beads.selectedCells = [];
    state.beads.clipboard = null;
    state.beads.inspectedCell = null;
    state.beads.sourceCompareEnabled = false;
    state.beads.sourceCompareOpacity = 38;
    state.beads.lockedColorCodes = [];
    state.beads.lockedColorRoles = {};
    ensureLayers();
    syncCompositePattern();
    clearHistory();
    markUnsavedChanges();
    state.activeSessionStart = Date.now();
    if (els.imageStatus) els.imageStatus.textContent = state.beads.projectTitle;
    if (els.projectTitleInput) els.projectTitleInput.value = state.beads.projectTitle;
    syncBeadControls();
    setMode("beads");
    showEditor();
    setMessage("已新建空白画布，可直接绘制并保存。", false);
  }

  function renderHomeProjects() {
    if (!els.homeProjectGrid) return;
    const projects = getProjects().filter((project) => !isInternalTestProject(project)).sort((a, b) => projectSortTime(b) - projectSortTime(a));
    els.homeProjectGrid.innerHTML = "";

    const addTile = document.createElement("button");
    addTile.className = "home-add-tile";
    addTile.type = "button";
    addTile.innerHTML = "<span>+</span><strong>新建设计文件</strong>";
    addTile.addEventListener("click", () => {
      if (confirmLeaveWithUnsavedChanges()) createNewDesign();
    });
    els.homeProjectGrid.appendChild(addTile);

    projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "home-project-tile";
      card.tabIndex = 0;
      card.role = "button";
      card.innerHTML = `
        <img class="home-project-thumb" alt="">
        <div class="home-project-info">
          <p class="home-project-title"></p>
          <p class="home-project-meta"></p>
        </div>
      `;
      card.querySelector(".home-project-thumb").src = project.thumbnail || "";
      card.querySelector(".home-project-title").textContent = project.title || "未命名";
      card.querySelector(".home-project-meta").innerHTML = "";
      card.querySelector(".home-project-meta").append(
        document.createTextNode(`${project.width || "-"} x ${project.height || "-"} · ${formatShortDate(project.updatedAt || project.savedAt)}`)
      );
      const badges = makeProjectBadges(project);
      if (badges) card.querySelector(".home-project-meta").appendChild(badges);
      card.addEventListener("click", () => loadProject(project.id));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          loadProject(project.id);
        }
      });
      let longPressTimer = 0;
      card.addEventListener("pointerdown", () => {
        longPressTimer = window.setTimeout(() => openProjectActionModal(project.id), 650);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach((name) => {
        card.addEventListener(name, () => window.clearTimeout(longPressTimer));
      });
      card.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        openProjectActionModal(project.id);
      });
      els.homeProjectGrid.appendChild(card);
    });

    renderHomeProfile(projects);
  }

  function getProjectBeadCount(project) {
    const cells = project && project.payload && project.payload.pattern && project.payload.pattern.cells;
    if (!Array.isArray(cells)) return 0;
    return cells.reduce((rowSum, row) => rowSum + row.filter(Boolean).length, 0);
  }

  function formatHours(seconds) {
    const hours = seconds / 3600;
    if (hours <= 0) return "0";
    return hours < 10 ? String(Math.round(hours * 10) / 10) : String(Math.round(hours));
  }

  function renderHomeProfile(projects) {
    const now = new Date();
    const viewDate = new Date(now.getFullYear(), now.getMonth() + (state.homeRecordMonthOffset || 0), 1);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    if (els.homeRecordYear) els.homeRecordYear.textContent = `${year} 年`;
    if (els.homeRecordMonth) els.homeRecordMonth.textContent = `${month + 1} 月`;
    if (els.homeRecordNextButton) els.homeRecordNextButton.disabled = (state.homeRecordMonthOffset || 0) >= 0;

    const daySeconds = new Map();
    projects.forEach((project) => {
      const dates = project.designDates || {};
      Object.keys(dates).forEach((key) => {
        if (!key.startsWith(monthPrefix)) return;
        daySeconds.set(key, (daySeconds.get(key) || 0) + Math.max(1, Number(dates[key] || 0)));
      });
      const fallbackKey = dateKey(project.updatedAt || project.savedAt || project.createdAt);
      if (fallbackKey.startsWith(monthPrefix) && !daySeconds.has(fallbackKey)) daySeconds.set(fallbackKey, Math.max(1, project.editSeconds || 60));
    });

    if (els.homeRecordCalendar) {
      els.homeRecordCalendar.innerHTML = "";
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day += 1) {
        const key = `${monthPrefix}-${String(day).padStart(2, "0")}`;
        const seconds = daySeconds.get(key) || 0;
        const item = document.createElement("span");
        item.className = `record-day${seconds ? " active" : ""}${seconds >= 7200 ? " hot" : ""}`;
        item.title = seconds ? `${day} 日 · ${formatHours(seconds)} 小时` : `${day} 日`;
        els.homeRecordCalendar.appendChild(item);
      }
    }

    const totalSeconds = Array.from(daySeconds.values()).reduce((sum, seconds) => sum + seconds, 0);
    const monthProjects = projects.filter((project) => dateKey(project.updatedAt || project.savedAt || project.createdAt).startsWith(monthPrefix));
    const totalBeads = monthProjects.reduce((sum, project) => sum + getProjectBeadCount(project), 0);
    const designDays = daySeconds.size;
    if (els.homeProjectCount) els.homeProjectCount.textContent = String(monthProjects.length);
    if (els.homeBeadCount) els.homeBeadCount.textContent = totalBeads > 9999 ? `${Math.round(totalBeads / 1000)}k` : String(totalBeads);
    if (els.homeDesignDays) els.homeDesignDays.textContent = String(designDays);
    if (els.homeAvgDayTime) els.homeAvgDayTime.textContent = formatHours(designDays ? totalSeconds / designDays : 0);
    if (els.homeAvgWorkTime) els.homeAvgWorkTime.textContent = formatHours(projects.length ? totalSeconds / projects.length : 0);

    if (els.homeRecordList) {
      els.homeRecordList.innerHTML = "";
      projects.slice(0, 5).forEach((project) => {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "record-item";
        row.innerHTML = `
          <img alt="">
          <span><strong></strong><span></span></span>
          <em></em>
        `;
        row.querySelector("img").src = project.thumbnail || "";
        row.querySelector("strong").textContent = project.title || "未命名";
        row.querySelector("span span").textContent = `${formatShortDate(project.updatedAt || project.savedAt)} · ${project.width || "-"} x ${project.height || "-"}`;
        row.querySelector("em").textContent = `${formatHours(project.editSeconds || 0)}h`;
        row.addEventListener("click", () => loadProject(project.id));
        els.homeRecordList.appendChild(row);
      });
    }
  }

  function openProjectActionModal(id) {
    const project = getProjects().find((item) => item.id === id);
    if (!project || !els.projectActionModal) return;
    state.activeActionProjectId = id;
    if (els.projectActionThumb) els.projectActionThumb.src = project.thumbnail || "";
    if (els.projectActionTitle) els.projectActionTitle.textContent = project.title || "未命名";
    if (els.projectActionCreated) els.projectActionCreated.textContent = formatDateTime(project.createdAt || project.savedAt);
    if (els.projectActionUpdated) els.projectActionUpdated.textContent = formatDateTime(project.updatedAt || project.savedAt);
    if (els.projectActionHistoryButton) {
      els.projectActionHistoryButton.disabled = !normalizeProjectHistory(project.history).length;
      els.projectActionHistoryButton.title = els.projectActionHistoryButton.disabled ? "这个设计还没有历史版本" : "查看历史版本";
    }
    els.projectActionModal.classList.remove("hidden");
  }

  function closeProjectActionModal() {
    state.activeActionProjectId = "";
    if (els.projectActionModal) els.projectActionModal.classList.add("hidden");
  }

  function renderProjectHistoryList(project) {
    if (!els.projectHistoryList) return;
    const history = normalizeProjectHistory(project && project.history);
    els.projectHistoryList.innerHTML = "";
    if (!history.length) {
      const empty = document.createElement("div");
      empty.className = "project-history-empty";
      empty.textContent = "暂无历史版本。继续保存后，这里会自动保留可回退的版本。";
      els.projectHistoryList.appendChild(empty);
      return;
    }
    history.forEach((version, index) => {
      const row = document.createElement("article");
      row.className = "project-history-item";
      const pattern = version.payload && version.payload.pattern;
      const size = pattern && pattern.width && pattern.height ? `${pattern.width} x ${pattern.height}` : "尺寸未知";
      row.innerHTML = `
        <div class="project-history-info">
          <strong></strong>
          <span></span>
          <em></em>
        </div>
        <div class="project-history-actions">
          <button class="mini-button" type="button" data-action="preview">预览打开</button>
          <button class="mini-button primary" type="button" data-action="restore">恢复</button>
        </div>
      `;
      row.querySelector("strong").textContent = version.title || "未命名";
      row.querySelector("span").textContent = formatDateTime(version.savedAt);
      row.querySelector("em").textContent = `${size}${index === 0 ? " · 最近版本" : ""}`;
      row.querySelector('[data-action="preview"]').addEventListener("click", () => previewProjectHistoryVersion(state.activeHistoryProjectId, version.id));
      row.querySelector('[data-action="restore"]').addEventListener("click", () => restoreProjectHistoryVersionFromUi(state.activeHistoryProjectId, version.id));
      els.projectHistoryList.appendChild(row);
    });
  }

  function openProjectHistoryModal(id) {
    const project = getProjects().find((item) => item.id === id);
    if (!project || !els.projectHistoryModal) return;
    state.activeHistoryProjectId = id;
    if (els.projectHistoryTitle) els.projectHistoryTitle.textContent = `${project.title || "未命名"} · 历史版本`;
    renderProjectHistoryList(project);
    els.projectHistoryModal.classList.remove("hidden");
  }

  function closeProjectHistoryModal() {
    state.activeHistoryProjectId = "";
    if (els.projectHistoryModal) els.projectHistoryModal.classList.add("hidden");
  }

  function previewProjectHistoryVersion(projectId, versionId) {
    if (!confirmLeaveWithUnsavedChanges()) return;
    const project = getProjects().find((item) => item.id === projectId);
    const version = project && normalizeProjectHistory(project.history).find((item) => item.id === versionId);
    if (!project || !version || !version.payload) {
      setMessage("历史版本内容不存在，当前设计没有变化。", true);
      return;
    }
    const payload = JSON.parse(JSON.stringify(version.payload));
    payload.title = `${project.title || "未命名"} 历史预览`;
    delete payload.id;
    if (!applyProjectPayload(payload, false)) return;
    markUnsavedChanges();
    closeProjectHistoryModal();
    closeProjectActionModal();
    showEditor();
    setMessage("已打开历史版本预览，原设计未被覆盖。", false);
  }

  async function restoreProjectHistoryVersionFromUi(projectId, versionId) {
    const project = getProjects().find((item) => item.id === projectId);
    if (!project) {
      setMessage("没有找到这个设计文件，当前设计没有变化。", true);
      return;
    }
    let currentPayload = project.payload;
    if (!currentPayload) {
      setMessage("正在读取当前版本，然后恢复历史版本...", false);
      try {
        currentPayload = await fetchRemoteProjectPayload(projectId);
      } catch {
        currentPayload = null;
      }
    }
    const restored = currentPayload
      ? restoreProjectHistoryVersionForTest(Object.assign({}, project, { payload: currentPayload }), versionId)
      : null;
    if (!project || !restored) {
      setMessage("历史版本内容不存在，当前设计没有变化。", true);
      return;
    }
    const projects = [restored, ...getProjects().filter((item) => item.id !== projectId)];
    setProjects(projects, { remote: false });
    applyProjectPayload(restored.payload);
    markSaved();
    closeProjectHistoryModal();
    closeProjectActionModal();
    renderProjectList();
    renderHomeProjects();
    saveProjectToRemote(restored).then((result) => {
      setMessage(result && result.ok ? "已恢复历史版本并同步到电脑创作空间。" : "已恢复到当前设备，电脑同步服务暂时不可用。", !(result && result.ok));
    });
  }

  async function duplicateProject(id) {
    const source = getProjects().find((item) => item.id === id);
    if (!source) return;
    let payload = source.payload;
    try {
      payload = payload || await fetchRemoteProjectPayload(id);
    } catch {
      payload = null;
    }
    if (!payload) {
      setMessage("这个设计文件还没有完整内容，无法复制。", true);
      return;
    }
    const now = new Date().toISOString();
    const copy = normalizeProject(JSON.parse(JSON.stringify(source)));
    copy.payload = JSON.parse(JSON.stringify(payload));
    copy.id = makeId();
    copy.title = `${source.title || "未命名"} 副本`;
    copy.createdAt = now;
    copy.savedAt = now;
    copy.updatedAt = now;
    copy.openCount = 0;
    if (copy.payload) {
      copy.payload.id = copy.id;
      copy.payload.title = copy.title;
      copy.payload.createdAt = now;
      copy.payload.savedAt = now;
    }
    setProjects([copy, ...getProjects()]);
    closeProjectActionModal();
    renderProjectList();
    renderHomeProjects();
    setMessage("已创建副本。", false);
  }

  async function useProjectAsTemplate(id) {
    const source = getProjects().find((item) => item.id === id);
    if (!source) return;
    let payload = source.payload;
    if (!payload) {
      try { payload = await fetchRemoteProjectPayload(id); } catch { payload = null; }
    }
    if (!payload) {
      setMessage("这个设计文件还没有完整内容，无法套用模板。", true);
      return;
    }
    const template = JSON.parse(JSON.stringify(payload));
    delete template.id;
    template.title = `${source.title || "未命名"} 模板`;
    template.createdAt = new Date().toISOString();
    template.savedAt = template.createdAt;
    if (!applyProjectPayload(template, false)) return;
    markUnsavedChanges();
    closeProjectActionModal();
    showEditor();
    setMessage("已套用为新设计，原项目不会被修改。", false);
  }

  function renameProject(id) {
    const projects = getProjects();
    const project = projects.find((item) => item.id === id);
    if (!project) return;
    const nextName = window.prompt("输入新的设计文件名", project.title || "未命名");
    if (!nextName || !nextName.trim()) return;
    const title = nextName.trim();
    const updated = projects.map((item) => {
      if (item.id !== id) return item;
      const payload = item.payload ? Object.assign({}, item.payload, { title }) : item.payload;
      return Object.assign({}, item, { title, updatedAt: new Date().toISOString(), payload });
    });
    setProjects(updated);
    if (state.beads.projectId === id) {
      state.beads.projectTitle = title;
      if (els.imageStatus) els.imageStatus.textContent = title;
      if (els.projectTitleInput) els.projectTitleInput.value = title;
    }
    closeProjectActionModal();
    renderProjectList();
    renderHomeProjects();
    setMessage("已重命名。", false);
  }

  function renderTrashList() {
    if (!els.trashList) return;
    const trash = getTrashProjects().sort((a, b) => projectSortTime(b) - projectSortTime(a));
    setTrashProjects(trash);
    els.trashList.innerHTML = "";
    if (!trash.length) {
      const empty = document.createElement("div");
      empty.className = "panel-caption";
      empty.textContent = "回收站是空的。";
      els.trashList.appendChild(empty);
      return;
    }
    trash.forEach((project) => {
      const row = document.createElement("div");
      row.className = "trash-item";
      row.innerHTML = `
        <img alt="">
        <span><strong></strong><em></em></span>
        <button class="mini-button" type="button" data-action="restore">恢复</button>
        <button class="mini-button danger" type="button" data-action="delete">永久删除</button>
      `;
      row.querySelector("img").src = project.thumbnail || "";
      row.querySelector("strong").textContent = project.title || "未命名";
      row.querySelector("em").textContent = `删除于 ${formatShortDate(project.deletedAt)}`;
      row.querySelector('[data-action="restore"]').addEventListener("click", () => restoreTrashProject(project.id));
      row.querySelector('[data-action="delete"]').addEventListener("click", () => permanentlyDeleteTrashProject(project.id));
      els.trashList.appendChild(row);
    });
  }

  function openTrashModal() {
    renderTrashList();
    if (els.trashModal) els.trashModal.classList.remove("hidden");
  }

  function closeTrashModal() {
    if (els.trashModal) els.trashModal.classList.add("hidden");
  }

  function restoreTrashProject(id) {
    const trash = getTrashProjects();
    const project = trash.find((item) => item.id === id);
    if (!project) return;
    const restored = Object.assign({}, project);
    delete restored.deletedAt;
    setProjects([restored, ...getProjects().filter((item) => item.id !== id)]);
    setTrashProjects(trash.filter((item) => item.id !== id));
    renderTrashList();
    renderHomeProjects();
    renderProjectList();
    setMessage("已从回收站恢复。", false);
  }

  function permanentlyDeleteTrashProject(id) {
    setTrashProjects(getTrashProjects().filter((item) => item.id !== id));
    renderTrashList();
    setMessage("已永久删除。", false);
  }

  function makeFloatingPanelDraggable(panel, handle, options) {
    if (!panel || !handle || !els.dropZone) return;
    let drag = null;
    const clampPosition = (left, top) => {
      const zone = els.dropZone.getBoundingClientRect();
      const rect = panel.getBoundingClientRect();
      return {
        left: Math.max(8, Math.min(left, zone.width - rect.width - 8)),
        top: Math.max(8, Math.min(top, zone.height - rect.height - 8))
      };
    };
    const applyPosition = (left, top, persist) => {
      const next = clampPosition(left, top);
      panel.style.left = `${next.left}px`;
      panel.style.top = `${next.top}px`;
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      panel.style.transform = "none";
      if (persist && options && options.persistKey) {
        localStorage.setItem(options.persistKey, JSON.stringify(next));
      }
      return next;
    };
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      const zone = els.dropZone.getBoundingClientRect();
      const rect = panel.getBoundingClientRect();
      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: rect.left - zone.left,
        top: rect.top - zone.top
      };
      handle.setPointerCapture(event.pointerId);
    });
    handle.addEventListener("pointermove", (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      applyPosition(
        drag.left + event.clientX - drag.startX,
        drag.top + event.clientY - drag.startY,
        true
      );
    });
    ["pointerup", "pointercancel"].forEach((name) => {
      handle.addEventListener(name, (event) => {
        if (!drag || event.pointerId !== drag.pointerId) return;
        drag = null;
        try { handle.releasePointerCapture(event.pointerId); } catch {}
      });
    });
    if (options && options.persistKey) {
      try {
        const saved = JSON.parse(localStorage.getItem(options.persistKey) || "null");
        if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
          requestAnimationFrame(() => applyPosition(saved.left, saved.top, true));
        }
      } catch {}
    }
    window.addEventListener("resize", () => {
      const rect = panel.getBoundingClientRect();
      const zone = els.dropZone.getBoundingClientRect();
      if (!rect.width || !zone.width) return;
      applyPosition(rect.left - zone.left, rect.top - zone.top, Boolean(options && options.persistKey));
    });
  }

  function makeProjectThumbnail(pattern) {
    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (pattern) {
      const cell = Math.max(1, Math.min(canvas.width / pattern.width, canvas.height / pattern.height));
      const x = (canvas.width - pattern.width * cell) / 2;
      const y = (canvas.height - pattern.height * cell) / 2;
      drawPatternGrid(ctx, pattern, x, y, cell, { showCodes: false, showGrid: false, showCenterLines: false });
    }
    return canvas.toDataURL("image/png");
  }

  function saveCurrentProject() {
    ensureBlankPatternForSave();
    const payload = makeProjectPayload();
    if (!payload) {
      setMessage("保存失败，请先创建画布。", true);
      return;
    }
    const existing = getProjects().find((item) => item.id === payload.id);
    const sessionSeconds = consumeSessionSeconds();
    const today = dateKey(payload.savedAt);
    const designDates = Object.assign({}, existing && existing.designDates);
    designDates[today] = Math.max(0, Number(designDates[today] || 0)) + Math.max(1, sessionSeconds);
    state.beads.projectId = payload.id;
    const projects = getProjects().filter((item) => item.id !== payload.id);
    const nextProject = withProjectHistory({
      id: payload.id,
      title: payload.title,
      createdAt: (existing && existing.createdAt) || payload.createdAt || payload.savedAt,
      savedAt: payload.savedAt,
      updatedAt: payload.savedAt,
      width: payload.pattern.width,
      height: payload.pattern.height,
      thumbnail: makeProjectThumbnail(state.beads.pattern),
      editSeconds: Math.max(0, Number(existing && existing.editSeconds || 0)) + Math.max(1, sessionSeconds),
      openCount: Math.max(0, Number(existing && existing.openCount || 0)),
      designDates,
      payload
    }, existing);
    projects.unshift(nextProject);
    setProjects(projects, { remote: false });
    markSaved();
    saveProjectToRemote(projects[0]).then((result) => {
      setMessage(result && result.ok ? "已保存并同步到电脑创作空间。" : "已保存到当前设备，电脑同步服务暂时不可用。", !(result && result.ok));
    });
    renderProjectList();
    renderHomeProjects();
  }

  async function loadProject(id) {
    if (state.hasUnsavedChanges && state.beads.projectId !== id && !confirmLeaveWithUnsavedChanges()) return;
    const project = getProjects().find((item) => item.id === id);
    if (!project) {
      setMessage("没有找到这个本地作品。", true);
      return;
    }
    setMessage("正在打开设计文件...", false);
    let payload = project.payload;
    try {
      payload = payload || await fetchRemoteProjectPayload(id);
    } catch {
      payload = null;
    }
    if (!payload) {
      setMessage("这个设计文件还没有完整内容，请先同步或在保存它的设备上重新保存一次。", true);
      return;
    }
    applyProjectPayload(payload);
    markSaved();
    const projects = getProjects().map((item) => item.id === id ? Object.assign({}, item, { openCount: Math.max(0, Number(item.openCount || 0)) + 1 }) : item);
    setProjects(projects, { remote: false });
    closeProjectActionModal();
    showEditor();
  }

  function deleteProject(id) {
    const projects = getProjects();
    const project = projects.find((item) => item.id === id);
    if (project) {
      setTrashProjects([Object.assign({}, project, { deletedAt: new Date().toISOString() }), ...getTrashProjects().filter((item) => item.id !== id)]);
    }
    setProjects(projects.filter((item) => item.id !== id));
    if (state.beads.projectId === id) state.beads.projectId = null;
    setMessage("已移入回收站，30 天内可恢复。", false);
    closeProjectActionModal();
    renderProjectList();
    renderHomeProjects();
  }

  function renderProjectList() {
    if (!els.projectList) return;
    const projects = getProjects().filter((project) => !isInternalTestProject(project)).sort((a, b) => projectSortTime(b) - projectSortTime(a));
    els.projectList.innerHTML = "";
    if (!projects.length) {
      const empty = document.createElement("div");
      empty.className = "panel-caption";
      empty.textContent = "暂无本地保存的图纸。";
      els.projectList.appendChild(empty);
      return;
    }
    projects.forEach((project) => {
      const card = document.createElement("div");
      card.className = "project-card";
      card.innerHTML = `
        <img class="project-thumb" alt="">
        <div>
          <p class="project-title"></p>
          <p class="project-meta"></p>
        </div>
        <div class="project-actions">
          <button class="mini-button" type="button" data-action="open">打开</button>
          <button class="mini-button" type="button" data-action="delete">删除</button>
        </div>
      `;
      card.querySelector(".project-thumb").src = project.thumbnail || "";
      card.querySelector(".project-title").textContent = project.title || "未命名";
      card.querySelector(".project-meta").innerHTML = "";
      card.querySelector(".project-meta").append(
        document.createTextNode(`${project.width || "-"} x ${project.height || "-"} · ${formatShortDate(project.updatedAt || project.savedAt)}`)
      );
      const badges = makeProjectBadges(project);
      if (badges) card.querySelector(".project-meta").appendChild(badges);
      card.querySelector('[data-action="open"]').addEventListener("click", () => loadProject(project.id));
      card.querySelector('[data-action="delete"]').addEventListener("click", () => deleteProject(project.id));
      els.projectList.appendChild(card);
    });
  }

  function openLayerImportModal() {
    if (!ensurePatternForCanvasEdit()) {
      setMessage("请先生成图纸或可编辑像素画，再导入图层。", true);
      return;
    }
    renderLayerImportProjectList();
    if (els.layerImportModal) els.layerImportModal.classList.remove("hidden");
    syncProjectsFromRemote().then(() => {
      if (els.layerImportModal && !els.layerImportModal.classList.contains("hidden")) renderLayerImportProjectList();
    });
  }

  function closeLayerImportModal() {
    if (els.layerImportModal) els.layerImportModal.classList.add("hidden");
  }

  function renderLayerImportProjectList() {
    if (!els.layerImportProjectList) return;
    const projects = getProjects()
      .filter((project) => !isInternalTestProject(project))
      .sort((a, b) => projectSortTime(b) - projectSortTime(a));
    els.layerImportProjectList.innerHTML = "";
    if (!projects.length) {
      const empty = document.createElement("div");
      empty.className = "panel-caption";
      empty.textContent = "画布空间里还没有可导入的设计。";
      els.layerImportProjectList.appendChild(empty);
      return;
    }
    projects.forEach((project) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "layer-import-project";
      button.innerHTML = `
        <img alt="">
        <span><strong></strong><em></em></span>
      `;
      button.querySelector("img").src = project.thumbnail || "";
      button.querySelector("strong").textContent = project.title || "未命名";
      button.querySelector("em").textContent = `${project.width || "-"} x ${project.height || "-"} · ${formatShortDate(project.updatedAt || project.savedAt)}`;
      button.addEventListener("click", async () => {
        let payload = project.payload;
        try {
          payload = payload || await fetchRemoteProjectPayload(project.id);
        } catch {
          payload = null;
        }
        if (!payload) {
          setMessage("这个设计文件还没有完整内容，无法导入为图层。", true);
          return;
        }
        if (importProjectPayloadAsLayer(payload, project.title || "画布空间设计")) closeLayerImportModal();
      });
      els.layerImportProjectList.appendChild(button);
    });
  }

  function formatShortDate(iso) {
    const date = iso ? new Date(iso) : new Date();
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function makeProjectBadges(project) {
    const badges = [];
    const historyCount = Array.isArray(project && project.history) ? project.history.length : 0;
    if (historyCount) badges.push(`历史 ${historyCount}`);
    if (project && project.conflictOf) badges.push("冲突副本");
    if (!badges.length) return null;
    const wrap = document.createElement("span");
    wrap.className = "project-badges";
    badges.forEach((label) => {
      const badge = document.createElement("span");
      badge.className = label === "冲突副本" ? "project-badge warning" : "project-badge";
      badge.textContent = label;
      wrap.appendChild(badge);
    });
    return wrap;
  }

  function formatDateTime(iso) {
    const date = iso ? new Date(iso) : new Date();
    if (Number.isNaN(date.getTime())) return "--";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function saveTextFile(text, fileName, mime, message) {
    const blob = new Blob([text], { type: mime || "application/json" });
    const dataUrlPromise = new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    dataUrlPromise.then((dataUrl) => {
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.exportFile) {
        state.pendingSaveMessage = message || "文件已保存。";
        window.webkit.messageHandlers.exportFile.postMessage({ fileName, dataUrl });
        setMessage("请选择保存位置。", false);
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 500);
      setMessage(message || "文件已导出。", false);
    }).catch(() => setMessage("导出源文件失败。", true));
  }

  function exportCurrentProjectFile() {
    const payload = makeProjectPayload();
    if (!payload) {
      setMessage("请先生成拼豆图纸。", true);
      return;
    }
    saveTextFile(
      JSON.stringify(payload),
      `${safeFileName(payload.title)}.qpx`,
      "application/json",
      "源文件已导出。"
    );
  }

  function safeFileName(name) {
    return (name || "Q像素源文件").replace(/[\\/:*?"<>|]/g, "-").slice(0, 60) || "Q像素源文件";
  }

  function importProjectFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (applyProjectPayload(JSON.parse(String(reader.result || "")), false)) showEditor();
      } catch {
        setMessage("无法读取这个 .qpx 源文件。", true);
      }
    };
    reader.onerror = () => setMessage("读取源文件失败。", true);
    reader.readAsText(file);
  }

  function exportCurrentMode() {
    openExportPreview();
  }

  function isEditableTarget(target) {
    return target instanceof Element && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
  }

  function clearBrowserSelection() {
    const selection = window.getSelection ? window.getSelection() : null;
    if (selection && !selection.isCollapsed) selection.removeAllRanges();
  }

  function installSelectionGuard() {
    document.addEventListener("selectstart", (event) => {
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
    });
    document.addEventListener("pointerdown", (event) => {
      if (isEditableTarget(event.target)) return;
      clearBrowserSelection();
    }, { capture: true });
    document.addEventListener("dragstart", (event) => {
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
    });
  }

  function wireEvents() {
    installSelectionGuard();
    els.homeNewDesignButton.addEventListener("click", () => {
      if (confirmLeaveWithUnsavedChanges()) createNewDesign();
    });
    els.homeNewTopButton.addEventListener("click", () => {
      if (confirmLeaveWithUnsavedChanges()) createNewDesign();
    });
    if (els.homeSyncButton) {
      els.homeSyncButton.addEventListener("click", () => {
        syncProjectsFromRemote({ manual: true });
        syncSharedSettingsFromRemote({ manual: true });
      });
    }
    if (els.homeRecordPrevButton) {
      els.homeRecordPrevButton.addEventListener("click", () => {
        state.homeRecordMonthOffset = (state.homeRecordMonthOffset || 0) - 1;
        renderHomeProjects();
      });
    }
    if (els.homeRecordNextButton) {
      els.homeRecordNextButton.addEventListener("click", () => {
        state.homeRecordMonthOffset = Math.min(0, (state.homeRecordMonthOffset || 0) + 1);
        renderHomeProjects();
      });
    }
    if (els.homeTrashButton) els.homeTrashButton.addEventListener("click", openTrashModal);
    els.homeImportImageButton.addEventListener("click", () => {
      createNewDesign();
      openFileDialog();
    });
    els.homeOpenProjectButton.addEventListener("click", () => els.projectFileInput.click());
    if (els.importChoiceCancelButton) els.importChoiceCancelButton.addEventListener("click", cancelImportSession);
    [
      ["importModeFidelityButton", "fidelity"],
      ["importModeBalancedButton", "balanced"],
      ["importModeSimpleButton", "simple"]
    ].forEach(([id, mode]) => {
      if (els[id]) els[id].addEventListener("click", () => setImportMode(mode));
    });
    if (els.importDirectButton) els.importDirectButton.addEventListener("click", wizardUseDirect);
    if (els.importCalibrateButton) els.importCalibrateButton.addEventListener("click", wizardOpenCalibration);
    if (els.importWizardCalibrationButton) els.importWizardCalibrationButton.addEventListener("click", openCalibrationModal);
    if (els.importWizardSkipCalibrationButton) els.importWizardSkipCalibrationButton.addEventListener("click", wizardSkipCalibration);
    if (els.importWizardOptimizeButton) els.importWizardOptimizeButton.addEventListener("click", wizardOptimizeColors);
    if (els.importWizardKeepColorsButton) els.importWizardKeepColorsButton.addEventListener("click", wizardKeepColors);
    if (els.importWizardApplyButton) els.importWizardApplyButton.addEventListener("click", applyWizardImport);
    if (els.importWizardRestartButton) els.importWizardRestartButton.addEventListener("click", () => {
      if (!importWizard) return;
      importWizard.step = 1;
      renderImportWizardStep();
    });
    if (els.calibrationBackButton) {
      els.calibrationBackButton.addEventListener("click", () => {
        closeCalibrationModal();
        if (importWizard) {
          importWizard.step = 2;
          if (els.importChoiceModal) els.importChoiceModal.classList.remove("hidden");
          renderImportWizardStep();
        } else if (recalibrationSession) {
          cancelImportSession();
        } else {
          openImportChoiceModal();
        }
      });
    }
    if (els.calibrationDoneButton) els.calibrationDoneButton.addEventListener("click", completeCalibrationImport);
    if (els.calibrationColumnsInput) els.calibrationColumnsInput.addEventListener("change", () => updateCalibrationColumns(els.calibrationColumnsInput.value));
    if (els.calibrationCellSizeInput) els.calibrationCellSizeInput.addEventListener("change", () => updateCalibrationCellSize(els.calibrationCellSizeInput.value));
    if (els.calibrationNudgeLeftButton) els.calibrationNudgeLeftButton.addEventListener("click", (event) => nudgeCalibration(-1, 0, event));
    if (els.calibrationNudgeRightButton) els.calibrationNudgeRightButton.addEventListener("click", (event) => nudgeCalibration(1, 0, event));
    if (els.calibrationNudgeUpButton) els.calibrationNudgeUpButton.addEventListener("click", (event) => nudgeCalibration(0, -1, event));
    if (els.calibrationNudgeDownButton) els.calibrationNudgeDownButton.addEventListener("click", (event) => nudgeCalibration(0, 1, event));
    els.projectActionCloseButton.addEventListener("click", closeProjectActionModal);
    els.projectActionModal.addEventListener("click", (event) => {
      if (event.target === els.projectActionModal) closeProjectActionModal();
    });
    els.projectActionOpenButton.addEventListener("click", () => loadProject(state.activeActionProjectId));
    if (els.projectActionHistoryButton) els.projectActionHistoryButton.addEventListener("click", () => openProjectHistoryModal(state.activeActionProjectId));
    if (els.projectActionTemplateButton) els.projectActionTemplateButton.addEventListener("click", () => useProjectAsTemplate(state.activeActionProjectId));
    if (els.projectActionRenameButton) els.projectActionRenameButton.addEventListener("click", () => renameProject(state.activeActionProjectId));
    els.projectActionDuplicateButton.addEventListener("click", () => duplicateProject(state.activeActionProjectId));
    els.projectActionDeleteButton.addEventListener("click", () => deleteProject(state.activeActionProjectId));
    if (els.projectHistoryCloseButton) els.projectHistoryCloseButton.addEventListener("click", closeProjectHistoryModal);
    if (els.projectHistoryModal) {
      els.projectHistoryModal.addEventListener("click", (event) => {
        if (event.target === els.projectHistoryModal) closeProjectHistoryModal();
      });
    }
    if (els.trashCloseButton) els.trashCloseButton.addEventListener("click", closeTrashModal);
    if (els.trashModal) {
      els.trashModal.addEventListener("click", (event) => {
        if (event.target === els.trashModal) closeTrashModal();
      });
    }
    els.backHomeButton.addEventListener("click", showHomeWithGuard);
    if (els.topbarCollapseButton) els.topbarCollapseButton.addEventListener("click", () => setTopbarCollapsed(true));
    if (els.topbarExpandButton) els.topbarExpandButton.addEventListener("click", () => setTopbarCollapsed(false));
    if (els.sidePanelCollapseButton) els.sidePanelCollapseButton.addEventListener("click", () => setSidePanelCollapsed(true));
    if (els.sidePanelExpandButton) els.sidePanelExpandButton.addEventListener("click", () => setSidePanelCollapsed(false));
    els.saveTopButton.addEventListener("click", saveCurrentProject);
    els.chooseTopButton.addEventListener("click", openFileDialog);
    els.chooseEmptyButton.addEventListener("click", openFileDialog);
    els.replaceButton.addEventListener("click", openFileDialog);
    els.exportButton.addEventListener("click", exportPixelPng);
    if (els.pixelExportPreviewButton) els.pixelExportPreviewButton.addEventListener("click", openExportPreview);
    els.exportTopButton.addEventListener("click", exportCurrentMode);
    els.exportChartButton.addEventListener("click", openExportPreview);
    els.exportPreviewOpenButton.addEventListener("click", openExportPreview);
    els.exportPreviewCloseButton.addEventListener("click", closeExportPreview);
    els.exportPreviewRefreshButton.addEventListener("click", () => {
      setMessage(drawExportPreview() ? "导出预览已刷新。" : "请先生成拼豆图纸。", !state.beads.pattern);
    });
    els.exportPreviewPngButton.addEventListener("click", exportBeadPng);
    els.exportPreviewMirrorButton.addEventListener("click", exportMirrorPng);
    els.exportPreviewAlbumButton.addEventListener("click", exportAlbumPng);
    els.exportPreviewPdfButton.addEventListener("click", exportPreviewPdf);
    if (els.materialPreviewButton) els.materialPreviewButton.addEventListener("click", openMaterialPreview);
    if (els.materialPreviewCloseButton) els.materialPreviewCloseButton.addEventListener("click", closeMaterialPreview);
    if (els.charmPreviewCloseButton) els.charmPreviewCloseButton.addEventListener("click", closeCharmPreview);
    if (els.materialModeSelect) els.materialModeSelect.addEventListener("change", drawMaterialPreview);
    if (els.materialBaseSelect) els.materialBaseSelect.addEventListener("change", drawMaterialPreview);
    if (els.materialIntensityRange) els.materialIntensityRange.addEventListener("input", drawMaterialPreview);
    if (els.materialBackgroundSelect) els.materialBackgroundSelect.addEventListener("change", drawMaterialPreview);
    if (els.materialLightSelect) els.materialLightSelect.addEventListener("change", drawMaterialPreview);
    if (els.materialDecorSelect) els.materialDecorSelect.addEventListener("change", drawMaterialPreview);
    if (els.exportPreviewZoomOutButton) els.exportPreviewZoomOutButton.addEventListener("click", () => updatePreviewZoom("export", "out"));
    if (els.exportPreviewZoomFitButton) els.exportPreviewZoomFitButton.addEventListener("click", () => updatePreviewZoom("export", "fit"));
    if (els.exportPreviewZoomInButton) els.exportPreviewZoomInButton.addEventListener("click", () => updatePreviewZoom("export", "in"));
    if (els.stylePreviewZoomOutButton) els.stylePreviewZoomOutButton.addEventListener("click", () => updatePreviewZoom("style", "out"));
    if (els.stylePreviewZoomFitButton) els.stylePreviewZoomFitButton.addEventListener("click", () => updatePreviewZoom("style", "fit"));
    if (els.stylePreviewZoomInButton) els.stylePreviewZoomInButton.addEventListener("click", () => updatePreviewZoom("style", "in"));
    [
      els.styleRatioSelect,
      els.styleOrientationSelect,
      els.styleCustomWidthInput,
      els.styleCustomHeightInput,
      els.styleBackgroundColorInput,
      els.styleBackgroundAlphaRange,
      els.styleBorderSizeRange,
      els.styleBorderColorInput,
      els.styleShadowColorInput,
      els.styleShadowBlurRange,
      els.styleShadowAlphaRange,
      els.styleShadowOffsetXRange,
      els.styleShadowOffsetYRange,
      els.styleThicknessRange
    ].forEach((input) => {
      if (!input) return;
      input.addEventListener(input.type === "range" || input.type === "color" ? "input" : "change", drawMaterialPreview);
    });
    if (els.styleBackgroundImageButton && els.styleBackgroundImageInput) {
      els.styleBackgroundImageButton.addEventListener("click", () => els.styleBackgroundImageInput.click());
    }
    if (els.styleBackgroundImageInput) {
      els.styleBackgroundImageInput.addEventListener("change", async () => {
        const file = els.styleBackgroundImageInput.files && els.styleBackgroundImageInput.files[0];
        if (!file) return;
        try {
          await setStyleBackgroundImage(await readFileAsDataUrl(file), file.name);
        } catch {
          setMessage("背景图片读取失败。", true);
        }
      });
    }
    if (els.styleStickerUploadButton && els.styleStickerInput) {
      els.styleStickerUploadButton.addEventListener("click", () => els.styleStickerInput.click());
    }
    if (els.styleStickerInput) {
      els.styleStickerInput.addEventListener("change", async () => {
        const files = Array.from(els.styleStickerInput.files || []);
        if (!files.length) return;
        const current = getStyleStickerLibrary();
        let added = 0;
        for (const file of files) {
          try {
            current.unshift(await makeStickerItemFromFile(file));
            added += 1;
          } catch {
            setMessage(`贴纸 ${file.name} 读取失败。`, true);
          }
        }
        setStyleStickerLibrary(current);
        els.styleStickerInput.value = "";
        if (added) setMessage(`已添加 ${added} 个贴纸素材。`, false);
      });
    }
    [els.styleStickerSizeRange, els.styleStickerOpacityRange].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", updateSelectedStickerFromControls);
    });
    if (els.styleStickerRemoveButton) els.styleStickerRemoveButton.addEventListener("click", removeSelectedSticker);
    [
      els.styleTextSizeRange,
      els.styleTextWeightRange,
      els.styleTextOpacityRange,
      els.styleTextStrokeWidthRange,
      els.styleTextShadowRange
    ].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", updateStyleTextLabels);
    });
    if (els.styleTextApplyButton) els.styleTextApplyButton.addEventListener("click", applyStyleTextOverlay);
    if (els.styleTextRemoveButton) {
      els.styleTextRemoveButton.addEventListener("click", () => {
        state.beads.styleTextOverlay = null;
        if (state.beads.styleSelectedOverlayId === "style-text-overlay") state.beads.styleSelectedOverlayId = "";
        drawMaterialPreview();
      });
    }
    if (els.stylePresetSaveButton) els.stylePresetSaveButton.addEventListener("click", saveCurrentStylePreset);
    if (els.exportPresetSaveButton) els.exportPresetSaveButton.addEventListener("click", saveCurrentExportPreset);
    if (els.materialPreviewCanvas) {
      els.materialPreviewCanvas.addEventListener("pointerdown", handleStylePreviewPointerDown);
      els.materialPreviewCanvas.addEventListener("pointermove", handleStylePreviewPointerMove);
      els.materialPreviewCanvas.addEventListener("pointerup", handleStylePreviewPointerUp);
      els.materialPreviewCanvas.addEventListener("pointercancel", handleStylePreviewPointerUp);
      els.materialPreviewCanvas.addEventListener("wheel", handleStylePreviewWheel, { passive: false });
    }
    if (els.materialExportButton) {
      els.materialExportButton.addEventListener("click", () => {
        drawMaterialPreview();
        saveCanvasAsPng(els.materialPreviewCanvas, `Q像素-样式预览-${formatStamp(new Date())}.png`, "请选择样式预览保存位置。", "样式预览已保存。");
      });
    }
    if (els.materialPreviewModal) {
      els.materialPreviewModal.addEventListener("click", (event) => {
        if (event.target === els.materialPreviewModal) closeMaterialPreview();
      });
    }
    [els.charmHolePositionSelect, els.charmHoleSizeRange, els.charmKeyringSelect, els.charmCordSelect, els.charmLinkSelect].forEach((input) => {
      if (!input) return;
      input.addEventListener(input.tagName === "INPUT" ? "input" : "change", drawCharmPreview);
    });
    if (els.charmExportButton) {
      els.charmExportButton.addEventListener("click", () => {
        drawCharmPreview();
        saveCanvasAsPng(els.charmPreviewCanvas, `Q像素-挂件预览-${formatStamp(new Date())}.png`, "请选择挂件预览保存位置。", "挂件预览已保存。");
      });
    }
    if (els.charmPreviewModal) {
      els.charmPreviewModal.addEventListener("click", (event) => {
        if (event.target === els.charmPreviewModal) closeCharmPreview();
      });
    }
    els.toolRailCollapseButton.addEventListener("click", () => {
      const collapsed = !els.toolRailCollapseButton.closest(".canvas-tool-rail").classList.contains("is-collapsed");
      els.toolRailCollapseButton.closest(".canvas-tool-rail").classList.toggle("is-collapsed", collapsed);
      els.toolRailCollapseButton.textContent = collapsed ? "›" : "‹";
      localStorage.setItem("q-pixel-tool-rail-collapsed", collapsed ? "1" : "0");
    });
    if (els.toolRailBCollapseButton) {
      els.toolRailBCollapseButton.addEventListener("click", () => {
        const rail = els.toolRailBCollapseButton.closest(".canvas-tool-rail");
        const collapsed = !rail.classList.contains("is-collapsed");
        rail.classList.toggle("is-collapsed", collapsed);
        els.toolRailBCollapseButton.textContent = collapsed ? "B组" : "›";
        localStorage.setItem("q-pixel-tool-rail-b-collapsed", collapsed ? "1" : "0");
      });
    }
    makeFloatingPanelDraggable(els.toolRailGrip.closest(".canvas-tool-rail"), els.toolRailGrip, { persistKey: "q-pixel-tool-rail-position-v2" });
    if (els.toolRailBGrip) makeFloatingPanelDraggable(els.toolRailBGrip.closest(".canvas-tool-rail"), els.toolRailBGrip, { persistKey: "q-pixel-tool-rail-b-position-v1" });
    makeFloatingPanelDraggable(els.colorStrip, els.colorStripGrip, { persistKey: "q-pixel-color-strip-position-v2" });
    if (localStorage.getItem("q-pixel-tool-rail-collapsed") === "1") {
      els.toolRailGrip.closest(".canvas-tool-rail").classList.add("is-collapsed");
      els.toolRailCollapseButton.textContent = "›";
    }
    if (els.toolRailBCollapseButton && localStorage.getItem("q-pixel-tool-rail-b-collapsed") === "1") {
      els.toolRailBCollapseButton.closest(".canvas-tool-rail").classList.add("is-collapsed");
      els.toolRailBCollapseButton.textContent = "B组";
    }
    els.modePixelButton.addEventListener("click", () => setMode("pixel"));
    els.modeBeadsButton.addEventListener("click", () => setMode("beads"));
    els.pixelToBeadsButton.addEventListener("click", generateBeadsFromPixel);
    els.generateBeadsButton.addEventListener("click", () => generateBeadsFromImage(true));
    if (els.recalibrateImageButton) els.recalibrateImageButton.addEventListener("click", openCalibrationForCurrentImage);
    els.usePixelButton.addEventListener("click", generateBeadsFromPixel);
    els.previewCanvas.addEventListener("pointerdown", handleCanvasPointerDown);
    els.previewCanvas.addEventListener("pointermove", handleCanvasPointerMove);
    els.previewCanvas.addEventListener("pointercancel", handleCanvasPointerUp);
    els.previewCanvas.addEventListener("wheel", (event) => {
      if (!state.image && !state.beads.pattern) return;
      event.preventDefault();
      zoomView(event.deltaY > 0 ? 0.9 : 1.1);
    }, { passive: false });
    window.addEventListener("pointerup", handleCanvasPointerUp);
    els.zoomOutButton.addEventListener("click", () => zoomView(0.8));
    els.zoomInButton.addEventListener("click", () => zoomView(1.25));
    els.fitViewButton.addEventListener("click", resetView);
    els.fileInput.addEventListener("change", (event) => {
      loadFile(event.target.files && event.target.files[0]);
      event.target.value = "";
    });

    [
      ["precision", els.precisionRange, els.precisionNumber],
      ["gap", els.gapRange, els.gapNumber],
      ["radius", els.radiusRange, els.radiusNumber]
    ].forEach(([key, range, number]) => {
      range.addEventListener("input", () => updateParam(key, range.value));
      number.addEventListener("input", () => updateParam(key, number.value));
    });
    els.pixelCodesToggle.addEventListener("change", () => {
      state.params.showCodes = els.pixelCodesToggle.checked;
      render();
    });

    els.beadWidthNumber.addEventListener("input", () => updateBeadSize("width", els.beadWidthNumber.value));
    els.beadHeightNumber.addEventListener("input", () => updateBeadSize("height", els.beadHeightNumber.value));
    els.beadLockRatio.addEventListener("change", () => {
      state.beads.lockRatio = els.beadLockRatio.checked;
      syncBeadControls();
    });
    els.showCodesToggle.addEventListener("change", () => {
      state.beads.showCodes = els.showCodesToggle.checked;
      render();
    });
    els.showGridToggle.addEventListener("change", () => {
      state.beads.showGrid = els.showGridToggle.checked;
      render();
    });
    [els.codeFontScaleRange, els.codeFontScaleNumber].forEach((input) => {
      input.addEventListener("input", () => {
        state.beads.codeFontScale = clamp(input.value, 80, 180);
        syncBeadControls();
        render();
      });
    });
    els.paletteSelect.addEventListener("change", () => {
      selectBeadColor(els.paletteSelect.value);
    });
    els.replaceFromSelect.addEventListener("change", () => {
      state.beads.replaceFrom = els.replaceFromSelect.value;
    });
    els.replaceToSelect.addEventListener("change", () => {
      state.beads.replaceTo = els.replaceToSelect.value;
    });
    els.replaceAllButton.addEventListener("click", handleReplaceAll);
    els.undoTopButton.addEventListener("click", undoEdit);
    els.redoTopButton.addEventListener("click", redoEdit);

    els.toolButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextTool = button.dataset.tool;
        if (nextTool === "clear-layer") {
          if (!state.beads.pattern) return setMessage("请先生成图纸。", true);
          pushHistory();
          const changed = clearActiveLayerCells();
          if (!changed) state.beads.undoStack.pop();
          setMessage(changed ? `已清空当前图层 ${changed} 格。` : "当前图层没有可清空的像素，或图层已锁定。", !changed);
          state.beads.toolOptionsHiddenFor = "";
          syncBeadControls();
          render();
          return;
        }
        if (state.beads.editTool === "select" && nextTool !== "select") {
          state.beads.selectedCells = [];
          state.beads.lassoPath = [];
          state.beads.floatingSelection = null;
          state.beads.selectionColorsOpen = false;
        }
        state.beads.toolOptionsHiddenFor = "";
        if (button.dataset.tool === "picker" && state.beads.editTool === "picker") {
          state.beads.editTool = "inspect";
        } else {
          state.beads.editTool = nextTool;
        }
        syncBeadControls();
        render();
      });
    });
    [els.guideVerticalButton, els.guideHorizontalButton].forEach((button) => {
      if (!button) return;
      button.addEventListener("click", () => {
        state.beads.guideOrientation = button.dataset.guideOrientation === "horizontal" ? "horizontal" : "vertical";
        syncBeadControls();
      });
    });
    [els.guideSolidButton, els.guideDashedButton].forEach((button) => {
      if (!button) return;
      button.addEventListener("click", () => {
        state.beads.guideStyle = button.dataset.guideStyle === "solid" ? "solid" : "dashed";
        syncBeadControls();
        render();
      });
    });
    if (els.guideColorInput) {
      els.guideColorInput.addEventListener("input", () => {
        state.beads.guideColor = els.guideColorInput.value || "#ff9d38";
        syncBeadControls();
        render();
      });
    }
    if (els.guideOpacityRange) {
      els.guideOpacityRange.addEventListener("input", () => {
        state.beads.guideOpacity = clamp(els.guideOpacityRange.value, 10, 100);
        syncBeadControls();
        render();
      });
    }
    if (els.guideDoneButton) {
      els.guideDoneButton.addEventListener("click", () => {
        state.beads.editTool = "guide";
        state.beads.toolOptionsHiddenFor = "guide";
        syncBeadControls();
        setMessage("辅助线样式已确定，可在画布上拖动放置。", false);
      });
    }
    if (els.guideLineSelect) {
      els.guideLineSelect.addEventListener("change", () => {
        state.beads.guideSelectedId = els.guideLineSelect.value || "";
        render();
      });
    }
    if (els.guideDeleteButton) {
      els.guideDeleteButton.addEventListener("click", () => {
        const changed = deleteSelectedGuideLine();
        setMessage(changed ? "已删除当前辅助线。" : "请先选择一条辅助线。", !changed);
      });
    }
    if (els.guideClearButton) {
      els.guideClearButton.addEventListener("click", () => {
        state.beads.guideLines = [];
        state.beads.guideDrag = null;
        state.beads.guideSelectedId = "";
        setMessage("已清除辅助线。", false);
        render();
      });
    }
    if (els.paletteSearchInput) {
      els.paletteSearchInput.addEventListener("input", () => {
        const query = els.paletteSearchInput.value.trim().toLowerCase();
        Array.from(els.floatingPaletteGrid.querySelectorAll(".swatch-button")).forEach((button) => {
          button.style.display = !query || button.dataset.code.toLowerCase().includes(query) ? "" : "none";
        });
      });
    }
    els.colorStripToggle.addEventListener("click", () => {
      state.beads.colorStripCollapsed = !state.beads.colorStripCollapsed;
      renderColorStrip();
    });
    if (els.cellTargetSelect) els.cellTargetSelect.addEventListener("change", updateTargetPaletteActiveState);
    els.cellInfoCloseButton.addEventListener("click", hideCellInfo);
    els.cellMergeToSelectedButton.addEventListener("click", () => {
      const code = state.beads.inspectedCode || els.cellInfoCode.textContent;
      const target = els.cellTargetSelect ? els.cellTargetSelect.value : state.beads.selectedCode;
      const changed = mergeColorToSelected(code, target);
      setMessage(changed ? `已将 ${code} 的 ${changed} 格替换为 ${target}。` : "没有可替换的格子。", !changed);
      hideCellInfo();
    });
    els.cellReplaceToSelectedButton.addEventListener("click", () => {
      const cell = state.beads.inspectedCell;
      if (!cell || cell.row < 0 || cell.col < 0 || cell.row >= state.beads.pattern.height || cell.col >= state.beads.pattern.width) {
        setMessage("底部色号打开的是整色信息，请使用“整色替换”。", true);
        return;
      }
      const target = els.cellTargetSelect ? els.cellTargetSelect.value : state.beads.selectedCode;
      pushHistory();
      state.beads.selectedCode = target;
      const changed = replaceSingleVisibleCell(cell, target);
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? "已替换这个格子的色号。" : "这个格子无需替换。", !changed);
      hideCellInfo();
      render();
    });
    if (els.cellDeleteColorButton) {
      els.cellDeleteColorButton.addEventListener("click", () => {
        const code = state.beads.inspectedCode || els.cellInfoCode.textContent;
        const changed = deleteColorEverywhere(code);
        setMessage(changed ? `已删除 ${code} 的 ${changed} 格。` : "没有可删除的格子。", !changed);
        hideCellInfo();
      });
    }
    els.mergeSmallColorsButton.addEventListener("click", () => {
      const changed = mergeSmallColors(els.smallColorLimitInput.value);
      setMessage(changed ? `已合并 ${changed} 格小用量色号。` : "没有符合条件的小用量色号。", !changed);
      hideCellInfo();
    });
    if (els.colorOptimizeButton) {
      els.colorOptimizeButton.addEventListener("click", () => {
        const changed = optimizePatternColors(els.colorOptimizeLimitInput ? els.colorOptimizeLimitInput.value : 20);
        if (!changed && state.beads.pattern) render();
      });
    }
    if (els.restoreOptimizeButton) els.restoreOptimizeButton.addEventListener("click", () => restoreOptimizePattern("balanced"));
    if (els.restoreLightButton) els.restoreLightButton.addEventListener("click", () => restoreOptimizePattern("light"));
    if (els.restoreBalancedButton) els.restoreBalancedButton.addEventListener("click", () => restoreOptimizePattern("balanced"));
    if (els.restoreDetailButton) els.restoreDetailButton.addEventListener("click", () => restoreOptimizePattern("detail"));
    if (els.qualityCheckButton) els.qualityCheckButton.addEventListener("click", () => {
      const result = renderQualitySummary();
      setMessage(result && result.isolated ? `检查完成：发现 ${result.isolated} 个孤立格，建议先预览后再均衡还原。` : "检查完成：暂未发现明显孤立格。", Boolean(result && result.isolated));
    });
    if (els.exportMaterialsButton) els.exportMaterialsButton.addEventListener("click", exportMaterialsCsv);
    if (els.buildModeToggle) els.buildModeToggle.addEventListener("change", () => {
      state.beads.buildMode = els.buildModeToggle.checked;
      renderBuildProgress();
      render();
    });
    if (els.clearBuildProgressButton) els.clearBuildProgressButton.addEventListener("click", clearBuildProgress);
    if (els.aiGenerateTopButton) els.aiGenerateTopButton.addEventListener("click", openAiGenerateModal);
    if (els.aiGenerateCloseButton) els.aiGenerateCloseButton.addEventListener("click", closeAiGenerateModal);
    if (els.aiPromptCopyButton) els.aiPromptCopyButton.addEventListener("click", async () => {
      const prompt = els.aiPromptInput ? els.aiPromptInput.value.trim() : "";
      try { await navigator.clipboard.writeText(prompt); } catch {}
      if (els.aiGenerateStatus) els.aiGenerateStatus.textContent = prompt ? "提示词已复制。" : "请先输入主题描述。";
    });
    if (els.aiGenerateButton) els.aiGenerateButton.addEventListener("click", startAiGeneration);
    if (els.aiJimengWebButton) els.aiJimengWebButton.addEventListener("click", startJimengWebCollaboration);
    if (els.aiJimengImportButton) els.aiJimengImportButton.addEventListener("click", importPendingJimengDownload);
    if (els.aiJimengIgnoreButton) els.aiJimengIgnoreButton.addEventListener("click", () => {
      clearPendingJimengDownload();
      if (els.aiGenerateStatus) els.aiGenerateStatus.textContent = "已忽略这次下载图片，可以继续生成或重新协同。";
    });
    if (els.aiProviderSelect) els.aiProviderSelect.addEventListener("change", refreshAiProviderStatus);
    if (els.aiGenerateModal) els.aiGenerateModal.addEventListener("click", (event) => {
      if (event.target === els.aiGenerateModal) closeAiGenerateModal();
    });
    if (els.sourceCompareToggle) {
      els.sourceCompareToggle.addEventListener("change", () => {
        state.beads.sourceCompareEnabled = els.sourceCompareToggle.checked;
        render();
      });
    }
    if (els.sourceCompareOpacityRange) {
      els.sourceCompareOpacityRange.addEventListener("input", () => {
        state.beads.sourceCompareOpacity = clamp(els.sourceCompareOpacityRange.value, 10, 85);
        syncBeadControls();
        render();
      });
    }
    if (els.colorOptimizeUndoButton) els.colorOptimizeUndoButton.addEventListener("click", undoEdit);
    els.cellTargetSelect.addEventListener("change", () => {
      selectBeadColor(els.cellTargetSelect.value);
    });
    els.layerPanelToggle.addEventListener("click", () => {
      if (!state.beads.pattern) return setMessage("请先生成图纸。", true);
      pushHistory();
      addLayer();
      setMessage("已新建图层。", false);
    });

    if (els.brushSizeRange) {
      els.brushSizeRange.addEventListener("input", () => {
        state.beads.brushSize = clamp(els.brushSizeRange.value, 1, 10);
        syncBeadControls();
      });
    }
    if (els.brushDoneButton) {
      els.brushDoneButton.addEventListener("click", () => {
        state.beads.editTool = "brush";
        state.beads.toolOptionsHiddenFor = "brush";
        syncBeadControls();
        setMessage(`画笔范围已设为 ${state.beads.brushSize}。`, false);
      });
    }
    els.eraserSizeRange.addEventListener("input", () => {
      state.beads.eraserSize = clamp(els.eraserSizeRange.value, 1, 10);
      syncBeadControls();
    });
    els.eraserDoneButton.addEventListener("click", () => {
      state.beads.editTool = "eraser";
      state.beads.toolOptionsHiddenFor = "eraser";
      syncBeadControls();
      setMessage(`橡皮范围已设为 ${state.beads.eraserSize}。`, false);
    });
    if (els.outlineWidthRange) {
      els.outlineWidthRange.addEventListener("input", () => {
        state.beads.outlineWidth = clamp(els.outlineWidthRange.value, 1, 10);
        syncBeadControls();
      });
    }
    if (els.outlineColorSelect) {
      els.outlineColorSelect.addEventListener("change", () => {
        state.beads.outlineCode = els.outlineColorSelect.value;
        syncBeadControls();
      });
    }
    [els.outlineAddButton, els.outlineRemoveButton].forEach((button) => {
      if (!button) return;
      button.addEventListener("click", () => {
        state.beads.outlineMode = button.dataset.outlineMode === "remove" ? "remove" : "add";
        syncBeadControls();
      });
    });
    if (els.outlineApplyButton) {
      els.outlineApplyButton.addEventListener("click", () => {
        if (!state.beads.pattern) return setMessage("请先生成图纸。", true);
        pushHistory();
        const changed = applyOutlineEdit(state.beads.outlineMode, state.beads.outlineWidth, state.beads.outlineCode || state.beads.selectedCode);
        if (!changed) state.beads.undoStack.pop();
        setMessage(changed ? `已${state.beads.outlineMode === "remove" ? "减少" : "增加"} ${changed} 格描边。` : "没有可处理的描边区域。", !changed);
        syncBeadControls();
        render();
      });
    }
    if (els.recolorApplyButton) {
      els.recolorApplyButton.addEventListener("click", () => {
        const fromFamily = els.recolorFromSelect ? els.recolorFromSelect.value : "red";
        const toFamily = els.recolorToSelect ? els.recolorToSelect.value : "purple";
        const changed = applyFamilyRecolor(fromFamily, toFamily);
        setMessage(changed ? `已按明暗关系替换 ${changed} 格配色。` : "当前图纸没有可替换的该色系颜色。", !changed);
      });
    }
    [els.selectRectButton, els.selectLassoButton].forEach((button) => {
      button.addEventListener("click", () => {
        state.beads.selectMode = button.dataset.selectMode === "lasso" ? "lasso" : "rect";
        syncBeadControls();
      });
    });
    [els.selectionReplaceButton, els.selectionAddButton, els.selectionSubtractButton].forEach((button) => {
      button.addEventListener("click", () => {
        state.beads.selectionOp = button.dataset.selectionOp || "replace";
        state.beads.floatingSelection = null;
        syncBeadControls();
      });
    });
    els.selectionFillButton.addEventListener("click", () => {
      pushHistory();
      const changed = applySelectionEdit(state.beads.selectedCode);
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? `已填色 ${changed} 格。` : "请先选择区域。", !changed);
      render();
    });
    els.selectionClearButton.addEventListener("click", () => {
      pushHistory();
      const changed = applySelectionEdit(null);
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? `已删除 ${changed} 格。` : "请先选择区域。", !changed);
      render();
    });
    els.selectionCopyButton.addEventListener("click", () => {
      setMessage(copySelection() ? `已复制 ${state.beads.selectedCells.length} 格。` : "请先选择区域。", !state.beads.selectedCells.length);
    });
    els.selectionPasteButton.addEventListener("click", () => {
      pushHistory();
      const changed = pasteClipboard();
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? `已粘贴 ${changed} 格。` : "请先复制选区。", !changed);
      render();
    });
    if (els.selectionMoveButton) {
      els.selectionMoveButton.addEventListener("click", () => {
        const willCopy = Boolean(state.beads.clipboard && state.beads.clipboardSelectionSignature === getSelectionSignature());
        setMessage(beginFloatingSelectionMove() ? (willCopy ? "已生成可拖动副本：按住副本拖到目标位置后松开。" : "已进入选区移动：拖动选中内容到目标位置后松开。") : "请先选择区域。", !state.beads.selectedCells.length);
      });
    }
    els.selectionMirrorButton.addEventListener("click", () => {
      pushHistory();
      const changed = mirrorSelection();
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? `已镜像 ${changed} 格。` : "请先选择区域。", !changed);
      render();
    });
    if (els.selectionColorsButton) {
      els.selectionColorsButton.addEventListener("click", () => {
        state.beads.selectionColorsOpen = !state.beads.selectionColorsOpen;
        state.beads.editTool = "select";
        syncBeadControls();
        setMessage(state.beads.selectionColorsOpen ? "已展开选区色号，可在当前选区内替换或合并。" : "已收起选区色号。", false);
      });
    }
    if (els.selectionOutlineButton) {
      els.selectionOutlineButton.addEventListener("click", () => {
        const changed = applySelectionOutlineEdit(state.beads.outlineMode, state.beads.outlineWidth, state.beads.outlineCode || state.beads.selectedCode);
        setMessage(changed ? `已在选区内${state.beads.outlineMode === "remove" ? "减少" : "增加"} ${changed} 格描边。` : "请先选择区域，或当前选区没有可描边内容。", !changed);
      });
    }
    if (els.selectionColorTargetSelect) {
      els.selectionColorTargetSelect.addEventListener("change", () => {
        selectBeadColor(els.selectionColorTargetSelect.value);
        updateTargetPaletteActiveState();
      });
    }
    if (els.selectionColorMergeSmallButton) {
      els.selectionColorMergeSmallButton.addEventListener("click", () => {
        const target = els.selectionColorTargetSelect ? els.selectionColorTargetSelect.value : state.beads.selectedCode;
        const changed = mergeSmallColorsInSelection(els.selectionSmallColorLimitInput && els.selectionSmallColorLimitInput.value, target);
        setMessage(changed ? `已在选区内合并 ${changed} 格小用量色号。` : "选区内没有符合条件的小用量色号。", !changed);
      });
    }
    if (els.selectionRotateButton) {
      els.selectionRotateButton.addEventListener("click", () => {
        pushHistory();
        const changed = rotateSelection();
        if (!changed) state.beads.undoStack.pop();
        setMessage(changed ? `已旋转 ${changed} 格。` : "请先选择一个正方形区域。", !changed);
        render();
      });
    }
    shapeTypes.map((type) => {
      const id = `shape${type[0].toUpperCase()}${type.slice(1)}Button`;
      return els[id];
    }).forEach((button) => {
      if (!button) return;
      button.addEventListener("click", () => {
        state.beads.shapeType = button.dataset.shapeType || "square";
        state.beads.editTool = "shape";
        syncBeadControls();
      });
    });
    if (els.shapeTemplateSelect) {
      els.shapeTemplateSelect.addEventListener("change", () => {
        state.beads.shapeTemplateSelectedId = els.shapeTemplateSelect.value || "";
        const template = getSelectedShapeTemplate();
        if (template) {
          state.beads.shapeType = "template";
          state.beads.shapeWidth = template.width;
          state.beads.shapeHeight = template.height;
          state.beads.editTool = "shape";
          setMessage(`已选择图形模板「${template.name}」，可拖到画布放置。`, false);
        }
        syncBeadControls();
      });
    }
    if (els.shapeTemplateSaveButton) {
      els.shapeTemplateSaveButton.addEventListener("click", () => {
        saveSelectionAsShapeTemplate();
      });
    }
    if (els.shapeTemplateDeleteButton) {
      els.shapeTemplateDeleteButton.addEventListener("click", () => {
        deleteSelectedShapeTemplate();
      });
    }
    [els.shapeFilledButton, els.shapeOutlineButton].forEach((button) => {
      if (!button) return;
      button.addEventListener("click", () => {
        state.beads.shapeStyle = button.dataset.shapeStyle === "outline" ? "outline" : "filled";
        state.beads.editTool = "shape";
        syncBeadControls();
      });
    });
    [els.shapeWidthInput, els.shapeHeightInput, els.shapeSidesInput, els.shapeFontSelect, els.shapeTextInput].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", () => {
        state.beads.shapeWidth = clamp(els.shapeWidthInput.value, 1, bounds.beadSize.max);
        state.beads.shapeHeight = clamp(els.shapeHeightInput.value, 1, bounds.beadSize.max);
        state.beads.shapeSides = clamp(els.shapeSidesInput.value, 3, 16);
        state.beads.shapeFont = (els.shapeFontSelect && els.shapeFontSelect.value) || "system";
        state.beads.shapeText = (els.shapeTextInput && els.shapeTextInput.value) || "Q";
        syncBeadControls();
      });
    });
    if (els.shapeApplyButton) {
      els.shapeApplyButton.addEventListener("click", () => {
        if (state.beads.shapeType === "template") {
          const template = getSelectedShapeTemplate();
          if (!template) {
            setMessage("请先保存或选择一个自定义图形模板。", true);
            return;
          }
          state.beads.shapeWidth = template.width;
          state.beads.shapeHeight = template.height;
          state.beads.editTool = "shape";
          syncBeadControls();
          setMessage(`模板「${template.name}」已准备好，拖到画布目标位置松开放置。`, false);
          return;
        }
        state.beads.shapeWidth = clamp(els.shapeWidthInput.value, 1, bounds.beadSize.max);
        state.beads.shapeHeight = clamp(els.shapeHeightInput.value, 1, bounds.beadSize.max);
        state.beads.shapeSides = clamp(els.shapeSidesInput.value, 3, 16);
        state.beads.shapeFont = (els.shapeFontSelect && els.shapeFontSelect.value) || "system";
        state.beads.shapeText = (els.shapeTextInput && els.shapeTextInput.value) || "Q";
        state.beads.editTool = "shape";
        syncBeadControls();
        const sizeError = getShapeSizeError(state.beads.shapeType, state.beads.shapeWidth, state.beads.shapeHeight);
        setMessage(sizeError || `图形已设置为 ${state.beads.shapeWidth} x ${state.beads.shapeHeight}，点击画布放置。`, Boolean(sizeError));
      });
    }
    els.baseboardModeSelect.addEventListener("change", () => {
      state.beads.baseboardMode = els.baseboardModeSelect.value;
      render();
    });
    els.baseboardColorInput.addEventListener("input", () => {
      state.beads.baseboardColor = els.baseboardColorInput.value || "#ffffff";
      if (state.beads.baseboardMode === "custom") render();
    });
    els.layerNewButton.addEventListener("click", () => {
      if (!state.beads.pattern) return setMessage("请先生成图纸。", true);
      pushHistory();
      addLayer();
      setMessage("已新建图层。", false);
    });
    els.layerDuplicateButton.addEventListener("click", () => {
      if (!state.beads.pattern) return setMessage("请先生成图纸。", true);
      pushHistory();
      duplicateActiveLayer();
      setMessage("已复制当前图层。", false);
    });
    els.layerMergeButton.addEventListener("click", () => {
      if (!state.beads.pattern) return setMessage("请先生成图纸。", true);
      pushHistory();
      mergeVisibleLayers();
      setMessage("已合并可见图层。", false);
    });
    els.layerGroupButton.addEventListener("click", () => {
      if (!state.beads.pattern) return setMessage("请先生成图纸。", true);
      setMessage(`已分组：${groupLayers()}。`, false);
    });
    els.layerMirrorButton.addEventListener("click", () => {
      if (!state.beads.pattern) return setMessage("请先生成图纸。", true);
      pushHistory();
      const changed = mirrorActiveLayer();
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? "当前图层已镜像。" : "当前图层未变化或已锁定。", !changed);
    });
    els.layerImportButton.addEventListener("click", openLayerImportModal);
    if (els.layerImportCloseButton) els.layerImportCloseButton.addEventListener("click", closeLayerImportModal);
    if (els.layerImportModal) {
      els.layerImportModal.addEventListener("click", (event) => {
        if (event.target === els.layerImportModal) closeLayerImportModal();
      });
    }
    if (els.layerImportImageButton) {
      els.layerImportImageButton.addEventListener("click", () => {
        els.layerImportInput.accept = "image/png,image/jpeg,image/webp,image/gif,image/bmp";
        els.layerImportInput.click();
      });
    }
    if (els.layerImportProjectFileButton) {
      els.layerImportProjectFileButton.addEventListener("click", () => {
        els.layerImportInput.accept = ".qpx,application/json";
        els.layerImportInput.click();
      });
    }
    els.layerImportInput.addEventListener("change", (event) => {
      importLayerFile(event.target.files && event.target.files[0]);
      closeLayerImportModal();
      event.target.value = "";
    });
    els.canvasMirrorButton.addEventListener("click", () => {
      if (!ensurePatternForCanvasEdit()) return setMessage("请先载入图片或生成图纸。", true);
      pushHistory();
      const changed = mirrorFullCanvas();
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? "全图已镜像。" : "画布没有变化。", !changed);
    });
    [
      [els.expandUpButton, "up", "上"],
      [els.expandDownButton, "down", "下"],
      [els.expandLeftButton, "left", "左"],
      [els.expandRightButton, "right", "右"]
    ].forEach(([button, direction, label]) => {
      button.addEventListener("click", () => {
        if (!ensurePatternForCanvasEdit()) return setMessage("请先载入图片或生成图纸。", true);
        pushHistory();
        const changed = expandCanvas(direction, els.expandAmountInput.value);
        if (!changed) state.beads.undoStack.pop();
        setMessage(changed ? `已向${label}扩容 ${changed} 格。` : `扩容后会超过最大图纸尺寸 ${bounds.beadSize.max} 格。`, !changed);
      });
    });
    els.cropAutoButton.addEventListener("click", () => {
      if (!ensurePatternForCanvasEdit()) return setMessage("请先载入图片或生成图纸。", true);
      pushHistory();
      const changed = autoCropCanvas();
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? "已按有效内容自动裁剪。" : "没有可裁剪的有效内容。", !changed);
    });
    els.cropSelectionButton.addEventListener("click", () => {
      if (!ensurePatternForCanvasEdit()) return setMessage("请先载入图片或生成图纸。", true);
      pushHistory();
      const changed = cropCanvasToSelection();
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? "已按当前选区裁剪。" : "请先选择区域。", !changed);
    });
    els.scaleUpButton.addEventListener("click", () => {
      if (!ensurePatternForCanvasEdit()) return setMessage("请先载入图片或生成图纸。", true);
      pushHistory();
      const changed = scaleCanvasByFactor(Number(els.scaleFactorInput.value) || 2);
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? "画布已放大。" : "画布尺寸没有变化或已达到上限。", !changed);
    });
    els.scaleDownButton.addEventListener("click", () => {
      if (!ensurePatternForCanvasEdit()) return setMessage("请先载入图片或生成图纸。", true);
      pushHistory();
      const factor = Number(els.scaleFactorInput.value) || 2;
      const changed = scaleCanvasByFactor(1 / Math.max(0.25, factor));
      if (!changed) state.beads.undoStack.pop();
      setMessage(changed ? "画布已缩小。" : "画布尺寸没有变化或已达到下限。", !changed);
    });

    [
      ["showGrid", els.exportGridToggle],
      ["showCenterLines", els.exportCenterToggle],
      ["showCodes", els.exportCodesToggle],
      ["showUsage", els.exportUsageToggle],
      ["sortUsage", els.exportSortToggle],
      ["showInfo", els.exportInfoToggle],
      ["showAppInfo", els.exportAppInfoToggle],
      ["showAxisNumbers", els.exportAxisToggle],
      ["showOuterBorder", els.exportOuterBorderToggle],
      ["exportAutoCellSize", els.exportAutoCellToggle],
      ["exportTransparentBackground", els.exportTransparentToggle],
      ["albumIncludeOverview", els.albumOverviewToggle],
      ["albumShowPageTitle", els.albumPageTitleToggle],
      ["exportMirror", els.exportMirrorToggle],
      ["exportPdf", els.exportPdfToggle],
      ["watermarkEnabled", els.watermarkEnabledToggle]
    ].forEach(([key, input]) => {
      if (!input) return;
      input.addEventListener("change", () => {
        state.beads.exportSettings[key] = input.checked;
        if (key === "watermarkEnabled") saveWatermarkSettings();
        refreshExportPreviewIfOpen();
      });
    });
    [
      [els.paperOrientationPortraitButton, "portrait"],
      [els.paperOrientationLandscapeButton, "landscape"]
    ].forEach(([button, value]) => {
      button.addEventListener("click", () => {
        state.beads.exportSettings.paperOrientation = value;
        syncBeadControls();
        refreshExportPreviewIfOpen();
      });
    });
    [els.usageLayoutWrapButton, els.usageLayoutGridButton].forEach((button) => {
      button.addEventListener("click", () => {
        state.beads.exportSettings.usageLayout = button.dataset.usageLayout === "grid" ? "grid" : "wrap";
        syncBeadControls();
        refreshExportPreviewIfOpen();
      });
    });
    [els.usageStyleChipsButton, els.usageStyleTableButton].forEach((button) => {
      button.addEventListener("click", () => {
        state.beads.exportSettings.usageStyle = button.dataset.usageStyle === "table" ? "table" : "chips";
        syncBeadControls();
        refreshExportPreviewIfOpen();
      });
    });
    [
      ["exportCellSize", els.exportCellSizeRange],
      ["exportMargin", els.exportMarginRange],
      ["albumTileSize", els.albumTileSizeRange],
      ["usageFontSize", els.usageFontSizeRange],
      ["watermarkFontSize", els.watermarkFontSizeRange],
      ["watermarkWeight", els.watermarkWeightRange],
      ["watermarkOpacity", els.watermarkOpacityRange],
      ["watermarkAngle", els.watermarkAngleRange],
      ["watermarkRowGap", els.watermarkRowGapRange],
      ["watermarkColGap", els.watermarkColGapRange],
      ["watermarkOffsetX", els.watermarkOffsetXRange],
      ["watermarkOffsetY", els.watermarkOffsetYRange]
    ].forEach(([key, input]) => {
      if (!input) return;
      input.addEventListener("input", () => {
        state.beads.exportSettings[key] = clamp(input.value, Number(input.min || 0), Number(input.max || 999));
        if (key.startsWith("watermark")) saveWatermarkSettings();
        syncBeadControls();
        refreshExportPreviewIfOpen();
      });
    });
    els.paperPresetSelect.addEventListener("change", () => {
      state.beads.exportSettings.paperPreset = els.paperPresetSelect.value || "auto";
      syncBeadControls();
      refreshExportPreviewIfOpen();
    });
    if (els.exportRatioSelect) {
      els.exportRatioSelect.addEventListener("change", () => {
        state.beads.exportSettings.exportRatio = els.exportRatioSelect.value || "auto";
        syncBeadControls();
        refreshExportPreviewIfOpen();
      });
    }
    [els.exportRatioWidthInput, els.exportRatioHeightInput].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", () => {
        state.beads.exportSettings.exportRatioWidth = clamp(els.exportRatioWidthInput && els.exportRatioWidthInput.value, 1, 99);
        state.beads.exportSettings.exportRatioHeight = clamp(els.exportRatioHeightInput && els.exportRatioHeightInput.value, 1, 99);
        syncBeadControls();
        refreshExportPreviewIfOpen();
      });
    });
    if (els.exportPixelStyleSelect) {
      els.exportPixelStyleSelect.addEventListener("change", () => {
        state.beads.exportSettings.exportPixelStyle = els.exportPixelStyleSelect.value || "current";
        syncBeadControls();
        refreshExportPreviewIfOpen();
      });
    }
    els.exportScaleSelect.addEventListener("change", () => {
      state.beads.exportSettings.exportScale = Math.max(1, Math.min(8, Number(els.exportScaleSelect.value) || 2));
      syncBeadControls();
      refreshExportPreviewIfOpen();
    });
    els.exportScaleNumber.addEventListener("input", () => {
      state.beads.exportSettings.exportScale = Math.max(1, Math.min(8, Number(els.exportScaleNumber.value) || 2));
      syncBeadControls();
      refreshExportPreviewIfOpen();
    });
    if (els.exportRegionToggle) {
      els.exportRegionToggle.addEventListener("change", () => {
        state.beads.exportSettings.regionEnabled = els.exportRegionToggle.checked;
        if (state.beads.exportSettings.regionEnabled && state.beads.pattern && !state.beads.exportRegions.length) {
          state.beads.exportRegions = makeAutoExportRegions(
            state.beads.pattern,
            state.beads.exportSettings.regionRows,
            state.beads.exportSettings.regionCols
          ).map((region, index) => Object.assign({}, region, { id: makeExportRegionId(), name: `区域 ${index + 1}` }));
          state.beads.exportSettings.regionSelectedId = state.beads.exportRegions[0] ? state.beads.exportRegions[0].id : "";
        }
        syncBeadControls();
        refreshExportPreviewIfOpen();
      });
    }
    [els.exportRegionRowsInput, els.exportRegionColsInput].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", () => {
        state.beads.exportSettings.regionRows = clamp(els.exportRegionRowsInput && els.exportRegionRowsInput.value, 1, 12);
        state.beads.exportSettings.regionCols = clamp(els.exportRegionColsInput && els.exportRegionColsInput.value, 1, 12);
      });
    });
    if (els.exportRegionAutoButton) els.exportRegionAutoButton.addEventListener("click", autoGenerateExportRegions);
    if (els.exportRegionGuideButton) els.exportRegionGuideButton.addEventListener("click", generateExportRegionsFromGuides);
    if (els.exportRegionAddButton) els.exportRegionAddButton.addEventListener("click", addCustomExportRegion);
    if (els.exportRegionSelect) {
      els.exportRegionSelect.addEventListener("change", () => {
        state.beads.exportSettings.regionSelectedId = els.exportRegionSelect.value || "";
        syncExportRegionInputs();
      });
    }
    if (els.exportRegionMultiSelect) {
      els.exportRegionMultiSelect.addEventListener("change", () => {
        const ids = getRegionIdsFromMultiSelect();
        if (ids.length) {
          state.beads.exportSettings.regionSelectedId = ids[ids.length - 1];
          if (els.exportRegionSelect) els.exportRegionSelect.value = state.beads.exportSettings.regionSelectedId;
          syncExportRegionInputs();
        }
      });
    }
    if (els.exportRegionDeleteButton) els.exportRegionDeleteButton.addEventListener("click", deleteSelectedExportRegion);
    if (els.exportRegionExportButton) els.exportRegionExportButton.addEventListener("click", exportSelectedRegionPng);
    if (els.exportRegionExportSelectedButton) els.exportRegionExportSelectedButton.addEventListener("click", exportMultiRegionPng);
    if (els.exportRegionExportAllButton) els.exportRegionExportAllButton.addEventListener("click", exportAllRegionsPng);
    [
      [els.exportRegionNudgeUpButton, "up"],
      [els.exportRegionNudgeDownButton, "down"],
      [els.exportRegionNudgeLeftButton, "left"],
      [els.exportRegionNudgeRightButton, "right"]
    ].forEach(([button, direction]) => {
      if (button) button.addEventListener("click", () => nudgeSelectedExportRegion(direction));
    });
    els.exportBackgroundColorInput.addEventListener("input", () => {
      state.beads.exportSettings.exportBackgroundColor = els.exportBackgroundColorInput.value || "#ffffff";
      refreshExportPreviewIfOpen();
    });
    els.watermarkColorInput.addEventListener("input", () => {
      state.beads.exportSettings.watermarkColor = els.watermarkColorInput.value || "#222222";
      saveWatermarkSettings();
      refreshExportPreviewIfOpen();
    });
    els.exportWatermarkInput.addEventListener("input", () => {
      state.beads.exportSettings.watermark = els.exportWatermarkInput.value.trim();
      if (state.beads.exportSettings.watermark) state.beads.exportSettings.watermarkEnabled = true;
      saveWatermarkSettings();
      syncBeadControls();
      refreshExportPreviewIfOpen();
    });

    els.projectTitleInput.addEventListener("input", () => {
      state.beads.projectTitle = els.projectTitleInput.value.trim() || "未命名";
      markUnsavedChanges();
    });
    els.saveProjectButton.addEventListener("click", saveCurrentProject);
    els.importProjectButton.addEventListener("click", () => els.projectFileInput.click());
    els.exportProjectButton.addEventListener("click", exportCurrentProjectFile);
    els.exportBeadPixelButton.addEventListener("click", exportBeadPixelPng);
    els.exportAlbumButton.addEventListener("click", openExportPreview);
    els.projectFileInput.addEventListener("change", (event) => {
      importProjectFile(event.target.files && event.target.files[0]);
      event.target.value = "";
    });

    els.bgButtons.forEach((button) => {
      button.addEventListener("click", () => updateParam("background", button.dataset.bg));
    });

    ["dragenter", "dragover"].forEach((name) => {
      els.dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        els.dropZone.classList.add("is-dragging");
      });
    });
    ["dragleave", "drop"].forEach((name) => {
      els.dropZone.addEventListener(name, (event) => {
        event.preventDefault();
        els.dropZone.classList.remove("is-dragging");
      });
    });
    els.dropZone.addEventListener("drop", (event) => {
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      loadFile(file);
    });

    window.addEventListener("resize", () => {
      render();
      renderCalibrationCanvas();
    });
  }

  function createSyntheticImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#3f83f8");
    gradient.addColorStop(.5, "#50d6aa");
    gradient.addColorStop(1, "#ffcf5a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(14, 20, 32, .85)";
    ctx.fillRect(12, 12, 26, 26);
    ctx.fillStyle = "rgba(255, 255, 255, .9)";
    ctx.beginPath();
    ctx.arc(68, 36, 18, 0, Math.PI * 2);
    ctx.fill();
    const img = new Image();
    img.src = canvas.toDataURL("image/png");
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  async function renderSynthetic(params) {
    const image = await createSyntheticImage();
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 220;
    const renderInfo = renderPixelatedToCanvas(canvas, image, params || state.params, { fillCanvas: true });
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let visiblePixels = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) visiblePixels += 1;
    }
    return { canvas, renderInfo, visiblePixels, image };
  }

  async function generateSyntheticBeadPattern(width, height) {
    const image = await createSyntheticImage();
    const pattern = createPatternFromSource(image, width || 32, height || 24, "测试图");
    const usage = calculateUsage(pattern);
    return { pattern, usage };
  }

  async function activateSyntheticBeadPattern(width, height) {
    const generated = await generateSyntheticBeadPattern(width, height);
    state.beads.pattern = generated.pattern;
    state.beads.width = generated.pattern.width;
    state.beads.height = generated.pattern.height;
    state.beads.projectTitle = "测试源文件";
    state.beads.sourceLabel = "测试图";
    state.beads.layers = [];
    state.beads.activeLayerId = "";
    ensureLayers();
    clearHistory();
    return { pattern: state.beads.pattern, usage: calculateUsage(state.beads.pattern) };
  }

  async function activateSyntheticPixelEditablePattern(width, height) {
    const image = await createSyntheticSquareImage();
    state.mode = "pixel";
    state.image = image;
    state.imageName = "测试像素图";
    state.params.precision = width || 24;
    const pattern = createPatternFromSource(image, width || 24, height || 24, "像素画结果");
    state.beads.pattern = pattern;
    state.beads.width = pattern.width;
    state.beads.height = pattern.height;
    state.beads.layers = [];
    state.beads.activeLayerId = "";
    state.beads.sourceLabel = "像素画结果";
    state.beads.pixelSignature = getPixelPatternSignature();
    ensureLayers();
    clearHistory();
    return { pattern: state.beads.pattern, usage: calculateUsage(state.beads.pattern) };
  }

  async function transferSyntheticPixelToBeads() {
    const rendered = await renderSynthetic({ precision: 32, gap: 0, radius: 0, background: "checker" });
    const pattern = createPatternFromSource(rendered.canvas, 32, 22, "像素画结果");
    return { pattern, usage: calculateUsage(pattern) };
  }

  async function transferSyntheticSquarePixelToBeads(precision) {
    const image = await createSyntheticSquareImage();
    const gridSize = getPixelGridSizeForImage(image, { precision, gap: 0, radius: 0, background: "checker" });
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = image.naturalWidth || image.width;
    sourceCanvas.height = image.naturalHeight || image.height;
    renderPixelatedToCanvas(sourceCanvas, image, { precision, gap: 0, radius: 0, background: "checker" }, { fillCanvas: true });
    const width = clamp(gridSize.cols, bounds.beadSize.min, bounds.beadSize.max);
    const height = clamp(gridSize.rows, bounds.beadSize.min, bounds.beadSize.max);
    const pattern = createPatternFromSource(sourceCanvas, width, height, "像素画结果");
    return { pattern, usage: calculateUsage(pattern), gridSize };
  }

  function createSyntheticSquareImage() {
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#3f83f8");
    gradient.addColorStop(.5, "#50d6aa");
    gradient.addColorStop(1, "#ffcf5a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#162d7b";
    ctx.fillRect(18, 18, 36, 36);
    ctx.fillStyle = "#fffaf0";
    ctx.beginPath();
    ctx.arc(84, 72, 24, 0, Math.PI * 2);
    ctx.fill();
    const img = new Image();
    img.src = canvas.toDataURL("image/png");
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  function exportBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  async function generateSyntheticCalibratedPattern(settings) {
    const canvas = document.createElement("canvas");
    canvas.width = settings.width || 120;
    canvas.height = settings.height || 90;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const cellSize = settings.cellSize || 10;
    for (let row = 0; row < Math.floor(canvas.height / cellSize); row += 1) {
      for (let col = 0; col < Math.floor(canvas.width / cellSize); col += 1) {
        ctx.fillStyle = (row + col) % 3 === 0 ? "#1b4f9c" : (row + col) % 3 === 1 ? "#f4b23d" : "#ffffff";
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
    const img = new Image();
    img.src = canvas.toDataURL("image/png");
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    return createPatternFromSourceWithCalibration(img, {
      enabled: true,
      offsetX: settings.offsetX || 0,
      offsetY: settings.offsetY || 0,
      columns: settings.columns || 12,
      cellSize,
      rows: Math.floor(canvas.height / cellSize)
    }, "校准测试图");
  }

  function exposeTestHooks() {
    window.QPixelNativeSaved = () => setMessage(state.pendingSaveMessage || "PNG 已保存。", false);
    window.QPixelTest = {
      clampParams,
      clampBeadParams,
      renderSynthetic,
      exportBlob,
      generateSyntheticBeadPattern,
      activateSyntheticBeadPattern,
      activateSyntheticPixelEditablePattern,
      transferSyntheticPixelToBeads,
      transferSyntheticSquarePixelToBeads,
      calculateUsage,
      countPatternColors,
      getImportMode: () => getImportMode(),
      setImportMode: (mode) => {
        setImportMode(mode);
        return getImportMode();
      },
      getImportModeLabels: () => [
        els.importModeFidelityButton,
        els.importModeBalancedButton,
        els.importModeSimpleButton
      ].filter(Boolean).map((button) => button.textContent.trim()),
      setSourceCompare: (enabled, opacity) => {
        state.beads.sourceCompareEnabled = Boolean(enabled);
        if (opacity != null) state.beads.sourceCompareOpacity = clamp(opacity, 10, 85);
        syncBeadControls();
        return {
          enabled: state.beads.sourceCompareEnabled,
          opacity: state.beads.sourceCompareOpacity
        };
      },
      getLockedColorRoles: () => ({
        codes: Array.isArray(state.beads.lockedColorCodes) ? state.beads.lockedColorCodes.slice() : [],
        roles: Object.assign({}, state.beads.lockedColorRoles || {})
      }),
      setLockedColorCodes: (codes) => {
        state.beads.lockedColorCodes = Array.isArray(codes) ? codes.filter((code) => code && getPaletteColor(code).code === code) : [];
        state.beads.lockedColorRoles = state.beads.lockedColorCodes.reduce((roles, code) => {
          roles[code] = ["手动锁定"];
          return roles;
        }, {});
        renderLockedColorSummary();
        return state.beads.lockedColorCodes.slice();
      },
      analyzeLockedColorRoles,
      makeDefaultCalibration,
      normalizeCalibration,
      createPatternFromSourceWithCalibration,
      generateSyntheticCalibratedPattern,
      estimatePixelArtGrid,
      restoreOptimizePattern,
      restorePixelArtDetails,
      restorePixelArtDetailsForMode: (pattern, mode) => restorePixelArtDetails(pattern, mode),
      optimizePatternColors,
      undoEdit,
      mergeProjectsForTest: mergeProjects,
      payloadFingerprintForTest: payloadFingerprint,
      withProjectHistoryForTest: withProjectHistory,
      restoreProjectHistoryVersionForTest,
      formatSyncHealthMessageForTest: formatSyncHealthMessage,
      setProjectsForTest: (projects, options) => setProjects(projects, Object.assign({ remote: false }, options || {})),
      getProjectsForTest: () => getProjects(),
      getUnsavedChangesForTest: () => Boolean(state.hasUnsavedChanges),
      markUnsavedChangesForTest: () => {
        markUnsavedChanges();
        return state.hasUnsavedChanges;
      },
      markSavedForTest: () => {
        markSaved();
        return state.hasUnsavedChanges;
      },
      getImportSummaryForTest: () => els.importSummary ? els.importSummary.textContent : "",
      analyzePatternQualityForTest: analyzePatternQuality,
      getInventoryForTest: () => Object.assign({}, state.inventory),
      setInventoryForTest: (inventory) => {
        state.inventory = inventory && typeof inventory === "object" ? Object.assign({}, inventory) : {};
        saveInventory();
        return Object.assign({}, state.inventory);
      },
      toggleBuildCellForTest: toggleBuildCell,
      clearBuildProgressForTest: clearBuildProgress,
      getBuildProgressForTest: () => Object.assign({}, state.buildProgress),
      buildAiGenerationRequestForTest: buildAiGenerationRequest,
      applyAiImageDataUrlForTest: applyAiImageDataUrl,
      setProjectStorageFailureForTest: (enabled) => {
        state.forceProjectStorageFailureForTest = Boolean(enabled);
        return state.forceProjectStorageFailureForTest;
      },
      resetProjectCacheForTest: () => {
        state.projectCache = [];
        state.projectCacheReady = false;
        state.projectPayloadCache.clear();
        return true;
      },
      normalizeProjectForTest: (project) => normalizeProject(project),
      hasCachedProjectPayloadForTest: (id) => state.projectPayloadCache.has(id),
      getImportChoiceLabels: () => {
        const labels = [];
        if (els.importCalibrateButton) labels.push((els.importCalibrateButton.querySelector("strong") || els.importCalibrateButton).textContent.trim());
        if (els.importDirectButton) labels.push((els.importDirectButton.querySelector("strong") || els.importDirectButton).textContent.trim());
        return labels;
      },
      replacePatternColor,
      replaceColorEverywhere,
      replaceSingleVisibleCell,
      setPatternCell,
      getActivePattern: () => state.beads.pattern,
      setSelectedCode: (code) => {
        state.beads.selectedCode = code;
        return state.beads.selectedCode;
      },
      setBrushSize: (size) => {
        state.beads.brushSize = clamp(size, 1, 10);
        return state.beads.brushSize;
      },
      setShapeSettings: (settings) => {
        state.beads.shapeType = settings.type || state.beads.shapeType;
        state.beads.shapeStyle = settings.style === "outline" ? "outline" : settings.style === "filled" ? "filled" : state.beads.shapeStyle;
        state.beads.shapeWidth = clamp(settings.width || state.beads.shapeWidth, 1, bounds.beadSize.max);
        state.beads.shapeHeight = clamp(settings.height || state.beads.shapeHeight, 1, bounds.beadSize.max);
        state.beads.shapeSides = clamp(settings.sides || state.beads.shapeSides, 3, 16);
        state.beads.shapeFont = settings.font || state.beads.shapeFont;
        state.beads.shapeText = settings.text != null ? String(settings.text) : state.beads.shapeText;
        return {
          type: state.beads.shapeType,
          style: state.beads.shapeStyle,
          width: state.beads.shapeWidth,
          height: state.beads.shapeHeight,
          sides: state.beads.shapeSides,
          font: state.beads.shapeFont,
          text: state.beads.shapeText
        };
      },
      getShapeSizeError: (type, width, height) => getShapeSizeError(type || state.beads.shapeType, width || state.beads.shapeWidth, height || state.beads.shapeHeight),
      getShapeMask: (settings = {}) => {
        const previous = {
          type: state.beads.shapeType,
          style: state.beads.shapeStyle,
          width: state.beads.shapeWidth,
          height: state.beads.shapeHeight,
          sides: state.beads.shapeSides,
          font: state.beads.shapeFont,
          text: state.beads.shapeText
        };
        state.beads.shapeType = settings.type || previous.type;
        state.beads.shapeStyle = settings.style === "outline" ? "outline" : settings.style === "filled" ? "filled" : previous.style;
        state.beads.shapeWidth = clamp(settings.width || previous.width, 1, bounds.beadSize.max);
        state.beads.shapeHeight = clamp(settings.height || previous.height, 1, bounds.beadSize.max);
        state.beads.shapeSides = clamp(settings.sides || previous.sides, 3, 16);
        state.beads.shapeFont = settings.font || previous.font;
        state.beads.shapeText = settings.text != null ? String(settings.text) : previous.text;
        const type = state.beads.shapeType;
        const width = state.beads.shapeWidth;
        const height = state.beads.shapeHeight;
        const textMask = type === "text" ? makeTextShapeMask(width, height, state.beads.shapeText) : null;
        const mask = buildShapeMask(type, width, height, textMask).map((row) => row.slice());
        state.beads.shapeType = previous.type;
        state.beads.shapeStyle = previous.style;
        state.beads.shapeWidth = previous.width;
        state.beads.shapeHeight = previous.height;
        state.beads.shapeSides = previous.sides;
        state.beads.shapeFont = previous.font;
        state.beads.shapeText = previous.text;
        return mask;
      },
      setSelectedCells: (cells) => {
        state.beads.selectedCells = Array.isArray(cells) ? cells : [];
        return state.beads.selectedCells.length;
      },
      cloneCells,
      applyRectEdit,
      clearActiveLayerCells,
      floodFillFromCell,
      paintBrushCell,
      applyOutlineEdit,
      deleteColorEverywhere,
      selectBeadColor,
      drawMaterialPreview,
      makeStyleMaterialContactSheet,
      getStyleBackgroundMaterials: () => styleBackgroundMaterials.map((material) => ({
        value: material.value,
        label: material.label,
        group: material.group,
        texture: material.texture
      })),
      drawShapeAtCell,
      saveSelectionAsShapeTemplate,
      deleteSelectedShapeTemplate,
      getShapeTemplates: () => getShapeTemplateLibrary().map((template) => ({
        id: template.id,
        name: template.name,
        width: template.width,
        height: template.height,
        filled: template.cells.reduce((sum, row) => sum + row.filter(Boolean).length, 0)
      })),
      selectShapeTemplate: (id) => {
        state.beads.shapeTemplateSelectedId = id || "";
        const template = getSelectedShapeTemplate();
        if (!template) return null;
        state.beads.shapeType = "template";
        state.beads.shapeWidth = template.width;
        state.beads.shapeHeight = template.height;
        return template;
      },
      makeStickerItemFromFile,
      makeLayerCellsFromProjectPayload,
      placeSourceCellsIntoCurrentPattern,
      importProjectAsLayer,
      importLayerFile,
      applySelectionEdit,
      copySelection,
      beginFloatingSelectionMove,
      commitFloatingSelection,
      moveFloatingSelectionTo: (row, col) => {
        if (!state.beads.floatingSelection) return false;
        const target = clampFloatingTarget(row, col, state.beads.floatingSelection);
        state.beads.floatingSelection.targetRow = target.row;
        state.beads.floatingSelection.targetCol = target.col;
        return true;
      },
      pasteClipboard,
      mirrorSelection,
      rotateSelection,
      addGuideLineAtCell,
      setGuideLines: (guides) => {
        state.beads.guideLines = Array.isArray(guides)
          ? guides.map((guide, index) => normalizeGuideLine(guide, index))
          : [];
        renderGuideLineSelect();
        render();
        return state.beads.guideLines.length;
      },
      deleteSelectedGuideLine,
      getGuideLines: () => state.beads.guideLines,
      selectGuideLine: (id) => {
        state.beads.guideSelectedId = id || "";
        renderGuideLineSelect();
        render();
        return state.beads.guideSelectedId;
      },
      cellsFromLasso,
      pointInPolygon,
      addLayer,
      duplicateActiveLayer,
      mergeVisibleLayers,
      groupLayers,
      mirrorActiveLayer,
      mirrorFullCanvas,
      expandCanvas,
      ensurePatternForCanvasEdit,
      autoCropCanvas,
      cropCanvasToSelection,
      scaleCanvasByFactor,
      getLayers: () => state.beads.layers,
      makeBeadExportCanvas,
      makeRegionPreviewCanvas,
      makeRegionCanvas,
      makeRegionsExportCanvasByIds,
      makeRegionExportCanvasesByIds,
      makeExportRegionsFromGuides: (guides) => makeExportRegionsFromGuides(state.beads.pattern, guides),
      generateExportRegionsFromGuides,
      setExportRegions: (regions) => {
        state.beads.exportSettings.regionEnabled = true;
        state.beads.exportRegions = normalizeExportRegions(regions, state.beads.pattern);
        state.beads.exportSettings.regionSelectedId = state.beads.exportRegions[0] ? state.beads.exportRegions[0].id : "";
        return state.beads.exportRegions.length;
      },
      getExportRegions: () => getExportRegions(state.beads.pattern),
      makeAlbumExportCanvas,
      makeBeadPixelCanvas,
      makeProjectPayload,
      ensureBlankPatternForSave,
      applyProjectPayload,
      getProjects,
      setProjects: (projects) => setProjects(projects, { remote: false }),
      nearestBeadColor,
      paletteSize: beadPalette.length
    };
  }

  function init() {
    bindElements();
    exposeTestHooks();
    if (!els.previewCanvas) return;
    restoreChromeCollapseState();
    loadInventory();
    applySavedWatermarkSettings();
    registerOfflineApp();
    populatePaletteControls();
    populateMaterialBackgroundSelect();
    syncControls();
    wireEvents();
    setMode("pixel");
    showHome();
    syncProjectsFromRemote();
    syncSharedSettingsFromRemote();
  }

  function registerOfflineApp() {
    if (!("serviceWorker" in navigator)) return;
    if (!window.isSecureContext) {
      console.info("Q像素离线安装需要 HTTPS 或 localhost。");
      return;
    }
    navigator.serviceWorker.register("./sw.js")
      .then((registration) => registration.update())
      .catch((error) => {
        console.warn("Q像素离线缓存注册失败", error);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
