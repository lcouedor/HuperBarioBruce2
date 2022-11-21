addEventListener('DOMContentLoaded', () => {
    let taupe = document.getElementById("taupe")
    taupe.classList.add("taupeVisible")

    let cpt = 0

    taupe.addEventListener("click", ()=>{
        // taupe.classList.toggle()
        cpt++
        console.log(cpt)
    })

    
})

