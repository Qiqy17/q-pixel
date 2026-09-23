(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.QPixelPaletteRegistry = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const REGISTRY_VERSION = "palette-registry-1";

  function hexToRgb(hex) {
    const match = /^#?([0-9a-f]{6})$/i.exec(String(hex || ""));
    if (!match) return null;
    return { r: parseInt(match[1].slice(0, 2), 16), g: parseInt(match[1].slice(2, 4), 16), b: parseInt(match[1].slice(4, 6), 16) };
  }

  function normalizeColorEntry(entry) {
    if (Array.isArray(entry) && entry.length >= 3) return { code: String(entry[0]), name: String(entry[1] || entry[0]), hex: String(entry[2]).toUpperCase(), calibrated: false };
    if (entry && typeof entry === "object" && entry.code) {
      const rgb = entry.rgb || hexToRgb(entry.hex);
      return {
        code: String(entry.code),
        name: String(entry.name || entry.code),
        hex: String(entry.hex || "#000000").toUpperCase(),
        calibrated: entry.calibrated === true,
        rgb: rgb || undefined
      };
    }
    return null;
  }

  function createPalette(spec) {
    const source = spec && typeof spec === "object" ? spec : {};
    const colors = (Array.isArray(source.colors) ? source.colors : []).map(normalizeColorEntry).filter(Boolean);
    const byCode = new Map();
    colors.forEach((color) => {
      if (!byCode.has(color.code)) byCode.set(color.code, Object.assign({ rgb: hexToRgb(color.hex) }, color));
    });
    return Object.freeze({
      id: String(source.id || "palette"),
      brand: String(source.brand || source.id || "未命名品牌"),
      label: String(source.label || source.brand || "未命名色卡"),
      series: String(source.series || "标准"),
      beadDiameterMm: Number(source.beadDiameterMm || 5),
      paletteVersion: String(source.paletteVersion || "1"),
      registryVersion: REGISTRY_VERSION,
      calibrated: source.calibrated === true,
      source: String(source.source || ""),
      colorCount: colors.length,
      colors: Object.freeze(colors.slice()),
      colorOf: (code) => byCode.get(String(code)) || null,
      hasCode: (code) => byCode.has(String(code))
    });
  }

  const palettes = new Map();

  function register(spec) {
    const palette = createPalette(spec);
    palettes.set(palette.id, palette);
    return palette;
  }

  function get(id) { return palettes.get(String(id || "")) || null; }
  function list() { return Array.from(palettes.values()); }
  function defaultPalette() { return get("mard-221"); }

  // Mard 221 全色色板，来源：Vicold.Pindoudou / data/Mard.txt (Apache-2.0)。
  const MARD_221_COLORS = [
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

  register({ id: "mard-221", brand: "MARD", label: "MARD 221 全色", series: "标准拼豆", beadDiameterMm: 5, calibrated: false, source: "Vicold.Pindoudou / data/Mard.txt (Apache-2.0)", paletteVersion: "1", colors: MARD_221_COLORS });

  return Object.freeze({ REGISTRY_VERSION, register, get, list, defaultPalette, createPalette, hexToRgb });
});
