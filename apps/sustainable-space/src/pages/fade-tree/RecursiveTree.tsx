import {CSSProperties, ReactElement} from "react"
import FadeTreeBranch, {FadeTreeBranchProps} from "./FadeTreeBranch"
import {MaskInfo} from "./useFade"
import {defaultLineInfo, defaultShapeInfo, LineInfo, px2num, ShapeInfo} from "./util"

export interface NodeInfo {
    name: string
    description?: string  // text
    more?: {
        link: string  // url
        source: string  // file
    }
    interlogue?: {  // text between parent and children
        text: string
        span?: boolean
        color?: string
        size?: string
        family?: string
    }
}

export interface TreeNodeInfo extends NodeInfo {
    meta?: ShapeInfo
    edge?: LineInfo
    parents?: string[]
    children?: TreeNodeInfo[]
}

type Branch = ReactElement<FadeTreeBranchProps>

export type Branches = Branch | Branch[]

export type Position = {x: number; y: number}

export type PositionSize = {x: number; y: number, w: number, h: number}

type Directory = {[id:string]: number}

export type Rooting = "left" | "right" | "top" | "bottom"

export type NavFunc = (to: string) => void

export type RecursiveTreeProps = {
    height: number
    width: number
    top?: number
    left?: number
    rooted?: Rooting
    style?: CSSProperties
    nodeInfo?: ShapeInfo
    edgeInfo?: LineInfo
    nav?: NavFunc
}

class RecursiveTree {
    nodeTop: number
    private readonly indices: {[id:number]: number}
    private readonly rooted?: Rooting
    private readonly style?: CSSProperties
    private readonly top: number
    private readonly left: number
    private readonly width: number
    private readonly height: number
    private readonly indexer: Directory
    private readonly nodeInfo: ShapeInfo
    private readonly edgeInfo: LineInfo
    private readonly nav?: NavFunc
    private readonly nodes: Record<string, PositionSize>
    private idx: number
    private levels: number[]
    private maxDepth: number

    constructor(props: RecursiveTreeProps) {
        this.indices = {}
        this.idx = 0
        this.width = props.width
        this.height = props.height
        this.top = props.top ? props.top : 0
        this.left = props.left ? props.left : 0
        this.rooted = props.rooted
        this.style = props.style
        this.levels = []  // sibling count
        this.indexer = {}  // name-to-level-index
        this.maxDepth = 0
        this.nodeInfo = {...defaultShapeInfo, ...props.nodeInfo}
        this.edgeInfo = {...defaultLineInfo, ...props.edgeInfo}
        this.nav = props.nav
        this.nodeTop = 0
        this.nodes = {}
    }

    init(root: TreeNodeInfo) {
        const [depth, levels] = this.levelling(root)
        levels.unshift(1)
        this.indexer[root.name] = 0
        this.maxDepth = depth
        this.levels = levels
        this.recordPositionSize(root)
    }

    // TODO convert to iterative
    private levelling(root: TreeNodeInfo): [number, number[]] {
        let count = 0
        let depth = 0
        let levels: number[] = []
        if (root.children) {
            const prev: number[][] = []
            count = root.children.length
            for (const child of root.children) {
                const [d, l] = this.levelling(child)
                depth = Math.max(depth, d)
                if (this.indices[depth] === undefined) {
                    this.indices[depth] = 0
                }
                prev.push(l)
                this.indexer[child.name] = this.indices[depth]++
            }
            const deepest = Math.max(...prev.map((lvls): number => lvls.length))
            levels = Array(deepest).fill(0) as number[]
            for (let i = 0; i < prev.length; i++) {
                for (let j = 0; j < prev[i].length; j++) {
                    levels[j] += prev[i][j]
                }
            }
        }
        levels.unshift(count)
        return [depth + 1, levels]
    }

    // TODO convert to iterative
    private recordPositionSize(root: TreeNodeInfo, depth: number = 1): PositionSize {
        let nodeInfo = this.nodeInfo
        if (root.meta)
            nodeInfo = {...this.nodeInfo, ...root.meta}
        const nodeHeight = px2num(nodeInfo.height)
        const nodeWidth = px2num(nodeInfo.width)

        const maxBreadth = this.levels[depth - 1]
        let posSize: PositionSize
        if (!this.rooted || this.rooted === "top" || this.rooted === "bottom") {
            const subWidth = this.width / (maxBreadth + 1)
            const xMult = this.indexer[root.name] + 1
            let yMult = depth
            if (this.rooted === "bottom")
                yMult = this.maxDepth + 1 - yMult
            posSize = {
                x: xMult * subWidth + this.left - (nodeWidth / 2.),
                y: yMult * (this.height / (this.maxDepth + 1)) + this.top,
                w: nodeWidth,
                h: nodeHeight,
            }
        } else {
            const subHeight = this.height / (maxBreadth + 1)
            const yMult = this.indexer[root.name] + 1
            let xMult = depth
            if (this.rooted === "right")
                xMult = this.maxDepth - xMult
            posSize = {
                x: xMult * (this.width / (this.maxDepth + 1)) + this.left,
                y: yMult * subHeight + this.top - (nodeHeight / 2.),
                w: nodeWidth,
                h: nodeHeight,
            }
        }
        this.nodes[root.name] = posSize

        if (root.children) {
            for (const child of root.children) {
                this.recordPositionSize(child, depth + 1)
            }
        }
        return posSize
    }

    // TODO convert to iterative
    recur(root: TreeNodeInfo, mask: MaskInfo, parents?: PositionSize[], depth: number = 1): Branch {
        let nodeInfo = this.nodeInfo
        if (root.meta)
            nodeInfo = {...this.nodeInfo, ...root.meta}
        let edgeInfo = this.edgeInfo
        if (root.edge)
            edgeInfo = {...this.edgeInfo, ...root.edge}

        const posSize = this.nodes[root.name]
        if (this.nodeTop === 0)
            this.nodeTop = posSize.y
        this.nodeTop = Math.min(this.nodeTop, posSize.y)
        const key = this.idx++

        const branches: Branch[] = []
        if (root.children) {
            for (const child of root.children) {
                const coParents = [posSize]
                if (child.parents) {
                    for (const parent of child.parents) {
                        if (!Object.keys(this.nodes).includes(parent)) {
                            console.error(`${parent} not in tree. Skipping.`)
                            continue
                        }
                        const ps = this.nodes[parent]
                        coParents.push(ps)
                    }
                }
                branches.push(this.recur(child, mask, coParents, depth + 1))
            }
        }
        const info = root as NodeInfo

        return (
            <FadeTreeBranch key={key} {...info} nodeInfo={nodeInfo} edgeInfo={edgeInfo}
                            mask={mask} style={this.style} positionSize={posSize} parents={parents}
                            direction={this.rooted} nav={this.nav}>
                {branches}
            </FadeTreeBranch>
        )
    }
}
export default RecursiveTree
