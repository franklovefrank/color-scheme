import fetch from "node-fetch";
import iColorResponse from "./interfaces/iColorResponse";

export default async function colorScheme(url: string, callback: Function): Promise<void> {
    return fetch('http://www.colorfyit.com/api/swatches/list.json?url=' + url, { method: 'GET' })
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText)
            }
            return response.json()
        })
        .then(data => {
            const colors: iColorResponse[] = data.colors.map(color => color.Hex)
            callback(colors)
        })
}