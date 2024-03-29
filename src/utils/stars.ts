import p5, { Vector } from "p5"
import { rocket } from "./rocket"

const rocketSize = 40

export class StarLayer {
    readonly depth: number
    size: number
    stars: {
        brightness: number
        vector: Vector
    }[] = []

    constructor( size: number, depth: number ){
        this.depth = depth
        this.size = size * this.depth
    }

    resize(size: number){
        this.size = size * this.depth
    }

    updateStars(){
        const range = Math.PI
        const angle = rocket.velocity.angleBetween(new Vector(0, -1));
        const newStarVector = Vector.add(
            Vector.fromAngle((Math.random() - 0.5) * range - angle - Math.PI/2).mult(this.size),
            Vector.mult(rocket.position, rocketSize)
        )

        this.stars.push({
            brightness: Math.sin(Math.random()),
            vector: newStarVector
        })

        this.stars = this.stars.filter(star => {
            return Vector.sub(
                star.vector,
                Vector.mult(rocket.position, rocketSize)
            ).mag() < this.size
        })
    }

    draw(p: p5){
        p.noStroke()
        this.stars.forEach(star => {
            p.fill(155 + star.brightness * 100)
            p.circle(
                (star.vector.x - rocket.position.x * rocketSize) / this.depth,
                (star.vector.y - rocket.position.y * rocketSize) / this.depth,
                100 / this.depth + 1
            )
        })
    }
}