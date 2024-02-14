import p5, { Vector } from "p5"

export const partNames = ["Block", "Motor", "Engine", "Battery"] as const
export type PartName = typeof partNames[number]

const size = 40

export abstract class Part {
    abstract readonly name: PartName
    abstract readonly health: number
    abstract readonly battery: {
        now: number
        max: number
    } | undefined
    abstract customDrawFunc(p: p5): void

    readonly position: Vector
    readonly layer: number
    readonly connectedToTileID: string

    constructor(position: Vector, layer: number, connectedToTileID: string) {
        this.position = position.copy()
        this.layer = layer
        this.connectedToTileID = connectedToTileID
    }


    draw(p: p5, position: Vector, angle: number){
        p.translate(position.x*size, position.y*size)
        p.rotate(angle)
        
        p.strokeWeight(size/20)
        p.fill(200)
        p.stroke(150)

        this.customDrawFunc(p)

        if( this.battery ){
            p.noStroke()
            p.fill(150)
            p.circle(0, 0, size * 0.85)
            p.fill("#0ac729")
            p.arc(0, 0, size*0.85, size*0.85, -Math.PI/2, Math.PI * (this.battery.now / this.battery.max * 2 - 1/2));
            p.fill(255)
            p.circle(0, 0, size * 0.7)
        }

        p.textAlign(p.CENTER)
        p.noStroke()
        p.fill(0)
        p.text(this.layer, 0, 0)

        p.rotate(-angle)
        p.translate(-position.x*size, -position.y*size)
    }
}

class Block extends Part {
    readonly name = "Block"
    readonly health = 100
    readonly maxBattery = 0
    readonly battery = undefined
    customDrawFunc(p: p5): void {
        p.square(
            0, 0, size,
            size/5, size/5, size/5, size/5
        )
    }
}
class Motor extends Part {
    readonly name = "Motor"
    readonly health = 100
    readonly maxBattery = 20
    readonly battery = {
        now: 0,
        max: 100
    }
    customDrawFunc(p: p5): void {
        p.square(
            0, 0, size,
            size/5, size/5, size/5, size/5
        )
    }
}
class Engine extends Part {
    readonly name = "Engine"
    readonly health = 100
    readonly maxBattery = 20
    readonly battery = {
        now: 0,
        max: 100
    }
    customDrawFunc(p: p5): void {
        p.arc(0, size/2, size*4/5, size*5/4, p.PI, 0)
        p.rect(
            0, -size/4, size, size/2,
            size/5, size/5, size/5, size/5
        )
    }
}
class Battery extends Part {
    readonly name = "Battery"
    readonly health = 100
    readonly maxBattery = 500
    readonly battery = {
        now: 0,
        max: 500
    }
    customDrawFunc(p: p5): void {
        p.fill(100)
        p.square(
            0, 0, size,
            size/5, size/5, size/5, size/5
        )
    }
}

const partClasses = [Block, Motor, Engine, Battery]

export const createPart = (position: Vector, layer: number, connectedToTileID: string, partName: PartName) => {
    const newPartClass = partClasses.find(partClass => partClass.name == partName)
    if( !newPartClass ) throw new Error(`パーツ「${partName}」は存在しません！`)
    const newPart = new newPartClass(position, layer, connectedToTileID)

    return newPart
}