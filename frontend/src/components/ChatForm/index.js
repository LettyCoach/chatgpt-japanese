import { AudioOutlined, PaperClipOutlined } from "@ant-design/icons";
import { Button, Form, Input, Row, Col, Select, Image } from "antd";
import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessage } from "../../actions/chatActions";
import Axios from "axios";
import styles from "./style";

const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

const recognition = new SpeechRecognition(); // prefix 必要 SpeechRecognition
recognition.lang = "ja-JP";
recognition.continuous = true;
recognition.interimResults = false;

const systemMessage = [
  // {
  //   role: "system",
  //   content:
  //     "Explain things like you're talking to a software professional with 2 years of experience.",
  // },
  {
    role: "assistant",
    // content: "あなたは日本語会話友達です、８歳レベルの単語を使って80字以内で会話を続けて下さい。",
    // content:
    //   "あなたは日本語会話友達です、子供が理解出来るレベルの単語だけを使って短い会話を続けて下さい。",
    content:
      "あなたは日本語会話友達です、子供が理解できるレベルの単語だけを使って短い会話を速い速度で続けて下さい。",
  },
];

const ChatForm = () => {
  const [chatForm] = Form.useForm();
  const messageInputRef = useRef(null);
  const audioRef = useRef(null);
  const imgRef = useRef(null);
  const dispatch = useDispatch();
  const { loading, messages } = useSelector((state) => state.chat);
  let [playState, setPlayState] = useState(true);
  let [startState, setStartState] = useState(false);
  const [speed, setSpeed] = useState("1");
  const [user, setUser] = useState("A");
  const [japaneseVoice, setJapaneseVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      const japaneseVoice = voices.find((voice) => voice.lang === "ja-JP");
      setJapaneseVoice(japaneseVoice);
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, []);

  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (messages.length == 0) return;
    const message = messages[messages.length - 1];
    if (message.type == "a") {
      createAudio(message.text, {
        speaker: 2,
        pitch: 0.5,
        intonation: 1.2,
        otoya: 0.8,
        speed: 1.5,
      });
    }
  }, [messages]);

  useEffect(() => {
    setTimeout(() => {
      processChat(transcript);
    }, 0);
  }, [transcript]);

  useEffect(() => {
    if (!loading) {
      // To run in next cycle.
      setTimeout(() => {
        // messageInputRef.current.focus();
      }, 0);
    }
  }, [loading]);

  recognition.onend = (event) => {
    // console.log("startState, playState", startState, playState);
    if (startState && !playState) {
      setTimeout(() => {
        recognition.start();
      }, 500);
    }
  };
  recognition.onstart = (event) => {
    setTranscript("");
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";
    let finalTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (!finalTranscript) return;

    setTranscript(finalTranscript);
  };

  const startChat = async () => {
    setPlayState(false);
    setStartState(true);
    try {
      recognition.start();
    } catch {}
  };

  const stopChat = () => {
    setPlayState(true);
    setStartState(false);
    try {
      recognition.stop();
    } catch (error) {}
    try {
      audioRef.current.stop();
    } catch (error) {}

    imgRef.current.src = "/avatar2.gif";
  };

  const processChat = async (text) => {
    if (!text) {
      return;
    }

    // console.log('processChat')
    setTimeout(() => {
      recognition.stop();
    }, 0);

    setPlayState(true);

    let messageList = messages.map((e) => {
      let role = "";
      if (e.sender === "a") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: e.text };
    });

    // messageList = [...systemMessage, ...messageList, { role: "user", content: text }];
    messageList = [...systemMessage, ...messageList, { role: "user", content: text }];

    const response = fetchMessage(messageList);

    dispatch(response);
    chatForm.resetFields();
  };

  const createAudio = async (text, options) => {
    imgRef.current.src = "/avatar1.gif";
    if (user === "A") {
      audioRef.current.src = `https://www.yukumo.net/api/v2/aqtk1/koe.mp3?type=f1&effect=none&boyomi=true&speed=${
        speed * 100
      }&volume=100&kanji='${text}'`;
      audioRef.current.play();
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = japaneseVoice;
      utterance.rate = speed; // controls the speed, 1 is normal speed
      utterance.pitch = 1; // controls the pitch, 1 is normal pitch
      utterance.addEventListener("end", async () => {
        // console.log("[[[[[[[[[[[[[[[[[");
        setPlayState(false);
        await recognition.start();
        imgRef.current.src = "/avatar2.gif";
      });
      speechSynthesis.speak(utterance);
    }

    // const data = await createVoice(text, options);
    // audioRef.current.src = URL.createObjectURL(data);
    // audioRef.current.play();
  };

  // const createQuery = async (text, options) => {
  //   const { speaker, pitch, intonation, otoya, speed } = options;
  //   const response = await Axios.post(
  //     `http://localhost:50021/audio_query?speaker=${speaker}&pitch=${pitch}&intonation=${intonation}&otoya=${otoya}&speed=${speed}&text=${text}`
  //   );
  //   return response.data;
  // };

  // const createVoice = async (text, options) => {
  //   const query = await createQuery(text, options);
  //   const { speaker, pitch, intonation, otoya, speed } = options;
  //   const response = await Axios.post(
  //     `http://localhost:50021/synthesis?speaker=${speaker}&pitch=${pitch}&intonation=${intonation}&otoya=${otoya}&speed=${speed}`,
  //     query,
  //     {
  //       responseType: "blob",
  //     }
  //   );
  //   return response.data;
  // };

  const onEndedProcess = async () => {
    setPlayState(false);
    await recognition.start();

    imgRef.current.src = "/avatar2.gif";
  };

  const handleSpeedChange = (value) => {
    //console.log(value);
    setSpeed(value);
  };

  const handleUserChange = (value) => {
    //console.log(value);
    setUser(value);
  };

  const onSubmit = async (event) => {
    if (!event.target.value) {
      return;
    }

    setTimeout(() => {
      processChat(event.target.value);
    }, 0);
  };

  return (
    <>
      <audio ref={audioRef} onEnded={onEndedProcess} />
      <Row
        style={{ display: "flex", padding: "12px", alignItems: "center", justifyContent: "center" }}
      >
        <img
          width={"90%"}
          // height={'90%'}
          ref={imgRef}
          src="/avatar2.gif"
        />
      </Row>
      <Row style={{ padding: 8 }}>
        <Col span={2}></Col>
        <Col span={7}>
          <Select
            defaultValue={speed}
            style={{ width: "90%" }}
            onChange={handleSpeedChange}
            options={[
              {
                value: "0.8",
                label: "初心者",
              },
              {
                value: "1",
                label: "普通",
              },
              {
                value: "1.2",
                label: "エキスパート",
              },
            ]}
          />
        </Col>
        <Col span={7}>
          <Select
            defaultValue={user}
            onChange={handleUserChange}
            style={{ width: "90%" }}
            options={[
              {
                value: "A",
                label: "AI-A",
              },
              {
                value: "B",
                label: "AI-B",
              },
            ]}
          />
        </Col>
        <Col span={3}>
          <Button
            type="primary"
            size="large"
            shape="circle"
            onClick={startChat}
            disabled={startState}
          >
            Start
          </Button>
        </Col>
        <Col span={3}>
          <Button
            type="primary"
            size="large"
            shape="circle"
            onClick={stopChat}
            disabled={!startState}
          >
            Stop
          </Button>
        </Col>
        <Col span={2}></Col>
      </Row>
      <Row style={{ padding: 8 }}>
        <Col span={2}></Col>
        <Col span={20}>
          <Form layout="inline" form={chatForm} name="message-form" style={styles.formStyle}>
            <Form.Item style={styles.inputStyle} name="message">
              <Input
                size="large"
                suffix={<PaperClipOutlined />}
                placeholder="Message"
                disabled={playState}
                onPressEnter={onSubmit}
                ref={messageInputRef}
              />
            </Form.Item>
            <Form.Item style={styles.btnStyle} name="sendMsg">
              <Button type="primary" size="large" shape="circle" disabled={playState}>
                <AudioOutlined />
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span={2}></Col>
      </Row>
    </>
  );
};
export default ChatForm;
