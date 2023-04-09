import { all } from "redux-saga/effects";
import Axios from "axios";
import { fetchMessageWatcher } from "./chat";

export let callAPI = async ({ url, method, data }) => {
  const response = await Axios({
    url,
    method,
    data,
  });
  console.log(response);
  return response;
};

export default function* rootSaga() {
  yield all([fetchMessageWatcher()]);
}
