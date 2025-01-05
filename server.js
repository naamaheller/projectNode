import express from "express";
import userRouter from "./routers/user.js";
import productRouter from "./routers/product.js";
import orderRouter from "./routers/order.js";
import dotnev from "dotenv";
import{connectToDb} from "./config/db.js";
import { connect } from "mongoose";
import cors from "cors";
dotnev.config();
const app=express();
connectToDb();

app.use(cors());
app.use(express.json());
app.use("/api/order",orderRouter)
app.use("/api/user",userRouter)
app.use("/api/product",productRouter)

let port=process.env.PORT;
app.listen(port,()=>{
    console.log("app ia listen on port "+port);
})


