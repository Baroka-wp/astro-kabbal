import React from 'react';

const renderInline = (text) => {
  const parts = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={`b-${key++}`}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
};

const SimpleMarkdown = ({ source = '', className }) => {
  if (!source) return null;
  const lines = source.split('\n');
  const blocks = [];
  let listBuffer = null;
  let paragraphBuffer = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push(
        <p key={`p-${blocks.length}`}>{renderInline(paragraphBuffer.join(' '))}</p>
      );
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer) {
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {listBuffer.map((item, idx) => (
            <li key={`li-${idx}`}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      listBuffer = null;
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      return;
    }
    if (line.startsWith('- ')) {
      flushParagraph();
      if (!listBuffer) listBuffer = [];
      listBuffer.push(line.slice(2));
    } else {
      flushList();
      paragraphBuffer.push(line);
    }
  });
  flushParagraph();
  flushList();

  return <div className={className}>{blocks}</div>;
};

export default SimpleMarkdown;
