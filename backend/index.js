const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());

const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:5001',
  'https://k-digital-curry-react-assignment.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

mongoose.connect('mongodb+srv://root:root@cluster0.oau3jje.mongodb.net/kdigitalcurry?retryWrites=true&w=majority&appName=Cluster0', {}).then(() => console.log('DB connected!!'));

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
const Product = mongoose.model('Product', productSchema);

const materialSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
const Material = mongoose.model('Material', materialSchema);

const gradeSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
const Grade = mongoose.model('Grade', gradeSchema);

const combinationSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  gradeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Grade', required: true }],
  shape: { type: String, required: false },
  length: { type: Number, required: false },
  thickness: { type: Number, required: false },
  price: { type: Number, required: false },
  currency: { type: String, required: false },
  weight: { type: String, required: false }
});
const Combination = mongoose.model('Combination', combinationSchema);

async function seedData() {
  const products = [{ name: 'Pipe' }, { name: 'Tubing' }];
  const materials = [{ name: 'Stainless Steel' }, { name: 'Carbon Steel' }];
  const grades = [{ name: '304' }, { name: 'A105' }];

  await Product.bulkWrite(
    products.map(product => ({
      updateOne: {
        filter: { name: product.name },
        update: { $setOnInsert: product },
        upsert: true,
      }
    }))
  );

  await Material.bulkWrite(
    materials.map(material => ({
      updateOne: {
        filter: { name: material.name },
        update: { $setOnInsert: material },
        upsert: true,
      }
    }))
  );

  await Grade.bulkWrite(
    grades.map(grade => ({
      updateOne: {
        filter: { name: grade.name },
        update: { $setOnInsert: grade },
        upsert: true,
      }
    }))
  );

  const productsInserted = await Product.find({ name: { $in: products.map(p => p.name) } });
  const materialsInserted = await Material.find({ name: { $in: materials.map(m => m.name) } });
  const gradesInserted = await Grade.find({ name: { $in: grades.map(g => g.name) } });

  const combinations = [
    {
      productId: productsInserted[0]._id,
      materialId: materialsInserted[0]._id,
      gradeIds: [gradesInserted[0]._id],
      shape: 'Round',
      length: 10,
      thickness: 2,
      price: 100,
      currency: 'USD',
      weight: 'KG',
    },
    {
      productId: productsInserted[1]._id,
      materialId: materialsInserted[1]._id,
      gradeIds: [gradesInserted[1]._id],
      shape: 'Square',
      length: 20,
      thickness: 3,
      price: 150,
      currency: 'USD',
      weight: 'KG',
    },
  ];

  await Combination.bulkWrite(
    combinations.map(combination => ({
      updateOne: {
        filter: { productId: combination.productId, materialId: combination.materialId },
        update: { $setOnInsert: combination },
        upsert: true,
      }
    }))
  );

  console.log('Data seeded');
}
seedData();

app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get('/materials', async (req, res) => {
  const materials = await Material.find();
  res.json(materials);
});

app.get('/grades', async (req, res) => {
  const grades = await Grade.find();
  res.json(grades);
});

app.post('/add-combination', async (req, res) => {
  try {
    const { productId, materialId, gradeIds, shape = 'NA', length = 0, thickness = 0, price = 0, currency = 'USD', weight = 'KG' } = req.body;

    // Create and save the combination in one step
    const combination = await Combination.create({
      productId,
      materialId,
      gradeIds,
      shape,
      length,
      thickness,
      price,
      currency
    });

    res.status(201).json({ message: 'Combination added!', combination });
  } catch (error) {
    console.error('Error adding combination:', error);
    res.status(500).json({ message: 'Error adding combination', error: error.message });
  }
});

app.put('/update-combination/:id', async (req, res) => {
  const { id } = req.params;
  const { productId, materialId, gradeIds, shape, length, thickness, price, currency } = req.body;

  try {
    const combination = await Combination.findByIdAndUpdate(
      id,
      { productId, materialId, gradeIds, shape, length, thickness, price, currency },
      { new: true, runValidators: true }
    );

    if (!combination) {
      return res.status(404).json({ message: 'Combination not found' });
    }

    res.status(200).json({ message: 'Combination updated!', data: combination });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/allproducts', async (req, res) => {
  const { page = 1, limit = 10, materialId, productName, sortBy, sortOrder } = req.query;
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const filters = {};
  if (materialId) {
    filters.materialId = materialId;
  }
  if (productName) {
    const product = await Product.findOne({ name: productName });
    if (product) {
      filters.productId = product._id;
    }
  }

  const order = sortOrder === 'desc' ? -1 : 1;

  try {
    const combinations = await Combination.find(filters)
      .populate('productId', 'name')
      .populate('materialId', 'name')
      .populate('gradeIds', 'name')
      .sort(sortBy === 'price' ? { 'price': order } : { 'productId': order })
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Combination.countDocuments(filters);

    res.status(200).json({
      total,
      page: options.page,
      limit: options.limit,
      data: combinations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(5000, '0.0.0.0', () => console.log('Server running on port 5000'));