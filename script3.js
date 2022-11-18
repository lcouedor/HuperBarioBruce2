function convertVHtoPX(vh){
    return vh * window.innerHeight/100
}

function convertVWtoPX(vw){
    return vw / 100 * [document.documentElement.clientWidth]
}

function getTranslateX(elem) {
    var style = window.getComputedStyle(elem);
    var matrix = new WebKitCSSMatrix(style.transform);
    return matrix.m41
}

let distAuBord = 50
let dixVW = convertVWtoPX(10) //10vw en px
let dixVH = convertVHtoPX(10)
let posXinit = dixVW*(distAuBord/10)
let posYinit = dixVH+5


class Obstacle {
    constructor(width, height, posX, posY, color) {
      this.width = width;
      this.height = height;
      this.posX = posX;
      this.posY = posY;
      this.color = color
    }
}

class Player{
    constructor(){
        this.grounded = true;
        this.jumping = false;
        this.x = posXinit
        this.y = posYinit
        this.velX = 0
        this.velY = 0
        this.speed = 2
        this.jumpHeight = 100
        this.leftBloque = false
        this.rightBloque = false
    }
}

let obstacles = []
let obstacleDOM = []

let keys = {}; //touches pressées
//on met à true la touche concernée quand elle est appuyée
document.onkeydown = e => {
    if (!keys[e.code]) {
        keys[e.code] = true;
    }
};
//on met à false la touche concernée quand elle est relachée
document.onkeyup = e => (keys[e.code] = false);

addEventListener('DOMContentLoaded', () => {
    //varibales de base
    let ground
    let body = document.getElementsByTagName('body')[0]
    let max
    let niveau = 1
    let player
    let playerDom
    let backgroundDom
    let positionObstacle = 0

    //création du background //TODO ajouter possibilité changer image
    function createBackground(){
        let div = document.createElement("div")
        div.style.width = convertVWtoPX(300)+"px"
        div.id = "background"
        body.appendChild(div)
        if(convertVWtoPX(300) > window.innerWidth){
            max = document.getElementById("background").offsetWidth - window.innerWidth//position max de la map
        }else{
            max = document.getElementById("background").offsetWidth - playerDom.offsetWidth//position max de la map
        }
        backgroundDom = div
    }

    //création sol //TODO ajouter possibilité donner des paramètres
    function createGround(){
        let div = document.createElement("div")
        div.id = "ground"
        body.appendChild(div)
        ground = document.getElementById("ground").offsetHeight
    }

    //création joueur //TODO ajouter possibilité donner des paramètres
    function createPlayer(){
        player = new Player()
        //TODO ajouter selon la classe Player
        let div = document.createElement("div")
        div.id = "bario"
        div.style.left = player.x+"px"
        div.style.bottom = player.y+"px"
        body.appendChild(div)
        playerDom = document.getElementById("bario")
        playerDom.style.transitionDuration = 0.3+"s" //TODO gérer duration
    }

    //ajout de tous les obstacles au dom
    function addObstaclesDom(){
        for (o of obstacles){
            let div = document.createElement("div")

            div.style.height = o.height+"px"
            div.style.width = o.width+"px"
            div.style.backgroundColor = o.color
            div.style.position = "absolute"
            div.style.bottom = o.posY+"px"
            div.style.left = o.posX+"px"

            body.appendChild(div)
            obstacleDOM.push(div)
        }
    }

    //création du terrain dans le dom
    function generationNiveau1(){
        obstacles.push(new Obstacle(50, 70, 1200, ground, "red"))
        obstacles.push(new Obstacle(50, 70, 900, ground, "red"))
    }

    //initialisation de tous les éléments
    function init(){
        //on retire tout du DOM
        body.innerHTML = ""
        //Création des éléments
        createGround()
        createPlayer()
        createBackground()
        obstacles = [] //remise à vide des obstacles
        if(niveau == 1){ //on remplit les obstacles selon le niveau choisi
            generationNiveau1()
        }
        organiseObstacle()
        addObstaclesDom() //ajout des obstacles au DOM
    }

    init()

    function update(){
        bgBordGauche = getTranslateX(backgroundDom)==0
        bgBordDroit = -getTranslateX(backgroundDom)+(Math.round(convertVWtoPX(distAuBord))%2==0 ? Math.round(convertVWtoPX(distAuBord)) : Math.round(convertVWtoPX(distAuBord))+1)==max
        joueurGauche = Math.round(playerDom.getBoundingClientRect().left)
        joueurDroit = Math.round(playerDom.getBoundingClientRect().right)
        distBordDroit = Math.round(convertVWtoPX(100-distAuBord))%2==0 ? Math.round(convertVWtoPX(100-distAuBord)) : Math.round(convertVWtoPX(100-distAuBord))+1 
        distBordGauche = Math.round(convertVWtoPX(distAuBord))%2==0 ? Math.round(convertVWtoPX(distAuBord)) : Math.round(convertVWtoPX(distAuBord))+1 

        // check keys
        if (keys["ArrowLeft"] && !player.leftBloque) {
            if(!bgBordGauche && joueurGauche>distBordDroit){
                playerDom.style.left = playerDom.offsetLeft-player.speed+"px"
            }else if(!bgBordGauche){
                player.velX-=player.speed
            }else if(playerDom.offsetLeft > 0){
                playerDom.style.left = playerDom.offsetLeft-player.speed+"px"
            }
            //TODO est ce que c'est bien ici ?
            // playerDom.style.transform = "translateY(-"+(player.y-ground)+"px)"
        }
        if (keys["ArrowRight"] && !player.rightBloque) {
            if(!bgBordDroit && joueurDroit<distBordGauche){
                playerDom.style.left = playerDom.offsetLeft+player.speed+"px"
            }else if(!bgBordDroit){
                player.velX+=player.speed
            }else if(playerDom.offsetLeft < window.innerWidth-playerDom.offsetWidth){
                playerDom.style.left = playerDom.offsetLeft+player.speed+"px"
            }
            //TODO est ce que c'est bien ici ?
            // playerDom.style.transform = "translateY(-"+(player.y-ground)+"px)"
        }
        if(keys["ArrowUp"]){
            if(!player.jumping){
                player.velY+=player.jumpHeight
                player.jumping = true
                // playerDom.style.transform = "translateY(calc(-25vh + "+0+"px))"
                playerDom.style.transform = "translateY(calc(-"+player.velY+"px))"
                setTimeout(function() {
                    playerDom.style.transform = "translateY("+(player.y-ground)+"px)"
                    player.velY=ground
                }, 200); //descente du player au bout de 300ms
                setTimeout(function() {
                    player.jumping = false
                }, 500);
            }
        }

        playerBloque()
        moveElements()
        
    }

    //vérifie si certaines direction du joueur sont bloquées par des obstacles 
    function playerBloque(){

        //droite du joueur en contact avec la gauche de l'obstacle
        if(player.velX + Math.round(convertVWtoPX(distAuBord))+1 == obstacles[0].posX){
            // console.log("contact")
        }
        //gauche du joueur en contact avec la droite de l'obstacle
        if(player.velX + Math.round(convertVWtoPX(distAuBord))+1 == obstacles[0].posX+obstacles[0].width){
            // console.log("contact")
        }
        //une partie du joueur est dans l'obstacle
        if(player.velX + Math.round(convertVWtoPX(distAuBord))+1 >= obstacles[0].posX && player.velX + Math.round(convertVWtoPX(distAuBord))+1 <= obstacles[0].posX+obstacles[0].width){
            // console.log(obstacles[0].height)
            player.y = obstacles[0].height
        }
    }

    //range les obstacles par ordre d'apparition
    function organiseObstacle(){
        obstacles.sort(function (a, b) {
            return a.posX > b.posX ? 1 : -1;
        });
        //initialisation des obstacles alentours
        // obstaclePrecedent = null
        // obstacleSuivant = obstacles[0]
    }

    //déplace le background et les obstacles
    function moveElements(){
        document.getElementById("background").style.transform = "translateX(-"+player.velX+"px)"
        for(o of obstacleDOM){
            o.style.transform = "translateX(-"+player.velX+"px)"
        }
    }


    setInterval(update, 1); //chercher à bouger toutes les 1ms
});

