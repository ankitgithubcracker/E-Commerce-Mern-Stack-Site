import slugify from "slugify"
import productModel from "../models/productModel.js"
import categoryModel from "../models/categoryModel.js"
import orderModel from "../models/orderModel.js"
import fs from "fs"
import braintree from "braintree";
import dotenv from "dotenv"

dotenv.config()


// Payment Gateway

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});


export const createProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields
        const { photo } = req.files
        // validation
        switch (true) {
            case !name:
                return res.status(500).send({ error: "Name is required" })
            case !description:
                return res.status(500).send({ error: "description is required" })
            case !price:
                return res.status(500).send({ error: "price is required" })
            case !category:
                return res.status(500).send({ error: "category is required" })
            case !quantity:
                return res.status(500).send({ error: "quantity is required" })
            case !shipping:
                return res.status(500).send({ error: "shipping is required" })
            case photo && photo.size > 1000000:
                return res.status(500).send({ error: "Photo is required and should be    less than 1mb" })

        }


        const products = new productModel({ ...req.fields, slug: slugify(name) })
        if (photo) {
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type
        }

        await products.save()

        res.status(201).send({
            success: true,
            message: "Product Created Successfully",
            products,
        })


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error creating Products"
        })
    }
}

// get all products

export const getProductController = async (req, res) => {
    try {
        const products = await productModel
            .find({})
            .populate("category")
            .select("-photo")
            .limit(12)
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: "All products",
            totalCount: products.length,
            products,
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error in getting Products"
        })
    }
}


// get single products

export const getSingleProductController = async (req, res) => {
    try {
        const products = await productModel
            .findOne({ slug: req.params.slug })
            .select("-photo")
            .populate("category");


        res.status(200).send({
            success: true,
            message: "single products fetch",
            products,
        })


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error in getting Products"
        })
    }
}

// get Photo

export const productPhotoController = async (req, res) => {
    try {
        const products = await productModel.findById(req.params.pid).select("photo")
        if (products.photo.data) {
            res.set("Content-type", products.photo.contentType)
            res.status(200).send(products.photo.data)
        }


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error in Product Photo"
        })
    }
}

// delete Product
export const deleteProductController = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-photo")
        res.status(200).send({
            success: true,
            message: "Product Delete Successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error in delete Product"
        })
    }
}

// update products
export const updateProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields
        const { photo } = req.files
        // validation
        switch (true) {
            case !name:
                return res.status(500).send({ error: "Name is required" })
            case !description:
                return res.status(500).send({ error: "description is required" })
            case !price:
                return res.status(500).send({ error: "price is required" })
            case !category:
                return res.status(500).send({ error: "category is required" })
            case !quantity:
                return res.status(500).send({ error: "quantity is required" })
            case photo && photo.size > 1000000:
                return res.status(500).send({ error: "Photo is required and should br less than 1mb" })

        }

        const products = await productModel.findByIdAndUpdate(req.params.pid,
            { ...req.fields, slug: slugify(name), }, { new: true })

        if (photo) {
            products.photo.data = fs.readFileSync(photo.path)
            products.photo.contentType = photo.type
        }
        await products.save()

        res.status(201).send({
            success: true,
            message: "Product Created Successfully",
            products,
        })



    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error in update Product"
        })
    }
}


// Filter Product
export const productFiltersController = async (req, res) => {
    try {
        const { checked, radio } = req.body
        let args = {}

        if (checked.length > 0) {
            args.category = checked
        }
        if (radio.length) {
            args.price = {
                $gte: radio[0],  //greater than equal to
                $lte: radio[1]   //less than equal to
            }
        }
        const products = await productModel.find(args)
        res.status(200).send({
            success: true,
            products
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error During Filter product"
        })
    }
}

// Product Count Controller
export const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount()
        res.status(200).send({
            success: true,
            total,
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            error,
            message: "Error During Count product"
        })
    }
}

export const productListController = async (req, res) => {
    try {
        const perPage = 12
        const page = req.params.page ? req.params.page : 1
        const products = await productModel
            .find({})
            .select("-photo")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })

        res.status(200).send({
            success: true,
            products
        })

    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            error,
            message: "Error During Product List"
        })
    }
}

// Search Product Controller
export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params
        const results = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        }).select("-photo")
        console.log(results)
        res.json(results)

    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            error,
            message: "Error in Search Product Api"
        })
    }
}

// Similar Product Controller
export const relatedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params

        const product = await productModel.find({
            category: cid,
            _id: { $ne: pid }
        })
            .select("-photo")
            .limit(3)
            .populate("category");
        res.status(200).send({
            success: true,
            product
        })


    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error in similar Product Api"
        })
    }
}

// get Product By category wise

export const productCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug })
        const product = await productModel.find({ category }).populate('category')
        res.status(200).send({
            success: true,
            product,
            category
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error While getting product"
        })

    }
}

// Payment gateway APi
// token
export const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function(err, response) {
            if (err) {
                res.status(500).send(err)
            } else {
                res.send(response)
            } 
        })
    } catch (error) {
        console.log(error)
    }
}

// Payment
export const braintreePaymentController = async (req, res) => {
    try {
        const { cart, nonce } = req.body
        let total = 0
        cart.map((item) => {
            total += item.price
        })
        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true,
            }
        },
            function (error, result) {
                if (result) {
                    const order = new orderModel({
                        products: cart,
                        payment: result,
                        buyer: req.user._id,
                    }).save()
                    res.json({ok:true})
                } else {
                    res.status(500).send(error)
                }
            }
        )
    } catch (error) {
        console.log(error)
    }
}