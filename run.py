#!/usr/bin/env python

# Serves presentation assets at localhost:8888.

import SimpleHTTPServer
import SocketServer
import os

os.chdir('content')

PORT = 8888

class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    pass

Handler.extensions_map['.mjs'] = 'text/javascript'

httpd = SocketServer.TCPServer(("", PORT), Handler)

print "Launching server at http://localhost:" + str(PORT)
httpd.serve_forever()
