import { Vector } from "p5"
import { Battery } from "./parts/battery"
import { Block } from "./parts/block"
import { Button } from "./parts/button"
import { Engine } from "./parts/engine"
import { Motor } from "./parts/motor"
import { type PartName } from "./part"

const partClasses = [Block, Motor, Engine, Battery, Button]

export const createPart = (position: Vector, layer: number, connectedToTileID: string, partName: PartName) => {
    const newPartClass = partClasses.find(partClass => partClass.name == partName)
    if( !newPartClass ) throw new Error(`パーツ「${partName}」は存在しません！`)
    const newPart = new newPartClass(position, layer, connectedToTileID)

    return newPart
}