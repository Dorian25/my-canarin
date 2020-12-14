import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { TensorFlow } from 'react-native-tensorflow';
import Icon from 'react-native-ionicons';

/* les max et min des differentes features dans les csv */
const pm25_max = 540.0
const pm25_min = 0.0
const pm10_max = 598.0
const pm10_min = 0.0
const pm1_max = 275.0
const pm1_min = 0.0
const hour_max = 23.0
const hour_min = 0.0


export default class Simulator extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			//indoor '#C3E8A9' // outdoor '#7F7FFF' // transport '#FFB3BA'
			bgColorPred : "#FAFAFA",
			pm25 : "",
			pm10 : "",
			pm1 : "",
			hour : "",
			first_location : "",
			second_location : "",
			third_location : "",
			first_pourcentage : "",
			second_pourcentage  : "",
			third_pourcentage  : "",

		};
	}


	normalize(value, typeValue) {
		
		if(typeValue === "PM25") {

			return (value - pm25_min) / (pm25_max - pm25_min);

		} else if (typeValue === "PM10") {
	
			return (value - pm10_min) / (pm10_max - pm10_min);

		} else if (typeValue === "PM1") {

			return (value - pm1_min) / (pm1_max - pm1_min);

		} else if (typeValue === "Hour") {
		
			return (value - hour_min) / (hour_max - hour_min);
		}
		
	}

	showOutputResult(output) {
		var indoor = output[0] * 100;
		var outdoor = output[1] * 100;
		var transport = output[2] * 100;
		//alert("indoor"+indoor+"/outdoor"+outdoor+"/trans"+transport)

		var max = Math.max(indoor,outdoor,transport);

		if(max === indoor) {
			if(parseInt(outdoor) < parseInt(transport)) {
				this.setState({
					bgColorPred : "#C3E8A9", 
					first_pourcentage :  parseInt(indoor) + "%",
					second_pourcentage : parseInt(transport) + "%",
					third_pourcentage : parseInt(outdoor) + "%",
					first_location : "Indoor",
					second_location : "Transport",
					third_location : "Outdoor",
				}); 

			} else {
				this.setState({
					bgColorPred : "#C3E8A9", 
					first_pourcentage :  parseInt(indoor) + "%",
					second_pourcentage : parseInt(outdoor) + "%",
					third_pourcentage : parseInt(transport) + "%",
					first_location : "Indoor",
					second_location : "Outdoor",
					third_location : "Transport",
				}); 
			}
		} else if (max === outdoor) {
			if(parseInt(indoor) < parseInt(transport)) {
				this.setState({
					bgColorPred : "#7F7FFF", 
					first_pourcentage :  parseInt(outdoor) + "%",
					second_pourcentage : parseInt(transport) + "%",
					third_pourcentage : parseInt(indoor) + "%",
					first_location : "Outdoor",
					second_location : "Transport",
					third_location : "Indoor",
				}); 

			} else {
				this.setState({
					bgColorPred : "#7F7FFF", 
					first_pourcentage :  parseInt(outdoor) + "%",
					second_pourcentage : parseInt(indoor) + "%",
					third_pourcentage : parseInt(transport) + "%",
					first_location : "Outdoor",
					second_location : "Indoor",
					third_location : "Transport",
				}); 
			}
		} else if (max === transport) {
			if(parseInt(outdoor) < parseInt(indoor)) {
				this.setState({
					bgColorPred : "#FFB3BA", 
					first_pourcentage :  parseInt(transport) + "%",
					second_pourcentage : parseInt(indoor) + "%",
					third_pourcentage : parseInt(outdoor) + "%",
					first_location : "Transport",
					second_location : "Indoor",
					third_location : "Outdoor",
				}); 

			} else {
				this.setState({
					bgColorPred : "#FFB3BA", 
					first_pourcentage :  parseInt(transport) + "%",
					second_pourcentage : parseInt(outdoor) + "%",
					third_pourcentage : parseInt(indoor) + "%",
					first_location : "Transport",
					second_location : "Outdoor",
					third_location : "Indoor",
				}); 
			}
		}


	}


	async getPrediction(pm25,pm10,pm1,hour) {

		const tf = new TensorFlow('frozen_tf_mycanarin.pb')

		await tf.feed({name: "I", data: [pm25,pm10,pm1,hour], shape:[1,4], dtype: "FLOAT"});
		await tf.run(['O']);
		const output = await tf.fetch('O'); 

		this.showOutputResult(output);
		
	}




	/* 
	#########################  USER INTERFACE  ###################### 
	*/
	render() {
		return(
			<View style={{ flex : 1, backgroundColor : this.state.bgColorPred, alignItems : "center", justifyContent : "center" }}>

				<View style={styles.podium}>

					<View style={styles.second}>
						<Text style={styles.textPodium}>{this.state.second_location}</Text>
						<Text style={styles.textPourcentage}>{this.state.second_pourcentage}</Text>
					</View>
					<View style={styles.first}>
						<Text style={styles.textPodium}>{this.state.first_location}</Text>
						<Text style={styles.textPourcentage}>{this.state.first_pourcentage}</Text>
					</View>
					<View style={styles.third}>
						<Text style={styles.textPodium}>{this.state.third_location}</Text>
						<Text style={styles.textPourcentage}>{this.state.third_pourcentage}</Text>
					</View>

				</View>
				
				<TextInput
			        style={{height: 40, borderColor: 'black', borderWidth: 0.5, borderRadius : 15, width : 150}}
			        onChangeText={(text) => this.setState({pm25 : text})}
			        value={this.state.pm25}
			        placeholder='Put a PM25 value'
			        underlineColorAndroid="transparent"
			        keyboardType="numeric"
			    />

			    <TextInput
			        style={{height: 40, borderColor: 'black', borderWidth: 0.5, borderRadius : 15, width : 150, marginTop : 20}}
			        onChangeText={(text) => this.setState({pm10 : text})}
			        value={this.state.pm10}
			        placeholder='Put a PM10 value'
			        underlineColorAndroid="transparent"
			        keyboardType="numeric"
			    />

			    <TextInput
			        style={{height: 40, borderColor: 'black', borderWidth: 0.5, borderRadius : 15, width : 150, marginTop : 20}}
			        onChangeText={(text) => this.setState({pm1 : text})}
			        value={this.state.pm1}
			        placeholder='Put a PM1 value'
			        underlineColorAndroid="transparent"
			        keyboardType="numeric"
			    />

			    <TextInput
			        style={{height: 40, borderColor: 'black', borderWidth: 0.5, borderRadius : 15, width : 150, marginTop : 20}}
			        onChangeText={(text) => this.setState({hour : text})}
			        value={this.state.hour}
			        placeholder='Put a Hour value'
			        underlineColorAndroid="transparent"
			        keyboardType="numeric"
			    />

			    <TouchableOpacity style = {styles.buttonRun} onPress = {() => this.getPrediction(this.normalize(parseFloat(this.state.pm25),"PM25"),this.normalize(parseFloat(this.state.pm10),"PM10"),this.normalize(parseFloat(this.state.pm1),"PM1"),this.normalize(parseFloat(this.state.hour),"Hour"))}>
			    	<Text>Run</Text>
			    </TouchableOpacity>

			</View>
		);
	}
}

const styles = StyleSheet.create({

	buttonRun : {
		height : 40,
		width : 150,
		borderRadius : 15,
		backgroundColor : 'white',
		marginTop : 20,
		alignItems : 'center',
		justifyContent : 'center',
		borderWidth : 2,
		borderColor: "black"
	},

	podium : {
		flexDirection : "row",
		height : 100,
		justifyContent : "flex-end",
		margin : 20
	},

	first : {
		flexDirection : "column",
		alignItems : "center",
		justifyContent : "center",
		height: 100,
		alignSelf : "flex-end",
		padding : 20,
		borderTopRightRadius : 7,
		borderTopLeftRadius : 7,
		backgroundColor : "#3F3F3F"
	}, 

	second : {
		flexDirection : "column",
		alignItems : "center",
		justifyContent : "center",
		height : 75,
		alignSelf : "flex-end",
		padding : 20, 
		borderTopLeftRadius : 7,
		backgroundColor : "#515151",
	},

	third : {
		flexDirection : "column",
		alignItems : "center",
		justifyContent : "center",
		height : 50,
		backgroundColor : "#666666",
		alignSelf : "flex-end",
		padding : 20,
		borderTopRightRadius : 7,
	},
	textPodium : {
		color : "white"
	},
	textPourcentage : {
		color : "white",
		fontWeight: 'bold',
		fontSize : 20
	}
});

