import { createBrowserRouter, RouteObject } from 'react-router-dom'

import Home from "./pages/Home"
import Blog from "./pages/Blog"
import About from "./pages/About"
import OrreryApp from './pages/orrery/OrreryApp'
import NotFound from "./pages/NotFound"
import Network from './pages/Network'

export type Page = {
    name?: string
} & RouteObject

export const pages: Page[] = [
    {name: "Home", path: "/", element: <Home/>},
    {name: "Tour", path: "/tour/", element: <OrreryApp tour={true}/>},
    {name: "Explore", path: "/explore/", element: <OrreryApp tour={false}/>},
    {name: "Network", path: "/network/", element: <Network/>},
    {name: "Blog", path: "/blog/", element: <Blog/>},
    {name: "About", path: "/about/", element: <About/>},
    {path: "*", element: <NotFound/>},
]

export const router = createBrowserRouter(pages, {basename: "/sustainable-space/"})
