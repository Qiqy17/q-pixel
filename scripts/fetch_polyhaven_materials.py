#!/usr/bin/env python3
"""Fetch the curated CC0 1K diffuse maps and regenerate the offline catalog."""
import concurrent.futures
import hashlib
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'web/assets/materials/polyhaven'
CATALOG = ROOT / 'web/studio/scene-material-library.js'
USER_AGENT = 'QPixelOfflineMaterialLibrary/1.0 (+https://github.com/q-pixel)'
GROUPS = {
    '织物与皮革': [
        ('velour_velvet','丝绒'),('denim_fabric','靛蓝牛仔'),('cotton_jersey','针织棉'),
        ('gingham_check','格纹布'),('ribbed_corduroy','灯芯绒'),('terry_cloth','毛圈布'),
        ('wool_boucle','圈圈羊毛'),('waffle_pique_cotton','华夫棉'),('brown_leather','棕色皮革'),
        ('leather_white','白色皮革'),('hessian_230','黄麻布'),('crepe_satin','缎面绉布')],
    '木材与木纹': [
        ('plywood','胶合板'),('oak_veneer_01','橡木贴面'),('wood_table_001','原木桌面'),
        ('wood_table_worn','旧木桌'),('wood_floor','木地板'),('bark_brown_02','树皮'),
        ('rough_wood','粗木板'),('dark_wood','深色木纹'),('herringbone_parquet','人字拼木'),
        ('wood_planks_grey','灰色木板')],
    '石材与矿物': [
        ('granite_tile','花岗岩'),('stone_tiles_02','板岩砖'),('sandstone_cracks','砂岩裂纹'),
        ('rock_01','灰色岩面'),('mossy_rock','苔藓岩'),('rock_06','层理石'),
        ('floor_tiles_02','浅色石砖'),('coast_sand_rocks_02','海岸岩石')],
    '水泥与墙面': [
        ('concrete_floor_worn_001','旧水泥地'),('beige_wall_001','米色墙面'),
        ('painted_plaster_wall','刷漆石膏'),('concrete_layers_02','层叠石膏'),
        ('grey_plaster','灰色石膏'),('gravel_embedded_concrete','露石混凝土'),
        ('granular_concrete','颗粒水泥'),('brushed_concrete','拉毛水泥')],
    '陶瓷与拼砖': [
        ('tiled_floor_001','光釉地砖'),('long_white_tiles','白色长砖'),
        ('terracotta_floor_tiles','陶土地砖'),('marble_mosaic_tiles','马赛克'),
        ('terrazzo_tiles','水磨石砖'),('patterned_terracotta_tiling','花纹陶砖')],
    '金属与工业': [
        ('metal_plate','防滑钢板'),('blue_metal_plate','蓝色金属'),
        ('rusty_metal_sheet','锈蚀钢板'),('corrugated_iron','波纹铁皮'),
        ('metal_grate_rusty','金属网格'),('green_metal_rust','绿漆锈面')],
    '砖墙与铺地': [
        ('red_brick','红砖墙'),('medieval_blocks_03','古石砌块'),
        ('brick_wall_001','旧砖墙'),('japanese_stone_wall','日式石墙'),
        ('hexagonal_concrete_paving','六角铺地'),('brick_floor','人字砖地')],
    '自然地表': [
        ('forest_ground_04','森林土壤'),('snow_02','新雪'),('aerial_beach_01','海滩沙地'),
        ('forest_leaves_02','落叶地表'),('ganges_river_pebbles','河滩鹅卵石'),('leafy_grass','青草地')],
    '纸与其他': [('decrepit_wallpaper','旧壁纸'),('polystyrene','白色泡沫')],
}
COLORS = {
    '织物与皮革': ['#d4c6b4','#a38e7b','#f3e8da'],
    '木材与木纹': ['#b88d62','#795d43','#e6c29a'],
    '石材与矿物': ['#b9bab5','#737b79','#e1e1dc'],
    '水泥与墙面': ['#c9c8c1','#8f9691','#e6e7df'],
    '陶瓷与拼砖': ['#d4c9b9','#a6a295','#faf4e9'],
    '金属与工业': ['#949b9d','#566167','#d5dbda'],
    '砖墙与铺地': ['#ae8370','#785c51','#d2b49d'],
    '自然地表': ['#8f9478','#586854','#c3bc9c'],
    '纸与其他': ['#dbd3c4','#9f9b90','#f4efe6'],
}
TEXTURES = {'织物与皮革':'fabric','木材与木纹':'wood','石材与矿物':'stone',
            '水泥与墙面':'concrete','陶瓷与拼砖':'stone','金属与工业':'metal',
            '砖墙与铺地':'stone','自然地表':'stone','纸与其他':'paper'}

def get_json(url):
    return json.loads(subprocess.check_output([
        'curl','-LfsS','--retry','6','--retry-all-errors','--retry-delay','1','-H','User-Agent: ' + USER_AGENT,url
    ]))

def fetch(entry):
    group, asset_id, label = entry
    destination = OUTPUT / ('ph_' + asset_id + '.jpg')
    if destination.exists():
        data = destination.read_bytes()
    else:
        versions = get_json('https://api.polyhaven.com/files/' + asset_id)
        try:
            remote = versions['Diffuse']['1k']['jpg']
        except KeyError as error:
            raise ValueError(f'{asset_id}: no 1K diffuse JPG; available {list(versions)}') from error
        temporary = destination.with_suffix('.part')
        subprocess.run(['curl','-LfsS','--retry','6','--retry-all-errors','--retry-delay','1','-H','User-Agent: ' + USER_AGENT,
                        '-o',str(temporary),remote['url']],check=True)
        data = temporary.read_bytes()
        if hashlib.md5(data).hexdigest() != remote['md5']:
            raise ValueError('MD5 mismatch: ' + asset_id)
        temporary.rename(destination)
    return {'id':'ph-' + asset_id.replace('_','-'), 'label':label, 'group':group,
            'file':'./assets/materials/polyhaven/' + destination.name,
            'source':'https://polyhaven.com/a/' + asset_id, 'license':'CC0',
            'sha256':hashlib.sha256(data).hexdigest(), 'bytes':len(data),
            'texture':TEXTURES[group], 'colors':COLORS[group]}

def main():
    entries = [(group, asset_id, label) for group, choices in GROUPS.items() for asset_id,label in choices]
    assert len(entries) == 64 and len({item[1] for item in entries}) == 64
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        items = list(pool.map(fetch, entries))
    payload = json.dumps(items, ensure_ascii=False, indent=2)
    CATALOG.write_text('(function (root, factory) {\n  const library = factory();\n  if (typeof module === "object" && module.exports) module.exports = library;\n  if (root) root.QPixelMaterialLibrary = library;\n})(typeof window !== "undefined" ? window : globalThis, function () {\n  "use strict";\n  return Object.freeze({ items: Object.freeze(' + payload + ') });\n});\n', encoding='utf-8')
    (OUTPUT / 'manifest.json').write_text(payload + '\n', encoding='utf-8')
    print(f'{len(items)} textures; {sum(item["bytes"] for item in items)/1048576:.1f} MiB')

if __name__ == '__main__':
    main()
