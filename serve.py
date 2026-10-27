"""Static development server: caching disabled, and the security headers from _headers applied so the Content Security Policy is exercised locally.
Usage: python serve.py [port]"""
import fnmatch, http.server, os, re, socketserver, sys

def load_headers(path='_headers'):
    rules, cur = [], None
    if not os.path.exists(path): return rules
    for line in open(path, encoding='utf-8'):
        if not line.strip(): continue
        if not line.startswith((' ', '\t')): cur = (line.strip(), []); rules.append(cur)
        elif cur: k, v = line.strip().split(':', 1); cur[1].append((k.strip(), v.strip()))
    return rules

RULES = load_headers()
SKIP = {'cache-control', 'strict-transport-security'}   # development: never cache, no HSTS on http

class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.split('?')[0]
        for pat, hs in RULES:
            if fnmatch.fnmatch(path, pat):
                for k, v in hs:
                    if k.lower() in SKIP: continue
                    if k.lower() == 'content-security-policy': v = re.sub(r';?\s*upgrade-insecure-requests', '', v)
                    self.send_header(k, v)
        self.send_header('Cache-Control', 'no-store'); super().end_headers()
    def log_message(self, *a): pass

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
socketserver.ThreadingTCPServer.allow_reuse_address = True; socketserver.ThreadingTCPServer.daemon_threads = True
with socketserver.ThreadingTCPServer(('', port), H) as s: s.serve_forever()
