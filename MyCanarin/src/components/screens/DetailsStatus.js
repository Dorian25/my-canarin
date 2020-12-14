import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from 'react-native';
import { List, ListItem, Button as ButtonElement, Text as TextElement} from 'react-native-elements';
import { updateStatus, alertMessage, deleteStatus, parseStringToDate } from '../utils/Utility';
import DatePicker from 'react-native-datepicker';
import { metrics } from '../utils/Metrics';
import { Header, Left, Body, Right, Title, Button } from 'native-base';
import Icon from 'react-native-ionicons';
import dateFormat from 'dateformat';
import RNPickerSelect from 'react-native-picker-select';

export default class DetailsStatus extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			editable : false,
			//On doit pouvoir desactiver le champs "end date" pour les activites en cours
			disabledDateDeb : true,
			disabledDateFin : true,
			disabledPickerStatus : true,
			//texte des bouton de droite
			textEdit : "Edit",
			showCancel : false,
			editMode : false,
			idCanarin : this.props.navigation.state.params.idCanarin,
			statusCanarin : this.props.navigation.state.params.statusCanarin,
			dateDeb : this.props.navigation.state.params.dateDeb, 
			dateFin : this.props.navigation.state.params.dateFin,
			tempIdCanarin : this.props.navigation.state.params.idCanarin,
			tempStatusCanarin : this.props.navigation.state.params.statusCanarin,
			tempDateDeb : this.props.navigation.state.params.dateDeb, 
			tempDateFin : this.props.navigation.state.params.dateFin,

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

	/**
	 * Permet de savoir si une activite est en cours ou terminee en regardant la valeur de la date de fin.
	 */
	finishedOrInProgress() {
		if(this.state.dateFin === "") {
			return "In progess";
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
		if(this.state.dateFin === "" || this.props.navigation.state.params.dateFinActivity === "") {
			//si le mode d'edition est actif, il s'agit du bouton "save" 
			if(this.state.editMode) {
				this.validate();
			} else {
				//on affiche le bouton "save" pour le mode d'edition
				this.setState({
					textEdit: "Save",
					showCancel: true,
					editable: true,
					disabledPickerStatus : false,
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
					disabledPickerStatus : false,
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
		deleteStatus(id);
		this.props.navigation.navigate('History');
	}

	/**
	 * On demande l'autorisation a l'utilisateur de supprimer l'activite.
	 * On ne peut pas supprimer une activite courante.
	 * 
	 */ 
	delete() {
		if(this.state.dateFin === "") {
			alertMessage("Error","You can't delete a current status !");
		} else {
			Alert.alert(
				'Delete this status',
				'Are you sure to delete this status ?',
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
			this.state.tempIdCanarin === this.state.idCanarin &
			this.state.tempStatusCanarin === this.state.statusCanarin ) {
			alertMessage("Information","No changes were made");
		} else {
			if(this.state.tempDateFin === "" || this.props.navigation.state.params.dateFinActivity === "") {

				if(!this.state.idCanarin.includes('-') && !this.state.idCanarin.includes('.') && !this.state.idCanarin.includes(' ') && !this.state.idCanarin.includes(',')) {
					var id = this.props.navigation.state.params.id;

					var dataStatus = "status" + ";" + id + ";" + this.state.tempIdCanarin + ";" + this.state.tempStatusCanarin + ";" + this.state.dateDeb + ";" + this.state.dateFin;

					updateStatus(id, dataStatus);

					this.props.navigation.navigate('History');

				} else {
					alertMessage("Error","Invalid characters for the Canarin number !");
				}
			} else {
				var startDate = parseStringToDate(this.state.tempDateDeb);
				var endDate = parseStringToDate(this.state.tempDateFin);
				var date = new Date();

				var stringDate = dateFormat(date, "dd/mm/yyyy HH:MM");

				var now = parseStringToDate(stringDate);

				if(startDate < now && endDate < now) {

					if(startDate < endDate) {
	
						if(!this.state.idCanarin.includes('-') && !this.state.idCanarin.includes('.') && !this.state.idCanarin.includes(' ') && !this.state.idCanarin.includes(',')) {
							var startDateActivity = parseStringToDate(this.props.navigation.state.params.dateDebActivity);
							var endDateActivity = parseStringToDate(this.props.navigation.state.params.dateFinActivity);

							if(startDate >= startDateActivity && endDate <= endDateActivity) {

								var id = this.props.navigation.state.params.id;
								
								var dataStatus = "status" + ";" + id + ";" + this.state.tempIdCanarin + ";" + this.state.tempStatusCanarin + ";" + this.state.tempDateDeb + ";" + this.state.tempDateFin;
								
								 //on l'ajoute au fichier
								updateStatus(id, dataStatus);

								this.props.navigation.navigate('History');

							} else {
								alertMessage("Error","The start and end dates must be in the interval of the activity !")
							}

						} else {
							alertMessage("Error","Invalid characters for the Canarin number !");
						}

					} else {
						alertMessage("Error","The start date must be before the end date for the status !");
					}
				} else {
					alertMessage("Error","Impossible to add a future status !");
				}
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

	/* 
	#########################  USER INTERFACE  ###################### 
	*/
	render() {
		return(
			<View style={styles.container}>
				<Header style={{backgroundColor:'white'}}>
				    {this.specialLeftButton()}
				    <Body>
				       	<Title style={{color:"black"}}>Details Status</Title>
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
        				title="Canarin No."
	        			textInput={true}
	        			textInputKeyboardType="numeric"
        				textInputPlaceholder="Canarin number"
	      				textInputValue={this.state.tempIdCanarin}
	      				textInputEditable={this.state.editable}
	      				textInputOnChangeText={(text) => this.setState({tempIdCanarin:text})}
	      				textInputStyle={{ paddingTop: 0, paddingBottom: 0, marginVertical: metrics.inputLocationMarginVertical }}
	      				hideChevron
      				/>
    			</List>

    			<View style={styles.listContainer}>
    				<View style={styles.listItem}>
	      				<View style={styles.leftContainer}>
	      					<Text style={{ fontSize: 18, color: '#43484d' }}>Canarin status</Text>
	      				</View>
	      				<View style={styles.rightContainer}>
		      				<RNPickerSelect
		      					disabled= {this.state.disabledPickerStatus}
			                    placeholder={{
			                        label: 'Select a status...',
			                        value: "",
			                    }}
			                    items={this.state.items}
			                    onValueChange={(value) => {
			                        this.setState({
			                            tempStatusCanarin: value,
			                        });
			                    }}
			                    style={{ ...pickerSelectStyles }}
			                    value={this.state.tempStatusCanarin}
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

    			<List>
    				<ListItem
	        			title="Start date activity"
	      				rightTitle={this.props.navigation.state.params.dateDebActivity}
	      				hideChevron
	      			/>

	      			<ListItem
	        			title="End date activity"
	      				rightTitle={this.props.navigation.state.params.dateFinActivity === "" ? "In progress" : this.props.navigation.state.params.dateFinActivity}
	      				hideChevron
	      			/>
    			</List>

    			<ButtonElement
    				containerViewStyle={{margin:metrics.marginButtonDelete}}
    				rounded
				  	title='Delete this status'
				  	buttonStyle={{backgroundColor: "#cc0000"}}
				  	onPress={() => this.delete()} />
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