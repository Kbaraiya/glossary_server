const express = require("express");
const app = express();
const ordersRoute = require("./routes/orders");
const cors = require("cors");

app.use(cors());
app.use(express.json()); // Parse JSON body

app.use("/orders", ordersRoute);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Grocery Server running at http://mateshree:${PORT}`);
});
