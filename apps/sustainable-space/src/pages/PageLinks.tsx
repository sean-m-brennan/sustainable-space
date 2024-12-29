import { Link } from "react-router-dom"
import {Page} from "../pages"
import css from "./style.module.css"

export type PageLinksProps ={
    pages: Page[]
    baseName?: string
    action: () => void
    routed?: boolean
}

export function PageLinks({pages, baseName, routed=false, action}: PageLinksProps) {
    let base = baseName ? baseName : "//"
    if (base.endsWith('/'))
        base = base.substring(0, base.length - 1)

    return (
        <ul className={css.route_list}>
            {pages.map((page, idx) => {
                if (!page.path || !page.name)
                    return
                const link = routed ?
                    <Link className={css.route_link} to={page.path} onClick={action}>{page.name}</Link> :
                    <a className={css.route_link} href={`${base}${page.path}`} onClick={action}>{page.name}</a>
                return (<li key={idx}>{link}</li>)
            })}
        </ul>
    )
}
