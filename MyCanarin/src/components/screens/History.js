/*################ IMPORT ################*/

import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  AsyncStorage
} from 'react-native';
import { List, ListItem, Header } from 'react-native-elements';
import Icon from 'react-native-ionicons';
import { read, RNFS , PATH_FILE, tabToJSON, parseStringToDate } from '../utils/Utility';
import { metrics } from '../utils/Metrics';
import dateFormat from 'dateformat';
import moment from "moment";

/*################ CLASS HISTORY ################*/
/**
 * Cette contient tous les éléments nécessaires pour l'élaboration de l'historique
 * des déplacements de l'utilisateur.
 *
 */
export default class History extends React.Component {

	
	constructor(props) {
		super(props);
		this.state = {
			refreshing : false,
			lastUpdate : "",
			content : []
		};
	}

	componentDidMount() {
		this.getLastUpdate();
		this.getFileContent();
	}


	async getLastUpdate() {
		try {
    		var value = await AsyncStorage.getItem('lastRefresh');

    		if(value != null) {

    			this.setState({
    				lastUpdate: value
    			});

    		} else {

    			await AsyncStorage.setItem('lastRefresh', '');

    		}

    	} catch (error) {
    		console.log("Error");
    	}
	}

	async setLastUpdate() {
		try {
			var dateUpdate = "Last update : " + dateFormat(new Date(), "d/m/yyyy HH:MM");


    		await AsyncStorage.setItem('lastRefresh', dateUpdate);

    		this.setState({
    			lastUpdate: dateUpdate
    		})

    	} catch (error) {
    		console.log("Error");
    	}
	}

	/**
	 *
	 *
	 */
	onPressForDetails(item) {
		if(item.type === "record") {
			this.props.navigation.navigate('Details',item);
		} else if (item.type === "status") {
			this.props.navigation.navigate('DetailsStatus',item);	
		}
	}

	/**
	 *
	 *
	 */
	onRefresh() {
	   	this.setState({refreshing: true, content: []});
	   	this.setLastUpdate();

	   	let list = [];
	   	let whenDataLoaded = RNFS.readFile(PATH_FILE, 'utf8');
		whenDataLoaded.then((val)=>{
			let tab = val.split('\n');
			tabToJSON(tab, list);
			list = list.reverse();
			this.setState({refreshing: false, content : list});
		});
  	}

  	/**
	 *
	 *
	 */
	getFileContent() {
		let list = [];

		let whenDataLoaded = RNFS.readFile(PATH_FILE, 'utf8');
		whenDataLoaded.then((val)=>{
			let tab = val.split('\n');
			tabToJSON(tab, list);
			list = list.reverse();
			this.setState({content : list});
		});
	}

	chooseIconStatus(item) {
		if(item.type === "record") {
			return null
		} else if (item.type === "status") {
			if(item.statusCanarin === 'On') {
				return(<Icon name="power" color="green" size={23} />)
			} else if (item.statusCanarin === "Off") {
				return(<Icon name="power" color="red" size={23} />)
			} else if (item.statusCanarin === 'In charge') {
				return(<Icon name="battery-charging" color="orange" size={23} />)
			}
		}
	}

	chooseTitle(item) {
		if(item.type === "record") {
			return item.location
		} else if (item.type === "status") {
			return item.statusCanarin	
		}
	}

	/*chooseBadge(item) {
		if(item.type === "record") {
			return null
		} else if (item.type === "status") {
			return { value: "N°"+item.idCanarin, textStyle: { color: 'tomato' } }	
		}
	}*/

	chooseSubtitle(item) {
		if(item.type === "record") {
			return "from " + item.dateDeb + " to " + item.dateFin
		} else if (item.type === "status") {
			return this.getDiffDurationBetweenTwoDates(item.dateDeb,item.dateFin)
		}
	}

	chooseStyleTitle(item) {
		if(item.type === "record") {
			return null
		} else if (item.type === "status") {
			if(item.statusCanarin === "In charge") {
				return {marginLeft: metrics.titleMarginLeftInCharge}
			} else {
				return {marginLeft: metrics.titleMarginLeftOnOff}
			}
		}
	}

	chooseStyleSubtitle(item) {
		if(item.type === "record") {
			return null
		} else if (item.type === "status") {
			if(item.statusCanarin === "In charge") {
				return {marginLeft: metrics.subtitleMarginLeftInCharge}
			} else {
				return {marginLeft: metrics.subtitleMarginLeftOnOff}
			}
		}
	}

	/**
	 * source https://stackoverflow.com/questions/48884051/calculate-the-difference-between-two-dates-in-javascript-using-react
	 */
	getDiffDurationBetweenTwoDates(startDate, endDate) {

		if(endDate == "") {
			var d1 = parseStringToDate(startDate);
			var date = new Date();
			var stringDate = dateFormat(date, "dd/mm/yyyy HH:MM");
			var now = parseStringToDate(stringDate);
			var dateStart = moment(d1);
			var dateEnd = moment(now);
			var diff = dateEnd.diff(dateStart);
			var diffDuration = moment.duration(diff);

			var text = "";

			if(diffDuration.days() !== 0) {
				text += diffDuration.days() + " day(s) ";
			}

			if(diffDuration.hours() !== 0) {
				text += diffDuration.hours() + " hour(s) ";
			}

			if(diffDuration.minutes() !== 0) {
				text += diffDuration.minutes() + " minute(s)"
			}
			
			if (diffDuration.days() === 0 && diffDuration.hours() === 0 && diffDuration.minutes() === 0) {
				text += "few seconds"
			}

			return "Since " + text
		} else {

			var d1 = parseStringToDate(startDate);
			var d2 = parseStringToDate(endDate);
			var dateStart = moment(d1);
			var dateEnd = moment(d2);
			var diff = dateEnd.diff(dateStart);
			var diffDuration = moment.duration(diff);

			var text = "";

			if(diffDuration.days() !== 0) {
				text += diffDuration.days() + " day(s) ";
			}

			if(diffDuration.hours() !== 0) {
				text += diffDuration.hours() + " hour(s) ";
			}

			if(diffDuration.minutes() !== 0) {
				text += diffDuration.minutes() + " minute(s)"
			}
			
			if (diffDuration.days() === 0 && diffDuration.hours() === 0 && diffDuration.minutes() === 0) {
				text += "Few seconds"
			}

			return text
		}
	}

	/* 
	#########################  USER INTERFACE  ###################### 
	*/
	render() {
		return(
			<View style={styles.container}>
				<ScrollView 
					refreshControl={
          				<RefreshControl
            				refreshing={this.state.refreshing}
            				onRefresh={this.onRefresh.bind(this)}/>}>
            		<View style={styles.containerRefresh}>
            			<Text>Pull down to refresh...</Text>
            			<Text>{this.state.lastUpdate}</Text>
            		</View>

					<List>
					  {
					    this.state.content.map((item, i) => (
					      <ListItem
					        key={i}
					        leftIcon={this.chooseIconStatus(item)}
					        title={this.chooseTitle(item)}
					        titleStyle={this.chooseStyleTitle(item)}
					        subtitle={this.chooseSubtitle(item)}
					        subtitleStyle={this.chooseStyleSubtitle(item)}
					     
					        onPress={() => this.onPressForDetails(item)}
					      />
					    ))
					  }
					</List>
				</ScrollView>
			</View>
		);
	}
}


const styles = StyleSheet.create({
	container : {
		flex: 1,
		backgroundColor: '#FAFAFA',
	},
	containerRefresh: {
		backgroundColor: "#E0E0E0",
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection:'column',
		opacity: 0.5,
		marginLeft: metrics.messagePullContainerMarginLeftRight,
		marginRight: metrics.messagePullContainerMarginLeftRight,
		marginTop: metrics.messagePullContainerMarginTop,
		padding: metrics.messagePullContainerPadding,
	},
});