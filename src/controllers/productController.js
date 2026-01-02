import mongoose from 'mongoose';
import Product from '../models/Product.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      quantity,
      image,
      variants,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required',
      });
    }

    let processedVariants = [];

    if (variants && Array.isArray(variants)) {
      processedVariants = variants.map((variant) => ({
        _id: new mongoose.Types.ObjectId(),
        name: variant.name,
        type: variant.type,
        price: variant.price || 0,
        stock: variant.stock || 0,
        image: variant.image || null,
      }));
    }

    const product = new Product({
      name,
      description,
      price,
      quantity,
      image,
      variants: processedVariants,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { variants, ...rest } = req.body;

    let updatedData = { ...rest };

    if (variants && Array.isArray(variants)) {
      updatedData.variants = variants.map((variant) => ({
        _id: variant._id || new mongoose.Types.ObjectId(),
        name: variant.name,
        type: variant.type,
        price: variant.price || 0,
        stock: variant.stock || 0,
        image: variant.image || null,
      }));
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};
