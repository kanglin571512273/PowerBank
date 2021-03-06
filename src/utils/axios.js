import axios from 'axios'
import Vue from "vue";
import { Toast } from "vant";
Vue.use(Toast);
class HttpRequest {
    constructor(baseUrl) {
        this.baseURL = baseUrl
        this.queue = {}
    }
    getInsideConfig() {//获取内部配置
        const config = {
            baseURL: this.baseURL,
            headers: {
                Authorization: '',
            }
        }
        return config
    }
    destory(url) {
        delete this.queue[url]
        if (!Object.keys(this.queue).length) {

        }
    }
    interceptors(instance, url) {
        // 请求拦截
        instance.interceptors.request.use(config => {
            // 添加全局loading... 
            if (!Object.keys(this.queue).length) {
                Toast.loading({
                    message: "加载中...",
                    forbidClick: true,
                })
            }
            this.queue[url] = true
            return config
        }, error => {
            return Promise.reject(error)
        })
        // 响应拦截
        instance.interceptors.response.use(res => {
            this.destory(url)
            const { data } = res
            if (typeof data === 'object') {
                //自己处理
            }
            Toast.clear();
            return data
        }, error => {
            this.destory(url)
            let errorInfo = error.response
            if (!errorInfo) {
                const { request: { statusText, status }, config } = JSON.parse(JSON.stringify(error))
                errorInfo = {
                    statusText,
                    status,
                    request: {
                        responseURL: config.url
                    }
                }
                console.log(errorInfo);
            }
            return Promise.reject(error)

        })
    }
    request(options) {
        const instance = axios.create()
        options = Object.assign(this.getInsideConfig(), options)
        this.interceptors(instance, options.url)
        return instance(options)
    }
}
export default HttpRequest