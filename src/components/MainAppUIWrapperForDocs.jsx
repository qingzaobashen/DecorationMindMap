import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocsViewer from './DocsViewer';

/**
 * DocsViewer的包装组件
 * 为DocsViewer提供路由支持和布局
 */
function MainAppUIWrapperForDocs() {
  const { docName: rawDocNameFromParams } = useParams();
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

  const navigate = useNavigate();

  // Ensure docName always has .md, and handle cases where it might be undefined (though route should prevent this)
  // The route /docs redirects to /docs/README.md, so rawDocNameFromParams should generally be defined.
  const docName = rawDocNameFromParams || 'README'; // Fallback, e.g. if somehow /docs/:docName is hit with no param

  // Construct the path for fetching: served from /docs/filename.md
  // 使用import.meta.env.BASE_URL来动态获取base路径，确保在不同部署环境下都能正确访问文档
  //const documentToFetch = docName.endsWith('.md') ? docName : `${docName}.md`;
  const finalDocPath = `${import.meta.env.BASE_URL}docs/${docName}`;

  const handleDocNavigate = (newPath) => {
    // newPath from DocsViewer is usually a relative path like 'AnotherFile.md' or '../OtherDir/File.md'
    // Or an absolute path like '/docs/AnotherFile.md'
    if (newPath.startsWith('/docs/')) {
      navigate(newPath);
    } else if (newPath.startsWith('/')) { // e.g. /somefolder/AnotherFile.md
      navigate(`/docs${newPath}`);
    } else { // e.g. AnotherFile.md or ../OtherFolder/File.md
      // This needs careful handling if relative paths like ../ are used.
      // For simplicity, assuming newPath is a filename or relative to current /docs/ path.
      // A more robust solution might involve URL parsing if complex relative paths are needed.
      navigate(`/docs/${newPath}`);
    }
  };

  return (
    <div className="app-layout">
      <div className={`mainMap`}>
        <header className="view-header">
          {/* Display the name without .md for a cleaner title */}
          <h2>文档中心: {docName.replace('.md', '')}</h2>
        </header>
        <main className={`mindmap-wrapper mindWrapper-size docs-view-active`}>
          {/* Pass the correctly constructed path for fetching */}
          <DocsViewer docPath={finalDocPath} onNavigate={handleDocNavigate} />
        </main>
      </div>
    </div>
  );
}

export default MainAppUIWrapperForDocs;