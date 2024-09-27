// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import Product from "./models/product.model.js";
import Shop from "./models/shop.model.js";

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
  async (req, res, next) => {
    const { shop, accessToken } = res.locals.shopify.session;

    const find = await Shop.findOne({ shop });

    if (find) {
      await Shop.findOneAndUpdate({ shop: shop }, {
        shop: shop,
        token: accessToken,
      })
    } else {
      await Shop.create({
        shop: shop,
        token: accessToken,
      });
      let client = new shopify.api.clients.Rest({
        session: {
          shop,
          accessToken: accessToken
        }
      })

    }

    next();
  },
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

const getCombinations = (arr, budget) => {
  const result = [];

  const findCombinations = (currentCombination, currentSum, startIndex) => {
    if (currentSum <= budget) {
      // Create a deep copy of currentCombination with quantities
      const combinationWithQuantity = currentCombination.reduce((acc, item) => {
        const existingItem = acc.find(i => i._doc.name === item.name);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          acc.push({ ...item, quantity: 1 });
        }
        return acc;
      }, []);
      result.push({
        combination: combinationWithQuantity.map(item => ({ ...item._doc, quantity: item.quantity })),
        totalPrice: currentSum,
        remaining: budget - currentSum,
      });
    }

    for (let i = startIndex; i < arr.length; i++) {
      // If adding the next item exceeds the budget, skip it
      if (currentSum + arr[i].price <= budget) {
        // Recursive call with the new combination
        findCombinations([...currentCombination, arr[i]], currentSum + arr[i].price, i);
      }
    }
  };

  arr.sort((a, b) => a.price - b.price); // Sort items by price
  findCombinations([], 0, 0);

  // Filter combinations to get the ones with the minimum remaining budget
  if (result.length > 0) {
    const minRemaining = Math.min(...result.map(r => r.remaining));
    return result.filter(r => r.remaining === minRemaining);
  }

  return [];
};

app.post("/api/products/pair", async (_req, res) => {
  let status = 200;
  let error = null;
  let data = [];
  try {
    const products = await Product.find().exec();
    const keyboards = await Product.find({ type: "keyboards" }).exec();
    const computers = await Product.find({ type: "computers" }).exec();

    const budget = _req.body.budget;
    const computerChecked = _req.body.computerChecked;
    const keyboaradChecked = _req.body.keyboaradChecked;
    if (budget < 0) {
      status = 500;
      error = "Budget cannot be negative";
    } else if (budget === 0) {
      status = 500;
      error = "Budget cannot be zero";
    }


    let result = []

    if (keyboaradChecked && computerChecked) {
      data = getCombinations(products, budget);
    }
    else if (keyboaradChecked && !computerChecked) {
      data = getCombinations(keyboards, budget);

    } else if (!keyboaradChecked && computerChecked) {
      data = getCombinations(computers, budget);
    }


    // const validCombinations = combinations.filter(combination =>
    //     combination.reduce((sum, item) => sum + item.price, 0) < budget
    // );
    //
    // const validCombinationsWithTotalPrice = validCombinations.map(combination => ({
    //   combination,
    //   totalPrice: combination.reduce((sum, item) => sum + item.price, 0),
    //   budget,
    //     remaining: budget - combination.reduce((sum, item) => sum + item.price, 0)
    // }));
    if (data.length === 0) {
      if (!keyboaradChecked && !computerChecked) {
        status = 500;
        error = "At least one product type should be selected";
      } else {
        status = 500;
        error = "Products cannot be purchased within the given budget!";
      }
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

  const result = await Product.find({ type: "computers" }).exec();

  res.status(200).send({ data: result });
});


app.get("/api/products/keyboards", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });
  const result = await Product.find({ type: "keyboards" }).exec();


  res.status(200).send({ data: result });

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
    console.log(_req.query, '_req');
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
