import React from 'react';
import { TerminalIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/outline';

const CodeBlock = ({ language = 'bash', title, children, colorMode }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-lg overflow-hidden mb-6 ${
      colorMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
    }`}>
      <div className={`px-4 py-2 ${
        colorMode === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
      } flex items-center justify-between`}>
        <div className="flex items-center">
          <TerminalIcon className="h-5 w-5 mr-2" />
          <span className="font-mono text-sm">{title || language}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`p-1 rounded hover:bg-gray-600/20 transition`}
          title="Copier le code"
        >
          {copied ? (
            <CheckIcon className="h-5 w-5 text-green-500" />
          ) : (
            <ClipboardIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className={`font-mono text-sm ${
          colorMode === 'dark' ? 'text-gray-300' : 'text-gray-800'
        }`}>
          {children}
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;