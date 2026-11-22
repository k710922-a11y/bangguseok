"""아재개그 백과 엑셀 → public/data/ajae-dict.json

사용: python3 scripts/ajae-xlsx-to-json.py 아재개그_넌센스퀴즈.xlsx
엑셀 '아재개그' 시트(4행 머리글: 번호·분류·질문·정답·풀이·출처)에 행을 추가한 뒤 다시 돌리면 된다.
"""
import json, sys
import openpyxl

src = sys.argv[1]
ws = openpyxl.load_workbook(src)["아재개그"]
out = []
for r in ws.iter_rows(min_row=5, values_only=True):
    if not r[2] or not r[3]:
        continue
    o = {"i": len(out) + 1, "c": (r[1] or "기타 상황형").strip(), "q": str(r[2]).strip(), "a": str(r[3]).strip()}
    if r[4]:
        o["e"] = str(r[4]).strip()
    if r[5]:
        o["s"] = str(r[5]).strip()
    out.append(o)
json.dump(out, open("public/data/ajae-dict.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(f"{len(out)}개 저장 → public/data/ajae-dict.json")
