/** 
 *	SOURCE
 *	
 *  - Sound Button http://soundbible.com/419-Tiny-Button-Push.html
 *	- Sound https://github.com/zmxv/react-native-sound
 *			https://github.com/zmxv/react-native-sound/blob/master/sound.js
 *	- Prompt https://github.com/jaysoo/react-native-prompt/blob/HEAD/PromptExample/PromptExample.js
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  AsyncStorage,
} from 'react-native';
import dateFormat from 'dateformat';
import Icon from 'react-native-ionicons';
import { saveNewRecord, saveNewStatus, alertMessage } from '../utils/Utility';
import { metrics } from '../utils/Metrics';
import Prompt from 'react-native-prompt';

export default class Location extends React.Component {
	
	constructor(props) {
        super(props);
       
        this.state = {
            currentLocation: '',
            currentCanarin: '',
            status: "",
            color: "grey",
            button:"none",
            promptVisible: false
        };
    }

    componentDidMount() {
    	this.checkCurrentLocation();
    	this.checkStatus();
    	this.checkCurrentCanarin();
    }

    async checkCurrentCanarin() {
    	try {
    		var value = await AsyncStorage.getItem('currentCanarin');

    		if(value != null) {

    			this.setState({
    				currentCanarin : value,
    			});

    		} else {

    			await AsyncStorage.setItem('currentCanarin', '');
    			
    			this.setState({
    				currentCanarin : '',
    			});
    		}

    	} catch (error) {
    		console.log("Error");
    	}
    }

    async checkStatus() {
    	try {
    		var value = await AsyncStorage.getItem('statusCanarin');

    		if(value != null) {
    			if(value === "On") {
    				this.setState({
    					color: '#4CD964',
    					button: "power"
    				});
    			} else if (value === "Off") {
    				
    				this.setState({
    					color: 'red',
    					button: "power"
    				});
    			} else if (value === "In charge") {
    				
    				this.setState({
    					color: 'orange',
    					button: "battery-charging"
    				});
    			} else if (value === "None") {
    				
    				this.setState({
    					color: 'grey',
    					button: "radio-button-off"
    				});
    			}

    			this.setState({
    				status: value
    			});

    		} else {

    			await AsyncStorage.setItem('statusCanarin', 'None');
    			
    			this.setState({
    				status: "None",
    				color: 'grey',
    				button: "radio-button-off"
    			});
    		}

    	} catch (error) {
    		console.log("Error");
    	}

    }

    async checkCurrentLocation() {
    	try {
    		var value = await AsyncStorage.getItem('currentLocation');

    		if(value != null) {

    			this.setState({
    				currentLocation: value
    			});

    		} else {

    			await AsyncStorage.setItem('currentLocation', 'no location');
    			
    			this.setState({
    				currentLocation: 'no location'
    			});

    		}

    	} catch (error) {
    		console.log("Error");
    	}
    }

    onButtonPressed(location) {
    	var loc = location.split(";")[0];
    	var idCanarin = this.state.currentCanarin;
    	var statusCanarin = this.state.status;

    	if(this.state.currentLocation === loc) {
    		alertMessage("Error","You are already in " + loc);
    	} else if(idCanarin === "" || idCanarin === null) {
    		alertMessage("Error","No number for canarin is allocated.");
    	} else if(statusCanarin === "None") {
    		alertMessage("Error","No status for canarin.");
    	} 
    	else {
	    	Alert.alert(
			  'Change my location',
			  'Are you sure to leave your current location ?',
			  [
			    {text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
			    {text: 'Yes', onPress: () => this.saveLocation(location, loc)},
			  ],
			  { cancelable: false }
			)
    	}
	}

	async saveLocation(record, location) {
		var dateDebFin = new Date();
		var idR = await AsyncStorage.getItem('counterRecord');
		var idS = await AsyncStorage.getItem('counterStatus');
		var idCanarin = this.state.currentCanarin;
		var status = this.state.status;

		var dataStatus = "status" + ";" + idS + ";" + idCanarin + ";" + status + ";" + dateFormat(dateDebFin, "d/m/yyyy HH:MM") + ";";
		var data = idR + ";" + record + ";" + dateFormat(dateDebFin, "d/m/yyyy HH:MM") + ";" + "\n";

		if(this.state.currentLocation === "no location") {
			//On doit juste écrire une nouvelle fois record+";"+dateDeb
			saveNewRecord(null, data, dataStatus, null);
		} else {
			//On doit écrire à la fin du fichier ";"+dateDebFin+"\n"
			oldId = await AsyncStorage.getItem('oldCounterRecord');
			saveNewRecord(oldId, data, dataStatus, dateFormat(dateDebFin, "d/m/yyyy HH:MM"));
		}

		//Changement de la location actuelle dans le local storage
		//On incremente le compteur
		try {
			await AsyncStorage.setItem('oldCounterRecord', idR);
			var intIdR = parseInt(idR);
			var intIdS = parseInt(idS);
			intIdR++;
			intIdS++;
			await AsyncStorage.setItem('currentLocation', location);
			await AsyncStorage.setItem('counterRecord', intIdR+"");
			await AsyncStorage.setItem('counterStatus', intIdS+"");

			this.setState({
    			currentLocation: location
    		})

		} catch (error) {
			console.log("Error");
		}
	}

	//refaire la sauvegarde du status
	async saveStatus() {
		var dateDebFin = new Date();
		var idS = await AsyncStorage.getItem('counterStatus');
		var idCanarin = this.state.currentCanarin;
		var status = this.state.status;

		var dataStatus = "status" + ";" + idS + ";" + idCanarin + ";" + status + ";" + dateFormat(dateDebFin, "d/m/yyyy HH:MM") + ";";

		
		saveNewStatus(dateFormat(dateDebFin, "d/m/yyyy HH:MM"), dataStatus);

		//Changement de la location actuelle dans le local storage
		//On incremente le compteur
		try {
			var intIdS = parseInt(idS);
			intIdS++;
			await AsyncStorage.setItem('counterStatus', intIdS+"");

		} catch (error) {
			console.log("Error");
		}
	}

	async changeToBatteryState() {
		if(this.state.status !== "In charge") {
			this.setState({
				color: 'orange',
				button: 'battery-charging',
				status: 'In charge'
			})

			try {
				await AsyncStorage.setItem('statusCanarin', 'In charge');
			} catch(error) {
				console.log("Error");
			}

			if(this.state.currentLocation !== "no location") {
				this.saveStatus();
			}
		}
	}

	async changeToPowerState() {
		if(this.state.status === "On") {
			
			this.setState({
				color: 'red',
				button: 'power',
				status: 'Off'
			})
			try {
				await AsyncStorage.setItem('statusCanarin', 'Off');
			} catch(error) {
				console.log("Error");
			}

			if(this.state.currentLocation !== "no location") {
				this.saveStatus();
			}
	
		} else if(this.state.status === "Off" || this.state.status === "In charge"){

			this.setState({
				color: '#4CD964',
				button: 'power',
				status: 'On'
			})

			try {
				await AsyncStorage.setItem('statusCanarin', 'On');
			} catch(error) {
				console.log("Error");
			}

			if(this.state.currentLocation !== "no location") {
				this.saveStatus();
			}
			

		} else if(this.state.status === "None") {
			this.setState({
				color: '#4CD964',
				button: 'power',
				status: 'On'
			})

			try {
				await AsyncStorage.setItem('statusCanarin', 'On');
			} catch(error) {
				console.log("Error");
			}
		}

	}


	showButtonStates() {
		if(this.state.status === "On" || this.state.status === "Off") {
			return (
				<TouchableOpacity style={{
						flexDirection: 'row',
						alignItems:'center',
						justifyContent: 'center',
				    	height: metrics.heightButtonStatus,
				    	width: metrics.widthButtonStatus,
				    	backgroundColor: this.state.color ,
				    	marginTop: metrics.marginTopButtonStatus,
				    	borderBottomLeftRadius: 5,
						borderBottomRightRadius: 5,
						borderTopLeftRadius: 0,
						borderTopRightRadius: 0,
						padding : metrics.paddingButtonStatus
					}}
					onPress={() => this.changeToPowerState()} 
					onLongPress={() => this.changeToBatteryState()}>
					<Icon name={this.state.button} color="white" size={20}/>
					<Text style={styles.state_text}>{this.state.status}</Text>
				</TouchableOpacity>)
		} else if (this.state.status === "In charge") {
			return (
				<TouchableOpacity style={{
						flexDirection: 'row',
						alignItems:'center',
						justifyContent: 'center',
				    	height: metrics.heightButtonStatus,
				    	width: metrics.widthButtonStatus,
				    	backgroundColor: this.state.color ,
				    	marginTop: metrics.marginTopButtonStatus,
				    	borderBottomLeftRadius: 5,
						borderBottomRightRadius: 5,
						borderTopLeftRadius: 0,
						borderTopRightRadius: 0,
						padding : metrics.paddingButtonStatus
					}}
					onPress={() => this.changeToPowerState()} 
					onLongPress={() => this.changeToBatteryState()}>
					<Icon name={this.state.button} color="white" size={20}/>
					<Text style={styles.state_text}>{this.state.status}</Text>
				</TouchableOpacity>)
		} else if (this.state.status === "None") {
			return (
				<TouchableOpacity style={{
						flexDirection: 'row',
						alignItems:'center',
						justifyContent: 'center',
				    	height: metrics.heightButtonStatus,
				    	width: metrics.widthButtonStatus,
				    	backgroundColor: this.state.color ,
				    	marginTop: metrics.marginTopButtonStatus,
				    	borderBottomLeftRadius: 5,
						borderBottomRightRadius: 5,
						borderTopLeftRadius: 0,
						borderTopRightRadius: 0,
						padding : metrics.paddingButtonStatus
					}}
					onPress={() => this.changeToPowerState()} 
					onLongPress={() => this.changeToBatteryState()}>
					<Icon name={this.state.button} color="white" size={20}/>
					<Text style={styles.state_text}>{this.state.status}</Text>
				</TouchableOpacity>)
		}
	}

	async changeIdCanarin(id) {
		this.setState({
			promptVisible:false,
		});

		if(id === "") {
			alertMessage('Error', 'Empty field ! A number is required.');
		} else if(id.includes('.') || id.includes(' ') || id.includes(',') || id.includes('-')){
			alertMessage('Error', "Invalid characters ./,/-/_ are not allowed.");
		} else {

			try {
				await AsyncStorage.setItem('currentCanarin', id);

				this.setState({
					currentCanarin: id
				});

			} catch(error) {
				console.log("Error");
			}
		}
	}

	showCanarinID() {
		if(this.state.currentCanarin === "") {
			return (<TouchableOpacity style={{
						alignItems:'center',
						justifyContent: 'center',
				    	height: metrics.heightButtonCanarin,
				    	width: metrics.widthButtonCanarin,
				    	backgroundColor: '#3F3F3F',
				    	borderBottomLeftRadius: 30,
						borderBottomRightRadius: 0,
						borderTopLeftRadius: 0,
						borderTopRightRadius: 0,
						padding : metrics.paddingButtonCanarin,
						position: 'absolute',
						alignSelf: 'flex-end',
						marginTop: metrics.marginTopButtonCanarin
					}}
					onPress={() => this.setState({ promptVisible: true })} >
					<Text style={styles.state_text}>No ID</Text>
				</TouchableOpacity>)
		} else {
			return (<TouchableOpacity style={{
						alignItems:'center',
						justifyContent: 'center',
				    	height: metrics.heightButtonCanarin,
				    	width: metrics.widthButtonCanarin,
				    	backgroundColor: '#3F3F3F',
				    	borderBottomLeftRadius: 30,
						borderBottomRightRadius: 0,
						borderTopLeftRadius: 0,
						borderTopRightRadius: 0,
						padding : metrics.paddingButtonCanarin,
						position: 'absolute',
						alignSelf: 'flex-end',
						marginTop: metrics.marginTopButtonCanarin
					}}
					onPress={() => this.setState({ promptVisible: true })} >
					<Text style={styles.state_text}>N°{this.state.currentCanarin}</Text>
				</TouchableOpacity>)
		} 
	}


	/* 
	#########################  USER INTERFACE  ###################### 
	*/
	render() {
		return(
			<View style={styles.page}>

				<Prompt
				    title="Please enter a number for the Canarin"
				    placeholder="No. Canarin"
				    defaultValue={this.state.currentCanarin}
				    visible={this.state.promptVisible}
				    textInputProps={{keyboardType: "numeric"}}
				    onCancel={() => this.setState({ promptVisible: false })}
				    onSubmit={(value) => this.changeIdCanarin(value)}/>

				<View style={{alignItems:'center'}}>
					{this.showButtonStates()}
					{this.showCanarinID()}
				</View>

				<View style={styles.remind}>
					<Text style={styles.remind_text}>You are actually in {this.state.currentLocation}</Text>
				</View>

				<View style={styles.ligne}>
					<TouchableOpacity style={styles.button_indoor} onPress={() => this.onButtonPressed("indoor;indoor")}>
						<Text style={styles.button_text}>Indoor</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button_outdoor} onPress={() => this.onButtonPressed("outdoor;outdoor")}>
						<Text style={styles.button_text}>Outdoor</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button_transport} onPress={() => this.onButtonPressed("transport;transport")}>
						<Text style={styles.button_text}>Transport</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.ligne}>
					<TouchableOpacity style={styles.button_indoor} onPress={() => this.onButtonPressed("home;indoor")}>
						<Text style={styles.button_text}>Home</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button_outdoor} onPress={() => this.onButtonPressed("street;outdoor")}>
						<Text style={styles.button_text}>Street</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button_transport} onPress={() => this.onButtonPressed("car;transport")}>
						<Text style={styles.button_text}>Car</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.ligne}>
					<TouchableOpacity style={styles.button_indoor} onPress={() => this.onButtonPressed("office;indoor")}>
						<Text style={styles.button_text}>Office</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button_outdoor} onPress={() => this.onButtonPressed("park;outdoor")}>
						<Text style={styles.button_text}>Park</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button_transport} onPress={() => this.onButtonPressed("metro;transport")}>
						<Text style={styles.button_text}>Metro</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.ligne}>
					<TouchableOpacity style={styles.button_indoor} onPress={() => this.onButtonPressed("shop;indoor")}>
						<Text style={styles.button_text}>Shop</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button_outdoor} onPress={() => this.onButtonPressed("forest;outdoor")}>
						<Text style={styles.button_text}>Forest</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button_transport} onPress={() => this.onButtonPressed("bus;transport")}>
						<Text style={styles.button_text}>Bus</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.ligne}>
					<TouchableOpacity style={styles.button_indoor} onPress={() => this.onButtonPressed("restaurant;indoor")}>
						<Text style={styles.button_text}>Restaurant</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button_outdoor} onPress={() => this.onButtonPressed("beach;outdoor")}>
						<Text style={styles.button_text}>Beach</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button_transport} onPress={() => this.onButtonPressed("2 wheels;transport")}>
						<Text style={styles.button_text}>2 wheels</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

/* 
#########################  STYLESHEET  ###################### 
*/
const styles = StyleSheet.create({
	page : {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'space-around',
		backgroundColor: '#FAFAFA',
	},

	remind : {
		backgroundColor: 'tomato',
		height: metrics.bannerHeightRemind,
		alignItems: 'center',
		justifyContent: 'center',
		
	},

	remind_text : {
		color: 'white',
		fontSize: 18,
	},

	state_text : {
		color: 'white',
		fontSize: 18,
		marginLeft : metrics.marginLeftStatusText
	},

	ligne : {
		justifyContent: 'center',
		flexDirection: 'row',
	},

	button_indoor : {
		height: metrics.buttonHeightWhereAmI,
		width: metrics.buttonWidthWhereAmI,
		borderRadius: 7,
		backgroundColor: '#C3E8A9',
		margin: metrics.buttonMarginWherAmI,
		justifyContent: 'center'
	},

	button_outdoor : {
		height: metrics.buttonHeightWhereAmI,
		width: metrics.buttonWidthWhereAmI,
		borderRadius: 7,
		backgroundColor: '#7F7FFF',
		margin: metrics.buttonMarginWherAmI,
		justifyContent: 'center'
	},

	button_transport : {
		height: metrics.buttonHeightWhereAmI,
		width: metrics.buttonWidthWhereAmI,
		borderRadius: 7,
		backgroundColor: '#FFB3BA',
		margin: metrics.buttonMarginWherAmI,
		justifyContent: 'center'
	},

	button_text : {
		textAlign: 'center',
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16
	},
});