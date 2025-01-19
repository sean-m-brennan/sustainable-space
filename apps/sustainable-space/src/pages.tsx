import { createBrowserRouter, RouteObject } from 'react-router-dom'
import {fetchJsonSync} from "fetch-sync"

import Home from "./pages/Home"
import Blog from "./pages/Blog"
import About from "./pages/About"
import OrreryApp from './pages/orrery/OrreryApp'
import NotFound from "./pages/NotFound"
import Network from './pages/Network'
import Template from "./pages/Template"
import {TreeNodeInfo} from "./pages/fade-tree/FadeTree"

import tree from "/content.json?url"


export type PageProps = {
    base: string
}

export type Page = {
    name?: string
} & RouteObject

const base = "/sustainable-space/"

const descendTree = (root: TreeNodeInfo) => {
    const branches: Page[] = []
    if (root.children) {
        for (const child of root.children) {
            branches.concat(descendTree(child))
        }
    }
    if (root.more)
        branches.push({
            name: root.name, path: root.more.link,
            element: <Template base={base} name={root.name} url={root.more.source} />
        } as Page)
    return branches
}

const parseTree = () => {
    const root = fetchJsonSync(tree) as TreeNodeInfo
    return descendTree(root)
}


export const pages: Page[] = ([
    {name: "Home", path: "/", element: <Home base={base}/>},
    {name: "Tour", path: "/tour/", element: <OrreryApp base={base} tour={true}/>},
    {name: "Explore", path: "/explore/", element: <OrreryApp base={base} tour={false}/>},
    {name: "Network", path: "/network/", element: <Network base={base}/>},
    {name: "Blog", path: "/blog/", element: <Blog base={base}/>},
    {name: "About", path: "/about/", element: <About base={base}/>},
] as Page[])
    .concat(parseTree())
    .concat([{path: "*", element: <NotFound base={base}/>}])

export const router = createBrowserRouter(pages, {basename: base})
export {useNavigate} from "react-router-dom"
