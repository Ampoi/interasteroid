import p5, { Vector } from "p5"
import { StarLayer } from "../utils/stars"
import { startGame } from "../core/main"
import { rocket } from "../utils/rocket"
import { constructParts } from "../utils/constructParts"
import { drawCursor } from "./cursor"
import { addPart, deleteClickedPart, mouseFromCenter } from "../utils/main"
import { createWire } from "../utils/wire"
import { mode, selectedPart, switchMode } from "../hooks/switchMode"
import { partSize } from "./config"

export const createDrawer = () => new p5((p: p5) => {
    const starLayers: StarLayer[] = []

    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight)
        p.rectMode(p.CENTER);

        [100, 200, 400].forEach((depth) => {
            starLayers.push(new StarLayer(Math.sqrt(p.width ** 2 + p.height ** 2) / 2, depth))
        });

        startGame()
    }

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight)
        starLayers.forEach(layer => layer.resize(Math.sqrt(((p.width / 2) ** 2) + ((p.height / 2) ** 2))))
    }

    p.draw = () => {
        p.background(0)
        p.translate(p.windowWidth/2, p.windowHeight/2)
        
        p.rotate(-rocket.angle)

        starLayers.forEach((starLayer) => {
            starLayer.updateStars()
            starLayer.draw(p)
        })

        p.translate(Vector.mult(rocket.position, -partSize))

        const constructedParts = constructParts()
        
        Object.entries(constructedParts).forEach(([_id, { position, angle, part }]) => {
            part.draw(p, position, angle)
        })
        Object.values(rocket.wires).forEach((wire) => {
            wire.draw(p, constructedParts)
        })

        p.translate(Vector.mult(rocket.position, partSize))

        p.translate(Vector.mult(rocket.centerOfGravity, partSize))

        const yellow = p.color(244, 214, 33)
        const black = p.color(0)
        const size = partSize * 0.4
        
        for( let i = 0; i<4; i++ ){
            const offset = Math.PI / 2 * i
            p.fill(i % 2 == 1 ? yellow : black)
            p.noStroke()
            p.arc(0, 0, size, size, 0 + offset, Math.PI/2 + offset)
        }

        p.translate(Vector.mult(rocket.centerOfGravity, -partSize))

        p.rotate(rocket.angle)

        drawCursor(p)        
    }
    
    p.mouseMoved = () => mouseFromCenter.updatePosition(p)

    p.mousePressed = createWire.start
    p.mouseReleased = () => createWire.end(p)

    p.mouseClicked = () => {
        if( mode.value == "build" ){
            addPart(selectedPart.value, mouseFromCenter.partPosition)
        }
    }
    document.oncontextmenu = (event: MouseEvent) => deleteClickedPart(event, mouseFromCenter.partPosition)

    p.keyPressed = switchMode
})