const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 2702;

const ordersFile = path.join(__dirname, "orders.json");
const supportFile = path.join(__dirname, "support.json");

// ✅ Middleware
app.use(cors());
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // For HTML form submissions

// ✅ Serve homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Save new order
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
        console.log("⚠️ Error reading existing orders:", e);
    }

    orders.push(order);

    try {
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), "utf8");
        console.log(`✅ Order received and saved: ${order.id}`);
        res.status(200).send("✅ Order saved");
    } catch (err) {
        console.error("❌ Failed to save order:", err);
        res.status(500).send("❌ Failed to save order");
    }
});

// ✅ Get all orders
app.get("/orders", (req, res) => {
    try {
        if (fs.existsSync(ordersFile)) {
            const data = fs.readFileSync(ordersFile, "utf8");
            const orders = data ? JSON.parse(data) : [];
            res.json(orders);
        } else {
            res.json([]); // No orders yet
        }
    } catch (e) {
        console.log("⚠️ Could not read orders.json:", e);
        res.status(500).json({ error: "Failed to load orders" });
    }
});

// ✅ Serve support form
app.get("/support", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "support.html"));
});

// ✅ Handle support form submission
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
        res.send("<h2>✅ Support request submitted! We’ll get back to you soon.</h2>");
    } catch (err) {
        console.error("❌ Failed to save support request:", err);
        res.status(500).send("❌ Failed to save support request");
    }
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://192.168.31.84:${PORT}`);
});
