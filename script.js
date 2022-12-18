addEventListener('DOMContentLoaded', () => {

    //les pistes audio
    let audios = {audioMort: new Audio('assets/sounds/no.mp3'),
                    audioIntro: new Audio('assets/sounds/intro.mp3'),
                    perdu: new Audio('assets/sounds/perdu.mp3'),
                    no: new Audio('assets/sounds/no.mp3'),
                    audioLvl: new Audio('assets/sounds/intro.mp3')};
     
    audios["audioLvl"].loop = true

    //mettre en pause les longs audios (intro, outro, niveaux)
    function stopLongSounds(){
        audios["audioLvl"].pause()
    }

    const canvas = document.querySelector('canvas')
    const c = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let domErreurRatio = document.getElementById("errorRatio")

    //vérifie que le ratio de fenêtre est correct pour afficher le jeu, sinon affiche la fenêtre d'erreur
    function checkRatio(){
        //cas de resize de la fenêtre en jeu, on actualise le canva
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        minPosYplat = canvas.height-groundHeight

        let ratio = canvas.width/canvas.height
        if(canvas.width<canvas.height || canvas.height<650 || canvas.width<900){
        // if(!(ratio>1.2 && ratio < 2) || canvas.width<canvas.height || canvas.height<650){
            domErreurRatio.classList.remove("ratioCorrect")
        }else{
            domErreurRatio.classList.add("ratioCorrect")
        }
    }

    const gravity = 1.5
    let distToWin = 4000 //distance à parcourir avant de valider le niveau
    const tabImgPlayer = [[createImage("assets/img/voldy/VoldyStand0.png"), 
                            createImage("assets/img/voldy/VoldyRunLeft1.png"), 
                            createImage("assets/img/voldy/VoldyRunLeft1.png")],
                            [createImage("assets/img/voldy/VoldyStand1.png"), 
                            createImage("assets/img/voldy/VoldyRunRight1.png"), 
                            createImage("assets/img/voldy/VoldyRunRight2.png")]]

    const tabImageLakitupa = [[createImage("assets/img/chiffon/chiffonGauche.png")],
                            [createImage("assets/img/chiffon/chiffonDroit.png")]]

    const imgChateau = createImage("assets/img/chateau.png")
    // const imgBg = createImage("assets/img/bg.jpeg")
    const imgBg = createImage("assets/img/background.png")
    
    let nbImagePlayer = 0
    let sens = 1 // 1 = droite | 0 = gauche

    //un nombre float aléatoire entre 2 bornes 
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
            //lakitupa défini comme un joueur pour profiter de la gravité
            if(type == "lakitupa"){
                this.speed = randomNumberBetween(0.1,0.6)
                this.image = tabImageLakitupa[0][0]
                this.width = this.image.width/10
                this.height = this.image.height/10
            }else{
                if(!document.getElementById("fpsValue").checked){
                    this.speed = 5*2
                }else{
                    this.speed = 5
                }
                this.image = null
                this.width = 50
                this.height = 70
            }

            this.canMove = true //utilisé uniquement pour le joueur principal
            this.isDead = false //true en cas de contact latéral avec un autre player (un lakitupa)

            //range de déplacement des lakitupa
            this.minX = x-minLakitupa
            this.maxX = x+maxLakitupa

            //pour les lakitupa uniquement
            this.type = type
            this.sens = Math.round(Math.random()) //commence par aller à gauche ou à droite
            this.nbImageLakitupa = 0
            this.nbConsecImage = 0 //nombre de frames ou l'image n'a pas été changée, pour éviter de changer à chaque actualisation (lakitupa épileptique)
            this.nbBeforeChange = Math.round(randomNumberBetween(10,15))

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
                x: x,
                y: minPosYplat-y
            }
            this.y = y
            this.width = width
            this.height = height
            this.image = image
            this.type = type
        }


        draw() {
            this.position.y = minPosYplat-this.y
            //ne pas étirer les élément, mais plutot les répéter autant que nécessaire
            let nbToRepeat = this.width/this.image.width
            let nbToRepeatInt = Math.floor(this.width/this.image.width)
            let resteToRepeat = nbToRepeat-nbToRepeatInt
            if(this.type == "sol"){
                if(nbToRepeatInt>0){
                    for(let i=0; i<nbToRepeatInt; i++){ //on affiche toutes les itérations complètes de l'asset
                        c.drawImage(this.image, this.position.x+i*this.image.width, this.position.y, this.image.width, this.height)
                    }
                    //on affiche le bout restant de l'asset
                    c.drawImage(this.image, this.position.x+nbToRepeatInt*this.image.width, this.position.y, this.image.width*resteToRepeat, this.height)
                }else{
                    //pas besoin de le répéter, on le met en une fois
                    c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
                }
            }else{
                //les plateformes
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
                //mise à l'échelle du background et répétition
                let ratio = canvas.height/this.height
                let newWidth = this.width*ratio

                for(let i=0; i<Math.ceil(distToWin/newWidth); i++){
                    c.drawImage(this.image, this.position.x+i*newWidth, this.position.y, this.width*ratio, this.height*ratio)
                }
            }else if(this.type == "chateau"){
                //placer le chateau de victoire centré au niveau de la porte pour la distToWin
                c.drawImage(this.image, this.position.x-this.width/4+25, minPosYplat-this.height/2, this.width/2, this.height/2)
            }
        }
    }

    //créer une image à partir d'une url
    function createImage (imageSrc) {
        const image = new Image()
        image.src = imageSrc
        return image
    }

    //variables globales nécessaires au programmes, remplies dans la fonction init()
    let player //le joueur principal
    //les différents éléments qui composent un niveau
    let platforms = []
    let lakitupas = []
    let genericOjects = []
    let scrollOffset = 0 //la valeur de défilement de l'écran
    let paused = true //si le jeu est en pause, évite de faire tourner un niveau en fond quand on est dans les menus
    let nbVies = 3
    const nbNiveau = 3
    let currentLevel = null
    let niveauFini = [] //affiche pour chaque niveau s'il a été complété
    for(let i=0; i<nbNiveau; i++){
        niveauFini[i] = false
    }
    let inf = 999999999999
    let timeToBeat = 45 //le temps disponible pour compléter tous les niveaux pour débloquer la fin
    let chrono;
    let bestTime = new Array(nbNiveau) //le meilleur temps par niveau
    for(let i=0; i<nbNiveau; i++){
        bestTime[i] = inf
    }
    //la position du joueur par rapport à l'écran avant de déclencher le scroll
    let offsetPlayerRight = 400
    let offsetPlayerLeft = 100

    let groundHeight = 30
    let platformHeight = 30
    let minPosYplat = canvas.height-groundHeight

    //gestion des appuis, même maintenus, sur les touches flèches gauche et droite
    let keys = {
        right: {
            pressed: false
        }, 
        left: {
            pressed: false
        },
    }

    //la création des niveaux
    function createLevel1(){
        distToWin = 4000
        platforms = [
            new Platform(430,150,100,platformHeight,createImage("assets/img/platform.png")),
            new Platform(600,60,50,platformHeight*2,createImage("assets/img/platform.png")),
            new Platform(650,200,200,40,createImage("assets/img/platform.png")),
            new Platform(1150,100,50,40,createImage("assets/img/platform.png")),
            new Platform(1280,200,200,40,createImage("assets/img/platform.png")),
            new Platform(1500,300,100,40,createImage("assets/img/platform.png")),
            new Platform(1600,400,100,40,createImage("assets/img/platform.png")),
            new Platform(1700,300,100,40,createImage("assets/img/platform.png")),
            new Platform(1800,400,100,40,createImage("assets/img/platform.png")),
            new Platform(1900,500,500,40,createImage("assets/img/platform.png")),
            new Platform(3000,100,50,150,createImage("assets/img/platform.png")),
            new Platform(3130,200,50,50,createImage("assets/img/platform.png")),
            new Platform(3220,300,700,50,createImage("assets/img/platform.png")),
            new Platform(3920,300,30,500,createImage("assets/img/platform.png")),
            //le sol
            new Platform(0,0,900,groundHeight, createImage("assets/img/grass.png"), "sol"),
            new Platform(1000,0,250,groundHeight, createImage("assets/img/grass.png"), "sol"),
            new Platform(2670,0,3000,groundHeight, createImage("assets/img/grass.png"), "sol")]

        genericOjects = [
            new GenericObject (0, 0, imgBg, "background"),
            new GenericObject (distToWin+offsetPlayerRight, 0, imgChateau, "chateau")]

        lakitupas = [
            new Player(300,100,"lakitupa", 50, 300),
            new Player(300,100,"lakitupa", 50, 300),
            new Player(1600,100,"lakitupa", 50, 300),
            new Player(1800,100,"lakitupa", 50, 300),
            new Player(3200,700,"lakitupa", 50, 300),
            new Player(3250,700,"lakitupa", 50, 300),
            new Player(3300,700,"lakitupa", 50, 300),
            new Player(3350,700,"lakitupa", 50, 300),
            new Player(3400,700,"lakitupa", 50, 300),
            new Player(3450,700,"lakitupa", 50, 300),
            new Player(3500,700,"lakitupa", 50, 300),
            new Player(3550,700,"lakitupa", 50, 300),
            new Player(3600,700,"lakitupa", 50, 300),
            new Player(3650,700,"lakitupa", 50, 300),
            new Player(3650,700,"lakitupa", 50, 300),
            new Player(3700,700,"lakitupa", 50, 300),
            new Player(3750,700,"lakitupa", 50, 300),
            new Player(3800,700,"lakitupa", 50, 300),
            new Player(3850,700,"lakitupa", 50, 300),
            new Player(3630,700,"lakitupa", 50, 300),
            new Player(3830,700,"lakitupa", 50, 300),
            new Player(3420,700,"lakitupa", 50, 300),
            new Player(3740,700,"lakitupa", 50, 300),
            new Player(3900,700,"lakitupa", 50, 300)
        ]
    }

    function createLevel3(){
        distToWin = 4000
        platforms = [
            //les plateformes
            new Platform(550,130,100,50,createImage("assets/img/platform.png")),
            new Platform(650,130,50,130,createImage("assets/img/platform.png")), 
            new Platform(620,520,50,300,createImage("assets/img/platform.png")),
            new Platform(770,230,200,50,createImage("assets/img/platform.png")),
            new Platform(1050,330,50,250,createImage("assets/img/platform.png")),
            new Platform(1200,450,50,250,createImage("assets/img/platform.png")),
            new Platform(1350,350,50,250,createImage("assets/img/platform.png")),
            new Platform(1500,450,50,250,createImage("assets/img/platform.png")),
            new Platform(1650,530,500,50,createImage("assets/img/platform.png")),
            new Platform(2300,530,50,500,createImage("assets/img/platform.png")),
            new Platform(2800,130,50,100,createImage("assets/img/platform.png")),
            //le sol
            new Platform(0,0,230,100, createImage("assets/img/grass.png")),
            new Platform(350,0,50,100, createImage("assets/img/grass.png")),
            new Platform(500,0,1850,100, createImage("assets/img/grass.png")),
            new Platform(2570,0,1430,100, createImage("assets/img/grass.png")),
            new Platform(4125,-groundHeight,50,100, createImage("assets/img/grass.png")),
            new Platform(4250,0,1500,100, createImage("assets/img/grass.png"))]

            genericOjects = [
                new GenericObject (0, 0, imgBg, "background"),
                new GenericObject (distToWin+offsetPlayerRight, minPosYplat, imgChateau, "chateau")]

            lakitupas = [
                new Player(560,700,"lakitupa", 50, 300),
                new Player(2700,100,"lakitupa", 100, 0),
                new Player(3200,100,"lakitupa", 30, 30),
                new Player(3210,100,"lakitupa", 30, 30),
                new Player(3220,100,"lakitupa", 30, 30),
                new Player(3230,100,"lakitupa", 30, 30),
                new Player(3240,100,"lakitupa", 30, 30),
                new Player(3250,100,"lakitupa", 30, 30),
                new Player(3260,100,"lakitupa", 30, 30),
                new Player(3270,100,"lakitupa", 30, 30),
                new Player(3280,100,"lakitupa", 30, 30),
                new Player(3290,100,"lakitupa", 30, 30),
                new Player(3300,100,"lakitupa", 30, 30),
                new Player(3310,100,"lakitupa", 30, 30),
                new Player(3320,100,"lakitupa", 30, 30),
                new Player(3200,100,"lakitupa", 30, 30),
                new Player(3330,100,"lakitupa", 30, 30),
                new Player(3340,100,"lakitupa", 30, 30),
                new Player(3500,100,"lakitupa", 30, 30),
                new Player(3360,100,"lakitupa", 30, 30),
                new Player(3370,100,"lakitupa", 30, 30),
                new Player(3380,100,"lakitupa", 30, 30),
                new Player(3390,100,"lakitupa", 30, 30),
                new Player(3400,100,"lakitupa", 30, 30),
                new Player(3410,100,"lakitupa", 30, 30),
                new Player(3420,100,"lakitupa", 30, 30),
                new Player(3430,100,"lakitupa", 30, 30),
                new Player(3440,100,"lakitupa", 30, 30),
                new Player(3450,100,"lakitupa", 30, 30),
                new Player(3460,100,"lakitupa", 30, 30),
                new Player(3470,100,"lakitupa", 30, 30),
                new Player(3480,100,"lakitupa", 30, 30),
                new Player(3490,100,"lakitupa", 30, 30),
                new Player(3500,100,"lakitupa", 30, 30),
                new Player(3510,100,"lakitupa", 30, 30),
                new Player(3520,100,"lakitupa", 30, 30),
                new Player(3530,100,"lakitupa", 30, 30),
                new Player(3540,100,"lakitupa", 30, 30),
                new Player(3550,100,"lakitupa", 30, 30),
                new Player(3560,100,"lakitupa", 30, 30),
                new Player(3570,100,"lakitupa", 30, 30),
                new Player(3580,100,"lakitupa", 30, 30),
                new Player(3590,100,"lakitupa", 30, 30),
                new Player(3600,100,"lakitupa", 30, 30),
                new Player(3600,100,"lakitupa", 30, 30),
                new Player(3610,100,"lakitupa", 30, 30),
                new Player(3620,100,"lakitupa", 30, 30)]
    }

    function createLevel2(){
        distToWin = 2500
        platforms = [
            //les plateformes
            new Platform(1800,100,50,100,createImage("assets/img/platform.png")),
            new Platform(1950,200,50,200,createImage("assets/img/platform.png")), 
            new Platform(2100,300,50,200,createImage("assets/img/platform.png")),
            new Platform(2250,400,50,200,createImage("assets/img/platform.png")),
            new Platform(2400,500,50,200,createImage("assets/img/platform.png")),
            new Platform(2550,600,50,200,createImage("assets/img/platform.png")),
            new Platform(2700,500,200,50,createImage("assets/img/platform.png")),
            new Platform(2900,700,50,500,createImage("assets/img/platform.png")),
            //le sol
            new Platform(0,0,200,100, createImage("assets/img/grass.png")),
            new Platform(350,0,50,100, createImage("assets/img/grass.png")),
            new Platform(550,0,25,100, createImage("assets/img/grass.png")),
            new Platform(675,0,12,100, createImage("assets/img/grass.png")),
            new Platform(800,0,5,100, createImage("assets/img/grass.png")),
            new Platform(950,0,2,100, createImage("assets/img/grass.png")),
            new Platform(1100,50,200,100, createImage("assets/img/grass.png")),
            new Platform(1450,25,30000,100, createImage("assets/img/grass.png"))]

            genericOjects = [
                new GenericObject (0, 0, imgBg, "background"),
                new GenericObject (distToWin+offsetPlayerRight, minPosYplat, imgChateau, "chateau")]

            lakitupas = [
                new Player(1200,500,"lakitupa", 100, 100),
                new Player(2300,500,"lakitupa", 400, 400),
                new Player(2575,100,"lakitupa", 0, 0),
                new Player(2600,500,"lakitupa", 0, 0),
                new Player(2800,100,"lakitupa", 100, 100),
            ]
    }

    //initialisation des variables de l'environnement
    function init(){
        player = new Player(100,100)

        //chargement du niveau choisi
        switch(currentLevel){
            case 1:
                createLevel1()
                audios["audioLvl"].play()
                break
            case 2:
                createLevel2()
                audios["audioLvl"].play()
                break
            case 3:
                createLevel3()
                audios["audioLvl"].play()
                break
            default: platforms = [new Platform(0,750,10000,100, createImage("assets/img/grass.png"))]
        }

        chrono = Date.now() //début du chrono

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

        checkRatio()

        requestAnimationFrame(animate) //callback animation
        c.clearRect(0,0,canvas.width,canvas.height) //clear complet avant de tout réafficher

        //si le jeu n'est pas en cours (on est dans un menu, une animation, ...)
        if(paused) return
        
        //affichage de tous les éléments
        genericOjects.forEach(genericOject => {
            genericOject.draw()
        })
        platforms.forEach(platform => {
            platform.draw()
        })
        lakitupas.forEach(lakitupa => {
            lakitupa.update()
        })
        
        player.update() //le joueur update en dernier pour s'afficher devant tous les autres éléments

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

        //déplacement du joueur
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
            //collision des lakitupa avec le décor, ils changent de sens à la rencontre d'un obstacle
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
                        lakitupa.velocity.x = 0
                        lakitupa.sens = (lakitupa.sens == 0) ? 1 : 0
                }
            })
            //-----------
        })

        //la mort avec le contact du joueur avec des lakitupas
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
                    player.velocity.y-= player.jumpHeight //le joueur rebondit sur le lakitupa

                    lakitupa.sens = (lakitupa.sens == 0) ? 1 : 0
                    let rdNumber = Math.round(randomNumberBetween(-1,1))

                    //déplacement du lakitupa aléatoirement à gauche ou droite du perso principal
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

        //scénario de win
        if(scrollOffset>=distToWin){
            //enregistrement du temps
            now = Date.now()
            chrono = Math.round((now-chrono)/1000)
            if(bestTime[currentLevel-1] > chrono){
                bestTime[currentLevel-1] = chrono
            }

            paused = true
            niveauFini[currentLevel-1] = true
            document.getElementById("menu").style.transform = "translate(-50%,-50%)" //on réaffiche le menu
            majContentMenu() //on met à jour toutes les données du menu (barre d'avancement des niveaux, temps par niveaux et temps total, vies)

            //arrêt des musiques
            stopLongSounds()

        }

        //scénario de mort
        //condition 1 : le joueur est tombé dans un trou
        //condition 2 : isDead car il est rentré en contact latéral avec un lakitupa
        if(player.position.y > canvas.height || player.isDead){
            stopLongSounds()
            paused = true
            //si il lui reste des vies, on en retire
            if(nbVies-1>0){
                nbVies--
                audios["no"].play()
            }else{
                //sinon, il a perdu, on reset l'avancement et les vies
                audios["perdu"].play()
                nbVies = 3
                for(let i=0; i<nbNiveau; i++){
                    niveauFini[i] = false
                }
                createModale("Bouhhhhh, il est nullllll ! Recommence. Vite. Voldy veut son nez.", document.getElementById("menu"))
            }
            document.getElementById("menu").style.transform = "translate(-50%,-50%)"
            majContentMenu()
        }

    }

    //on lance le jeu avec le bon niveau
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
        document.getElementById("menu").style.transform = "translate(-50%,-150%)"
    }

    init()
    animate()

    let lastJump = Date.now() //limiter les multiples sauts en l'air
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

    //click sur le bouton jouer
    document.getElementById("jouerBtn").addEventListener("click", ()=>{
        document.getElementById("intro").classList.add("endIntro")
        // audios["audioIntro"].play()
    })   

    //click sur la mysteryBox du menu
    document.getElementsByClassName("mysteryBox")[0].addEventListener("click", ()=>{
        createModale("test",document.getElementById("menu"), "peach")
    })

    //click sur le bouton d'information pour ouvrir la modale
    document.getElementById("question").addEventListener("click", ()=>{
        createModale("",document.getElementById("menu"), "help")
    })

    //easterEgg rockroll bario
    document.getElementById("barioLogo").addEventListener("click", ()=>{
        location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    })

    //bouton rejouer sur l'écran de fin
    document.getElementById("rejouerBtn").addEventListener("click", ()=>{
        location.reload()
    })

    //fonction pour créer une modale avec un texte à ajouter, un élément auquel ajouter la modale, et un type
    function createModale(texte, ajout, type){
        let div = document.createElement("div")
        div.className = "modale"
        if(type == "peach"){
            div.style.backgroundImage = "url(assets/img/peachColored.png)"
            div.classList.add("centerPeach")
            let h3 = document.createElement("h3")
            h3.innerHTML = "Le saviez-vous ? Le jeu devait à l'origine être un Bario Bruce !"
            h3.classList.add("titreMysteryBox")
            div.appendChild(h3)
        }else if(type == "help"){ //création de la modale d'information
            div.classList.add("modaleHelp")

            let h1 = document.createElement("h1")
            h1.innerHTML = "Voldy's Legacy 1"
            let h3 = document.createElement("h3")
            h3.innerHTML = "(Pourquoi le 1 ? parce que le 2 peut-être un jour ?)"

            let pdiv = document.createElement("div")
            let p1 = document.createElement("p")
            p1.innerHTML = "Raisons de jouer à Voldy's Legacy :"
            let ul = document.createElement("ul")
            let li = document.createElement("li")
            li.innerHTML = "Voldy à un barbecue la semaine prochaine, il a besoin de son nez pour sentir les épices du poulet yassa"
            ul.appendChild(li)
            pdiv.appendChild(p1)
            pdiv.appendChild(ul)

            let p2 = document.createElement("p")
            p2.innerHTML = "Classement de popularité des personnages :"
            let ol = document.createElement("ol")
            let oli1 = document.createElement("li")
            oli1.innerHTML = "<mark>Harry (on comprend pas pourquoi)</mark>"
            let oli2 = document.createElement("li")
            oli2.innerHTML = "Mangetesmort 1"
            let oli3 = document.createElement("li")
            oli3.innerHTML = "Hermione (?? elle est même pas là ?)"
            let oli4 = document.createElement("li")
            oli4.innerHTML = "Mangetesmort 2"
            let oli5 = document.createElement("li")
            oli5.innerHTML = "Voldemort (mal aimé de sa propre oeuvre)"
            ol.appendChild(oli1)
            ol.appendChild(oli2)
            ol.appendChild(oli3)
            ol.appendChild(oli4)
            ol.appendChild(oli5)
            pdiv.appendChild(p2)
            pdiv.appendChild(ol)

            let table = document.createElement("table")
            let row1 = document.createElement("tr")
            let dataR1 = document.createElement("td")
            dataR1.innerHTML = "Je cherche un stage pour fin mars 2023 svp"
            dataR1.setAttribute("colspan",2)
            row1.appendChild(dataR1)

            let row2 = document.createElement("tr")
            data1R2 = document.createElement("td")
            let a1 = document.createElement("a")
            a1.href = "https://github.com/lcouedor"
            a1.innerHTML = "Mon github"
            data1R2.appendChild(a1)
            data2R2 = document.createElement("td")
            let a2 = document.createElement("a")
            a2.href = "https://www.linkedin.com/in/leocouedor/"
            a2.innerHTML = "Mon linkedin"
            data2R2.appendChild(a2)
            row2.appendChild(data1R2)
            row2.appendChild(data2R2)

            let tbody = document.createElement("tbody")
            tbody.appendChild(row1)
            tbody.appendChild(row2)

            table.appendChild(tbody)

            let div2 = document.createElement("div")
            div2.classList = "tableDiv"
            div2.appendChild(table)

            pdiv.appendChild(div2)

            let p3 = document.createElement("p")
            p3.innerHTML = "(Le menu principal contient un easter egg, à toi de le trouver !)"
            p3.classList = "easterEggText"

            pdiv.appendChild(p3)

            div.appendChild(h1)
            div.appendChild(h3)
            div.appendChild(pdiv)
        }else{ //cas générique, on ajoute simplement le texte au corps
            div.innerHTML = texte
        }
        
        //le voile gris semi transparent en fond, dismiss le tout en cas de click
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
    
    //retourne le nombre de niveaux terminés
    function nbNiveauxFinis(){
        let nb = 0
        for(let i=0; i<niveauFini.length; i++){
            if(niveauFini[i]) nb++
        }
        return nb
    }

    //mise à jour de toutes les données du menu
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
            createOutro()
        }
    }
    majContentMenu()

    //true si le jeu est fini, false sinon (true si tous les niveaux sont finis dans le temps imparti)
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

        let text1 = "Harry Potter par ci, Harry Potter par là, y en a toujours que pour lui !"
        let letters = text1.split("")
        let i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[0].innerHTML+=letters[i]
            i++
        }

        await waitForMs(delayParagraphe);

        let text2 = "Mais Voldemort aussi a ses problèmes. Mardi dernier Harry lui a volé son nez ! C'est vraiment pas nice..."
        letters = text2.split("")
        i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[1].innerHTML+=letters[i]
            i++
        }

        await waitForMs(delayParagraphe);

        let text3 = "Guide Voldy jusqu'à Poudlard pour trouver Harry et récupérer les fosses nasales qu'il a hérités de son grand-oncle. Fais bien attention aux mangetesmorts qui ont changé de camp et surveillent maintenant les alentours pour protéger Harry des forces du mal. Tu as "+timeToBeat+"s pour récupérer son nez avant qu'Harry ne le transforme en crasse de troll, bonne chance !"
        letters = text3.split("")
        i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[2].innerHTML+=letters[i]
            i++
        }
        // audios["audioIntro"].pause()

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


    //création de l'écran d'outro
    async function createOutro(){
        //remise à init des valeurs en cas ou le bouton skip intro avait été pressé
        delayText = 30
        delayParagraphe = 400
        delayEndText = 500

        let elem = document.getElementById("outro")

        elem.classList.add("triggerOutro")
        let text = "Voldy te remercie, il a pu récupérer son nez."
        letters = text.split("")
        i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[0].innerHTML+=letters[i]
            i++
        }

        await waitForMs(delayParagraphe);

        text = "Le poulet yassa n'aura jamais eu aussi bonne saveur grâce à toi !"
        letters = text.split("")
        i=0
        while(i<letters.length){
            await waitForMs(delayText);
            elem.children[1].innerHTML+=letters[i]
            i++
        }

        await waitForMs(delayParagraphe);

        document.getElementsByClassName("lineJouer")[1].classList.add("growthEffect")
        document.getElementsByClassName("lineJouer")[1].style.cssText+="transform: scale(1);"

    }

})