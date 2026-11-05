"""Comprobacion minima de accesibilidad de un PDF (sin Java). Uso: python -I check_pdf.py archivo.pdf [...]
Devuelve codigo 1 si falla alguna comprobacion. NO sustituye a veraPDF: no valida PDF/UA-1, solo lo basico que un validador pide."""
import sys, re
import pypdf
from pypdf.generic import IndirectObject


def deref(o):
    return o.get_object() if isinstance(o, IndirectObject) else o


def walk(node, out, depth=0):
    node = deref(node)
    if depth > 200 or node is None:
        return
    if isinstance(node, list):
        for k in node:
            walk(k, out, depth + 1)
        return
    if not hasattr(node, 'get'):
        return
    s = node.get('/S')
    if s is not None:
        out.append((str(s), node))
    k = node.get('/K')
    if k is not None:
        walk(k, out, depth + 1)


def check(path):
    r = pypdf.PdfReader(path)
    root = r.trailer['/Root']
    res = {}
    res['paginas'] = len(r.pages)
    res['MarkInfo/Marked'] = bool(deref(root.get('/MarkInfo', {})).get('/Marked', False))
    res['StructTreeRoot'] = '/StructTreeRoot' in root
    res['Lang'] = str(root.get('/Lang', '')) or False
    vp = deref(root.get('/ViewerPreferences', {}))
    res['DisplayDocTitle'] = bool(vp.get('/DisplayDocTitle', False))
    res['Title(Info)'] = (r.metadata.title if r.metadata else None) or False
    xmp = r.xmp_metadata
    raw = ''
    try:
        m = deref(root['/Metadata'])
        raw = m.get_data().decode('utf-8', 'replace')
    except Exception:
        pass
    res['XMP pdfuaid:part'] = (re.search(r'pdfuaid:part[>="\s]+(\d)', raw).group(1) if re.search(r'pdfuaid:part[>="\s]+(\d)', raw) else False)
    res['XMP dc:title'] = 'dc:title' in raw
    # fuentes
    fonts, noemb = set(), set()
    for p in r.pages:
        res_ = deref(p.get('/Resources', {}))
        for name, f in deref(res_.get('/Font', {})).items():
            f = deref(f)
            base = str(f.get('/BaseFont'))
            fonts.add(base)
            desc = f.get('/FontDescriptor')
            if f.get('/Subtype') == '/Type0':
                d = deref(deref(f['/DescendantFonts'])[0])
                desc = d.get('/FontDescriptor')
            d = deref(desc) if desc is not None else None
            if d is None or not any(k in d for k in ('/FontFile', '/FontFile2', '/FontFile3')):
                noemb.add(base)
    res['fuentes'] = sorted(fonts)
    res['fuentes sin incrustar'] = sorted(noemb)
    # estructura
    elems = []
    st = deref(root.get('/StructTreeRoot'))
    if st is not None:
        walk(st.get('/K'), elems)
    tipos = {}
    for t, _ in elems:
        tipos[t] = tipos.get(t, 0) + 1
    res['elementos'] = tipos
    figs = [n for t, n in elems if t == '/Figure']
    res['Figure sin /Alt'] = sum(1 for n in figs if not n.get('/Alt'))
    res['TH'] = tipos.get('/TH', 0)
    heads = [int(t[2]) for t, _ in elems if re.fullmatch(r'/H[1-6]', t)]
    res['saltos de encabezado'] = sum(1 for a, b in zip(heads, heads[1:]) if b > a + 1) + (1 if heads and heads[0] != 1 else 0)
    # tabs / StructParents
    res['Tabs=S'] = all(str(deref(p).get('/Tabs', '')) == '/S' for p in r.pages)
    ok_basic = all([res['MarkInfo/Marked'], res['StructTreeRoot'], res['Lang'], res['DisplayDocTitle'], res['Title(Info)'], not res['fuentes sin incrustar'], res['Figure sin /Alt'] == 0])
    res['BASICO_OK'] = ok_basic
    res['declara PDF/UA-1'] = res['XMP pdfuaid:part'] == '1'
    return res


code = 0
for p in sys.argv[1:]:
    res = check(p)
    print(p)
    for k, v in res.items():
        print(f'  {k}: {v}')
    if not res['BASICO_OK']:
        code = 1
sys.exit(code)
