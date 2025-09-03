import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import DryFruitsSlider from './components/DryFruitsSlider'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <DryFruitsSlider />
      </main>
      <Footer />
    </div>
  )
}

export default App
