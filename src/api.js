import AxiosUtil from '@/utils/AxiosUtil';

var api = {
    //list
    fileList: params => AxiosUtil.get('file/list', params),
    
};

export default api;