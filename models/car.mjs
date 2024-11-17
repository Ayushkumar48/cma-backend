import mongoose from "mongoose";

const pictureSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
});

const perCarSchema = new mongoose.Schema({
  uuid: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  color: { type: String },
  description: String,
  model_year: { type: Number, required: true },
  price: { type: Number, required: true },
  pictures: { type: [pictureSchema], default: [] },
});

const carDataSchema = new mongoose.Schema({
  username: { type: String, required: true },
  carsData: { type: [perCarSchema], default: [] },
});

const Car = mongoose.models.Car || mongoose.model("Car", carDataSchema);
export default Car;
