import fs from "fs"

export function csvFileSync(filename: string, data: any){
    return fs.writeFileSync(filename, data)
}