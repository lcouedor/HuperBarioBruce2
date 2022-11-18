// https://stackoverflow.com/questions/5841853/keydown-repetition-breaks-when-keyup-event-for-another-key-is-fired
// https://www.spriters-resource.com/fullview/53664/

//variables
let ressourceFolder = "img"
let tabBarioPic = ["marioRun1.png","marioRun2.png","marioRun3.png"]
let barioPic = 0
let niveau = 1
let positionObstacle = 0
let drapeau
let dixVW = 10 / 100 * [document.documentElement.clientWidth] //10vw en px
let lastJump = Date.now()
let ground = 0
let estAuSol = true

addEventListener('DOMContentLoaded', () => {

    /*  ******** FONCTIONS PRIMAIRE MOUVEMENT SUR LA MAP ********  */

    //variables dom
    let body = document.getElementsByTagName('body')[0]
    let background = document.getElementById('background')
    let joueur = document.getElementById("bario")
    let max = document.getElementById("background").offsetWidth - window.innerWidth //position max de la map
    let pos = 0 //position courante de la map

    let keys = {}; //touches pressées
    //on met à true la touche concernée quand elle est appuyée
    document.onkeydown = e => {
        if (!keys[e.code]) {
            keys[e.code] = true;
        }
    };
    //on met à false la touche concernée quand elle est relachée
    document.onkeyup = e => (keys[e.code] = false);

    function move(){
        //problème quand key down et alt tab, key down conservé
        if (keys["ArrowLeft"]) {
            majPos("left")
        }
        else if (keys["ArrowRight"]) {
            majPos("right")
        }
        if (keys["ArrowUp"]) {
            // up arrow
            now = Date.now()
            if(now>lastJump+400){ //400ms avant de resauter
                lastJump = now
                bario.style.transform = "translateY(calc(-25vh + "+ground+"px))"
                setTimeout(function() {
                    bario.style.transform = "translateY("+ground+"px)"
                }, 200); //descente du bario au bout de 200ms
            }
        }
        if(!keys["ArrowLeft"] && !keys["ArrowRight"]){ //bario est à l'arrêt
            bario.style.backgroundImage = "url('"+ressourceFolder+"/"+tabBarioPic[0]+"')"
            barioPic = 0
        }
        
    }

    setInterval(move, 1); //chercher à bouger toutes les 1ms
    
    //maj de la variable position pour bouger le background
    function majPos(sens){
        leftPerso = dixVW
        rightPerso = dixVW+joueur.offsetWidth
        bottomPerso = joueur.getBoundingClientRect().bottom
        leftObstacleSuivant = obstacles[positionObstacle].getBoundingClientRect().left
        rightObstacleSuivant = obstacles[positionObstacle].getBoundingClientRect().left + obstacles[positionObstacle].offsetWidth
        topObstacleSuivant = obstacles[positionObstacle].getBoundingClientRect().bottom

        qteAjout = 10
        if(sens=="left" && pos+qteAjout<=0){ //on va a gauche
            majPicBario()
            if(!(rightPerso>leftObstacleSuivant+qteAjout && leftPerso<rightObstacleSuivant && topObstacleSuivant <= bottomPerso)){
                pos+=qteAjout
            }
        }

        if(sens=="right" && pos-qteAjout>=-max){ //on va à droite
            majPicBario()
            if(!(rightPerso>leftObstacleSuivant && leftPerso<rightObstacleSuivant-qteAjout && topObstacleSuivant <= bottomPerso)){
                pos-=qteAjout
            }
        }

        
        if(rightPerso>leftObstacleSuivant+qteAjout && leftPerso<rightObstacleSuivant-qteAjout && topObstacleSuivant > bottomPerso){
            // console.log("sur obstacle")
            ground = -obstacles[positionObstacle].offsetHeight
            estAuSol = false
        }else{
            ground = 0
            if(!estAuSol){
                estAuSol = true
                bario.style.transform = "translateY("+ground+"px)"
            }
        }

        majObstacle()

        //vérifier si on a gagné
        if(document.getElementById("finishLine").getBoundingClientRect().left< dixVW){
            // alert("gagné")
            init()
        }
    }

    //maj défilement background et éléments obstacles
    function majObstacle(){
        background.style.transform  = "translateX("+pos+"px)"
        for(o of obstacles){
            o.style.transform = "translateX("+pos+"px)"
        }
        drapeau.style.transform = "translateX("+pos+"px)"

        //maj position actuelle dans le tableau des obstacles (position = obstacle suivant)
        if(obstacles[positionObstacle+1]!= null && obstacles[positionObstacle].getBoundingClientRect().left+obstacles[positionObstacle].offsetWidth-dixVW<0){
            positionObstacle++
        }
        if(obstacles[positionObstacle-1]!= null && obstacles[positionObstacle-1].getBoundingClientRect().left+obstacles[positionObstacle].offsetWidth-dixVW>0){
            positionObstacle--
        }

    }

    //mettre à jour le sprite du background du Bario
    function majPicBario(){
        joueur.style.backgroundImage = "url('"+ressourceFolder+"/"+tabBarioPic[++barioPic%tabBarioPic.length]+"')"
    }

    /*  ******** FONCTIONS RELATIVES AUX NIVEAUX ********  */
    let obstacles = [] //tableau de tous les obstacles du niveau
    function createPipe(pos, tmp){ //TODO supprimer tmp
        let div = document.createElement("div")
        if(tmp==2){
            div.classList.add("grandPipe")
        }
        div.setAttribute("test",tmp)
        div.classList.add("pipe")
        div.style.left = pos +"vw"
        return div
    }

    function createFinishLine(){
        let div = document.createElement("div")
        posDrapeau = max * 100 / [document.documentElement.clientWidth]
        div.style.left = posDrapeau+"vw"
        div.id = "finishLine"
        return div
    }

    if(niveau == 1){ //TODO remplacer par un switch quand j'aurais plusieurs niveaux
        // generationNiveau1()
    }

    //tri des obstacles selon leur ordre d'arrivée
    function organiseObstacle(){
        obstacles.sort(function (a, b) {
            return parseInt(a.style.left.substr(0,a.style.left.length-2)) > parseInt(b.style.left.substr(0,b.style.left.length-2)) ? 1 : -1;
        });
        //initialisation des obstacles alentours
        obstaclePrecedent = null
        obstacleSuivant = obstacles[0]
    }

    // function affObs(){
    //     for(o of obstacles){
    //         console.log(o.style.left)
    //     }
    // }

    //fonction pour créer le niveau 1
    function generationNiveau1(){
        obstacles = []
        //création des obstacles
        obstacles.push(createPipe(20,1))
        obstacles.push(createPipe(30,2))
        obstacles.push(createPipe(150,3))
        obstacles.push(createPipe(120,4))
        drapeau = createFinishLine()
        organiseObstacle()
        //ajout de tous les obstacles au dom
        for(o of obstacles){
            body.appendChild(o)
        }
        body.appendChild(drapeau)
    }

    function init(){
        for(o of obstacles){
            body.removeChild(o)
        }
        if(drapeau !=null){
            body.removeChild(drapeau)
        }
        generationNiveau1()
        //TODO vider le DOM
        ground = 0
        estAuSol = true
        positionObstacle = 0
        barioPic = 0
        background.style.transform = "translateX(0)"
        bario.style.transform = "translateY(0)"
        majPicBario() //afficher la première image du bario
    }

    init()

});