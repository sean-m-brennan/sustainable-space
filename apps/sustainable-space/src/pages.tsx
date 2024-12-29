import { createBrowserRouter, RouteObject } from 'react-router-dom'

import Home from "./pages/Home"
import Blog from "./pages/Blog"
import About from "./pages/About"
import OrreryApp from './pages/orrery/OrreryApp'
import NotFound from "./pages/NotFound"
import Network from './pages/Network'


export type PageProps = {
    base: string
}

export type Page = {
    name?: string
} & RouteObject

const base=  "/sustainable-space/"

export const pages: Page[] = [
    {name: "Home", path: "/", element: <Home base={base}/>},
    {name: "Tour", path: "/tour/", element: <OrreryApp base={base} tour={true}/>},
    {name: "Explore", path: "/explore/", element: <OrreryApp base={base} tour={false}/>},
    {name: "Network", path: "/network/", element: <Network base={base}/>},
    {name: "Blog", path: "/blog/", element: <Blog base={base}/>},
    {name: "About", path: "/about/", element: <About base={base}/>},
    {path: "*", element: <NotFound base={base}/>},
]

export const router = createBrowserRouter(pages, {basename: base})
