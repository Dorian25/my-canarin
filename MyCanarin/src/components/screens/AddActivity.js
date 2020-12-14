import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  AsyncStorage
} from 'react-native';
import { List, ListItem } from 'react-native-elements';
import { alertMessage, addRecord, getTypeLocation, parseStringToDate } from '../utils/Utility';
import DatePicker from 'react-native-datepicker';
import { metrics } from '../utils/Metrics';
import { Header, Left, Body, Right, Button, Title} from 'native-base';
import dateFormat from 'dateformat';
import RNPickerSelect from 'react-native-picker-select';

//liste contenant tous les lieux disponibles
const listLocation = ["beach","restaurant","2 wheels","office","car","bus","home","park","forest","factory","street","transport","metro","shop","outdoor","indoor"];

export default class AddActivity extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			location : "",
			dateDeb : "", 
			dateFin : "",
			idCanarin : "",
			statusCanarin : "",
			dateDebStatus : "", 
			dateFinStatus : "",
			items: [
                {
                    label: 'On',
                    value: 'On',
                },
                {
                    label: 'Off',
                    value: 'Off',
                },
                {
                    label: 'In charge',
                    value: 'In charge',
				},
			]
		};
	}

	async save() {
		//si un des champs est vide, une erreur s'affiche
		if(this.state.dateFin === "" || this.state.dateDeb === "" || this.state.location === "" || 
			this.state.idCanarin === "" || this.state.statusCanarin === "" || this.state.dateFinStatus === "" || this.state.dateDebStatus === "") {
			alertMessage("Error","All fields must be completed !");
		} else {
			//On verifie que le lieu est correct et fait parti de la liste des lieux dispo
			//On le transforme en minuscule et on supprime les espaces indesirables au debut et a la fin
			if(listLocation.includes(this.state.location.toLowerCase().trim())) {
				//on met les dates rentrees en chaine de caracteres au format ISO pour les comparer
				var startDate = parseStringToDate(this.state.dateDeb);
				var endDate = parseStringToDate(this.state.dateFin);
				var date = new Date();
				//on transforme la date actuelle au format iso
				var stringDate = dateFormat(date, "dd/mm/yyyy HH:MM");
				var now = parseStringToDate(stringDate);

				//on accepte que les activites passees pas futur
				if(startDate < now && endDate < now) {
					//il faut que la date de debut soit avant la date de fin
					if(startDate < endDate) {
						if(!this.state.idCanarin.includes('-') && !this.state.idCanarin.includes('.') && !this.state.idCanarin.includes(' ') && !this.state.idCanarin.includes(',')) {
							var startDateStatus = parseStringToDate(this.state.dateDebStatus);
							var endDateStatus = parseStringToDate(this.state.dateFinStatus);

							if(startDateStatus >= startDate && endDateStatus <= endDate) {
							
								if(startDateStatus < endDateStatus) {
									var idR = await AsyncStorage.getItem('counterRecord');
									var idS = await AsyncStorage.getItem('counterStatus');
									
									var dataStatus = "status" + ";" + idS + ";" + this.state.idCanarin + ";" + this.state.statusCanarin + ";" + this.state.dateDebStatus + ";" + this.state.dateFinStatus;
									//on cree le nouvel enregistrement a partir des donnees recoltees
									let data = idR +
									 ";" + this.state.location.toLowerCase().trim() + 
									 ";" +  getTypeLocation(this.state.location.toLowerCase().trim()) + 
									 ";" + this.state.dateDeb +
									 ";" + this.state.dateFin + "\n";
									 //on l'ajoute au fichier
									addRecord(data, dataStatus);

									//on incremente le compteur courant
									try {
										var intIdR = parseInt(idR);
										var intIdS = parseInt(idS);
										intIdR++;
										intIdS++;
										await AsyncStorage.setItem('counterRecord', intIdR+"");
										await AsyncStorage.setItem('counterStatus', intIdS+"");
										//on revient a la page d'historique
										this.props.navigation.popToTop();

									} catch (error) {
										console.log("Error");
									}

								} else {
									alertMessage("Error", "The start date must be before the end date for the status ! ")
								}
							} else {
								alertMessage("Error","The start and end dates must be in the interval of the activity !")
							}

						} else {
							alertMessage("Error","Invalid characters for the Canarin number !");
						}

					} else {
						alertMessage("Error","The start date must be before the end date !");
					}
				} else {
					alertMessage("Error","Impossible to add a future activity ! Please go to the main screen to add an activity.");
				}
			} else {
				alertMessage("Error","Unknown location !");
			}
		}
	}

	/**
	 * Permet d'annuler l'ajout en revenant a la page d'historique
	 */ 
	cancel() {
		this.props.navigation.popToTop();
	}

	/**
	 * Permet de creer un header selon la plateforme :
	 * iOS : le bouton "cancel" a gauche et le bouton "save" a droite
	 * android : les 2 boutons "cancel" et "save" a droite
	 */ 
	specialHeader() {
		if(Platform.OS === "android") {
			return(
				<Header style={{backgroundColor:'white'}}>
				    <Body>
				       	<Title style={{color:"black"}}>Add Activity</Title>
				    </Body>
				    <Right>
				    	<Button hasText transparent onPress={() => this.cancel()}>
				           	<Text style={{ color: 'tomato' }}>Cancel</Text>
				        </Button>
				       	<Button hasText transparent onPress={() => this.save()}>
				           	<Text style={{ color: 'tomato', fontWeight: 'bold' }}>Save</Text>
				        </Button>
				    </Right>
				</Header>
			);
		} else if (Platform.OS === "ios") {
			return(
				<Header style={{backgroundColor:'white'}}>
				    <Left>
			            <Button hasText transparent onPress={() => this.cancel()}>
				           	<Text style={{ color: 'tomato' }}>Cancel</Text>
				        </Button>
			        </Left>
				    <Body>
				       	<Title style={{color:"black"}}>Add Activity</Title>
				    </Body>
				    <Right>
				       	<Button hasText transparent onPress={() => this.save()}>
				           	<Text style={{ color: 'tomato', fontWeight: 'bold' }}>Save</Text>
				        </Button>
				    </Right>
				</Header>
			);
		}
	}

	/* 
	#########################  USER INTERFACE  ###################### 
	*/
	render() {
		return(
			<View style={styles.container}>
				
				{this.specialHeader()}

    			<List>
      				<ListItem
        				title="Location"
        				textInput={true}
        				textInputPlaceholder="New location"
      					textInputValue={this.state.location}
      					textInputOnChangeText={(text) => this.setState({location:text})}
      					textInputStyle={{ paddingTop: 0, paddingBottom: 0, marginVertical: metrics.inputLocationMarginVertical }}
      					hideChevron />
    			</List>

    			<View style={styles.listContainer}>
    				<View style={styles.listItem}>
	      				<View style={styles.leftContainer}>
	      					<Text style={{ fontSize: 18, color: '#43484d' }}>Start date</Text>
	      				</View>
	      				<View style={styles.rightContainer}>
		      				<DatePicker
		      						customStyles= {{
		      							dateInput: {
		      								borderColor: 'white',
		      								backgroundColor: 'white'
		      							},
		      						}}
		      						showIcon={false}
		        					style={styles.datePicker}
		        					date={this.state.dateDeb}
		        					mode="datetime"
		        					placeholder="Select start date"
		        					format="D/M/YYYY HH:mm"
		        					minDate="14/6/2018 00:00"
		        					maxDate="31/9/2018 23:59"
		        					is24Hour={true}
		        					confirmBtnText="Confirm"
		        					cancelBtnText="Cancel"
		        					onDateChange={(date) => {this.setState({dateDeb: date})}} />
        				</View>
        			</View>

        			<View style={styles.listItem}>
        				<View style={styles.leftContainer}>
	      					<Text style={{ fontSize: 18, color: '#43484d' }}>End date</Text>
	      				</View>
	      				<View style={styles.rightContainer}>
	      				<DatePicker
	      						customStyles= {{
		      							dateInput: {
		      								borderColor: 'white',
		      								backgroundColor: 'white',
		      							},
		      						}}
	      						showIcon={false}
	        					style={styles.datePicker}
	        					date={this.state.dateFin}
	        					mode="datetime"
	        					placeholder="Select end date"
	        					format="D/M/YYYY HH:mm"
	        					minDate="14/6/2018 00:00"
	        					maxDate="31/9/2018 23:59"
	        					is24Hour={true}
	        					confirmBtnText="Confirm"
	        					cancelBtnText="Cancel"
	        					onDateChange={(date) => {this.setState({dateFin: date})}} />
        				</View>
        			</View>
    			</View>
    			<List>
	    			<ListItem
	        				title="Canarin No."
	        				textInput={true}
	        				textInputKeyboardType = "numeric"
	        				textInputPlaceholder="Canarin number"
	      					textInputValue={this.state.idCanarin}
	      					textInputOnChangeText={(text) => this.setState({idCanarin:text})}
	      					textInputStyle={{ paddingTop: 0, paddingBottom: 0, marginVertical: metrics.inputLocationMarginVertical }}
	      					hideChevron />
      			</List>

      			<View style={styles.listContainer}>
    				<View style={styles.listItem}>
	      				<View style={styles.leftContainer}>
	      					<Text style={{ fontSize: 18, color: '#43484d' }}>Status</Text>
	      				</View>
	      				<View style={styles.rightContainer}>
		      				<RNPickerSelect
			                    placeholder={{
			                        label: 'Select a status...',
			                        value: "",
			                    }}
			                    items={this.state.items}
			                    onValueChange={(value) => {
			                        this.setState({
			                            statusCanarin: value,
			                        });
			                    }}
			                    style={{ ...pickerSelectStyles }}
			                    value={this.state.statusCanarin}
							/>
        				</View>
        			</View>
        		</View>


      			<View style={styles.listContainer}>
    				<View style={styles.listItem}>
	      				<View style={styles.leftContainer}>
	      					<Text style={{ fontSize: 18, color: '#43484d' }}>Start date</Text>
	      				</View>
	      				<View style={styles.rightContainer}>
		      				<DatePicker
		      						customStyles= {{
		      							dateInput: {
		      								borderColor: 'white',
		      								backgroundColor: 'white'
		      							},
		      						}}
		      						showIcon={false}
		        					style={styles.datePicker}
		        					date={this.state.dateDebStatus}
		        					mode="datetime"
		        					placeholder="Select start date"
		        					format="D/M/YYYY HH:mm"
		        					minDate="14/6/2018 00:00"
		        					maxDate="31/9/2018 23:59"
		        					is24Hour={true}
		        					confirmBtnText="Confirm"
		        					cancelBtnText="Cancel"
		        					onDateChange={(date) => {this.setState({dateDebStatus: date})}} />
        				</View>
        			</View>

        			<View style={styles.listItem}>
        				<View style={styles.leftContainer}>
	      					<Text style={{ fontSize: 18, color: '#43484d' }}>End date</Text>
	      				</View>
	      				<View style={styles.rightContainer}>
	      				<DatePicker
	      						customStyles= {{
		      							dateInput: {
		      								borderColor: 'white',
		      								backgroundColor: 'white',
		      							},
		      						}}
	      						showIcon={false}
	        					style={styles.datePicker}
	        					date={this.state.dateFinStatus}
	        					mode="datetime"
	        					placeholder="Select end date"
	        					format="D/M/YYYY HH:mm"
	        					minDate="14/6/2018 00:00"
	        					maxDate="31/9/2018 23:59"
	        					is24Hour={true}
	        					confirmBtnText="Confirm"
	        					cancelBtnText="Cancel"
	        					onDateChange={(date) => {this.setState({dateFinStatus: date})}} />
        				</View>
        			</View>
    			</View>
			</View>
		);
	}
}


/* 
#########################  STYLESHEET  ###################### 
*/
const styles = StyleSheet.create({

	container: {
		flex: 1,
		backgroundColor: '#FAFAFA',
	},

	datePicker: {
		width: metrics.inputWidthDetails,
	},

	listItem: {
		flexDirection:'row',
		paddingTop: metrics.listItemPaddingTop,
    	paddingRight: metrics.listItemPaddingRight,
    	paddingBottom: metrics.listItemPaddingBottom,
    	borderBottomColor: '#BBBBBB',
    	borderBottomWidth: metrics.listItemBorderBottomWidth,
    	backgroundColor: 'transparent',
	},

	listContainer: {
		marginTop: metrics.listContainerMarginTop,
    	borderTopWidth: metrics.listContainerBorderTopWidth,
    	borderColor: '#BBBBBB',
    	backgroundColor: 'white',
	},
	
	leftContainer: {
		marginLeft: metrics.leftContainerMarginLeft,
		justifyContent: "center",
	},

	rightContainer: {
		flex:1,
		alignItems: 'flex-end',

	},

	deleteContainer: {
		alignItems: 'center',
		justifyContent: 'center'
	}


});

//attributs modifiables (overwrite):
//android inputAndroid, viewContainer and placeholderCo
//ios viewContainer, icon, done, modalViewTop, modalViewMiddle, modalViewBottom, and placeholderColor
const pickerSelectStyles = StyleSheet.create({
    viewContainer: {
    	width: metrics.widthPicker,
    	height: metrics.heightPicker,
    	alignSelf: 'flex-end'
    }
});