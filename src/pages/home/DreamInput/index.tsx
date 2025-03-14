import {
  View,
  Text,
  Textarea,
  Input,
  Button,
  ITouchEvent,
} from "@tarojs/components";
import { useEffect, useMemo, useState } from "react";
import { chatApi } from "@/api/chat";
import Taro from "@tarojs/taro";
import { DreamInputProps, DreamInputState } from "./types";
import style from "./index.module.scss";

const DreamInput: React.FC<DreamInputProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dreamInput, setDreamInput] = useState<DreamInputState>({
    title: "",
    content: "",
    currentDate: "",
  });

  const canSave = useMemo(() => {
    return !!(dreamInput.title.trim() && dreamInput.content.trim());
  }, [dreamInput.title, dreamInput.content]);
  const onTitleInput = (e: any) => {
    setDreamInput((prev) => ({
      ...prev,
      title: e.detail.value,
    }));
  };

  const onContentInput = (e: any) => {
    setDreamInput((prev) => ({
      ...prev,
      content: e.detail.value,
    }));
  };

  const onSave = async () => {
    if (!canSave) {
      console.warn("无法保存：标题或内容为空");
      return;
    }

    // 显示加载状态
    setLoading(true);
    Taro.showLoading({
      title: "正在生成图片...",
      mask: true,
    });
    const chatId = await chatApi.createNewChat({...dreamInput, message: dreamInput.content})
  };

  const stopPropagation = (e: ITouchEvent) => {
    // 阻止事件冒泡
    e.stopPropagation();
  };

  useEffect(() => {
    const now = new Date();
    const date = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(now.getDate()).padStart(2, "0")}`;
    setDreamInput((prev) => ({ ...prev, currentDate: date }));
  }, []);

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
            onInput={onTitleInput}
          />
          <Text className={style["date"]}>{dreamInput.currentDate}</Text>
        </View>
        <View className={style["content-wrapper"]}>
          <Textarea
            className={style["content-input"]}
            placeholder="描述你的梦境..."
            placeholder-style="color: rgba(60, 60, 67, 0.6)"
            maxlength={500}
            value={dreamInput.content}
            onInput={onContentInput}
          />
          <View className={style["word-count"]}>
            {dreamInput.content.length}/500
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
