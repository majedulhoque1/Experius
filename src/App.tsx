import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './components/layout/SiteLayout'

/*
  Every route is lazy so GSAP never reaches the shared chunk. On a previous
  build, importing GSAP into shared layout chrome took every marketing chunk
  from 3kB to 117kB — keep animation inside route-level components only, and
  diff the chunk table after touching anything under components/layout.
*/
const Home = lazy(() => import('./pages/Home'))
const Projects = lazy(() => import('./pages/Projects'))
const CaseStudy = lazy(() => import('./pages/CaseStudy'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const PersonalBrand = lazy(() => import('./pages/PersonalBrand'))
const Partnership = lazy(() => import('./pages/Partnership'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <BrowserRouter>
      <SiteLayout>
        <Suspense fallback={<div className="min-h-[70svh]" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<CaseStudy />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/personal-brand" element={<PersonalBrand />} />
            <Route path="/partnership" element={<Partnership />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </SiteLayout>
    </BrowserRouter>
  )
}
