const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');
const bodyParser = require('body-parser');
require('./models/User');
require('./models/Vendor');
require('./models/Product');
require('./models/Order');
require('./models/Payment');
require('./models/Review');

const userRoutes = require('./routes/userRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

dotenv.config(); // ✅ Load environment variables
connectDB(); // ✅ Connect to MongoDB

const app = express();

// app.use(cors());
app.use(
    cors({
      origin: ["http://localhost:5173", "https://bazario-frontend.vercel.app"], // ✅ Allow frontend URLs
      methods: "GET,POST,PUT,DELETE",
      credentials: true, // ✅ Allow cookies if needed
    })
  );
app.use(express.json()); // ✅ Use only this for JSON parsing
app.use(bodyParser.urlencoded({ extended: true })); // ✅ Allow form-data requests


// ✅ Define Routes AFTER initializing app
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// const Product = require('./models/Product'); // ✅ Import Product Model


// const testDB = async () => {
//     try {
//         const products = await Product.find();
//         console.log("🛠️ Direct DB Test - Product Count:", products.length);
//         console.log("🛠️ Sample Product:", products[0]); // Show first product (if exists)
//     } catch (error) {
//         console.error("❌ MongoDB Direct Test Failed:", error);
//     }
// };

// testDB();

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
