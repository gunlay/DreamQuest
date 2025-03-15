// src/components/Markdown.tsx
import React from 'react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
import { RichText } from '@tarojs/components';

// 将 Markdown 节点转换为 rich-text 节点
const markdownToRichTextNodes = (children: any) => {
  console.log('children', children);
  
  return Array.isArray(children) ? children.map((child: any, index: number) => {
    if (typeof child === 'string') {
      return { name: 'text', attrs: {}, children: [{ text: child }] };
    }
    if (child.type === 'strong') {
      return { name: 'strong', attrs: {}, children: markdownToRichTextNodes(child.props.children) };
    }
    if (child.type === 'em') {
      return { name: 'em', attrs: {}, children: markdownToRichTextNodes(child.props.children) };
    }
    if (child.type === 'img') {
      return { name: 'img', attrs: { src: child.props.src, alt: child.props.alt }, children: [] };
    }
    // 其他节点类型...
    return { name: 'div', attrs: {}, children: markdownToRichTextNodes(child.props.children) };
  }) :children;
};

const Markdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <ReactMarkdown
      // remarkPlugins={[remarkGfm]} // 支持 GitHub 风格 Markdown
      components={{
        // 将 Markdown 节点映射为 rich-text 节点
        p: ({ children }) => <RichText nodes={markdownToRichTextNodes(children)} />,
        strong: ({ children }) => <RichText nodes={markdownToRichTextNodes(children)} />,
        em: ({ children }) => <RichText nodes={markdownToRichTextNodes(children)} />,
        img: ({ src, alt }) => <RichText nodes={[{ name: 'img', attrs: { src, alt }, children: [] }]} />,
        // 其他节点映射...
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default Markdown;