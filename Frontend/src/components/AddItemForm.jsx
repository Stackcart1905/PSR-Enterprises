import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Upload, 
  X, 
  Save,
  ArrowLeft
} from 'lucide-react'

export default function AddItemForm({ onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    description: '',
    image: '',
    ingredients: '',
    benefits: '',
    origin: '',
    shelfLife: '',
    storage: '',
    certifications: '',
    nutritionFacts: {
      energy: '',
      protein: '',
      totalFat: '',
      carbohydrates: '',
      fiber: '',
      sugar: ''
    }
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  const categories = [
    'Nuts',
    'Dried Fruits',
    'Seeds',
    'Berries',
    'Dates',
    'Mixed',
    'Premium',
    'Organic'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Handle nested nutrition facts
    if (name.startsWith('nutrition_')) {
      const nutritionKey = name.replace('nutrition_', '')
      setFormData(prev => ({
        ...prev,
        nutritionFacts: {
          ...prev.nutritionFacts,
          [nutritionKey]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // In a real app, you'd upload to a server/cloud storage
      // For demo, we'll use a placeholder URL
      const demoImageUrl = `https://images.unsplash.com/photo-${Date.now()}?w=300`
      setFormData(prev => ({
        ...prev,
        image: demoImageUrl
      }))
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = 'Valid price is required'
    }

    if (!formData.stock || isNaN(formData.stock) || formData.stock < 0) {
      newErrors.stock = 'Valid stock quantity is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.image) {
      newErrors.image = 'Image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create item object
      const newItem = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stock: parseInt(formData.stock),
        ingredients: formData.ingredients.split(',').map(item => item.trim()).filter(item => item),
        benefits: formData.benefits.split(',').map(item => item.trim()).filter(item => item),
        certifications: formData.certifications.split(',').map(item => item.trim()).filter(item => item),
        nutritionFacts: Object.fromEntries(
          Object.entries(formData.nutritionFacts)
            .filter(([key, value]) => value.trim())
            .map(([key, value]) => [key.charAt(0).toUpperCase() + key.slice(1), value])
        )
      }

      onAdd(newItem)
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        price: '',
        originalPrice: '',
        stock: '',
        description: '',
        image: '',
        ingredients: '',
        benefits: '',
        origin: '',
        shelfLife: '',
        storage: '',
        certifications: '',
        nutritionFacts: {
          energy: '',
          protein: '',
          totalFat: '',
          carbohydrates: '',
          fiber: '',
          sugar: ''
        }
      })
      setImagePreview('')
      
    } catch (error) {
      console.error('Error adding item:', error)
      setErrors({ general: 'Failed to add item. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const clearImage = () => {
    setFormData(prev => ({ ...prev, image: '' }))
    setImagePreview('')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
        <p className="text-gray-600">Add a new dry fruit item to your inventory</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>
            Fill in the information below to add a new item
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {errors.general && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Item Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Item Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., Premium Almonds"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium text-gray-700">
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
                    errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="299.99"
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="originalPrice" className="text-sm font-medium text-gray-700">
                  Original Price (₹)
                </label>
                <input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="399.99"
                />
                <p className="text-xs text-gray-500">For showing discounts</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="stock" className="text-sm font-medium text-gray-700">
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
                    errors.stock ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="50"
                />
                {errors.stock && (
                  <p className="text-sm text-red-600">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Describe the item, its quality, origin, etc."
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Additional Product Details */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
              
              {/* Ingredients */}
              <div className="space-y-2">
                <label htmlFor="ingredients" className="text-sm font-medium text-gray-700">
                  Ingredients
                </label>
                <input
                  id="ingredients"
                  name="ingredients"
                  type="text"
                  value={formData.ingredients}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Separate ingredients with commas"
                />
                <p className="text-xs text-gray-500">Separate multiple ingredients with commas</p>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <label htmlFor="benefits" className="text-sm font-medium text-gray-700">
                  Health Benefits
                </label>
                <input
                  id="benefits"
                  name="benefits"
                  type="text"
                  value={formData.benefits}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Separate benefits with commas"
                />
                <p className="text-xs text-gray-500">Separate multiple benefits with commas</p>
              </div>

              {/* Origin, Shelf Life, Storage */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="origin" className="text-sm font-medium text-gray-700">
                    Origin
                  </label>
                  <input
                    id="origin"
                    name="origin"
                    type="text"
                    value={formData.origin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., California, India"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="shelfLife" className="text-sm font-medium text-gray-700">
                    Shelf Life
                  </label>
                  <input
                    id="shelfLife"
                    name="shelfLife"
                    type="text"
                    value={formData.shelfLife}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 12 months"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="storage" className="text-sm font-medium text-gray-700">
                    Storage Instructions
                  </label>
                  <input
                    id="storage"
                    name="storage"
                    type="text"
                    value={formData.storage}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Cool, dry place"
                  />
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <label htmlFor="certifications" className="text-sm font-medium text-gray-700">
                  Certifications
                </label>
                <input
                  id="certifications"
                  name="certifications"
                  type="text"
                  value={formData.certifications}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Organic, Non-GMO, Gluten-Free"
                />
                <p className="text-xs text-gray-500">Separate multiple certifications with commas</p>
              </div>

              {/* Nutrition Facts */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Nutrition Facts (per 100g)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="nutrition_energy" className="text-sm font-medium text-gray-700">
                      Energy
                    </label>
                    <input
                      id="nutrition_energy"
                      name="nutrition_energy"
                      type="text"
                      value={formData.nutritionFacts.energy}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="570 kcal"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nutrition_protein" className="text-sm font-medium text-gray-700">
                      Protein
                    </label>
                    <input
                      id="nutrition_protein"
                      name="nutrition_protein"
                      type="text"
                      value={formData.nutritionFacts.protein}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="21g"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nutrition_totalFat" className="text-sm font-medium text-gray-700">
                      Total Fat
                    </label>
                    <input
                      id="nutrition_totalFat"
                      name="nutrition_totalFat"
                      type="text"
                      value={formData.nutritionFacts.totalFat}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="50g"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nutrition_carbohydrates" className="text-sm font-medium text-gray-700">
                      Carbohydrates
                    </label>
                    <input
                      id="nutrition_carbohydrates"
                      name="nutrition_carbohydrates"
                      type="text"
                      value={formData.nutritionFacts.carbohydrates}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="22g"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nutrition_fiber" className="text-sm font-medium text-gray-700">
                      Fiber
                    </label>
                    <input
                      id="nutrition_fiber"
                      name="nutrition_fiber"
                      type="text"
                      value={formData.nutritionFacts.fiber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="12g"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nutrition_sugar" className="text-sm font-medium text-gray-700">
                      Sugar
                    </label>
                    <input
                      id="nutrition_sugar"
                      name="nutrition_sugar"
                      type="text"
                      value={formData.nutritionFacts.sugar}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="4g"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload */}
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
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  errors.image ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload product image</p>
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

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding Item...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Add Item
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
