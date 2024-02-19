import p5, { Vector } from "p5"
import { Port, getPortPosition } from "./port"
import { partEnergyCircleSize, partSize } from "./draw"

export const partNames = ["Block", "Motor", "Engine", "Battery", "Button"] as const
export type PartName = typeof partNames[number]

export abstract class Part {
    abstract readonly name: PartName
    abstract readonly health: number
    abstract readonly energy: {
        readonly battery: {
            now: number
            max: number
        }
        readonly ports: Readonly<Port[]>
    } | undefined
    
    abstract customDrawFunc(p: p5): void
    abstract readonly action?: () => void

    readonly position: Vector

    constructor(
        position: Vector,
        public readonly layer: number,
        public readonly connectedToTileID: string
    ){
        this.position = position.copy()
    }

    draw(p: p5, position: Vector, angle: number){
        p.translate(position.x*partSize, position.y*partSize)
        p.rotate(angle)
        
        p.strokeWeight(partSize/20)
        p.fill(200)
        p.stroke(150)

        this.customDrawFunc(p)

        if( this.energy ){
            p.noStroke()
            p.fill(150)
            p.circle(0, 0, partEnergyCircleSize.outer)
            p.fill("#0ac729")
            p.arc(0, 0, partEnergyCircleSize.outer, partEnergyCircleSize.outer, -Math.PI/2, Math.PI * (this.energy.battery.now / this.energy.battery.max * 2 - 1/2));

            p.fill(255)
            p.circle(0, 0, partEnergyCircleSize.inner)

            const ports = this.energy.ports
            ports.forEach((_, i) => {
                const portPosition = getPortPosition(i, ports.length)
                p.stroke("#000000")
                p.strokeWeight(1.5)
                p.fill("#404040")
                p.circle(portPosition.x, portPosition.y, partSize * 0.2) //TODO:こいつのせいで多分全部おかしくなってる
            })
        }

        p.textAlign(p.CENTER)
        p.noStroke()
        p.fill(0)
        p.text(this.layer, 0, partSize * 0.1)

        p.rotate(-angle)
        p.translate(-position.x*partSize, -position.y*partSize)
    }
}