const Category = require("../models/Category");
const ErrorResponse = require("../utills/errorResponse");

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort("name");

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create({
      name: req.body.name,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!category) {
      return next(
        new ErrorResponse(`Category not found with id ${req.params.id}`, 404),
      );
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return next(
        new ErrorResponse(`Category not found with id ${req.params.id}`, 404),
      );
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};
