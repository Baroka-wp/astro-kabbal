import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { styles } from './pdfStyles';

function renderInline(line, keyPrefix) {
  const parts = String(line).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={`${keyPrefix}-b-${idx}`} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={`${keyPrefix}-t-${idx}`}>{part}</Text>;
  });
}

const PdfMarkdown = ({ source, style }) => {
  if (!source) return null;
  const lines = String(source).split(/\r?\n/);
  const blocks = [];
  let currentList = null;
  let blockKey = 0;

  const pushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push(
        <View key={`md-list-${blockKey++}`} style={{ marginBottom: 6, marginTop: 2 }}>
          {currentList.items.map((item, idx) => (
            <View
              key={`li-${idx}`}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 4,
                paddingLeft: 2,
              }}
            >
              <Text style={{ width: 12, minWidth: 12, marginRight: 4, lineHeight: 1.62 }}>•</Text>
              <Text style={[styles.paragraph, { marginBottom: 0, flex: 1, minWidth: 0 }]}>
                {renderInline(item, `li-${idx}`)}
              </Text>
            </View>
          ))}
        </View>
      );
    }
    currentList = null;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) {
      pushList();
      return;
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      if (!currentList) currentList = { items: [] };
      currentList.items.push(line.slice(2).trim());
      return;
    }
    pushList();
    blocks.push(
      <Text key={`md-p-${blockKey++}-${idx}`} style={[styles.paragraph, style]}>
        {renderInline(line, `p-${idx}`)}
      </Text>
    );
  });

  pushList();
  return <View>{blocks}</View>;
};

export default PdfMarkdown;
