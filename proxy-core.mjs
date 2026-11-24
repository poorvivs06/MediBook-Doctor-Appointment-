import http from "node:http";

function createProxyHandler(targetPort) {
  return (req, res) => {
    const options = {
      hostname: "127.0.0.1",
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${targetPort}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", () => {
      const v6Options = {
        hostname: "::1",
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `localhost:${targetPort}`,
        },
      };
      const v6Req = http.request(v6Options, (v6Res) => {
        res.writeHead(v6Res.statusCode, v6Res.headers);
        v6Res.pipe(res, { end: true });
      });
      v6Req.on("error", () => {
        res.writeHead(302, { Location: `http://localhost:${targetPort}${req.url}` });
        res.end();
      });
      req.pipe(v6Req, { end: true });
    });

    req.pipe(proxyReq, { end: true });
  };
}

function attachUpgradeHandler(server, targetPort) {
  server.on("upgrade", (req, clientSocket, head) => {
    const proxyReq = http.request({
      hostname: "127.0.0.1",
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${targetPort}`,
      },
    });

    proxyReq.on("upgrade", (proxyRes, upstreamSocket, proxyHead) => {
      clientSocket.write(
        `HTTP/1.1 101 Switching Protocols\r\n` +
          Object.entries(proxyRes.headers)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\r\n") +
          `\r\n\r\n`
      );
      if (proxyHead && proxyHead.length) clientSocket.write(proxyHead);
      upstreamSocket.pipe(clientSocket);
      clientSocket.pipe(upstreamSocket);
    });

    proxyReq.on("error", () => {
      clientSocket.destroy();
    });

    proxyReq.end();
  });
}

export function startProxy(port = 5174, target = 5173) {
  const handler = createProxyHandler(target);

  const serverV4 = http.createServer(handler);
  attachUpgradeHandler(serverV4, target);
  serverV4.listen(port, "0.0.0.0", () => {
    console.log(`Port ${port} IPv4 proxy active -> http://localhost:${target}`);
  });

  const serverV6 = http.createServer(handler);
  attachUpgradeHandler(serverV6, target);
  serverV6.listen(port, "::1", () => {
    console.log(`Port ${port} IPv6 proxy active -> http://localhost:${target}`);
  });

  return { serverV4, serverV6 };
}
