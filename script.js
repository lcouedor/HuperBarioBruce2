addEventListener('DOMContentLoaded', () => {

    //les pistes audio
    let audios = {audioMort: new Audio('assets/sounds/no.mp3'),
                    audioIntro: new Audio('assets/sounds/intro.mp3'),
                    perdu: new Audio('assets/sounds/perdu.mp3'),
                    no: new Audio('assets/sounds/no.mp3'),
                    audioLvl1: new Audio('assets/sounds/lvl1.mp3'),
                    audioLvl2: new Audio('assets/sounds/lvl2.mp3'),
                    audioLvl3: new Audio('assets/sounds/lvl3.mp3')};
     
    audios["audioLvl1"].loop = true
    audios["audioLvl2"].loop = true
    audios["audioLvl3"].loop = true

    //mettre en pause les longs audios (intro, outro, niveaux)
    function stopLongSounds(){
        audios["audioLvl1"].pause()
        audios["audioLvl2"].pause()
        audios["audioLvl3"].pause()
    }

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

    const tabImageLakitupa = [[createImage("assets/img/lakitupa/lakitupaStandingLeft.png"), 
                            createImage("assets/img/lakitupa/lakitupaMoveLeft.png"), 
                            createImage("assets/img/lakitupa/lakitupaMoveLeft1.png")],
                            [createImage("assets/img/lakitupa/lakitupaStandingRight.png"), 
                            createImage("assets/img/lakitupa/lakitupaMoveRight.png"), 
                            createImage("assets/img/lakitupa/lakitupaMoveRight1.png")]]

    const imgChateau = createImage("assets/img/chateau.png")
    const imgBg = createImage("assets/img/bg.jpeg")

    let nbImagePlayer = 0
    let sens = 1 // 1 = droite | 0 = gauche

    function randomNumberBetween(min, max) {
        return Math.random() * (max - min) + min
    }

    //déclaration des attributs du joueur
    class Player{
        constructor(x, y, type, minLakitupa, maxLakitupa){
            this.position = {
                x : x,
                y : y
            }
            this.velocity = {
                x : 0,
                y : 10
            }
            
            this.jumpHeight = 20
            if(type == "lakitupa"){
                this.speed = randomNumberBetween(0.1,0.6)
            }else(
                this.speed = 5
            )

            this.canMove = true
            this.isDead = false //true en cas de contact latéral avec un autre player

            this.minX = x-minLakitupa
            this.maxX = x+maxLakitupa

            if(type == "lakitupa"){
                this.image = tabImageLakitupa[0][0]
                this.width = this.image.width/10
                this.height = this.image.height/10
            }else{
                this.image = null
                this.width = 50
                this.height = 70
            }

            this.type = type
            this.sens = Math.round(Math.random())
            this.nbImageLakitupa = 0
            this.nbConsecImage = 0
            this.nbBeforeChange = Math.round((10,15))

        }
    
        draw(){
            if(this.type == "lakitupa"){
                this.nbConsecImage = (this.nbConsecImage+1)%this.nbBeforeChange
                if(this.nbConsecImage == this.nbBeforeChange-1){
                    this.nbImageLakitupa = (this.nbImageLakitupa+1)%tabImageLakitupa[0].length
                }

                this.image = tabImageLakitupa[this.sens][this.nbImageLakitupa]
                c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
            }else{
                c.drawImage(tabImgPlayer[sens][nbImagePlayer%tabImgPlayer[0].length], this.position.x, this.position.y, this.width, this.height)
            }
            
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
        constructor(x,y,width,height,image, type) {
            this.position = {
                x,
                y
            }
            this.width = width
            this.height = height
            this.image = image
            this.type = type
        }


        draw() {
            let nbToRepeat = this.width/this.image.width
            let nbToRepeatInt = Math.floor(this.width/this.image.width)
            let resteToRepeat = nbToRepeat-nbToRepeatInt
            let nbMaxRepeat = 50
            if(this.type == "sol" && nbToRepeatInt<nbMaxRepeat){
                if(nbToRepeatInt>0){
                    for(let i=0; i<nbToRepeatInt; i++){
                        c.drawImage(this.image, this.position.x+i*this.image.width, this.position.y, this.image.width, this.height)
                    }
                    c.drawImage(this.image, this.position.x+nbToRepeatInt*this.image.width, this.position.y, this.image.width*resteToRepeat, this.height)
                }else{
                    c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
                }
            }else{
                c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
            }
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
            }else if(this.type == "chateau"){
                c.drawImage(this.image, this.position.x-this.width/2+25, this.height, this.width, this.height)
            }
        }
    }

    function createImage (imageSrc) {
        const image = new Image()
        image.src = imageSrc
        return image
    }

    //variables globales nécessaires au programmes, remplies dans la fonction init()
    let player
    let platforms = []
    let lakitupas = []
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
    let inf = 999999999999
    let timeToBeat = 25
    let chrono;
    let bestTime = new Array(nbNiveau)
    for(let i=0; i<nbNiveau; i++){
        bestTime[i] = inf
    }
    let offsetPlayerRight = 400
    let offsetPlayerLeft = 100

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
            new Platform(450,630,100,40,createImage("assets/img/platform.png")),
            new Platform(600,700,50,80,createImage("assets/img/platform.png")),
            new Platform(650,580,100,40,createImage("assets/img/platform.png")),
            new Platform(1280,580,100,40,createImage("assets/img/platform.png")),
            new Platform(1150,720,50,40,createImage("assets/img/platform.png")),
            new Platform(1500,500,100,40,createImage("assets/img/platform.png")),
            new Platform(1500,500,100,40,createImage("assets/img/platform.png")),
            new Platform(1600,400,100,40,createImage("assets/img/platform.png")),
            new Platform(1700,300,100,40,createImage("assets/img/platform.png")),
            new Platform(1800,200,100,40,createImage("assets/img/platform.png")),
            new Platform(1900,100,500,40,createImage("assets/img/platform.png")),
            new Platform(3000,620,50,150,createImage("assets/img/platform.png")),
            new Platform(3130,490,50,50,createImage("assets/img/platform.png")),
            new Platform(3220,400,700,50,createImage("assets/img/platform.png")),
            new Platform(3920,400,30,500,createImage("assets/img/platform.png")),
            //le sol
            new Platform(0,750,900,100, createImage("assets/img/grass.png"), "sol"),
            new Platform(1000,750,250,100, createImage("assets/img/grass.png"), "sol"),
            new Platform(2670,750,3000,100, createImage("assets/img/grass.png"), "sol")]

        genericOjects = [
            new GenericObject (0, 0, imgBg, "background"),
            new GenericObject (distToWin+offsetPlayerRight, 0, imgChateau, "chateau")]

        lakitupas = [
            new Player(300,100,"lakitupa", 50, 300),
            // new Player(400,100,"lakitupa")
        ]
    }

    function createLevel2(){
        platforms = [
            //les tuyaux
            new Platform(600,700,50,80,createImage("assets/img/platform.png")),
            //les plateformes
            new Platform(450,670,100,40,createImage("assets/img/platform.png")), 
            new Platform(650,610,100,40,createImage("assets/img/platform.png")),
            //le sol
            new Platform(0,750,900,100, createImage("assets/img/grass.png")),
            new Platform(1000,750,30000,100, createImage("assets/img/grass.png"))]

            genericOjects = [
                new GenericObject (0, 0, imgBg, "background"),
                new GenericObject (distToWin+offsetPlayerRight, 0, imgChateau, "chateau")]
    }

    function createLevel3(){
        platforms = [
            //les tuyaux
            new Platform(600,700,50,80,createImage("assets/img/platform.png")),
            //les plateformes
            new Platform(450,670,100,40,createImage("assets/img/platform.png")), 
            new Platform(650,610,100,40,createImage("assets/img/platform.png")),
            //le sol
            new Platform(0,750,900,100, createImage("assets/img/grass.png")),
            new Platform(1000,750,30000,100, createImage("assets/img/grass.png"))]

            genericOjects = [
                new GenericObject (0, 0, imgBg, "background"),
                new GenericObject (distToWin+offsetPlayerRight, 0, imgChateau, "chateau")]
    }

    document.getElementsByTagName("body")[0].addEventListener("click", (e)=>{
        console.log(e.pageX+scrollOffset,e.pageY)
    })

    //initialisation des variables de l'environnement
    function init(){
        player = new Player(100,100)

        switch(currentLevel){
            case 1:
                createLevel1()
                // audios["audioLvl1"].play()
                break
            case 2:
                createLevel2()
                // audios["audioLvl2"].play()
                break
            case 3:
                createLevel3()
                // audios["audioLvl3"].play()
                break
            default: platforms = [new Platform(0,750,10000,100, createImage("assets/img/grass.png"))]
        }

        chrono = Date.now()

        scrollOffset = 0
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
        lakitupas.forEach(lakitupa => {
            lakitupa.update()
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

        if (keys.right.pressed && player.position.x < offsetPlayerRight) {
            player.velocity.x = player.speed
        } else if (keys.left.pressed && player.position.x > offsetPlayerLeft) {
            player.velocity.x = -player.speed
        }else{
            player.velocity.x = 0
            if(player.canMove){
                if (keys.right.pressed && scrollOffset+player.speed<=distToWin) {
                    scrollOffset+=player.speed
                    platforms.forEach(platform => {
                        platform.position.x -= player.speed
                    })
                    lakitupas.forEach(lakitupa => {
                        lakitupa.position.x-=player.speed
                    })
                    genericOjects.forEach(genericOject => {
                        if(genericOject.type == "background"){
                            genericOject.position.x -= player.speed/2
                        }else{
                            genericOject.position.x -= player.speed
                        }                        
                    })
                } else if (keys.left.pressed && scrollOffset-player.speed>=0) {
                    scrollOffset-=player.speed
                    platforms.forEach(platform => {
                        platform.position.x += player.speed
                    })
                    lakitupas.forEach(lakitupa => {
                        lakitupa.position.x+=player.speed
                    })
                    genericOjects.forEach(genericOject => {
                        if(genericOject.type == "background"){
                            genericOject.position.x += player.speed/2
                        }else{
                            genericOject.position.x += player.speed
                        } 
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
            }

            //-----------
            lakitupas.forEach(lakitupa => {
                if (lakitupa.position.y + lakitupa.height <= platform.position.y &&
                    lakitupa.position.y + lakitupa.height + lakitupa.velocity.y >= platform.position.y && 
                    lakitupa.position.x + lakitupa.width >= platform.position.x &&
                    lakitupa.position.x <= platform.position.x + platform.width){
                        lakitupa.velocity.y = 0
                }
    
                if (lakitupa.position.x+lakitupa.width>=platform.position.x &&
                    lakitupa.position.x<=platform.position.x+platform.width &&
                    lakitupa.position.y+lakitupa.height>=platform.position.y &&
                    lakitupa.position.y<=platform.position.y+platform.height){
                        lakitupa.canMove = false
                        lakitupa.velocity.x = 0
                        lakitupa.sens = (lakitupa.sens == 0) ? 1 : 0
                }
            })
            //-----------
        })

        //la mort avec le contact des lakitupas
        lakitupas.forEach(lakitupa => {
            //si il va à gauche et qu'il n'a pas atteint sa bordure : il continue
            if(lakitupa.sens == 0 && lakitupa.position.x+scrollOffset-lakitupa.speed>lakitupa.minX){
                lakitupa.velocity.x=-lakitupa.speed
            //si il va à droite et qu'il n'a pas atteint sa bordure : il continue
            }else if(lakitupa.sens == 1 && lakitupa.position.x+scrollOffset+lakitupa.speed<lakitupa.maxX){
                lakitupa.velocity.x=lakitupa.speed
            }else{
                lakitupa.velocity.x = 0
                lakitupa.sens = (lakitupa.sens == 0) ? 1 : 0 //changement de sens du lakitupa
            }

            //on est sur un lakitupa, aucun problème
            if (player.position.y + player.height <= lakitupa.position.y &&
                player.position.y + player.height + player.velocity.y >= lakitupa.position.y && 
                player.position.x + player.width >= lakitupa.position.x &&
                player.position.x <= lakitupa.position.x + lakitupa.width){
                    player.velocity.y = 0

                    lakitupa.sens = (lakitupa.sens == 0) ? 1 : 0
                    let rdNumber = Math.round(randomNumberBetween(-1,1))

                    if(rdNumber == -1) lakitupa.position.x -= 5
                    else if(rdNumber == 1) lakitupa.position.x += 5
            }

            //on arrive sur les côtés d'un lakitupa, on meurt
            if (player.position.x+player.width>=lakitupa.position.x &&
                player.position.x<=lakitupa.position.x+lakitupa.width &&
                player.position.y+player.height>=lakitupa.position.y &&
                player.position.y<=lakitupa.position.y+lakitupa.height){
                    player.isDead = true
                    player.velocity.x = 0
            }
        })

        if(scrollOffset>=distToWin){ //win
            now = Date.now()
            chrono = Math.round((now-chrono)/1000)
            if(bestTime[currentLevel-1] > chrono){
                bestTime[currentLevel-1] = chrono
            }

            paused = true
            niveauFini[currentLevel-1] = true
            document.getElementById("menu").style.transform = "translateY(0%)"
            majContentMenu()

            //arrêt des musiques
            stopLongSounds()

        }

        if(player.position.y > canvas.height || player.isDead){ //mort
            stopLongSounds()
            paused = true
            if(nbVies-1>0){
                nbVies--
                // audios["no"].play()
            }else{
                // audios["perdu"].play()
                nbVies = 3
                for(let i=0; i<nbNiveau; i++){
                    niveauFini[i] = false
                }
                createModale("Bouhhhhh, il est nullllll ! Recommence. Vite. Bario a faim.", document.getElementById("menu"))
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
        // audios["audioIntro"].play()
    })   

    document.getElementsByClassName("mysteryBox")[0].addEventListener("click", ()=>{
        createModale("test",document.getElementById("menu"), "peach")
    })

    document.getElementById("question").addEventListener("click", ()=>{
        //TODO faire la modale avec tout le contenu nécessaire
        createModale("Y a dé choz à fére é tou",document.getElementById("menu"))
    })

    function createModale(texte, ajout, type){
        let div = document.createElement("div")
        div.className = "modale"
        if(type == "peach"){
            div.style.backgroundImage = "url(assets/img/peachColored.png)"
        }else{
            div.innerHTML = texte
        }
        
        let voile = document.createElement("div")
        voile.className = "voile"

        ajout.appendChild(div)
        ajout.appendChild(voile)

        div.addEventListener("click", ()=>{
            div.remove()
            voile.remove()
        })

        voile.addEventListener("click", ()=>{
            div.remove()
            voile.remove()
        })
    }
    
    function nbNiveauxFinis(){
        let nb = 0
        for(let i=0; i<niveauFini.length; i++){
            if(niveauFini[i]) nb++
        }
        return nb
    }

    function majContentMenu(){
        let majTemps = document.getElementsByClassName("tempsEcoule")[0]
        let sum = 0
        for(t of bestTime){
            if(t != inf) sum+=t
        }
        majTemps.innerHTML = sum+"/"+timeToBeat+"s"

        let div = document.getElementsByClassName("timersLvl")[0]
        div.innerHTML=""
        
        for(let i=0; i<bestTime.length; i++){
            let text = document.createElement("div")
            text.className = "time-"+i
            text.style.width = "calc(100% / "+bestTime.length+")"
            if(bestTime[i] != inf && niveauFini[i]){
                text.innerHTML = bestTime[i]+"s"
            }else{
                text.innerHTML = "-"
            }
            div.appendChild(text)
        }

        let avanceBarre = parseInt(nbNiveauxFinis())+1
        document.getElementsByClassName("dottedLine2")[0].style.width = "calc((13.75vw + 15vw)*"+avanceBarre+")"

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

        let somme = 0
        for(let i=0; i<bestTime.length; i++){
            somme+=bestTime[i]
        }
        if(!(somme<=timeToBeat)) return false
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

        let text3 = "Aide Bario à fouiller les manoirs de Bruce, mais fais attention aux Lakitupas qui surveillent le jardin, et aux pièges collants ! Tu as "+timeToBeat+"s pour finir avant que Bruce ne mange ton goûter, bonne chance !"
        letters = text3.split("")
        i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[2].innerHTML+=letters[i]
            i++
        }
        audios["audioIntro"].pause()

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


// https://www.youtube.com/watch?v=VeFzYPKbz1g 

/*
    liste sounds : 
        - type : https://www.youtube.com/watch?v=2BUNHd7ENZk
        - message d'intro jouer : intro.mp3
        - message d'intro pas jouer :
        - lvl 1 : https://www.youtube.com/watch?v=M9BoLuyFGx0
        - lvl 2 : https://www.youtube.com/watch?v=bT7wlxCT5Es
        - lvl 3 : 
        - menu : 
        - quand on perd une vie : no.mp3
        - quand on perd toutes nos vies : https://www.youtube.com/watch?v=HU8fNigHTUs
        - quand on gagne :
        - générique : https://www.youtube.com/watch?v=VeFzYPKbz1g
*/