import p5, { Vector } from "p5"
import { Part } from "./part"
import { energyColor, rocket } from "./main"

const size = 40
type Port = {
    partID: string
    portIndex: number
}

export class Wire {
    readonly energizeLimit = 5

    constructor(
        readonly from: Port,
        readonly to: Port
    ){}

    private drawLine(p: p5, from: Vector, to: Vector, weight: number, color: p5.Color){
        p.strokeWeight(weight)
        p.stroke(color)
        p.line(from.x*size, from.y*size, to.x*size, to.y*size)
    }

    draw(p: p5, constructedParts: { [key: string]: { position: Vector, angle: number, part: Part } }){
        const fromPartPosition = constructedParts[this.from.partID].position
        const fromPartPortLength = rocket.bodyParts[this.from.partID].energy?.ports.length
        if( !fromPartPortLength ) throw new Error("接続されている転送元パーツはバッテリーを使用していません！")
        const from = Vector.sub(fromPartPosition, Vector.fromAngle((this.from.portIndex / fromPartPortLength + 90/360) * Math.PI * 2).mult(0.775 / 2)) // 0.7はpart描画時に用いているouterCircleとinnerCircleの平均
        
        const toPartPosition = constructedParts[this.to.partID].position
        const toPartPortLength = rocket.bodyParts[this.from.partID].energy?.ports.length
        if( !toPartPortLength ) throw new Error("接続されている転送先パーツはバッテリーを使用していません！")
        const to = Vector.sub(toPartPosition, Vector.fromAngle((this.to.portIndex / toPartPortLength + 90/360) * Math.PI * 2).mult(0.775 / 2)) // 0.7はpart描画時に用いているouterCircleとinnerCircleの平均
        
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
        const fromPart = rocket.bodyParts[this.from.partID]
        if( !fromPart.energy ) throw new Error("接続されている転送元パーツはバッテリーを使用していません！")
        const from = fromPart.energy.ports[this.from.portIndex]
        
        const toPart = rocket.bodyParts[this.to.partID]
        if( !toPart.energy ) throw new Error("接続されている転送先パーツはバッテリーを使用していません！")
        const to = toPart.energy.ports[this.to.portIndex]

        const wireToAmount = Object.values(rocket.wires).filter(wire => wire.to == this.to).length
        const toPartNeededEnergy = to.battery.max - to.battery.now
        
        const toPartNeededEnergyPerWire = toPartNeededEnergy / wireToAmount
        const transportEnergy = Math.min(
            toPartNeededEnergyPerWire,
            this.energizeLimit,
            from.battery.now
        )

        if( transportEnergy > 0 ){
            from.useBattery(transportEnergy)
            to.chargeBattery(transportEnergy)
            this.transporting = true
        }else{
            this.transporting = false
        }
    }
}