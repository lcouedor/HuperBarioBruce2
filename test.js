addEventListener('DOMContentLoaded', () => {
    let cases = [[{id: -1, couleur: -1},{id: -1, couleur: -1},{id: -1, couleur: -1}],
                [{id: -1, couleur: -1},{id: -1, couleur: -1},{id: -1, couleur: -1}],
                [{id: -1, couleur: -1},{id: -1, couleur: -1},{id: -1, couleur: -1}]]

    let newId = 0

    //ajout des cases dans le dom
    function createDom(){
        let body = document.getElementsByTagName("body")[0]
        body.innerHTML = "" //on supprime tout son contenu

        for(let i=0; i<cases.length;i++){
            let ligne = document.createElement("div")
            ligne.className = "ligne"
            for(let j=0; j<cases[0].length;j++){
                let num
                let id

                let elem = document.createElement("div")
                elem.className = "case"
                let pion = document.createElement("div")
                pion.className = "elem"
                pion.draggable = true


                if(cases[i][j].couleur == -1){ //cas de l'initialisation
                    num = Math.round(Math.random())+1
                    pion.setAttribute("numPion",newId)
                    cases[i][j].id = newId++
                    cases[i][j].couleur = num
                }else{
                    num = cases[i][j].couleur
                    id = cases[i][j].id
                    pion.setAttribute("numPion",id)
                }
                pion.setAttribute("couleur",num)
                pion.classList.add("elem"+num)
                pion.innerHTML = cases[i][j].id
                
                elem.appendChild(pion)
                ligne.appendChild(elem)
            }
            body.appendChild(ligne)
        }

        //obtenir l'élément déplacé
        for(let i=0; i<document.getElementsByClassName("elem").length; i++){
            document.getElementsByClassName("elem")[i].addEventListener("dragstart", (e) => {
                draggedElem=e.target.attributes.numpion.value
            });
        }

        //vérifie si un échange est possible et le fait
        for(let i=0; i<document.getElementsByClassName("elem").length; i++){
            document.getElementsByClassName("elem")[i].addEventListener("dragend", () => {
                if(echangePossible(draggedElem, dropTarget)){
                    let casesDraggedElem = getIndElemCases(draggedElem)
                    let casesTargetElem = getIndElemCases(dropTarget)
                    swap(casesDraggedElem,casesTargetElem)
                    createDom()
                }
            });
        }

        //enregistre l'élément ciblé par le drag
        for(let i=0; i<document.getElementsByClassName("case").length; i++){
            document.getElementsByClassName("case")[i].addEventListener("dragleave", (e) => {
                if(e.target.children.length == 0){
                    dropTarget = e.target.attributes.numpion.value
                }else{
                    dropTarget = e.target.children[0].attributes.numpion.value
                }
            });
        }

        console.log(removeFirstGroup())
        
    }
    createDom()

    let draggedElem
    let dropTarget

    // document.getElementsByTagName("body")[0].addEventListener("click", () => {
    //     console.log(cases)
    // })

    //vérifie si les coordonnées donnés en paramètres sont échangeables ou non
    function echangePossible(){
        return true //TODO
    }

    //échange le contenu de deux cases de la matrice
    function swap(casesDraggedElem, casesTargetElem){
        target = cases[casesTargetElem[0]][casesTargetElem[1]]
        source = cases[casesDraggedElem[0]][casesDraggedElem[1]]
        cases[casesDraggedElem[0]][casesDraggedElem[1]] = target
        cases[casesTargetElem[0]][casesTargetElem[1]] = source
    }

    //retourne les indices i et j de l'indice de l'élément dans la matrice cases
    function getIndElemCases(id){
        for(let i=0;i<cases.length;i++){
            for(let j=0;j<cases[0].length;j++){
                if(cases[i][j].id == id){
                    return [i,j]
                }
            }
        }
    }

    //retourne le premier groupe à supprimer trouvé
    function removeFirstGroup(){
        let toDelete = []

        //d'abord les lignes horizontales
        for(let i=0; i<cases.length; i++){
            toDelete.push(cases[i][0].id)
            for(let j=0; j<cases[0].length-1; j++){
                if(cases[i][j].couleur == cases[i][j+1].couleur){
                    toDelete.push(cases[i][j+1].id)
                }else{
                    toDelete=[]
                }
            }
            if(toDelete.length==3){
                return toDelete
            }
            toDelete=[]
        }

        //ensuite les lignes verticales
        for(let j=0; j<cases[0].length; j++){
            toDelete.push(cases[0][j].id)
            for(let i=0; i<cases.length-1; i++){
                if(cases[i][j].couleur == cases[i+1][j].couleur){
                    toDelete.push(cases[i+1][j].id)
                }else{
                    toDelete=[]
                }
            }
            if(toDelete.length==3){
                return toDelete
            }
            toDelete=[]
        }
        

        return toDelete
    }

})