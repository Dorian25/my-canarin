import React, { Component } from 'react';
import { Root } from './src/components/Navigation';
import { checkFileRecord, checkCounterStatus, checkCounterRecord } from './src/components/utils/Utility';
import { configureBackgroundGPS, checkFileGPS, checkFileGPSLog } from './src/components/utils/UtilityGPS';
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';
//import SplashScreen from 'react-native-splash-screen';

export default class App extends Component {

  /**
   * Quand le chargement de l'application est termine, on effectue ces etapes :
   *  - on ferme le splash screen,
   *  - on verifie que le fichier de record est présent dans le tel,
   *  - on verifie que la variable du counter de record est présente
   *  - on verifie que l'identifiant du canarin est present
   *
   */
  componentDidMount() {
    //START BACKGROUND GEOLOCATION
    configureBackgroundGPS(60000);

    //SplashScreen.hide();
    checkFileRecord();
    checkFileGPS();
    checkFileGPSLog();

    //
    checkCounterRecord();
    checkCounterStatus();

  }

   componentWillUnmount() {
    // unregister all event listeners
    BackgroundGeolocation.events.forEach(event => BackgroundGeolocation.removeAllListeners(event));
  }

  /* 
  #########################  USER INTERFACE  ###################### 
  */
  render() {
    return (
      <Root />
    );
  }

}
