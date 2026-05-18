#!/usr/bin/env python3
"""Render a HealthBytes weekly Markdown report to a styled HTML file."""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path


STYLE = """
:root {
  color-scheme: light;
  --ink: #1f2933;
  --muted: #667085;
  --line: #d9e2ec;
  --soft: #f5f7fa;
  --accent: #0f766e;
  --accent-soft: #e6fffb;
}
@page {
  size: Letter;
  margin: 20mm 17mm;
}
* {
  box-sizing: border-box;
}
body {
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
  font-size: 10.5pt;
  line-height: 1.48;
  margin: 0;
}
h1 {
  border-bottom: 2px solid var(--accent);
  color: #102a43;
  font-size: 25pt;
  line-height: 1.12;
  margin: 0 0 12px;
  padding-bottom: 10px;
}
h2 {
  break-before: page;
  color: #102a43;
  font-size: 18pt;
  margin: 0 0 14px;
}
h2:first-of-type {
  break-before: auto;
}
h3 {
  color: #123c69;
  font-size: 14pt;
  margin: 22px 0 8px;
}
h4 {
  color: #243b53;
  font-size: 11.5pt;
  margin: 16px 0 6px;
}
p {
  margin: 0 0 9px;
}
ul, ol {
  margin: 0 0 10px 20px;
  padding: 0;
}
li {
  margin: 3px 0;
}
hr {
  border: 0;
  border-top: 1px solid var(--line);
  margin: 18px 0;
}
table {
  border-collapse: collapse;
  margin: 10px 0 14px;
  width: 100%;
}
th {
  background: var(--accent-soft);
  color: #134e4a;
  font-weight: 700;
}
th, td {
  border: 1px solid var(--line);
  padding: 6px 7px;
  text-align: left;
  vertical-align: top;
}
tr:nth-child(even) td {
  background: #fbfdff;
}
code {
  background: var(--soft);
  border: 1px solid #e4e7ec;
  border-radius: 4px;
  color: #344054;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 9pt;
  padding: 1px 4px;
}
pre {
  background: #0b1220;
  border-radius: 6px;
  color: #e5e7eb;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 8.8pt;
  line-height: 1.42;
  margin: 10px 0 14px;
  overflow-wrap: anywhere;
  padding: 10px 12px;
  white-space: pre-wrap;
}
pre code {
  background: transparent;
  border: 0;
  color: inherit;
  padding: 0;
}
.meta {
  background: var(--soft);
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--muted);
  margin: 10px 0 18px;
  padding: 10px 12px;
}
.meta p {
  margin: 0 0 3px;
}
.cover-note {
  border-left: 4px solid var(--accent);
  color: #344054;
  margin: 18px 0 24px;
  padding: 6px 0 6px 12px;
}
"""


def inline_markup(text: str) -> str:
    escaped = html.escape(text)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    return escaped


def render_table(lines: list[str], start: int) -> tuple[str, int]:
    rows: list[list[str]] = []
    i = start
    while i < len(lines) and lines[i].strip().startswith("|"):
        raw_cells = lines[i].strip().strip("|").split("|")
        rows.append([inline_markup(cell.strip()) for cell in raw_cells])
        i += 1

    if len(rows) >= 2 and all(set(cell) <= {"-", ":", " "} for cell in rows[1]):
        header = rows[0]
        body = rows[2:]
    else:
        header = []
        body = rows

    parts = ["<table>"]
    if header:
        parts.append("<thead><tr>")
        parts.extend(f"<th>{cell}</th>" for cell in header)
        parts.append("</tr></thead>")
    parts.append("<tbody>")
    for row in body:
        parts.append("<tr>")
        parts.extend(f"<td>{cell}</td>" for cell in row)
        parts.append("</tr>")
    parts.append("</tbody></table>")
    return "".join(parts), i


def render_markdown(markdown: str) -> str:
    lines = markdown.splitlines()
    parts: list[str] = []
    i = 0
    in_code = False
    code_lines: list[str] = []
    list_stack: list[str] = []
    meta_lines: list[str] = []

    def close_lists() -> None:
        while list_stack:
            parts.append(f"</{list_stack.pop()}>")

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("```"):
            if in_code:
                parts.append("<pre><code>" + html.escape("\n".join(code_lines)) + "</code></pre>")
                code_lines = []
                in_code = False
            else:
                close_lists()
                in_code = True
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        if not stripped:
            close_lists()
            i += 1
            continue

        if stripped == "---":
            close_lists()
            parts.append("<hr>")
            i += 1
            continue

        if stripped.startswith("|"):
            close_lists()
            table_html, i = render_table(lines, i)
            parts.append(table_html)
            continue

        heading = re.match(r"^(#{1,4})\s+(.*)$", stripped)
        if heading:
            close_lists()
            level = len(heading.group(1))
            text = inline_markup(heading.group(2))
            parts.append(f"<h{level}>{text}</h{level}>")
            i += 1
            continue

        unordered = re.match(r"^-\s+(.*)$", stripped)
        ordered = re.match(r"^\d+\.\s+(.*)$", stripped)
        if unordered or ordered:
            tag = "ul" if unordered else "ol"
            if not list_stack or list_stack[-1] != tag:
                close_lists()
                parts.append(f"<{tag}>")
                list_stack.append(tag)
            text = unordered.group(1) if unordered else ordered.group(1)
            parts.append(f"<li>{inline_markup(text)}</li>")
            i += 1
            continue

        close_lists()
        if stripped.endswith("  "):
            stripped = stripped.rstrip()
        parts.append(f"<p>{inline_markup(stripped)}</p>")
        i += 1

    close_lists()

    if len(parts) >= 2 and parts[0].startswith("<h1>"):
        meta_index = 1
        while meta_index < len(parts) and parts[meta_index].startswith("<p>") and "Fuente:" not in parts[meta_index]:
            meta_lines.append(parts[meta_index])
            meta_index += 1
        if meta_index < len(parts) and parts[meta_index].startswith("<p>") and "Fuente:" in parts[meta_index]:
            meta_lines.append(parts[meta_index])
            parts = [parts[0], '<div class="meta">' + "".join(meta_lines) + "</div>"] + parts[meta_index + 1 :]

    return "\n".join(parts)


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: export_weekly_report.py INPUT.md OUTPUT.html", file=sys.stderr)
        return 2

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    title = input_path.stem.replace("-", " ").title()
    body = render_markdown(input_path.read_text(encoding="utf-8"))
    output_path.write_text(
        "<!doctype html>\n"
        "<html lang=\"es\">\n"
        "<head>\n"
        "<meta charset=\"utf-8\">\n"
        f"<title>{html.escape(title)}</title>\n"
        f"<style>{STYLE}</style>\n"
        "</head>\n<body>\n"
        f"{body}\n"
        "</body>\n</html>\n",
        encoding="utf-8",
    )
    print(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
