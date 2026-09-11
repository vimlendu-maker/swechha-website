#!/usr/bin/env python3
"""Verify factual claims mechanically. No model involved, on purpose.

An agent checking its own citations is the failure that already happened on this
repository: a research subagent returned a confident, citation-dense report on
cloudbursts and landslides, then retracted it, admitting it had fabricated death
tolls, named officials, verbatim quotations, DOIs and URLs -- in the same
register as material it had genuinely verified. Fluency is not evidence. So this
is a script: it resolves identifiers against registries and compares strings.

CLAIM FORMAT -- fenced ```claim blocks in a markdown draft:

    ```claim
    text: Delhi's annual PM2.5 mean exceeded the national standard in 2024.
    type: verified_fact
    source: https://cpcb.nic.in/some-report
    doi: 10.1038/s41586-024-00000-0
    quote: the exact sentence, copied from the source
    ```

`type` is one of:
    verified_fact   -- must resolve AND (DOI metadata matches OR quote found)
    interpretation  -- a reading of a verified source; needs a resolving source
    analysis        -- our own reasoning; needs no source but must be labelled
    opinion         -- explicitly ours; needs no source but must be labelled
    uncertain       -- flagged as unknown; may never carry a figure

EXIT CODES
    0  every claim passed
    1  at least one claim failed -- do not publish
    2  the input was malformed
"""
import json
import re
import sys
import urllib.error
import urllib.request

TYPES = {"verified_fact", "interpretation", "analysis", "opinion", "uncertain"}
NEEDS_SOURCE = {"verified_fact", "interpretation"}
UA = {"User-Agent": "swechha-website-team/1.0 (+https://swechha.in)"}
TIMEOUT = 20


def fetch(url, as_json=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        body = r.read().decode("utf8", "replace")
    return json.loads(body) if as_json else body


def check_doi(doi, claim):
    """Resolve against Crossref and compare what came back to what was claimed."""
    try:
        data = fetch(f"https://api.crossref.org/works/{doi}", as_json=True)["message"]
    except urllib.error.HTTPError as e:
        return False, f"DOI does not resolve at Crossref (HTTP {e.code}) — treat as fabricated"
    except Exception as e:
        return None, f"could not reach Crossref: {e}"

    title = (data.get("title") or [""])[0]
    year = None
    for key in ("published-print", "published-online", "issued"):
        parts = (data.get(key) or {}).get("date-parts") or [[]]
        if parts[0]:
            year = parts[0][0]
            break
    first = ""
    if data.get("author"):
        a = data["author"][0]
        first = a.get("family", "")

    got = f"{title} | {data.get('container-title',[''])[0]} | {year} | {first}"
    # Anything the claim asserts about the work must appear in what Crossref
    # returned. A DOI that resolves to an unrelated paper is the subtler
    # fabrication and this is what catches it.
    for field in ("expect_title", "expect_author", "expect_year"):
        want = claim.get(field)
        if want and str(want).lower() not in got.lower():
            return False, f"DOI resolves but {field}={want!r} is not in Crossref record: {got}"
    return True, f"DOI resolves: {got}"


def check_url(url):
    try:
        body = fetch(url)
        return True, f"resolves ({len(body)} bytes)", body
    except urllib.error.HTTPError as e:
        return False, f"source URL returned HTTP {e.code}", ""
    except Exception as e:
        return None, f"could not reach source: {e}", ""


def parse(text):
    out = []
    for raw in re.findall(r"```claim\s*\n(.*?)```", text, re.S):
        c = {}
        key = None
        for line in raw.strip("\n").split("\n"):
            m = re.match(r"^(\w+)\s*:\s*(.*)$", line)
            if m:
                key = m.group(1)
                c[key] = m.group(2).strip()
            elif key:
                c[key] += "\n" + line.strip()
        out.append(c)
    return out


def main():
    text = sys.stdin.read()
    claims = parse(text)
    if not claims:
        print("verify-claims: no claim blocks found — nothing asserted, nothing to check")
        return 0

    failures, unreachable = 0, 0
    for i, c in enumerate(claims, 1):
        label = (c.get("text") or "")[:70] or "(no text)"
        t = c.get("type", "")
        print(f"\n[{i}] {label}")
        print(f"    type: {t or 'MISSING'}")

        if t not in TYPES:
            print(f"    ✗ type must be one of {sorted(TYPES)}")
            failures += 1
            continue
        if not c.get("text"):
            print("    ✗ no claim text")
            failures += 1
            continue

        if t == "uncertain" and re.search(r"\d", c.get("text", "")):
            print("    ✗ an 'uncertain' claim may not carry a figure")
            failures += 1
            continue

        if t not in NEEDS_SOURCE:
            print(f"    ✓ labelled {t}; no source required")
            continue

        if not c.get("source") and not c.get("doi"):
            print(f"    ✗ {t} requires a source or a doi")
            failures += 1
            continue

        ok_any, notes, body = False, [], ""
        if c.get("doi"):
            ok, note = check_doi(c["doi"], c)
            notes.append(note)
            if ok is None:
                unreachable += 1
            elif ok:
                ok_any = True
            else:
                failures += 1
                print(f"    ✗ {note}")
                continue
        if c.get("source"):
            ok, note, body = check_url(c["source"])
            notes.append(note)
            if ok is None:
                unreachable += 1
            elif ok:
                ok_any = True
            else:
                failures += 1
                print(f"    ✗ {note}")
                continue

        quote = c.get("quote", "").strip()
        if quote and body:
            flat = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", body)).lower()
            if re.sub(r"\s+", " ", quote).lower() in flat:
                notes.append("quote found verbatim in source")
                ok_any = True
            else:
                print("    ✗ quote not found in the fetched source — do not publish it as a quotation")
                failures += 1
                continue

        if t == "verified_fact" and not (c.get("doi") or quote):
            print("    ✗ verified_fact needs a resolving DOI or a verbatim quote, not a bare link")
            failures += 1
            continue

        for n in notes:
            print(f"    · {n}")
        print("    ✓ passed" if ok_any else "    ✗ nothing could be confirmed")
        if not ok_any:
            failures += 1

    print(f"\nverify-claims: {len(claims)} claim(s), {failures} failed, {unreachable} unreachable")
    if unreachable:
        print("verify-claims: a source that cannot be reached is NOT a pass. Re-run or drop the claim.")
    if failures or unreachable:
        print("verify-claims: REFUSING — do not publish")
        return 1
    print("verify-claims: all claims verified")
    return 0


if __name__ == "__main__":
    sys.exit(main())
