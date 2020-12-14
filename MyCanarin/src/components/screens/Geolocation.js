import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  NetInfo,
  TouchableOpacity
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Polyline, Marker } from 'react-native-maps';
import { RNFS , parseStringToDate, alertMessage, getTypeLocation } from '../utils/Utility';
import { PATH_FILE_GPS, getMarkersGPS, getCoordinates, getRegionForCoordinates } from '../utils/UtilityGPS';
import { metrics } from '../utils/Metrics';
import Icon from 'react-native-ionicons';
import BackgroundGeolocation from 'react-native-mauron85-background-geolocation';

export default class Geolocation extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			showMessage : false,
			nameIconRun: "play",
			colorRun: "#4CD964",
			colorWifi: "#808080",
			colorGPS: "#808080",

			last15Points : [],
			markers : [],
			region : {
			    latitude: 48.898916,
			    longitude: 2.233186,
			    latitudeDelta: 0.0922,
				longitudeDelta: 0.0421,
			}
		};
	}

	componentDidMount() {
		this.checkBackgroundGeolocation();
		this.getFileContent(false);
		this.checkWifi();
		this.checkGPS();
		this.addListenerGPS();
	}

	checkBackgroundGeolocation() {
		BackgroundGeolocation.checkStatus(status => {
	      if (status.isRunning) {
	        this.setState({
	        	nameIconRun : "square",
	        	colorRun : "#FF3B30"
	        });
	      } else {
	      	this.setState({
	        	nameIconRun : "play",
	        	colorRun : "#4CD964"
	        });
	      }
	    });
	}

	checkWifi() {
		NetInfo.getConnectionInfo().then((connectionInfo) => {
			if(connectionInfo.type === "wifi" || connectionInfo.type === "cellular") {
				this.setState({colorWifi : "#007AFF"});
			} else if(connectionInfo.type === "none") {
				this.setState({colorWifi : "#808080"});
			}
		});

		NetInfo.addEventListener(
		  'connectionChange',
		  this.handleFirstConnectivityChange.bind(this)
		);
	}


	handleFirstConnectivityChange(connectionInfo) {
		
		if(connectionInfo.type === "wifi" || connectionInfo.type === "cellular") {
			this.setState({colorWifi : "#007AFF"});
		} else if(connectionInfo.type === "none") {
			this.setState({colorWifi : "#808080"});
		}

		NetInfo.removeEventListener(
			'connectionChange',
			this.handleFirstConnectivityChange
		);
	}

	checkGPS() {

		BackgroundGeolocation.checkStatus(status => {
			if (status.isRunning) {
			
				if(status.locationServicesEnabled) {
					this.setState({
						colorGPS : "#FF9500"
					})
				} else {
					this.setState({
						colorGPS : "#808080"
					})
				}
			}
		});
	}

	addListenerGPS() {
		BackgroundGeolocation.on('authorization', (authorization) => {
			/*saveLogGPS(dateFormat(new Date(), "d/m/yyyy HH:MM:ss"),'[INFO] BackgroundGeolocation authorization status: ' + authorization);
			if (authorization !== BackgroundGeolocation.AUTHORIZED) {
				Alert.alert('Location services are disabled', 'Would you like to open location settings?', [
			    	{ text: 'Yes', onPress: () => BackgroundGeolocation.showLocationSettings() },
			    	{ text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
			    ]);
			}*/

			BackgroundGeolocation.checkStatus(status => {
				if(status.locationServicesEnabled) {
					this.setState({
						colorGPS : "#FF9500"
					})

				} else {
					this.setState({
						colorGPS : "#808080",
						nameIconRun : "play",
						colorRun : "#4CD964"
					})
					BackgroundGeolocation.stop();
				}
			});
	    });
	}

  	/**
	 *
	 *
	 */
	getFileContent(refresh) {
		if(refresh) {
			BackgroundGeolocation.checkStatus(status => {
				if(!status.isRunning) {
					alertMessage("Error", "You can't refresh the map because the Background Geolocation is not running !");
				} else {
					let listCoordinates = [];
					let listMarkers = [];

					let whenDataLoaded = RNFS.readFile(PATH_FILE_GPS, 'utf8');
					whenDataLoaded.then((val)=>{
						let tab = val.split('\n');
						//dernier element vide qui correspond à un saut de ligne donc on le supprime
						tab.pop();
				
						sortFile = tab.reverse();
				
						getMarkersGPS(sortFile, listMarkers);

						if(listMarkers.length > 15) {
							listMarkers = listMarkers.slice(0,15);
						}

						getCoordinates(listMarkers, listCoordinates);

						if(listMarkers.length === 0 || listCoordinates.length === 0) {
						
							this.setState({showMessage : true})
						} else {
							let regionCalculate = getRegionForCoordinates(listCoordinates);
							
							this.setState({
								showMessage : false, 
								last15Points : listCoordinates, 
								markers : listMarkers,
								region : regionCalculate
							});
						}
					});
				}
			});
		} else {
			let listCoordinates = [];
			let listMarkers = [];

			let whenDataLoaded = RNFS.readFile(PATH_FILE_GPS, 'utf8');
			whenDataLoaded.then((val)=>{
				let tab = val.split('\n');
				//dernier element vide qui correspond à un saut de ligne donc on le supprime
				tab.pop();
		
				sortFile = tab.reverse();
		
				getMarkersGPS(sortFile, listMarkers);

				if(listMarkers.length > 15) {
					listMarkers = listMarkers.slice(0,15);
				}

				getCoordinates(listMarkers, listCoordinates);

				if(listMarkers.length === 0 || listCoordinates.length === 0) {
					this.setState({showMessage : true})
				} else {
					let regionCalculate = getRegionForCoordinates(listCoordinates);
					
					this.setState({
						showMessage : false, 
						last15Points : listCoordinates, 
						markers : listMarkers,
						region : regionCalculate
					});
				}
			});
		}
	}

	showInfoWifi() {
		alertMessage("Why the Wifi should be activated ? ", "To show you the map and your 15 last locations")
	}

	showInfoGPS() {
		alertMessage("Why the GPS should be activated ? ", "To save your locations")
	}

	startAndStop() {
		BackgroundGeolocation.checkStatus(status => {
	      if (status.isRunning) {
	        BackgroundGeolocation.stop();
	        this.setState({
	        	colorGPS : "#808080",
	        	nameIconRun : "play",
	        	colorRun: "#4CD964"
	        })
	      } else {

	      	if(status.locationServicesEnabled) {
	      		BackgroundGeolocation.start();
			      	this.setState({
			      		colorGPS : "#FF9500",
			        	nameIconRun : "square",
			        	colorRun : "#FF3B30"
			    });
	      	} else {
	      		Alert.alert('Location services are disabled', 'Would you like to open location settings?', [
			    	{ text: 'Yes', onPress: () => BackgroundGeolocation.showLocationSettings() },
			    	{ text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
			    ]);
	      	}
	      	
	      }
	    });
	}

	choosePinColor(location) {
		typeLocation = getTypeLocation(location);
		if(typeLocation === "indoor") {
			//indoor
			return '#C3E8A9'
		} else if(typeLocation === "outdoor") {
			//outdoor
			return '#7F7FFF'
		} else if(typeLocation === "transport") {
			//transport
			return '#FFB3BA'
		}
	}


	/* 
	#########################  USER INTERFACE  ###################### 
	*/
	render() {
		return(
			<View style={styles.container}>
				{
					this.state.showMessage ?
					<View style={styles.messageNoPoint}>
						  <Text style={{fontWeight:"bold", fontSize: 20}}>No GPS data saved</Text>
					</View> : null
				}



				<View style={styles.containerBarState}>

						<TouchableOpacity style={{
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: this.state.colorRun,
							width: 40,
							height: 40,
							borderRadius : 20,
							
						}} onPress={() => this.startAndStop()}>
        					<Icon name={this.state.nameIconRun} color="white" size={25}  />
        				</TouchableOpacity>
						
        				<TouchableOpacity style={{
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: this.state.colorWifi,
							width: 40,
							height: 40,
							borderRadius : 20,
							
						}} onPress={() => this.showInfoWifi()}>
        					<Icon name="wifi" color="white" size={25} />
        				</TouchableOpacity>
            		
            			<TouchableOpacity style={{
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: this.state.colorGPS,
							width: 40,
							height: 40,
							borderRadius : 20,
							
						}} onPress={() => this.showInfoGPS()}>
            				<Icon name="locate" color="white" size={25}  />
            			</TouchableOpacity>
						
            			<TouchableOpacity style={{
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "#808080",
							width: 40,
							height: 40,
							borderRadius : 20,
							
						}} onPress={() => this.getFileContent(true)}>
            				<Icon name="sync"  color="white" size={25}  />
            			</TouchableOpacity>
            	
            	</View>

				<MapView
					provider = { PROVIDER_GOOGLE }
					style = { styles.map }
					initialRegion={this.state.region}
				>

				<Polyline
					coordinates={this.state.last15Points}
				/>

				{this.state.markers.map((marker, i) => (
				    <Marker
				      key={i}
				      coordinate={marker.latlng}
				      title={marker.title}
				      description={marker.description}
				      pinColor={this.choosePinColor(marker.title)}
				    />
				))}

				</MapView>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex : 1
	},

	//source https://stackoverflow.com/questions/37317568/react-native-absolute-positioning-horizontal-centre
	messageNoPoint: {
		position: 'absolute', 
		top: 50, 
		left: 0, 
		right: 0, 
		bottom: 0, 
		justifyContent: 'center', 
		alignItems: 'center',
		zIndex: 5,
		backgroundColor: '#FFFFFFCC',
	},

	map: {
		height: '100%',
		width: '100%'
	},

	containerBarState: {
		paddingTop : 5,
		flexDirection: 'row',
		justifyContent: 'space-around',
		height : 50,
		backgroundColor : '#3F3F3F',
	},
	containerButtonState: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: "center",

	},
});

