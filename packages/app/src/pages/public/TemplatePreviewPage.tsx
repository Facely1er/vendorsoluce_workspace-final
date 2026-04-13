import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Download, Eye, FileText, AlertTriangle, Loader, Copy, ChevronRight, ChevronDown, Lightbulb } from 'lucide-react';
import { downloadTemplateFile } from '../../utils/generatePdf';
import { logger } from '../../utils/logger';
import DOMPurify from 'dompurify';

const TemplatePreviewPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [formattedContent, setFormattedContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isJson, setIsJson] = useState(false);
  const [jsonData, setJsonData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');
  const [copySuccess, setCopySuccess] = useState(false);

  const { templatePath, filename } = location.state || {};

  // Check for dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!templatePath || !filename) {
      navigate('/templates');
      return;
    }

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For HTML files or files that should be previewed as HTML, fetch directly
        if (filename.endsWith('.html') || filename.endsWith('.docx') || filename.endsWith('.pdf') || filename.endsWith('.pptx')) {
          // For these types, we'll try to fetch the HTML version
          const htmlPath = templatePath.replace(/\.(docx|pdf|pptx)$/, '.html');
          // Ensure template path is correct - normalize to /templates/...
          const fullHtmlPath = htmlPath.startsWith('/templates/')
            ? htmlPath
            : htmlPath.startsWith('/')
            ? `/templates${htmlPath}`
            : `/templates/${htmlPath}`;
          
          const response = await fetch(fullHtmlPath);
          if (response.ok) {
            let htmlContent = await response.text();
            
            // Inject dark theme styles if dark mode is active
            if (isDarkMode) {
              const darkThemeStyles = `
                <style id="vendorsoluce-dark-theme">
                  * {
                    color-scheme: dark;
                  }
                  html, body {
                    background-color: #111827 !important;
                    color: #F9FAFB !important;
                  }
                  body {
                    background-color: #111827 !important;
                    color: #F9FAFB !important;
                  }
                  h1, h2, h3, h4, h5, h6 {
                    color: #FFFFFF !important;
                  }
                  h1 {
                    color: #60A5FA !important;
                    border-bottom-color: #3B82F6 !important;
                  }
                  h2 {
                    color: #34D399 !important;
                    border-bottom-color: #374151 !important;
                  }
                  h3 {
                    color: #3B82F6 !important;
                  }
                  p, span, div, li, td, th, label, dt, dd {
                    color: #E5E7EB !important;
                  }
                  table {
                    border-color: #374151 !important;
                    background-color: #1F2937 !important;
                  }
                  th, td {
                    border-color: #374151 !important;
                    color: #E5E7EB !important;
                  }
                  th {
                    background-color: #374151 !important;
                    color: #FFFFFF !important;
                  }
                  tr:nth-child(even) {
                    background-color: #1F2937 !important;
                  }
                  tr:nth-child(odd) {
                    background-color: #111827 !important;
                  }
                  code, pre {
                    background-color: #1F2937 !important;
                    color: #F9FAFB !important;
                    border-color: #374151 !important;
                  }
                  code {
                    background-color: #1F2937 !important;
                    color: #F9FAFB !important;
                  }
                  blockquote {
                    border-left-color: #4B5563 !important;
                    background-color: #1F2937 !important;
                    color: #E5E7EB !important;
                  }
                  .info-box, .tip-box, .warning-box, .note-box, .alert-box, [class*="box"] {
                    background-color: #1F2937 !important;
                    border-left-color: #3B82F6 !important;
                    color: #E5E7EB !important;
                  }
                  .info-box {
                    background-color: #1E3A5F !important;
                    border-left-color: #3B82F6 !important;
                    color: #DBEAFE !important;
                  }
                  .warning-box, .alert-box {
                    background-color: #7F1D1D !important;
                    border-left-color: #DC2626 !important;
                    color: #FEE2E2 !important;
                  }
                  .tip-box {
                    background-color: #064E3B !important;
                    border-left-color: #10B981 !important;
                    color: #D1FAE5 !important;
                  }
                  ul, ol {
                    color: #E5E7EB !important;
                  }
                  li {
                    color: #E5E7EB !important;
                  }
                  a {
                    color: #60A5FA !important;
                  }
                  a:hover {
                    color: #93C5FD !important;
                  }
                  a:visited {
                    color: #A78BFA !important;
                  }
                  strong, b {
                    color: #FFFFFF !important;
                  }
                  em, i {
                    color: #D1D5DB !important;
                  }
                  hr {
                    border-color: #374151 !important;
                  }
                  .highlight, mark {
                    background-color: #F59E0B !important;
                    color: #111827 !important;
                  }
                  .footer {
                    color: #9CA3AF !important;
                    border-top-color: #374151 !important;
                  }
                  .header-logo {
                    color: #E5E7EB !important;
                  }
                  input, textarea, select {
                    background-color: #1F2937 !important;
                    color: #F9FAFB !important;
                    border-color: #374151 !important;
                  }
                  button {
                    background-color: #3B82F6 !important;
                    color: #FFFFFF !important;
                    border-color: #2563EB !important;
                  }
                  button:hover {
                    background-color: #2563EB !important;
                  }
                </style>
              `;
              
              // Insert styles before closing head tag, or at the beginning if no head tag
              if (htmlContent.includes('</head>')) {
                htmlContent = htmlContent.replace('</head>', `${darkThemeStyles}</head>`);
              } else if (htmlContent.includes('<body>')) {
                htmlContent = htmlContent.replace('<body>', `<head>${darkThemeStyles}</head><body>`);
              } else {
                htmlContent = darkThemeStyles + htmlContent;
              }
            }
            
            setContent(htmlContent);
          } else {
            throw new Error('Template preview not available');
          }
        } else {
          // For JSON, CSV, SH files, fetch as text
          // Ensure template path is correct - normalize to /templates/...
          const fullPath = templatePath.startsWith('/templates/')
            ? templatePath
            : templatePath.startsWith('/')
            ? `/templates${templatePath}`
            : `/templates/${templatePath}`;
          
          const response = await fetch(fullPath);
          if (response.ok) {
            const textContent = await response.text();
            setContent(textContent);
            
            // Enhanced JSON handling
            if (filename.endsWith('.json')) {
              setIsJson(true);
              try {
                const parsed = JSON.parse(textContent);
                setJsonData(parsed);
                // Pretty-print JSON with 2-space indentation
                const formatted = JSON.stringify(parsed, null, 2);
                setFormattedContent(formatted);
              } catch (e) {
                // If JSON parsing fails, show as text
                setIsJson(false);
                setFormattedContent(textContent);
              }
            } else {
              setIsJson(false);
              setFormattedContent(textContent);
            }
          } else {
            throw new Error('Template not found');
          }
        }
      } catch (err) {
        logger.error('Error loading template:', err);
        setError(err instanceof Error ? err.message : 'Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [templatePath, filename, navigate, isDarkMode]);

  const handleDownload = () => {
    if (templatePath && filename) {
      downloadTemplateFile(templatePath, filename);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedContent || content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // JSON Tree Viewer Component
  const JsonTreeViewer: React.FC<{ data: any; level?: number; path?: string }> = ({ data, level = 0, path = '' }) => {
    const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels
    
    if (data === null) {
      return <span className="text-purple-500 dark:text-purple-400 font-medium">null</span>;
    }
    
    if (typeof data === 'string') {
      return <span className="text-green-600 dark:text-green-400">"{data}"</span>;
    }
    
    if (typeof data === 'number') {
      return <span className="text-blue-600 dark:text-blue-400 font-medium">{data}</span>;
    }
    
    if (typeof data === 'boolean') {
      return <span className="text-orange-600 dark:text-orange-400 font-medium">{data ? 'true' : 'false'}</span>;
    }
    
    if (Array.isArray(data)) {
      return (
        <div className="ml-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-1 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
            <span className="text-purple-600 dark:text-purple-400 font-semibold">Array</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">({data.length} {data.length === 1 ? 'item' : 'items'})</span>
          </button>
          {isExpanded && (
            <div className="ml-6 border-l-2 border-gray-300 dark:border-gray-600 pl-4 mt-1">
              {data.map((item, index) => (
                <div key={index} className="mb-2">
                  <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">{index}:</span>{' '}
                  <JsonTreeViewer data={item} level={level + 1} path={`${path}[${index}]`} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      return (
        <div className="ml-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-1 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Object</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">({keys.length} {keys.length === 1 ? 'property' : 'properties'})</span>
          </button>
          {isExpanded && (
            <div className="ml-6 border-l-2 border-gray-300 dark:border-gray-600 pl-4 mt-1">
              {keys.map((key) => (
                <div key={key} className="mb-2">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">"{key}"</span>
                  <span className="text-gray-500 dark:text-gray-400">: </span>
                  <JsonTreeViewer data={data[key]} level={level + 1} path={path ? `${path}.${key}` : key} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return <span className="text-gray-700 dark:text-gray-300">{String(data)}</span>;
  };

  const isHtmlContent = filename?.endsWith('.html') || filename?.endsWith('.docx') || filename?.endsWith('.pdf') || filename?.endsWith('.pptx');
  const fileExtension = filename?.split('.').pop()?.toUpperCase() || 'FILE';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <Loader className="animate-spin h-12 w-12 text-vendorsoluce-green mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading template preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Preview Not Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <div className="flex justify-center space-x-3">
            <Button onClick={() => navigate('/templates')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
            <Button onClick={handleDownload} variant="primary">
              <Download className="h-4 w-4 mr-2" />
              Download Anyway
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <Button 
              onClick={() => navigate('/templates')} 
              variant="outline" 
              size="sm"
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Template Preview</h1>
              <p className="text-gray-600 dark:text-gray-300 flex items-center text-base">
                <FileText className="h-4 w-4 mr-2" />
                <span className="font-medium">{filename}</span>
                <span className="ml-3 px-2.5 py-1 bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 text-vendorsoluce-green dark:text-vendorsoluce-blue rounded-md text-xs font-semibold">
                  {fileExtension}
                </span>
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" size="sm" disabled>
              <Eye className="h-4 w-4 mr-2" />
              Preview Mode
            </Button>
            <Button onClick={handleDownload} variant="primary">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isHtmlContent ? (
            <div className="relative">
              <iframe
                srcDoc={content}
                className="w-full h-screen border-0 bg-white dark:bg-gray-900"
                title="Template Preview"
                sandbox="allow-same-origin"
              />
              <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700 z-10">
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Interactive Preview
                </span>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="mb-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Template Content</h3>
                  {isJson && jsonData && (
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        Valid JSON
                      </span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                        {typeof jsonData === 'object' && !Array.isArray(jsonData) 
                          ? `${Object.keys(jsonData).length} ${Object.keys(jsonData).length === 1 ? 'key' : 'keys'}`
                          : Array.isArray(jsonData)
                          ? `${jsonData.length} ${jsonData.length === 1 ? 'item' : 'items'}`
                          : '1 value'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {(formattedContent || content).split('\n').length} lines
                  </span>
                  <button
                    onClick={handleCopy}
                    className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-colors shadow-sm flex items-center gap-1.5 ${
                      copySuccess
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    title="Copy to clipboard"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Enhanced JSON Preview */}
              {isJson && jsonData ? (
                <div className="space-y-6">
                  {/* Toggle between Tree View and Raw JSON */}
                  <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <button
                      onClick={() => setViewMode('tree')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        viewMode === 'tree'
                          ? 'bg-vendorsoluce-green text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      Tree View
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        viewMode === 'raw'
                          ? 'bg-vendorsoluce-green text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      Raw JSON
                    </button>
                  </div>

                  {viewMode === 'tree' ? (
                    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto font-mono text-sm">
                      <JsonTreeViewer data={jsonData} />
                    </div>
                  ) : (
                    <div className="relative">
                      <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 dark:bg-gray-900 p-6 rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto leading-relaxed">
                        <code className="block">
                          {formattedContent.split('\n').map((line, index) => {
                            // Basic syntax highlighting without external library
                            const highlighted = line
                              .replace(/"([^"]+)":/g, '<span class="text-indigo-600 dark:text-indigo-400 font-semibold">"$1":</span>')
                              .replace(/:\s*"([^"]+)"/g, ': <span class="text-green-600 dark:text-green-400">"$1"</span>')
                              .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-blue-600 dark:text-blue-400 font-medium">$1</span>')
                              .replace(/:\s*(true|false)/g, (match, value) => {
                                return `: <span class="text-orange-600 dark:text-orange-400 font-medium">${value}</span>`;
                              })
                              .replace(/:\s*(null)/g, ': <span class="text-purple-500 dark:text-purple-400 font-medium">null</span>');
                            
                            return (
                              <div key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800 px-2 -mx-2 rounded transition-colors">
                                <span className="text-gray-400 dark:text-gray-600 mr-4 select-none inline-block w-8 text-right">
                                  {index + 1}
                                </span>
                                <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlighted, { ALLOWED_TAGS: ['span'], ALLOWED_ATTR: ['class'] }) }} className="text-gray-900 dark:text-gray-100" />
                              </div>
                            );
                          })}
                        </code>
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                // Non-JSON file display (CSV, SH, etc.)
                <div className="relative">
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 dark:bg-gray-900 p-6 rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto leading-relaxed text-gray-800 dark:text-gray-200">
                    <code className="block text-gray-900 dark:text-gray-100">{(formattedContent || content)}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">About This Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">File Type</span>
              <span className="text-base font-medium text-gray-900 dark:text-white">{fileExtension}</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Purpose</span>
              <span className="text-base font-medium text-gray-900 dark:text-white">NIST SP 800-161 Compliance</span>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Usage</span>
              <span className="text-base font-medium text-gray-900 dark:text-white">Download and customize</span>
            </div>
          </div>
          <div className="p-5 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg">
            <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
              <span className="inline-flex items-start gap-2">
                <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-300" aria-hidden />
                <span>
                  <strong className="font-semibold text-blue-900 dark:text-blue-100">Usage tip:</strong> This template is designed to be customized for your organization&apos;s specific needs.
                  {' '}
                  Download and modify the content to match your requirements and branding.
                </span>
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplatePreviewPage;