import fetch from "node-fetch";
import iColorResponse from "./interfaces/iColorResponse";

export default async function colorScheme(input: string, callback: Function) : Promise<void> {
    return fetch('http://www.colorfyit.com/api/swatches/list.json?url=' + input, {method: 'GET'})
    .then(response => {
        console.log(response)
        if (!response.ok) {
            throw new Error(response.statusText)
          }
        return response.json()
    })
    .then(data => {
        let dataAny: any = data 
        const colors: iColorResponse[] = dataAny.colors.map(raw => raw.Hex)
        callback(colors)
    })
}