"""Converte o texto de "lei seca" de cada meta em referências ao vade mecum: [[id_da_lei, artigo_inicial, artigo_final], ...]."""
import re

LEIS = [  # (regex que identifica a lei no texto, id no vade mecum)
    (r'CF/88', 'cf'), (r'Decreto-Lei\s*200', 'dl200'), (r'Lei\s*9\.784', 'l9784'), (r'Lei\s*4\.717', 'l4717'),
    (r'\bCTN\b', 'ctn'), (r'C[óo]digo Civil', 'cc'), (r'Lei\s*8\.112', 'l8112'), (r'Lei\s*8\.429', 'l8429'),
    (r'Lei\s*14\.133', 'l14133'), (r'Decreto\s*9\.203', 'd9203'), (r'Lei\s*12\.527', 'l12527'), (r'Lei\s*13\.709', 'l13709'),
    (r'LC\s*95', 'lc95'), (r'RICD|Regimento Interno da C[âa]mara', 'ricd'), (r'Regimento Comum', 'rcomum'),
]
NUM = r'(\d+)[º°]?(?:-([A-Z]))?'

def lei_de(trecho):
    achados = [(m.start(), i) for r, i in LEIS for m in [re.search(r, trecho)] if m]
    return min(achados)[1] if achados else None

def artigos(trecho):
    t = re.sub(r'\([^)]*\)', ' ', trecho)  # tira comentários entre parênteses
    out = []
    for seg in re.split(r'\barts?\.', t)[1:]:
        seg = re.split(r'§|\bcaput\b|\bincisos?\b|;', seg)[0]
        for m in re.finditer(NUM + r'(?:\s+a\s+' + NUM + r')?', seg):
            a = int(m.group(1)); b = int(m.group(3)) if m.group(3) else a
            out.append((a, b))
    return out

def refs(texto):
    out, ultima = [], None
    for p in re.split(r';', texto or ''):
        lei = lei_de(p) or ultima
        if not lei: continue
        ultima = lei
        arts = artigos(p)
        if arts:
            for a, b in arts: out.append([lei, a, b])
        elif not any(o[0] == lei for o in out):
            out.append([lei, 0, 0])  # lei inteira
    # junta duplicados mantendo a ordem
    vistos, res = set(), []
    for o in out:
        k = tuple(o)
        if k not in vistos: vistos.add(k); res.append(o)
    return res

if __name__ == '__main__':
    import json, pathlib
    d = json.load(open(pathlib.Path(__file__).resolve().parent / 'cronograma.json', encoding='utf-8'))
    vis = set()
    for s in d['semanas']:
        for m in s['metas']:
            t = m.get('lei_seca')
            if t and t not in vis:
                vis.add(t); print(t[:110], '->', refs(t))
