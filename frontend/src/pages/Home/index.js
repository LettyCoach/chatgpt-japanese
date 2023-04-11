import { Col, Layout, Row, Space, Typography } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import ChatForm from "../../components/ChatForm";
import ChatHistory from "../../components/ChatHistory";
import ChatView from "../../components/ChatView";
import styles from "./style";
const { Header, Footer, Sider, Content } = Layout;
const { Title, Text } = Typography;

const CGTLayout = () => (
  <Layout style={styles.layoutStyle}>
    <Layout>
      <Header style={styles.headerStyle}>
        <Space size={20} style={styles.headerContentStyle}>
          <MenuOutlined style={styles.iconStyle} />
          <div style={styles.titleStyle}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {/* 初心者から始めて日本語を学べるオンラインスクール */}
              <br />
            </Text>
            <Title style={styles.titleStyle} level={4}>
              日本語カフェAI会話システム
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {/* 初心者から始めて日本語を学べるオンラインスクール */}
              <br />
            </Text>
          </div>
        </Space>
      </Header>
      <Content style={styles.contentStyle}>
        <Row style={{ flexFlow: "wrap-reverse" }}>
          <Col xs={24} sm={10} md={10} lg={8} xl={8} xxl={6}>
            <ChatForm />
          </Col>
          <Col xs={24} sm={14} md={14} lg={16} xl={16} xxl={15} style={{ overflowY: 'scroll', height : ' calc(100vh - 64px) '}}>
            <ChatView />
          </Col>
        </Row>
      </Content>
    </Layout>
    {/* <Sider width={300} style={styles.siderStyle}>
      <ChatHistory />
    </Sider> */}
  </Layout>
);
export default CGTLayout;
