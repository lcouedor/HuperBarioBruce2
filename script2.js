addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas')
    const c = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const gravity = 1.5
    class Player{
        constructor(){
            this.position = {
                x : 100,
                y : 100
            }
            this.velocity = {
                x : 0,
                y : 10
            }
            this.width = 30
            this.height = 30
            this.jumpHeight = 20
            this.speed = 5
        }
    
        draw(){
            c.fillStyle = "red"
            c.fillRect(this.position.x, this.position.y, this.width, this.height)
        }

        update(){
            this.draw()
            this.position.x+=this.velocity.x
            this.position.y+=this.velocity.y
            if (this.position.y + this.height + this.velocity.y <= canvas.height)
                this.velocity.y += gravity
            else this.velocity.y = 0
        }
    }

    class Platform {
        constructor() {
            this.position = {
                x: 200,
                y: 750
            }
            this.width = 100
            this.height = 200
        }

        draw() {
            c.fillStyle = 'blue'
            c.fillRect(this.position.x, this.position.y, this.width, this.height)
        }
    }
    
    const player = new Player()
    const platform = new Platform()

    const keys = {
        right: {
            pressed: false
        }, 
        left: {
            pressed: false
        }
    }

    function animate(){
        requestAnimationFrame(animate)
        c.clearRect(0,0,canvas.width,canvas.height)
        
        platform.draw()
        player.update()

        if (keys.right.pressed) {
            player.velocity.x = player.speed
        } else if (keys.left.pressed) {
            player.velocity.x = -player.speed
        } else player.velocity.x = 0

        // platform collision detection
        //jump on platform
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y && 
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width){
                player.velocity.y = 0
        }

        //gauche droite
        if(!(player.position.x+player.width+player.speed<=platform.position.x || //TODO finir collision
            player.position.y<=platform.position.y || 
            player.position.x>=platform.position.x+platform.width ||
            player.position.y>=platform.position.y+platform.height)) player.velocity.x = 0
        
    }
    animate()

    addEventListener('keydown', ({ keyCode }) => {
        switch (keyCode) {
            case 37:
                keys.left.pressed = true
                break
            case 39:
                keys.right.pressed = true
                break
            case 38:
                if(player.velocity.y == 0){ //TODO essayer de bloquer le saut quand on tape dedans
                    // console.log(player.position.y+player.jumpHeight-platform.position.y+platform.height)
                    // if(player.position.y-player.jumpHeight>platform.position.y+platform.height){
                    //     console.log("contact")
                    // }
                    player.velocity.y-= player.jumpHeight
                }
                break
        }
    })

    addEventListener('keyup', ({ keyCode }) => {
        switch (keyCode) {
            case 37:
                keys.left.pressed = false
                player.velocity.x = 0
                break
            case 39:
                keys.right.pressed = false
                player.velocity.x = 0
                break
            //TODO vérifier si j'ai bien tout ici (saut)
        }
    })

})

//je suis à 43:20