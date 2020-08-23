import axios from "axios";
import {Message} from "element-ui";

const service = axios.create({
  baseURL: process.env.VUE_APP_API,
  timeout: 5000,
  headers: {"Content-Type": "application/json"}
});

//请求拦截
service.interceptors.request.use(
  config => {
    // if (store.getters.token) {
    //   config.headers["X-Token"] = getToken();
    // }
    return config;
  },
  error => {
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

//响应拦截
service.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code != 0) {
      Message.error(res.msg || "系统异常");
      return Promise.reject(new Error(res.msg || "Error"));
    } else {
      return res;
    }
  },
  error => {
    console.log("err" + error); // for debug
    return Promise.reject(error);
  }
);

const getApi = (url) => `/studio/annotation/${url}`;

function request(url, params, options, method = "get") {
  var _params = (method == 'get')?{ params }:params;
  return service[method](getApi(url), _params).then(res => res);
}

const get = (url, params = {}, options = {}) => request(url, params, options);

const post = (url, params = {}, options = {}) => request(url, params, options, "post");

export default {
  get,
  post
};
