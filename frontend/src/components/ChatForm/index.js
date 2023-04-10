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
recognition.interimResults = true;

const ChatForm = () => {
  // const messageInputRef = useRef(null);
  // const audioRef = useRef(null);
  const imgRef = useRef(null);
  const dispatch = useDispatch();
  const { loading, messages } = useSelector((state) => state.chat);
  let [playState, setPlayState] = useState(true);
  let [startState, setStartState] = useState(false);
  const [speed, setSpeed] = useState("1");
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

  console.log("render", playState);
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
    console.log("result --- ", transcript);
    setTimeout(() => {
      recognition.stop();
    }, 0);

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
    console.log("Recog Ended", startState, playState);
    if (startState && !playState) {
      setTimeout(() => {
        recognition.start();
      }, 500);
    }
  };
  recognition.onstart = (event) => {
    console.log("Recog Stated");
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

    console.log("recog1 ----", playState, finalTranscript);

    if (!finalTranscript) return;
    console.log("recog2 ----", finalTranscript);
    setTranscript(finalTranscript);
  };

  const startChat = async () => {
    setPlayState(false);
    setStartState(true);

    recognition.start();
    console.log("Start--", playState);
  };

  const stopChat = () => {
    console.log("Stop");

    setPlayState(true);
    setStartState(false);
    recognition.stop();

    imgRef.current.src = "/avatar2.gif";
  };

  const processChat = async (text) => {
    console.log("processChat--", playState, text);
    if (!text) {
      return;
    }
    setPlayState(true);
    const response = fetchMessage(text);

    dispatch(response);
    // chatForm.resetFields();
  };

  // const onSubmit = async (event) => {
  //   console.log('OnSubmit---')
  //   await processChat(event.target.value)
  // };

  // const onEndedProcess = async () => {
  //   console.log("play ended");
  //   setPlayState(false);
  //   await recognition.start();
  // };

  const createAudio = async (text, options) => {
    // const audio = new Audio(`https://text-to-speech-demo.ng.bluemix.net/api/v1/synthesize?text=${encodeURIComponent(text)}&voice=ja-JP_EmiV3Voice`);
    // audio.play();

    imgRef.current.src = "/avatar1.gif";
    console.log("setss", speed);
    const utterance = new SpeechSynthesisUtterance(text);
    // utterance.voice = voice;

    // utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang === 'ja-JP');
    utterance.voice = japaneseVoice;
    utterance.rate = speed; // controls the speed, 1 is normal speed
    utterance.pitch = 1; // controls the pitch, 1 is normal pitch
    console.log("---------------------", utterance.voice);

    utterance.addEventListener("end", async () => {
      console.log("Audio finished playing.");

      setPlayState(false);
      await recognition.start();

      imgRef.current.src = "/avatar2.gif";
    });

    console.log("---------------------", 111);

    speechSynthesis.speak(utterance);

    // return;

    // console.log("---createAudio");
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

  const handleSpeedChange = (value) => {
    console.log(value);
    setSpeed(value);
  };

  return (
    <>
      <Row style={{ height: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img
          // width={'100%'}
          // height={'90%'}
          ref={imgRef}
          src="/avatar2.gif"
        />
      </Row>
      <Row>
        <Col span={2}></Col>
        <Col span={8}>
          <Select
            defaultValue={speed}
            style={{ width: 120 }}
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
        <Col span={4}>
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
        <Col span={4}>
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
        <Col span={4}>
          <Button type="primary" size="large" shape="circle" disabled={playState}>
            <AudioOutlined />
          </Button>
        </Col>
        <Col span={2}></Col>
      </Row>
    </>
  );
};
export default ChatForm;
