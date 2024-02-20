import p5, { Vector } from "p5"
import { Part } from "./part"
import { energyColor, mouseFromCenter } from "./main"
import { rocket } from "./rocket"
import { generateUID } from "./uid"
import { getPortPosition } from "./port"
import { partSize } from "../draw/config"
import { mode } from "../hooks/switchMode"

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
        p.line(from.x*partSize, from.y*partSize, to.x*partSize, to.y*partSize)
    }

    draw(p: p5, constructedParts: { [key: string]: { position: Vector, angle: number, part: Part } }){
        const fromPartPosition = constructedParts[this.from.partID].position
        const fromPartPortLength = rocket.bodyParts[this.from.partID].energy?.ports.length
        if( !fromPartPortLength ) throw new Error("接続されている転送元パーツはバッテリーを使用していません！")
        const from = Vector.add(Vector.mult(getPortPosition(this.from.portIndex, fromPartPortLength), 1/partSize), fromPartPosition)
    
        const toPartPosition = constructedParts[this.to.partID].position
        const toPartPortLength = rocket.bodyParts[this.from.partID].energy?.ports.length
        if( !toPartPortLength ) throw new Error("接続されている転送先パーツはバッテリーを使用していません！")
        const to = Vector.add(Vector.mult(getPortPosition(this.to.portIndex, toPartPortLength), 1/partSize), toPartPosition)

        this.drawLine(p, from, to, 6, p.color(200))
        this.drawLine(p, from, to, 4, this.transporting ? p.color(energyColor) :p.color(50))
        
        //水色→オレンジ
        const markVector = Vector.setMag(Vector.sub(to, from), partSize*0.5)
        
        p.noStroke()
        p.fill("#00bbff")
        p.circle(from.x * partSize + markVector.x, from.y * partSize + markVector.y, 6)
        p.fill("#ff9500")
        p.circle(to.x * partSize - markVector.x, to.y * partSize - markVector.y, 6)
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
            const usedEnergy = from.useBattery(transportEnergy)
            if( usedEnergy > 0 ){
                to.chargeBattery(transportEnergy)
                this.transporting = true
                return
            }
        }
        this.transporting = false
    }
}

let wireFrom: {
    partID: string
    portIndex: number
} | undefined = undefined
let stringingWire = false

const range = 10

function getReachedPort(mousePosition: Vector){
    type ReachedPort = {
        partID: string
        portIndex: number
        distanceBetweenMouse: number
    }

    const constructedParts = rocket.constructed.parts
    const nearestAvailablePort = Object.entries(constructedParts).map(([ partID, { part, position, angle } ]) => {
        if( !part.energy ) return
        const { ports } = part.energy

        const availablePorts = ports.map((_, portIndex) => {
            const portPosition = getPortPosition(portIndex, ports.length).rotate(angle).add(Vector.sub(position, rocket.position).mult(partSize))
            const yRevertedPortPosition = new Vector(portPosition.x, portPosition.y)
            const distanceBetweenMouse = Vector.dist(mousePosition, yRevertedPortPosition)
            if(distanceBetweenMouse < range){
                return { partID, portIndex, distanceBetweenMouse}
            }
        }).filter(<T>(data: T): data is Exclude<T, undefined> => !!data)

        return availablePorts
    }).filter(<T>(data: T): data is Exclude<T, undefined> => !!data).flat().sort(({ distanceBetweenMouse: A }, { distanceBetweenMouse: B }) => A - B)[0] as ReachedPort | undefined

    return nearestAvailablePort
}

export const createWire = {
    start: () => {
        if( mode.value != "wire" ) return
        
        const connectPort = getReachedPort(mouseFromCenter.position)
        if( connectPort ){
            const { partID, portIndex} = connectPort
            wireFrom = { partID, portIndex }
            stringingWire = true
        }
    },
    end: (p: p5) => {
        if( mode.value != "wire" ) return
        if( stringingWire && wireFrom ){
            mouseFromCenter.updatePosition(p)
            const connectPort = getReachedPort(mouseFromCenter.position)

            if( connectPort ){
                const uid = generateUID()
                const { partID, portIndex } = connectPort
                rocket.wires[uid] = new Wire(wireFrom, {partID, portIndex})
            }
        }
        wireFrom = undefined
        stringingWire = false
    }
} as const