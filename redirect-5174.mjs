import http from "node:http";

const server = http.createServer((req, res) => {
  res.writeHead(302, {
    Location: `http://localhost:5173${req.url}`,
    "Access-Control-Allow-Origin": "*",
  });
  res.end();
});

server.listen(5174, "0.0.0.0", () => {
  console.log("Redirect server active: http://localhost:5174 -> http://localhost:5173");
});
