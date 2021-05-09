//http://localhost:3030

export const logout = async ()=> {
    const url = '/api/auth/logout';
    const response = await (await fetch(url)).json()
    console.log({response})
    return response;
}
export const get_protected = async ({token})=> {
    const url = '/api/protected';
    const headers = {'x-access-token': token}
    const response = await (await fetch(url,{headers})).json()
    console.log({response})
    return response;
}