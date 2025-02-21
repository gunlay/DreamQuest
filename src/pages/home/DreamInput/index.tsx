import { View, Text, Textarea, Input, Button } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { DreamInputProps, DreamInputState, DreamData } from './types';
import styles from './index.module.scss';

const DreamInput: React.FC<DreamInputProps> = ({ show, onSave, onClose }) => {
  const [state, setState] = useState<DreamInputState>({
    content: '',
    title: '',
    mood: '',
    tags: [],
    isSubmitting: false
  });

  const handleContentChange = (e: any) => {
    setState(prev => ({
      ...prev,
      content: e.detail.value
    }));
  };

  const handleTitleChange = (e: any) => {
    setState(prev => ({
      ...prev,
      title: e.detail.value
    }));
  };

  const handleMoodChange = (e: any) => {
    setState(prev => ({
      ...prev,
      mood: e.detail.value
    }));
  };

  const handleTagInput = (e: any) => {
    const value = e.detail.value.trim();
    if (value && !state.tags.includes(value)) {
      setState(prev => ({
        ...prev,
        tags: [...prev.tags, value]
      }));
    }
  };

  const removeTag = (index: number) => {
    setState(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!state.content.trim()) {
      Taro.showToast({
        title: '请输入梦境内容',
        icon: 'none'
      });
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const dreamData: DreamData = {
        id: Date.now(),
        content: state.content.trim(),
        title: state.title.trim(),
        mood: state.mood.trim(),
        tags: state.tags,
        createdAt: new Date().toISOString()
      };

      onSave(dreamData);
      handleClose();
    } catch (error) {
      console.error('保存梦境失败:', error);
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'error'
      });
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleClose = () => {
    setState({
      content: '',
      title: '',
      mood: '',
      tags: [],
      isSubmitting: false
    });
    onClose();
  };

  if (!show) return null;

  return (
    <View className={styles.overlay}>
      <View className={styles.container}>
        <View className={styles.header}>
          <Text className={styles.title}>记录梦境</Text>
          <View className={styles.closeBtn} onClick={handleClose}>✕</View>
        </View>

        <View className={styles.form}>
          <View className={styles.formItem}>
            <Text className={styles.label}>标题</Text>
            <Input
              className={styles.input}
              value={state.title}
              onInput={handleTitleChange}
              placeholder='给这个梦境起个标题吧'
              maxlength={50}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>内容</Text>
            <Textarea
              className={styles.textarea}
              value={state.content}
              onInput={handleContentChange}
              placeholder='描述一下你的梦境...'
              maxlength={1000}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>心情</Text>
            <Input
              className={styles.input}
              value={state.mood}
              onInput={handleMoodChange}
              placeholder='这个梦给你什么感觉？'
              maxlength={20}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>标签</Text>
            <Input
              className={styles.input}
              onConfirm={handleTagInput}
              placeholder='输入标签并回车'
              maxlength={20}
            />
            <View className={styles.tagList}>
              {state.tags.map((tag, index) => (
                <View key={index} className={styles.tag}>
                  <Text>{tag}</Text>
                  <Text className={styles.tagDelete} onClick={() => removeTag(index)}>×</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.footer}>
          <Button
            className={styles.cancelBtn}
            onClick={handleClose}
          >
            取消
          </Button>
          <Button
            className={styles.submitBtn}
            onClick={handleSubmit}
            loading={state.isSubmitting}
          >
            保存
          </Button>
        </View>
      </View>
    </View>
  );
};

export default DreamInput; 