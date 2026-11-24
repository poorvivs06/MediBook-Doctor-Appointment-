import { spawn } from "node:child_process";
import http from "node:http";

const VITE_PORT = 5173;
const MIRROR_PORTS = [5174, 5175, 5176];

// 1. Spawn Vite dev server
const vite = spawn("npx.cmd", ["vite", "--host", "0.0.0.0", "--port", String(VITE_PORT)], {
  cwd: "C:\\Users\\admin\\Desktop\\doctor-appointment",
  stdio: "inherit",
  shell: true,
});

vite.on("exit", (code) => {
  console.log(`Vite exited with code ${code}`);
  process.exit(code || 0);
});

// 2. Proxy handler
function createProxyHandler() {
  return (req, res) => {
    const options = {
      hostname: "127.0.0.1",
      port: VITE_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${VITE_PORT}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", () => {
      const v6Options = {
        hostname: "::1",
        port: VITE_PORT,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `localhost:${VITE_PORT}`,
        },
      };
      const v6Req = http.request(v6Options, (v6Res) => {
        res.writeHead(v6Res.statusCode, v6Res.headers);
        v6Res.pipe(res, { end: true });
      });
      v6Req.on("error", () => {
        res.writeHead(302, { Location: `http://localhost:${VITE_PORT}${req.url}` });
        res.end();
      });
      req.pipe(v6Req, { end: true });
    });

    req.pipe(proxyReq, { end: true });
  };
}

function attachUpgrade(server) {
  server.on("upgrade", (req, clientSocket, head) => {
    const proxyReq = http.request({
      hostname: "127.0.0.1",
      port: VITE_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${VITE_PORT}`,
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

const handler = createProxyHandler();

// Bind all mirror ports on both IPv4 (0.0.0.0) and IPv6 (::1)
for (const port of MIRROR_PORTS) {
  try {
    const sV4 = http.createServer(handler);
    attachUpgrade(sV4);
    sV4.listen(port, "0.0.0.0", () => {
      console.log(`[Mirror] Listening on IPv4 http://0.0.0.0:${port}`);
    });
    sV4.on("error", (e) => console.log(`Port ${port} IPv4: ${e.message}`));

    const sV6 = http.createServer(handler);
    attachUpgrade(sV6);
    sV6.listen(port, "::1", () => {
      console.log(`[Mirror] Listening on IPv6 http://[::1]:${port}`);
    });
    sV6.on("error", (e) => console.log(`Port ${port} IPv6: ${e.message}`));
  } catch (err) {
    console.log(`Error mirroring port ${port}:`, err.message);
  }
}
