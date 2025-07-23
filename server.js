const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PUBLIC_URL = "https://glossary-server.onrender.com";
const PORT = process.env.PORT || 2702;

// File paths
const ordersFile = path.join(__dirname, "orders.json");
const supportFile = path.join(__dirname, "support.json");
const adminUsersFile = path.join(__dirname, "admin_users.json");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
// server.js






app.use(cors());
app.use(express.json());

// ✅ Route to get all admin users
app.get("/admin_users", (req, res) => {
    const filePath = path.join(__dirname, "admin_users.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading admin_users.json:", err);
            return res.status(500).json({ error: "Failed to load admin users" });
        }

        try {
            const jsonData = JSON.parse(data);
            res.status(200).json(jsonData);
        } catch (parseErr) {
            console.error("JSON parse error:", parseErr);
            return res.status(500).json({ error: "Invalid JSON format" });
        }
    });
});

// ✅ You can add other routes here as well for /orders, /support, etc.




// ✅ Home route
app.get("/", (req, res) => {
    const indexPath = path.join(__dirname, "index.html");
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send(`<h1>✅ Glossary Server is Running!</h1><p>Hosted at <a href="${PUBLIC_URL}">${PUBLIC_URL}</a></p>`);
    }
});


// ✅ GET /admin-users?phone= → check if number is admin
app.get("/admin_users", (req, res) => {
    const filePath = path.join(__dirname, "admin_users.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading admin_users.json:", err);
            return res.status(500).json({ error: "Failed to load admin users" });
        }

        try {
            const phoneNumbers = JSON.parse(data); // Expecting: ["7043572313", "9123456789"]
            res.status(200).json({ admins: phoneNumbers }); // Wrap in object for clarity
        } catch (parseErr) {
            console.error("JSON parse error:", parseErr);
            return res.status(500).json({ error: "Invalid JSON format in admin_users.json" });
        }
    });
});

// ✅ Route for /admin
app.get("/admin", (req, res) => {
    const adminFilePath = path.join(__dirname, "admin.json");

    fs.readFile(adminFilePath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading admin.json:", err);
            return res.status(500).json({ error: "Failed to read admin data" });
        }

        try {
            const adminData = JSON.parse(data);
            res.status(200).json(adminData);
        } catch (parseErr) {
            console.error("JSON parse error:", parseErr);
            res.status(500).json({ error: "Invalid JSON format" });
        }
    });
});


// ✅ GET /admin-users → Return full list of admin users
app.get("/admin-users-all", (req, res) => {
    try {
        if (fs.existsSync(adminUsersFile)) {
            const data = fs.readFileSync(adminUsersFile, "utf8");
            const admins = data ? JSON.parse(data) : [];
            return res.json(admins);
        } else {
            return res.json([]);
        }
    } catch (e) {
        console.error("⚠️ Could not read admin_users.json:", e);
        return res.status(500).json({ error: "Failed to load admin users" });
    }
});


// ✅ POST /orders → Save new order
app.post("/orders", (req, res) => {
    const order = req.body;
    if (!order || !order.id) {
        return res.status(400).send("❌ Invalid order data: missing 'id'");
    }

    let orders = [];
    try {
        if (fs.existsSync(ordersFile)) {
            const data = fs.readFileSync(ordersFile, "utf8");
            orders = data ? JSON.parse(data) : [];
        }
    } catch (e) {
        console.error("⚠️ Error reading orders:", e);
    }

    orders.push(order);

    try {
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), "utf8");
        console.log(`✅ Order received and saved: ${order.id}`);
        return res.status(200).send("✅ Order saved");
    } catch (err) {
        console.error("❌ Failed to save order:", err);
        return res.status(500).send("❌ Failed to save order");
    }
});


// ✅ GET /orders → Return all orders
app.get("/orders", (req, res) => {
    try {
        if (fs.existsSync(ordersFile)) {
            const data = fs.readFileSync(ordersFile, "utf8");
            const orders = data ? JSON.parse(data) : [];
            return res.json(orders);
        } else {
            return res.json([]); // No orders yet
        }
    } catch (e) {
        console.error("⚠️ Could not read orders.json:", e);
        return res.status(500).json({ error: "Failed to load orders" });
    }
});


// ✅ GET /support → Serve static support form
app.get("/support", (req, res) => {
    const supportPath = path.join(__dirname, "views", "support.html");
    if (fs.existsSync(supportPath)) {
        return res.sendFile(supportPath);
    } else {
        return res.send("<h2>Support page not available</h2>");
    }
});


// ✅ POST /support → Save support messages
app.post("/support", (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).send("❌ Missing fields");
    }

    const newEntry = {
        name,
        email,
        message,
        time: new Date().toISOString()
    };

    let existing = [];
    try {
        if (fs.existsSync(supportFile)) {
            const data = fs.readFileSync(supportFile, "utf8");
            existing = data ? JSON.parse(data) : [];
        }
    } catch (err) {
        console.log("⚠️ Error reading support.json:", err);
    }

    existing.push(newEntry);

    try {
        fs.writeFileSync(supportFile, JSON.stringify(existing, null, 2), "utf8");
        console.log(`📩 Support ticket submitted by: ${name}`);
        return res.send("<h2>✅ Support request submitted! We’ll get back to you soon.</h2>");
    } catch (err) {
        console.error("❌ Failed to save support request:", err);
        return res.status(500).send("❌ Failed to save support request");
    }
});


// ✅ Start the server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running at: ${PUBLIC_URL}`);
});
