import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db.js";
import Car from "./models/car.js";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const app = express();
app.use(cors({ origin: "*" }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const port = 3000;

await connectDB();
app.post("/products", upload.array("pictures", 10), async (req, res) => {
  try {
    const pictures = req.files;
    const { brand, model, color, modelyear, price, description, username } =
      req.body;

    if (!pictures || pictures.length === 0) {
      return res.status(400).json({ error: "No pictures uploaded" });
    }

    const uploadPromises = pictures.map(async (file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "auto", folder: "cars" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve({
                  url: result.secure_url,
                  public_id: result.public_id,
                });
              }
            }
          )
          .end(file.buffer);
      });
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    const user = await Car.findOne({ username });

    const uuid = uuidv4();
    if (user) {
      const newCar = {
        uuid,
        brand,
        model,
        color,
        model_year: modelyear,
        price,
        description,
        pictures: uploadedUrls,
      };

      user.carsData.push(newCar);
      await user.save();
    } else {
      const newCarData = new Car({
        username,
        carsData: [
          {
            uuid,
            brand,
            model,
            color,
            model_year: modelyear,
            price,
            description,
            pictures: uploadedUrls,
          },
        ],
      });
      await newCarData.save();
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Error during file upload:", error);
    return res.status(500).json({ message: "Failed to upload the data" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const { username } = req.query;
    const user = await Car.findOne({ username });
    if (user) {
      return res.json(user);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.log(err);
  }
});

app.delete("/products", async (req, res) => {
  try {
    console.log("entering deletion mode");
    const { uuid, username } = req.query;

    console.log(uuid + " ", username);
    if (!uuid || !username) {
      return res
        .status(400)
        .json({ success: false, message: "UUID and username are required" });
    }
    console.log("checking server for deletion");
    const user = await Car.findOneAndUpdate(
      { username },
      { $pull: { carsData: { uuid } } },
      { new: true }
    );
    console.log(user);

    if (user) {
      return res.json({ success: true, data: user });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("Error deleting car:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;
