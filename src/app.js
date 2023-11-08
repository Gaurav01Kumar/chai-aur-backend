import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
//this is middleware that is use to request json payload with limit 66kb
app.use(express.json({ limit: "16kb" }));
//this is a middle ware that is use to accept json from url 
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
//this is use to accept public file 
app.use(express.static("public"));
//for perform crud opearation in cookie
app.use(cookieParser());

export default app;
