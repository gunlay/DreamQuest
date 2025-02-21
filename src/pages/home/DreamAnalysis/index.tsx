import { View, Text } from '@tarojs/components';
import { useEffect, useState } from 'react';
import { DreamAnalysisProps, Message } from './types';
import styles from './index.module.scss';

const DreamAnalysis: React.FC<DreamAnalysisProps> = ({ visible, dreamData, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (visible && dreamData) {
      startAnalysis();
    }
  }, [visible, dreamData]);

  const startAnalysis = () => {
    // TODO: Call AI API for analysis
    // For now, simulate some messages
    setTimeout(() => {
      addMessage('ai', '让我来分析一下你的梦境...');
      setTimeout(() => {
        addMessage('ai', '我注意到你的梦境中包含了一些有趣的元素...');
      }, 1000);
    }, 500);
  };

  const addMessage = (type: 'ai' | 'user', content: string) => {
    setMessages(prev => [...prev, { type, content }]);
  };

  const handleModalTap = () => {
    onClose();
  };

  const handleContentTap = (e: any) => {
    e.stopPropagation();
  };

  if (!visible) return null;

  return (
    <View className={styles.analysisModal} onClick={handleModalTap}>
      <View className={styles.analysisContent} onClick={handleContentTap}>
        {/* Title and Date */}
        <View className={styles.header}>
          <Text className={styles.title}>{dreamData.title}</Text>
          <Text className={styles.date}>{dreamData.date || dreamData.createdAt}</Text>
        </View>

        {/* Dream Content */}
        <View className={styles.dreamContent}>
          <Text>{dreamData.content}</Text>
        </View>

        {/* AI Generated Image */}
        <View className={styles.dreamImage}>
          {/* Uncomment when image generation is implemented */}
          {/* <Image src="/assets/default_dream.png" mode="aspectFill" /> */}
        </View>

        {/* Analysis Tags */}
        <View className={styles.tags}>
          {(dreamData.tags || ['神秘', '探索', '冒险']).map((tag, index) => (
            <Text key={index} className={styles.tag}>{tag}</Text>
          ))}
        </View>

        {/* AI Chat Area */}
        <View className={styles.chatArea}>
          {messages.map((message, index) => (
            <View key={index} className={`${styles.message} ${styles[message.type]}`}>
              <Text>{message.content}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default DreamAnalysis; 