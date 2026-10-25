# Maakt public/bijbelreis/geo.json (ondergrond van de Bijbelreis) uit Natural Earth (publiek domein).
# Gebruik: python3 scripts/bijbelreis-geo.py <map met ne_10m_land, ne_10m_rivers_lake_centerlines, ne_10m_lakes,
#   ne_10m_geography_regions_polys, ne_50m_land en countries50 (.geojson)> [uitvoer]
# Bron: https://github.com/nvkelso/natural-earth-vector (map geojson/).
import json
from shapely.geometry import shape, box, mapping
from shapely.ops import unary_union
import sys
D=(sys.argv[1] if len(sys.argv)>1 else 'data')+'/'
OUT=sys.argv[2] if len(sys.argv)>2 else 'public/bijbelreis/geo.json'
B=box(8,23.5,53,45.5)  # tot Rome, Malta en Macedonië (reizen van Paulus)
def rnd(g,n=3):
    def r(c):
        if isinstance(c[0],(int,float)): return [round(c[0],n),round(c[1],n)]
        return [r(x) for x in c]
    m=mapping(g); return {'type':m['type'],'coordinates':r(m['coordinates'])}
def feat(g,props={}): return {'type':'Feature','properties':props,'geometry':rnd(g)}
land=json.load(open(D+'ne_10m_land.geojson'))
gs=[shape(f['geometry']).intersection(B) for f in land['features']]
L=unary_union([g for g in gs if not g.is_empty]).simplify(0.008,preserve_topology=True)
rv=json.load(open(D+'ne_10m_rivers_lake_centerlines.geojson'))
keep={'Nile':'Nijl','Rosetta Branch':'Nijl','Damietta Branch':'Nijl','Euphrates':'Eufraat','Firat':'Eufraat','Al Furat':'Eufraat','Tigris':'Tigris','Dicle':'Tigris','Jordan':'Jordaan','Shatt al Arab':'Shatt al-Arab','Karkheh':'Karkheh','Kızılırmak':'Halys','Ceyhan':'Ceyhan'}
rivers=[]
for f in rv['features']:
    n=f['properties'].get('name')
    if n in keep:
        g=shape(f['geometry']).intersection(B)
        if g.is_empty: continue
        rivers.append(feat(g.simplify(0.008),{'n':keep[n],'r':f['properties'].get('scalerank')}))
lk=json.load(open(D+'ne_10m_lakes.geojson'))
lakes=[]
for f in lk['features']:
    n=f['properties'].get('name')
    if n in {'Sea of Galilee','Dead Sea','Lake Van','Lake Urmia','Lake Hammar','Lake Tuz','Great Bitter Lake','Lake Habbaniyah'}:
        g=shape(f['geometry']).intersection(B)
        if g.is_empty: continue
        lakes.append(feat(g.simplify(0.003),{'n':n}))
# fysieke regio's
rg=json.load(open(D+'ne_10m_geography_regions_polys.geojson'))
want={'Negev Desert':'woestijn','SYRIAN DESERT':'woestijn','Eastern Desert':'woestijn','WESTERN DESERT':'woestijn','LIBYAN DESERT':'woestijn','An Nafud Desert':'woestijn','SAHARA':'woestijn',
      'Lebanon Mts.':'berg','Taurus Mts.':'berg','ZAGROS MOUNTAINS':'berg','HEJAZ MTS.':'berg','CAUCASUS MTS.':'berg','ELBURZ MTS.':'berg','PONTIC MOUNTAINS':'berg','Lesser Caucasus':'berg','Tuwayq Mts.':'berg',
      'Nile Delta':'vruchtbaar','Mesopotamia':'vruchtbaar'}
regions=[]
for f in rg['features']:
    n=f['properties']['NAME']
    if n in want:
        g=shape(f['geometry']).intersection(B).intersection(L.buffer(0))
        if g.is_empty: continue
        regions.append(feat(g.simplify(0.02),{'n':n,'k':want[n]}))
# inzet: Europa + Midden-Oosten
l50=json.load(open(D+'ne_50m_land.geojson'))
IB=box(-12,27,60,63)
I=unary_union([shape(f['geometry']).intersection(IB) for f in l50['features'] if not shape(f['geometry']).intersection(IB).is_empty]).simplify(0.15,preserve_topology=True)
inset=feat(I)
inset['geometry']=rnd(I,2)
c=json.load(open(D+'countries50.geojson'))
nl=[f for f in c['features'] if f['properties'].get('ADM0_A3')=='NLD'][0]
g=shape(nl['geometry'])
polys=[p for p in (g.geoms if g.geom_type=='MultiPolygon' else [g]) if 3<p.centroid.x<8 and p.centroid.y>50]
nlsh=[[[round(x,3),round(y,3)] for x,y in p.simplify(0.01).exterior.coords] for p in sorted(polys,key=lambda p:-p.area) if p.area>0.005]
out={'land':feat(L),'rivers':rivers,'lakes':lakes,'regions':regions,'inset':inset,'nl':nlsh}
s=json.dumps(out,separators=(',',':'))
open(OUT,'w').write(s); print(len(s), [ (r['properties']['n']) for r in regions])
