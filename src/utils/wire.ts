import p5, { Vector } from "p5"
import { Part } from "./part"

const size = 40

export class Wire {
    readonly to: string
    readonly from: string

    constructor(from: string, to: string){
        this.to = to
        this.from = from
    }

    private drawLine(p: p5, from: Vector, to: Vector, weight: number, color: p5.Color){
        p.strokeWeight(weight)
        p.stroke(color)
        p.line(from.x*size, from.y*size, to.x*size, to.y*size)
    }

    draw(p: p5, constructedParts: { [key: string]: { position: Vector, angle: number, part: Part } }){
        const from = constructedParts[this.from].position
        const to = constructedParts[this.to].position
        //水色→オレンジ

        const markVector = Vector.setMag(Vector.sub(to, from), size*0.5)

        this.drawLine(p, from, to, 6, p.color(200))
        this.drawLine(p, from, to, 4, p.color(50))
        
        p.noStroke()
        p.fill("#00bbff")
        p.circle(from.x * size + markVector.x, from.y * size + markVector.y, 6)
        p.fill("#ff9500")
        p.circle(to.x * size - markVector.x, to.y * size - markVector.y, 6)
    }
}