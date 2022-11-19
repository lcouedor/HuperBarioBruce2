addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas')
    const c = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const gravity = 1.5
    const distToWin = 2000 //distance à parcourir avant de valider le niveau

    //déclaration des attributs du joueur
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
        }
    }

    //décalration des attributs des plateformes, utilisées comme plateformes, tuyau, ou sol
    class Platform {
        constructor(x,y,width,height,color) {
            this.position = {
                x,
                y
            }
            this.width = width
            this.height = height
            this.color = color
        }

        draw() {
            c.fillStyle = this.color
            c.fillRect(this.position.x, this.position.y, this.width, this.height)
        }
    }

    //déclaration des autres objets sans interactions avec le joueur
    class GenericObject {
        constructor(x,y,image, type) {
            this.position = {
                x,
                y
            }
            this.image = image
            this.width = image.width
            this.height = image.height
            this.type = type
        }

        draw() {
            if(this.type == "background"){
                let ratio = canvas.height/this.height
                let newWidth = this.width*ratio

                for(let i=0; i<Math.ceil(distToWin/newWidth); i++){
                    c.drawImage(this.image, this.position.x+i*newWidth, this.position.y, this.width*ratio, this.height*ratio)
                }
            }else{
                c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
            }
        }
    }

    function createImage (imageSrc) {
        const image = new Image ()
        image.src = imageSrc
        return image
    }

    //variables globales nécessaires au programmes, remplies dans la fonction init()
    let player = new Player()
    let platforms = []
    let genericOjects = []
    let scrollOffset = 0
    let paused = true
    let nbVies = 3
    const nbNiveau = 3
    let currentLevel = null
    let niveauFini = []
    for(let i=0; i<nbNiveau; i++){
        niveauFini[i] = false
    }


    //gestion des appuis, même maintenus, sur les touches flèches gauche et droite
    let keys = {
        right: {
            pressed: false
        }, 
        left: {
            pressed: false
        },
    }

    function createLevel1(){
        platforms = [
            //les tuyaux
            new Platform(600,700,50,80,"green"),
            //les plateformes
            new Platform(450,670,100,40,"grey"), 
            new Platform(650,610,100,40,"grey"),
            //le sol
            new Platform(0,750,900,100, "brown"),
            new Platform(1000,750,10000,100, "brown")]
    }

    function createLevel2(){
        platforms = [
            new Platform(0,750,10000,100, "brown")]
    }

    //initialisation des variables de l'environnement
    function init(){
        player = new Player()

        switch(currentLevel){
            case 1:
                createLevel1()
                break
            case 2:
                createLevel2()
                break
            default: platforms = [new Platform(0,750,10000,100, "brown")]
        }

        genericOjects = [
            new GenericObject (0, 0, createImage("assets/img/bg.jpeg"), "background")]

        scrollOffset = 0
        //résolution du bug qui maintenait l'avancement une fois respawn
        keys = {
            right: {
                pressed: false
            }, 
            left: {
                pressed: false
            },
        }
    }

    //animation des déplacements du joueur et de l'environnement, getion des collisions et des conditions de victoire et défaite
    function animate(){
        requestAnimationFrame(animate)
        c.clearRect(0,0,canvas.width,canvas.height)

        if(paused) return
        
        genericOjects.forEach(genericOject => {
            genericOject.draw()
        })
        platforms.forEach(platform => {
            platform.draw()
        })
        player.update()

        //TODO mettre des variables au 400 et 100 ?
        if (keys.right.pressed && player.position.x < 400) {
            player.velocity.x = player.speed
        } else if (keys.left.pressed && player.position.x > 100) {
            player.velocity.x = -player.speed
        }else{
            player.velocity.x = 0
            if (keys.right.pressed && scrollOffset+player.speed<=distToWin) {
                scrollOffset+=player.speed
                platforms.forEach(platform => {
                    platform.position.x -= player.speed
                })
                genericOjects.forEach(genericOject => {
                    genericOject.position.x -= player.speed/2
                })
            } else if (keys.left.pressed && scrollOffset-player.speed>=0) {
                scrollOffset-=player.speed
                platforms.forEach(platform => {
                    platform.position.x += player.speed
                })
                genericOjects.forEach(genericOject => {
                    genericOject.position.x += player.speed/2
                })
            }
        }

        // platform collision detection
        //jump on platform
        platforms.forEach(platform => {
            if (player.position.y + player.height <= platform.position.y &&
                player.position.y + player.height + player.velocity.y >= platform.position.y && 
                player.position.x + player.width >= platform.position.x &&
                player.position.x <= platform.position.x + platform.width){
                    player.velocity.y = 0
            }
        })

        //gauche droite //TODO reste collé quand contact direct //TODO problème quand le background scroll des fois je passe à travers la plateforme
        platforms.forEach(platform => {
            if (player.position.x+player.width>=platform.position.x && 
                player.position.x<=platform.position.x+platform.width &&
                player.position.y+player.height>=platform.position.y &&
                player.position.y<=platform.position.y+platform.height){
                    player.velocity.x = 0
            }
        })

        if(scrollOffset>=distToWin){
            paused = true
            niveauFini[currentLevel-1] = true
            document.getElementById("menu").style.transform = "translateY(0%)"
            majContentMenu()
        }

        if(player.position.y > canvas.height){ //mort
            paused = true
            if(nbVies-1>0){
                nbVies--
            }else{
                nbVies = 3
                for(let i=0; i<nbNiveau; i++){
                    niveauFini[i] = false
                }
            }
            document.getElementById("menu").style.transform = "translateY(0%)"
            majContentMenu()
        }

    }

    for(let i=0; i<nbNiveau; i++){
        document.getElementsByClassName("lineLevels")[0].children[i].addEventListener("click", ()=>{
            currentLevel = i+1
            gameRun()
        })
    }

    //fonction de lancement du jeu, environnement, animation et interactions
    function gameRun(){
        init()
        paused = false
        document.getElementById("menu").style.transform = "translateY(-100%)"
        
    }

    init()
    animate()

    let lastJump = Date.now()
    addEventListener('keydown', ({ keyCode }) => {
        switch (keyCode) {
            case 37:
                keys.left.pressed = true
                break
            case 39:
                keys.right.pressed = true
                break
            case 38:
                let now = Date.now()
                if(now-lastJump>150){
                    lastJump = now
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

    //création d'un délais pour fonction asynchrones
    function waitForMs(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    //délais d'affichages des lettres pour l'effet typing
    let delayText = 30
    let delayParagraphe = 150
    let delayEndText = 500

    //click sur le bouton de skip d'intro
    document.getElementById("passText").addEventListener("click", ()=>{
        delayParagraphe = 0
        delayText = 0
        delayEndText = 0
        document.getElementById("passText").style.display = "none"
    })

    //click sur le bouton pas jouer
    document.getElementById("pasJouerBtn").addEventListener("click", ()=>{
        document.getElementById("pasJouerText").style.display = "flex"
    })

    document.getElementById("jouerBtn").addEventListener("click", ()=>{
        document.getElementById("intro").classList.add("endIntro")
    })   
    
    function majContentMenu(){

        for(let i=0; i<nbNiveau; i++){
            elem = document.getElementsByClassName("lineLevels")[0].children[i]
            if(i>0){
                elem.disabled = true
            }
            if(niveauFini[i]){
                elem.classList.add("levelFinished")
            }else{
                elem.classList.remove("levelFinished")
            }
        }

        for(let i=0; i<nbNiveau; i++){
            elem = document.getElementsByClassName("lineLevels")[0].children[i]
            elemSuivant = document.getElementsByClassName("lineLevels")[0].children[i+1]
            if(niveauFini[i]){
                elem.disabled = false
                if(elemSuivant!=null)
                    elemSuivant.disabled = false
            }
        }

        for(let i=0; i<3; i++){
            document.getElementsByClassName("heart")[i].style.filter = "contrast(0)"
        }
        for(let i=0; i<nbVies; i++){
            document.getElementsByClassName("heart")[i].style.filter = "contrast(1)"
        }

        if(jeuFini()){
            paused = true
            alert("Jeu fini, félicitation")
        }
    }
    majContentMenu()

    function jeuFini(){
        for(let i=0; i<nbNiveau; i++){
            if(!niveauFini[i]){
                return false
            }
        }
        return true
    }

    //création de l'écran d'introduction
    async function createIntro(){
        let elem = document.getElementById("intro")

        let text1 = "Bario dégustait son goûter sur l'herbe verte quand le grand vilain Bruce Manjeurdegouté lui a volé."
        let letters = text1.split("")
        let i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[0].innerHTML+=letters[i]
            i++
        }

        await waitForMs(delayParagraphe);

        let text2 = "Furieux, il décide de partir à sa poursuite pour récupérer ce qui lui appartient."
        letters = text2.split("")
        i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[1].innerHTML+=letters[i]
            i++
        }

        await waitForMs(delayParagraphe);

        let text3 = "Aide Bario à fouiller les manoirs de Bruce, mais fais attention aux Lakitupas qui surveillent le jardin, et aux pièges collants !"
        letters = text3.split("")
        i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[2].innerHTML+=letters[i]
            i++
        }

        await waitForMs(delayEndText);
        document.getElementById("passText").style.display = "none"

        for(let i=0; i<document.getElementsByClassName("textIntro").length; i++){
            document.getElementsByClassName("textIntro")[i].classList.add("textIntroMove")
            document.getElementsByClassName("textIntro")[i].style.cssText+="transition-delay:"+0.2*i+"s;"
        }

        document.getElementsByClassName("lineJouer")[0].classList.add("growthEffect")
        document.getElementsByClassName("lineJouer")[0].style.cssText+="transform: scale(1);"
    }

    createIntro()


})