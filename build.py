#!/usr/bin/env python3
"""Build the site from src/ + content/ into dist/.

    python3 build.py

Outputs
  dist/index.html    standalone page (open in a browser or deploy to any static host)
  dist/preview.html  same page without the <html>/<head> wrapper, used for the Claude artifact preview
  dist/img/          copied from assets/img/
"""
import html, json, re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC, CONTENT, ASSETS, DIST = ROOT / "src", ROOT / "content", ROOT / "assets", ROOT / "dist"

# content file -> key the app reads (DATA.<key>)
CONTENT_FILES = {
    "site": "site.json",
    "profile": "profile.json",
    "projects": "case-studies.json",
    "articles": "articles.json",
    "career": "career.json",
    "pillars": "leadership-pillars.json",
    "creds": "credentials.json",
    "photos": "photo-stories.json",
}
SAFE_ID = re.compile(r"^[a-z0-9][a-z0-9_~-]*$")


def load_content():
    data, errors = {}, []
    for key, name in CONTENT_FILES.items():
        path = CONTENT / name
        try:
            data[key] = json.loads(path.read_text(encoding="utf-8"))
        except FileNotFoundError:
            errors.append(f"{name}: file is missing")
        except json.JSONDecodeError as e:
            errors.append(f"{name}: invalid JSON at line {e.lineno}, column {e.colno} ({e.msg})")
    if errors:
        return data, errors
    for key in ("projects", "articles", "career", "photos", "pillars", "creds"):
        seen = set()
        for i, item in enumerate(data[key]):
            iid = item.get("id")
            if not iid:
                errors.append(f"{CONTENT_FILES[key]}: item {i + 1} has no \"id\"")
            elif not SAFE_ID.match(iid):
                errors.append(f"{CONTENT_FILES[key]}: id \"{iid}\" must use lowercase letters, digits and hyphens only")
            elif iid in seen:
                errors.append(f"{CONTENT_FILES[key]}: id \"{iid}\" is used twice")
            seen.add(iid)
    for p in data["photos"]:
        url = p.get("imageUrl")
        if url and not url.startswith(("http", "data:")) and not (ASSETS / url.lstrip("/")).exists():
            errors.append(f"photo-stories.json: \"{p['id']}\" points to {url}, which is not in assets/")
    return data, errors


def main():
    data, errors = load_content()
    if errors:
        print("Build stopped. Fix these content problems:\n  - " + "\n  - ".join(errors))
        sys.exit(1)

    site = data["site"]["meta"]
    head = (SRC / "head.html").read_text(encoding="utf-8")
    head = head.replace("{{title}}", html.escape(site["title"])).replace("{{description}}", html.escape(site["description"]))
    css = (SRC / "styles.css").read_text(encoding="utf-8")
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    app = (SRC / "app.js").read_text(encoding="utf-8")
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")

    styles_and_body = (f"<style>\n{css}</style>\n\n{layout}\n"
                       f"<script>\nconst DATA = {payload};\n</script>\n<script>\n{app}</script>\n")
    page = f"{head}\n{styles_and_body}"

    if DIST.exists():
        shutil.rmtree(DIST)
    (DIST / "img").mkdir(parents=True)
    for f in (ASSETS / "img").iterdir():
        if f.is_file():
            shutil.copy2(f, DIST / "img" / f.name)
    (DIST / "preview.html").write_text(page, encoding="utf-8")
    (DIST / "index.html").write_text(
        '<!doctype html>\n<html lang="en" data-theme="dark">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        f"{head}\n</head>\n<body>\n{styles_and_body}</body>\n</html>\n", encoding="utf-8")
    kb = (DIST / "index.html").stat().st_size // 1024
    print(f"Built dist/index.html and dist/preview.html ({kb} KB) from {len(CONTENT_FILES)} content files.")


if __name__ == "__main__":
    main()
