//http://localhost:3030

export const login = async ()=> {
    const url = '/api/login';
    // const email = 'wrong@email.com';
    const email = 'baraba@acum.com';
    const password = 'qwerty';
    const headers = {'Content-Type': 'application/json'}
    const options = {method:'POST',headers, body:JSON.stringify({email,password})}
    const response = await (await fetch(url,options)).json()
    console.log({response})
    return response;
}
export const logout = async ()=> {
    const url = '/api/logout';
    const response = await (await fetch(url)).json()
    console.log({response})
    return response;
}
export const get_protected = async ()=> {
    const url = '/api/protected';
    const response = await (await fetch(url)).json()
    console.log({response})
    return response;
}