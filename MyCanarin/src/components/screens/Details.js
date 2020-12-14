import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from 'react-native';
import { List, ListItem, Button as ButtonElement, Text as TextElement} from 'react-native-elements';
import { updateRecord, alertMessage, deleteRecord, getTypeLocation, parseStringToDate } from '../utils/Utility';
import DatePicker from 'react-native-datepicker';
import { metrics } from '../utils/Metrics';
import { Header, Left, Body, Right, Title, Button } from 'native-base';
import Icon from 'react-native-ionicons';
import dateFormat from 'dateformat';

//liste contenant tous les lieux disponibles
const listLocation = ["beach","restaurant","2 wheels","office","car","bus","home","park","forest","factory","street","transport","metro","shop","outdoor","indoor"];

export default class Details extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			editable : false,
			//On doit pouvoir desactiver le champs "end date" pour les activites en cours
			disabledDateDeb : true,
			disabledDateFin : true,
			//texte des bouton de droite
			textEdit : "Edit",
			showCancel : false,
			editMode : false,
			location : this.props.navigation.state.params.location,
			dateDeb : this.props.navigation.state.params.dateDeb, 
			dateFin : this.props.navigation.state.params.dateFin,
			tempLocation : this.props.navigation.state.params.location,
			tempDateDeb : this.props.navigation.state.params.dateDeb, 
			tempDateFin : this.props.navigation.state.params.dateFin,
		};
	}

	/**
	 * Permet de savoir si une activite est en cours ou terminee en regardant la valeur de la date de fin.
	 */
	finishedOrInProgress() {
		if(this.state.dateFin === "") {
			return "In progress";
		} else {
			return "Finished";
		}
	}

	/**
	 * Permet de gerer le clique sur le bouton droit.
	 * Mode edition : il s'agit de "Save" = Cancel Save, on appelle la fonction validate()
	 * Mode normal : il s'agit de "Edit" = Edit, on change les boutons pour avoir "save" et "cancel"
	 */
	onClickRightButton() {
		//Si c'est une activite en cours, on active le mode d'edition que pour la date de depart
		if(this.state.dateFin === "") {
			//si le mode d'edition est actif, il s'agit du bouton "save" 
			if(this.state.editMode) {
				this.validate();
			} else {
				//on affiche le bouton "save" pour le mode d'edition
				this.setState({
					textEdit: "Save",
					showCancel: true,
					editable: true,
					disabledDateDeb: false,
					editMode: true,
				});
			}
		} else {
			//il s'agit d'une activite termine, on active le mode d'edition pour les 2 types de dates
			if(this.state.editMode) {
				this.validate();
			} else {
				this.setState({
					textEdit: "Save",
					showCancel: true,
					editable: true,
					disabledDateDeb: false,
					disabledDateFin: false,
					editMode: true,
				});
			}
		}
	}

	/**
	 * Permet de demarrer la suppression d'un record a partir de son id.
	 * Apres la suppression, on retourne a la page d'historique
	 */
	executeDelete(id) {
		deleteRecord(id);
		this.props.navigation.navigate('History');
	}

	/**
	 * On demande l'autorisation a l'utilisateur de supprimer l'activite.
	 * On ne peut pas supprimer une activite courante.
	 * 
	 */ 
	delete() {
		if(this.state.dateFin === "") {
			alertMessage("Error","You can't delete a current activity !");
		} else {
			Alert.alert(
				'Delete this activity',
				'Are you sure to delete this activity ?',
				[
					{text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
				    {text: 'Yes', onPress: () => this.executeDelete(this.props.navigation.state.params.id)},
				],
				{ cancelable: false }
			)
		}
	}

	/**
	 * Permet de verifier les champs pour savoir s'ils sont conformes et 
	 * ensuite proceder a la modification.
	 *
	 */
	validate() {

		if(this.state.tempDateFin === this.state.dateFin & 
			this.state.tempDateDeb === this.state.dateDeb & 
			this.state.tempLocation === this.state.location) {
			alertMessage("Information","No changes were made");
		} else {
			if(listLocation.includes(this.state.tempLocation.toLowerCase().trim())) {
				if(this.state.tempDateFin === "") {
					var startDate = parseStringToDate(this.state.tempDateDeb);
					var date = new Date();

					var stringDate = dateFormat(date, "dd/mm/yyyy HH:MM");

					var now = parseStringToDate(stringDate);

					if(startDate < now) {
						let data = this.props.navigation.state.params.id +
							 ";" + this.state.tempLocation.toLowerCase().trim() + 
							 ";" +  getTypeLocation(this.state.tempLocation.toLowerCase().trim()) + 
							 ";" + this.state.tempDateDeb + 
							 ";" + "\n";

							updateRecord(this.props.navigation.state.params.id, data);

							this.props.navigation.navigate('History');
					} else {
						alertMessage("Error","Impossible to add a future activity !");
					}
				} else {
					var startDate = parseStringToDate(this.state.tempDateDeb);
					var endDate = parseStringToDate(this.state.tempDateFin);
					var date = new Date();

					var stringDate = dateFormat(date, "dd/mm/yyyy HH:MM");

					var now = parseStringToDate(stringDate);

					if(startDate < now && endDate < now) {
						if(startDate < endDate) {
		
							let data = this.props.navigation.state.params.id +
							 ";" + this.state.tempLocation.toLowerCase().trim() + 
							 ";" +  getTypeLocation(this.state.tempLocation.toLowerCase().trim()) + 
							 ";" + this.state.tempDateDeb +
							 ";" + this.state.tempDateFin + "\n";

							updateRecord(this.props.navigation.state.params.id, data);

							this.props.navigation.navigate('History');

						} else {
							alertMessage("Error","The start date must be before the end date !");
						}
					} else {
						alertMessage("Error","Impossible to add a future activity !");
					}
				}
			} else {
				alertMessage("Error","Incorrect location");
			}
		}
	}

	/**
	 * On reinitialise toutes les valeurs des champs et on desactive le mode edition
	 */
	cancel() {

		if(this.state.tempDateFin === this.state.dateFin & 
			this.state.tempDateDeb === this.state.dateDeb & 
			this.state.tempLocation === this.state.location) {
			alertMessage("Information","No changes were made");
		}

		this.setState({
			editMode:false,
			textEdit: "Edit",
			showCancel: false,
			editable:false,
			disabledDateDeb : true,
			disabledDateFin : true, 
			tempLocation:this.state.location, 
			tempDateDeb:this.state.dateDeb, 
			tempDateFin:this.state.dateFin});
		
	}

	/**
	 * Permet de generer un bouton de retour selon la plateform
	 * iOS : < History
	 * android : <-
	 */
	specialLeftButton() {
		if(Platform.OS === "ios") {
			return(
				<Left>
					<Button transparent onPress={() => this.props.navigation.navigate('History')}>
						<Icon name='arrow-back' />
						<Text>History</Text>
					</Button>
			    </Left>
			);
		} else if(Platform.OS === "android") {
			return(
				<Left>
			        <Button transparent onPress={() => this.props.navigation.navigate('History')}>
			            <Icon name='arrow-back' />
			        </Button>
			    </Left>
			);
		}
	}

	addStatus() {
		if(this.finishedOrInProgress() === "In progress") {
			alertMessage('Error', "You can't add status to a current activity !")
		} else {
			var idRecord = this.props.navigation.state.params.id;
			this.props.navigation.navigate('AddStatus', {idRecord : idRecord, 
														dateDebActivity : this.state.dateDeb,
														dateFinActivity : this.state.dateFin});
		}
	}

	/* 
	#########################  USER INTERFACE  ###################### 
	*/
	render() {
		return(
			<View style={styles.container}>
				<Header style={{backgroundColor:'white'}}>
				    {this.specialLeftButton()}
				    <Body>
				       	<Title style={{color:"black"}}>Details</Title>
				    </Body>
				    <Right>
				    	{
				    		this.state.showCancel ? 
				    		<Button hasText transparent onPress={() => this.cancel()}>
				           		<Text style={{ color: 'tomato' }}>Cancel</Text>
				        	</Button> : null 
				        }
				        <Button hasText transparent onPress={() => this.onClickRightButton()}>
				           	<Text style={{ color: 'tomato', fontWeight: 'bold' }}>{this.state.textEdit}</Text>
				        </Button>
				    </Right>
				</Header>
		
	    		
	    		<List>
	      			<ListItem
	        			title="Status"
	      				rightTitle={this.finishedOrInProgress()}
	      				hideChevron
	      			/>
	      			<ListItem
	        			title="Location"
	        			textInput={true}
	        			textInputPlaceholder="Location"
	      				textInputValue={this.state.tempLocation}
	      				textInputEditable={this.state.editable}
	      				textInputOnChangeText={(text) => this.setState({tempLocation:text})}
	      				textInputStyle={{ paddingTop: 0, paddingBottom: 0, marginVertical: metrics.inputLocationMarginVertical }}
	      				hideChevron
	      			/>
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
	      							disabled: {
	      								backgroundColor: 'white',
										opacity: 0.5,
									},
	      						}}
	      						showIcon={false}
	        					style={styles.datePicker}
	        					date={this.state.tempDateDeb}
	        					mode="datetime"
	        					disabled={this.state.disabledDateDeb}
	        					placeholder="Select start date"
	        					format="D/M/YYYY HH:mm"
	        					minDate="14/6/2018 00:00"
	        					maxDate="31/9/2018 23:59"
	        					is24Hour={true}
	        					confirmBtnText="Confirm"
	        					cancelBtnText="Cancel"
	        					onDateChange={(date) => {this.setState({tempDateDeb: date})}} />
    					</View>
    				</View>

	    			<View style={styles.listItem}>
	    				<View style={styles.leftContainer}>
	      					<Text style={{fontSize: 18, color: '#43484d'}}>End date</Text>
	      				</View>
	      				<View style={styles.rightContainer}>
			  				<DatePicker
			  						customStyles= {{
			      							dateInput: {
			      								borderColor: 'white',
			      								backgroundColor: 'white',
			      							},

			      							disabled: {
												opacity: 0.5,
												backgroundColor: 'white'
											},
			      						}}
			  						showIcon={false}
			    					style={styles.datePicker}
			    					date={this.state.tempDateFin}
			    					mode="datetime"
			    					disabled={this.state.disabledDateFin}
			    					placeholder="Select end date"
			    					format="D/M/YYYY HH:mm"
			    					minDate="14/6/2018 00:00"
			    					maxDate="31/9/2018 23:59"
			    					is24Hour={true}
			    					confirmBtnText="Confirm"
			    					cancelBtnText="Cancel"
			    					onDateChange={(date) => {this.setState({tempDateFin: date})}} />
	    				</View>
	    			</View>
				</View>

				<ButtonElement
					containerViewStyle={{margin: metrics.marginButtonDelete}}
					rounded
				  	title='Delete this activity'
				  	buttonStyle={{backgroundColor: "#cc0000"}}
				  	onPress={() => this.delete()} />	

				<ButtonElement
					rounded
				  	title='Add a status'
				  	buttonStyle={{backgroundColor: "#7F7FFF"}}
				  	onPress={() => this.addStatus()} />	
			</View>
		);
	}
}


/* 
#########################  STYLESHEET  ###################### 
*/
const styles = StyleSheet.create({
	button: {
		marginTop:50
	},

	container: {
		flex: 1,
		backgroundColor: '#FAFAFA',
	},

	datePicker: {
		width: metrics.inputWidthDetails,
	},

	listItem: {
		flexDirection: "row",
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
		justifyContent: 'center'
	},
	rightContainer: {
		flex:1,
		alignItems: 'flex-end',
	},
});