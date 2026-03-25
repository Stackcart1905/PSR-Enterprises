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
  const { refetchProducts } = useProducts();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    description: "",
    type: "",
    image: "",
    images: [],
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

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
        type: item.type || "dry-fruit",
        description: item.description || "",
        images: [],
      });

      // Initialize previews from existing images
      const initialPreviews = Array.isArray(item.images)
        ? item.images.map(img => img.url || img)
        : item.image ? [item.image] : [];

      setImagePreviews(initialPreviews);
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // In Edit mode, we're replacing existing images if any new ones are selected
    // but the UI allows picking up to 5
    if (files.length > 5) {
      alert("Maximum 5 images allowed.");
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: files,
    }));
    setImagePreviews(newPreviews);

    // Clear error
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);

    const newPreviews = [...imagePreviews];
    // Revoke object URL if it was locally created
    if (newPreviews[index].startsWith('blob:')) {
      URL.revokeObjectURL(newPreviews[index]);
    }
    newPreviews.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
    setImagePreviews(newPreviews);
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

    // Use current images or new ones
    if (imagePreviews.length === 0 && formData.images.length === 0) {
      newErrors.images = "At least one image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.warn("Edit validation failed:", errors);
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("price", parseFloat(formData.price));
      if (formData.originalPrice)
        formDataToSend.append(
          "originalPrice",
          parseFloat(formData.originalPrice)
        );
      formDataToSend.append("stock", parseInt(formData.stock || 0));
      formDataToSend.append("category", formData.category);
      formDataToSend.append("type", formData.type);

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file) => {
          formDataToSend.append("images", file);
        });
      }

      const productId = item.id || item._id;
      console.log(`Sending PATCH request for product ${productId}...`);
      const response = await api.patch(`/api/products/${productId}`, formDataToSend);

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
          description: formData.description || "",
        };

        // Reset local state
        setFormData({
          name: "",
          category: "",
          price: "",
          originalPrice: "",
          stock: "",
          description: "",
          images: [],
        });
        setImagePreviews([]);

        onUpdate(updatedItem);
        navigate(-1);
      }
    } catch (error) {
      console.error("Error updating item:", error);
      setErrors({
        general:
          error.response?.data?.message ||
          "Failed to update item. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.category
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

            {/* //! Product Type */}
            <div className="space-y-2">
              <label
                htmlFor="type"
                className="text-sm font-medium text-gray-700"
              >
                Product Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.type
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
                  }`}
              >
                <option value="">Select Product Type</option>
                <option value="dry-fruit">Dry Fruit</option>
                <option value="grocery">Grocery</option>
              </select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type}</p>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.price
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.stock
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
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${errors.description
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
            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">
                Product Images (1-5) *
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {imagePreviews.length < 5 && (
                  <label
                    htmlFor="image-upload"
                    className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors aspect-square ${errors.images
                      ? "border-red-300 bg-red-50 hover:bg-red-100"
                      : "border-gray-300 hover:border-green-400 hover:bg-green-50"
                      }`}
                  >
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <span
                      className="text-xs font-medium text-gray-600"
                    >
                      {imagePreviews.length === 0 ? "Upload Images" : "Add More"}
                    </span>
                  </label>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Upload up to 5 images. New uploads will replace all current images.
              </p>

              {errors.images && (
                <p className="text-sm text-red-600">{errors.images}</p>
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
