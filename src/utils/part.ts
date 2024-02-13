import { Vector } from "p5"

export const partNames = ["Block", "Motor", "Engine", "Battery"] as const
export type PartName = typeof partNames[number]

export abstract class Part {
    abstract readonly name: PartName
    abstract readonly health: number
    abstract readonly maxBattery: number

    readonly position: Vector
    readonly layer: number
    readonly connectedToTileID: string
    battery: number = 0

    constructor(position: Vector, layer: number, connectedToTileID: string) {
        this.position = position.copy()
        this.layer = layer
        this.connectedToTileID = connectedToTileID
    }
}

class Block extends Part {
    readonly name = "Block"
    readonly health = 100
    readonly maxBattery = 0
}
class Motor extends Part {
    readonly name = "Motor"
    readonly health = 100
    readonly maxBattery = 20
}
class Engine extends Part {
    readonly name = "Engine"
    readonly health = 100
    readonly maxBattery = 20
}
class Battery extends Part {
    readonly name = "Battery"
    readonly health = 100
    readonly maxBattery = 500
}

const partClasses = [Block, Motor, Engine, Battery]

export const createPart = (position: Vector, layer: number, connectedToTileID: string, partName: PartName) => {
    const newPartClass = partClasses.find(partClass => partClass.name == partName)
    if( !newPartClass ) throw new Error(`パーツ「${partName}」は存在しません！`)
    const newPart = new newPartClass(position, layer, connectedToTileID)

    return newPart
}