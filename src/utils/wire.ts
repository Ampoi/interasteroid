export class Wire {
    readonly to: string
    readonly from: string

    constructor(to: string, from: string){
        this.to = to
        this.from = from
    }
}