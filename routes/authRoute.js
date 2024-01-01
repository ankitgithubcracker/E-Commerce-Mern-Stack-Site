import express from "express";
import { forgotPasswordController, getAllOrdersController, getOrdersController, loginController, orderStatusController, registerController, testController, updateProfileController } from "../controller/authController.js"
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";



// router object
const router = express.Router()

// routing
// REGISTER || METHOD POST
router.post("/register", registerController)

// LOGIN || METHOD POST
router.post("/login", loginController)

// Forgot password || Method POST
router.post("/reset-password", forgotPasswordController)

// test routes
router.get('/test', requireSignIn, isAdmin, testController)

// protected User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ok:true})
    
}) 
// protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true })  
})

// update profile
router.put("/profile", requireSignIn, updateProfileController)

// Order
router.get("/orders", requireSignIn, getOrdersController)

// All Order
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController)

// status Update
router.put('/order-status/:orderId', requireSignIn, isAdmin, orderStatusController)

export default router 