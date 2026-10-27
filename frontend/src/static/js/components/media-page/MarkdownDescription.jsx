import React from 'react';
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const timestampPattern = /(?:\d{1,2}:)?\d{1,2}:\d{2}/g;

function timestampSeconds(value) {
  return value.split(':').reduce((seconds, part) => seconds * 60 + Number(part), 0);
}

function remarkTimestamps() {
  return (tree) => {
    function visit(node) {
      if (!node.children || node.type === 'link' || node.type === 'linkReference') {
        return;
      }

      node.children = node.children.flatMap((child) => {
        if (child.type !== 'text') {
          visit(child);
          return [child];
        }

        const matches = [...child.value.matchAll(timestampPattern)];
        if (!matches.length) {
          return [child];
        }

        const parts = [];
        let position = 0;

        matches.forEach((match) => {
          if (match.index > position) {
            parts.push({ type: 'text', value: child.value.slice(position, match.index) });
          }

          parts.push({
            type: 'link',
            url: '#',
            children: [{ type: 'text', value: match[0] }],
            data: {
              hProperties: {
                className: 'video-timestamp',
                'data-timestamp': String(timestampSeconds(match[0])),
              },
            },
          });
          position = match.index + match[0].length;
        });

        if (position < child.value.length) {
          parts.push({ type: 'text', value: child.value.slice(position) });
        }

        return parts;
      });
    }

    visit(tree);
  };
}

function safeUrl(url) {
  const normalized = /^www\.[^\s]+$/i.test(url) ? `https://${url}` : url;
  return defaultUrlTransform(normalized);
}

const remarkPlugins = [remarkGfm, remarkTimestamps];

export default function MarkdownDescription({ children }) {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} urlTransform={safeUrl}>
      {children}
    </ReactMarkdown>
  );
}
