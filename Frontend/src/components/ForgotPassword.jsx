import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Mail, 
  Send, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Shield
} from 'lucide-react'
import useAuthStore from '../store/authStore.js'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { forgetPassword } = useAuthStore()
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState('request') // 'request', 'sent', 'success'
  const [resendCooldown, setResendCooldown] = useState(0)

  const handleBack = () => {
    navigate('/login')
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    
    // Clear error when user starts typing
    if (errors.email) {
      setErrors(prev => ({
        ...prev,
        email: ''
      }))
    }
  }

  const validateEmail = () => {
    const newErrors = {}

    if (!email) {
      newErrors.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationErrors = validateEmail()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await forgetPassword(email)
      setStep('sent')
    
      navigate('/reset-password', { state: { email } })

      //? Start resend cooldown
      setResendCooldown(60)
      const countdown = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(countdown)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      const msg = error?.message || 'Failed to send reset OTP. Please try again.'
      setErrors({ general: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setIsLoading(true)
    
    try {
      await forgetPassword(email)
      
      //? Start resend cooldown again
      setResendCooldown(60)
      const countdown = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(countdown)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      const msg = error?.message || 'Failed to resend OTP. Please try again.'
      setErrors({ general: msg })
    } finally {
      setIsLoading(false)
    }
  }

  const renderRequestStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-gray-600">
          No worries! Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{errors.general}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full py-3"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Sending Reset Link...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Reset Link
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1 mx-auto transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    </div>
  )

  const renderSentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
        <p className="text-gray-600 mb-4">
          We've sent a password reset link to:
        </p>
        <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
          {email}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Security Note:</p>
            <p>
              The reset link will expire in 15 minutes for your security. 
              If you don't see the email, check your spam folder.
            </p>
          </div>
        </div>
      </div>

      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{errors.general}</span>
        </div>
      )}

      <div className="space-y-3">
        <Button 
          onClick={handleResend}
          variant="outline" 
          className="w-full"
          disabled={isLoading || resendCooldown > 0}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
              Resending...
            </>
          ) : resendCooldown > 0 ? (
            <>
              <Clock className="w-4 h-4 mr-2" />
              Resend in {resendCooldown}s
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Resend Email
            </>
          )}
        </Button>

        <div className="text-center">
          <button
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">PSR</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {step === 'request' && renderRequestStep()}
          {step === 'sent' && renderSentStep()}
        </CardContent>
      </Card>

      {/* Help Section */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help? Contact our support team
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span>support@psrenterprises.com</span>
            <span>•</span>
            <span>+91 9876543210</span>
          </div>
        </div>
      </div>
    </div>
  )
}