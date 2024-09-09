require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const app = express();
const PORT = process.env.PORT;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_Key_Id;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_Key_Secret;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

app.use(express.json());

app.get("/", (req, res) => {
  razorpayInstance.orders.all().then(console.log).catch(console.error);
});

app.post("/createOrder", (req, res) => {
  const { amount, currency, receipt, notes } = req.body;

  razorpayInstance.orders.create(
    { amount, currency, receipt, notes },
    (err, order) => {
      if (!err) res.json(order);
      else res.send(err);
    }
  );
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await razorpayInstance.orders.fetch(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status !== "paid") {
      order.status = "Unpaid";
      return res.json({ message: "Payment is not done", order });
    } else {
      return res.json({ message: "Order is already marked as paid", order });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, (error) => {
  if (!error) {
    console.log(`Server running at port ${PORT}`);
  } else {
    console.log("Something went wrong");
  }
});
