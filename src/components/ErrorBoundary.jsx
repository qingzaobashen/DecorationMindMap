import React from 'react';
import { Button } from 'antd';

/**
 * 错误边界组件，用于捕获和处理子组件树中的JavaScript错误
 * 避免整个应用崩溃，提供友好的错误提示界面
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // 更新状态，下次渲染时显示降级UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // 自定义降级UI
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>抱歉，应用遇到了问题</h2>
            <p>我们已经记录了这个错误，技术团队会尽快处理。</p>
            <p className="error-message">{this.state.error?.toString()}</p>
            <Button type="primary" onClick={this.handleReset}>
              尝试恢复
            </Button>
          </div>
        </div>
      );
    }

    // 正常渲染子组件
    return this.props.children;
  }
}

export default ErrorBoundary;
