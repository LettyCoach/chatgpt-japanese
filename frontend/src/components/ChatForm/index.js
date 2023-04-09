import { AudioOutlined, PaperClipOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessage } from "../../actions/chatActions";
import Axios from "axios";
import styles from "./style";

const ChatForm = () => {
  const [chatForm] = Form.useForm();
  const messageInputRef = useRef(null);
  const audioRef = useRef(null);
  const dispatch = useDispatch();
  const { loading, messages } = useSelector((state) => state.chat);
  const [playState, setPlayState] = useState(false);

  useEffect(() => {
    if (messages.length == 0) return;
    const message = messages[messages.length - 1];
    if (message.type == "a")
      createAudio(message.text, {
        speaker: 2,
        pitch: 0.5,
        intonation: 1.2,
        otoya: 0.8,
        speed: 1.5,
      });
  }, [messages]);

  const onSubmit = async (event) => {
    if (!event.target.value) {
      return;
    }
    setPlayState(true);
    const response = fetchMessage(event.target.value);
    // await createAudio(response.data);

    dispatch(response);
    chatForm.resetFields();
  };

  const onEndedProcess = async () => {
    console.log("-------------------------------------");
    setPlayState(false);
  };

  const createAudio = async (text, options) => {
    console.log("---createAudio");
    const data = await createVoice(text, options);
    audioRef.current.src = URL.createObjectURL(data);
    audioRef.current.play();
    // const audio = document.querySelector(".audio");
    // audio.src = URL.createObjectURL(data);
    // audio.play();
  };

  const createQuery = async (text, options) => {
    const { speaker, pitch, intonation, otoya, speed } = options;
    const response = await Axios.post(
      `http://localhost:50021/audio_query?speaker=${speaker}&pitch=${pitch}&intonation=${intonation}&otoya=${otoya}&speed=${speed}&text=${text}`
    );
    return response.data;
  };

  const createVoice = async (text, options) => {
    const query = await createQuery(text, options);
    const { speaker, pitch, intonation, otoya, speed } = options;
    const response = await Axios.post(
      `http://localhost:50021/synthesis?speaker=${speaker}&pitch=${pitch}&intonation=${intonation}&otoya=${otoya}&speed=${speed}`,
      query,
      {
        responseType: "blob",
      }
    );
    return response.data;
  };

  useEffect(() => {
    if (!loading) {
      // To run in next cycle.
      setTimeout(() => {
        // messageInputRef.current.focus();
      }, 0);
    }
  }, [loading]);
  return (
    <>
      <Form layout="inline" form={chatForm} name="message-form" style={styles.formStyle}>
        <Form.Item style={styles.inputStyle} name="message">
          <Input
            size="large"
            suffix={<PaperClipOutlined />}
            placeholder="Message"
            disabled={loading || playState}
            onPressEnter={onSubmit}
            ref={messageInputRef}
          />
        </Form.Item>
        <Form.Item style={styles.btnStyle} name="sendMsg">
          <Button type="primary" size="large" shape="circle">
            <AudioOutlined />
          </Button>
        </Form.Item>
      </Form>
      <audio ref={audioRef} onEnded={onEndedProcess} />
    </>
  );
};
export default ChatForm;
