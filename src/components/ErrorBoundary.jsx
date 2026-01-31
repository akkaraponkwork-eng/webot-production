import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 min-h-screen text-red-900 font-mono text-sm overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="font-bold">{this.state.error?.toString()}</p>
          <pre className="mt-4 p-4 bg-red-100 rounded text-xs whitespace-pre-wrap">
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
