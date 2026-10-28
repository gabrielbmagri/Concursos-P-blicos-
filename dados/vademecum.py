#!/usr/bin/env python3
"""Gera painel/vademecum.json a partir dos textos consolidados do portal da Câmara dos Deputados
(www2.camara.leg.br/legin). Só copia o texto da lei; nada é resumido ou explicado.

Uso:
  python3 dados/vademecum.py            # baixa (cache em dados/vademecum/) e gera o json
  python3 dados/vademecum.py --refazer  # ignora o cache
Para atualizar uma lei basta apagar o arquivo dela em dados/vademecum/ (ou usar --refazer).
"""
import re, html, json, sys, subprocess, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

AQUI = pathlib.Path(__file__).resolve().parent
CACHE = AQUI / "vademecum"
SAIDA = AQUI.parent / "painel" / "vademecum.json"
BASE = "https://www2.camara.leg.br/legin/"

# id, sigla, nome, caminho no portal (sem extensão), modo de leitura do html
LEIS = [
 ("cf", "CF/88", "Constituição da República Federativa do Brasil de 1988", "fed/consti/1988/constituicao-1988-5-outubro-1988-322142-normaatualizada-pl", "p"),
 ("ricd", "RICD", "Regimento Interno da Câmara dos Deputados (Resolução nº 17, de 1989)", "fed/rescad/1989/resolucaodacamaradosdeputados-17-21-setembro-1989-320110-normaatualizada-pl", "p"),
 ("rcomum", "Regimento Comum", "Regimento Comum do Congresso Nacional (Resolução nº 1, de 1970-CN)", "fed/rescon/1970-1979/resolucao-1-11-agosto-1970-497934-republicacaoatualizada-171822-pl", "br"),
 ("l8112", "Lei 8.112/1990", "Lei nº 8.112, de 11 de dezembro de 1990", "fed/lei/1990/lei-8112-11-dezembro-1990-322161-normaatualizada-pl", "p"),
 ("l9784", "Lei 9.784/1999", "Lei nº 9.784, de 29 de janeiro de 1999", "fed/lei/1999/lei-9784-29-janeiro-1999-322239-normaatualizada-pl", "p"),
 ("l14133", "Lei 14.133/2021", "Lei nº 14.133, de 1º de abril de 2021", "pdf:fontes/l14133.pdf", "txt"),
 ("l8429", "Lei 8.429/1992", "Lei nº 8.429, de 2 de junho de 1992", "fed/lei/1992/lei-8429-2-junho-1992-357452-normaatualizada-pl", "p"),
 ("l4717", "Lei 4.717/1965", "Lei nº 4.717, de 29 de junho de 1965", "fed/lei/1960-1969/lei-4717-29-junho-1965-377818-normaatualizada-pl", "p"),
 ("dl200", "Decreto-Lei 200/1967", "Decreto-Lei nº 200, de 25 de fevereiro de 1967", "fed/declei/1960-1969/decreto-lei-200-25-fevereiro-1967-376033-normaatualizada-pe", "p"),
 ("d9203", "Decreto 9.203/2017", "Decreto nº 9.203, de 22 de novembro de 2017", "fed/decret/2017/decreto-9203-22-novembro-2017-785782-normaatualizada-pe", "p"),
 ("l12527", "Lei 12.527/2011", "Lei nº 12.527, de 18 de novembro de 2011", "fed/lei/2011/lei-12527-18-novembro-2011-611802-normaatualizada-pl", "p"),
 ("l13709", "Lei 13.709/2018", "Lei nº 13.709, de 14 de agosto de 2018", "fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl", "p"),
 ("lc95", "LC 95/1998", "Lei Complementar nº 95, de 26 de fevereiro de 1998", "fed/leicom/1998/leicomplementar-95-26-fevereiro-1998-363948-normaatualizada-pl", "p"),
 ("ctn", "CTN", "Código Tributário Nacional (Lei nº 5.172, de 25 de outubro de 1966)", "fed/lei/1960-1969/lei-5172-25-outubro-1966-358971-normaatualizada-pl", "p"),
 ("cc", "Código Civil", "Código Civil (Lei nº 10.406, de 10 de janeiro de 2002)", "fed/lei/2002/lei-10406-10-janeiro-2002-432893-normaatualizada-pl", "p"),
]
EMENTA = {"l14133": "Lei de Licitações e Contratos Administrativos."}
FIM = {"l14133": r'^Bras[íi]lia, 1º de abril de 2021'}
INICIO = {"ricd": r'^REGIMENTO INTERNO DA C[ÂA]MARA'}
# leis grandes em que só um trecho é cobrado (o resto não entra no vade mecum)
SO_ARTIGOS = {"cc": {"43"}}

HEAD = re.compile(r'^(PARTE|LIVRO|T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|SUBSE[ÇC][ÃA]O|DISPOSI[ÇC][ÕO]ES|ANEXO|ATO DAS)\b', re.I)
NUMONLY = re.compile(r'^(PARTE|LIVRO|T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|SUBSE[ÇC][ÃA]O)\s+([IVXLCDM]+|\d+|[ÚU]NIC[OA]|GERAL|ESPECIAL)(-[A-Z])?\s*$', re.I)
ART = re.compile(r'^Art\.?\s*(\d+(?:\.\d+)*)\s*(?:[ºo°]|\.)?\s*(?:-\s*([A-Z]{1,2})\b)?')
NIVEL = [("PARTE", 0), ("LIVRO", 1), ("TÍTULO", 2), ("TITULO", 2), ("CAPÍTULO", 3), ("CAPITULO", 3), ("SEÇÃO", 4), ("SECAO", 4), ("SUBSEÇÃO", 5), ("SUBSECAO", 5), ("ATO DAS", 0), ("ANEXO", 0), ("DISPOSI", 3)]
RUIDO = re.compile(r'^(C[ÂA]MARA DOS DEPUTADOS|Centro de Documenta|Veja tamb|Portal da C|Ir ao conte|Voc[êe] est[áa] usando|Este texto n[ãa]o substitui|Publica[çc][ãa]o:|Texto consolidado)', re.I)


def baixar(id_, caminho, refazer):
    CACHE.mkdir(exist_ok=True)
    if caminho.startswith("pdf:"):  # texto consolidado enviado pelo usuário (impressão do Planalto)
        arq = CACHE / f"{id_}.txt"
        if refazer or not arq.exists():
            subprocess.run(["pdftotext", "-layout", str(AQUI / caminho[4:]), str(arq)], check=True)
        return arq
    arq = CACHE / f"{id_}.html"
    if arq.exists() and not refazer:
        return arq
    r = subprocess.run(["curl", "-sS", "-m", "120", "-A", "Mozilla/5.0", "-L", "-o", str(arq), "-w", "%{http_code}", BASE + caminho + ".html"], capture_output=True, text=True)
    if r.stdout.strip() != "200":
        arq.unlink(missing_ok=True)
        raise SystemExit(f"{id_}: não consegui baixar ({r.stdout.strip()} {r.stderr.strip()})")
    return arq


RUIDO_PDF = re.compile(r'^(\d{2}/\d{2}/\d{4}, \d{2}:\d{2}\s+\S+|https?://\S+\s+\d+/\d+|\*)$')
NOVO = re.compile(r'^(Art\.|Arts\.|§|Parágrafo único|[IVXLCDM]+\s*[-–]|[a-z]\)|\d+\.\s|TÍTULO|CAPÍTULO|SEÇÃO|SUBSEÇÃO|LIVRO|PARTE|“|\(|Brasília|O PRESIDENTE|Faço saber|Seção|Subseção|Capítulo|Título)')
def linhas_txt(arq):
    out = []
    for ln in open(arq, errors="ignore").read().split("\n"):
        t = re.sub(r'[\s\u00a0]+', ' ', ln).strip()
        t = re.sub(r'\)\s*Vig[êe]ncia$', ')', t)
        if not t or RUIDO_PDF.match(t) or t in ('(Regulamento)', 'Vigência', 'Regulamento', '(Regulamento) Vigência'): continue
        centro = len(ln) - len(ln.lstrip()) > 25
        if out and not centro and not out[-1][1] and not NOVO.match(t) and not re.match(r'^(TÍTULO|CAPÍTULO|SEÇÃO)', out[-1][0]):
            prev = out[-1][0]
            out[-1] = (prev + ("" if prev.endswith("-") else " ") + t, False)
        else:
            out.append((t, centro))
    return out

def linhas(arq, modo):
    if modo == "txt": return linhas_txt(arq)
    h = open(arq, errors="ignore").read()
    h = re.sub(r'<(script|style).*?</\1>', '', h, flags=re.S | re.I)
    out = []
    if modo == "br":
        h = re.sub(r'<sup.*?</sup>', '', h, flags=re.S | re.I)
        h = re.sub(r'<center[^>]*>(.*?)</center>', lambda m: '\n§C§' + re.sub(r'<br\s*/?>', ' ', m.group(1)) + '\n', h, flags=re.S | re.I)
        h = re.sub(r'<br\s*/?>|</p>|<p[^>]*>|</div>|<div[^>]*>', '\n', h, flags=re.I)
        h = html.unescape(re.sub(r'<[^>]+>', '', h))
        for ln in h.split('\n'):
            c = ln.startswith('§C§'); ln = ln.replace('§C§', '')
            t = re.sub(r'[\s ]+', ' ', ln).strip()
            if t: out.append((t, c))
        return out
    for m in re.finditer(r'<p([^>]*)>(.*?)</p>', h, flags=re.S | re.I):
        body = re.sub(r'<br\s*/?>', ' ', m.group(2), flags=re.I)
        t = re.sub(r'[\s ]+', ' ', html.unescape(re.sub(r'<[^>]+>', '', body))).strip()
        if t: out.append((t, 'center' in m.group(1).lower()))
    return out


def nivel(t):
    u = t.upper()
    for k, v in NIVEL:
        if u.startswith(k): return v
    return 3


def interpretar(arq, modo, so_artigos=None, inicio=None, fim=None):
    L = linhas(arq, modo)
    if fim:
        for i, (t, c) in enumerate(L):
            if re.match(fim, t): L = L[:i]; break
    # assinatura do final do texto: corta só se for a última e estiver perto do fim
    idx = [i for i, (t, c) in enumerate(L) if re.match(r'^Bras[íi]lia,', t)]
    if idx and len(L) - idx[-1] <= 15: L = L[:idx[-1]]
    hmerge = None
    pre, itens, cur, sec, vistos, ligado, primeiras = [], [], None, "", set(), inicio is None, {}
    for t, c in L:
        if not ligado:
            if re.match(inicio, t, re.I): ligado = True
            else: continue
        if RUIDO.match(t) and not itens: continue
        if re.match(r'^_{8,}$', t) and any(i[0] == "a" for i in itens): break
        if hmerge is not None and c and not ART.match(t) and not HEAD.match(t) and len(t) < 170:
            if t.startswith("("): itens.append(["x", t])
            else:
                itens[hmerge][1] += (" — " if " — " not in itens[hmerge][1] else " ") + t; itens[hmerge][3] = False
            continue
        hmerge = None
        m = ART.match(t)
        if m:
            num = m.group(1).replace('.', ''); suf = (m.group(2) or '').upper()
            k = num + ('-' + suf if suf else '')
            if itens and itens[-1][0] == "a" and itens[-1][1] == sec + k:  # mesma numeração em seguida: o primeiro é o texto antigo (riscado no original), substituído pelo segundo
                vistos.discard(sec + k); itens.pop()
            if k in vistos and not sec: sec = "adct-" if "cf" in str(arq) else "t-"
            k = sec + k
            while k in vistos: k += '~'
            vistos.add(k); primeiras[k.lstrip('~')] = t
            cur = ["a", k, [t]]; itens.append(cur); continue
        if itens and itens[-1][0] == "h" and itens[-1][3] and not ART.match(t) and len(t) < 170 and not (HEAD.match(t) and NUMONLY.match(t)):
            itens[-1][1] += ' — ' + t; itens[-1][3] = False; continue
        if HEAD.match(t) and (c or len(t) < 120):
            cur = None
            if re.match(r'^ATO DAS DISPOSI', t, re.I): sec = "adct-"
            itens.append(["h", t, nivel(t), bool(NUMONLY.match(t))]); hmerge = len(itens) - 1; continue
        if c and cur is not None and len(t) < 120 and not t.startswith("(") and not re.search(r'[.;:]$', t) and modo != "txt":
            cur = None; itens.append(["h", t, 4, False]); hmerge = len(itens) - 1; continue
        if cur is not None: cur[2].append(t)
        elif not itens: pre.append(t)
        else: itens.append(["x", t])
    itens = [i[:3] if i[0] == "h" else i for i in itens]
    if so_artigos:
        itens = [i for i in itens if i[0] == "a" and i[1] in so_artigos]
    return pre, itens


def trechos():
    """Artigos que as metas realmente citam em 'lei seca': {lei: (tudo, [(ini, fim), ...])}."""
    from leiseca import refs
    crono = json.load(open(AQUI / "cronograma.json", encoding="utf-8"))
    uso = {}
    for s_ in crono["semanas"]:
        for m in s_["metas"]:
            if m.get("legado") and not m.get("fora_do_plano"): continue  # metas antigas de Português, já substituídas
            for lei, a, b in refs(m.get("lei_seca")):
                tudo, rs = uso.setdefault(lei, [False, []])
                if a == 0: uso[lei][0] = True
                else: rs.append((a, b))
    return uso


def filtrar(itens, tudo, rs):
    if tudo: return itens
    def cabe(k):
        if re.match(r'^(adct-|t-)', k): return False
        n = int(re.match(r'\d+', k).group())
        return any(a <= n <= b for a, b in rs)
    keep = [i[0] == "a" and cabe(i[1]) for i in itens]
    for j, i in enumerate(itens):
        if i[0] == "h":
            for jj in range(j + 1, len(itens)):
                if itens[jj][0] == "h" and itens[jj][2] <= i[2]: break
                if keep[jj]: keep[j] = True; break
    out = []
    for j, i in enumerate(itens):
        if i[0] == "x": keep[j] = bool(out) and keep[j - 1]
        if keep[j]: out.append(i)
    return out


def main():
    refazer = "--refazer" in sys.argv
    leis = []
    uso = trechos()
    for id_, sigla, nome, caminho, modo in LEIS:
        if not caminho:
            print(f"{id_}: sem fonte configurada, ficou de fora"); continue
        arq = baixar(id_, caminho, refazer)
        pre, itens = interpretar(arq, modo, SO_ARTIGOS.get(id_), INICIO.get(id_), FIM.get(id_))
        ementa = EMENTA.get(id_) or " ".join(p for p in pre if not RUIDO.match(p) and not re.match(r'^(LEI|DECRETO|RESOLU|CONSTITUI|PREÂMBULO)', p, re.I))[:600]
        total = sum(1 for i in itens if i[0] == "a")
        if id_ not in uso: print(f"{id_}: nenhuma meta cita esta lei, ficou de fora"); continue
        itens = filtrar(itens, *uso[id_])
        n = sum(1 for i in itens if i[0] == "a")
        print(f"{id_}: {n} de {total} artigos ({sum(1 for i in itens if i[0]=='h')} títulos)")
        leis.append({"id": id_, "sigla": sigla, "nome": nome, "ementa": ementa, "itens": itens})
    SAIDA.write_text(json.dumps({"leis": leis}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("gravado", SAIDA, round(SAIDA.stat().st_size / 1024), "KB")

if __name__ == "__main__":
    main()
