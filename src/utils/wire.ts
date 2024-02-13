export class Wire {
    readonly to: string
    readonly from: string

    constructor(from: string, to: string){
        this.to = to
        this.from = from
    }
}