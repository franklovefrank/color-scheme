import fetch from "node-fetch";

export default async function colorScheme(input: string, callback: Function) {
    return fetch('http://www.colorfyit.com/api/swatches/list.json?url=' + input, {method: 'GET'})
    .then(response => {
        console.log(response)
        if (!response.ok) {
            throw new Error(response.statusText)
          }
        return response.json()
    })
    .then(data => {
        const colors: string[] = data.colors.map(raw => raw.Hex)
        callback(colors)
    })
}