import React from 'react';
import { Text, Button } from 'react-native';
import { TabNavigator, TabBarBottom, StackNavigator } from 'react-navigation';
import Icon from 'react-native-ionicons';

import Location from './screens/Location';
import Geolocation from './screens/Geolocation';
import Simulator from './screens/Simulator';
import History from './screens/History';
import Details from './screens/Details';
import DetailsStatus from './screens/DetailsStatus';
import AddActivity from './screens/AddActivity';
import AddStatus from './screens/AddStatus';


/**
 *
 *
 */
export const HistoryStack = StackNavigator ({
	History: {
		screen: History,
		navigationOptions: ({ navigation }) => ({
			title: 'History',
			headerRight: <Icon ios="ios-add" 
							   android="md-add" 
							   style={{marginRight: 15}} 
							   color={'#3F3F3F'}
							   onPress={() => navigation.navigate('AddActivity')} />
		}),
	},
	Details: {
		screen: Details,
		navigationOptions: {
			title: 'Details',
			header: null
		},
	},
	DetailsStatus: {
		screen: DetailsStatus,
		navigationOptions: {
			title: 'DetailsStatus',
			header: null
		},
	}		
 });


/**
 *
 *
 */
export const Tabs = TabNavigator({
	Location: {
		screen: Location,
	    navigationOptions: {
	      tabBarLabel: 'Where am I ?',
	      tabBarIcon: ({ tintColor }) => <Icon ios="ios-map" android="md-map" size={35} color={tintColor} />
		},
	},
	History: {
		screen: HistoryStack,
	    navigationOptions: {
	      tabBarLabel: 'History',
	      tabBarIcon: ({ tintColor }) => <Icon ios="ios-list" android="md-list" size={35} color={tintColor} />,
		},
	},
	Geolocation: {
		screen: Geolocation,
	    navigationOptions: {
	      tabBarLabel: 'Geolocation',
	      tabBarIcon: ({ tintColor }) => <Icon ios="ios-pin" android="md-pin" size={35} color={tintColor} />,
		},
	},
	Simulator: {
		screen: Simulator,
	    navigationOptions: {
	      tabBarLabel: 'Simulator',
	      tabBarIcon: ({ tintColor }) => <Icon ios="ios-speedometer" android="md-speedometer" size={35} color={tintColor} />,
		},
	},
},

{ 
	tabBarOptions : {
		style: {
		    backgroundColor: 'white',
		},
		activeTintColor: 'tomato',
      	inactiveTintColor: '#3F3F3F',
	},
	tabBarComponent: TabBarBottom,
	tabBarPosition: 'bottom',
	swipeEnabled: false
});

export const AddActivityStack = StackNavigator({
	AddActivity: {
		screen: AddActivity,
		navigationOptions: {
			title: 'New activity',
		},
  	},
}, {headerMode: 'none'});

export const AddStatusStack = StackNavigator({
	AddStatus: {
		screen: AddStatus,
		navigationOptions: {
			title: 'New status',
		},
  	},
}, {headerMode: 'none'});


export const Root = StackNavigator({
  	Tabs: {
    	screen: Tabs,
  	},
  	AddActivity: {
    	screen: AddActivityStack,
  	},
  	AddStatus: {
    	screen: AddStatusStack,
  	},
}, {
	headerMode: 'none',
  	mode: 'modal',
});

