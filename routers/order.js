import { Router } from "express";
import {getAllOrders,addOrder,deleteOrderById,getByUserId,updateStatusOrder} from "../controllers/order.js";
  
const router=Router();
router.get("/",getAllOrders)
router.get("/:id",getByUserId)
router.delete("/:id",deleteOrderById)
router.post("/",addOrder)
router.put("/:id",updateStatusOrder)

export default router;