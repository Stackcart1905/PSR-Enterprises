import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, X, Save, ArrowLeft } from "lucide-react";
import api from "../lib/axios";
import { useProducts } from "../contexts/ProductContext";

export default function EditItemForm({ item, onUpdate, onCancel }) {
  const navigate = useNavigate();
  const { refetchProducts } = useProducts?.() || { refetchProducts: null };
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    description: "",
    image: "",
    images: [],
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const categories = [
    { label: "Nuts", value: "Nuts" },
    { label: "Dried Fruits", value: "DriedFruits" },
    { label: "Seeds", value: "Seeds" },
    { label: "Berries", value: "Berries" },
    { label: "Dates", value: "Dates" },
    { label: "Mixed", value: "Mixed" },
    { label: "Premium", value: "Premium" },
    { label: "Organic", value: "organic" },
  ];

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category || "",
        price:
          (typeof item.price === "number"
            ? item.price
            : parseFloat(
                (item.price || "").toString().replace(/[^0-9.]/g, "")
              )) || "",
        originalPrice:
          (typeof item.originalPrice === "number"
            ? item.originalPrice
            : parseFloat(
                (item.originalPrice || "").toString().replace(/[^0-9.]/g, "")
              )) || "",
        stock: item.stock?.toString() || "",
        description: item.description || "",
        image: item.image || "",
        images: [],
      });
      setImagePreview(item.image || "");
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        images: [file],
      }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Item name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.stock || isNaN(formData.stock) || formData.stock < 0) {
      newErrors.stock = "Valid stock quantity is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Image not required if keeping existing image
    if (
      (!formData.image || formData.image.length === 0) &&
      (!formData.images || formData.images.length === 0)
    ) {
      newErrors.image = "Image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", parseFloat(formData.price));
      if (formData.originalPrice)
        formDataToSend.append(
          "originalPrice",
          parseFloat(formData.originalPrice)
        );
      formDataToSend.append("stock", parseInt(formData.stock || 0));
      formDataToSend.append("category", formData.category);

      if (formData.images && formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          formDataToSend.append("images", formData.images[i]);
        }
      }

      const id = item.id || item._id;
      const response = await api.patch(`/api/products/${id}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (typeof refetchProducts === "function") {
        await refetchProducts();
      }

      if (typeof onUpdate === "function") {
        const updatedItem = {
          ...(response.data?.product || {}),
          id: id,
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice
            ? parseFloat(formData.originalPrice)
            : undefined,
          stock: parseInt(formData.stock || 0),
          description: formData.description,
          image:
            imagePreview ||
            (Array.isArray(item.images) && item.images[0]) ||
            item.image ||
            "",
        };
        //? clear form before navigating away
        setFormData({
          name: "",
          category: "",
          price: "",
          originalPrice: "",
          stock: "",
          description: "",
          image: "",
          images: [],
        });
        setImagePreview("");
        onUpdate(updatedItem);
        navigate(-1);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      // optimistic redirect on network/parse issues when backend actually persisted changes
      if (typeof onUpdate === "function") {
        const id = item.id || item._id;
        const optimistic = {
          id,
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice
            ? parseFloat(formData.originalPrice)
            : undefined,
          stock: parseInt(formData.stock || 0),
          description: formData.description,
          image: imagePreview || item.image || "",
        };
        // clear form before navigating away
        setFormData({
          name: "",
          category: "",
          price: "",
          originalPrice: "",
          stock: "",
          description: "",
          image: "",
          images: [],
        });
        setImagePreview("");
        onUpdate(optimistic);
        navigate("/admin/dashboard");
        return;
      }
      setErrors({
        general:
          error.response?.data?.message ||
          "Failed to update item. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setImagePreview("");
  };

  if (!item) {
    return <div>No item to edit</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Items
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Item</h2>
          <p className="text-gray-600">Update the details for "{item.name}"</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            Update the information below to edit the item
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.general}
              </div>
            )}

            {/* //! Item Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Item Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
                }`}
                placeholder="e.g., Premium Almonds"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* //! Category */}
            <div className="space-y-2">
              <label
                htmlFor="category"
                className="text-sm font-medium text-gray-700"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.category
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* //! Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="price"
                  className="text-sm font-medium text-gray-700"
                >
                  Price (₹) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.price
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="299.99"
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="stock"
                  className="text-sm font-medium text-gray-700"
                >
                  Stock Quantity *
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.stock
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="50"
                />
                {errors.stock && (
                  <p className="text-sm text-red-600">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* //! Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-gray-700"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  errors.description
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Describe the item, its quality, origin, etc."
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* //! Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Product Image *
              </label>

              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    errors.image
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload product image
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    Choose File
                  </label>
                </div>
              )}
              {errors.image && (
                <p className="text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            {/* //! Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Update Item
                  </div>
                )}
              </Button>
            </div>
            
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
