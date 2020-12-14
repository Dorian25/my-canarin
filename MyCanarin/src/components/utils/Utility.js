/**
 * Ce fichier est un utilitaire de fonction.
 * Toutes les fonctions sont exportables vers toutes les autres fichiers.
 *
 */
import React from "react";
import { Platform, AsyncStorage, Alert, AlertIOS } from 'react-native';

//file system = gestionnaire de fichiers
export const RNFS = require('react-native-fs');

// chemin du fichier de record et du fichier temporaire selon la plateforme du tel
export const PATH_FILE = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath + "/record_canarin.txt" : RNFS.ExternalDirectoryPath +  "/record_canarin.txt"; 
export const PATH_TEMP_FILE = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath + "/temp.txt" : RNFS.ExternalDirectoryPath +  "/temp.txt"; 

/**
 * Verifie l'existante du compteur de record qui correspond a l'id courant qui sera
 * rentre dans le fichier d'enregistrement.
 * S'il n'est pas présent, on le cree et on le initialise a 0.
 * Ce check est fait a chaque nouvelle ouverture de l'application.
 */
export async function checkCounterRecord() {
  try {
    //on recupere la valeur du compteur
    var valueR = await AsyncStorage.getItem('counterRecord');

    //si elle n'existe pas, on la cree
    if(valueR == null) {
      //On initialise le counter à 0 (correspond à l'id courant)
      try {

        await AsyncStorage.setItem('counterRecord', '0');

      } catch (error) {
          console.log("Error");
      }
    }

  } catch (error) {
    console.log("Error");
  } 
}
/**
 * Verifie l'existante du compteurs de status qui correspond a l'id courant qui sera
 * rentre dans le fichier d'enregistrement.
 * S'il n'est pas présent, on le cree et on le initialise a 0.
 * Ce check est fait a chaque nouvelle ouverture de l'application.
 */
export async function checkCounterStatus() {
  try {
    //on recupere la valeur du compteur
    var valueS = await AsyncStorage.getItem('counterStatus');


    if (valueS == null) {
      //On initialise le counter à 0 (correspond à l'id courant)
      try {

        await AsyncStorage.setItem('counterStatus', '0');

      } catch (error) {
          console.log("Error");
      }
    }

  } catch (error) {
    console.log("Error");
  } 
}

/**
 * Verifie l'existante du fichier de record.
 * S'il n'est pas présent, on le cree.
 * Ce check est fait a chaque nouvelle ouverture de l'application.
 *
 */
export function checkFileRecord() {
	RNFS.exists(PATH_FILE)
    .then((exist) => {
      if(exist) {
      
      } else {
        //on cree le fichier s'il n'exsite pas
        RNFS.writeFile(PATH_FILE, "", 'utf8')
        	.then((success) => {
        	})
        	.catch((err) => {
          		alert(err.message);
        	});
      }
    })
    .catch((err) => {
      alert(err.message);
    });
}

/**
 * Permet d'ajouter un enregistrement au fichier.
 * L'ajout se fait à la fin du fichier.
 * Il s'agit de la sauvegarde du lieu de l'utilisateur lorsqu'il clique sur l'un des
 * boutons de l'onglet "WhereAmI ?"
 *
 */
export function saveNewRecord(oldIdRecord, dataRecord, status, dateFin) {
  if(dateFin == null) {
      RNFS.appendFile(PATH_FILE, dataRecord + status, 'utf8')
        .then((success) => {
        })
        .catch((err) => {
          alert(err.message);
        });
  } else {
    //on recupere le contenu du fichier
    let whenDataLoaded = RNFS.readFile(PATH_FILE, 'utf8');

    whenDataLoaded.then((val)=>{
      //on le decoupe en ligne (ce qui donne un tableau contenant les lignes du fichier)
      let tab = val.split('\n');

      //on parcourt les lignes du fichier
      for(let i=0; i < tab.length; i++) {
        //on decoupe la ligne pour recuperer un tableau contenant les valeurs de l'enregistrement
        let elements = tab[i].split(';');
        //on compare l'id de l'enregistrement a celui de l'enregistrement a modifie
        //s'il correspond a l'indice, on ecrit les nouvelles donnees
        if(elements[0] === oldIdRecord) {
          //data contient \n si c'est une activite finie
          saveDataTemp(tab[i] + dateFin + "\n");
        } else {
          //on recopie dans le fichier temp
          if(i === tab.length - 1) {
            saveDataTemp(tab[i] + dateFin + "\n" + dataRecord + status);
          } else {
            saveDataTemp(tab[i] + "\n");
          }
        }
      }
      //on supprime le fichier d'origine
      RNFS.unlink(PATH_FILE)
      .then(() => {
        //on renomme le fichier temp comme le fichier d'origine
        RNFS.moveFile(PATH_TEMP_FILE,PATH_FILE)
        .then(() => {
         
        })
        .catch((err) => {
            alert(err.message);
          });
      })
      .catch((err) => {
            alert(err.message);
      }); 

    })
    .catch((err) => {
        alert(err.message);
    });
  }
}

export function saveNewStatus(dateFin, status) {
  RNFS.appendFile(PATH_FILE, dateFin+"\n"+status, 'utf8')
        .then((success) => {
        })
        .catch((err) => {
          alert(err.message);
        });
}

/**
 * Permet d'ajouter un enregistrement au fichier temp.
 * L'ajout se fait à la fin du fichier.
 * Il s'agit d'une copie d'un enregisrrement dans le fichier temporaire.
 *
 */
function saveDataTemp(data) {
  RNFS.appendFile(PATH_TEMP_FILE, data, 'utf8')
        .then((success) => {
          //alert('FILE WRITTEN!');
        })
        .catch((err) => {
          alert(err.message);
        });
}

/**
 * Permet de mettre a jour un enregistrement en remplacant son contenu
 * par de nouvelles valeurs (data) en connaissant son id (indice).
 * Pour cela, on parcourt le fichier de record d'origine jusqu'à trouver l'id.
 * Tant que l'id ne correspond pas à l'indice passe en argument, on recopie les 
 * enregistrements dans le fichier temp.
 * S'il est trouve, on ecrit les nouvelles valeurs a la place.
 * A la fin du processus, le contenu du fichier d'origine est à jour dans le fichier
 * temp. On a juste a supprimer le fichier d'origine et a renommer le fichier temp
 * par le meme nom que le fichier d'origine.
 *
 */
export function updateRecord(indice, data) {
  //on recupere le contenu du fichier
  let whenDataLoaded = RNFS.readFile(PATH_FILE, 'utf8');

  whenDataLoaded.then((val)=>{
    //on le decoupe en ligne (ce qui donne un tableau contenant les lignes du fichier)
    let tab = val.split('\n');

    //on parcourt les lignes du fichier
    for(let i=0; i < tab.length; i++) {
      //on decoupe la ligne pour recuperer un tableau contenant les valeurs de l'enregistrement
      let elements = tab[i].split(';');
      //on compare l'id de l'enregistrement a celui de l'enregistrement a modifie
      //s'il correspond a l'indice, on ecrit les nouvelles donnees
      if(elements[0] === indice) {
        //data contient \n si c'est une activite finie
        saveDataTemp(data);
      } else {
        //on recopie dans le fichier temp 
        //si c'est le dernier element, il s'agit de l'activite courante donc on ne met pas de 
        //retour a la ligne
        if(i === tab.length - 1) {
          saveDataTemp(tab[i]);
        } else {
          saveDataTemp(tab[i] + "\n");
        }
      }
    }
    //on supprime le fichier d'origine
    RNFS.unlink(PATH_FILE)
    .then(() => {
      //on renomme le fichier temp comme le fichier d'origine
      RNFS.moveFile(PATH_TEMP_FILE,PATH_FILE)
      .then(() => {
        alertMessage("Update", "The activity has been updated successfuly !");
      })
      .catch((err) => {
          alert(err.message);
        });
    })
    .catch((err) => {
          alert(err.message);
    }); 

  })
  .catch((err) => {
      alert(err.message);
  });
}

/**
 * Permet de mettre a jour un enregistrement en remplacant son contenu
 * par de nouvelles valeurs (data) en connaissant son id (indice).
 * Pour cela, on parcourt le fichier de record d'origine jusqu'à trouver l'id.
 * Tant que l'id ne correspond pas à l'indice passe en argument, on recopie les 
 * enregistrements dans le fichier temp.
 * S'il est trouve, on ecrit les nouvelles valeurs a la place.
 * A la fin du processus, le contenu du fichier d'origine est à jour dans le fichier
 * temp. On a juste a supprimer le fichier d'origine et a renommer le fichier temp
 * par le meme nom que le fichier d'origine.
 *
 */
export function updateStatus(indice, data) {
  //on recupere le contenu du fichier
  let whenDataLoaded = RNFS.readFile(PATH_FILE, 'utf8');

  whenDataLoaded.then((val)=>{
    //on le decoupe en ligne (ce qui donne un tableau contenant les lignes du fichier)
    let tab = val.split('\n');

    //on parcourt les lignes du fichier
    for(let i=0; i < tab.length; i++) {
      //on decoupe la ligne pour recuperer un tableau contenant les valeurs de l'enregistrement
      let elements = tab[i].split(';');
      //on compare l'id de l'enregistrement a celui de l'enregistrement a modifie
      //s'il correspond a l'indice, on ecrit les nouvelles donnees
      if(elements[0] === "status" && elements[1] === indice) {
        if(i === tab.length - 1) {
        //data contient \n si c'est une activite finie
          saveDataTemp(data);
        } else {
          saveDataTemp(data + "\n");
        }
      } else {
        //on recopie dans le fichier temp 
        //si c'est le dernier element, il s'agit de l'activite courante donc on ne met pas de 
        //retour a la ligne
        if(i === tab.length - 1) {
          saveDataTemp(tab[i]);
        } else {
          saveDataTemp(tab[i] + "\n");
        }
      }
    }
    //on supprime le fichier d'origine
    RNFS.unlink(PATH_FILE)
    .then(() => {
      //on renomme le fichier temp comme le fichier d'origine
      RNFS.moveFile(PATH_TEMP_FILE,PATH_FILE)
      .then(() => {
        alertMessage("Update", "The status has been updated successfuly !");
      })
      .catch((err) => {
          alert(err.message);
        });
    })
    .catch((err) => {
          alert(err.message);
    }); 

  })
  .catch((err) => {
          alert(err.message);
  });
}



/**
 * Permet de supprimer un enregistrement en connaissant son id.
 * On recopie dans le fichier temp tous les enregistrments sauf celui 
 * qui a l'id egale a "indice". 
 * on crée un booleen pour savoir quand on trouvé l'activité.
 * on le met true si on la trouve.
 * s'il est à true, on supprime tous les status qui suivent.
 * Condition necessaire pour ecrire dans le fichier
 * ___________________________________________________
 * (find & id==indice) || (find & elements[0]==status)
 *
 * __________________     ____________________________
 * (find & id==indice) && (find & elements[0]==status)
 *
 * ____    __________     ____    ___________________
 * find || id==indice  && find || elements[0]==status
 */
export function deleteRecord(indice) {

  var findActivity = false

  let whenDataLoaded = RNFS.readFile(PATH_FILE, 'utf8');

  whenDataLoaded.then((val)=>{

    let tab = val.split('\n');

    for(let i=0; i < tab.length; i++) {

      let elements = tab[i].split(';');

      if(findActivity && elements[0] !== "status") {
        findActivity = false
      }

      if(elements[0] === indice) {
        findActivity = true
      }
    
      //on ecrit tout sur le fichier temp sauf l'enregistrement a supprimer
      if((!findActivity || elements[0] !== indice) && (!findActivity || elements[0] !== "status")) {
        if(i === tab.length - 1) {
          saveDataTemp(tab[i]);
        } else {
          saveDataTemp(tab[i] + "\n");
        }
      }
    }

    //on supprime le fichier d'origine
    RNFS.unlink(PATH_FILE)
    .then(() => {
      //on renomme le fichier temp comme le fichier d'origine
      RNFS.moveFile(PATH_TEMP_FILE,PATH_FILE)
      .then(() => {
        alertMessage("Deleted", "The activity has been deleted successfuly !");
      })
      .catch((err) => {
          alert(err.message);
        });
    })
    .catch((err) => {
          alert(err.message);
    }); 

  })
  .catch((err) => {
      alert(err.message);
  });
}

/**
 * Permet de supprimer un enregistrement en connaissant son id.
 * On recopie dans le fichier temp tous les enregistrments sauf celui 
 * qui a l'id egale a "indice". 
 *
 */
export function deleteStatus(indice) {

  let whenDataLoaded = RNFS.readFile(PATH_FILE, 'utf8');

  whenDataLoaded.then((val)=>{

    let tab = val.split('\n');

    for(let i=0; i < tab.length; i++) {

      let elements = tab[i].split(';');

      if(elements[0] !== "status") {
        if(i === tab.length - 1) {
          saveDataTemp(tab[i]);
        } else {
          saveDataTemp(tab[i] + "\n");
        }
      }
      
      //on ecrit tout sur le fichier temp sauf l'enregistrement a supprimer
      if(elements[0] === "status" && elements[1] !== indice) {
        if(i === tab.length - 1) {
          saveDataTemp(tab[i]);
        } else {
          saveDataTemp(tab[i] + "\n");
        }
      }
    }

    //on supprime le fichier d'origine
    RNFS.unlink(PATH_FILE)
    .then(() => {
      //on renomme le fichier temp comme le fichier d'origine
      RNFS.moveFile(PATH_TEMP_FILE,PATH_FILE)
      .then(() => {
        alertMessage("Deleted", "The status has been deleted successfuly !");
      })
      .catch((err) => {
          alert(err.message);
        });
    })
    .catch((err) => {
          alert(err.message);
    }); 

  })
  .catch((err) => {
    alert(err.message);
  });
}

/**
 * Permet d'ajouter une activite.
 * On l'ajoute au debut du fichier temp et on recopie tout le contenu
 * du fichier d'origine.
 *
 */
export function addRecord(data, dataStatus) {

  let whenDataLoaded = RNFS.readFile(PATH_FILE, 'utf8');

  whenDataLoaded.then((val)=>{
    //on ajoute la nouvelle activite au debut du fichier temp
    saveDataTemp(data);
    saveDataTemp(dataStatus + "\n");

    let tab = val.split('\n');
    //et on recopie tout le contenu dans le fichier temp
    for(let i=0; i < tab.length; i++) {
      if(i === tab.length - 1) {
        saveDataTemp(tab[i]);
      } else {
        saveDataTemp(tab[i] + "\n");
      }
    }

    //on supprime le fichier de record
    RNFS.unlink(PATH_FILE)
    .then(() => {
      //on renomme le fichier temporaire qui contient les nouvelles donnees comme l'ancien fichier supprime
      RNFS.moveFile(PATH_TEMP_FILE,PATH_FILE)
      .then(() => {
        alertMessage("Added", "The activity has been added successfuly !");
      })
      .catch((err) => {
          alert(err.message);
        });
    })
    .catch((err) => {
          alert(err.message);
    }); 

  })
  .catch((err) => {
    alert(err.message);
  });
}

/**
 * Permet d'ajouter une activite.
 * On l'ajoute au debut du fichier temp et on recopie tout le contenu
 * du fichier d'origine.
 *
 */
export function addStatus(data,idRecord) {
  var findActivity = false;

  let whenDataLoaded = RNFS.readFile(PATH_FILE, 'utf8');

  whenDataLoaded.then((val)=>{

    let tab = val.split('\n');
    //et on recopie tout le contenu dans le fichier temp
    for(let i=0; i < tab.length; i++) {

      let elements = tab[i].split(';');

      if(findActivity) {
        if(i === tab.length - 1) {
          saveDataTemp(data);
        } else {
          saveDataTemp(data + "\n");
        }
        findActivity = false;
      } 

      if(i === tab.length - 1) {
        saveDataTemp(tab[i]);
      } else {
        saveDataTemp(tab[i] + "\n");
      }

      if(elements[0] === idRecord) {
        findActivity = true;
      }
    }

    //on supprime le fichier de record
    RNFS.unlink(PATH_FILE)
    .then(() => {
      //on renomme le fichier temporaire qui contient les nouvelles donnees comme l'ancien fichier supprime
      RNFS.moveFile(PATH_TEMP_FILE,PATH_FILE)
      .then(() => {
        alertMessage("Added", "The status has been added successfuly !");
      })
      .catch((err) => {
          alert(err.message);
        });
    })
    .catch((err) => {
          alert(err.message);
    }); 

  })
  .catch((err) => {
    alert(err.message);
  });
}


/**
 * Permet de convertir les elements d'un tableau en JSON 
 * ({id:string,location:string,type_location:string,idCanarin:string,statusCanarin:string,dateDeb:string,dateFin:string]}) et 
 * de les ajouter à une liste.
 *
 *
 * tab = represente les lignes du fichier de record
 * list = represente les lignes affichees dans la page Historique
 *
 */
export function tabToJSON(tab, list) {

  var dateDebActivity = "";
  var dateFinActivity = "";

	for(let i=0; i < tab.length; i++) {
		var elements = tab[i].split(";");

    if(elements[0] === "status") {
      list.push({
        "id" : elements[1],
        "idCanarin" : elements[2],
        "statusCanarin" : elements[3],
        "dateDeb" : elements[4], 
        "dateFin" : elements[5],
        "type" : "status",
        "dateDebActivity" : dateDebActivity,
        "dateFinActivity" : dateFinActivity
      });
    } else {
      //seul les tableaux contenant 4 ou plus elements sont ajoutés à la liste.
      //cad les lignes contenant un id, un lieu, un type de lieu et une date d'arrivée (et date de départ)
      //pas les lignes vides.
      if(elements.length >= 4) {
        list.push({
          "id" : elements[0],
          "location" : elements[1],
          "type_location" : elements[2],
          "dateDeb" : elements[3], 
          "dateFin" : elements[4],
          "type" : "record"
        });
        dateDebActivity = elements[3];
        dateFinActivity = elements[4];
      }
    }
	}
}


/**
 * Permet d'afficher un message personnalise contenant un titre, un message et un bouton "OK"
 * La boite de dialogue peut etre fermee en cliquant en dehors de son champ.
 *
 */
export function alertMessage(title, message) {
  Alert.alert(
    title,
    message,
    [
      {text: 'OK', onPress: () => {} },
    ],
    { cancelable: true }
  )
}


/**
 * Permet de déterminer le type de la location en regardant s'il est present
 * dans l'un des 3 tableaux (indoor, outoor, transport).
 * La chaine de caractere location est en minuscule et sans espace (methode trim() appliquee
 * auparavant)
 * 
 */
export function getTypeLocation(location) {
  var indoor = ["indoor","home","office","shop","restaurant"];
  var outdoor = ["outdoor","street","park","forest","beach"];
  var transport = ["transport","car","metro","bus","2 wheels"];

  if(indoor.includes(location)) {
    return "indoor";
  } else if(outdoor.includes(location)) {
    return "outdoor";
  } else if(transport.includes(location)) {
    return "transport";
  }
}


/**
 * Permet de convertir une chaine de caractere representant une date 
 * (ecrtite au format ISO "dd/mm/yyyyTHH:MM" = 14/06/2018T11:47) en un 
 * objet du type Date.
 *
 */
export function parseStringToDate(stringDate) {

    //format de la chaine de caractere stringDate =  "d/m/yyyy HH:MM"

    var dayAndTime = stringDate.split(' ');
    var dayMonthYear = dayAndTime[0].split('/');

    // on rajoute un zéro si la chaine est de longueur 1 (respect de la syntaxe)
    var day = dayMonthYear[0].length === 1 ? "0"+dayMonthYear[0] : dayMonthYear[0];
    var month = dayMonthYear[1].length === 1 ? "0"+dayMonthYear[1] : dayMonthYear[1];
    var year = dayMonthYear[2];

    var hourMinute = dayAndTime[1].split(':');

    var hour = hourMinute[0]
    var minute = hourMinute[1];

    //format accepté pour le parsing "dd/mm/yyyyTHH:MM"
    var dateFormatISO = year+"-"+month+"-"+day+"T"+hour+":"+minute; 

    return Date.parse(dateFormatISO);

  }