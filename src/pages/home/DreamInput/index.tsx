import {
  View,
  Text,
  Textarea,
  Input,
  Button,
  ITouchEvent,
} from "@tarojs/components";
import { useMemo, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { NewMessageDTO } from "@/api/types/chat";
import Taro from "@tarojs/taro";
// import { DreamInputProps, DreamInputState } from "./types";
import style from "./index.module.scss";



export interface DreamInputProps {
  date: string;
  show: boolean;
  onClose: () => void;
}

const DreamInput: React.FC<DreamInputProps> = (props) => {
  const { setDreamInput: setGlobalDreamInput } = useChatStore()
  const [loading, setLoading] = useState<boolean>(false);
  const [dreamInput, setDreamInput] = useState<NewMessageDTO & { currentDate: string }>({
    title: "",
    message: "",
    currentDate: "",
  });

  const canSave = useMemo(() => {
    return !!(dreamInput.title.trim() && dreamInput.message.trim());
  }, [dreamInput.title, dreamInput.message]);
  const onTitleInput = (e: any) => {
    setDreamInput((prev) => ({
      ...prev,
      title: e.detail.value,
    }));
  };

  const onContentInput = (e: any) => {
    setDreamInput((prev) => ({
      ...prev,
      message: e.detail.value,
    }));
  };

  const onSave = async () => {
    if (!canSave) return;
    // 显示加载状态
    setLoading(true);
    setGlobalDreamInput(dreamInput)
    Taro.navigateTo({url: `/pages/sub/analysis/index`})
  };

  const stopPropagation = (e: ITouchEvent) => {
    // 阻止事件冒泡
    e.stopPropagation();
  };

  if (!props.show) return null;

  return (
    <View
      className={`${style["dream-input-modal"]} ${
        props.show ? style.show : ""
      }`}
      onClick={() => props.onClose()}
    >
      <View className={style["modal-content"]} onClick={stopPropagation}>
        <View className={style["title-bar"]}>
          <Input
            className={style["title-input"]}
            placeholder="输入标题..."
            maxlength={12}
            placeholder-style="color: rgba(60, 60, 67, 0.6)"
            focus={props.show}
            value={dreamInput.title}
            disabled={loading}
            onInput={onTitleInput}
          />
          <Text className={style["date"]}>{props.date}</Text>
        </View>
        <View className={style["content-wrapper"]}>
          <Textarea
            className={style["content-input"]}
            placeholder="描述你的梦境..."
            placeholder-style="color: rgba(60, 60, 67, 0.6)"
            maxlength={500}
            value={dreamInput.message}
            disabled={loading}
            onInput={onContentInput}
          />
          <View className={style["word-count"]}>
            {dreamInput.message.length}/500
          </View>
        </View>
        <View className={style["footer"]}>
          <Button
            className={`
              ${style["save-btn"]} 
              ${canSave ? "" : style.disabled} 
              ${loading ? style.loading : ""}`}
            onClick={onSave}
            disabled={!canSave || loading}
          >
            {loading ? "生成中..." : "保存"}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default DreamInput;
