import p5, { Vector } from "p5"
import { Part } from "./part"
import { energyColor, rocket } from "./main"

const size = 40

export class Wire {
    readonly to: string
    readonly from: string
    readonly energizeLimit = 5

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
        
        this.drawLine(p, from, to, 6, p.color(200))
        this.drawLine(p, from, to, 4, this.transporting ? p.color(energyColor) :p.color(50))
        
        //水色→オレンジ
        const markVector = Vector.setMag(Vector.sub(to, from), size*0.5)
        
        p.noStroke()
        p.fill("#00bbff")
        p.circle(from.x * size + markVector.x, from.y * size + markVector.y, 6)
        p.fill("#ff9500")
        p.circle(to.x * size - markVector.x, to.y * size - markVector.y, 6)
    }

    transporting = false

    energize(){
        const from = rocket.bodyParts[this.from]
        if( !from.energy ) throw new Error("接続されている転送元パーツはバッテリーを使用していません！")
        
        const to = rocket.bodyParts[this.to]
        if( !to.energy ) throw new Error("接続されている転送先パーツはバッテリーを使用していません！")

        const wireToAmount = Object.values(rocket.wires).filter(wire => wire.to == this.to).length
        const toPartNeededEnergy = to.energy.battery.max - to.energy.battery.now
        const toPartNeededEnergyPerWire = toPartNeededEnergy / wireToAmount
        const transportEnergy = Math.min(
            toPartNeededEnergyPerWire,
            this.energizeLimit,
            from.energy.battery.now
        )

        if( transportEnergy > 0 ){
            from.energy.ports[0].useBattery(transportEnergy)
            to.energy.ports[0].chargeBattery(transportEnergy)
            this.transporting = true
        }else{
            this.transporting = false
        }
    }
}