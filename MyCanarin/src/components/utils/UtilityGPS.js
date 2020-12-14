import React from "react";
import { Platform, AsyncStorage, Alert } from 'react-native';
import dateFormat from 'dateformat';
import { alertMessage } from './Utility';
import BackgroundGeolocation, {Actions} from 'react-native-mauron85-background-geolocation';
//file system = gestionnaire de fichiers
export const RNFS = require('react-native-fs');

// chemin du fichier de record des coordonnees GPS selon la plateforme du tel
export const PATH_FILE_GPS = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath + "/record_gps.txt" : RNFS.ExternalDirectoryPath +  "/record_gps.txt"; 
// chemin du fichier de record des coordonnees GPS selon la plateforme du tel
export const PATH_FILE_GPS_LOG = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath + "/record_gps_error.txt" : RNFS.ExternalDirectoryPath +  "/record_gps_error.txt";


//source https://github.com/react-community/react-native-maps/issues/505
export function getRegionForCoordinates(points) {
  // points should be an array of { latitude: X, longitude: Y }
  let minX, maxX, minY, maxY;

  // init first point
  ((point) => {
    minX = point.latitude;
    maxX = point.latitude;
    minY = point.longitude;
    maxY = point.longitude;
  })(points[0]);

  // calculate rect
  points.map((point) => {
    minX = Math.min(minX, point.latitude);
    maxX = Math.max(maxX, point.latitude);
    minY = Math.min(minY, point.longitude);
    maxY = Math.max(maxY, point.longitude);
  });

  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const deltaX = (maxX - minX);
  const deltaY = (maxY - minY);

  return {
    latitude: midX,
    longitude: midY,
    latitudeDelta: deltaX,
    longitudeDelta: deltaY
  };
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
export function getMarkersGPS(tab, markers) {

	//{latlng : { latitude: 37.7948605, longitude: -122.4596065 }, title : "Point5", description:"27/07/2018 14:01:05"}

    for(let i=0; i < tab.length; i++) {
    	var elements = tab[i].split(";");

		markers.push({
			description : elements[0],
			latlng : { latitude : parseFloat(elements[1]), longitude : parseFloat(elements[2])},
			title : elements[3]
		});
    }
}

export function getCoordinates(records, coordinates) {

    for(let i=0; i < records.length; i++) {
		coordinates.push(records[i].latlng);
    }
}  

/**
 * Verifie l'existante du fichier de record.
 * S'il n'est pas présent, on le cree.
 * Ce check est fait a chaque nouvelle ouverture de l'application.
 *
 */
export function checkFileGPS() {
  RNFS.exists(PATH_FILE_GPS)
    .then((exist) => {
      if(exist) {
      
      } else {
        //on cree le fichier s'il n'exsite pas
        RNFS.writeFile(PATH_FILE_GPS, "", 'utf8')
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
 * Verifie l'existante du fichier de record.
 * S'il n'est pas présent, on le cree.
 * Ce check est fait a chaque nouvelle ouverture de l'application.
 *
 */
export function checkFileGPSLog() {
  RNFS.exists(PATH_FILE_GPS_LOG)
    .then((exist) => {
      if(exist) {
      
      } else {
        //on cree le fichier s'il n'exsite pas
        RNFS.writeFile(PATH_FILE_GPS_LOG, "", 'utf8')
          .then((success) => {
              alertMessage("Welcome to MyCanarin !","Make sure your captor is activated then you can choose your current location.\n\nDon't forget to put the Canarin No. into the Info Tab.")
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


export async function saveNewGPS( date, latitude, longitude) {
  var location = await AsyncStorage.getItem('currentLocation');

  RNFS.appendFile(PATH_FILE_GPS, date + ";" + latitude + ";" + longitude + ";" + location + "\n", 'utf8')
        .then((success) => {
        })
        .catch((err) => {
          alert(err.message);
        });
}


export function saveLogGPS(date, log) {
  RNFS.appendFile(PATH_FILE_GPS_LOG, date + ";" + log + "\n", 'utf8')
        .then((success) => {
        })
        .catch((err) => {
          alert(err.message);
        });
}


export function configureBackgroundGPS(timeInterval) {

	BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      stationaryRadius: 50,
      distanceFilter: 50,
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      debug: true,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: Platform.OS == 'ios' ? BackgroundGeolocation.DISTANCE_FILTER_PROVIDER : BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: timeInterval,//60 seconds = 60000 milliseconds
      fastestInterval: 5000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
    });
 
    BackgroundGeolocation.on('location', (location) => {

      saveNewGPS(dateFormat(new Date(location.time), "d/m/yyyy HH:MM:ss"), location.latitude, location.longitude)
      
      // handle your locations here
      // to perform long running operation on iOS
      // you need to create background task
      //BackgroundGeolocation.startTask(taskKey => {
        // execute long running task
        // eg. ajax post location
        // IMPORTANT: task has to be ended by endTask
        //BackgroundGeolocation.endTask(taskKey);
      //});
    });
 
    BackgroundGeolocation.on('stationary', (stationaryLocation) => {
      	// handle stationary locations here
      	Actions.sendLocation(stationaryLocation);
    });
 
    BackgroundGeolocation.on('error', (error) => {
      	saveLogGPS(dateFormat(new Date(), "d/m/yyyy HH:MM:ss"), '[ERROR] BackgroundGeolocation error:' + error.message);
    });
 
    BackgroundGeolocation.on('start', () => {
      	saveLogGPS(dateFormat(new Date(), "d/m/yyyy HH:MM:ss"), '[INFO] BackgroundGeolocation service has been started');
    });
 
    BackgroundGeolocation.on('stop', () => {
    	saveLogGPS(dateFormat(new Date(), "d/m/yyyy HH:MM:ss"), '[INFO] BackgroundGeolocation service has been stopped');	
    });
 
    /*BackgroundGeolocation.on('authorization', (authorization) => {
		saveLogGPS(dateFormat(new Date(), "d/m/yyyy HH:MM:ss"),'[INFO] BackgroundGeolocation authorization status: ' + authorization);
		if (authorization !== BackgroundGeolocation.AUTHORIZED) {
			Alert.alert('Location services are disabled', 'Would you like to open location settings?', [
		    	{ text: 'Yes', onPress: () => BackgroundGeolocation.showLocationSettings() },
		    	{ text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
		    ]);
		}

		BackgroundGeolocation.checkStatus(status => {
			if(status.locationServicesEnabled) {
				alert('on gps')
			} else {
				alert('off gps')
			}
		});
    });*/
 
    BackgroundGeolocation.on('background', () => {
      saveLogGPS(dateFormat(new Date(), "d/m/yyyy HH:MM:ss"),'[INFO] App is in background');
    });
 
    BackgroundGeolocation.on('foreground', () => {
      saveLogGPS(dateFormat(new Date(), "d/m/yyyy HH:MM:ss"),'[INFO] App is in foreground');
    });
 
    /*BackgroundGeolocation.checkStatus(status => {
      console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      console.log('[INFO] BackgroundGeolocation service has permissions', status.hasPermissions);
      console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
 
      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });*/
 
    // you can also just start without checking for status
    // BackgroundGeolocation.start();
}