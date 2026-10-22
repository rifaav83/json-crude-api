const http = require("http");
const fs = require("fs");
const { randomUUID } = require("crypto");

require("dotenv").config();

const PORT = process.env.PORT || 3000;
const DATA_FILE = "./data/users.json";

const server = http.createServer((req, res) => {


  const users = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

  
  if (req.method === "GET" && req.url === "/users") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
    return;
  }

  
  if (req.method === "GET" && req.url.startsWith("/users/")) {
    const id = req.url.split("/")[2];
    const user = users.find(u => u.id === id);

    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User not  found" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(user));
    return;
  }

  
  if (req.method === "POST" && req.url === "/users") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const { name, email, age } = JSON.parse(body);

      if (!name || !email || !age) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid data" }));
        return;
      }

      if (users.find(u => u.email === email)) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Email already exists" }));
        return;
      }

      const newUser = { id: randomUUID(), name, email, age };
      users.push(newUser);

      fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newUser));
    });

    return;
  }

  
  if (req.method === "PUT" && req.url.startsWith("/users/")) {
    const id = req.url.split("/")[2];
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User not found" }));
      return;
    }

    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const { name, email, age } = JSON.parse(body);

      if (!name || !email || !age) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid data" }));
        return;
      }

      users[index] = { id, name, email, age };
      fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(users[index]));
    });

    return;
  }

  if (req.method === "DELETE" && req.url.startsWith("/users/")) {
    const id = req.url.split("/")[2];
    const index = users.findIndex(u => u.id === id);

    if (index === -1) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "User not found" }));
      return;
    }

    users.splice(index, 1);
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User deteled" }));
    return;
  }    

   res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }));
});

server.listen(PORT, () => {
  console.log(`Server running on  port ${PORT}`); 

});

