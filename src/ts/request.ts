import service from "./intercepter"

var baseurl = 'http://localhost:8081/api'

async function get(path: string, authorization: string,...params: any) {
    var url = baseurl + path
    for (let param of params) {
        url += ('/' + param) 
    }

    return await service({
        method: 'get',
        url: url,
        headers: { 
            'content-type': 'application/json',
            'Authorization': authorization
         },
    }).then(function (response: any) {
        return response.data
    }).catch(function (error: any) {
        console.log(error)
    })
}
async function post(path: string, authorization: string, data: any){
    return await service({
        method: 'post',
        url: baseurl + path,
        headers: { 
            'content-type': 'application/json',
            'Authorization': authorization
         },
        data: JSON.stringify(data)
    }).then(function (response: any) {
        console.log(response)
        return response.data
    }).catch(function (error: any) {
        console.log(error)

    })
}
export {
    get,
    post
}
