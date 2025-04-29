import { View, Text, Textarea, Input, Button, ITouchEvent } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useMemo, useState } from 'react';
import { chatApi } from '@/api/chat';
import { NewMessageDTO } from '@/api/types/chat';
import { useChatStore } from '@/store/chatStore';
// import { DreamInputProps, DreamInputState } from "./types";
import { debounce } from '@/utils/debounce';
import style from './index.module.scss';

export interface DreamInputProps {
  date: string;
  show: boolean;
  onClose: () => void;
}

const DreamInput: React.FC<DreamInputProps> = (props) => {
  const { setDreamInput: setGlobalDreamInput } = useChatStore();
  const [dreamInput, setDreamInput] = useState<NewMessageDTO & { currentDate: string }>({
    title: '',
    message: '',
    currentDate: '',
  });
  const [loading, setLoading] = useState(false);

  const canSave = useMemo(() => {
    return !!(dreamInput.title.trim() && dreamInput.message.trim());
  }, [dreamInput.title, dreamInput.message]);
  const onTitleInput = (e: ITouchEvent) => {
    setDreamInput((prev) => ({
      ...prev,
      title: e.detail.value,
    }));
  };

  const onContentInput = (e: ITouchEvent) => {
    setDreamInput((prev) => ({
      ...prev,
      message: e.detail.value,
    }));
  };

  const onSave = async () => {
    if (!canSave || loading) return;
    // 显示加载状态
    setLoading(true);
    setGlobalDreamInput(dreamInput);
    try {
      const { chatId } = await chatApi.createChatNew(dreamInput);
      props.onClose();
      setDreamInput({
        title: '',
        message: '',
        currentDate: '',
      });
      Taro.navigateTo({ url: `/pages/sub/analysis/index?chatId=${chatId}&newCreate=true` });
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleSave = debounce(onSave, 500);

  const stopPropagation = (e: ITouchEvent) => {
    // 阻止事件冒泡
    e.stopPropagation();
  };

  if (!props.show) return null;

  return (
    <View
      className={`${style['dream-input-modal']} ${props.show ? style.show : ''}`}
      onClick={() => props.onClose()}
    >
      <View className={style['modal-content']} onClick={stopPropagation}>
        <View className={style['title-bar']}>
          <Input
            className={style['title-input']}
            placeholder="输入标题..."
            maxlength={12}
            placeholder-style="color: rgba(60, 60, 67, 0.6)"
            focus={props.show}
            value={dreamInput.title}
            onInput={onTitleInput}
          />
          <Text className={style['date']}>{props.date}</Text>
        </View>
        <View className={style['content-wrapper']}>
          <Textarea
            className={style['content-input']}
            placeholder="描述你的梦境..."
            placeholder-style="color: rgba(60, 60, 67, 0.6)"
            maxlength={500}
            value={dreamInput.message}
            onInput={onContentInput}
          />
          <View className={style['word-count']}>{dreamInput.message.length}/500</View>
        </View>
        <View className={style['footer']}>
          <Button
            className={`
              ${style['save-btn']} 
              ${canSave ? '' : style.disabled} `}
            onClick={handleSave}
            disabled={!canSave}
          >
            {loading ? '保存中...' : '保存'}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default DreamInput;
