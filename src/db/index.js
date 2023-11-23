import mongoose from "mongoose"

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/chai-backend`,
      { useNewUrlParser: true, useUnifiedTopology: true, family: 4 }
    );
    console.log(
      `\n MongoDB connected || DB HOST ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("MONGODB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
