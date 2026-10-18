import { TriggerRaceTrack } from './GeneticRacetrack/GeneticRacetrack.js';
import { TriggerFilterKernel } from './FilterKernel/FilterKernel.js';
import { TriggerBPGD } from './BackProp/BackPropGradDesc.js';
import { TriggertxtPrcss } from './TextProcessing/TextProcessing.js';

function CatalogueShow(){
    const targetinfo=document.getElementById("TargetInfo");
    const contentTarget=document.getElementById("contentTarget");

    targetinfo.style.display="none";
    contentTarget.style.display="grid"
}

function ShowProject(which){
    const targetinfo=document.getElementById("TargetInfo");
    const contentTarget=document.getElementById("contentTarget");
    
    const ProjectHere = document.getElementById("ProjectHere");
    while (ProjectHere.firstChild) {ProjectHere.removeChild(ProjectHere.lastChild);}
    // console.log(which)
    switch(which){
        case "racecar":
            TriggerRaceTrack();
            break;
        case "FilterKernel":
            TriggerFilterKernel();
            break;
        case "BPGD":
            TriggerBPGD();
            break;
        case "txtPrcss":
            TriggertxtPrcss();
            break;
        default:
            console.log("erm")
            return;
    }    
    targetinfo.style.display="flex";
    contentTarget.style.display="none"

}

document.querySelectorAll('.ProjectBillboard').forEach(el => {
    el.addEventListener('click', () => ShowProject(el.getAttribute('param')));
});

document.getElementById('returnCatalog').addEventListener('click', CatalogueShow);