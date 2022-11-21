addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('canvas')
    const c = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const gravity = 1.5
    const distToWin = 4000 //distance à parcourir avant de valider le niveau
    const tabImgPlayer = [[createImage("assets/img/mario/MarioStand0.png"), 
                            createImage("assets/img/mario/MarioRunLeft1.png"), 
                            createImage("assets/img/mario/MarioRunLeft1.png")],
                            [createImage("assets/img/mario/MarioStand1.png"), 
                            createImage("assets/img/mario/MarioRunRight1.png"), 
                            createImage("assets/img/mario/MarioRunRight2.png")]]
    const tabImgBackground = [createImage("assets/img/lvl1/background.png"),
                            createImage("assets/img/lvl2/background.png"),
                            createImage("assets/img/lvl3/background.png")]
    let nbImagePlayer = 0
    let sens = 1 // 1 = droite | 0 = gauche

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
            this.width = 50
            this.height = 70
            this.jumpHeight = 20
            this.speed = 5
            this.canMove = true
            
        }
    
        draw(){
            // c.drawImage(tabImgPlayer[sens][nbImagePlayer%tabImgPlayer.length], this.position.x, this.position.y, this.width, this.height)
            c.drawImage(tabImgPlayer[sens][nbImagePlayer%tabImgPlayer[0].length], this.position.x, this.position.y, this.width, this.height)
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
        constructor(x,y,width,height,image) {
            this.position = {
                x,
                y
            }
            this.width = width
            this.height = height
            this.image = image
        }

        draw() {
            // c.fillStyle = this.color
            // c.fillRect(this.position.x, this.position.y, this.width, this.height)
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
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
                c.drawImage(this.image, this.position.x, this.position.y, 100, 100)
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
            new Platform(450,630,100,40,createImage("assets/img/lvl1/platform.png")),
            new Platform(600,700,50,80,createImage("assets/img/lvl1/platform.png")),
            new Platform(650,580,100,40,createImage("assets/img/lvl1/platform.png")),
            new Platform(1280,580,100,40,createImage("assets/img/lvl1/platform.png")),
            new Platform(1150,720,50,40,createImage("assets/img/lvl1/platform.png")),
            new Platform(1500,500,100,40,createImage("assets/img/lvl1/platform.png")),
            new Platform(1500,500,100,40,createImage("assets/img/lvl1/platform.png")),
            new Platform(1600,400,100,40,createImage("assets/img/lvl1/platform.png")),
            new Platform(1700,300,100,40,createImage("assets/img/lvl1/platform.png")),
            new Platform(1800,200,100,40,createImage("assets/img/lvl1/platform.png")),
            new Platform(1900,100,500,40,createImage("assets/img/lvl1/platform.png")),
            new Platform(3000,620,50,150,createImage("assets/img/lvl1/platform.png")),
            new Platform(3130,490,50,50,createImage("assets/img/lvl1/platform.png")),
            new Platform(3220,400,700,50,createImage("assets/img/lvl1/platform.png")),
            new Platform(3920,400,30,500,createImage("assets/img/lvl1/platform.png")),
            //le sol
            new Platform(0,750,900,100, createImage("assets/img/lvl1/ground.png")),
            new Platform(1000,750,250,100, createImage("assets/img/lvl1/ground.png")),
            new Platform(2670,750,3000,100, createImage("assets/img/lvl1/ground.png"))]

            genericOjects = [
                new GenericObject (0, 0, tabImgBackground[0], "background"),
                new GenericObject (distToWin, 800, createImage("assets/img/lvl1/platform.png"), "")]
    }

    document.getElementsByTagName("body")[0].addEventListener("click", (e)=>{
       console.log(e.pageX+scrollOffset,e.pageY)
    })

    function createLevel2(){
        platforms = [
            //les tuyaux
            new Platform(600,700,50,80,createImage("assets/img/lvl2/platform.png")),
            //les plateformes
            new Platform(450,670,100,40,createImage("assets/img/lvl2/platform.png")), 
            new Platform(650,610,100,40,createImage("assets/img/lvl2/platform.png")),
            //le sol
            new Platform(0,750,900,100, createImage("assets/img/lvl2/ground.png")),
            new Platform(1000,750,30000,100, createImage("assets/img/lvl2/ground.png"))]

            genericOjects = [
                new GenericObject (0, 0, tabImgBackground[1], "background")]
    }

    function createLevel3(){
        platforms = [
            //les tuyaux
            new Platform(600,700,50,80,createImage("assets/img/lvl2/platform.png")),
            //les plateformes
            new Platform(450,670,100,40,createImage("assets/img/lvl2/platform.png")), 
            new Platform(650,610,100,40,createImage("assets/img/lvl2/platform.png")),
            //le sol
            new Platform(0,750,900,100, createImage("assets/img/lvl3/ground_.png")),
            new Platform(1000,750,30000,100, createImage("assets/img/lvl3/ground_.png"))]

            genericOjects = [
                new GenericObject (0, 0, tabImgBackground[2], "background")]
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
            case 3:
                createLevel3()
                break
            default: platforms = [new Platform(0,750,10000,100, createImage("assets/img/lvl2/ground.png"))]
        }

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

        //si le jeu n'est pas en cours (on est dans un menu, une animation, ...)
        if(paused) return
        
        genericOjects.forEach(genericOject => {
            genericOject.draw()
        })
        platforms.forEach(platform => {
            platform.draw()
        })

        player.update()

        //définition du sens du joueur pour choisir image affichée
        if(keys.right.pressed){
            sens = 1
            nbImagePlayer++
        }else if(keys.left.pressed){
            sens = 0
            nbImagePlayer++
        }else{
            nbImagePlayer=0
        }

        //TODO mettre des variables au 400 et 100 ?
        if (keys.right.pressed && player.position.x < 400) {
            player.velocity.x = player.speed
        } else if (keys.left.pressed && player.position.x > 100) {
            player.velocity.x = -player.speed
        }else{
            player.velocity.x = 0
            if(player.canMove){
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
            }else{
                player.canMove=true
            }
            
        }

        // platform collision detection
        //jump on platform & gauche droite
        platforms.forEach(platform => {
            if (player.position.y + player.height <= platform.position.y &&
                player.position.y + player.height + player.velocity.y >= platform.position.y && 
                player.position.x + player.width >= platform.position.x &&
                player.position.x <= platform.position.x + platform.width){
                    player.velocity.y = 0
            }

            if (player.position.x+player.width>=platform.position.x &&
                player.position.x<=platform.position.x+platform.width &&
                player.position.y+player.height>=platform.position.y &&
                player.position.y<=platform.position.y+platform.height){
                    player.canMove = false
                    player.velocity.x = -1
                    // if(keys.right.pressed){
                    //     player.velocity.x = -1
                    // }else if(keys.left.pressed){
                    //     player.velocity.x = -1
                    // }
            }

        })

        if(scrollOffset>=distToWin){ //win
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

        // console.log(player.canMove)

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
    
    function nbNiveauxFinis(){
        let nb = 0
        for(let i=0; i<niveauFini.length; i++){
            if(niveauFini[i]) nb++
        }
        return nb
    }

    function majContentMenu(){

        let avanceBarre = parseInt(nbNiveauxFinis())+1
        document.getElementsByClassName("dottedLine2")[0].style.width = "calc((13.75% + 15%)*"+avanceBarre+")"

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
            // alert("Jeu fini, félicitation")
            createOutro()
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


    async function createOutro(){
        //remise à init des valeurs en cas ou le bouton skip intro avait été pressé
        delayText = 30
        delayParagraphe = 400
        delayEndText = 500

        let elem = document.getElementById("outro")

        elem.classList.add("triggerOutro")
        let text = "Félicitation à toi jeune guerrier pour avoir récupéré le saint pitch"
        letters = text.split("")
        i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[0].innerHTML+=letters[i]
            i++
        }

        await waitForMs(delayParagraphe);

        text = "Non pas celle là !"
        letters = text.split("")
        i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[1].innerHTML+=letters[i]
            i++
        }

        await waitForMs(delayParagraphe);

        text = "Ah c'est mieux"
        letters = text.split("")
        i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[2].innerHTML+=letters[i]
            i++
        }

        await waitForMs(delayParagraphe);

        text = "Rendez-vous le 34 février 2042 pour la récupération du saint Candy-up volé par l'Abruce-T !"
        letters = text.split("")
        i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[3].innerHTML+=letters[i]
            i++
        }
    }

})


// son in-game
// https://www.youtube.com/watch?v=M9BoLuyFGx0
// https://www.youtube.com/watch?v=bT7wlxCT5Es
// https://www.youtube.com/watch?v=HU8fNigHTUs  //quand on perd nos vies
// https://www.youtube.com/watch?v=VeFzYPKbz1g 