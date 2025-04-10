import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({ region: "us-east-1" });

const products = [
  {
    id: uuidv4(),
    title: "Red T-Shirt",
    description: "Bright red cotton t-shirt",
    price: 499,
  },
  {
    id: uuidv4(),
    title: "Blue Jeans",
    description: "Slim fit blue jeans",
    price: 1299,
  },
  {
    id: uuidv4(),
    title: "Sneakers",
    description: "White running shoes",
    price: 2499,
  },
];

async function seed() {
  for (const product of products) {
    await client.send(
      new PutItemCommand({
        TableName: "products",
        Item: {
          id: { S: product.id },
          title: { S: product.title },
          description: { S: product.description },
          price: { N: product.price.toString() },
        },
      })
    );

    await client.send(
      new PutItemCommand({
        TableName: "stock",
        Item: {
          product_id: { S: product.id },
          count: { N: (Math.floor(Math.random() * 50) + 1).toString() },
        },
      })
    );

    console.log(`Inserted: ${product.title}`);
  }

  console.log("✅ Seeding complete.");
}

seed().catch((err) => console.error("❌ Seed failed:", err));
