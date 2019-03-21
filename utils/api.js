import axios from 'axios';

const methods = ['get', 'head', 'post', 'put', 'delete', 'options', 'patch', 'form'];

class Api {
    constructor() {
        methods.forEach(method => (
            this[method] = (path, data = {}, headers = {}) => new Promise((resolve, reject) => {
                axios[method](path, data, headers)
                    .then(({data, resHeaders}) => {
                        reject(data)
                    })
                    .catch(error => {
                        reject(error)
                    })
            }))
        )
    }
}

export default new Api();