// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import Product from "./models/product.model.js";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import mongoose from 'mongoose';
const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

const mongoDBUrl = "mongodb://127.0.0.1:27017/test";


// Connect to MongoDB
mongoose.connect(mongoDBUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Handle connection events
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});



// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});
const getCombinations = (arr) => {
  const result = [];
  const f = (prefix, arr) => {
    for (let i = 0; i < arr.length; i++) {
      result.push([...prefix, arr[i]]);
      f([...prefix, arr[i]], arr.slice(i + 1));
    }
  }
  f([], arr);
  return result;
};

app.post("/api/products/pair", async (_req, res) => {
  let status = 200;
  let error = null;
let data = [];
  try {
    const products = await Product.find().exec();
    const keyboards = await Product.find({type: "keyboards"}).exec();
    const computers = await Product.find({type: "computers"}).exec();

    const budget = _req.body.budget;
    const computerChecked = _req.body.computerChecked;
    const keyboaradChecked = _req.body.keyboaradChecked;
    if(budget < 0) {
      status = 500;
      error = "Budget cannot be negative";
    }else if(budget === 0) {
      status = 500;
      error = "Budget cannot be zero";
    }


    let combinations = []

    if(keyboaradChecked && computerChecked) {
      combinations = getCombinations(products);
    }
    else if(keyboaradChecked && !computerChecked) {
       combinations = getCombinations(keyboards);

    } else if(!keyboaradChecked && computerChecked) {
      combinations = getCombinations(computers);
    }


    const validCombinations = combinations.filter(combination =>
        combination.reduce((sum, item) => sum + item.price, 0) < budget
    );

    const validCombinationsWithTotalPrice = validCombinations.map(combination => ({
      combination,
      totalPrice: combination.reduce((sum, item) => sum + item.price, 0),
      budget,
        remaining: budget - combination.reduce((sum, item) => sum + item.price, 0)
    }));
    if(validCombinationsWithTotalPrice.length === 0) {
      if(!keyboaradChecked && !computerChecked) {
        status = 500;
        error = "At least one product type should be selected";
      }else {
        status = 500;
        error = "Products cannot be purchased within the given budget!";
      }
    } else {
      data = validCombinationsWithTotalPrice;


    }
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, data, error });
});

app.get("/api/products/computers", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const result = await Product.find({type: "computers"}).exec();

  res.status(200).send({data: result});
});


app.get("/api/products/keyboards", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const result = await Product.find({type: "keyboards"}).exec();


  res.status(200).send({data: result});

});

app.post("/api/products/keyboards", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    Product.create({
      name: `Keyboards v.${Math.floor(Math.random() * 100) + 1}`,
      price: Math.floor(Math.random() * 100) + 1,
      type: "keyboards",
      description: "This is a test product"
    });
    // await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});


app.post("/api/products/computers", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    Product.create({
      name: `Computers v.${Math.floor(Math.random() * 100) + 1}`,
      price: Math.floor(Math.random() * 100) + 1,
      type: "computers",
      description: "This is a test product"
    });
    // await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});


app.post("/api/products", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    Product.create({
      name: "Test Product",
      price: 10.0,
      description: "This is a test product"
    });
    // await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
