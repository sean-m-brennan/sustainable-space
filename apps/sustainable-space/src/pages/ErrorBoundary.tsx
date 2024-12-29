import {ReactNode, Component, ErrorInfo} from "react"

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: ErrorInfo | null
}

const defaultErrorFallback = (
    <p>Something went wrong. See the console for details.</p>
)

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    static defaultProps = {
        fallback: defaultErrorFallback
    }

    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null } as ErrorBoundaryState
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error: error }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(`${error.name}: ${error.message}`)
        if (info.componentStack)
            console.error(info.componentStack)
    }

    render() {
        if (this.state.hasError)
            return this.props.fallback

        return this.props.children
    }
}