import express from "express"
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js"
import { braintreePaymentController, braintreeTokenController, createProductController, deleteProductController, getProductController, getSingleProductController, productCategoryController, productCountController, productFiltersController, productListController, productPhotoController,  relatedProductController,  searchProductController,  updateProductController } from "../controller/productController.js"
import formidable from "express-formidable"

const router = express.Router()
 
// route

// create product
router.post("/create-product",
    requireSignIn,
    isAdmin,
    formidable(),
    createProductController
)

// get products
router.get("/get-product", getProductController)

// single products
router.get("/get-product/:slug", getSingleProductController)

// get Photo
router.get("/product-photo/:pid", productPhotoController)

// delete products
router.delete("/delete-products/:pid", deleteProductController)

// update product
router.put("/update-product/:pid",
    requireSignIn,
    isAdmin,
    formidable(),
    updateProductController
)

// filter Product
router.post("/product-filters", productFiltersController)

// Product Count
router.get("/product-count", productCountController)

// Product perPage
router.get("/product-list/:page", productListController)

// Search Product
router.get("/searchList/:keyword", searchProductController)

// Similar product
router.get("/related-product/:pid/:cid", relatedProductController)

// get product by category wise
router.get("/product-category/:slug", productCategoryController)

// payments routes
// token
router.get("/braintree/token", braintreeTokenController)

// payment
router.post("/braintree/payment", requireSignIn, braintreePaymentController)


export default router